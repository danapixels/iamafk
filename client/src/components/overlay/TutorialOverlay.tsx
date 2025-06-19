import React from 'react';
import { UI_IMAGES } from '../../constants';

const TutorialOverlay: React.FC = () => {
  return (
    <img
      src={UI_IMAGES.TUTORIAL}
      alt="Tutorial"
      style={{
        position: 'absolute',
        left: 30,
        top: 140,
        opacity: 0.2,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
};

export default TutorialOverlay; 