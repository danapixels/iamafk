import { SERVER_CONFIG  from '../constants';

// helper to get the highest AFK player
export const getHighestAFKPlayer = (cursors: { [key: string]: any ) => {
let highestAFK = { name: '', time: 0 ;
Object.entries(cursors).forEach(([_, cursor]) => {
if (!cursor) return;
if (cursor.stillTime > highestAFK.time && cursor.name && cursor.name !== SERVER_CONFIG.ANONYMOUS_NAME) {
highestAFK = { name: cursor.name, time: cursor.stillTime ;

);
return highestAFK;
;

// helper to format time for display (hh:mm:ss, mm:ss, or ss)
export function formatTime(seconds: number): string {
const days = Math.floor(seconds / (24 * 3600));
seconds %= 24 * 3600;
const hours = Math.floor(seconds / 3600);
seconds %= 3600;
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;

let result = '';
if (days > 0) result += `${daysd `;
if (hours > 0 || days > 0) result += `${hoursh `;
if (mins > 0 || hours > 0 || days > 0) result += `${minsm `;
result += `${secss`;
return result.trim();
 