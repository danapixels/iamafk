import React, { useState, useEffect, memo } from 'react';
import { UI_IMAGES } from '../../constants';

interface AllTimeStatueProps {
  socket: any;
  style?: React.CSSProperties;
}

interface AllTimeRecord {
  name: string;
  time: number;
  lastUpdated: number;
}

export const AllTimeStatue: React.FC<AllTimeStatueProps> = memo(({ socket, style }) => {
  const [allTimeRecord, setAllTimeRecord] = useState<AllTimeRecord>({
    name: '',
    time: 0,
    lastUpdated: 0
  });

  useEffect(() => {
    if (socket) {
      // Request the all-time record when component mounts
      socket.emit('requestAllTimeRecord');

      // Listen for all-time record updates
      const handleAllTimeRecord = (record: AllTimeRecord) => {
        setAllTimeRecord(record);
      };

      const handleAllTimeRecordUpdated = (record: AllTimeRecord) => {
        setAllTimeRecord(record);
      };

      socket.on('allTimeRecord', handleAllTimeRecord);
      socket.on('allTimeRecordUpdated', handleAllTimeRecordUpdated);

      return () => {
        socket.off('allTimeRecord', handleAllTimeRecord);
        socket.off('allTimeRecordUpdated', handleAllTimeRecordUpdated);
      };
    }
  }, [socket]);

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
      
      {/* All-time image with leaderboard text underneath */}
      <div style={{ position: 'relative', margin: 0, padding: 0 }}>
        <img 
          src={UI_IMAGES.ALLTIME} 
          alt="All Time" 
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
          {allTimeRecord.name.length > 8 
            ? `${allTimeRecord.name.slice(0, 8)}⋯`
            : allTimeRecord.name || '—'}
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
          {allTimeRecord.time > 0 ? formatTime(allTimeRecord.time) : '--'}
        </div>
      </div>
    </div>
  );
}); 