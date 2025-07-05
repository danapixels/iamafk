import React, { useState } from 'react';
import { useUserStats } from '../../contexts/UserStatsContext';

interface LockedHatButtonProps {
  hatType: string;
  onClick: (hatType: string) => void;
}

const LockedHatButton: React.FC<LockedHatButtonProps> = ({ hatType, onClick }) => {
  const { userStats } = useUserStats();
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if user has this specific hat unlocked and get unlocker info
  const unlockedHat = userStats?.unlockedGachaHats?.find(hat => hat.item === hatType);
  const hasUnlocked = !!unlockedHat;
  const unlockerName = unlockedHat?.unlockedBy;

  const getButtonSrc = (isHovered: boolean) => {
    if (!hasUnlocked) {
      return isHovered ? '/UI/lockedbuttonhover.png' : '/UI/lockedbutton.png';
    }

    switch (hatType) {
      case 'easteregg1':
        return isHovered ? '/UI/easteregg1buttonhover.png' : '/UI/easteregg1button.png';
      case 'balloon':
        return isHovered ? '/UI/balloonbuttonhover.png' : '/UI/balloonbutton.png';
      case 'ffr':
        return isHovered ? '/UI/ffrbuttonhover.png' : '/UI/ffrbutton.png';
      case 'ghost':
        return isHovered ? '/UI/ghostbuttonhover.png' : '/UI/ghostbutton.png';
      case 'loading':
        return isHovered ? '/UI/loadingbuttonhover.png' : '/UI/loadingbutton.png';
      default:
        return isHovered ? '/UI/lockedbuttonhover.png' : '/UI/lockedbutton.png';
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="locked-button-container" style={{ position: 'relative', display: 'flex' }}>
      <img
        src={getButtonSrc(isHovered)}
        alt={hasUnlocked ? `${hatType} Hat` : "Locked Hat"}
        className="button"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        onClick={() => {
          if (hasUnlocked) {
            onClick(hatType);
          }
        }}
      />
      <div
        className="tooltip"
        style={{
          position: 'absolute',
          top: '10px',
          right: '100%',
          marginRight: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '14px',
          fontSize: '8px',
          fontFamily: '"Press Start 2P", monospace',
          whiteSpace: 'nowrap',
          opacity: showTooltip ? 1 : 0,
          visibility: showTooltip ? 'visible' : 'hidden',
          transition: 'opacity 0.3s, visibility 0.3s',
          zIndex: 99999,
        }}
      >
        {hasUnlocked ? `${unlockerName} unlocked this!` : '30m = 1 gacha play'}
      </div>
    </div>
  );
};

export default LockedHatButton; 