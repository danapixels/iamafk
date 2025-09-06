import React from 'react';
import { useUserStats  from '../contexts/UserStatsContext';

const Testing: React.FC = () => {
const { 
userStats, 
deductAFKBalance, 
addAFKTime,
refreshStats
 = useUserStats();

// deduct AFK time
const handleTestDeductBalance = async () => {
console.log('Testing AFK balance deduction...');
const success = await deductAFKBalance(30); // deducts 30 seconds
console.log('AFK balance deduction result:', success);
if (success) {
refreshStats(); // refreshes to see updated stats

;
 // add AFK time
const handleAddAFKTime = async (minutes: number) => {
console.log(`Adding ${minutes minutes of AFK time...`);
const seconds = minutes * 60;
const success = await addAFKTime(seconds);
console.log('AFK time addition result:', success);
if (success) {
refreshStats(); // refreshes to see updated stats

;
// refresh stats
const handleRefreshStats = async () => {
console.log('Refreshing stats...');
await refreshStats();
console.log('Stats refreshed');
;
// return the testing panel to add afk balance and deduct afk balance
return (
<div style={{ 
position: 'fixed', 
top: '10px', 
left: '50%', 
transform: 'translateX(-50%)',
background: 'rgba(0,0,0,0.8)', 
color: 'white', 
padding: '8px', 
borderRadius: '5px',
zIndex: 10000,
fontSize: '10px',
maxWidth: '200px'
>
<h4 style={{ margin: '0 0 8px 0', fontSize: '11px' >Testing Panel</h4>

<div style={{ marginBottom: '8px' >
<strong>AFK Balance:</strong> {userStats?.afkBalance ? Math.floor(userStats.afkBalance / 60) + 'm' : '0m'
</div>

<div style={{ marginBottom: '8px' >
<button onClick={() => handleAddAFKTime(1) style={{ margin: '1px', fontSize: '9px', padding: '2px 4px' >
+1m
</button>
<button onClick={() => handleAddAFKTime(5) style={{ margin: '1px', fontSize: '9px', padding: '2px 4px' >
+5m
</button>
<button onClick={() => handleAddAFKTime(30) style={{ margin: '1px', fontSize: '9px', padding: '2px 4px' >
+30m
</button>
<button onClick={() => handleAddAFKTime(60) style={{ margin: '1px', fontSize: '9px', padding: '2px 4px' >
+1h
</button>
</div>

<div style={{ marginBottom: '8px' >
<button onClick={handleTestDeductBalance style={{ margin: '1px', fontSize: '9px', padding: '2px 4px' >
-30s
</button>
<button onClick={refreshStats style={{ margin: '1px', fontSize: '9px', padding: '2px 4px' >
Refresh
</button>
</div>

<div style={{ fontSize: '8px', opacity: 0.8 >
Status: {userStats ? '✅ Connected' : '❌ Loading...'
</div>
</div>
);
;

export default Testing; 