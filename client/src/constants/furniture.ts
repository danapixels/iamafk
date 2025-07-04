// furniture images
export const FURNITURE_IMAGES: { [key: string]: string  = {
chair: '/UI/chair.png',
lamp: '/UI/lamp.png',
bed: '/UI/bed.png',
walls: '/UI/walls1.png',
plant1: '/UI/plant1.png',
plant2: '/UI/plant2.png',
blackcat: '/UI/blackcat.png',
whitecat: '/UI/whitecat.png',
table: '/UI/table.png',
computer: '/UI/computeroff.png',
tv: '/UI/tvoff.png',
toilet: '/UI/toilet.png',
washingmachine: '/UI/washingmachineoff.png',
zuzu: '/UI/zuzu.png',
 as const;

// furniture toggle states (on/off images)
export const FURNITURE_TOGGLE_IMAGES: { [key: string]: { off: string; on: string   = {
computer: { off: '/UI/computeroff.png', on: '/UI/computeron.gif' ,
tv: { off: '/UI/tvoff.png', on: '/UI/tvon.gif' ,
washingmachine: { off: '/UI/washingmachineoff.png', on: '/UI/washingmachineon.gif' ,
 as const;

// furniture wxh for bounding box button positioning
export const FURNITURE_DIMENSIONS: { [key: string]: { width: number; height: number   = {
'bed': { width: 100, height: 76 ,
'chair': { width: 44, height: 60 ,
'lamp': { width: 44, height: 92 ,
'plant1': { width: 32, height: 40 ,
'plant2': { width: 24, height: 42 ,
'blackcat': { width: 46, height: 28 ,
'whitecat': { width: 46, height: 28 ,
'walls1': { width: 64, height: 48 ,
'walls2': { width: 64, height: 48 ,
'table': { width: 68, height: 58 ,
'computer': { width: 62, height: 74 ,
'tv': { width: 54, height: 52 ,
'toilet': { width: 48, height: 66 ,
'washingmachine': { width: 54, height: 68 ,
'zuzu': { width: 86, height: 44 ,
 as const;

// furniture types for type safety
export const FURNITURE_TYPES = {
CHAIR: 'chair',
LAMP: 'lamp',
BED: 'bed',
WALLS: 'walls',
PLANT1: 'plant1',
PLANT2: 'plant2',
BLACKCAT: 'blackcat',
WHITECAT: 'whitecat',
TABLE: 'table',
COMPUTER: 'computer',
TV: 'tv',
TOILET: 'toilet',
WASHINGMACHINE: 'washingmachine',
ZUZU: 'zuzu',
 as const;

export type FurnitureType = typeof FURNITURE_TYPES[keyof typeof FURNITURE_TYPES]; 