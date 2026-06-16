// TypeScript definitions for Accessibility Widget
declare global {
  interface Window {
    __A11Y_WIDGET__?: {
      siteId?: string
      position?: 'left' | 'right'
      surfaces?: string[]
      enableTelemetry?: boolean
      telemetryEndpoint?: string
      translateEndpoint?: string
      heartbeatEndpoint?: string
      errorEndpoint?: string
      supportEndpoint?: string
      supportEnabled?: boolean
      heartbeatIntervalMs?: number
      licenseKey?: string
      apiKey?: string
      featureOrder?: string[]
      hiddenFeatures?: string[]
      zIndex?: number
      initialOpen?: boolean
      locale?: string
      keyboardShortcut?: string | null
      features?: {
        contrast?: boolean
        fontScale?: boolean
        spacing?: boolean
        reduceMotion?: boolean
        readableFont?: boolean
        presets?: boolean
        reset?: boolean
        skipLink?: boolean
        textToSpeech?: boolean
        translation?: boolean
        readingRuler?: boolean
        screenMask?: boolean
        textOnlyMode?: boolean
        margins?: boolean
        cursorOptions?: boolean
        dictionary?: boolean
        magnifier?: boolean
      }
    }
    __A11Y_WIDGET_BUILD__?: string
    __a11yWidget?: {
      __loaded: boolean
      config: any
      open: () => void
      close: () => void
      toggle: () => void
      getBuild: () => string
      getPrefs: () => any
      setPrefs: (prefs: any) => void
      reset: () => void
    }
    __a11yWidgetInit?: (config?: any) => void
    __initA11yWidget?: (config?: any) => Promise<Window['__a11yWidget']>
  }
}

export {}
