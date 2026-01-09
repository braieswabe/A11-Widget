# WCAG 2.1 AA Coverage Matrix — Accessibility Widget v1

**Scope boundary:** This matrix applies to:
1) the widget UI, and
2) supported surfaces explicitly marked as `data-a11y-surface="true"`.

It does **not** claim coverage for the host site outside those surfaces.

| WCAG 2.1 Criterion | Level | Covered? | How we cover it (v1) | Notes / limits |
|---|---:|:---:|---|---|
| 1.4.3 Contrast (Minimum) | AA | ✅ | Widget UI contrast; optional modes (default/high/dark/light) on supported surfaces | Host site outside supported surfaces unaffected |
| 1.4.4 Resize text | AA | ✅ | Font scale 100–160% via CSS variable; avoids layout-breaking properties | Content-heavy layouts still depend on host CSS |
| 1.4.10 Reflow | AA | ✅ | Widget panel responsive; transforms avoid container changes; targets text elements | Host layout outside supported surfaces not addressed |
| 1.4.12 Text spacing | AA | ✅ | Spacing presets adjust line/letter/word/paragraph spacing | If host styles are rigid, some conflicts possible |
| 2.1.1 Keyboard | A | ✅ | All controls are native elements; full operation via Tab/Enter/Space | Widget is non-modal (no trap) |
| 2.4.1 Bypass blocks | A | ✅* | Skip link provided when a suitable target exists | *If no main/target exists, skip link may not render |
| 2.4.7 Focus visible | AA | ✅ | Strong focus-visible outlines on toggle, buttons, close | Depends on browser support for :focus-visible |
| 3.2.3 Consistent navigation | AA | ✅ | Same widget UI and control layout across pages | Assumes consistent embed configuration |
| 3.3.2 Labels or instructions | A | ✅ | Labels for all controls; current state exposed through native inputs | |
| 4.1.2 Name, role, value | A | ✅ | Native controls + ARIA on dialog/toggle; range aria-valuenow | Avoids custom div controls |
