import React from 'react';

interface ConfettiOverlayProps {
  showConfetti: boolean;
  confettiTimestamp: number | null;
}

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ showConfetti, confettiTimestamp }) => {
  if (!showConfetti) return null;

  return (
    <>
      {/* left confetti */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          bottom: '20vh',
          width: '200px',
          height: '60vh',
          zIndex: 999999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start'
        }}
      >
        <img
          src={`/UI/confetti.gif${confettiTimestamp ? `?t=${confettiTimestamp}` : ''}`}
          alt="Confetti"
          style={{
            width: '200px',
            height: 'auto',
            maxHeight: '60vh'
          }}
          onLoad={() => {
            console.log('Left confetti GIF loaded successfully');
          }}
          onError={(e) => {
            console.error('Left confetti GIF failed to load:', e);
          }}
        />
      </div>
      
      {/* right confetti */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          bottom: '20vh',
          width: '200px',
          height: '60vh',
          zIndex: 999999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end'
        }}
      >
        <img
          src={`/UI/confetti.gif${confettiTimestamp ? `?t=${confettiTimestamp}` : ''}`}
          alt="Confetti"
          style={{
            width: '200px',
            height: 'auto',
            maxHeight: '60vh',
            transform: 'scaleX(-1)' // flips horizontally on other side 
          }}
          onLoad={() => {
            // confetti loaded successfully
          }}
          onError={(e) => {
            console.error('Right confetti GIF failed to load:', e);
          }}
        />
      </div>
    </>
  );
}; 