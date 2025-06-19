import { useMemo  from 'react';
import { isElementVisible  from '../../utils/canvas';
import { ANIMATION_CONSTANTS, SERVER_CONFIG  from '../../constants';
import type { Circle, Heart, Emote, Furniture, CursorsMap  from '../../types';

interface UseViewportFilteringProps {
viewportOffset: { x: number; y: number ;
circles: Circle[];
hearts: Heart[];
emotes: Emote[];
furniture: { [key: string]: Furniture ;
cursors: CursorsMap;
socketRef: React.MutableRefObject<any>;
hasConnected: boolean;
isCursorFrozen: boolean;
frozenCursorPosition: { x: number; y: number  | null;


export const useViewportFiltering = ({
viewportOffset,
circles,
hearts,
emotes,
furniture,
cursors,
socketRef,
hasConnected,
isCursorFrozen,
frozenCursorPosition
: UseViewportFilteringProps) => {

const visibleCircles = useMemo(() => 
circles.filter(circle => 
isElementVisible(circle.x, circle.y, viewportOffset, ANIMATION_CONSTANTS.CIRCLE_VISIBILITY_BUFFER)
), [circles, viewportOffset]
);

const visibleHearts = useMemo(() => 
hearts.filter(heart => 
isElementVisible(heart.x, heart.y, viewportOffset, ANIMATION_CONSTANTS.HEART_VISIBILITY_BUFFER)
), [hearts, viewportOffset]
);

const visibleEmotes = useMemo(() => 
emotes.filter(emote => 
isElementVisible(emote.x, emote.y, viewportOffset, ANIMATION_CONSTANTS.Emote_VISIBILITY_BUFFER)
), [emotes, viewportOffset]
);

const visibleFurniture = useMemo(() => 
Object.values(furniture).filter(item => 
isElementVisible(item.x, item.y, viewportOffset, ANIMATION_CONSTANTS.FURNITURE_VISIBILITY_BUFFER)
), [furniture, viewportOffset]
);

const visibleCursors = useMemo(() => 
Object.entries(cursors).filter(([id, cursor]) => {
if (!cursor) return false;
if (!hasConnected && id === socketRef.current?.id) return false;
if (!cursor.name || cursor.name === SERVER_CONFIG.ANONYMOUS_NAME) return false;

const cursorX = id === socketRef.current?.id
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursor.x)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.x : cursor.x);
const cursorY = id === socketRef.current?.id
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursor.y)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.y : cursor.y);

const shouldShowCursor = !(id === socketRef.current?.id) || hasConnected;
if (!shouldShowCursor) return false;
if (!(id === socketRef.current?.id) && cursor.isFrozen && !cursor.frozenPosition) return false;

return isElementVisible(cursorX, cursorY, viewportOffset, ANIMATION_CONSTANTS.CURSOR_VISIBILITY_BUFFER);
), [cursors, socketRef, hasConnected, isCursorFrozen, frozenCursorPosition, viewportOffset]
);

return {
visibleCircles,
visibleHearts,
visibleEmotes,
visibleFurniture,
visibleCursors
;
; 