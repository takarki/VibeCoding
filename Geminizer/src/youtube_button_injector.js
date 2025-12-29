// YouTube Button Injector - Adds summary button to YouTube pages
// Runs on youtube.com/watch pages

console.log('[Geminizer YouTube] Button injector loaded');

// Inject button when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Wait for YouTube player to be ready
  waitForYouTubePlayer().then(() => {
    injectSummaryButton();
    setupNavigationListener();
  });
}

/**
 * Wait for YouTube player to be ready
 */
function waitForYouTubePlayer(maxWait = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkPlayer = () => {
      const player = document.querySelector('#movie_player, ytd-player');
      
      if (player) {
        resolve(player);
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error('YouTube player not found'));
      } else {
        setTimeout(checkPlayer, 100);
      }
    };
    
    checkPlayer();
  });
}

/**
 * Inject summary button into YouTube interface
 */
function injectSummaryButton() {
  // Check if button already exists
  if (document.getElementById('geminizer-summary-btn')) {
    console.log('[Geminizer YouTube] Button already exists');
    return;
  }

  console.log('[Geminizer YouTube] Injecting summary button...');

  // Find the right place to inject button
  const targetSelectors = [
    '#top-level-buttons-computed',
    'ytd-menu-renderer.ytd-video-primary-info-renderer',
    '#actions',
    '.ytd-video-primary-info-renderer'
  ];

  let targetContainer = null;
  for (const selector of targetSelectors) {
    targetContainer = document.querySelector(selector);
    if (targetContainer) {
      console.log('[Geminizer YouTube] Found container:', selector);
      break;
    }
  }

  if (!targetContainer) {
    console.warn('[Geminizer YouTube] Could not find target container for button');
    return;
  }

  // Create button
  const button = createSummaryButton();
  
  // Insert button
  if (targetContainer.firstChild) {
    targetContainer.insertBefore(button, targetContainer.firstChild);
  } else {
    targetContainer.appendChild(button);
  }

  console.log('[Geminizer YouTube] Button injected successfully');
}

/**
 * Create summary button element
 */
function createSummaryButton() {
  const button = document.createElement('button');
  button.id = 'geminizer-summary-btn';
  button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m';
  button.setAttribute('aria-label', 'Geminiで要約');
  button.style.cssText = `
    margin-right: 8px;
    padding: 0 16px;
    height: 36px;
    border-radius: 18px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-family: "YouTube Sans", "Roboto", sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  `;

  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.72c0 4.34-3 8.41-8 9.5-5-1.09-8-5.16-8-9.5V7.78l8-3.6zM11 7v2H9v2h2v2h2v-2h2V9h-2V7h-2z"/>
    </svg>
    <span>要約</span>
  `;

  // Hover effect
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  });

  // Click handler
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await handleSummaryButtonClick();
  });

  return button;
}

/**
 * Handle summary button click
 */
async function handleSummaryButtonClick() {
  console.log('[Geminizer YouTube] Summary button clicked');

  try {
    // Show loading state
    const button = document.getElementById('geminizer-summary-btn');
    const originalContent = button.innerHTML;
    button.innerHTML = '<span>処理中...</span>';
    button.disabled = true;

    // Get video info
    const videoId = getVideoId();
    const videoTitle = getVideoTitle();
    const videoUrl = window.location.href;

    // Load YouTube summary prompt
    const data = await chrome.storage.local.get('prompts');
    const prompts = data.prompts || [];
    const youtubePrompt = prompts.find(p => 
      p.title.includes('YouTube') || 
      p.title.includes('要約')
    );

    if (!youtubePrompt) {
      alert('YouTube要約プロンプトが見つかりません。設定を確認してください。');
      button.innerHTML = originalContent;
      button.disabled = false;
      return;
    }

    // Send message to background to execute prompt
    chrome.runtime.sendMessage({
      action: 'runPrompt',
      prompt: youtubePrompt,
      tabId: await getCurrentTabId(),
      tabUrl: videoUrl,
      tabTitle: videoTitle,
      modelMode: 'thinking',
      autoExecute: true
    }, (response) => {
      // Reset button
      button.innerHTML = originalContent;
      button.disabled = false;

      if (response && response.success) {
        showNotification('Geminiで要約を開始しました', 'success');
      } else {
        showNotification('要約の実行に失敗しました', 'error');
      }
    });

  } catch (error) {
    console.error('[Geminizer YouTube] Error handling button click:', error);
    showNotification('エラーが発生しました: ' + error.message, 'error');
    
    // Reset button
    const button = document.getElementById('geminizer-summary-btn');
    button.disabled = false;
  }
}

/**
 * Get current tab ID
 */
async function getCurrentTabId() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getCurrentTabId' }, (response) => {
      resolve(response?.tabId);
    });
  });
}

/**
 * Get YouTube video ID
 */
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v') || '';
}

/**
 * Get YouTube video title
 */
function getVideoTitle() {
  const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer, h1 yt-formatted-string');
  return titleElement ? titleElement.textContent.trim() : document.title.replace(' - YouTube', '');
}

/**
 * Setup navigation listener to re-inject button on YouTube SPA navigation
 */
function setupNavigationListener() {
  let lastUrl = location.href;
  
  // Use MutationObserver to detect URL changes
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      
      if (currentUrl.includes('youtube.com/watch')) {
        console.log('[Geminizer YouTube] Navigation detected, re-injecting button');
        setTimeout(() => {
          injectSummaryButton();
        }, 1000);
      }
    }
  }).observe(document.querySelector('ytd-app'), {
    subtree: true,
    childList: true
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
