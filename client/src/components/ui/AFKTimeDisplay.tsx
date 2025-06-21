import React from 'react';
import { Z_INDEX_LAYERS  from '../../constants';
import { formatTime  from '../../utils/helpers';

interface AFKTimeDisplayProps {
hasConnected: boolean;
userStats: any;


export const AFKTimeDisplay: React.FC<AFKTimeDisplayProps> = ({ hasConnected, userStats ) => {
if (!hasConnected || !userStats) return null;
return (
<div style={{
position: 'fixed',
bottom: '20px',
left: '20px',
zIndex: Z_INDEX_LAYERS.PANEL,
pointerEvents: 'none'
>
{/* Lifetime Total AFK Time (never deducted) */
<div style={{
marginBottom: '8px',
position: 'relative'
>
{hasConnected && userStats && (
<div style={{
fontFamily: '"Press Start 2P", monospace',
fontSize: '0.5rem',
color: 'white',
textAlign: 'left',
whiteSpace: 'nowrap',
pointerEvents: 'none',
opacity: '0.2',
>
you've been away for {formatTime(userStats.totalAFKTime)
</div>
)
</div>

{/* AFK Balance (spendable) */
<div style={{
position: 'relative'
>
<img 
src="/UI/totalafk.png" 
alt="AFK Balance" 
style={{
width: 'auto',
height: 'auto',
display: 'block'

/>
{hasConnected && userStats && (
<div style={{
position: 'absolute',
top: '50%',
left: '60%',
transform: 'translate(-50%, -50%)',
fontFamily: '"Press Start 2P", monospace',
fontSize: '0.5rem',
color: 'white',
textAlign: 'left',
whiteSpace: 'nowrap',
marginLeft: '20px'
>
{formatTime(userStats.afkBalance)
</div>
)
</div>
</div>
);
; 