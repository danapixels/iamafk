import React from 'react';
import { FURNITURE_DIMENSIONS, BUTTON_DIMENSIONS, UI_IMAGES } from '../../constants';
import type { Furniture } from '../../types';

interface FurnitureControlButtonsProps {
  item: Furniture;
  onMoveUp: (furnitureId: string) => void;
  onMoveDown: (furnitureId: string) => void;
  onDelete: (furnitureId: string) => void;
  onFlip: (furnitureId: string) => void;
}

export const FurnitureControlButtons: React.FC<FurnitureControlButtonsProps> = ({
  item,
  onMoveUp,
  onMoveDown,
  onDelete,
  onFlip
}) => {
  return (
    <>
      {/* Left button - positioned directly to the left */}
      <div
        style={{
          position: 'absolute',
          left: item.x - (FURNITURE_DIMENSIONS[item.type]?.width || 50)/2 - BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE,
          top: item.y - BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE/2,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          zIndex: 9996,
          pointerEvents: 'all',
        }}
      >
        <div 
          style={{ 
            position: 'relative', 
            width: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            height: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => onDelete(item.id)}
          className="furniture-control-button"
          data-furniture-control="true"
        >
          <img
            src={UI_IMAGES.DELETE_FURNITURE_BUTTON}
            alt="Delete Furniture"
            onMouseOver={(e) => e.currentTarget.src = UI_IMAGES.DELETE_FURNITURE_BUTTON_HOVER}
            onMouseOut={(e) => e.currentTarget.src = UI_IMAGES.DELETE_FURNITURE_BUTTON}
            style={{ position: 'absolute' }}
          />
        </div>
      </div>
      
      {/* Top button - positioned directly above */}
      <div
        style={{
          position: 'absolute',
          left: item.x - BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE/2,
          top: item.y - (FURNITURE_DIMENSIONS[item.type]?.height || 50)/2 - BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          zIndex: 9996,
          pointerEvents: 'all',
        }}
      >
        <div 
          style={{ 
            position: 'relative', 
            width: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            height: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => onMoveUp(item.id)}
          className="furniture-control-button"
          data-furniture-control="true"
        >
          <img
            src={UI_IMAGES.UP_BUTTON}
            alt="Move Up"
            onMouseOver={(e) => e.currentTarget.src = UI_IMAGES.UP_BUTTON_HOVER}
            onMouseOut={(e) => e.currentTarget.src = UI_IMAGES.UP_BUTTON}
            style={{ position: 'absolute' }}
          />
        </div>
      </div>
      
      {/* Bottom button - positioned directly below */}
      <div
        style={{
          position: 'absolute',
          left: item.x - BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE/2,
          top: item.y + (FURNITURE_DIMENSIONS[item.type]?.height || 50)/2,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          zIndex: 9996,
          pointerEvents: 'all',
        }}
      >
        <div 
          style={{ 
            position: 'relative', 
            width: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            height: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => onMoveDown(item.id)}
          className="furniture-control-button"
          data-furniture-control="true"
        >
          <img
            src={UI_IMAGES.DOWN_BUTTON}
            alt="Move Down"
            onMouseOver={(e) => e.currentTarget.src = UI_IMAGES.DOWN_BUTTON_HOVER}
            onMouseOut={(e) => e.currentTarget.src = UI_IMAGES.DOWN_BUTTON}
            style={{ position: 'absolute' }}
          />
        </div>
      </div>
      
      {/* Right button - positioned directly to the right */}
      <div
        style={{
          position: 'absolute',
          left: item.x + (FURNITURE_DIMENSIONS[item.type]?.width || 50)/2,
          top: item.y - BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE/2,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          zIndex: 9996,
          pointerEvents: 'all',
        }}
      >
        <div 
          style={{ 
            position: 'relative', 
            width: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            height: `${BUTTON_DIMENSIONS.CONTROL_BUTTON_SIZE}px`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => onFlip(item.id)}
          className="furniture-control-button"
          data-furniture-control="true"
        >
          <img
            src={UI_IMAGES.FLIP_BUTTON}
            alt="Flip"
            onMouseOver={(e) => e.currentTarget.src = UI_IMAGES.FLIP_BUTTON_HOVER}
            onMouseOut={(e) => e.currentTarget.src = UI_IMAGES.FLIP_BUTTON}
            style={{ position: 'absolute' }}
          />
        </div>
      </div>
    </>
  );
}; 