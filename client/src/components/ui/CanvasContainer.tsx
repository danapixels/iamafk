import React, { memo } from 'react';
import { CANVAS_SIZE } from '../../constants';
import TutorialOverlay from '../overlay/TutorialOverlay';
import AnimationRenderer from '../cursor/emotes';
import FurnitureRenderer from '../furniture/FurnitureRenderer';
import CursorRenderer from '../cursor/cursoractions';
import { Statue } from './Statue';
import { AllTimeStatue } from './AllTimeStatue';
import { JackpotStatue } from './JackpotStatue';
import { getStatueStyle, getAllTimeStatueStyle, getJackpotStatueStyle } from '../../utils/statue';
// import { useStatueBadges } from '../../hooks/game/useStatueBadges';
import type { Circle, Heart, Emote, Furniture } from '../../types';
import { formatTime } from '../../utils/helpers';

interface CanvasContainerProps {
  viewportOffset: { x: number; y: number };
  visibleCircles: Circle[];
  visibleHearts: Heart[];
  visibleEmotes: Emote[];
  visibleFurniture: Furniture[];
  visibleCursors: [string, any][];
  selectedFurnitureId: string | null;
  furnitureRefs: React.MutableRefObject<{ [key: string]: HTMLImageElement | null }>;
  socketRef: React.MutableRefObject<any>;
  cursorType: string;
  isCursorFrozen: boolean;
  frozenCursorPosition: { x: number; y: number } | null;
  onMoveUp: (furnitureId: string) => void;
  onMoveDown: (furnitureId: string) => void;
  onDelete: (furnitureId: string) => void;
  showGachaNotification?: boolean;
  gachaNotificationText?: string;
  // username?: string;
}

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
}) => {
  // Get user badges for statue achievements
  // const userBadges = useStatueBadges({
  //   cursors: visibleCursors.reduce((acc, [id, cursor]) => ({ ...acc, [id]: cursor }), {}),
  //   username: username || '',
  //   socket: socketRef.current
  // });

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
        backgroundImage: 'url(/UI/roadcombined.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
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
        }}
      >
        <TutorialOverlay />

        {/* Winter background in bottom right - lowest z-index */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '2000px',
            height: '2000px',
            backgroundImage: 'url(/UI/winter.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
            zIndex: -2,
          }}
        />

        {/* Beach background in top right - middle z-index */}
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
            zIndex: -1,
          }}
        />

        {/* Statue with leaderboard */}
        <Statue 
          cursors={Object.fromEntries(visibleCursors)} 
          style={getStatueStyle()}
        />

        {/* All-time statue with historical record */}
        <AllTimeStatue 
          socket={socketRef.current}
          style={getAllTimeStatueStyle()}
        />

        {/* Jackpot statue with gachapon wins record */}
        <JackpotStatue 
          socket={socketRef.current}
          style={getJackpotStatueStyle()}
        />

        {/* Gacha notification - positioned absolutely on canvas like tutorial */}
        {showGachaNotification && gachaNotificationText && (
          <div
            style={{
              position: 'absolute',
              top: 270,
              left: 140,
              zIndex: 9999999,
              pointerEvents: 'none'
            }}
          >
            <div style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.5em',
              color: 'white',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              animation: 'notificationRiseAndFade 2s ease-out forwards'
            }}>
              {gachaNotificationText}
            </div>
          </div>
        )}

        <AnimationRenderer
          visibleCircles={visibleCircles}
          visibleHearts={visibleHearts}
          visibleEmotes={visibleEmotes}
        />

        <FurnitureRenderer
          visibleFurniture={visibleFurniture}
          selectedFurnitureId={selectedFurnitureId}
          furnitureRefs={furnitureRefs}
          socketRef={socketRef}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
        />

        <CursorRenderer
          visibleCursors={visibleCursors}
          socketRef={socketRef}
          cursorType={cursorType}
          isCursorFrozen={isCursorFrozen}
          frozenCursorPosition={frozenCursorPosition}
          formatTime={formatTime}
        />
      </div>
    </div>
  );
});

export default CanvasContainer; 