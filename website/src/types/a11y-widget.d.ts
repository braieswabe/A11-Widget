// TypeScript definitions for Accessibility Widget
declare global {
  interface Window {
    __A11Y_WIDGET__?: {
      siteId?: string
      position?: 'left' | 'right'
      surfaces?: string[]
      enableTelemetry?: boolean
      telemetryEndpoint?: string
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
    __a11yWidget?: {
      __loaded: boolean
      config: any
      getPrefs: () => any
      setPrefs: (prefs: any) => void
      reset: () => void
    }
    __a11yWidgetInit?: (config?: any) => void
  }
}

export {}

