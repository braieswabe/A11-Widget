/** Remove widget assets from the page (e.g. gate pages, admin login, unmount). */
export function teardownA11yWidget() {
  const selectors = [
    '#a11y-widget-root',
    '#a11y-widget-toggle',
    '#a11y-widget-toolbar',
    '#a11y-widget-tooltip',
    '#a11y-magnifier-lens',
    '#a11y-magnifier-exit',
    '#a11y-custom-cursor',
    '#a11y-compliance-modal',
    '#a11y-reading-ruler',
    '#a11y-screen-mask'
  ]

  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => {
      el.parentNode?.removeChild(el)
    })
  }

  document.querySelectorAll('script[src*="a11y-widget"],#a11y-widget-loader-script').forEach((el) => {
    el.parentNode?.removeChild(el)
  })

  const stylesheet = document.getElementById('a11y-widget-stylesheet')
  if (stylesheet?.parentNode) {
    stylesheet.parentNode.removeChild(stylesheet)
  }

  document.querySelectorAll('link[href*="a11y-widget.css"]').forEach((el) => {
    if (el.id !== 'a11y-widget-stylesheet' || el.parentNode) {
      el.parentNode?.removeChild(el)
    }
  })

  const html = document.documentElement
  Array.from(html.attributes).forEach((attr) => {
    if (attr.name === 'data-a11y' || attr.name.startsWith('data-a11y-')) {
      html.removeAttribute(attr.name)
    }
  })
  html.classList.remove('a11y-widget-hidden')

  if (window.__a11yWidget) {
    window.__a11yWidget.__loaded = false
  }
  delete window.__a11yWidgetInit
  delete window.__a11yWidgetLoaderBooted
}
