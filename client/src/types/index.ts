import { Socket  from 'socket.io-client';

// Cursor related types
export interface CursorData {
x: number;
y: number;
name?: string;
stillTime: number;
cursorType?: string;
isFrozen?: boolean;
frozenPosition?: { x: number; y: number ;
sleepingOnBed?: boolean;


export interface CursorsMap {
[socketId: string]: CursorData;


// Effect types
export interface Heart {
id: string;
x: number;
y: number;
timestamp: number;


export interface Circle {
id: string;
x: number;
y: number;
timestamp: number;


export interface Emote {
id: string;
x: number;
y: number;
timestamp: number;
type: string;


// Furniture types
export interface Furniture {
id: string;
type: string;
x: number;
y: number;
zIndex?: number;
isFlipped?: boolean;


// Panel props
export interface PanelProps {
socket: Socket | null;
onCursorChange: (type: string) => void;
cursorPosition?: CursorData;
viewportOffset: { x: number; y: number ;
style?: React.CSSProperties;


// Mouse state
export interface MouseState {
isDraggingFurniture: boolean;
isDraggingViewport: boolean;
lastX: number;
lastY: number;
lastEvent: MouseEvent | null;


// Viewport types
export interface ViewportOffset {
x: number;
y: number;


export interface DragPosition {
x: number;
y: number;
 