// localStorage utility for managing user preferences (username, cursor)

const STORAGE_KEYS = {
  USERNAME: 'iamafk_username',
  DEVICE_ID: 'iamafk_device_id'
} as const;

// Generate a unique device ID
const generateDeviceId = (): string => {
  return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

// Get or create device ID
export const getDeviceId = (): string => {
  try {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error managing device ID:', error);
    // Fallback to session-based ID if localStorage fails
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }
};

// Save username for next session
export const saveUsername = (username: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  } catch (error) {
    console.error('Error saving username to localStorage:', error);
  }
};

// Get saved username
export const getSavedUsername = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
  } catch (error) {
    console.error('Error reading username from localStorage:', error);
    return '';
  }
};

// Get saved cursor type
export const getSavedCursorType = (): string => {
  try {
    // For backward compatibility, just return 'default' if not set
    return localStorage.getItem('iamafk_cursorType') || 'default';
  } catch (error) {
    console.error('Error reading cursor type from preferences:', error);
    return 'default';
  }
};

// Save cursor type
export const saveCursorType = (cursorType: string): void => {
  try {
    localStorage.setItem('iamafk_cursorType', cursorType);
  } catch (error) {
    console.error('Error saving cursor type to localStorage:', error);
  }
}; 