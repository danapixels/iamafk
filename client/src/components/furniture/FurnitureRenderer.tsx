import React, { memo } from 'react';
import type { Furniture } from '../../types';
import { FURNITURE_IMAGES, Z_INDEX_LAYERS } from '../../constants';
import { FurnitureControlButtons } from './FurnitureControlButtons';

interface FurnitureRendererProps {
  visibleFurniture: Furniture[];
  selectedFurnitureId: string | null;
  furnitureRefs: React.MutableRefObject<{ [key: string]: HTMLImageElement | null }>;
  socketRef: React.MutableRefObject<any>;
  onMoveUp: (furnitureId: string) => void;
  onMoveDown: (furnitureId: string) => void;
  onDelete: (furnitureId: string) => void;
}

const FurnitureRenderer: React.FC<FurnitureRendererProps> = memo(({
  visibleFurniture,
  selectedFurnitureId,
  furnitureRefs,
  socketRef,
  onMoveUp,
  onMoveDown,
  onDelete
}) => {
  const handleFlip = (furnitureId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('flipFurniture', { furnitureId });
    }
  };

  const handleDelete = (furnitureId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('deleteFurniture', furnitureId);
      onDelete(furnitureId);
    }
  };

  return (
    <>
      {visibleFurniture.map((item) => (
        <React.Fragment key={item.id}>
          <img
            key={item.id}
            ref={(el) => {
              furnitureRefs.current[item.id] = el;
            }}
            src={FURNITURE_IMAGES[item.type]}
            alt={item.type}
            data-furniture-id={item.id}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              transform: 'translate(-50%, -50%)',
              zIndex: item.zIndex || Z_INDEX_LAYERS.FURNITURE,
              pointerEvents: 'all',
              userSelect: 'none',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: `translate(-50%, -50%) ${item.isFlipped ? 'scaleX(-1)' : ''}`,
              transformStyle: 'preserve-3d',
              border: selectedFurnitureId === item.id ? '1px dashed #fff' : 'none',
              borderRadius: selectedFurnitureId === item.id ? '6px' : '0',
              boxSizing: 'border-box',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            draggable={false}
          />
          {selectedFurnitureId === item.id && (
            <FurnitureControlButtons
              item={item}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDelete={handleDelete}
              onFlip={handleFlip}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
});

export default FurnitureRenderer; 