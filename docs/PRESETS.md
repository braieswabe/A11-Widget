# Accessibility Presets — Best Practices & Standards

This document explains the accessibility presets implemented in the widget, based on WCAG 2.1 guidelines and accessibility research.

## Preset Overview

The widget provides 5 quick presets based on established accessibility standards:

1. **Low Vision** — For users with visual impairments
2. **Dyslexia-Friendly** — For users with dyslexia
3. **Reduced Motion** — For users sensitive to motion
4. **High Contrast** — Enhanced contrast for better visibility
5. **Large Text** — Larger text size for easier reading

## Preset Configurations

### 1. Low Vision Preset

**Settings Applied:**
- Contrast: `high` (WCAG SC 1.4.3 - Contrast Minimum)
- Font Scale: `1.5` (150% - WCAG recommended for low vision)
- Spacing: `comfortable` (Increased line height, letter spacing, word spacing)
- Readable Font: `true` (Sans-serif for clarity)
- Reduce Motion: `true` (Reduces distractions)

**Research Basis:**
- WCAG 2.1 SC 1.4.3 recommends contrast ratio of at least 4.5:1 for normal text
- WCAG 2.1 SC 1.4.4 (Resize Text) recommends text can be resized up to 200% without loss of functionality
- 150% text size is commonly recommended for low vision users
- Increased spacing helps with letter and word recognition
- Sans-serif fonts are easier to read for users with visual impairments

**WCAG Compliance:**
- ✅ 1.4.3 Contrast (Minimum) — AA
- ✅ 1.4.4 Resize Text — AA
- ✅ 1.4.12 Text Spacing — AA

### 2. Dyslexia-Friendly Preset

**Settings Applied:**
- Readable Font: `true` (Sans-serif, system-friendly)
- Spacing: `max` (Maximum line height, letter spacing, word spacing)
- Font Scale: `1.2` (120% - Slightly larger helps without being overwhelming)
- Reduce Motion: `true` (Reduces visual distractions)
- Contrast: `default` (High contrast can worsen dyslexia symptoms)

**Research Basis:**
- Dyslexia research shows increased letter spacing (0.05em+) improves reading speed
- Increased line height (2.0) helps prevent line jumping
- Word spacing (0.12em) helps with word recognition
- Sans-serif fonts are easier for dyslexic readers than serif fonts
- Slightly larger text (120%) helps without causing eye strain
- **Important**: High contrast can actually worsen dyslexia symptoms, so default contrast is used

**WCAG Compliance:**
- ✅ 1.4.12 Text Spacing — AA
- ✅ 1.4.4 Resize Text — AA

### 3. Reduced Motion Preset

**Settings Applied:**
- Reduce Motion: `true` (Disables animations and transitions)
- Spacing: `comfortable` (Maintains reading flow)

**Research Basis:**
- WCAG 2.1 SC 2.3.3 (Animation from Interactions) — Level AAA
- Respects `prefers-reduced-motion` media query intent
- Helps users with vestibular disorders, motion sickness, and attention disorders
- Comfortable spacing maintains reading flow while reducing motion

**WCAG Compliance:**
- ✅ 2.3.3 Animation from Interactions — AAA

### 4. High Contrast Preset

**Settings Applied:**
- Contrast: `high` (Enhanced contrast filter)

**Research Basis:**
- WCAG 2.1 SC 1.4.3 (Contrast Minimum) — Level AA
- Increases contrast ratio for better visibility
- Helps users with low vision, color blindness, and in bright lighting conditions
- Applies contrast filter to both widget and declared surfaces

**WCAG Compliance:**
- ✅ 1.4.3 Contrast (Minimum) — AA

### 5. Large Text Preset

**Settings Applied:**
- Font Scale: `1.5` (150% text size)
- Spacing: `comfortable` (Increased spacing for readability)
- Readable Font: `true` (Sans-serif for clarity)

**Research Basis:**
- WCAG 2.1 SC 1.4.4 (Resize Text) — Level AA
- 150% is the recommended minimum for low vision users
- Comfortable spacing prevents text from feeling cramped at larger sizes
- Sans-serif fonts scale better and remain readable at larger sizes

**WCAG Compliance:**
- ✅ 1.4.4 Resize Text — AA
- ✅ 1.4.12 Text Spacing — AA

## Spacing Values

### Normal Spacing
- Line Height: `1.4`
- Letter Spacing: `0`
- Word Spacing: `0`
- Paragraph Spacing: `0.75em`

### Comfortable Spacing
- Line Height: `1.7` (WCAG 1.4.12 recommends at least 1.5)
- Letter Spacing: `0.02em`
- Word Spacing: `0.06em`
- Paragraph Spacing: `1em`

### Max Spacing
- Line Height: `2.0` (WCAG 1.4.12 maximum recommendation)
- Letter Spacing: `0.05em` (Dyslexia research recommendation)
- Word Spacing: `0.12em` (Dyslexia research recommendation)
- Paragraph Spacing: `1.25em`

## Font Scaling

- Minimum: `100%` (1.0) — Normal size
- Maximum: `160%` (1.6) — WCAG 2.1 SC 1.4.4 allows up to 200%
- Low Vision Recommended: `150%` (1.5)
- Dyslexia-Friendly Recommended: `120%` (1.2)

## Best Practices Followed

1. **WCAG 2.1 Compliance** — All presets align with WCAG 2.1 Level AA standards
2. **Research-Based** — Settings based on accessibility research and user studies
3. **User-Centered** — Presets address real user needs (low vision, dyslexia, motion sensitivity)
4. **Non-Conflicting** — Presets don't combine settings that conflict (e.g., high contrast + dyslexia)
5. **Comprehensive** — Each preset applies multiple related settings for maximum effectiveness
6. **Accessible Labels** — All preset buttons have descriptive ARIA labels

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Dyslexia-Friendly Font Research](https://www.dyslexia.com/resources/dyslexia-friendly-fonts/)
- [WebAIM Contrast Guidelines](https://webaim.org/resources/contrastchecker/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Testing Presets

When testing presets, verify:

1. **Low Vision**: High contrast visible, text is 150% larger, spacing is comfortable
2. **Dyslexia-Friendly**: Font is sans-serif, spacing is maximum, text is 120% larger, motion reduced
3. **Reduced Motion**: All animations/transitions disabled, spacing comfortable
4. **High Contrast**: Contrast filter applied, colors more distinct
5. **Large Text**: Text is 150% larger, spacing comfortable, font is sans-serif

All presets should:
- Apply settings immediately
- Persist across page reloads
- Update UI controls to reflect applied settings
- Work on all declared surfaces

