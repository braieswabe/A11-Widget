# Accessibility Support Statement (Widget v1)

This site uses an **accessibility support widget** that provides user-controlled enhancements aligned with **WCAG 2.1 Level AA** *for supported surfaces only*.

## What this widget covers (in scope)
We provide accessibility enhancements for:
- The widget interface itself
- Any content surfaces explicitly rendered/controlled by our systems (if present)
- User preference transforms (contrast, text size, text spacing, readable font)
- Keyboard and screen reader support for the widget
- Global keyboard shortcut (Alt+A by default) to quickly open/close the widget
- Reduced motion preference for supported surfaces
- Preference persistence per domain (localStorage with cookie fallback)
- **Text-to-Speech**: Read website text aloud (including selected text or full page) with customizable voice settings
- **Translation**: Translate page content into 100+ languages
- **Reading Aids**: Reading ruler, screen mask, text-only mode, adjustable margins
- **Focus Tools**: Customizable cursor size, page magnifier
- **Dictionary**: Word definitions on double-click

## What this widget does not cover (out of scope)
This widget does **not**:
- Fix or modify third‑party site HTML outside supported surfaces
- Remediate third‑party embeds (maps, iframes, booking engines, etc.)
- Make PDFs or downloads accessible
- Guarantee ADA compliance for the entire host website
- Provide lawsuit protection or legal assurance

## WCAG alignment (supported criteria)
For supported surfaces (widget UI + declared surfaces), we aim to meet WCAG 2.1 AA requirements where applicable, including:
- Contrast and color support (1.4.3)
- Resize text (1.4.4)
- Reflow at small widths (1.4.10)
- Text spacing (1.4.12)
- Keyboard operation (2.1.1)
- Bypass blocks / skip link where applicable (2.4.1)
- Visible focus (2.4.7)
- Consistent navigation & labels (3.2.3, 3.3.2)
- Name/role/value for controls (4.1.2)

## Report an accessibility issue
If you encounter a problem using the widget or supported content surfaces, please report it via:

**GitHub Issues**: [https://github.com/braieswabe/A11-Widget/issues](https://github.com/braieswabe/A11-Widget/issues)

Please include:
- The page URL where the issue occurred
- Your device/browser information
- The settings you selected in the widget
- What you expected to happen vs what actually happened
- Any error messages from the browser console (if applicable)
