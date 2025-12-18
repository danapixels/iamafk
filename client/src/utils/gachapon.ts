import { GACHAPON_CONFIG, FURNITURE_GACHAPON_CONFIG } from '../constants';

export const getGachaponStyle = (viewportOffset: { x: number; y: number }) => ({
  ...GACHAPON_CONFIG.STYLE,
  left: GACHAPON_CONFIG.POSITION.LEFT - viewportOffset.x,
  top: GACHAPON_CONFIG.POSITION.TOP - viewportOffset.y,
  zIndex: GACHAPON_CONFIG.POSITION.Z_INDEX,
});

export const getFurnitureGachaponStyle = (viewportOffset: { x: number; y: number }) => ({
  ...FURNITURE_GACHAPON_CONFIG.STYLE,
  left: FURNITURE_GACHAPON_CONFIG.POSITION.LEFT - viewportOffset.x,
  top: FURNITURE_GACHAPON_CONFIG.POSITION.TOP - viewportOffset.y,
  zIndex: FURNITURE_GACHAPON_CONFIG.POSITION.Z_INDEX,
}); 