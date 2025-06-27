// UI button dimensions
export const BUTTON_DIMENSIONS = {
  CONTROL_BUTTON_SIZE: 48, // Size of furniture control buttons
  CONTROL_BUTTON_GAP: 0, // Gap between furniture and control buttons
} as const;

// UI image paths
export const UI_IMAGES = {
  // Control buttons
  UP_BUTTON: '/UI/up.png',
  UP_BUTTON_HOVER: '/UI/uphover.png',
  DOWN_BUTTON: '/UI/down.png',
  DOWN_BUTTON_HOVER: '/UI/downhover.png',
  FLIP_BUTTON: '/UI/flip.png',
  FLIP_BUTTON_HOVER: '/UI/fliphover.png',
  DELETE_FURNITURE_BUTTON: '/UI/deletefurniturebutton.png',
  DELETE_FURNITURE_BUTTON_HOVER: '/UI/deletefurniturebuttonhover.png',
  
  // Logo and branding
  LOGO: '/UI/logo.png',
  GITHUB_LOGO: '/UI/github.png',
  LEADERBOARD: '/UI/leaderboard.png',
  TUTORIAL: '/UI/tutorial.png',
  
  // Effects
  SMILE_GIF: '/UI/smile.gif',
  SLEEPING_GIF: '/UI/sleeping.gif',
  CURSOR: '/UI/cursor.png',
  
  // emotes
  THUMBSUP: '/UI/thumbsup.png',
  THUMBSDOWN: '/UI/thumbsdown.png',
  SAD: '/UI/sad.png',
  HAPPYT: '/UI/happyt.png',
  SURPRISED: '/UI/surprised.png',
  ANGRY: '/UI/angry.png',
  EXCLAMATION_POINT: '/UI/exclamationpoint.png',
  ECHO: '/UI/echo.png',
  POINT_LEFT: '/UI/pointleft.png',
  POINT_RIGHT: '/UI/pointright.png',
} as const;

// repo link
export const GITHUB_URL = 'https://github.com/danapixels/iamafk';

// Server and connection constants
export const SERVER_CONFIG = {
  SOCKET_URL: import.meta.env.VITE_SERVER_URL || 'ws://localhost:3001',
  DEFAULT_CURSOR_TYPE: 'default',
  ANONYMOUS_NAME: 'Anonymous'
} as const;

// UI state constants
export const UI_STATE = {
  INITIAL_VIEWPORT_OFFSET: { x: 0, y: 0 },
  INITIAL_MOUSE_POSITION: { x: 0, y: 0 },
  INITIAL_COUNTERS: 0
};

// Gachapon machine constants
export const GACHAPON_CONFIG = {
  POSITION: {
    LEFT: 160,
    TOP: 280,
    Z_INDEX: 99
  },
  STYLE: {
    transform: 'scaleX(-1)',
    position: 'absolute' as const
  }
} as const; 