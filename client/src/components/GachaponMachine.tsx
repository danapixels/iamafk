import React, { useState, useRef, useEffect } from 'react';
import { getUserStats, deductAFKBalance } from '../utils/localStorage';
import { Socket } from 'socket.io-client';

interface GachaponMachineProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  username: string;
  onWin: (winnerId: string, winnerName: string) => void;
  socket: Socket | null;
  onUse: () => void;
  isCursorFrozen?: boolean;
  onUnfreeze?: () => void;
}

const GachaponMachine: React.FC<GachaponMachineProps> = ({
  src,
  alt,
  style,
  className,
  username,
  onWin,
  socket,
  onUse,
  isCursorFrozen,
  onUnfreeze
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState<'win' | 'tryAgain' | null>(null);
  const [gifTimestamp, setGifTimestamp] = useState(0);
  const [currentImageSrc, setCurrentImageSrc] = useState(src);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const messageRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notificationRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if user has enough AFK time (30 minutes = 1800 seconds)
  const checkAFKTime = () => {
    const userStats = getUserStats();
    
    if (!userStats) {
      return false;
    }
    
    if (!userStats.afkBalance) {
      return false;
    }
    
    const hasEnough = userStats.afkBalance >= 1800;
    return hasEnough;
  };

  useEffect(() => {
    if (socket) {
      // Listen for animation events from other users
      socket.on('gachaponAnimation', (data: { userId: string, hasEnoughTime: boolean }) => {
        if (data.userId !== socket.id) {  // Only play if it's not our own animation
          setIsPlaying(true);
          setCurrentImageSrc(src);
          setGifTimestamp(Date.now());
          
          // Use the same timing logic as the click handler
          if (data.hasEnoughTime) {
            // Let the full GIF play for 3 seconds
            setTimeout(() => {
              setIsPlaying(false);
              setCurrentImageSrc('./UI/gachastill.png');
            }, 3000);
          } else {
            // Switch to static image after 0.5 seconds
            setTimeout(() => {
              setCurrentImageSrc('./UI/gachastill.png');
              setIsPlaying(false);
            }, 500);
          }
        }
      });

      return () => {
        socket.off('gachaponAnimation');
      };
    }
  }, [socket, src]);

  const handleClick = () => {
    if (isPlaying || showMessage) {
      return; // Prevent multiple clicks while playing or when message is showing
    }

    if (socket) {
      socket.emit('resetStillTime');
    }

    const enoughTime = checkAFKTime();
    
    // Unfreeze cursor if user has enough AFK time and is currently frozen
    if (enoughTime && isCursorFrozen && onUnfreeze) {
      onUnfreeze();
    }
    
    // Show notification immediately when clicked
    if (enoughTime) {
      setNotificationText('-30m');
    } else {
      setNotificationText('needs more time');
    }
    setShowNotification(true);

    // Hide notification after animation completes
    notificationRef.current = setTimeout(() => {
      setShowNotification(false);
      setNotificationText('');
    }, 2000);

    setIsPlaying(true);
    
    // Reset to animated GIF and force restart
    setCurrentImageSrc(src);
    setGifTimestamp(Date.now());

    // Emit animation event to other users with enoughTime flag (only when actually processing the click)
    if (socket) {
      socket.emit('gachaponAnimation', { 
        userId: socket.id,
        hasEnoughTime: enoughTime 
      });
    }

    if (enoughTime) {
      // Deduct 30 minutes (1800 seconds) from AFK balance
      const success = deductAFKBalance(1800);
      if (!success) {
        return;
      }
      
      // Call onUse callback immediately to refresh stats
      onUse();
      
      // Let the full GIF play before showing result (approximately 3-4 seconds for gacha.gif)
      setTimeout(() => {
        determinePayout();
        setIsPlaying(false);
      }, 3000);
    } else {
      // Switch to static image after 0.5 seconds to stop the animation
      setTimeout(() => {
        setCurrentImageSrc('./UI/gachastill.png');
        setIsPlaying(false);
      }, 500);
    }
  };

  const determinePayout = () => {
    const random = Math.random();
    const isWin = random < 0.5; // 50% chance for testing

    if (isWin) {
      setMessageType('win');
      setShowMessage(true);
      
      // Pause the GIF by switching to static image while message shows
      setCurrentImageSrc('./UI/gachastill.png');
      
      // Notify parent component
      onWin?.(socket?.id || '', username);
      
      // Emit win event to server
      socket?.emit('gachaponWin', { winnerId: socket?.id, winnerName: username });
      
      // Hide message after 3 seconds (reduced from 7 seconds)
      messageRef.current = setTimeout(() => {
        console.log('Win message timeout triggered - hiding message');
        setShowMessage(false);
        setMessageType(null);
        setIsPlaying(false); // Re-enable clicking after message disappears
        // Reset back to animated GIF
        setCurrentImageSrc(src);
        setGifTimestamp(Date.now());
        console.log('Message state should now be: showMessage=false, isPlaying=false');
      }, 3000);
    } else {
      setMessageType('tryAgain');
      setShowMessage(true);
      
      // Pause the GIF by switching to static image while message shows
      setCurrentImageSrc('./UI/gachastill.png');
      
      // Hide message after 2 seconds
      messageRef.current = setTimeout(() => {
        console.log('Try again message timeout triggered - hiding message');
        setShowMessage(false);
        setMessageType(null);
        setIsPlaying(false); // Re-enable clicking after message disappears
        // Reset back to animated GIF
        setCurrentImageSrc(src);
        setGifTimestamp(Date.now());
        console.log('Message state should now be: showMessage=false, isPlaying=false');
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (messageRef.current) {
        clearTimeout(messageRef.current);
      }
      if (notificationRef.current) {
        clearTimeout(notificationRef.current);
      }
    };
  }, []);

  // Create GIF URL with timestamp to force restart
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
            console.log('Gachapon cursor state:', { isPlaying, showMessage, shouldBeClickable });
            return shouldBeClickable ? 'pointer' : 'default';
          })(),
          userSelect: 'none',
          transform: 'scaleX(-1)', // Flip horizontally
        }}
        className={className}
        onClick={handleClick}
        onLoad={() => {
          // Image loaded successfully
        }}
        onError={() => {
          // Image failed to load
        }}
      />
      
      {/* Notification overlay */}
      {showNotification && (
        <div
          style={{
            position: 'absolute',
            top: '270px',
            left: '140px',
            zIndex: 9999999,
            pointerEvents: 'none'
          }}
        >
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.5em',
            color: 'white',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            animation: 'notificationRiseAndFade 2s ease-out forwards'
          }}>
            {notificationText}
          </div>
        </div>
      )}
      
      {/* Message overlay */}
      {showMessage && (
        <div
          style={{
            position: 'fixed', // Fixed to viewport instead of relative to gacha machine
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Center in viewport
            zIndex: 100000,
            opacity: 0,
            animation: messageType === 'win' 
              ? 'messageRiseAndFallWin 3s ease-in-out forwards'
              : 'messageRiseAndFall 2s ease-in-out forwards'
          }}
        >
          <img
            src={messageType === 'win' ? './UI/gachawon.png' : './UI/gachaopen.png'}
            alt={messageType === 'win' ? 'Win' : 'Try Again'}
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '300px', // Slightly larger since it's center screen
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' // Add shadow for better visibility
            }}
          />
        </div>
      )}

      {/* Add CSS keyframes for smooth animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes messageRiseAndFall {
            0% {
              opacity: 0;
              transform: translate(-50%, -15vh);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -20%);
            }
            70% {
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

export default GachaponMachine; 