import React from 'react';
import { useUserStats } from '../contexts/UserStatsContext';

const Testing: React.FC = () => {
  const { 
    userStats, 
    updateAFKTime, 
    deductAFKBalance, 
    recordFurniturePlacement,
    canPlaceFurniture,
    getRemainingDailyPlacements,
    refreshStats
  } = useUserStats();

  const handleTestAFKTime = async () => {
    console.log('Testing AFK time update...');
    const success = await updateAFKTime(60); // Add 60 seconds
    console.log('AFK time update result:', success);
    if (success) {
      refreshStats(); // Refresh to see updated stats
    }
  };

  const handleTestDeductBalance = async () => {
    console.log('Testing AFK balance deduction...');
    const success = await deductAFKBalance(30); // Deduct 30 seconds
    console.log('AFK balance deduction result:', success);
    if (success) {
      refreshStats(); // Refresh to see updated stats
    }
  };

  const handleTestFurniturePlacement = async () => {
    console.log('Testing furniture placement...');
    const success = await recordFurniturePlacement('test-furniture');
    console.log('Furniture placement result:', success);
    if (success) {
      refreshStats(); // Refresh to see updated stats
    }
  };

  const handleTestDailyLimit = () => {
    console.log('Can place furniture:', canPlaceFurniture());
    console.log('Remaining daily placements:', getRemainingDailyPlacements());
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 10000,
      fontSize: '12px'
    }}>
      <h3>Server-Side Validation Testing</h3>
      
      <div>
        <strong>Current Stats:</strong>
        <pre>{JSON.stringify(userStats, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={handleTestAFKTime} style={{ margin: '2px' }}>
          Test AFK Time (+60s)
        </button>
        <button onClick={handleTestDeductBalance} style={{ margin: '2px' }}>
          Test Deduct Balance (-30s)
        </button>
        <button onClick={handleTestFurniturePlacement} style={{ margin: '2px' }}>
          Test Furniture Placement
        </button>
        <button onClick={handleTestDailyLimit} style={{ margin: '2px' }}>
          Test Daily Limit
        </button>
        <button onClick={refreshStats} style={{ margin: '2px' }}>
          Refresh Stats
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <strong>Security Features:</strong>
        <ul>
          <li>✅ AFK time validated server-side</li>
          <li>✅ Balance deductions validated server-side</li>
          <li>✅ Furniture placement limits enforced server-side</li>
          <li>✅ No localStorage manipulation possible</li>
          <li>✅ Real-time stats updates via Context API</li>
        </ul>
        
        <strong>Connection Status:</strong>
        <ul>
          <li>Context API: {userStats ? '✅ Connected' : '❌ Not Connected'}</li>
          <li>Stats Loading: {userStats ? '✅ Loaded' : '⏳ Loading...'}</li>
        </ul>
      </div>
    </div>
  );
};

export default Testing; 