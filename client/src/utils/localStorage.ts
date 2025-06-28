// localStorage utility for managing user preferences (username, cursor)

const STORAGE_KEYS = {
USERNAME: 'iamafk_username',
DEVICE_ID: 'iamafk_device_id'
 as const;

// Generate a unique device ID
const generateDeviceId = (): string => {
return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
;

// Get or create device ID
export const getDeviceId = (): string => {

let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
if (!deviceId) {
deviceId = generateDeviceId();
localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);

return deviceId;

console.error('Error managing device ID:', error);
// Fallback to session-based ID if localStorage fails
return 'session_' + Math.random().toString(36).substr(2, 9);

;

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