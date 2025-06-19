// Furniture image paths
export const FURNITURE_IMAGES: { [key: string]: string } = {
  chair: './UI/chair.png',
  lamp: './UI/lamp.png',
  bed: './UI/bed.png',
  walls: './UI/walls1.png',
  plant1: './UI/plant1.png',
  plant2: './UI/plant2.png',
  blackcat: './UI/blackcat.png',
  whitecat: './UI/whitecat.png',
  table: './UI/table.png',
} as const;

// Furniture dimensions for positioning and collision detection
export const FURNITURE_DIMENSIONS: { [key: string]: { width: number; height: number } } = {
  'bed': { width: 120, height: 80 },
  'chair': { width: 60, height: 60 },
  'lamp': { width: 40, height: 80 },
  'plant1': { width: 50, height: 70 },
  'plant2': { width: 50, height: 70 },
  'blackcat': { width: 60, height: 40 },
  'whitecat': { width: 60, height: 40 },
  'walls1': { width: 120, height: 120 },
  'walls2': { width: 120, height: 120 },
  'table': { width: 100, height: 60 },
} as const;

// Furniture types for type safety
export const FURNITURE_TYPES = {
  CHAIR: 'chair',
  LAMP: 'lamp',
  BED: 'bed',
  WALLS: 'walls',
  PLANT1: 'plant1',
  PLANT2: 'plant2',
  BLACKCAT: 'blackcat',
  WHITECAT: 'whitecat'
} as const;

export type FurnitureType = typeof FURNITURE_TYPES[keyof typeof FURNITURE_TYPES]; 