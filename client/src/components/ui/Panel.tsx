import React from 'react';
import { Socket  from 'socket.io-client';
import './Panel.css';
import HatButton from './HatButton';
import LockedHatButton from './LockedHatButton';


interface PanelProps {
socket: Socket | null;
onCursorChange: (cursor: { type: string ) => void;
cursorPosition?: { x: number; y: number; name?: string; stillTime: number; cursorType?: string; isFrozen?: boolean; frozenPosition?: { x: number; y: number ; sleepingOnBed?: boolean ;
style?: React.CSSProperties;


const Panel: React.FC<PanelProps> = ({
socket,
onCursorChange,
style
) => {

const handleHatClick = (hatType: string) => {
// hats panel click with datadog
hatType);

if (socket) {
socket.emit('changeCursor', { type: hatType );
onCursorChange({ type: hatType );

;



return (
<div className="panel-container" style={style>
<img src="/UI/transparentpanel.png" alt="Panel" className="panel-background" />

<div className="panel-content">
{/* hat buttons section */
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
<LockedHatButton hatType="easteregg1" onClick={handleHatClick />
<LockedHatButton hatType="balloon" onClick={handleHatClick />
</div>
<div className="button-row">
<LockedHatButton hatType="ffr" onClick={handleHatClick />
<LockedHatButton hatType="ghost" onClick={handleHatClick />
</div>
<div className="button-row">
<LockedHatButton hatType="loading" onClick={handleHatClick />
<HatButton src="/UI/deletehatbutton.png" alt="Delete Hat" hatType="default" onClick={handleHatClick />
</div>
</div>
</div>


</div>
</div>
);
;

export default Panel; 