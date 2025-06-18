// localStorage utility for managing user data locally

export interface UserStats {
  username: string;
  deviceId: string;
  totalAFKTime: number; // Total AFK time in seconds (never deducted)
  afkBalance: number; // Spendable AFK balance in seconds (gets deducted)
  furniturePlaced: number; // Total furniture items placed
  furnitureByType: { [type: string]: number }; // Breakdown by furniture type
  lastSeen: number; // Last activity timestamp
  firstSeen: number; // First connection timestamp
  sessions: number; // Number of sessions
  currentSessionStart?: number; // Current session start time
}

export interface LocalUserData {
  stats: UserStats;
  preferences: {
    cursorType: string;
    lastUsername: string;
  };
}

const STORAGE_KEYS = {
  USER_DATA: 'iamafk_user_data',
  USERNAME: 'iamafk_username',
  DEVICE_ID: 'iamafk_device_id'
} as const;

// Generate or get unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
};

// Initialize default user stats
const createDefaultStats = (username: string): UserStats => ({
  username,
  deviceId: getDeviceId(), // Add device ID to stats
  totalAFKTime: 0,
  afkBalance: 0,
  furniturePlaced: 0,
  furnitureByType: {},
  lastSeen: Date.now(),
  firstSeen: Date.now(),
  sessions: 1,
  currentSessionStart: Date.now()
});

// Get user data from localStorage
export const getUserData = (): LocalUserData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (data) {
      const parsedData = JSON.parse(data);
      // Migrate old data to include afkBalance if missing
      if (parsedData.stats && typeof parsedData.stats.afkBalance === 'undefined') {
        parsedData.stats.afkBalance = parsedData.stats.totalAFKTime || 0;
        saveUserData(parsedData);
      }
      return parsedData;
    }
    return null;
  } catch (error) {
    console.error('Error reading user data from localStorage:', error);
    return null;
  }
};

// Save user data to localStorage
export const saveUserData = (data: LocalUserData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }
};

// Initialize or get user data
export const initializeUserData = (username: string): LocalUserData => {
  const existingData = getUserData();
  const currentDeviceId = getDeviceId();
  
  if (existingData && existingData.stats.deviceId === currentDeviceId) {
    // Update existing user data from the same device, regardless of username change
    const updatedStats = {
      ...existingData.stats,
      username, // Update to new username
      lastSeen: Date.now(),
      sessions: existingData.stats.sessions + 1,
      currentSessionStart: Date.now()
    };
    
    const updatedData: LocalUserData = {
      stats: updatedStats,
      preferences: {
        ...existingData.preferences,
        lastUsername: username
      }
    };
    
    saveUserData(updatedData);
    return updatedData;
  } else {
    // Create new user data if no existing data found or different device
    const newData: LocalUserData = {
      stats: createDefaultStats(username),
      preferences: {
        cursorType: 'default',
        lastUsername: username
      }
    };
    
    saveUserData(newData);
    return newData;
  }
};

// Update AFK time (adds to both total and balance)
export const updateAFKTime = (afkTimeSeconds: number): void => {
  const userData = getUserData();
  if (userData) {
    userData.stats.totalAFKTime += afkTimeSeconds;
    userData.stats.afkBalance += afkTimeSeconds;
    userData.stats.lastSeen = Date.now();
    saveUserData(userData);
  }
};

// Deduct from AFK balance (for gachapon machine)
export const deductAFKBalance = (deductSeconds: number): boolean => {
  const userData = getUserData();
  if (userData && userData.stats.afkBalance >= deductSeconds) {
    userData.stats.afkBalance -= deductSeconds;
    userData.stats.lastSeen = Date.now();
    saveUserData(userData);
    return true;
  } else {
    return false;
  }
};

// Record furniture placement
export const recordFurniturePlacement = (furnitureType: string): void => {
  const userData = getUserData();
  if (userData) {
    userData.stats.furniturePlaced += 1;
    userData.stats.furnitureByType[furnitureType] = 
      (userData.stats.furnitureByType[furnitureType] || 0) + 1;
    userData.stats.lastSeen = Date.now();
    saveUserData(userData);
  }
};

// Update cursor preference
export const updateCursorPreference = (cursorType: string): void => {
  const userData = getUserData();
  if (userData) {
    userData.preferences.cursorType = cursorType;
    saveUserData(userData);
  }
};

// Get user stats
export const getUserStats = (): UserStats | null => {
  const userData = getUserData();
  return userData?.stats || null;
};

// Get user preferences
export const getUserPreferences = (): { cursorType: string; lastUsername: string } | null => {
  const userData = getUserData();
  return userData?.preferences || null;
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
    const userData = getUserData();
    return userData?.preferences.cursorType || 'default';
  } catch (error) {
    console.error('Error reading cursor type from preferences:', error);
    return 'default';
  }
};

// Clear all user data (for testing or reset purposes)
export const clearUserData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
  } catch (error) {
    console.error('Error clearing user data from localStorage:', error);
  }
};

// Export user data for debugging/testing (logs to console)
export const exportUserData = (): void => {
  const userData = getUserData();
  if (userData) {
    console.log('User Data:', userData);
  } else {
    console.log('No user data found');
  }
};

// Set AFK time for testing purposes
export const setAFKTimeForTesting = (afkTimeSeconds: number): void => {
  const userData = getUserData();
  if (userData) {
    userData.stats.totalAFKTime = afkTimeSeconds;
    userData.stats.afkBalance = afkTimeSeconds;
    userData.stats.lastSeen = Date.now();
    saveUserData(userData);
  }
};

// Format time for display
export const formatTotalTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}; 