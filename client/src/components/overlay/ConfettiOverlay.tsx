import React from 'react';

interface ConfettiOverlayProps {
showConfetti: boolean;
confettiTimestamp: number | null;


export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ showConfetti, confettiTimestamp ) => {
if (!showConfetti) return null;

return (
<>
{/* Left confetti */
<div
style={{
position: 'fixed',
left: 0,
bottom: '20vh',
width: '200px',
height: '60vh',
zIndex: 999999,
pointerEvents: 'none',
display: 'flex',
alignItems: 'flex-end',
justifyContent: 'flex-start'

>
<img
src={`./UI/confetti.gif${confettiTimestamp ? `?t=${confettiTimestamp` : ''`
alt="Confetti"
style={{
width: '200px',
height: 'auto',
maxHeight: '60vh'

onLoad={() => {
// Confetti loaded successfully

onError={(e) => {
console.error('Left confetti GIF failed to load:', e);

/>
</div>

{/* Right confetti */
<div
style={{
position: 'fixed',
right: 0,
bottom: '20vh',
width: '200px',
height: '60vh',
zIndex: 999999,
pointerEvents: 'none',
display: 'flex',
alignItems: 'flex-end',
justifyContent: 'flex-end'

>
<img
src={`./UI/confetti.gif${confettiTimestamp ? `?t=${confettiTimestamp` : ''`
alt="Confetti"
style={{
width: '200px',
height: 'auto',
maxHeight: '60vh',
transform: 'scaleX(-1)' // Flip horizontally for variety

onLoad={() => {
// Confetti loaded successfully

onError={(e) => {
console.error('Right confetti GIF failed to load:', e);

/>
</div>
</>
);
; 