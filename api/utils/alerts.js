const RESEND_API_URL = 'https://api.resend.com/emails';

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, '');
}

export async function sendAdminAlert({ subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO || process.env.ADMIN_ALERT_EMAIL;
  const from = process.env.ALERT_EMAIL_FROM || 'Accessibility Widget <alerts@updates.careerdriver.com>';

  if (!apiKey || !to || typeof fetch === 'undefined') {
    return { sent: false, reason: 'Email alerts not configured' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: to.split(',').map((item) => item.trim()).filter(Boolean),
        subject,
        html,
        text: text || stripHtml(html)
      })
    });

    if (!response.ok) {
      return { sent: false, reason: `Email provider returned ${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error('Admin alert email error:', error);
    return { sent: false, reason: error.message };
  }
}
