import { useEffect, useRef  from 'react';

interface AnimationCleanupProps {
hearts: any[];
circles: any[];
emotes: any[];
setHearts: React.Dispatch<React.SetStateAction<any[]>>;
setCircles: React.Dispatch<React.SetStateAction<any[]>>;
setEmotes: React.Dispatch<React.SetStateAction<any[]>>;


export const useAnimationCleanup = ({
setHearts,
setCircles,
setEmotes
: Omit<AnimationCleanupProps, 'hearts' | 'circles' | 'emotes'>) => {
const cleanupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

useEffect(() => {
// Clean up animations every 30 seconds
cleanupIntervalRef.current = setInterval(() => {
const now = Date.now();

// Clean up hearts older than 10 seconds
setHearts(prev => prev.filter(heart => now - heart.timestamp < 10000));

// Clean up circles older than 8 seconds
setCircles(prev => prev.filter(circle => now - circle.timestamp < 8000));

// Clean up emotes older than 6 seconds
setEmotes(prev => prev.filter(emote => now - emote.timestamp < 6000));

// Limit animation history to prevent memory buildup
setHearts(prev => prev.slice(-20)); // Keep only last 20 hearts
setCircles(prev => prev.slice(-15)); // Keep only last 15 circles
setEmotes(prev => prev.slice(-10)); // Keep only last 10 emotes
, 30000); // Run every 30 seconds

const handleVisibilityChange = () => {
if (document.hidden) {
// Clear all animations when tab is hidden
setHearts([]);
setCircles([]);
setEmotes([]);

;

document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('focus', handleVisibilityChange);

return () => {
if (cleanupIntervalRef.current) {
clearInterval(cleanupIntervalRef.current);

document.removeEventListener('visibilitychange', handleVisibilityChange);
window.removeEventListener('focus', handleVisibilityChange);
;
, [setHearts, setCircles, setEmotes]);
; 