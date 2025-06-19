import React from 'react';
import { CANVAS_SIZE  from '../../constants';
import TutorialOverlay from '../overlay/TutorialOverlay';
import AnimationRenderer from '../cursor/emotes';
import FurnitureRenderer from '../furniture/FurnitureRenderer';
import CursorRenderer from '../cursor/cursoractions';
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


const CanvasContainer: React.FC<CanvasContainerProps> = ({
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
onDelete
) => {
return (
<div 
style={{
position: 'absolute',
left: -viewportOffset.x,
top: -viewportOffset.y,
width: CANVAS_SIZE,
height: CANVAS_SIZE,
border: '2px solid white',
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

<AnimationRenderer
visibleCircles={visibleCircles
visibleHearts={visibleHearts
visibleEmotes={visibleEmotes
/>

<FurnitureRenderer
visibleFurniture={visibleFurniture
selectedFurnitureId={selectedFurnitureId
furnitureRefs={furnitureRefs
socketRef={socketRef
onMoveUp={onMoveUp
onMoveDown={onMoveDown
onDelete={onDelete
/>

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
;

export default CanvasContainer; 