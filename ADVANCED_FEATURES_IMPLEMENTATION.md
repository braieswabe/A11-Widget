# Advanced Features Implementation Plan

This document outlines the implementation of advanced accessibility features for the widget.

## Features to Implement

### 1. Text-to-Speech & Audio ✅
- **Status**: In Progress
- **Implementation**: Web Speech API (speechSynthesis)
- **Features**:
  - Read selected text aloud
  - Read full page text
  - Customizable voice settings (rate, pitch, volume)
  - Voice selection from available voices
  - Download as audio file (using MediaRecorder API)

### 2. Language Support & Translation ⏳
- **Status**: Pending
- **Implementation**: Translation API integration
- **Features**:
  - Translate page content into 100+ languages
  - 65+ text-to-speech voices for translated text
  - Language selector dropdown

### 3. Reading and Focus Aids ⏳
- **Status**: Pending
- **Implementation**: CSS + JavaScript

#### Reading Ruler
- Horizontal line that follows cursor
- Adjustable height and color
- Focuses on one line of text

#### Screen Mask
- Dims distractions around focused area
- Adjustable opacity and radius
- Follows mouse/cursor

#### Text-Only Mode
- Strips away images and layout
- Shows only text content
- CSS-based implementation

#### Margins
- Adjustable margins for better readability
- CSS-based with configurable size

#### Cursor Options
- Customizable cursor size (normal, large, extra-large)
- CSS-based cursor styling

### 4. Extra Tools ⏳
- **Status**: Pending

#### Dictionary & Thesaurus
- Word definitions on double-click or selection
- API integration (Dictionary API)
- Popup tooltip with definition

#### Magnifier
- Zoom parts of the page on hover or click
- Adjustable zoom level
- Follows mouse cursor

## Implementation Order

1. ✅ Configuration structure (features flags, preferences)
2. ⏳ Text-to-Speech implementation
3. ⏳ Reading aids (ruler, mask, text-only mode, margins, cursor)
4. ⏳ Magnifier tool
5. ⏳ Dictionary lookup
6. ⏳ Translation feature
7. ⏳ UI controls for all features
8. ⏳ CSS styles for reading aids
9. ⏳ Documentation updates

## Technical Notes

- All features respect scope boundaries (widget UI + declared surfaces only)
- Features are opt-in via feature flags
- Preferences persist via localStorage
- All features are keyboard accessible
- Screen reader compatible

