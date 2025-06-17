import { CANVAS_SIZE  from '../constants';

// Helper function to convert screen coordinates to canvas coordinates
export const screenToCanvas = (screenX: number, screenY: number, viewportOffset: { x: number; y: number ) => {
return {
x: screenX + viewportOffset.x,
y: screenY + viewportOffset.y
;
;

// Helper function to convert canvas coordinates to screen coordinates
export const canvasToScreen = (canvasX: number, canvasY: number, viewportOffset: { x: number; y: number ) => {
return {
x: canvasX - viewportOffset.x,
y: canvasY - viewportOffset.y
;
;

// Helper function to clamp coordinates within canvas bounds
export const clampToCanvas = (x: number, y: number) => {
return {
x: Math.max(0, Math.min(CANVAS_SIZE, x)),
y: Math.max(0, Math.min(CANVAS_SIZE, y))
;
;

// Helper function to check if an element is visible in the current viewport
export const isElementVisible = (
x: number, 
y: number, 
viewportOffset: { x: number; y: number ,
buffer: number = 100
) => {
const visibleBounds = {
left: viewportOffset.x - buffer,
right: viewportOffset.x + window.innerWidth + buffer,
top: viewportOffset.y - buffer,
bottom: viewportOffset.y + window.innerHeight + buffer
;

return x >= visibleBounds.left && 
 x <= visibleBounds.right && 
 y >= visibleBounds.top && 
 y <= visibleBounds.bottom;
;

// Helper function to format time for display
export const formatTime = (seconds: number) => {
const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const secs = seconds % 60;

if (hours > 0) {
return `${hours:${minutes.toString().padStart(2, '0'):${secs.toString().padStart(2, '0')`;
 else {
return `${minutes:${secs.toString().padStart(2, '0')`;

; 