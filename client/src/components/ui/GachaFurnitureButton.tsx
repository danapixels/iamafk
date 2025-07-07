import React, { useState } from 'react';
import { useUserStats } from '../../contexts/UserStatsContext';

interface GachaFurnitureButtonProps {
  type: string;
  onClick: (type: string) => void;
}

const GachaFurnitureButton: React.FC<GachaFurnitureButtonProps> = ({ type, onClick }) => {
  const { userStats } = useUserStats();
  const [isHovered, setIsHovered] = useState(false);

  // Check if user has this specific furniture unlocked
  const hasUnlocked = userStats?.unlockedGachaFurniture?.some(furniture => {
    // Handle both string and object formats
    if (typeof furniture === 'string') {
      return furniture === type;
    } else if (typeof furniture === 'object' && furniture.item) {
      return furniture.item === type;
    }
    return false;
  }) || false;

  if (!hasUnlocked) {
    return null; // Don't show the button if this furniture is not unlocked
  }

  const getButtonSrc = () => {
    switch (type) {
      case 'computer':
        return isHovered ? '/UI/computerbuttonhover.png' : '/UI/computerbutton.png';
      case 'tv':
        return isHovered ? '/UI/tvbuttonhover.png' : '/UI/tvbutton.png';
      case 'toilet':
        return isHovered ? '/UI/toiletbuttonhover.png' : '/UI/toiletbutton.png';
      case 'washingmachine':
        return isHovered ? '/UI/washingmachinebutthover.png' : '/UI/washingmachinebutton.png';
      case 'zuzu':
        return isHovered ? '/UI/zuzubuttonhover.png' : '/UI/zuzubutton.png';
      default:
        return '/UI/computerbutton.png';
    }
  };

  const handleClick = () => {
    onClick(type);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <img
      src={getButtonSrc()}
      alt={`${type} furniture`}
      className="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: 'pointer',
        transition: 'transform 0.1s ease',
      }}
    />
  );
};

export default GachaFurnitureButton; 