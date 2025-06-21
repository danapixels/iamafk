import React, { useState } from 'react';

interface LockedHatButtonProps {
  gachaponWin: boolean;
  localGachaponWinner: string | null;
  username?: string;
  onClick: (hatType: string) => void;
}

const LockedHatButton: React.FC<LockedHatButtonProps> = ({ gachaponWin, localGachaponWinner, username, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="locked-button-container" style={{ position: 'relative', display: 'flex' }}>
      <img
        src={gachaponWin ? '/UI/easteregg1button.png' : '/UI/lockedbutton.png'}
        alt={gachaponWin ? "Easter Egg Hat" : "Locked Hat"}
        onMouseOver={(e) => {
          e.currentTarget.src = gachaponWin ? '/UI/easteregg1buttonhover.png' : '/UI/lockedbuttonhover.png';
        }}
        onMouseOut={(e) => {
          e.currentTarget.src = gachaponWin ? '/UI/easteregg1button.png' : '/UI/lockedbutton.png';
        }}
        className="button"
        style={{ cursor: 'pointer' }}
        onMouseEnter={({ currentTarget }) => {
          currentTarget.src = gachaponWin ? '/UI/easteregg1buttonhover.png' : '/UI/lockedbuttonhover.png';
          setShowTooltip(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.src = gachaponWin ? '/UI/easteregg1button.png' : '/UI/lockedbutton.png';
          setShowTooltip(false);
        }}
        onClick={() => {
          if (gachaponWin) {
            onClick('easteregg1');
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
        {gachaponWin && localGachaponWinner ?
          (username && username === localGachaponWinner ?
            'you did it!'
            : `${localGachaponWinner} won the 1%!`)
          : '30m = 1 gacha play'}
      </div>
    </div>
  );
};

export default LockedHatButton; 