import { useEffect, useRef  from 'react';
import { Socket  from 'socket.io-client';

export const useConfetti = (
socketRef: React.RefObject<Socket | null>,
setShowConfetti: (show: boolean) => void,
setConfettiTimestamp?: (timestamp: number | null) => void,
setGachaponWinner?: (winner: string | null) => void
) => {
const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// socket listener for gachapon win
useEffect(() => {
if (!socketRef.current) return;

const socket = socketRef.current;

const handleGachaponWin = (data: { winnerId: string, winnerName: string ) => {
if (setGachaponWinner) {
setGachaponWinner(data.winnerName);


// clears any existing confetti timeout
if (confettiTimeoutRef.current) {
clearTimeout(confettiTimeoutRef.current);
confettiTimeoutRef.current = null;


// shows confetti immediately
setShowConfetti(true);
if (setConfettiTimestamp) {
setConfettiTimestamp(Date.now());


// removes confetti after animation finishes (confetti.gif duration)
confettiTimeoutRef.current = setTimeout(() => {
setShowConfetti(false);
if (setConfettiTimestamp) {
setConfettiTimestamp(null);

confettiTimeoutRef.current = null;
, 3000); // confetti.gif is 3 seconds

// sets localStorage for gachapon button state
localStorage.setItem('gachaponWin', 'true');
localStorage.setItem('gachaponWinner', data.winnerName);
localStorage.setItem('gachaponButtonChanged', 'true');
;

const handleFurnitureGachaponWin = () => {
// clears any existing confetti timeout
if (confettiTimeoutRef.current) {
clearTimeout(confettiTimeoutRef.current);
confettiTimeoutRef.current = null;


// shows confetti immediately
setShowConfetti(true);
if (setConfettiTimestamp) {
setConfettiTimestamp(Date.now());


// removes confetti after animation finishes
confettiTimeoutRef.current = setTimeout(() => {
setShowConfetti(false);
if (setConfettiTimestamp) {
setConfettiTimestamp(null);

confettiTimeoutRef.current = null;
, 3000);
;

socket.on('gachaponWin', handleGachaponWin);
socket.on('furnitureGachaponWin', handleFurnitureGachaponWin);

return () => {
socket.off('gachaponWin', handleGachaponWin);
socket.off('furnitureGachaponWin', handleFurnitureGachaponWin);
// clears pending timeout on cleanup
if (confettiTimeoutRef.current) {
clearTimeout(confettiTimeoutRef.current);
confettiTimeoutRef.current = null;

;
, [socketRef.current?.connected, setGachaponWinner, setShowConfetti, setConfettiTimestamp]);

// updates confettiTimestamp whenever showConfetti is set to true
useEffect(() => {
, []);

return { confettiTimeoutRef ;
; 