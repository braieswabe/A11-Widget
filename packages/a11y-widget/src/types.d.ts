/**
 * Widget configuration options
 */
export interface A11yWidgetConfig {
  siteId?: string;
  position?: "left" | "right";
  locale?: string;
  zIndex?: number;
  initialOpen?: boolean;
  enableTelemetry?: boolean;
  telemetryEndpoint?: string | null;
  keyboardShortcut?: string | null;
  globalMode?: boolean;
  surfaces?: string[];
  features?: {
    contrast?: boolean;
    fontScale?: boolean;
    spacing?: boolean;
    reduceMotion?: boolean;
    readableFont?: boolean;
    presets?: boolean;
    reset?: boolean;
    skipLink?: boolean;
    textToSpeech?: boolean;
    translation?: boolean;
    readingRuler?: boolean;
    screenMask?: boolean;
    textOnlyMode?: boolean;
    margins?: boolean;
    cursorOptions?: boolean;
    dictionary?: boolean;
    magnifier?: boolean;
  };
  branding?: {
    show?: boolean;
  };
  storageKey?: string;
}

/**
 * Initialize the accessibility widget
 * @param config - Widget configuration
 */
export declare function initA11yWidget(config?: A11yWidgetConfig): void;
