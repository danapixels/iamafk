import { GACHAPON_CONFIG } from '../constants';
import { FURNITURE_DIMENSIONS } from '../constants/furniture';

export const getGachaponStyle = (viewportOffset: { x: number; y: number }) => ({
  ...GACHAPON_CONFIG.STYLE,
  left: GACHAPON_CONFIG.POSITION.LEFT - viewportOffset.x,
  top: GACHAPON_CONFIG.POSITION.TOP - viewportOffset.y,
  zIndex: GACHAPON_CONFIG.POSITION.Z_INDEX,
});

// Gacha machine collision area (approximate dimensions)
const GACHA_COLLISION = {
  x: GACHAPON_CONFIG.POSITION.LEFT,
  y: GACHAPON_CONFIG.POSITION.TOP,
  width: 120, // Approximate width of gacha machine
  height: 120, // Approximate height of gacha machine
};

export const isGachaCollision = (furnitureType: string, x: number, y: number): boolean => {
  const furnitureDims = FURNITURE_DIMENSIONS[furnitureType] || { width: 50, height: 50 };
  
  // Calculate furniture bounds (centered on placement point)
  const furnitureLeft = x - furnitureDims.width / 2;
  const furnitureRight = x + furnitureDims.width / 2;
  const furnitureTop = y - furnitureDims.height / 2;
  const furnitureBottom = y + furnitureDims.height / 2;
  
  // Calculate gacha machine bounds
  const gachaLeft = GACHA_COLLISION.x - GACHA_COLLISION.width / 2;
  const gachaRight = GACHA_COLLISION.x + GACHA_COLLISION.width / 2;
  const gachaTop = GACHA_COLLISION.y - GACHA_COLLISION.height / 2;
  const gachaBottom = GACHA_COLLISION.y + GACHA_COLLISION.height / 2;
  
  // Check for collision (rectangles overlap)
  return !(
    furnitureRight < gachaLeft ||
    furnitureLeft > gachaRight ||
    furnitureBottom < gachaTop ||
    furnitureTop > gachaBottom
  );
}; 