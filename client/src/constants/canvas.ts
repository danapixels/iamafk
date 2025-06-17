// Canvas configuration
export const CANVAS_SIZE = 4000;

// Z-index layers for proper layering
export const Z_INDEX_LAYERS = {
  CURSORS: 9997,
  PANEL: 9996,
  LOGO: 9995,
  FURNITURE: 100, // Base z-index for furniture
  MIN_FURNITURE: 100, // Minimum z-index for furniture
  MAX_FURNITURE: 9994  // Maximum z-index for furniture (below cursors and panel)
} as const;

// Animation durations
export const HEART_DURATION = 800;
export const CIRCLE_DURATION = 600;
export const THUMBSUP_DURATION = 1000; 