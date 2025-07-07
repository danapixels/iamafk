import React from 'react';
import { FURNITURE_IMAGES, FURNITURE_TOGGLE_IMAGES, Z_INDEX_LAYERS  from '../../constants';

interface TempFurnitureItem {
id: string;
type: string;
x: number;
y: number;
zIndex?: number;
isFlipped?: boolean;
isOn?: boolean;
isTemp?: boolean;
presetId?: string;


interface TempFurnitureRendererProps {
tempFurniture: TempFurnitureItem[];
onConfirmPreset?: (presetId: string) => void;
onDeleteTempPreset?: (presetId: string) => void;


const TempFurnitureRenderer: React.FC<TempFurnitureRendererProps> = ({ 
tempFurniture, 
onConfirmPreset, 
onDeleteTempPreset 
) => {
const getFurnitureImage = (item: TempFurnitureItem) => {
// Check if this furniture type has toggle states
if (FURNITURE_TOGGLE_IMAGES[item.type]) {
return item.isOn ? FURNITURE_TOGGLE_IMAGES[item.type].on : FURNITURE_TOGGLE_IMAGES[item.type].off;

// Default to regular furniture image
return FURNITURE_IMAGES[item.type];
;

// Group temp furniture by presetId
const groupedFurniture = tempFurniture.reduce((groups, item) => {
const presetId = item.presetId || 'default';
if (!groups[presetId]) {
groups[presetId] = [];

groups[presetId].push(item);
return groups;
, { as { [key: string]: TempFurnitureItem[] );

return (
<>
{Object.entries(groupedFurniture).map(([presetId, items]) => {
if (items.length === 0) return null;

// Calculate group bounds
const minX = Math.min(...items.map(item => item.x));
const maxX = Math.max(...items.map(item => item.x));
const minY = Math.min(...items.map(item => item.y));
const maxY = Math.max(...items.map(item => item.y));
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;
const width = maxX - minX + 20; // Reduced padding from 100 to 20
const height = maxY - minY + 20; // Reduced padding from 100 to 20

return (
<div key={presetId style={{ position: 'relative' >
{/* Render furniture items */
{items.map((item) => (
<img
key={item.id
src={getFurnitureImage(item)
alt={item.type
data-furniture-id={item.id
data-furniture-type={item.type
data-temp-furniture="true"
style={{
position: 'absolute',
left: item.x,
top: item.y,
transform: 'translate(-50%, -50%)',
zIndex: (item.zIndex || Z_INDEX_LAYERS.FURNITURE) + 1000,
pointerEvents: 'all',
userSelect: 'none',
willChange: 'transform',
backfaceVisibility: 'hidden',
WebkitBackfaceVisibility: 'hidden',
WebkitTransform: `translate(-50%, -50%) ${item.isFlipped ? 'scaleX(-1)' : ''`,
transformStyle: 'preserve-3d',
borderRadius: '6px',
boxSizing: 'border-box',
WebkitTouchCallout: 'none',
WebkitTapHighlightColor: 'transparent',
border: '2px dashed white',
boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'

draggable={false
/>
))

{/* Group selection border */
<div
style={{
position: 'absolute',
left: centerX - width / 2,
top: centerY - height / 2,
width: width,
height: height,
border: '2px dashed white',
borderRadius: '8px',
pointerEvents: 'none',
zIndex: (Z_INDEX_LAYERS.FURNITURE) + 999,
boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)'

/>

{/* Control buttons */
<div
style={{
position: 'absolute',
left: centerX,
top: centerY - height / 2 - 40, // Reduced from 60 to 40
display: 'flex',
gap: '6px', // Reduced from 8px to 6px
zIndex: (Z_INDEX_LAYERS.FURNITURE) + 1001,
pointerEvents: 'all'

>
<button
onClick={() => onConfirmPreset?.(presetId)
style={{
background: 'linear-gradient(135deg, #4CAF50, #45a049)',
border: '2px solid #2E7D32',
borderRadius: '4px', // Reduced from 6px to 4px
color: 'white',
fontFamily: '"Press Start 2P", monospace',
fontSize: '0.5em', // Reduced from 0.6em to 0.5em
fontWeight: 'bold',
padding: '6px 12px', // Reduced from 8px 16px to 6px 12px
cursor: 'pointer',
textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
transition: 'all 0.2s ease'

>
✓ Confirm
</button>
<button
onClick={() => onDeleteTempPreset?.(presetId)
style={{
background: 'linear-gradient(135deg, #f44336, #d32f2f)',
border: '2px solid #c62828',
borderRadius: '4px', // Reduced from 6px to 4px
color: 'white',
fontFamily: '"Press Start 2P", monospace',
fontSize: '0.5em', // Reduced from 0.6em to 0.5em
fontWeight: 'bold',
padding: '6px 12px', // Reduced from 8px 16px to 6px 12px
cursor: 'pointer',
textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
transition: 'all 0.2s ease'

>
✗ Delete
</button>
</div>
</div>
);
)
</>
);
;

export default TempFurnitureRenderer; 