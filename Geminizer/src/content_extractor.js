// Content Extractor - Extracts content from web pages
// Runs on target pages (YouTube, articles, etc.)

console.log('[Geminizer Content Extractor] Script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractContent') {
    extractContent().then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ content: '', error: error.message });
    });
    return true; // Keep channel open for async response
  }

  return false;
});

/**
 * Extract content from current page
 */
async function extractContent() {
  const url = window.location.href;
  
  // YouTube video page
  if (url.includes('youtube.com/watch')) {
    return await extractYouTubeContent();
  }
  
  // Generic web page
  return await extractGenericContent();
}

/**
 * Extract YouTube video content including captions
 */
async function extractYouTubeContent() {
  console.log('[Geminizer Content Extractor] Extracting YouTube content...');
  
  try {
    const videoId = getYouTubeVideoId();
    const title = document.title.replace(' - YouTube', '');
    const url = window.location.href;
    
    // Try to get captions/transcript
    const captions = await getYouTubeCaptions();
    
    // Get video description
    const description = getYouTubeDescription();
    
    // Build content
    let content = `【動画情報】\n`;
    content += `タイトル: ${title}\n`;
    content += `URL: ${url}\n`;
    content += `動画ID: ${videoId}\n\n`;
    
    if (description) {
      content += `【説明】\n${description}\n\n`;
    }
    
    if (captions) {
      content += `【文字起こし】\n${captions}`;
    } else {
      content += `※文字起こしは利用できません`;
    }
    
    return { content };
    
  } catch (error) {
    console.error('[Geminizer Content Extractor] Error extracting YouTube content:', error);
    return { content: '', error: error.message };
  }
}

/**
 * Get YouTube video ID from URL
 */
function getYouTubeVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v') || '';
}

/**
 * Get YouTube video description
 */
function getYouTubeDescription() {
  try {
    // Try multiple selectors for description
    const selectors = [
      '#description-inline-expander',
      'ytd-text-inline-expander#description-inline-expander',
      '#description',
      '.description'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }
    
    return '';
  } catch (error) {
    console.warn('[Geminizer Content Extractor] Failed to get description:', error);
    return '';
  }
}

/**
 * Get YouTube captions/transcript
 */
async function getYouTubeCaptions() {
  try {
    // Look for transcript button
    const transcriptButtons = [
      'button[aria-label*="文字起こし"]',
      'button[aria-label*="transcript"]',
      '[aria-label*="Show transcript"]'
    ];
    
    for (const selector of transcriptButtons) {
      const button = document.querySelector(selector);
      if (button) {
        // Click to open transcript
        button.click();
        
        // Wait for transcript to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extract transcript text
        const transcriptElements = document.querySelectorAll(
          'ytd-transcript-segment-renderer, [class*="transcript"]'
        );
        
        if (transcriptElements.length > 0) {
          const transcript = Array.from(transcriptElements)
            .map(el => el.textContent.trim())
            .filter(text => text.length > 0)
            .join('\n');
          
          // Close transcript panel
          button.click();
          
          return transcript;
        }
      }
    }
    
    // If no transcript button found, try alternative methods
    return await getCaptionsFromAPI();
    
  } catch (error) {
    console.warn('[Geminizer Content Extractor] Failed to get captions:', error);
    return '';
  }
}

/**
 * Try to get captions from YouTube API or data
 */
async function getCaptionsFromAPI() {
  try {
    // This would require access to YouTube's internal data
    // For now, return empty string
    // In a full implementation, this could try to fetch caption files
    return '';
  } catch (error) {
    return '';
  }
}

/**
 * Extract content from generic web page
 */
async function extractGenericContent() {
  console.log('[Geminizer Content Extractor] Extracting generic content...');
  
  try {
    const title = document.title;
    const url = window.location.href;
    
    // Get main content
    const mainContent = getMainContent();
    
    // Get meta description
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    
    // Build content
    let content = `【ページ情報】\n`;
    content += `タイトル: ${title}\n`;
    content += `URL: ${url}\n\n`;
    
    if (metaDescription) {
      content += `【概要】\n${metaDescription}\n\n`;
    }
    
    if (mainContent) {
      content += `【本文】\n${mainContent}`;
    }
    
    return { content };
    
  } catch (error) {
    console.error('[Geminizer Content Extractor] Error extracting content:', error);
    return { content: '', error: error.message };
  }
}

/**
 * Get main content from page
 */
function getMainContent() {
  // Try common content selectors
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '#content',
    '.content'
  ];
  
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return cleanText(element.textContent);
    }
  }
  
  // Fallback to body
  return cleanText(document.body.textContent);
}

/**
 * Clean and format extracted text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim()
    .substring(0, 50000); // Limit to 50k characters
}
