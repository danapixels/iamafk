// Canvas configuration
export const CANVAS_SIZE = 4000;

// Z-index layers for proper layering
export const Z_INDEX_LAYERS = {
  FURNITURE: 1000,
  PANEL: 9996,
  CURSORS: 10000,
  LOGO: 9998,
  MIN_FURNITURE: 100, // Minimum z-index for furniture
  MAX_FURNITURE: 9994  // Maximum z-index for furniture (below cursors and panel)
} as const;

// Animation durations
export const HEART_DURATION = 800;
export const CIRCLE_DURATION = 600;
export const THUMBSUP_DURATION = 1000;

// Animation and effect constants
export const ANIMATION_CONSTANTS = {
  // Emote positioning
  Emote_OFFSET_X: 30, // 30px to the left of cursor
  
  // Effect animations
  CIRCLE_BASE_SIZE: 40,
  CIRCLE_SCALE_MIN: 0.5,
  CIRCLE_SCALE_MAX: 1.0,
  HEART_RISE_DISTANCE: 20,
  Emote_MOVE_DISTANCE: 30,
  
  // Visibility buffers
  CIRCLE_VISIBILITY_BUFFER: 50,
  HEART_VISIBILITY_BUFFER: 50,
  Emote_VISIBILITY_BUFFER: 50,
  FURNITURE_VISIBILITY_BUFFER: 200,
  CURSOR_VISIBILITY_BUFFER: 100,
  DEFAULT_VISIBILITY_BUFFER: 100
} as const; 