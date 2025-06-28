import { useState, useEffect } from 'react';
import { SERVER_CONFIG } from '../../constants';

interface StatueBadges {
  dailyBadge: boolean;
  crownBadge: boolean;
  gachaBadge: boolean;
}

interface UseStatueBadgesProps {
  cursors: { [key: string]: any };
  username: string;
  socket: any;
}

export const useStatueBadges = ({ cursors, username, socket }: UseStatueBadgesProps) => {
  const [badges, setBadges] = useState<StatueBadges>({
    dailyBadge: false,
    crownBadge: false,
    gachaBadge: false
  });

  useEffect(() => {
    if (!username || username === SERVER_CONFIG.ANONYMOUS_NAME) {
      setBadges({ dailyBadge: false, crownBadge: false, gachaBadge: false });
      return;
    }
    
    // Check daily badge - find the best stillTime among all users for today
    let dailyBest = { name: '', time: 0 };
    Object.values(cursors).forEach((cursor: any) => {
      if (!cursor || !cursor.name || cursor.name === SERVER_CONFIG.ANONYMOUS_NAME) return;
      const stillTime = cursor.stillTime || 0;
      if (stillTime > dailyBest.time) {
        dailyBest = { name: cursor.name, time: stillTime };
      }
    });

    // Check if current user has the daily badge
    const hasDailyBadge = dailyBest.name === username && dailyBest.time > 0;

    setBadges(prev => ({
      ...prev,
      dailyBadge: hasDailyBadge
    }));

  }, [cursors, username]);

  // Listen for all-time record updates
  useEffect(() => {
    if (!socket || !username) return;

    const handleAllTimeRecord = (record: { name: string; time: number }) => {
      setBadges(prev => ({
        ...prev,
        crownBadge: record.name === username
      }));
    };

    const handleAllTimeRecordUpdated = (record: { name: string; time: number }) => {
      setBadges(prev => ({
        ...prev,
        crownBadge: record.name === username
      }));
    };

    const handleJackpotRecord = (record: { name: string; wins: number }) => {
      setBadges(prev => ({
        ...prev,
        gachaBadge: record.name === username
      }));
    };

    const handleJackpotRecordUpdated = (record: { name: string; wins: number }) => {
      setBadges(prev => ({
        ...prev,
        gachaBadge: record.name === username
      }));
    };

    // Request current records
    socket.emit('requestAllTimeRecord');
    socket.emit('requestJackpotRecord');

    // Listen for updates
    socket.on('allTimeRecord', handleAllTimeRecord);
    socket.on('allTimeRecordUpdated', handleAllTimeRecordUpdated);
    socket.on('jackpotRecord', handleJackpotRecord);
    socket.on('jackpotRecordUpdated', handleJackpotRecordUpdated);

    return () => {
      socket.off('allTimeRecord', handleAllTimeRecord);
      socket.off('allTimeRecordUpdated', handleAllTimeRecordUpdated);
      socket.off('jackpotRecord', handleJackpotRecord);
      socket.off('jackpotRecordUpdated', handleJackpotRecordUpdated);
    };
  }, [socket, username]);

  return badges;
}; 