import React, { useState, useEffect, memo  from 'react';
import { UI_IMAGES  from '../../constants';

interface JackpotStatueProps {
socket: any;
style?: React.CSSProperties;


interface JackpotRecord {
name: string;
wins: number;
lastUpdated: number;


export const JackpotStatue: React.FC<JackpotStatueProps> = memo(({ socket, style ) => {
const [jackpotRecord, setJackpotRecord] = useState<JackpotRecord>({
name: '',
wins: 0,
lastUpdated: 0
);

useEffect(() => {
if (socket) {
// requests the jackpot record when component mounts
socket.emit('requestJackpotRecord');

// listens for jackpot record updates
const handleJackpotRecord = (record: JackpotRecord) => {
setJackpotRecord(record);
;

const handleJackpotRecordUpdated = (record: JackpotRecord) => {
setJackpotRecord(record);
;

socket.on('jackpotRecord', handleJackpotRecord);
socket.on('jackpotRecordUpdated', handleJackpotRecordUpdated);

return () => {
socket.off('jackpotRecord', handleJackpotRecord);
socket.off('jackpotRecordUpdated', handleJackpotRecordUpdated);
;

, [socket]);

return (
<div 
style={{ 
...style,
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
gap: '0px'

>
{/* statue image */
<img 
src={UI_IMAGES.STATUE 
alt="Statue" 
style={{
width: 'auto',
height: 'auto',
display: 'block'

/>

{/* jackpot image with leaderboard text underneath */
<div style={{ position: 'relative', margin: 0, padding: 0 >
<img 
src={UI_IMAGES.JACKPOTS 
alt="Jackpots" 
style={{
width: 'auto',
height: 'auto',
display: 'block'

/>
<div style={{ 
position: 'absolute', 
top: 'calc(50% + 20px)', 
left: 'calc(50% + 5px)', 
transform: 'translate(-50%, -50%)',
fontFamily: '"Press Start 2P", cursive',
fontSize: '0.5rem',
color: 'white',
textShadow: '2px 2px 0 #000',
textAlign: 'center',
width: '100%',
pointerEvents: 'none',
maxWidth: '200px',
whiteSpace: 'nowrap',
overflow: 'hidden',
textOverflow: 'ellipsis'
>
{jackpotRecord.name.length > 8 
? `${jackpotRecord.name.slice(0, 8)⋯`
: jackpotRecord.name || '—'
</div>
<div style={{ 
position: 'absolute', 
top: 'calc(50% + 35px)', 
left: 'calc(50% + 5px)', 
transform: 'translate(-50%, -50%)',
fontFamily: '"Press Start 2P", cursive',
fontSize: '0.4rem',
color: 'white',
textShadow: '2px 2px 0 #000',
textAlign: 'center',
width: '100%',
pointerEvents: 'none',
maxWidth: '200px',
whiteSpace: 'nowrap',
overflow: 'hidden',
textOverflow: 'ellipsis'
>
{jackpotRecord.wins > 0 ? `${jackpotRecord.wins wins` : '--'
</div>
</div>
</div>
);
); 