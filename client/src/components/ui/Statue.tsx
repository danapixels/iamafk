import React, { useState, useEffect, memo } from 'react';
import { UI_IMAGES, SERVER_CONFIG } from '../../constants';

interface StatueProps {
  cursors: { [key: string]: any };
  style?: React.CSSProperties;
}

// Helper to get today's date string in UTC (YYYY-MM-DD)
const getTodayUTC = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const Statue: React.FC<StatueProps> = memo(({ cursors, style }) => {
  // Record: { name, time, date }
  const [dailyRecord, setDailyRecord] = useState<{ name: string; time: number; date: string }>({
    name: '',
    time: 0,
    date: getTodayUTC(),
  });

  useEffect(() => {
    const today = getTodayUTC();
    // Reset record if date changed
    if (dailyRecord.date !== today) {
      setDailyRecord({ name: '', time: 0, date: today });
      return;
    }
    // Find the best stillTime among all users for today
    let best = { name: dailyRecord.name, time: dailyRecord.time };
    Object.values(cursors).forEach((cursor: any) => {
      if (!cursor || !cursor.name || cursor.name === SERVER_CONFIG.ANONYMOUS_NAME) return;
      const stillTime = cursor.stillTime || 0;
      // Only update if someone beats the record
      if (stillTime > best.time) {
        best = { name: cursor.name, time: stillTime };
      }
    });
    // Only update if the record is beaten
    if (best.time > dailyRecord.time) {
      setDailyRecord({ name: best.name, time: best.time, date: today });
    }
  }, [cursors, dailyRecord]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div 
      style={{ 
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0px'
      }}
    >
      {/* Statue image */}
      <img 
        src={UI_IMAGES.STATUE} 
        alt="Statue" 
        style={{
          width: 'auto',
          height: 'auto',
          display: 'block'
        }}
      />
      
      {/* Daily image with leaderboard text underneath */}
      <div style={{ position: 'relative', margin: 0, padding: 0 }}>
        <img 
          src={UI_IMAGES.DAILY} 
          alt="Daily" 
          style={{
            width: 'auto',
            height: 'auto',
            display: 'block'
          }}
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
        }}>
          {dailyRecord.name.length > 8 
            ? `${dailyRecord.name.slice(0, 8)}⋯`
            : dailyRecord.name || '—'}
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
        }}>
          {dailyRecord.time > 0 ? formatTime(dailyRecord.time) : '--'}
        </div>
      </div>
    </div>
  );
}); 