import React from 'react';

interface DialogBannerProps {
  showDialogBanner: boolean;
  lastWinner?: string;
  lastUnlockedItem?: string;
}

export const DialogBanner: React.FC<DialogBannerProps> = ({ showDialogBanner, lastWinner, lastUnlockedItem }) => {
  if (!showDialogBanner) return null;

  const getDisplayName = (item: string) => {
    switch (item) {
      // hat items
      case 'easteregg1':
        return 'crown hat';
      case 'balloon':
        return 'balloon hat';
      case 'ffr':
        return 'flashflashrevolution hat';
      case 'ghost':
        return 'ghost hat';
      case 'loading':
        return 'loading hat';
      // furniture items
      case 'zuzu':
        return 'zuzu';
      case 'tv':
        return 'tv';
      case 'computer':
        return 'computer';
      case 'washingmachine':
        return 'washing machine';
      case 'toilet':
        return 'toilet';
      default:
        return item;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}
    >
      <img
        src="/UI/dialog.png"
        alt="Dialog"
        style={{
          width: 'auto',
          height: 'auto',
          pointerEvents: 'none'
        }}
      />
      {lastWinner && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '1.5em',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1000000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.5em',
              color: 'white',
              whiteSpace: 'nowrap',
              animation: 'marquee-slide 8s linear infinite',
            }}
          >
            {lastUnlockedItem 
              ? `wooooooo, party for the gacha winner, ${lastWinner}, they won the ${getDisplayName(lastUnlockedItem)}!`
              : `wooooooo, party for the gacha winner, ${lastWinner}.`
            }
          </div>
          <style>{`
            @keyframes marquee-slide {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}; 