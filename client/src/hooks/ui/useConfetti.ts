import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

export const useConfetti = (
  socketRef: React.RefObject<Socket | null>,
  setShowConfetti: (show: boolean) => void,
  setConfettiTimestamp?: (timestamp: number | null) => void,
  setGachaponWinner?: (winner: string | null) => void
) => {
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Socket listener for gachapon win
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleGachaponWin = (data: { winnerId: string, winnerName: string }) => {
      if (setGachaponWinner) {
        setGachaponWinner(data.winnerName);
      }
      
      // Clear any existing confetti timeout
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
        confettiTimeoutRef.current = null;
      }
      
      // Show confetti immediately
      setShowConfetti(true);
      if (setConfettiTimestamp) {
        setConfettiTimestamp(Date.now());
      }
      
      // Remove confetti after animation finishes (confetti.gif duration)
      confettiTimeoutRef.current = setTimeout(() => {
        setShowConfetti(false);
        if (setConfettiTimestamp) {
          setConfettiTimestamp(null);
        }
        confettiTimeoutRef.current = null;
      }, 3000); // Assuming confetti.gif is 3 seconds
      
      // Set localStorage for gachapon button state
      localStorage.setItem('gachaponWin', 'true');
      localStorage.setItem('gachaponWinner', data.winnerName);
      localStorage.setItem('gachaponButtonChanged', 'true');
    };

    const handleFurnitureGachaponWin = () => {
      // Clear any existing confetti timeout
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
        confettiTimeoutRef.current = null;
      }
      
      // Show confetti immediately
      setShowConfetti(true);
      if (setConfettiTimestamp) {
        setConfettiTimestamp(Date.now());
      }
      
      // Remove confetti after animation finishes (confetti.gif duration)
      confettiTimeoutRef.current = setTimeout(() => {
        setShowConfetti(false);
        if (setConfettiTimestamp) {
          setConfettiTimestamp(null);
        }
        confettiTimeoutRef.current = null;
      }, 3000); // Assuming confetti.gif is 3 seconds
    };

    socket.on('gachaponWin', handleGachaponWin);
    socket.on('furnitureGachaponWin', handleFurnitureGachaponWin);

    return () => {
      socket.off('gachaponWin', handleGachaponWin);
      socket.off('furnitureGachaponWin', handleFurnitureGachaponWin);
      // Clear any pending timeout on cleanup
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
        confettiTimeoutRef.current = null;
      }
    };
  }, [socketRef.current?.connected, setGachaponWinner, setShowConfetti, setConfettiTimestamp]);

  // Update confettiTimestamp whenever showConfetti is set to true
  useEffect(() => {
    // This effect will be handled by the parent component
  }, []);

  return { confettiTimeoutRef };
}; 