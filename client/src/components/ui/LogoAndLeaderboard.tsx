import React, { useState, useEffect, memo, useMemo } from 'react';
import { UI_IMAGES, GITHUB_URL, Z_INDEX_LAYERS, SERVER_CONFIG } from '../../constants';

interface LogoAndLeaderboardProps {
  cursors: { [key: string]: any };
}

export const LogoAndLeaderboard: React.FC<LogoAndLeaderboardProps> = memo(({ cursors }) => {
  const [highestAFKRecords, setHighestAFKRecords] = useState<{ [key: string]: { name: string; time: number } }>({});

  // Track the highest stillTime for each user by username (not cursor ID)
  useEffect(() => {
    const newRecords = { ...highestAFKRecords };
    let updated = false;

    Object.entries(cursors).forEach(([, cursor]) => {
      if (!cursor || !cursor.name || cursor.name === SERVER_CONFIG.ANONYMOUS_NAME) return;
      
      const currentStillTime = cursor.stillTime || 0;
      const username = cursor.name;
      const existingRecord = newRecords[username];
      
      // Update record if current stillTime is higher than previous record for this username
      if (!existingRecord || currentStillTime > existingRecord.time) {
        newRecords[username] = { name: username, time: currentStillTime };
        updated = true;
      }
    });

    if (updated) {
      setHighestAFKRecords(newRecords);
    }
  }, [cursors, highestAFKRecords]);

  // Memoize the highest AFK player calculation
  const highestAFKPlayer = useMemo(() => {
    let highestAFK = { name: '', time: 0 };
    
    // Find the user with the highest recorded stillTime
    Object.values(highestAFKRecords).forEach(record => {
      if (record.time > highestAFK.time) {
        highestAFK = record;
      }
    });
    
    return highestAFK;
  }, [highestAFKRecords]);

  return (
    <div id="logo-container" style={{ zIndex: Z_INDEX_LAYERS.LOGO }}>
      <div className="logo-row">
        <img src={UI_IMAGES.LOGO} alt="Logo" id="logo" />
        <a 
          href={GITHUB_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ pointerEvents: 'all' }}
        >
          <img src={UI_IMAGES.GITHUB_LOGO} alt="GitHub" id="github-logo" />
        </a>
      </div>
      <div style={{ position: 'relative', margin: 0, padding: 0 }}>
        <img src={UI_IMAGES.LEADERBOARD} alt="Leaderboard" id="leaderboard" />
        <div style={{ 
          position: 'absolute', 
          top: 'calc(50% + 12px)', 
          left: 'calc(50% + 38px)', 
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '0.5rem',
          color: 'white',
          textShadow: '2px 2px 0 #000',
          textAlign: 'left',
          width: '100%',
          pointerEvents: 'none',
          maxWidth: '200px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {highestAFKPlayer.name.length > 8 
            ? `${highestAFKPlayer.name.slice(0, 8)}⋯`
            : highestAFKPlayer.name}
        </div>
      </div>
    </div>
  );
}); 