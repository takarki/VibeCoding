// Constants for Geminizer Extension

// Version
export const VERSION = '0.9.34';

// Timeouts (milliseconds)
export const TIMEOUT = {
  CAPTURE: 120000, // 2 minutes
  INJECTION: 10000, // 10 seconds
  SCROLL_WAIT: 300,
  RENDER_WAIT: 200
};

// URLs
export const URLS = {
  GEMINI: 'https://gemini.google.com/app',
  YOUTUBE: 'https://www.youtube.com'
};

// Storage Keys
export const STORAGE_KEYS = {
  PROMPTS: 'prompts',
  VERSION: 'version',
  SHORTCUTS: 'shortcuts',
  LAST_USED_PROMPT: 'lastUsedPrompt',
  LAST_USED_MODE: 'lastUsedMode',
  SESSION_MODEL_MODE: 'sessionModelMode',
  AUTO_EXECUTE: 'autoExecute',
  PENDING_SELECTION: 'pendingSelection',
  GEMINI_UI_ENHANCEMENTS: 'geminiUIEnhancements'
};

// Model Modes
export const MODEL_MODES = {
  FAST: 'fast',
  THINKING: 'thinking',
  PRO: 'pro'
};

// Content Extraction Modes
export const CONTENT_MODES = {
  URL: 'url',
  TEXT: 'text',
  CAPTURE: 'capture'
};

// Message Actions
export const ACTIONS = {
  RUN_PROMPT: 'runPrompt',
  EXTRACT_CONTENT: 'extractContent',
  INJECT_PROMPT: 'injectPrompt',
  CAPTURE_SCREEN_REQUEST: 'captureScreenRequest',
  CAPTURE_SCREEN_RESPONSE: 'captureScreenResponse',
  COMBINE_SCREENSHOTS: 'combineScreenshots',
  CAPTURE_ERROR: 'captureError',
  START_FULL_PAGE_CAPTURE: 'startFullPageCapture'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

// Content Extraction Limits
export const LIMITS = {
  MAX_CONTENT_LENGTH: 50000,
  MAX_SCREENSHOTS: 50
};

// Default Settings
export const DEFAULT_SETTINGS = {
  geminiUIEnhancements: {
    enterKeyEnabled: true,
    toolShortcutsEnabled: true,
    layoutWidthEnabled: false,
    layoutWidthValue: 1200,
    modelMode: 'thinking',
    submitKeyModifier: 'shift'
  }
};
