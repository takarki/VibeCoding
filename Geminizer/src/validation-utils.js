// Validation Utilities for Geminizer Extension

/**
 * Validate prompt before execution
 */
export function validatePrompt(prompt, url, content) {
  const errors = [];
  const warnings = [];

  // Check if prompt exists
  if (!prompt) {
    errors.push('プロンプトが指定されていません');
    return { isValid: false, errors, warnings };
  }

  // Check if prompt has content
  if (!prompt.content || prompt.content.trim() === '') {
    errors.push('プロンプトの内容が空です');
  }

  // Check if prompt has title
  if (!prompt.title || prompt.title.trim() === '') {
    warnings.push('プロンプトにタイトルがありません');
  }

  // Check if URL is required but missing
  if (prompt.content.includes('{{url}}') && !url) {
    warnings.push('URLが必要ですが取得できませんでした');
  }

  // Check if content is required but missing
  if (prompt.usePageContent && prompt.content.includes('{{content}}') && !content) {
    warnings.push('ページコンテンツが必要ですが取得できませんでした');
  }

  // Check content length
  if (content && content.length > 100000) {
    warnings.push('コンテンツが非常に長いため、処理に時間がかかる可能性があります');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate URL
 */
export function validateUrl(url) {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URLが空です' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: '無効なURLです' };
  }
}

/**
 * Validate shortcut key format
 */
export function validateShortcutKey(shortcutKey) {
  if (!shortcutKey || shortcutKey.trim() === '') {
    return { isValid: true }; // Empty is valid (no shortcut)
  }

  // Check format: Modifier+Key or Modifier+Modifier+Key
  const parts = shortcutKey.split('+');
  
  if (parts.length < 2) {
    return {
      isValid: false,
      error: 'ショートカットキーには最低1つの修飾キー（Ctrl, Alt, Shift）が必要です'
    };
  }

  const validModifiers = ['Ctrl', 'Command', 'Alt', 'Shift'];
  const modifiers = parts.slice(0, -1);
  const key = parts[parts.length - 1];

  // Check if all modifiers are valid
  for (const modifier of modifiers) {
    if (!validModifiers.includes(modifier)) {
      return {
        isValid: false,
        error: `無効な修飾キー: ${modifier}`
      };
    }
  }

  // Check if key is not empty
  if (!key || key.trim() === '') {
    return {
      isValid: false,
      error: 'キーが指定されていません'
    };
  }

  return { isValid: true };
}

/**
 * Validate model mode
 */
export function validateModelMode(mode) {
  const validModes = ['fast', 'thinking', 'pro'];
  
  if (!mode) {
    return { isValid: true, mode: 'fast' }; // Default to fast
  }

  if (!validModes.includes(mode)) {
    return {
      isValid: false,
      error: `無効なモード: ${mode}`
    };
  }

  return { isValid: true, mode };
}

/**
 * Sanitize text input
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

/**
 * Validate content mode
 */
export function validateContentMode(mode) {
  const validModes = ['url', 'text', 'capture'];
  
  if (!mode) {
    return { isValid: true, mode: 'url' }; // Default to url
  }

  if (!validModes.includes(mode)) {
    return {
      isValid: false,
      error: `無効なモード: ${mode}`
    };
  }

  return { isValid: true, mode };
}
