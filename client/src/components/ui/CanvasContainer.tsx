import React, { memo  from 'react';
import { CANVAS_SIZE  from '../../constants';
import TutorialOverlay from '../overlay/TutorialOverlay';
import AnimationRenderer from '../cursor/emotes';
import FurnitureRenderer from '../furniture/FurnitureRenderer';
import CursorRenderer from '../cursor/cursoractions';
import { Statue  from './Statue';
import { AllTimeStatue  from './AllTimeStatue';
import { JackpotStatue  from './JackpotStatue';
import { getStatueStyle, getAllTimeStatueStyle, getJackpotStatueStyle  from '../../utils/statue';
import TempFurnitureRenderer from './TempFurnitureRenderer';
// import { useStatueBadges  from '../../hooks/game/useStatueBadges';
import type { Circle, Heart, Emote, Furniture  from '../../types';
import { formatTime  from '../../utils/helpers';

interface CanvasContainerProps {
viewportOffset: { x: number; y: number ;
visibleCircles: Circle[];
visibleHearts: Heart[];
visibleEmotes: Emote[];
visibleFurniture: Furniture[];
visibleCursors: [string, any][];
selectedFurnitureId: string | null;
furnitureRefs: React.MutableRefObject<{ [key: string]: HTMLImageElement | null >;
socketRef: React.MutableRefObject<any>;
cursorType: string;
isCursorFrozen: boolean;
frozenCursorPosition: { x: number; y: number  | null;
onMoveUp: (furnitureId: string) => void;
onMoveDown: (furnitureId: string) => void;
onDelete: (furnitureId: string) => void;
showGachaNotification?: boolean;
gachaNotificationText?: string;
selectionBox?: {
startX: number;
startY: number;
endX: number;
endY: number;
isActive: boolean;
 | null;
selectedFurnitureDuringSelection?: Set<string>;
tempFurniture?: Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean; isTemp?: boolean; presetId?: string >;
onConfirmPreset?: (presetId: string) => void;
onDeleteTempPreset?: (presetId: string) => void;
isFurnitureSelectionMode?: boolean;
// username?: string;


export const CanvasContainer: React.FC<CanvasContainerProps> = memo(({
viewportOffset,
visibleCircles,
visibleHearts,
visibleEmotes,
visibleFurniture,
visibleCursors,
selectedFurnitureId,
furnitureRefs,
socketRef,
cursorType,
isCursorFrozen,
frozenCursorPosition,
onMoveUp,
onMoveDown,
onDelete,
showGachaNotification,
gachaNotificationText,
selectionBox,
selectedFurnitureDuringSelection,
tempFurniture,
onConfirmPreset,
onDeleteTempPreset,
isFurnitureSelectionMode,
) => {
// Get user badges for statue achievements
// const userBadges = useStatueBadges({
// cursors: visibleCursors.reduce((acc, [id, cursor]) => ({ ...acc, [id]: cursor ), {),
// username: username || '',
// socket: socketRef.current
// );

return (
<div 
style={{
position: 'absolute',
left: -viewportOffset.x,
top: -viewportOffset.y,
width: CANVAS_SIZE,
height: CANVAS_SIZE,
border: isFurnitureSelectionMode ? 'none' : '2px solid white',
boxSizing: 'border-box',
pointerEvents: 'none',

>
<div 
className="canvas-container"
style={{
position: 'absolute',
left: 0,
top: 0,
width: '100%',
height: '100%',
pointerEvents: 'none',

>
<TutorialOverlay />

{/* beach background in top right*/
<div
style={{
position: 'absolute',
top: 0,
right: 0,
width: '2000px',
height: '2000px',
backgroundImage: 'url(/UI/beach.gif)',
backgroundSize: 'cover',
backgroundPosition: 'center',
backgroundRepeat: 'no-repeat',
pointerEvents: 'none',
zIndex: 3,

/>

{/* statue with leaderboard */
<Statue 
cursors={Object.fromEntries(visibleCursors) 
style={getStatueStyle()
/>

{/* all-time statue with historical record */
<AllTimeStatue 
socket={socketRef.current
style={getAllTimeStatueStyle()
/>

{/* jackpot statue with gachapon wins record */
<JackpotStatue 
socket={socketRef.current
style={getJackpotStatueStyle()
/>

{/* gacha notification - positioned absolutely on canvas*/
{showGachaNotification && gachaNotificationText && (
<div
style={{
position: 'absolute',
top: 270,
left: 140,
zIndex: 9999999,
pointerEvents: 'none'

>
<div style={{
fontFamily: '"Press Start 2P", monospace',
fontSize: '0.5em',
color: 'white',
textAlign: 'center',
whiteSpace: 'nowrap',
animation: 'notificationRiseAndFade 2s ease-out forwards'
>
{gachaNotificationText
</div>
</div>
)

<AnimationRenderer
visibleCircles={visibleCircles
visibleHearts={visibleHearts
visibleEmotes={visibleEmotes
/>

<FurnitureRenderer
visibleFurniture={visibleFurniture
selectedFurnitureId={selectedFurnitureId
selectedFurnitureDuringSelection={selectedFurnitureDuringSelection
furnitureRefs={furnitureRefs
socketRef={socketRef
onMoveUp={onMoveUp
onMoveDown={onMoveDown
onDelete={onDelete
/>

{/* temporary furniture renderer for furniture presets*/
{tempFurniture && tempFurniture.length > 0 && (
<TempFurnitureRenderer 
tempFurniture={tempFurniture
onConfirmPreset={onConfirmPreset
onDeleteTempPreset={onDeleteTempPreset
/>
)

{/* selection box for furniture preset placement*/
{selectionBox && selectionBox.isActive && (
<div
style={{
position: 'absolute',
left: Math.min(selectionBox.startX, selectionBox.endX),
top: Math.min(selectionBox.startY, selectionBox.endY),
width: Math.abs(selectionBox.endX - selectionBox.startX),
height: Math.abs(selectionBox.endY - selectionBox.startY),
border: '1px dashed white',
backgroundColor: 'rgba(255, 255, 255, 0.1)',
pointerEvents: 'none',
zIndex: 9998,

/>
)

<CursorRenderer
visibleCursors={visibleCursors
socketRef={socketRef
cursorType={cursorType
isCursorFrozen={isCursorFrozen
frozenCursorPosition={frozenCursorPosition
formatTime={formatTime
/>
</div>
</div>
);
);

export default CanvasContainer; 