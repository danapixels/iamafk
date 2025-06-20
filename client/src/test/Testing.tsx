import React, { useState } from 'react';
import { clearDailyFurnitureLimit, setAFKTimeForTesting, exportUserData } from '../utils/localStorage';

const Testing: React.FC = () => {
  const [afkTime, setAfkTime] = useState(0);
  const [message, setMessage] = useState('');

  const handleClearFurniture = () => {
    clearDailyFurnitureLimit();
    setMessage('Daily furniture placement limit cleared!');
  };

  const handleSetAFK = () => {
    setAFKTimeForTesting(Number(afkTime));
    setMessage(`AFK time set to ${afkTime} seconds!`);
  };

  const handleExportUserData = () => {
    exportUserData();
    setMessage('User data exported (check your downloads or console).');
  };

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: '40px auto', background: '#222', color: '#fff', borderRadius: 8 }}>
      <h2>Testing Utilities</h2>
      <p>Use these buttons to run test utilities for development and QA.</p>
      <button onClick={handleClearFurniture} style={{ margin: '8px 0', width: '100%' }}>
        Clear Daily Furniture Limit
      </button>
      <div style={{ margin: '12px 0' }}>
        <input
          type="number"
          value={afkTime}
          onChange={e => setAfkTime(Number(e.target.value))}
          placeholder="Set AFK time (seconds)"
          style={{ width: '70%', marginRight: 8 }}
        />
        <button onClick={handleSetAFK} style={{ width: '25%' }}>
          Set AFK Time
        </button>
      </div>
      <button onClick={handleExportUserData} style={{ margin: '8px 0', width: '100%' }}>
        Export User Data
      </button>
      {message && <div style={{ marginTop: 16, color: '#8f8' }}>{message}</div>}
      <div style={{ marginTop: 32, fontSize: 12, color: '#aaa' }}>
        <strong>Note:</strong> This panel is for development/testing only.<br />
        You can remove it from production builds.
      </div>
    </div>
  );
};

export default Testing; 