import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Socket } from 'socket.io-client';

console.log("👀 UserStatsContext loaded");

interface UserStats {
  username: string;
  totalAFKTime: number;
  afkBalance: number;
  furniturePlaced: number;
  furnitureByType: { [type: string]: number };
  lastSeen: number;
  firstSeen: number;
  sessions: number;
  dailyFurniturePlacements: { [date: string]: number };
}

interface UserStatsContextType {
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => void;
  deductAFKBalance: (seconds: number) => Promise<boolean>;
  recordFurniturePlacement: (type: string) => Promise<boolean>;
  canPlaceFurniture: () => boolean;
  getRemainingDailyPlacements: () => number;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

interface UserStatsProviderProps {
  children: ReactNode;
  socket: Socket | null;
  hasConnected: boolean;
  username: string;
}

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({
  children,
  socket,
  hasConnected,
  username
}) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request user stats from server
  const refreshStats = () => {
    if (socket?.connected && hasConnected) {
      setIsLoading(true);
      setError(null);
      socket.emit('requestUserStats');
    }
  };

  // Deduct AFK balance (server-validated)
  const deductAFKBalance = async (seconds: number): Promise<boolean> => {
    if (!socket?.connected || !hasConnected) return false;
    
    return new Promise((resolve) => {
      socket.emit('deductAFKBalance', { seconds }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          refreshStats(); // Refresh stats after successful deduction
          resolve(true);
        } else {
          setError(response.error || 'Failed to deduct AFK balance');
          resolve(false);
        }
      });
    });
  };

  // Record furniture placement (server-validated)
  const recordFurniturePlacement = async (type: string): Promise<boolean> => {
    if (!socket?.connected || !hasConnected) return false;
    
    return new Promise((resolve) => {
      socket.emit('recordFurniturePlacement', { type }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          refreshStats(); // Refresh stats after successful placement
          resolve(true);
        } else {
          setError(response.error || 'Failed to record furniture placement');
          resolve(false);
        }
      });
    });
  };

  // Check if user can place furniture (based on server data)
  const canPlaceFurniture = (): boolean => {
    if (!userStats) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const dailyPlacements = userStats.dailyFurniturePlacements[today] || 0;
    const DAILY_FURNITURE_LIMIT = 1000;
    
    return dailyPlacements < DAILY_FURNITURE_LIMIT;
  };

  // Get remaining daily furniture placements
  const getRemainingDailyPlacements = (): number => {
    if (!userStats) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const dailyPlacements = userStats.dailyFurniturePlacements[today] || 0;
    const DAILY_FURNITURE_LIMIT = 1000;
    
    return Math.max(0, DAILY_FURNITURE_LIMIT - dailyPlacements);
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !hasConnected) return;

    const handleUserStats = (stats: UserStats) => {
      setUserStats(stats);
      setIsLoading(false);
      setError(null);
    };

    const handleStatsError = (error: string) => {
      setError(error);
      setIsLoading(false);
    };

    socket.on('userStats', handleUserStats);
    socket.on('statsError', handleStatsError);

    // Request initial stats
    refreshStats();

    return () => {
      socket.off('userStats', handleUserStats);
      socket.off('statsError', handleStatsError);
    };
  }, [socket, hasConnected, username]);

  const value: UserStatsContextType = {
    userStats,
    isLoading,
    error,
    refreshStats,
    deductAFKBalance,
    recordFurniturePlacement,
    canPlaceFurniture,
    getRemainingDailyPlacements
  };

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = (): UserStatsContextType => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
}; 