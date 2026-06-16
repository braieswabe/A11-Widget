import crypto from 'crypto';
import { getDb } from './utils/db.js';
import { validateWidgetAccess } from './utils/license.js';

function hashText(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

function getProvider() {
  if (process.env.TRANSLATION_PROVIDER) return process.env.TRANSLATION_PROVIDER.toLowerCase();
  if (process.env.LIBRETRANSLATE_URL) return 'libretranslate';
  if (process.env.GOOGLE_TRANSLATE_API_KEY) return 'google';
  if (process.env.DEEPL_API_KEY) return 'deepl';
  return null;
}

async function translateWithLibreTranslate(texts, sourceLang, targetLang) {
  const baseUrl = (process.env.LIBRETRANSLATE_URL || '').replace(/\/$/, '');
  if (!baseUrl) throw new Error('LIBRETRANSLATE_URL is not configured');

  const response = await fetch(`${baseUrl}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      source: sourceLang,
      target: targetLang,
      format: 'text',
      api_key: process.env.LIBRETRANSLATE_API_KEY || undefined
    })
  });

  if (!response.ok) throw new Error(`LibreTranslate returned ${response.status}`);
  const data = await response.json();
  if (Array.isArray(data.translatedText)) return data.translatedText;
  if (typeof data.translatedText === 'string') return [data.translatedText];
  throw new Error('LibreTranslate response did not include translatedText');
}

async function translateWithGoogle(texts, sourceLang, targetLang) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured');

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      source: sourceLang === 'auto' ? undefined : sourceLang,
      target: targetLang,
      format: 'text'
    })
  });

  if (!response.ok) throw new Error(`Google Translate returned ${response.status}`);
  const data = await response.json();
  return (data.data?.translations || []).map((item) => item.translatedText);
}

async function translateWithDeepL(texts, sourceLang, targetLang) {
  const key = process.env.DEEPL_API_KEY;
  if (!key) throw new Error('DEEPL_API_KEY is not configured');
  const endpoint = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
  const params = new URLSearchParams();
  texts.forEach((text) => params.append('text', text));
  if (sourceLang && sourceLang !== 'auto') params.set('source_lang', sourceLang.toUpperCase());
  params.set('target_lang', targetLang.toUpperCase());

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) throw new Error(`DeepL returned ${response.status}`);
  const data = await response.json();
  return (data.translations || []).map((item) => item.text);
}

async function translateTexts(texts, sourceLang, targetLang, provider) {
  if (provider === 'libretranslate') return translateWithLibreTranslate(texts, sourceLang, targetLang);
  if (provider === 'google') return translateWithGoogle(texts, sourceLang, targetLang);
  if (provider === 'deepl') return translateWithDeepL(texts, sourceLang, targetLang);
  throw new Error('No translation provider configured');
}

async function getCachedTranslations(sql, texts, sourceLang, targetLang, provider) {
  if (!sql) return new Map();
  const hashes = texts.map(hashText);
  const rows = await sql`
    SELECT source_hash, translated_text
    FROM translation_cache
    WHERE source_hash = ANY(${hashes})
      AND source_lang = ${sourceLang}
      AND target_lang = ${targetLang}
      AND provider = ${provider}
  `;
  return new Map(rows.map((row) => [row.source_hash, row.translated_text]));
}

async function cacheTranslation(sql, text, translated, sourceLang, targetLang, provider) {
  if (!sql || !translated) return;
  await sql`
    INSERT INTO translation_cache (source_hash, source_lang, target_lang, provider, source_text, translated_text)
    VALUES (${hashText(text)}, ${sourceLang}, ${targetLang}, ${provider}, ${text}, ${translated})
    ON CONFLICT (source_hash, source_lang, target_lang, provider)
    DO UPDATE SET translated_text = EXCLUDED.translated_text, updated_at = NOW()
  `;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    siteId,
    text,
    texts,
    sourceLang = 'en',
    targetLang,
    licenseKey,
    apiKey
  } = req.body || {};

  const inputTexts = Array.isArray(texts) ? texts : (text ? [text] : []);
  const cleanedTexts = inputTexts
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((item) => item.slice(0, 5000));

  if (!targetLang || targetLang === sourceLang) {
    return res.status(400).json({ error: 'targetLang must be different from sourceLang' });
  }
  if (cleanedTexts.length === 0) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const access = await validateWidgetAccess(req, { siteId, licenseKey, apiKey });
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    const provider = getProvider();
    if (!provider) {
      return res.status(503).json({ error: 'Translation provider is not configured' });
    }

    const sql = process.env.NEON_DATABASE_URL ? getDb() : null;
    const cached = await getCachedTranslations(sql, cleanedTexts, sourceLang, targetLang, provider);
    const output = new Array(cleanedTexts.length);
    const missing = [];
    const missingIndexes = [];

    cleanedTexts.forEach((item, index) => {
      const cachedValue = cached.get(hashText(item));
      if (cachedValue) {
        output[index] = cachedValue;
      } else {
        missing.push(item);
        missingIndexes.push(index);
      }
    });

    if (missing.length > 0) {
      const translatedMissing = await translateTexts(missing, sourceLang, targetLang, provider);
      for (let i = 0; i < missing.length; i++) {
        const translated = translatedMissing[i] || missing[i];
        output[missingIndexes[i]] = translated;
        await cacheTranslation(sql, missing[i], translated, sourceLang, targetLang, provider);
      }
    }

    return res.status(200).json({
      success: true,
      provider,
      translations: output,
      translatedText: output[0] || null
    });
  } catch (error) {
    console.error('Translation endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Translation failed' });
  }
}
