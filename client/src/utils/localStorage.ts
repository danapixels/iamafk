// localStorage utility for managing user preferences (username, cursor)

const STORAGE_KEYS = {
USERNAME: 'iamafk_username',
DEVICE_ID: 'iamafk_device_id'
 as const;

// Save username for next session
export const saveUsername = (username: string): void => {

localStorage.setItem(STORAGE_KEYS.USERNAME, username);

console.error('Error saving username to localStorage:', error);

;

// Get saved username
export const getSavedUsername = (): string => {

return localStorage.getItem(STORAGE_KEYS.USERNAME) || '';

console.error('Error reading username from localStorage:', error);
return '';

;

// Get saved cursor type
export const getSavedCursorType = (): string => {

// For backward compatibility, just return 'default' if not set
return localStorage.getItem('iamafk_cursorType') || 'default';

console.error('Error reading cursor type from preferences:', error);
return 'default';

; 