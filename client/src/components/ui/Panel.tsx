import React, { useState, useEffect  from 'react';
import { Socket  from 'socket.io-client';
import './Panel.css';
import HatButton from './HatButton';
import LockedHatButton from './LockedHatButton';
import FurnitureButton from './FurnitureButton';

interface PanelProps {
socket: Socket | null;
onCursorChange: (cursor: { type: string ) => void;
onFurnitureSpawn?: (type: string, x: number, y: number) => void;
cursorPosition?: { x: number; y: number; name?: string; stillTime: number; cursorType?: string; isFrozen?: boolean; frozenPosition?: { x: number; y: number ; sleepingOnBed?: boolean ;
viewportOffset?: { x: number; y: number ;
gachaponWinner?: string | null;
style?: React.CSSProperties;
username?: string;


const Panel: React.FC<PanelProps> = ({
socket,
onCursorChange,
onFurnitureSpawn,
viewportOffset,
gachaponWinner,
style,
username
) => {
const [gachaponWin, setGachaponWin] = useState(false);
const [localGachaponWinner, setLocalGachaponWinner] = useState<string | null>(null);

useEffect(() => {
const hasWon = localStorage.getItem('gachaponWin') === 'true';
const buttonChanged = localStorage.getItem('gachaponButtonChanged') === 'true';

if (hasWon && buttonChanged) {
setGachaponWin(true);
setLocalGachaponWinner(localStorage.getItem('gachaponWinnerName'));

, []);

useEffect(() => {
if (gachaponWinner) {
setGachaponWin(true);
const winnerName = localStorage.getItem('gachaponWinnerName');
setLocalGachaponWinner(winnerName);

, [gachaponWinner]);

const handleHatClick = (hatType: string) => {
if (socket) {
socket.emit('changeCursor', { type: hatType );
onCursorChange({ type: hatType );

;

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
<div className="panel-container" style={style>
<img src="/UI/transparentpanel.png" alt="Panel" className="panel-background" />

<div className="panel-content">
{/* Hats Section */
<div className="panel-section">
<img src="/UI/hatstitle.png" alt="Hats" className="section-title" />
</div>

{/* Hat Buttons Section */
<div className="panel-section">
<div className="button-grid">
<div className="button-row">
<HatButton src="/UI/bunnybutton.png" alt="Bunny Hat" hatType="bunny" onClick={handleHatClick />
<HatButton src="/UI/capbutton.png" alt="Cap" hatType="cap" onClick={handleHatClick />
</div>
<div className="button-row">
<HatButton src="/UI/slimebutton.png" alt="Slime Hat" hatType="slime" onClick={handleHatClick />
<HatButton src="/UI/astronautbutton.png" alt="Astronaut Hat" hatType="astronaut" onClick={handleHatClick />
</div>
<div className="button-row">
<HatButton src="/UI/beaniebutton.png" alt="Beanie" hatType="beanie" onClick={handleHatClick />
<HatButton src="/UI/headphonesbutton.png" alt="Headphones" hatType="headphones" onClick={handleHatClick />
</div>
<div className="button-row">
<HatButton src="/UI/sproutbutton.png" alt="Sprout Hat" hatType="sprout" onClick={handleHatClick />
<HatButton src="/UI/catbutton.png" alt="Cat Hat" hatType="cathat" onClick={handleHatClick />
</div>
<div className="button-row">
<LockedHatButton gachaponWin={gachaponWin localGachaponWinner={localGachaponWinner username={username onClick={handleHatClick />
<HatButton src="/UI/deletehatbutton.png" alt="Delete Hat" hatType="default" onClick={handleHatClick />
</div>
</div>
</div>

{/* Furniture Title Section */
<div className="panel-section">
<img src="/UI/furnituretitle.png" alt="Furniture" className="section-title" />
</div>

{/* Furniture Buttons Section */
<div className="panel-section">
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

export default Panel; 