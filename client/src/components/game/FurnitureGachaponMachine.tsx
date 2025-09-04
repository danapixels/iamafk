import React, { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useUserStats } from '../../contexts/UserStatsContext';

// defines the furniture gachapon machine props interface
interface FurnitureGachaponMachineProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  username: string;
  socket: Socket | null;
  onUse: () => void;
  isCursorFrozen?: boolean;
  onUnfreeze?: () => void;
  onShowNotification?: (text: string) => void;
}

// defines the furniture gachapon machine component
const FurnitureGachaponMachine: React.FC<FurnitureGachaponMachineProps> = ({
  src,
  alt,
  style,
  className,
  username,
  socket,
  onUse,
  isCursorFrozen,
  onUnfreeze,
  onShowNotification
}) => {
  const { userStats, deductAFKBalance } = useUserStats();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState<'win' | 'tryAgain' | null>(null);
  const [gifTimestamp, setGifTimestamp] = useState(0);
  const [currentImageSrc, setCurrentImageSrc] = useState('/UI/furnituregacha.png');
  const messageRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  // checks if user has enough AFK time (30 minutes = 1800 seconds)
  const checkAFKTime = () => {
    if (!userStats || userStats.afkBalance < 1800) {
      // not enough AFK balance
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (socket) {
      // listens for animation events from other users
      socket.on('furnitureGachaponAnimation', (data: { userId: string, hasEnoughTime: boolean }) => {
        if (data.userId !== socket.id) {  
          setIsPlaying(true);
          setCurrentImageSrc(src);
          setGifTimestamp(Date.now());
          
          // uses the same timing logic as the click handler
          if (data.hasEnoughTime) {
            // lets the full GIF play for 3 seconds
            setTimeout(() => {
              setIsPlaying(false);
              setCurrentImageSrc('/UI/furnituregacha.png');
            }, 3000);
          } else {
            // switches to static image after 0.5 seconds
            setTimeout(() => {
              setCurrentImageSrc('/UI/furnituregacha.png');
              setIsPlaying(false);
            }, 500);
          }
        }
      });

      return () => {
        socket.off('furnitureGachaponAnimation');
      };
    }
  }, [socket, src]);

  const handleClick = () => {
    if (isPlaying || showMessage) {
      return; // prevents multiple clicks while playing or when message is showing
    }

    if (socket) {
      socket.emit('resetStillTime');
    }

    const enoughTime = checkAFKTime();
    
    // unfreezes cursor if user has enough AFK time and is currently frozen
    if (enoughTime && isCursorFrozen && onUnfreeze) {
      onUnfreeze();
    }
    
    // shows notification immediately when clicked
    if (enoughTime) {
      onShowNotification?.('-30m');
    } else {
      onShowNotification?.('needs more time');
    }

    setIsPlaying(true);
    
    // switches to animated GIF and force restarts
    setCurrentImageSrc(src);
    setGifTimestamp(Date.now());

    // emits animation event to other users with enoughTime flag
    if (socket) {
      socket.emit('furnitureGachaponAnimation', { 
        userId: socket.id,
        hasEnoughTime: enoughTime 
      });
    }

    if (enoughTime) {
      // deducts 30 minutes (1800 seconds) from AFK balance
      const success = deductAFKBalance(1800);
      if (!success) {
        // if deduction failed, resets the playing state and shows error
        console.log('Failed to deduct AFK balance - insufficient funds');
        setIsPlaying(false);
        setCurrentImageSrc('/UI/furnituregacha.png');
        onShowNotification?.('insufficient funds');
        return;
      }
      
      // calls onUse callback immediately to refresh stats
      onUse();
      
      // lets the full GIF play before showing result (approximately 2.5 seconds for gacha.gif)
      setTimeout(() => {
        determinePayout();
      }, 2500); // Full GIF animation time (2.5 seconds)
    } else {
      // for users without enough currency, plays GIF for only 0.5 seconds then back to still
      setTimeout(() => {
        setCurrentImageSrc('/UI/furnituregacha.png');
        setIsPlaying(false);
      }, 500);
    }
  };

  const determinePayout = () => {
    const random = Math.random();
          const isWin = random < 0.01; // 1% win chance

    if (isWin) {
      setMessageType('win');
      setShowMessage(true);
      
      // pauses the GIF by switching to static image while message shows
      setCurrentImageSrc('/UI/furnituregacha.png');
      
      // emits win event to server (this will trigger confetti for ALL users via socket)
      console.log('Emitting furnitureGachaponWin event to server');
      console.log('Socket connected:', socket?.connected);
      console.log('Socket id:', socket?.id);
      socket?.emit('furnitureGachaponWin', { winnerId: socket?.id, winnerName: username });
      
      // hides message after 3 seconds
      messageRef.current = setTimeout(() => {
        setShowMessage(false);
        setMessageType(null);
        setIsPlaying(false); // re-enables clicking after message disappears
        // stays on still image (default state)
        setCurrentImageSrc('/UI/furnituregacha.png');
      }, 3000);
    } else {
      setMessageType('tryAgain');
      setShowMessage(true);
      
      // pauses the GIF by switching to static image while message shows
      setCurrentImageSrc('/UI/furnituregacha.png');
      
      // hides message after 2 seconds
      messageRef.current = setTimeout(() => {
        setShowMessage(false);
        setMessageType(null);
        setIsPlaying(false); // re-enables clicking after message disappears
        // stays on still image (default state)
        setCurrentImageSrc('/UI/furnituregacha.png');
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (messageRef.current) {
        clearTimeout(messageRef.current);
      }
    };
  }, []);

  // creates GIF URL with timestamp to force restart
  const gifUrl = gifTimestamp > 0 ? `${currentImageSrc}?t=${gifTimestamp}` : currentImageSrc;

  return (
    <div style={{ position: 'relative' }}>
      <img
        ref={imgRef}
        src={gifUrl}
        alt={alt}
        style={{
          ...style,
          cursor: (() => {
            const shouldBeClickable = !(isPlaying || showMessage);
            return shouldBeClickable ? 'pointer' : 'default';
          })(),
          userSelect: 'none',
          transform: 'scaleX(-1)',
        }}
        className={className}
        onClick={handleClick}
        onLoad={() => {
        }}
        onError={() => {
          console.error('Furniture Gachapon image failed to load:', gifUrl);
        }}
      />
      
      {/* gacha output msg */}
      {showMessage && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100000,
            opacity: 0,
            animation: messageType === 'win' 
              ? 'messageRiseAndFallWin 3s ease-out forwards'
              : 'messageRiseAndFall 2s ease-out forwards'
          }}
        >
          <img
            src={messageType === 'win' ? '/UI/gachawon.png' : '/UI/gachaopen.png'}
            alt={messageType === 'win' ? 'Win' : 'Try Again'}
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '300px',
            }}
          />
        </div>
      )}

      {/* animation for gacha output msg */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes messageRiseAndFall {
            0% {
              opacity: 0;
              transform: translate(-50%, -15vh);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, -20%);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, -20%);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -15vh);
            }
          }
          
          @keyframes messageRiseAndFallWin {
            0% {
              opacity: 0;
              transform: translate(-50%, -15vh);
            }
            15% {
              opacity: 1;
              transform: translate(-50%, -20%);
            }
            85% {
              opacity: 1;
              transform: translate(-50%, -20%);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -15vh);
            }
          }
          
          @keyframes notificationRiseAndFade {
            0% {
              opacity: 0;
              transform: translateY(0);
            }
            10% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-30px);
            }
          }
        `
      }} />
    </div>
  );
};

export default FurnitureGachaponMachine; 