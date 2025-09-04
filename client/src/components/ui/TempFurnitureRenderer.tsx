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
// checks if this furniture type has toggle states
if (FURNITURE_TOGGLE_IMAGES[item.type]) {
return item.isOn ? FURNITURE_TOGGLE_IMAGES[item.type].on : FURNITURE_TOGGLE_IMAGES[item.type].off;

// defaults to regular furniture image
return FURNITURE_IMAGES[item.type];
;

// groups temp furniture by presetId
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

// Calculate group bounds dynamically based on furniture size
const minX = Math.min(...items.map(item => item.x));
const maxX = Math.max(...items.map(item => item.x));
const minY = Math.min(...items.map(item => item.y));
const maxY = Math.max(...items.map(item => item.y));
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;

// calculates dynamic padding based on furniture size
const furnitureWidth = maxX - minX;
const furnitureHeight = maxY - minY;
const padding = Math.max(40, Math.min(furnitureWidth, furnitureHeight) * 0.3); // 40px minimum, or 30% of smaller dimension

const width = furnitureWidth + padding * 2;
const height = furnitureHeight + padding * 2;

return (
<div key={presetId style={{ position: 'relative' >
{/* render furniture items */
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
WebkitTapHighlightColor: 'transparent'

draggable={false
/>
))

{/* gruoup selection border */
<div
style={{
position: 'absolute',
left: centerX - width / 2,
top: centerY - height / 2,
width: width,
height: height,
border: '1px dashed white',
borderRadius: '8px',
pointerEvents: 'none',
zIndex: (Z_INDEX_LAYERS.FURNITURE) + 999,

/>

{/* control buttons */
<div
style={{
position: 'absolute',
left: centerX,
top: centerY - height / 2 - Math.max(25, padding * 0.8), // Reduced space above the border
display: 'flex',
gap: '6px',
zIndex: (Z_INDEX_LAYERS.FURNITURE) + 1001,
pointerEvents: 'all'

>
<button
onClick={() => onConfirmPreset?.(presetId)
style={{
background: 'none',
border: 'none',
cursor: 'pointer',
padding: 0,
transition: 'transform 0.1s ease'

>
<img 
src="/UI/checkbutton.png" 
alt=""
onMouseOver={(e) => {
e.currentTarget.src = "/UI/checkbuttonhover.png";

onMouseOut={(e) => {
e.currentTarget.src = "/UI/checkbutton.png";

/>
</button>
<button
onClick={() => onDeleteTempPreset?.(presetId)
style={{
background: 'none',
border: 'none',
cursor: 'pointer',
padding: 0,
transition: 'transform 0.1s ease'

>
<img 
src="/UI/deletefurniturebutton.png" 
alt="Delete Preset"
onMouseOver={(e) => {
e.currentTarget.src = "/UI/deletefurniturebuttonhover.png";

onMouseOut={(e) => {
e.currentTarget.src = "/UI/deletefurniturebutton.png";

/>
</button>
</div>
</div>
);
)
</>
);
;

export default TempFurnitureRenderer; 