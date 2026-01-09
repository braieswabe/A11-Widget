# WCAG 2.1 AA Coverage Matrix — Accessibility Widget v1

**Scope**: Widget UI + declared content surfaces only (via `data-a11y-surface="true"`)

**Last Updated**: 2024

---

## Coverage Summary

This widget provides **WCAG 2.1 Level AA-aligned enhancements** for:
- The widget interface itself (`#a11y-widget-root`)
- Any content surfaces explicitly marked with `data-a11y-surface="true"`

**Important**: This widget does **not** claim full-site ADA compliance. It provides accessibility enhancements for controlled surfaces only.

---

## Perceivable

### 1.4.3 Contrast (Minimum) — Level AA ✅

**Status**: ✅ Covered

**Implementation**:
- Widget UI maintains WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for UI components)
- Provides high contrast mode (`contrast: "high"`) that applies `filter: contrast(1.25)` to surfaces
- Dark theme mode (`contrast: "dark"`) ensures proper contrast ratios (4.5:1+) for all text elements
- Light theme mode (`contrast: "light"`) provides high-contrast light backgrounds

**Test**: Verify widget UI contrast meets 4.5:1 for text, 3:1 for UI components. Verify high contrast mode visibly increases contrast.

**Files**: `a11y-widget.css` (lines 110-335), `a11y-widget.js` (lines 292-313)

---

### 1.4.4 Resize Text — Level AA ✅

**Status**: ✅ Covered

**Implementation**:
- Text scaling control: Range slider from 100% (1.0) to 160% (1.6) in 10% increments
- Applied via CSS variable `--a11y-font-scale` to `[data-a11y-surface="true"]` elements
- Text scaling does not break layout — only affects font-size, not container dimensions
- Widget UI itself scales appropriately

**Test**: Set text size to 160%, verify no horizontal scroll at 320px width, verify text remains readable and layout intact.

**Files**: `a11y-widget.css` (lines 34, 46-47), `a11y-widget.js` (lines 318-360)

---

### 1.4.10 Reflow — Level AA ✅

**Status**: ✅ Covered

**Implementation**:
- Widget panel is responsive and adapts to viewport width
- Media query at `@media (max-width: 320px)` ensures no horizontal scroll
- Panel width: `calc(100vw - 0.5rem)` at 320px
- Content surfaces use flexible layouts that reflow naturally
- Text scaling does not cause horizontal overflow

**Test**: Resize browser to 320px width, verify no horizontal scroll, verify widget panel fits within viewport.

**Files**: `a11y-widget.css` (lines 516-535)

---

### 1.4.12 Text Spacing — Level AA ✅

**Status**: ✅ Covered

**Implementation**:
- Three spacing presets: `normal`, `comfortable`, `max`
- Controls line height, letter spacing, word spacing, and paragraph spacing
- Applied via CSS variables:
  - `--a11y-line-height`: 1.4 (normal), 1.7 (comfortable), 2.0 (max)
  - `--a11y-letter-spacing`: 0 (normal), 0.02em (comfortable), 0.05em (max)
  - `--a11y-word-spacing`: 0 (normal), 0.06em (comfortable), 0.12em (max)
  - `--a11y-paragraph-spacing`: 0.75em (normal), 1em (comfortable), 1.25em (max)
- Spacing changes do not break widget layout or reading flow

**Test**: Apply "max" spacing preset, verify text remains readable, verify no content overlaps or breaks layout.

**Files**: `a11y-widget.css` (lines 35-38, 69-93), `a11y-widget.js` (lines 362-399)

---

## Operable

### 2.1.1 Keyboard — Level A ✅

**Status**: ✅ Covered

**Implementation**:
- Widget toggle button is keyboard accessible (Tab to focus, Enter/Space to activate)
- Global keyboard shortcut (Alt+A by default, configurable) to quickly open/close widget
- All controls within panel are keyboard navigable (Tab/Shift+Tab)
- Radio buttons, checkboxes, select dropdowns, range sliders all keyboard operable
- Preset buttons keyboard accessible
- Reset button keyboard accessible
- Close button keyboard accessible (Enter/Space)
- Keyboard shortcut doesn't interfere with normal typing in input fields

**Test**: Navigate entire widget using only keyboard (Tab, Shift+Tab, Enter, Space). Press Alt+A to open widget. Verify all controls are reachable and operable.

**Files**: `a11y-widget.js` (lines 252-761)

---

### 2.4.1 Bypass Blocks — Level A ✅

**Status**: ✅ Covered

**Implementation**:
- Skip link provided: "Skip to content"
- Targets canonical surface if present (`#a11y-skip-target`), otherwise targets `main` or `body`
- Skip link appears on focus (keyboard navigation)
- Allows users to bypass widget and navigate directly to main content

**Test**: Tab to skip link, activate it, verify focus moves to main content area.

**Files**: `a11y-widget.js` (lines 235-248)

---

### 2.4.7 Focus Visible — Level AA ✅

**Status**: ✅ Covered

**Implementation**:
- Strong focus indicators on all interactive elements
- Focus ring: `outline: 3px solid` with offset
- Focus styles applied to:
  - Widget toggle button
  - All form controls (select, range, radio, checkbox)
  - All buttons (presets, reset, close)
- Focus ring color: `var(--a11y-color-secondary)` (#007bff) with shadow
- Focus visible in all contrast modes (default, high, dark, light)

**Test**: Tab through all controls, verify focus ring is always visible and clearly distinguishable.

**Files**: `a11y-widget.css` (lines 399-404, 175-180, 194-197)

---

## Understandable

### 3.2.3 Consistent Navigation — Level AA ✅

**Status**: ✅ Covered

**Implementation**:
- Widget UI is consistent across all pages
- Toggle button position configurable (`left` or `right`) but consistent per site
- Panel layout and controls remain consistent
- Same interaction patterns throughout

**Test**: Navigate across multiple pages, verify widget appears in same position with same controls.

**Files**: `a11y-widget.js` (entire widget structure)

---

### 3.3.2 Labels or Instructions — Level A ✅

**Status**: ✅ Covered

**Implementation**:
- All form controls have associated labels:
  - Contrast select: `<label for="a11y-contrast">Contrast Mode</label>`
  - Text size range: `<label for="a11y-font">Text Size</label>`
  - Spacing radios: `<legend>Text Spacing</legend>` with individual labels
  - Readable font checkbox: Labeled via `aria-label` and help text
  - Reduce motion checkbox: Labeled via `aria-label` and help text
- Help text provided for each control explaining its purpose
- Preset buttons have descriptive `aria-label` attributes
- All controls announce their current state

**Test**: Use screen reader, verify all controls announce their name, purpose, and current state.

**Files**: `a11y-widget.js` (lines 292-452)

---

## Robust

### 4.1.2 Name, Role, Value — Level A ✅

**Status**: ✅ Covered

**Implementation**:
- Toggle button: `aria-controls`, `aria-expanded`, `aria-label`, `aria-haspopup="dialog"`
- Panel: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- Close button: `aria-label`, `aria-keyshortcuts="Escape"`
- Select dropdown: `aria-label`
- Range slider: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-describedby`, `aria-live="polite"`
- Radio buttons: Properly grouped in `<fieldset>` with `<legend>`
- Checkboxes: `aria-label` and help text
- Preset buttons: Descriptive `aria-label` attributes
- All controls announce name, role, and current value/state

**Test**: Use screen reader (NVDA/VoiceOver), verify all controls announce correct name, role, and value.

**Files**: `a11y-widget.js` (lines 252-452)

---

## Additional Features (Beyond Required WCAG 2.1 AA)

### Readable Font Toggle ✅

**Implementation**: System-friendly sans-serif font toggle for improved readability.

**Files**: `a11y-widget.css` (lines 95-98), `a11y-widget.js` (lines 432-443)

---

### Reduce Motion ✅

**Implementation**: Disables animations and transitions for users sensitive to motion (WCAG 2.3.3 Level AAA consideration).

**Files**: `a11y-widget.css` (lines 100-108), `a11y-widget.js` (lines 444-452)

---

### Preference Persistence ✅

**Implementation**: Stores user preferences in localStorage (with cookie fallback) per domain.

**Files**: `a11y-widget.js` (lines 66-91, 100-113)

---

### Preset Profiles ✅

**Implementation**: Quick presets for common accessibility needs:
- Low Vision
- Dyslexia-Friendly
- Reduced Motion
- High Contrast
- Large Text
- Extra Large
- Dark Theme
- Reading Mode
- Focus Mode
- Color Blind
- Minimal

**Files**: `a11y-widget.js` (lines 457-660)

---

## Testing Checklist

### Keyboard Navigation
- [ ] Can open widget with keyboard (Tab to toggle, Enter/Space to activate)
- [ ] Can tab through all controls
- [ ] Space/Enter toggles controls correctly
- [ ] Escape closes panel
- [ ] Focus returns to toggle button after close

### Screen Reader
- [ ] Toggle button announces expanded/collapsed state
- [ ] Panel announces as dialog with label
- [ ] All controls announce name + state
- [ ] Range slider announces current value

### Visual
- [ ] High contrast mode visibly changes colors
- [ ] Text scaling (160%) does not cause horizontal scroll at 320px
- [ ] Spacing presets do not break layout
- [ ] Focus ring always visible

### Reduce Motion
- [ ] When enabled, animations/transitions disabled

### Persistence
- [ ] Reload page retains settings
- [ ] Reset clears settings and returns to defaults

---

## Limitations & Out of Scope

This widget **does not**:
- Fix host-site HTML outside declared surfaces
- Remediate third-party embeds (maps, iframes, booking engines)
- Make PDFs or downloads accessible
- Guarantee full-site ADA compliance
- Provide lawsuit protection

**See**: [support-statement.md](support-statement.md) for full scope boundaries.

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Level AA Success Criteria](https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

