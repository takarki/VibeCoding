// AI Injector - Injects prompts into Gemini interface
// Runs on gemini.google.com pages

console.log('[Geminizer AI Injector] Script loaded on Gemini page');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Geminizer AI Injector] Message received:', message.action);

  if (message.action === 'injectPrompt') {
    injectPrompt(message);
    sendResponse({ success: true });
    return true;
  }

  return false;
});

/**
 * Inject prompt into Gemini input field
 */
async function injectPrompt(message) {
  const { promptText, modelMode, autoExecute, tools, imageDataUrl, manualImagePaste } = message;

  try {
    console.log('[Geminizer AI Injector] Injecting prompt...');

    // Wait for Gemini interface to be ready
    await waitForGeminiReady();

    // Switch model mode if needed
    if (modelMode && modelMode !== 'fast') {
      await switchModelMode(modelMode);
    }

    // Activate tools if specified
    if (tools) {
      if (tools.deepResearch) await activateTool('deepresearch');
      if (tools.canvas) await activateTool('canvas');
      if (tools.nanobanana) await activateTool('nanobanana');
    }

    // Find input field
    const inputField = findInputField();
    if (!inputField) {
      console.error('[Geminizer AI Injector] Input field not found');
      showNotification('入力フィールドが見つかりませんでした', 'error');
      return;
    }

    // Insert text
    insertText(inputField, promptText);

    // If manual image paste, show instruction
    if (manualImagePaste) {
      showNotification('スクリーンショットをCtrl+Vで貼り付けてください', 'info');
      return;
    }

    // Auto-execute if enabled
    if (autoExecute) {
      await new Promise(resolve => setTimeout(resolve, 500));
      clickSendButton();
    }

    // Convert timestamps to links after response (if applicable)
    if (promptText.includes('YouTube') || promptText.includes('youtube.com')) {
      waitForResponseAndConvertTimestamps();
    }

  } catch (error) {
    console.error('[Geminizer AI Injector] Error injecting prompt:', error);
    showNotification('プロンプトの挿入に失敗しました: ' + error.message, 'error');
  }
}

/**
 * Wait for Gemini interface to be ready
 */
function waitForGeminiReady(maxWait = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkReady = () => {
      const inputField = findInputField();
      
      if (inputField) {
        resolve();
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error('Gemini interface not ready'));
      } else {
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
  });
}

/**
 * Find Gemini input field
 */
function findInputField() {
  // Try multiple selectors for Gemini input
  const selectors = [
    'rich-textarea[placeholder*="Gemini"]',
    'rich-textarea',
    '[contenteditable="true"]',
    'textarea[placeholder*="Gemini"]',
    '.ql-editor',
    '[aria-label*="プロンプト"]',
    '[aria-label*="Prompt"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('[Geminizer AI Injector] Found input field:', selector);
      return element;
    }
  }

  return null;
}

/**
 * Insert text into input field
 */
function insertText(element, text) {
  // For contenteditable elements
  if (element.contentEditable === 'true') {
    element.textContent = text;
    
    // Trigger input event
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
    
    // Set cursor to end
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  } 
  // For textarea
  else if (element.tagName === 'TEXTAREA') {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  // For rich-textarea (Gemini specific)
  else if (element.tagName === 'RICH-TEXTAREA') {
    const innerDiv = element.querySelector('[contenteditable="true"]');
    if (innerDiv) {
      innerDiv.textContent = text;
      innerDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  console.log('[Geminizer AI Injector] Text inserted');
}

/**
 * Click send button
 */
function clickSendButton() {
  const selectors = [
    'button[aria-label*="送信"]',
    'button[aria-label*="Send"]',
    'button[type="submit"]',
    '.send-button',
    '[data-test-id="send-button"]'
  ];

  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (button && !button.disabled) {
      console.log('[Geminizer AI Injector] Clicking send button');
      button.click();
      return true;
    }
  }

  console.warn('[Geminizer AI Injector] Send button not found');
  return false;
}

/**
 * Switch model mode (thinking/pro/fast)
 */
async function switchModelMode(mode) {
  console.log('[Geminizer AI Injector] Switching to mode:', mode);
  
  // Implementation depends on Gemini UI structure
  // This is a placeholder - actual implementation would need to find and click the model selector
  
  try {
    // Find model selector button
    const modelButton = document.querySelector('[aria-label*="モデル"], [aria-label*="Model"]');
    if (modelButton) {
      modelButton.click();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the mode option
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
          console.log('[Geminizer AI Injector] Switched to', mode);
          return;
        }
      }
    }
  } catch (error) {
    console.warn('[Geminizer AI Injector] Failed to switch mode:', error);
  }
}

/**
 * Activate tool (DeepResearch, Canvas, etc)
 */
async function activateTool(toolName) {
  console.log('[Geminizer AI Injector] Activating tool:', toolName);
  
  // Placeholder - actual implementation depends on Gemini UI
  // Would need to find and click tool activation buttons
}

/**
 * Wait for response and convert timestamps to links
 */
function waitForResponseAndConvertTimestamps() {
  console.log('[Geminizer AI Injector] Waiting for response to convert timestamps...');
  
  // Observer for new response content
  const observer = new MutationObserver((mutations) => {
    convertTimestampsInResponse();
  });

  // Observe the response container
  const responseContainer = document.querySelector('[class*="response"], [class*="message"]');
  if (responseContainer) {
    observer.observe(responseContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Also try immediately
  setTimeout(() => convertTimestampsInResponse(), 2000);
}

/**
 * Convert timestamps in response to clickable links
 */
function convertTimestampsInResponse() {
  const timestampRegex = /(\d{1,2}):(\d{2}):(\d{2})/g;
  
  // Find all text nodes in response
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    if (timestampRegex.test(node.textContent)) {
      textNodes.push(node);
    }
  }

  // Convert timestamps to links
  textNodes.forEach(textNode => {
    const parent = textNode.parentElement;
    if (parent && !parent.querySelector('a[data-timestamp]')) {
      const html = textNode.textContent.replace(timestampRegex, (match, h, m, s) => {
        const seconds = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
        // This would need the actual YouTube URL - placeholder for now
        return `<a href="#" data-timestamp="${seconds}" style="color: #1a73e8; text-decoration: underline;">${match}</a>`;
      });
      
      const span = document.createElement('span');
      span.innerHTML = html;
      parent.replaceChild(span, textNode);
    }
  });
}

/**
 * Show notification to user
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
