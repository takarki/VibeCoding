// Gemini UI Enhancer - Improves Gemini interface
// Runs on gemini.google.com pages

console.log('[Geminizer Gemini Enhancer] Script loaded');

// Initialize enhancements when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  console.log('[Geminizer Gemini Enhancer] Initializing...');

  // Load settings
  const settings = await loadSettings();
  console.log('[Geminizer Gemini Enhancer] Settings loaded:', settings);

  // Apply enhancements based on settings
  if (settings.enterKeyEnabled) {
    setupEnterKeySubmit(settings.submitKeyModifier);
  }

  if (settings.toolShortcutsEnabled) {
    setupToolShortcuts();
  }

  if (settings.layoutWidthEnabled) {
    adjustLayoutWidth(settings.layoutWidthValue);
  }

  // Set default model mode if specified
  if (settings.modelMode) {
    setTimeout(() => {
      setModelMode(settings.modelMode);
    }, 1000);
  }

  console.log('[Geminizer Gemini Enhancer] Initialization complete');
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get('geminiUIEnhancements', (data) => {
      const defaults = {
        enterKeyEnabled: true,
        toolShortcutsEnabled: true,
        layoutWidthEnabled: false,
        layoutWidthValue: 1200,
        modelMode: 'thinking',
        submitKeyModifier: 'shift'
      };

      resolve(data.geminiUIEnhancements || defaults);
    });
  });
}

/**
 * Setup Enter key to submit prompt
 */
function setupEnterKeySubmit(modifier = 'shift') {
  console.log('[Geminizer Gemini Enhancer] Setting up Enter key submit with modifier:', modifier);

  document.addEventListener('keydown', (e) => {
    // Check if Enter was pressed
    if (e.key !== 'Enter') return;

    // Check for modifier key
    const modifierPressed = modifier === 'shift' ? e.shiftKey :
                           modifier === 'ctrl' ? e.ctrlKey :
                           modifier === 'alt' ? e.altKey :
                           false;

    // If modifier + Enter, submit; if just Enter, newline
    if (modifierPressed) {
      const inputField = findInputField();
      if (inputField && document.activeElement === inputField) {
        e.preventDefault();
        clickSendButton();
      }
    }
  }, true);
}

/**
 * Setup keyboard shortcuts for tools
 */
function setupToolShortcuts() {
  console.log('[Geminizer Gemini Enhancer] Setting up tool shortcuts');

  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D for Deep Research
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      activateTool('deepresearch');
    }

    // Ctrl+Shift+C for Canvas
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      activateTool('canvas');
    }

    // Ctrl+Shift+N for NanoBanana
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      activateTool('nanobanana');
    }
  }, true);
}

/**
 * Adjust layout width
 */
function adjustLayoutWidth(width) {
  console.log('[Geminizer Gemini Enhancer] Adjusting layout width to:', width);

  const style = document.createElement('style');
  style.id = 'geminizer-layout-width';
  style.textContent = `
    .chat-container,
    .conversation-container,
    main[class*="chat"] {
      max-width: ${width}px !important;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Set model mode (thinking/pro/fast)
 */
function setModelMode(mode) {
  console.log('[Geminizer Gemini Enhancer] Setting model mode to:', mode);

  try {
    // Find model selector
    const modelButton = document.querySelector('[aria-label*="モデル"], [aria-label*="Model"]');
    if (modelButton) {
      modelButton.click();
      
      setTimeout(() => {
        const modeLabels = {
          'thinking': ['思考', 'Thinking', 'Deep Think'],
          'pro': ['Pro', 'プロ'],
          'fast': ['Fast', '高速', 'Flash']
        };
        
        const labels = modeLabels[mode] || [];
        for (const label of labels) {
          const option = Array.from(document.querySelectorAll('button, [role="option"]'))
            .find(el => el.textContent.includes(label));
          
          if (option) {
            option.click();
            console.log('[Geminizer Gemini Enhancer] Switched to', mode);
            return;
          }
        }
      }, 300);
    }
  } catch (error) {
    console.warn('[Geminizer Gemini Enhancer] Failed to set model mode:', error);
  }
}

/**
 * Find Gemini input field
 */
function findInputField() {
  const selectors = [
    'rich-textarea[placeholder*="Gemini"]',
    'rich-textarea',
    '[contenteditable="true"]',
    'textarea[placeholder*="Gemini"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}

/**
 * Click send button
 */
function clickSendButton() {
  const selectors = [
    'button[aria-label*="送信"]',
    'button[aria-label*="Send"]',
    'button[type="submit"]',
    '.send-button'
  ];

  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (button && !button.disabled) {
      console.log('[Geminizer Gemini Enhancer] Clicking send button');
      button.click();
      return true;
    }
  }

  return false;
}

/**
 * Activate tool (placeholder - implementation depends on Gemini UI)
 */
function activateTool(toolName) {
  console.log('[Geminizer Gemini Enhancer] Activating tool:', toolName);
  
  // Show notification
  showNotification(`${toolName} ツールを有効化しています...`, 'info');
  
  // Actual implementation would need to find and click tool buttons
  // This is a placeholder
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: 'Google Sans', sans-serif;
    font-size: 14px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Listen for messages (e.g., from popup or background)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectPrompt') {
    // This is handled by ai_injector.js, but we can also respond here if needed
    console.log('[Geminizer Gemini Enhancer] Prompt injection requested');
  }
  
  return false;
});
