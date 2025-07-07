import { useEffect, useRef, useState  from 'react';
import { Socket  from 'socket.io-client';
import './App.css';
import Panel from './components/ui/Panel';
import FurniturePanel from './components/ui/FurniturePanel';
import FurniturePresetPanel from './components/ui/FurniturePresetPanel';
import GachaponMachine from './components/game/GachaponMachine';
import FurnitureGachaponMachine from './components/game/FurnitureGachaponMachine';
import { AFKTimeDisplay  from './components/ui/AFKTimeDisplay';
import { Logo  from './components/ui/Logo';
import { ConfettiOverlay  from './components/overlay/ConfettiOverlay';
import { DialogBanner  from './components/overlay/DialogBanner';
import ConnectionModal from './components/ui/ConnectionModal';
import CanvasContainer from './components/ui/CanvasContainer';
import { UserStatsProvider, useUserStats  from './contexts/UserStatsContext';

// Custom hooks
import { useSocket  from './hooks/connection/useSocket';
import { useCursor  from './hooks/game/useCursor';
import { useFurniture  from './hooks/game/useFurniture';
import { useStats  from './hooks/game/useStats';
import { useConfetti  from './hooks/ui/useConfetti';
import { useMouseInteractions  from './hooks/ui/useMouseInteractions';
import { useKeyboardInteractions  from './hooks/ui/keyboardInteractions';
import { useAnimationCleanup  from './hooks/ui/useAnimationCleanup';
import { useGachapon  from './hooks/game/useGachapon';
import { useViewportFiltering  from './hooks/ui/useViewportFiltering';
import { useConnectionHandlers  from './hooks/connection/useConnectionHandlers';
import { useCursorHandlers  from './hooks/game/useCursorHandlers';
import { useFurnitureHandlers  from './hooks/game/useFurnitureHandlers';

// Constants and utilities
import { 
Z_INDEX_LAYERS
 from './constants';
import { 
getSavedUsername,
getSavedCursorType,
saveUsername
 from './utils/localStorage';
import { getGachaponStyle, getFurnitureGachaponStyle  from './utils/gachapon';

function AppContent({
username,
setUsername,
cursorType,
setCursorType,
socketRef,
hasConnected,
setHasConnected,
cursors,
hearts,
setHearts,
circles,
setCircles,
emotes,
setEmotes,
furniture,
setFurniture,
showDialogBanner,
lastWinner,
lastUnlockedItem
: AppContentProps) {
// Use Context API for user stats
const { 
userStats, 
recordFurniturePlacement,
canPlaceFurniture
 = useUserStats();

// ===== UI STATE =====
const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
const [isCursorFrozen, setIsCursorFrozen] = useState(false);
const [frozenCursorPosition, setFrozenCursorPosition] = useState<{ x: number; y: number  | null>(null);
const [isFurnitureSelectionMode, setIsFurnitureSelectionMode] = useState(false);
const [selectionBox, setSelectionBox] = useState<{
startX: number;
startY: number;
endX: number;
endY: number;
isActive: boolean;
 | null>(null);
const [tempFurniture, setTempFurniture] = useState<Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean; isTemp?: boolean; presetId?: string >>([]);

// ===== GAME STATE =====
const [showConfetti, setShowConfetti] = useState(false);
const [confettiTimestamp, setConfettiTimestamp] = useState<number | null>(null);

// ===== GACHA NOTIFICATION STATE =====
const [showGachaNotification, setShowGachaNotification] = useState(false);
const [gachaNotificationText, setGachaNotificationText] = useState('');

// ===== VIEWPORT STATE =====
const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 );

// ===== REFS =====
const furnitureRefs = useRef<{ [key: string]: HTMLImageElement | null >({);
const usernameRef = useRef(username);

// ===== CUSTOM HOOKS =====
// Game state management
const { afkStartTimeRef  = useStats(socketRef, hasConnected);
useCursor(socketRef, isCursorFrozen, setIsCursorFrozen, setFrozenCursorPosition);
const { clickEnabledTimeRef, mouseStateRef, draggedFurnitureId  = useMouseInteractions({
socketRef,
hasConnected,
cursors,
furniture,
setFurniture,
setSelectedFurnitureId,
selectedFurnitureId,
isCursorFrozen,
setIsCursorFrozen,
setFrozenCursorPosition,
viewportOffset,
setViewportOffset,
username,
recordFurniturePlacement,
afkStartTimeRef,
isFurnitureSelectionMode,
selectionBox,
setSelectionBox,
tempFurniture,
setTempFurniture
);
useKeyboardInteractions({
socketRef,
hasConnected,
cursors,
selectedFurnitureId,
setSelectedFurnitureId,
isCursorFrozen,
frozenCursorPosition,
viewportOffset,
mouseStateRef
);
useFurniture(socketRef, setFurniture, setSelectedFurnitureId, hasConnected, draggedFurnitureId, mouseStateRef);
useConfetti(socketRef, setShowConfetti, setConfettiTimestamp);

// Animation and cleanup
useAnimationCleanup({
setHearts: setHearts,
setCircles: setCircles,
setEmotes: setEmotes
);

// Gachapon machine logic
const { handleGachaponUse, handleGachaponUnfreeze  = useGachapon({
socket: socketRef.current,
setFrozenCursorPosition,
setIsCursorFrozen
);

// Viewport filtering for performance
const {
visibleCircles,
visibleHearts,
visibleEmotes,
visibleFurniture,
visibleCursors
 = useViewportFiltering({
circles,
hearts,
emotes,
furniture,
cursors
);

// Event handlers
const { handleConnect  = useConnectionHandlers({
socket: socketRef.current,
username,
setHasConnected,
clickEnabledTimeRef
);

const { handleCursorChange  = useCursorHandlers({
socket: socketRef.current,
setCursorType
);

const { handleMoveUp, handleMoveDown, handleFurnitureSpawn  = useFurnitureHandlers({
socket: socketRef.current,
canPlaceFurniture,
recordFurniturePlacement
);

// Gacha notification handler
const handleShowGachaNotification = (text: string) => {
setGachaNotificationText(text);
setShowGachaNotification(true);

// Hide notification after 2 seconds
setTimeout(() => {
setShowGachaNotification(false);
setGachaNotificationText('');
, 2000);
;

// ===== EFFECTS =====
useEffect(() => {
usernameRef.current = username;
, [username]);

useEffect(() => {
if (username.trim()) {
saveUsername(username.trim());

, [username]);

return (
<div 
id="app-root" 
className={hasConnected ? (isCursorFrozen ? '' : 'cursor-hidden') : '' 
style={{ 
userSelect: 'none',
cursor: hasConnected ? (isCursorFrozen ? 'default' : 'none') : 'default',
position: 'relative',
overflow: 'hidden'

>
{/* Canvas container with viewport offset */
<CanvasContainer
viewportOffset={viewportOffset
visibleCircles={visibleCircles
visibleHearts={visibleHearts
visibleEmotes={visibleEmotes
visibleFurniture={visibleFurniture
visibleCursors={visibleCursors
selectedFurnitureId={selectedFurnitureId
furnitureRefs={furnitureRefs
socketRef={socketRef
cursorType={cursorType
isCursorFrozen={isCursorFrozen
frozenCursorPosition={frozenCursorPosition
onMoveUp={handleMoveUp
onMoveDown={handleMoveDown
onDelete={(furnitureId) => setSelectedFurnitureId(prev => prev === furnitureId ? null : prev)
showGachaNotification={showGachaNotification
gachaNotificationText={gachaNotificationText
selectionBox={selectionBox
tempFurniture={tempFurniture
onConfirmPreset={() => {
// Convert temporary furniture to real furniture
if (tempFurniture && tempFurniture.length > 0 && socketRef.current) {
// Group furniture by preset ID
const groupedFurniture = tempFurniture.reduce((groups, item) => {
const groupId = item.presetId || 'default';
if (!groups[groupId]) {
groups[groupId] = [];

groups[groupId].push(item);
return groups;
, { as { [key: string]: typeof tempFurniture );

// Place each group of furniture
Object.entries(groupedFurniture).forEach(([, items]) => {
if (items.length > 0) {
// Calculate the center of the group
const groupCenterX = items.reduce((sum, item) => sum + item.x, 0) / items.length;
const groupCenterY = items.reduce((sum, item) => sum + item.y, 0) / items.length;

// Store each item's offset from the group center
const preset = {
furniture: items.map(item => ({
type: item.type,
x: item.x - groupCenterX, // Offset from group center
y: item.y - groupCenterY, // Offset from group center
zIndex: item.zIndex,
isFlipped: item.isFlipped,
isOn: item.isOn
))
;

// Send to server: place group at group center
if (socketRef.current) {
socketRef.current.emit('placeFurniturePreset', {
preset,
x: groupCenterX,
y: groupCenterY
);


);


// Clear the temp furniture
setTempFurniture([]);

onDeleteTempPreset={() => {
setTempFurniture([]);

/>

{/* UI Elements */
<FurniturePanel 
socket={socketRef.current 
onFurnitureSpawn={handleFurnitureSpawn
viewportOffset={viewportOffset
style={{ zIndex: Z_INDEX_LAYERS.PANEL 
/>

<FurniturePresetPanel 
socket={socketRef.current 
onSelectionToggle={setIsFurnitureSelectionMode
furniture={furniture
isFurnitureSelectionMode={isFurnitureSelectionMode
setTempFurniture={setTempFurniture
viewportOffset={viewportOffset
style={{ zIndex: Z_INDEX_LAYERS.PANEL 
/>

<Panel 
socket={socketRef.current 
onCursorChange={handleCursorChange 
cursorPosition={cursors[socketRef.current?.id || '']
style={{ zIndex: Z_INDEX_LAYERS.PANEL 
/>

<AFKTimeDisplay hasConnected={hasConnected userStats={userStats />
<Logo />

{/* Gachapon Machine */
<GachaponMachine
src={'/UI/gacha.gif'
alt="Gacha"
username={username
socket={socketRef.current
onUse={handleGachaponUse
isCursorFrozen={isCursorFrozen
onUnfreeze={handleGachaponUnfreeze
style={getGachaponStyle(viewportOffset)
onShowNotification={handleShowGachaNotification
/>

{/* Furniture Gachapon Machine */
<FurnitureGachaponMachine
src={'/UI/furnituregacha.gif'
alt="Furniture Gacha"
username={username
socket={socketRef.current
onUse={handleGachaponUse
isCursorFrozen={isCursorFrozen
onUnfreeze={handleGachaponUnfreeze
style={getFurnitureGachaponStyle(viewportOffset)
onShowNotification={handleShowGachaNotification
/>

{/* Connection Modal */
<ConnectionModal
username={username
onUsernameChange={setUsername
onConnect={handleConnect
hasConnected={hasConnected
/>



{/* Overlays */
<ConfettiOverlay showConfetti={showConfetti confettiTimestamp={confettiTimestamp />
<DialogBanner showDialogBanner={showDialogBanner lastWinner={lastWinner lastUnlockedItem={lastUnlockedItem />
</div>
);


interface AppContentProps {
username: string;
setUsername: (username: string) => void;
cursorType: string;
setCursorType: (type: string) => void;
socketRef: React.RefObject<Socket | null>;
hasConnected: boolean;
setHasConnected: (connected: boolean) => void;
cursors: { [key: string]: any ;
hearts: any[];
setHearts: React.Dispatch<React.SetStateAction<any[]>>;
circles: any[];
setCircles: React.Dispatch<React.SetStateAction<any[]>>;
emotes: any[];
setEmotes: React.Dispatch<React.SetStateAction<any[]>>;
furniture: { [key: string]: any ;
setFurniture: React.Dispatch<React.SetStateAction<{ [key: string]: any >>;
showDialogBanner: boolean;
lastWinner: string;
lastUnlockedItem: string;


function App() {
const [username, setUsername] = useState(getSavedUsername);
const [cursorType, setCursorType] = useState(getSavedCursorType);

// Socket and connection management
const {
socketRef,
hasConnected,
setHasConnected,
cursors,
hearts,
setHearts,
circles,
setCircles,
emotes,
setEmotes,
furniture,
setFurniture,
showDialogBanner,
lastWinner,
lastUnlockedItem
 = useSocket();

return (
<UserStatsProvider 
socket={socketRef.current 
hasConnected={hasConnected 
username={username
>
<AppContent 
username={username
setUsername={setUsername
cursorType={cursorType
setCursorType={setCursorType
socketRef={socketRef
hasConnected={hasConnected
setHasConnected={setHasConnected
cursors={cursors
hearts={hearts
setHearts={setHearts
circles={circles
setCircles={setCircles
emotes={emotes
setEmotes={setEmotes
furniture={furniture
setFurniture={setFurniture
showDialogBanner={showDialogBanner
lastWinner={lastWinner
lastUnlockedItem={lastUnlockedItem
/>
</UserStatsProvider>
);


export default App;