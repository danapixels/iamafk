// localStorage utility for user preferences (username, cursor, device ID)

const STORAGE_KEYS = {
  USERNAME: 'iamafk_username',
  DEVICE_ID: 'iamafk_device_id'
} as const;

// generates a unique device ID
const generateDeviceId = (): string => {
  return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

// gets or creates device ID
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
    // fallback to session-based ID if localStorage fails
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }
};

// saves username for next session
export const saveUsername = (username: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  } catch (error) {
    console.error('Error saving username to localStorage:', error);
  }
};

// gets saved username
export const getSavedUsername = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
  } catch (error) {
    console.error('Error reading username from localStorage:', error);
    return '';
  }
};

// gets saved cursor type
export const getSavedCursorType = (): string => {
  try {
    // returns 'default' if not set
    return localStorage.getItem('iamafk_cursorType') || 'default';
  } catch (error) {
    console.error('Error reading cursor type from preferences:', error);
    return 'default';
  }
};

// saves cursor type
export const saveCursorType = (cursorType: string): void => {
  try {
    localStorage.setItem('iamafk_cursorType', cursorType);
  } catch (error) {
    console.error('Error saving cursor type to localStorage:', error);
  }
}; 