// YouTube Image Capture - YouTubeのサムネイルや再生画面から画像をキャプチャして要約
// Runs on youtube.com pages

console.log('[Geminizer YouTube Image Capture] Script loaded');

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureYouTubeImage') {
    captureYouTubeImage(message.imageType).then(imageData => {
      sendResponse({ success: true, imageData });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

/**
 * Capture YouTube image for summary
 * @param {string} imageType - 'thumbnail' or 'screenshot'
 */
async function captureYouTubeImage(imageType = 'thumbnail') {
  try {
    if (imageType === 'thumbnail') {
      return await captureThumbnail();
    } else if (imageType === 'screenshot') {
      return await captureScreenshot();
    } else {
      throw new Error('Invalid image type: ' + imageType);
    }
  } catch (error) {
    console.error('[Geminizer YouTube Image Capture] Error:', error);
    throw error;
  }
}

/**
 * Capture video thumbnail
 */
async function captureThumbnail() {
  console.log('[Geminizer YouTube Image Capture] Capturing thumbnail...');

  try {
    // Find thumbnail image
    const thumbnailSelectors = [
      'img.style-scope.yt-img-shadow',
      'img[alt*="動画"]',
      'img.yt-core-attributed-string',
      'img#movie_player',
      '.html5-video-canvas'
    ];

    let imageElement = null;
    for (const selector of thumbnailSelectors) {
      imageElement = document.querySelector(selector);
      if (imageElement && imageElement.src) {
        break;
      }
    }

    // If not found, try getting from video element
    if (!imageElement) {
      const videoElement = document.querySelector('video');
      if (videoElement) {
        return await captureVideoFrame(videoElement);
      }
    }

    if (!imageElement || !imageElement.src) {
      // Fallback: capture current visible area
      return await captureVisibleArea();
    }

    // Convert image to data URL
    const imageUrl = imageElement.src;
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return await blobToDataUrl(blob);

  } catch (error) {
    console.error('[Geminizer YouTube Image Capture] Error capturing thumbnail:', error);
    // Fallback to screenshot
    return await captureVisibleArea();
  }
}

/**
 * Capture current screenshot
 */
async function captureScreenshot() {
  console.log('[Geminizer YouTube Image Capture] Capturing screenshot...');

  try {
    return await captureVisibleArea();
  } catch (error) {
    console.error('[Geminizer YouTube Image Capture] Error capturing screenshot:', error);
    throw error;
  }
}

/**
 * Capture video frame from video element
 */
async function captureVideoFrame(videoElement) {
  console.log('[Geminizer YouTube Image Capture] Capturing video frame...');

  return new Promise((resolve, reject) => {
    try {
      // Create canvas and copy video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 1280;
      canvas.height = videoElement.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Capture visible area via background script
 */
async function captureVisibleArea() {
  console.log('[Geminizer YouTube Image Capture] Requesting screenshot from background...');

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'captureVisibleTab' },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.imageData) {
          resolve(response.imageData);
        } else {
          reject(new Error('Failed to capture screenshot'));
        }
      }
    );
  });
}

/**
 * Convert blob to data URL
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Add context menu for image capture
chrome.runtime.sendMessage({ action: 'setupImageContextMenu' });
