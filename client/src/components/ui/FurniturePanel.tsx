import React from 'react';
import { Socket  from 'socket.io-client';
import './FurniturePanel.css';
import FurnitureButton from './FurnitureButton';

interface FurniturePanelProps {
socket: Socket | null;
onFurnitureSpawn?: (type: string, x: number, y: number) => void;
viewportOffset?: { x: number; y: number ;
style?: React.CSSProperties;


const FurniturePanel: React.FC<FurniturePanelProps> = ({
socket,
onFurnitureSpawn,
viewportOffset,
style
) => {
const handleFurnitureClick = (type: string) => {
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
const canvasX = centerX + (viewportOffset?.x || 0);
const canvasY = centerY + (viewportOffset?.y || 0);

if (onFurnitureSpawn) {
onFurnitureSpawn(type, canvasX, canvasY);
 else if (socket) {
socket.emit('spawnFurniture', { 
type,
x: canvasX,
y: canvasY
);

;

return (
<div className="furniture-panel-container" style={style>
<img src="/UI/transparentfurniturepanel.png" alt="Furniture Panel" className="furniture-panel-background" />

<div className="furniture-panel-content">
{/* Furniture Buttons Section */
<div className="furniture-panel-section">
<div className="button-grid">
<div className="button-row">
<FurnitureButton src="/UI/chairbutton.png" hoverSrc="/UI/chairbuttonhover.png" alt="Chair" type="chair" onClick={handleFurnitureClick />
<FurnitureButton src="/UI/lampbutton.png" hoverSrc="/UI/lampbuttonhover.png" alt="Lamp" type="lamp" onClick={handleFurnitureClick />
<FurnitureButton src="/UI/bedbutton.png" hoverSrc="/UI/bedbuttonhover.png" alt="Bed" type="bed" onClick={handleFurnitureClick />
</div>
<div className="button-row">
<FurnitureButton src="/UI/wallsbutton.png" hoverSrc="/UI/wallsbuttonhover.png" alt="Walls" type="walls" onClick={handleFurnitureClick />
<FurnitureButton src="/UI/plant1button.png" hoverSrc="/UI/plant1buttonhover.png" alt="Plant 1" type="plant1" onClick={handleFurnitureClick />
<FurnitureButton src="/UI/plant2button.png" hoverSrc="/UI/plant2buttonhover.png" alt="Plant 2" type="plant2" onClick={handleFurnitureClick />
</div>
<div className="button-row">
<FurnitureButton src="/UI/blackcatbutton.png" hoverSrc="/UI/blackcatbuttonhover.png" alt="Black Cat" type="blackcat" onClick={handleFurnitureClick />
<FurnitureButton src="/UI/whitecatbutton.png" hoverSrc="/UI/whitecatbuttonhover.png" alt="White Cat" type="whitecat" onClick={handleFurnitureClick />
<FurnitureButton src="/UI/tablebutton.png" hoverSrc="/UI/tablebuttonhover.png" alt="Table" type="table" onClick={handleFurnitureClick />
</div>
</div>
</div>
</div>
</div>
);
;

export default FurniturePanel; 