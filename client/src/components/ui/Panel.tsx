import React, { useState, useEffect  from 'react';
import { Socket  from 'socket.io-client';
import './Panel.css';
import HatButton from './HatButton';
import LockedHatButton from './LockedHatButton';

interface PanelProps {
socket: Socket | null;
onCursorChange: (cursor: { type: string ) => void;
cursorPosition?: { x: number; y: number; name?: string; stillTime: number; cursorType?: string; isFrozen?: boolean; frozenPosition?: { x: number; y: number ; sleepingOnBed?: boolean ;
gachaponWinner?: string | null;
style?: React.CSSProperties;
username?: string;
lastWinner?: string;


const Panel: React.FC<PanelProps> = ({
socket,
onCursorChange,
gachaponWinner,
style,
username,
lastWinner
) => {
const [gachaponWin, setGachaponWin] = useState(false);
const [localGachaponWinner, setLocalGachaponWinner] = useState<string | null>(null);

useEffect(() => {
const hasWon = localStorage.getItem('gachaponWin') === 'true';
const buttonChanged = localStorage.getItem('gachaponButtonChanged') === 'true';

if (hasWon && buttonChanged) {
setGachaponWin(true);
setLocalGachaponWinner(lastWinner || null);

, [lastWinner]);

useEffect(() => {
if (gachaponWinner) {
setGachaponWin(true);
setLocalGachaponWinner(lastWinner || null);

, [gachaponWinner, lastWinner]);

const handleHatClick = (hatType: string) => {
if (socket) {
socket.emit('changeCursor', { type: hatType );
onCursorChange({ type: hatType );

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


</div>
</div>
);
;

export default Panel; 