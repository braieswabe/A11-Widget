/**
 * Human-friendly copy for accessibility widget
 * Replaces technical labels with user-friendly alternatives
 */

export const COPY = {
  // Feature labels
  reduceMotion: "Turn off animations (helps with dizziness)",
  textSpacing: "Increase space between lines & letters",
  readableFont: "Use easier-to-read font",
  highContrast: "Increase color contrast for better visibility",
  textSize: "Make text larger or smaller",
  readingRuler: "Show reading line to focus on text",
  screenMask: "Dim distractions around your focus area",
  contrast: "Contrast Mode",
  fontScale: "Text Size",
  spacing: "Text Spacing",
  
  // Preset descriptions
  presets: {
    lowVision: "Best for visual impairments",
    dyslexia: "Best for reading difficulties",
    reducedMotion: "Best for motion sensitivity",
    highContrast: "Best for better visibility",
    largeText: "Best for easier reading",
    darkTheme: "Best for reduced eye strain",
    readingMode: "Best for long reading sessions",
    callCenterMode: "Best for dashboards & fast workflows",
    quickScanMode: "Best for quick scanning"
  },
  
  // Help text
  help: {
    contrast: "Adjust color contrast for better visibility. Applies to widget and declared surfaces.",
    fontScale: "Scale text from 100% (normal) to 160% (large) for better readability.",
    spacing: "Adjust line height, letter spacing, word spacing, and paragraph spacing for easier reading.",
    readableFont: "Switch to a system-friendly sans-serif font that's easier to read. Applies to declared surfaces.",
    reduceMotion: "Disable animations, transitions, and motion effects. Helps users sensitive to motion.",
    textToSpeech: "Read website text aloud with customizable voice settings.",
    readingRuler: "Display a horizontal line to help focus on text while reading.",
    screenMask: "Dim the page around your cursor to reduce distractions and improve focus.",
    textOnlyMode: "Hide images and show only text content for faster reading.",
    margins: "Add extra space around content to reduce eye strain.",
    cursor: "Make the cursor larger and more visible for easier tracking.",
    magnifier: "Magnify content under your cursor for detailed viewing.",
    dictionary: "Look up word definitions by clicking on text.",
    translation: "Translate page content to your preferred language.",
    globalMode: "Apply transformations to entire website (fonts, colors, sizes). When disabled, only affects declared surfaces.",
    toolbarMode: "Switch to floating toolbar at the bottom of the page for quick access to all features."
  },
  
  // Announcements
  announcements: {
    widgetOpened: "Accessibility panel opened",
    widgetClosed: "Accessibility panel closed",
    optionsAvailable: "Accessibility options available. Press Alt + A to open.",
    contrastChanged: "Contrast mode changed to",
    textSizeChanged: "Text size changed to",
    presetApplied: "Preset applied:",
    settingsReset: "All settings reset to defaults",
    preferencesSaved: "Accessibility preferences saved"
  },
  
  // First visit nudge
  firstVisit: {
    title: "Accessibility tools available",
    message: "Press Alt + A or click here to customize your viewing experience",
    dismiss: "Got it"
  },
  
  // Trust statement
  trustStatement: "This tool runs locally and does not track personal data.",
  
  // Compliance
  compliance: {
    title: "Accessibility Information",
    wcagStatement: "This widget provides accessibility enhancements aligned with WCAG 2.1 AA standards for supported surfaces.",
    featuresTitle: "Supported Features",
    shortcutsTitle: "Keyboard Shortcuts",
    lastUpdated: "Last updated:",
    exportButton: "Export Settings Snapshot"
  },
  
  // Recommendations
  recommendations: {
    title: "Based on this page, we recommend:",
    apply: "Apply",
    dismiss: "Dismiss"
  },
  
  // Reset options
  reset: {
    toDefaults: "Reset to Defaults",
    toMyDefaults: "Reset to my defaults",
    toSiteDefaults: "Reset to site defaults"
  }
};
