# QA: updated widget runtime (`a11y-widget-v1.6.10.js` + `a11y-widget.css`)

Use this with a **pinned jsDelivr tag** (see root [README.md](../README.md)) so CSS and JS stay paired.

## 1. Network verification (pre-flight)

1. Open DevTools → **Network**, filter by `a11y`.
2. Reload with cache disabled (or hard refresh).
3. Confirm:
   - **Script** response URL ends with **`a11y-widget-v1.6.10.js`** (not legacy `a11y-widget.js`) unless you intentionally test legacy.
   - **Stylesheet** **`a11y-widget.css`** loads with status **200**.
   - Only **one** widget script is injected (no duplicate loaders/runtimes).
4. In the **Console**, run:
   - `window.__A11Y_WIDGET_BUILD__` → should be `"a11y-widget-v1.6.10.js"`.
   - After the widget mounts: `window.__a11yWidget.getBuild()` → same string.

If `checkForUpdates is not defined` or similar appears while the file name is still `a11y-widget.js`, the site is on the **wrong asset** or a **cached/truncated** file—fix the enqueue URL and purge CDN/browser cache before filing a widget bug.

---

## 2. Expected-results checklist (manual)

| # | Check | Pass criteria |
|---|--------|----------------|
| 1 | Single dropdown icon | Contrast, Text spacing, and Translation language `<select>`s show **one** chevron (custom SVG). In **Windows High Contrast / forced-colors**, the OS may draw a native control (may look like two segments)—acceptable. |
| 2 | Text spacing | Comfortable / Max change **line-height, letter-spacing, word-spacing**, and paragraph spacing on content (surface or Global Mode). |
| 3 | Global Mode + contrast | Host **tabs** (`[role="tab"]`, `.nav-tab`) and **buttons** keep **readable** label text in Default / Dark / High. |
| 4 | Large Cursor + checkboxes | With Large Cursor on, all panel checkboxes remain **clickable**; pointer visible in panel. |
| 5 | Large Cursor default color | Default cursor color remains **visible** across contrast modes. |
| 6 | Check for updates | Button shows progress/result text; **no** `ReferenceError` in console. |
| 7 | Reset to defaults | Restores contrast, spacing, dark theme, overlays, toolbar UI state. |
| 8 | Screen mask + video | Mask dims page including **same-origin** `<video>` while moving the pointer. |
| 9 | Placeholders | Page and widget inputs show readable **placeholder** styling in Default / High / Light. |
| 10 | Translation | Headings, labels, common attributes, `<option>` text translate; **dynamic** nodes after load are picked up while translation stays on (best-effort). |
| 11 | Page magnifier | Shown as a **checkbox** row like other tools in the Advanced panel (when `features.magnifier` is enabled). |
| 12 | Panel fixed in viewport | In High contrast + scroll, **`#a11y-widget-root`** stays fixed (no drift off-screen). |

Record **Pass/Fail**, browser/OS, and a screenshot for each failure.

---

## 3. Known limits (non-goals)

- **Translation**: Does not translate text inside **iframes**, **canvas**, or **SVG** as plain text; skips `SCRIPT`/`STYLE`/`CODE`/`PRE` content by design. “All text on page” means **best-effort** over the live DOM on the main document.
- **Screen mask**: Same-origin video is targeted; **cross-origin** video / **fullscreen** may not dim the same way.
- **Forced-colors / OS high contrast**: Native `<select>` chrome may replace the custom SVG; treat as environment-specific, not necessarily a regression.
- **Host CSS**: Theme rules with higher specificity or inline styles can still override placeholders or spacing on **non-surface** regions when Global Mode is off.
