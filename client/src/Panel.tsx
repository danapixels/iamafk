import React from 'react';
import { io, Socket  from 'socket.io-client';
import './Panel.css';

interface PanelProps {
socket: Socket | null;
onCursorChange: (cursorType: string) => void;


const Panel: React.FC<PanelProps> = ({ socket, onCursorChange ) => {
const handleHatClick = (hatType: string) => {
if (socket) {
socket.emit('changeCursor', { type: hatType );
onCursorChange(hatType);

;

return (
<div className="panel-container">
<img src="./UI/transparentpanel.png" alt="Panel" className="panel-background" />

<div className="panel-content">
{/* Hats Section */
<div className="panel-section">
<img src="./UI/hatstitle.png" alt="Hats" className="section-title" />
</div>

{/* Hat Buttons Section */
<div className="panel-section">
<div className="button-grid">
<div className="button-row">
<img 
src="./UI/bunnybutton.png" 
alt="Bunny Hat" 
className="button" 
onClick={() => handleHatClick('bunny')
/>
<img 
src="./UI/capbutton.png" 
alt="Cap" 
className="button" 
onClick={() => handleHatClick('cap')
/>
</div>
<div className="button-row">
<img 
src="./UI/slimebutton.png" 
alt="Slime Hat" 
className="button" 
onClick={() => handleHatClick('slime')
/>
<img 
src="./UI/astronautbutton.png" 
alt="Astronaut Hat" 
className="button" 
onClick={() => handleHatClick('astronaut')
/>
</div>
<div className="button-row">
<img 
src="./UI/beaniebutton.png" 
alt="Beanie" 
className="button" 
onClick={() => handleHatClick('beanie')
/>
<img 
src="./UI/headphonesbutton.png" 
alt="Headphones" 
className="button" 
onClick={() => handleHatClick('headphones')
/>
</div>
<div className="button-row">
<img 
src="./UI/sproutbutton.png" 
alt="Sprout Hat" 
className="button" 
onClick={() => handleHatClick('sprout')
/>
<img 
src="./UI/catbutton.png" 
alt="Cat Hat" 
className="button" 
onClick={() => handleHatClick('cathat')
/>
</div>
<div className="button-row">
<img 
src="./UI/deletehatbutton.png" 
alt="Delete Hat" 
className="button" 
onClick={() => handleHatClick('default')
/>
</div>
</div>
</div>

{/* Furniture Title Section */
<div className="panel-section">
<img src="./UI/furnituretitle.png" alt="Furniture" className="section-title" />
</div>

{/* Furniture Buttons Section */
<div className="panel-section">
<div className="button-grid">
<div className="button-row">
<img src="./UI/chairbutton.png" alt="Chair" className="button" />
<img src="./UI/lampbutton.png" alt="Lamp" className="button" />
<img src="./UI/bedbutton.png" alt="Bed" className="button" />
</div>
<div className="button-row">
<img src="./UI/wallsbutton.png" alt="Walls" className="button" />
<img src="./UI/plant1button.png" alt="Plant 1" className="button" />
<img src="./UI/plant2button.png" alt="Plant 2" className="button" />
</div>
<div className="button-row">
<img src="./UI/blackcatbutton.png" alt="Black Cat" className="button" />
<img src="./UI/whitecatbutton.png" alt="White Cat" className="button" />
<img src="./UI/deletefurniturebutton.png" alt="Delete Furniture" className="button" />
</div>
</div>
</div>
</div>
</div>
);
;

export default Panel; 