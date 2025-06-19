import React, { useState, useEffect  from 'react';
import { Socket  from 'socket.io-client';
import './Panel.css';

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
// @ts-ignore - cursorPosition is required by PanelProps but not used in this component
cursorPosition, 
viewportOffset, 
gachaponWinner, 
style, 
username
) => {
const [showTooltip, setShowTooltip] = useState(false);
const [gachaponWin, setGachaponWin] = useState(false);
const [localGachaponWinner, setLocalGachaponWinner] = useState<string | null>(null);

// Check for gachapon win on component mount
useEffect(() => {
const hasWon = localStorage.getItem('gachaponWin') === 'true';
const buttonChanged = localStorage.getItem('gachaponButtonChanged') === 'true';

// Show easter egg button for all users who were online at the time of win
if (hasWon && buttonChanged) {
setGachaponWin(true);
setLocalGachaponWinner(localStorage.getItem('gachaponWinnerName'));

, []);

// Update gachapon state when prop changes
useEffect(() => {
// Show easter egg button for all users who were online at the time of win
if (gachaponWinner) {
setGachaponWin(true);
// Get the winner name from localStorage
const winnerName = localStorage.getItem('gachaponWinnerName');
setLocalGachaponWinner(winnerName);

, [gachaponWinner]);

const handleHatClick = (hatType: string) => {
if (socket) {
socket.emit('changeCursor', { type: hatType );
onCursorChange({ type: hatType );

;

const handleFurnitureClick = (type: string) => {
// Spawn furniture in the center of the screen
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

// Convert screen coordinates to canvas coordinates
// We need to add the viewport offset to get the actual canvas position
const canvasX = centerX + (viewportOffset?.x || 0);
const canvasY = centerY + (viewportOffset?.y || 0);

if (onFurnitureSpawn) {
onFurnitureSpawn(type, canvasX, canvasY);
 else if (socket) {
// Fallback to direct socket emission if no handler provided
socket.emit('spawnFurniture', { 
type,
x: canvasX,
y: canvasY
);

;

return (
<div className="panel-container" style={style>
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
<div className="locked-button-container" style={{ position: 'relative', display: 'flex' >
<img 
src={gachaponWin ? './UI/easteregg1button.png' : './UI/lockedbutton.png' 
alt="Locked" 
className="button"
style={{ cursor: 'pointer' 
onMouseEnter={({ currentTarget ) => {
currentTarget.src = gachaponWin ? './UI/easteregg1buttonhover.png' : './UI/lockedbuttonhover.png';
setShowTooltip(true);

onMouseLeave={(e) => {
e.currentTarget.src = gachaponWin ? './UI/easteregg1button.png' : './UI/lockedbutton.png';
setShowTooltip(false);

onClick={() => {
if (gachaponWin) {
handleHatClick('easteregg1');


/>
<div 
className="tooltip" 
style={{
position: 'absolute',
top: '10px',
right: '100%',
marginRight: '10px',
backgroundColor: 'rgba(0, 0, 0, 0.7)',
color: 'white',
padding: '4px 8px',
borderRadius: '14px',
fontSize: '8px',
fontFamily: '"Press Start 2P", monospace',
whiteSpace: 'nowrap',
opacity: showTooltip ? 1 : 0,
visibility: showTooltip ? 'visible' : 'hidden',
transition: 'opacity 0.3s, visibility 0.3s',
zIndex: 99999,

>
{gachaponWin && localGachaponWinner ? 
(username && username === localGachaponWinner ? 
'you did it!' : 
`${localGachaponWinner won the 1%!`
) : 
'30m = 1 gacha play'

</div>
</div>
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
<img 
src="./UI/chairbutton.png" 
alt="Chair" 
className="button"
onClick={() => handleFurnitureClick('chair')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/chairbuttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/chairbutton.png';

/>
<img 
src="./UI/lampbutton.png" 
alt="Lamp" 
className="button"
onClick={() => handleFurnitureClick('lamp')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/lampbuttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/lampbutton.png';

/>
<img 
src="./UI/bedbutton.png" 
alt="Bed" 
className="button"
onClick={() => handleFurnitureClick('bed')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/bedbuttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/bedbutton.png';

/>
</div>
<div className="button-row">
<img 
src="./UI/wallsbutton.png" 
alt="Walls" 
className="button"
onClick={() => handleFurnitureClick('walls')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/wallsbuttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/wallsbutton.png';

/>
<img 
src="./UI/plant1button.png" 
alt="Plant 1" 
className="button"
onClick={() => handleFurnitureClick('plant1')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/plant1buttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/plant1button.png';

/>
<img 
src="./UI/plant2button.png" 
alt="Plant 2" 
className="button"
onClick={() => handleFurnitureClick('plant2')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/plant2buttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/plant2button.png';

/>
</div>
<div className="button-row">
<img 
src="./UI/blackcatbutton.png" 
alt="Black Cat" 
className="button"
onClick={() => handleFurnitureClick('blackcat')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/blackcatbuttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/blackcatbutton.png';

/>
<img 
src="./UI/whitecatbutton.png" 
alt="White Cat" 
className="button"
onClick={() => handleFurnitureClick('whitecat')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/whitecatbuttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/whitecatbutton.png';

/>
<img
src="./UI/tablebutton.png"
alt="Table"
className="button"
onClick={() => handleFurnitureClick('table')
onMouseEnter={(e) => {
e.currentTarget.src = './UI/tablebuttonhover.png';

onMouseLeave={(e) => {
e.currentTarget.src = './UI/tablebutton.png';

/>
</div>
</div>
</div>
</div>
</div>
);
;

export default Panel; 