# Acceptance Test Checklist — Accessibility Widget v1

This checklist verifies that the widget meets all requirements from the canon document.

## Keyboard Navigation Tests

### ✅ Can Open Widget with Keyboard

1. Tab to focus on page
2. Continue tabbing until widget toggle button receives focus
3. Press **Enter** or **Space**
4. **Expected**: Widget panel opens

### ✅ Can Tab Through Every Control

1. Open widget panel
2. Press **Tab** repeatedly
3. **Expected**: Focus moves through:
   - Contrast select
   - Text size range
   - Spacing radio buttons (Normal, Comfortable, Max)
   - Readable font checkbox
   - Reduce motion checkbox
   - Preset buttons (if enabled)
   - Reset button (if enabled)
   - Close button

### ✅ Space/Enter Toggles Controls

1. Focus on a checkbox (Readable font or Reduce motion)
2. Press **Space**
3. **Expected**: Checkbox toggles, setting changes
4. Focus on a radio button
5. Press **Space**
6. **Expected**: Radio button selects, setting changes
7. Focus on preset button
8. Press **Enter**
9. **Expected**: Preset applies, all controls update visually

### ✅ Escape Closes Panel

1. Open widget panel
2. Press **Escape**
3. **Expected**: Panel closes, focus returns to toggle button

### ✅ Focus Returns to Open Button

1. Open widget panel
2. Close panel (Escape or Close button)
3. **Expected**: Focus returns to toggle button

### ✅ Focus Ring Always Visible

1. Tab through all controls
2. **Expected**: Strong focus ring visible on every focused element
3. Check focus styles: `outline: 3px solid` with offset

## Screen Reader Tests

Test with NVDA (Windows) or VoiceOver (macOS/iOS).

### ✅ Open Button Announces Expanded/Collapsed State

1. Focus on toggle button
2. **Expected**: Screen reader announces "Accessibility button, collapsed" (or similar)
3. Activate button
4. **Expected**: Announces "Accessibility button, expanded"

### ✅ Panel Announces as Dialog/Region with Label

1. Open widget panel
2. Navigate to panel
3. **Expected**: Screen reader announces "Accessibility settings dialog" (or similar, based on `aria-labelledby`)

### ✅ Every Control Announces Name + State

1. Navigate through controls with screen reader
2. **Expected**: Each control announces:
   - **Contrast select**: "Contrast, select, Default" (or current value)
   - **Text size range**: "Text size, slider, 100 percent" (or current value)
   - **Spacing radios**: "Text spacing, Normal, radio button, checked" (or current selection)
   - **Readable font**: "Readable font, checkbox, unchecked" (or checked)
   - **Reduce motion**: "Reduce motion, checkbox, unchecked" (or checked)

### ✅ Range Announces Current Value

1. Focus on text size range slider
2. **Expected**: Screen reader announces current percentage (e.g., "100 percent")
3. Adjust slider
4. **Expected**: Announces new percentage value

## Visual Tests

### ✅ High Contrast Mode Visibly Changes Colours

1. Open widget panel
2. Select "High contrast" from contrast dropdown
3. **Expected**: 
   - Widget panel and surfaces show increased contrast
   - Colors are visibly different from default
   - Filter or color changes are applied

### ✅ Text Scaling Does Not Cause Horizontal Scroll at 320px

1. Set browser viewport to 320px width
2. Open widget panel
3. Increase text size to maximum (160%)
4. **Expected**: 
   - No horizontal scrollbar appears
   - Widget panel fits within viewport
   - Content wraps appropriately

### ✅ Spacing Toggles Do Not Overlap or Break Widget Layout

1. Open widget panel
2. Select "Max" spacing preset
3. **Expected**:
   - Widget controls don't overlap
   - Layout remains readable
   - No content breaks outside panel

## Reduce Motion Tests

### ✅ When Enabled, Widget and Surfaces Disable Transitions/Animations

1. Open widget panel
2. Check "Reduce motion" checkbox
3. **Expected**:
   - Widget panel animations stop
   - Surface animations stop (if any)
   - Transitions disabled
   - Scroll behavior changes to auto (no smooth scroll)

## Persistence Tests

### ✅ Reload Page Retains Settings

1. Open widget panel
2. Change settings:
   - Set contrast to "High"
   - Increase text size to 140%
   - Select "Comfortable" spacing
   - Enable "Readable font"
3. Reload page (F5 or Cmd+R)
4. **Expected**: 
   - All settings remain as set
   - UI controls show correct values
   - Transforms are applied immediately

### ✅ Reset Clears Settings and Returns to Default

1. Change multiple settings
2. Click "Reset settings" button
3. **Expected**:
   - All settings return to defaults:
     - Contrast: "default"
     - Text size: 100%
     - Spacing: "normal"
     - Readable font: unchecked
     - Reduce motion: unchecked
   - UI controls reset visually
   - Transforms removed

## Preset Tests

### ✅ Low Vision Preset Updates All Controls Visually

1. Open widget panel
2. Click "Low vision" preset button
3. **Expected**:
   - Contrast select shows "High contrast"
   - Text size range shows 140%
   - Spacing radios show "Comfortable" selected
   - All controls visually update immediately

### ✅ Dyslexia-Friendly Preset Updates All Controls Visually

1. Open widget panel
2. Click "Dyslexia-friendly" preset button
3. **Expected**:
   - Readable font checkbox is checked
   - Spacing radios show "Comfortable" selected
   - Reduce motion checkbox is checked
   - All controls visually update immediately

### ✅ Reduced Motion Preset Updates Checkbox Visually

1. Open widget panel
2. Click "Reduced motion" preset button
3. **Expected**:
   - Reduce motion checkbox is checked
   - Control visually updates immediately

## Telemetry Tests (If Enabled)

### ✅ Telemetry Events Sent (If Enabled)

1. Enable telemetry: `enableTelemetry: true`, `telemetryEndpoint: "/api/telemetry"`
2. Open widget panel
3. **Expected**: POST request to `/api/telemetry` with `{ event: "widget_open", ... }`
4. Change a setting
5. **Expected**: POST request with `{ event: "setting_change", ... }`
6. Reset settings
7. **Expected**: POST request with `{ event: "reset", ... }`

## Cross-Browser Tests

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Mobile Responsiveness Tests

### ✅ Widget Works at 320px Width

1. Set viewport to 320px width
2. **Expected**:
   - Widget toggle button visible and accessible
   - Panel fits within viewport
   - No horizontal scroll
   - Controls are usable

### ✅ Widget Works at 375px Width (iPhone)

1. Set viewport to 375px width
2. **Expected**: Widget functions normally

### ✅ Widget Works at 768px Width (Tablet)

1. Set viewport to 768px width
2. **Expected**: Widget functions normally

## Edge Cases

### ✅ Widget Loads on Slow Connections

1. Throttle network to "Slow 3G"
2. **Expected**: Widget loads and functions correctly

### ✅ Widget Handles Missing localStorage

1. Disable localStorage in browser
2. **Expected**: Widget falls back to cookies, still functions

### ✅ Widget Handles CSP Restrictions

1. Use CSP-friendly installation (data attributes)
2. **Expected**: Widget loads and functions correctly

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
OS: ___________

Keyboard Tests: [ ] Pass [ ] Fail
Screen Reader Tests: [ ] Pass [ ] Fail
Visual Tests: [ ] Pass [ ] Fail
Reduce Motion Tests: [ ] Pass [ ] Fail
Persistence Tests: [ ] Pass [ ] Fail
Preset Tests: [ ] Pass [ ] Fail
Telemetry Tests: [ ] Pass [ ] Fail (N/A if disabled)
Cross-Browser Tests: [ ] Pass [ ] Fail
Mobile Tests: [ ] Pass [ ] Fail

Notes:
_________________________________________________
_________________________________________________
```

## Sign-Off

All tests must pass before release.

- [ ] All keyboard tests pass
- [ ] All screen reader tests pass
- [ ] All visual tests pass
- [ ] All persistence tests pass
- [ ] All preset tests pass
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility verified

**Approved by**: ___________
**Date**: ___________

