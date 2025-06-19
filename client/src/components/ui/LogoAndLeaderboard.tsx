import React from 'react';
import { UI_IMAGES, GITHUB_URL, Z_INDEX_LAYERS, SERVER_CONFIG } from '../../constants';

interface LogoAndLeaderboardProps {
  cursors: { [key: string]: any };
}

export const LogoAndLeaderboard: React.FC<LogoAndLeaderboardProps> = ({ cursors }) => {
  const getHighestAFKPlayer = () => {
    let highestAFK = { name: '', time: 0 };
    Object.entries(cursors).forEach(([_, cursor]) => {
      if (!cursor) return;
      if (cursor.stillTime > highestAFK.time && cursor.name && cursor.name !== SERVER_CONFIG.ANONYMOUS_NAME) {
        highestAFK = { name: cursor.name, time: cursor.stillTime };
      }
    });
    return highestAFK;
  };

  return (
    <div id="logo-container" style={{ zIndex: Z_INDEX_LAYERS.LOGO }}>
      <div className="logo-row">
        <img src={UI_IMAGES.LOGO} alt="Logo" id="logo" />
        <a 
          href={GITHUB_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ pointerEvents: 'all' }}
        >
          <img src={UI_IMAGES.GITHUB_LOGO} alt="GitHub" id="github-logo" />
        </a>
      </div>
      <div style={{ position: 'relative', margin: 0, padding: 0 }}>
        <img src={UI_IMAGES.LEADERBOARD} alt="Leaderboard" id="leaderboard" />
        <div style={{ 
          position: 'absolute', 
          top: 'calc(50% + 12px)', 
          left: 'calc(50% + 38px)', 
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '0.5rem',
          color: 'white',
          textShadow: '2px 2px 0 #000',
          textAlign: 'left',
          width: '100%',
          pointerEvents: 'none',
          maxWidth: '200px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {getHighestAFKPlayer().name.length > 8 
            ? `${getHighestAFKPlayer().name.slice(0, 8)}⋯`
            : getHighestAFKPlayer().name}
        </div>
      </div>
    </div>
  );
}; 