// Full Page Capture - Captures full page screenshots
// Runs on pages where screenshot capture is requested

console.log('[Geminizer Full Page Capture] Script loaded');

(function() {
  'use strict';

  // Start capture immediately when script is injected
  startFullPageCapture();

  /**
   * Start full page screenshot capture
   */
  async function startFullPageCapture() {
    console.log('[Geminizer Full Page Capture] Starting full page capture...');

    try {
      // Get page dimensions
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      console.log('[Geminizer Full Page Capture] Page dimensions:', {
        scrollHeight,
        viewportHeight,
        viewportWidth
      });

      // Calculate number of screenshots needed
      const numScreenshots = Math.ceil(scrollHeight / viewportHeight);
      console.log('[Geminizer Full Page Capture] Will capture', numScreenshots, 'screenshots');

      // Store screenshots
      const screenshots = [];
      
      // Save current scroll position
      const originalScrollY = window.scrollY;

      // Scroll to top
      window.scrollTo(0, 0);
      await sleep(300);

      // Capture screenshots by scrolling
      for (let i = 0; i < numScreenshots; i++) {
        const scrollY = i * viewportHeight;
        
        // Scroll to position
        window.scrollTo(0, scrollY);
        await sleep(200); // Wait for scroll and render

        console.log(`[Geminizer Full Page Capture] Capturing screenshot ${i + 1}/${numScreenshots} at y=${scrollY}`);

        // Request screenshot from background
        const dataUrl = await requestScreenshot(i);
        
        if (dataUrl) {
          screenshots.push({
            index: i,
            y: scrollY,
            dataUrl: dataUrl
          });
        } else {
          console.warn(`[Geminizer Full Page Capture] Screenshot ${i} failed`);
        }
      }

      // Restore scroll position
      window.scrollTo(0, originalScrollY);

      console.log('[Geminizer Full Page Capture] Captured', screenshots.length, 'screenshots');

      // Send screenshots to background/popup for combining
      chrome.runtime.sendMessage({
        action: 'combineScreenshots',
        screenshots: screenshots,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        scrollHeight: scrollHeight
      });

    } catch (error) {
      console.error('[Geminizer Full Page Capture] Error during capture:', error);
      
      // Send error message
      chrome.runtime.sendMessage({
        action: 'captureError',
        error: error.message
      });
    }
  }

  /**
   * Request screenshot from background script
   */
  function requestScreenshot(index) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Screenshot request timeout'));
        }
      }, 5000);

      // Set up listener for response
      const listener = (message, sender, sendResponse) => {
        if (message.action === 'captureScreenResponse' && message.index === index) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            chrome.runtime.onMessage.removeListener(listener);
            
            if (message.error) {
              reject(new Error(message.error));
            } else {
              resolve(message.dataUrl);
            }
          }
        }
      };

      chrome.runtime.onMessage.addListener(listener);

      // Request screenshot
      chrome.runtime.sendMessage({
        action: 'captureScreenRequest',
        index: index
      }).catch(error => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          chrome.runtime.onMessage.removeListener(listener);
          reject(error);
        }
      });
    });
  }

  /**
   * Sleep helper
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

})();
