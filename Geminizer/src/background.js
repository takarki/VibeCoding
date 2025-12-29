// Background Service Worker for Geminizer Extension
// Handles message routing, tab management, and orchestration

console.log('[Geminizer Background] Service worker loaded');

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Geminizer Background] Message received:', message.action);

  if (message.action === 'runPrompt') {
    handleRunPrompt(message, sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.action === 'captureScreenRequest') {
    handleCaptureScreenRequest(message, sender, sendResponse);
    return true;
  }

  if (message.action === 'captureVisibleTab') {
    handleCaptureVisibleTab(message, sender, sendResponse);
    return true;
  }

  if (message.action === 'captureYouTubeImage') {
    handleCaptureYouTubeImage(message, sender, sendResponse);
    return true;
  }

  if (message.action === 'setupImageContextMenu') {
    setupYouTubeImageContextMenu();
  }

  return false;
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('[Geminizer Background] Command received:', command);

  if (command === 'run_youtube_summary') {
    handleYouTubeSummaryShortcut();
  } else if (command.startsWith('run_prompt_')) {
    const promptIndex = parseInt(command.replace('run_prompt_', ''), 10);
    handlePromptShortcut(promptIndex);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'geminize-youtube-thumbnail') {
    handleYouTubeImageCapture(tab, 'thumbnail');
  } else if (info.menuItemId === 'geminize-youtube-screenshot') {
    handleYouTubeImageCapture(tab, 'screenshot');
  } else if (info.menuItemId === 'geminize-selection') {
    handleContextMenuGeminize(info, tab);
  }
});

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  setupYouTubeImageContextMenu();
});

/**
 * Handle runPrompt message from popup
 */
async function handleRunPrompt(message, sendResponse) {
  try {
    const { prompt, tabId, tabUrl, tabTitle, modelMode, autoExecute, forcePageContent, imageDataUrl, manualImagePaste } = message;

    // Validate prompt
    const validation = validatePrompt(prompt, tabUrl, forcePageContent);
    if (!validation.isValid && !autoExecute) {
      sendResponse({ success: false, validation });
      return;
    }

    // Extract content if needed
    let contentText = forcePageContent || '';
    if (prompt.usePageContent && !contentText) {
      try {
        const result = await chrome.tabs.sendMessage(tabId, { action: 'extractContent' });
        contentText = result?.content || '';
      } catch (error) {
        console.warn('[Geminizer Background] Failed to extract content:', error);
      }
    }

    // Build final prompt text
    const promptText = buildPromptText(prompt.content, tabUrl, tabTitle, contentText);

    // Open Gemini tab and inject prompt
    const geminiUrl = 'https://gemini.google.com/app';
    const geminiTab = await chrome.tabs.create({ url: geminiUrl });

    // Wait for tab to load, then inject
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === geminiTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);

        // Inject the prompt
        chrome.tabs.sendMessage(geminiTab.id, {
          action: 'injectPrompt',
          promptText,
          modelMode: modelMode || 'fast',
          autoExecute: autoExecute !== false,
          tools: prompt.tools || {},
          imageDataUrl,
          manualImagePaste
        }).catch(err => {
          console.error('[Geminizer Background] Failed to inject prompt:', err);
        });
      }
    });

    sendResponse({ success: true, validation });

  } catch (error) {
    console.error('[Geminizer Background] Error in handleRunPrompt:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle screen capture request from content script
 */
async function handleCaptureScreenRequest(message, sender, sendResponse) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    // Send response back to content script
    chrome.tabs.sendMessage(sender.tab.id, {
      action: 'captureScreenResponse',
      index: message.index,
      dataUrl: dataUrl
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error('[Geminizer Background] Capture failed:', error);
    
    chrome.tabs.sendMessage(sender.tab.id, {
      action: 'captureScreenResponse',
      index: message.index,
      dataUrl: null,
      error: error.message
    });

    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle YouTube summary keyboard shortcut
 */
async function handleYouTubeSummaryShortcut() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('youtube.com/watch')) {
      console.log('[Geminizer Background] Not on YouTube video page');
      return;
    }

    // Load prompts and find YouTube summary prompt
    const data = await chrome.storage.local.get('prompts');
    const prompts = data.prompts || [];
    const youtubePrompt = prompts.find(p => p.title.includes('YouTube') || p.title.includes('要約'));

    if (!youtubePrompt) {
      console.error('[Geminizer Background] YouTube summary prompt not found');
      return;
    }

    // Trigger the prompt
    handleRunPrompt({
      prompt: youtubePrompt,
      tabId: tab.id,
      tabUrl: tab.url,
      tabTitle: tab.title,
      modelMode: 'thinking',
      autoExecute: true
    }, () => {});

  } catch (error) {
    console.error('[Geminizer Background] Error in handleYouTubeSummaryShortcut:', error);
  }
}

/**
 * Handle prompt keyboard shortcut
 */
async function handlePromptShortcut(promptIndex) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('[Geminizer Background] No active tab');
      return;
    }

    // Load prompts
    const data = await chrome.storage.local.get('prompts');
    const prompts = data.prompts || [];

    if (promptIndex < 0 || promptIndex >= prompts.length) {
      console.error('[Geminizer Background] Invalid prompt index:', promptIndex);
      return;
    }

    const prompt = prompts[promptIndex];

    // Trigger the prompt
    handleRunPrompt({
      prompt: prompt,
      tabId: tab.id,
      tabUrl: tab.url,
      tabTitle: tab.title,
      modelMode: prompt.modelMode || 'fast',
      autoExecute: prompt.autoExecute !== false
    }, () => {});

  } catch (error) {
    console.error('[Geminizer Background] Error in handlePromptShortcut:', error);
  }
}

/**
 * Handle context menu selection
 */
async function handleContextMenuGeminize(info, tab) {
  try {
    const selectionText = info.selectionText;

    // Store selection for popup to use
    await chrome.storage.local.set({ pendingSelection: selectionText });

    // Open popup (not directly possible, so we just store it)
    // User will need to click the extension icon after right-clicking
    console.log('[Geminizer Background] Selection stored for Geminize');

  } catch (error) {
    console.error('[Geminizer Background] Error in handleContextMenuGeminize:', error);
  }
}

/**
 * Validate prompt before execution
 */
function validatePrompt(prompt, url, forceContent) {
  const errors = [];
  const warnings = [];

  if (!prompt || !prompt.content) {
    errors.push('プロンプトが空です');
  }

  if (prompt.usePageContent && !forceContent) {
    warnings.push('ページコンテンツの抽出を試みます');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Build final prompt text from template
 */
function buildPromptText(template, url, title, content) {
  return template
    .replace(/\{\{url\}\}/g, url || '')
    .replace(/\{\{title\}\}/g, title || '')
    .replace(/\{\{content\}\}/g, content || '');
}

/**
 * Handle capture visible tab request
 */
async function handleCaptureVisibleTab(message, sender, sendResponse) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });
    sendResponse({ success: true, imageData: dataUrl });
  } catch (error) {
    console.error('[Geminizer Background] Capture visible tab failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle YouTube image capture
 */
async function handleCaptureYouTubeImage(message, sender, sendResponse) {
  try {
    // The actual capture is done by youtube_image_capture.js content script
    // This just facilitates the communication
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Setup YouTube image context menu
 */
function setupYouTubeImageContextMenu() {
  try {
    // Remove existing context menu items
    chrome.contextMenus.removeAll(() => {
      // Create new context menu
      chrome.contextMenus.create({
        id: 'geminize-youtube-thumbnail',
        title: 'サムネイルから要約',
        contexts: ['page'],
        documentUrlPattern: 'https://www.youtube.com/watch*'
      });

      chrome.contextMenus.create({
        id: 'geminize-youtube-screenshot',
        title: '画面から要約',
        contexts: ['page'],
        documentUrlPattern: 'https://www.youtube.com/watch*'
      });

      chrome.contextMenus.create({
        id: 'geminize-selection',
        title: '選択テキストをGeminiで分析',
        contexts: ['selection']
      });
    });
  } catch (error) {
    console.error('[Geminizer Background] Error setting up context menu:', error);
  }
}

/**
 * Handle YouTube image capture from context menu
 */
async function handleYouTubeImageCapture(tab, imageType) {
  try {
    // Load YouTube summary prompt
    const data = await chrome.storage.local.get('prompts');
    const prompts = data.prompts || [];
    const youtubePrompt = prompts.find(p => p.title.includes('YouTube') || p.title.includes('要約'));

    if (!youtubePrompt) {
      console.error('[Geminizer Background] YouTube summary prompt not found');
      return;
    }

    // Capture image from YouTube page
    chrome.tabs.sendMessage(tab.id, {
      action: 'captureYouTubeImage',
      imageType: imageType
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Geminizer Background] Failed to capture image:', chrome.runtime.lastError);
        return;
      }

      if (response && response.success && response.imageData) {
        // Send to Gemini with image
        handleRunPrompt({
          prompt: youtubePrompt,
          tabId: tab.id,
          tabUrl: tab.url,
          tabTitle: tab.title,
          modelMode: 'thinking',
          autoExecute: true,
          imageDataUrl: response.imageData,
          manualImagePaste: false
        }, () => {});
      }
    });

  } catch (error) {
    console.error('[Geminizer Background] Error in handleYouTubeImageCapture:', error);
  }
}
