// Storage Utilities for Geminizer Extension
// Handles chrome.storage operations with error handling

/**
 * Check if error is a storage quota error
 */
export function checkStorageError(error) {
  if (chrome.runtime.lastError) {
    const lastError = chrome.runtime.lastError.message;
    if (lastError.includes('quota') || lastError.includes('Quota') || lastError.includes('QUOTA_BYTES_PER_ITEM')) {
      return true;
    }
  }
  if (error && error.message) {
    const errorMsg = error.message;
    if (errorMsg.includes('quota') || errorMsg.includes('Quota') || errorMsg.includes('QUOTA_BYTES_PER_ITEM')) {
      return true;
    }
  }
  return false;
}

/**
 * Safely set storage with quota handling
 * Automatically clears and retries on quota errors
 */
export async function safeSetStorage(data) {
  try {
    await chrome.storage.local.set(data);
  } catch (error) {
    console.error('[Storage Utils] Error setting storage:', error);
    
    // Check if it's a quota error
    if (checkStorageError(error)) {
      console.warn('[Storage Utils] Quota error detected, clearing storage and retrying...');
      try {
        await chrome.storage.local.clear();
        await chrome.storage.local.set(data);
        console.log('[Storage Utils] Successfully saved after clearing storage');
      } catch (retryError) {
        console.error('[Storage Utils] Error after clearing storage:', retryError);
        throw retryError;
      }
    } else {
      throw error;
    }
  }
}

/**
 * Get storage data with default values
 */
export async function getStorage(keys, defaults = {}) {
  try {
    const data = await chrome.storage.local.get(keys);
    
    // Apply defaults for missing keys
    if (typeof keys === 'object' && !Array.isArray(keys)) {
      return { ...keys, ...data };
    }
    
    return { ...defaults, ...data };
  } catch (error) {
    console.error('[Storage Utils] Error getting storage:', error);
    return defaults;
  }
}

/**
 * Remove storage items
 */
export async function removeStorage(keys) {
  try {
    await chrome.storage.local.remove(keys);
  } catch (error) {
    console.error('[Storage Utils] Error removing storage:', error);
    throw error;
  }
}

/**
 * Clear all storage
 */
export async function clearStorage() {
  try {
    await chrome.storage.local.clear();
    console.log('[Storage Utils] Storage cleared');
  } catch (error) {
    console.error('[Storage Utils] Error clearing storage:', error);
    throw error;
  }
}

/**
 * Get storage usage info
 */
export async function getStorageInfo() {
  try {
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB default
    
    return {
      bytesInUse,
      quota,
      percentUsed: (bytesInUse / quota) * 100,
      available: quota - bytesInUse
    };
  } catch (error) {
    console.error('[Storage Utils] Error getting storage info:', error);
    return null;
  }
}
