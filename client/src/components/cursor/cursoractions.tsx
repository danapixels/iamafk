import React from 'react';
import { Z_INDEX_LAYERS } from '../../constants';

interface CursorData {
  x: number;
  y: number;
  name?: string;
  stillTime: number;
  cursorType?: string;
  isFrozen?: boolean;
  frozenPosition?: { x: number; y: number };
  sleepingOnBed?: boolean;
}

interface CursorRendererProps {
  visibleCursors: [string, CursorData][];
  socketRef: React.RefObject<any>;
  cursorType: string;
  isCursorFrozen: boolean;
  frozenCursorPosition: { x: number; y: number } | null;
  formatTime: (seconds: number) => string;
}

const CursorRenderer: React.FC<CursorRendererProps> = ({
  visibleCursors,
  socketRef,
  cursorType,
  isCursorFrozen,
  frozenCursorPosition,
  formatTime
}) => {
  return (
    <>
      {visibleCursors.map(([id, cursor]) => {
        const isMe = id === socketRef.current?.id;
        const cursorClass = isMe 
          ? `cursor-${cursorType}`
          : (cursor.cursorType ? `cursor-${cursor.cursorType}` : 'cursor-default');

        const cursorX = isMe 
          ? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursor.x)
          : (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.x : cursor.x);
        const cursorY = isMe
          ? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursor.y)
          : (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.y : cursor.y);

        return (
          <React.Fragment key={id}>
            <div
              className="cursor-wrapper"
              style={{
                left: cursorX,
                top: cursorY,
                fontWeight: isMe ? 'bold' : 'normal',
                zIndex: isMe ? Z_INDEX_LAYERS.CURSORS + 10 : Z_INDEX_LAYERS.CURSORS - 4
              }}
            >
              <div className={`cursor-circle ${cursorClass}`} />
              <div className="cursor-labels">
                {cursor.stillTime >= 30 && (
                  <div className="cursor-timer">AFK {formatTime(cursor.stillTime)}</div>
                )}
                <div className="cursor-id-label" style={{ position: 'relative' }}>
                  {cursor.name}
                  {cursor.isFrozen && cursor.sleepingOnBed && (
                    <img
                      src="/UI/sleeping.gif"
                      alt="Sleeping"
                      style={{
                        position: 'absolute',
                        left: '100%', // Position to the right of the label
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginLeft: '6px', // Spacing between label and gif
                        paddingBottom: '4px', // Increased bottom padding
                        zIndex: isMe ? Z_INDEX_LAYERS.CURSORS + 10 : Z_INDEX_LAYERS.CURSORS - 10,
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CursorRenderer; 