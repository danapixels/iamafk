import React, { memo  from 'react';
import { Z_INDEX_LAYERS, UI_IMAGES  from '../../constants';

// defines the cursor data interface
interface CursorData {
x: number;
y: number;
name?: string;
stillTime: number;
cursorType?: string;
isFrozen?: boolean;
frozenPosition?: { x: number; y: number ;
sleepingOnBed?: boolean;
badges?: {
dailyBadge: boolean;
crownBadge: boolean;
gachaBadge: boolean;
;


// defines the cursor renderer props interface
interface CursorRendererProps {
visibleCursors: [string, CursorData][];
socketRef: React.RefObject<any>;
cursorType: string;
isCursorFrozen: boolean;
frozenCursorPosition: { x: number; y: number  | null;
formatTime: (seconds: number) => string;


// defines the cursor renderer component
const CursorRenderer: React.FC<CursorRendererProps> = memo(({
visibleCursors,
socketRef,
cursorType,
isCursorFrozen,
frozenCursorPosition,
formatTime
) => {
return (
<>
{visibleCursors.map(([id, cursor]) => {
const isMe = id === socketRef.current?.id;
const cursorClass = isMe 
? `cursor-${cursorType`
: (cursor.cursorType ? `cursor-${cursor.cursorType` : 'cursor-default');

const cursorX = isMe 
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursor.x)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.x : cursor.x);
const cursorY = isMe
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursor.y)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.y : cursor.y);

return (
<React.Fragment key={id>
<div
className="cursor-wrapper"
style={{
left: cursorX,
top: cursorY,
fontWeight: isMe ? 'bold' : 'normal',
zIndex: isMe ? Z_INDEX_LAYERS.CURSORS + 10 : Z_INDEX_LAYERS.CURSORS - 4

>
<div className={`cursor-circle ${cursorClass` />
<div className="cursor-labels">
{cursor.stillTime >= 30 && (
<div className="cursor-timer">AFK {formatTime(cursor.stillTime)</div>
)
<div className="cursor-id-label" style={{ position: 'relative' >
{/* badges displayed for all users */
{cursor.badges && (
<div style={{ 
position: 'absolute', 
right: '100%', 
top: '50%', 
transform: 'translateY(-50%)',
display: 'flex',
gap: '2px',
marginRight: '4px',
pointerEvents: 'none'
>
{cursor.badges.dailyBadge && (
<img
src={UI_IMAGES.DAILY_BADGE
alt="Daily Badge"
style={{
imageRendering: 'pixelated'

/>
)
{cursor.badges.crownBadge && (
<img
src={UI_IMAGES.CROWN_BADGE
alt="Crown Badge"
style={{
imageRendering: 'pixelated'

/>
)
{cursor.badges.gachaBadge && (
<img
src={UI_IMAGES.GACHA_BADGE
alt="Gacha Badge"
style={{
imageRendering: 'pixelated'

/>
)
</div>
)
{cursor.name
{cursor.isFrozen && cursor.sleepingOnBed && (
<img
src="/UI/sleeping.gif"
alt="Sleeping"
style={{
position: 'absolute',
left: '100%',
top: '50%',
transform: 'translateY(-50%)',
marginLeft: '6px', 
paddingBottom: '4px',
zIndex: isMe ? Z_INDEX_LAYERS.CURSORS + 10 : Z_INDEX_LAYERS.CURSORS - 10,
pointerEvents: 'none'

/>
)
</div>
</div>
</div>
</React.Fragment>
);
)
</>
);
);

export default CursorRenderer; 