import React from 'react';
import { io, Socket } from 'socket.io-client';
import './Panel.css';

interface PanelProps {
  socket: Socket | null;
  onCursorChange: (cursor: { type: string }) => void;
  isDeleteMode: boolean;
  onDeleteModeChange: (isDeleteMode: boolean) => void;
  isDeleteButtonHovered: boolean;
}

const Panel: React.FC<PanelProps> = ({ socket, onCursorChange, isDeleteMode, onDeleteModeChange, isDeleteButtonHovered }) => {
  const handleHatClick = (hatType: string) => {
    if (socket) {
      socket.emit('changeCursor', { type: hatType });
      onCursorChange({ type: hatType });
    }
  };

  const handleFurnitureClick = (type: string) => {
    if (socket) {
      socket.emit('spawnFurniture', { type });
    }
  };

  const handleDeleteClick = () => {
    onDeleteModeChange(!isDeleteMode);
  };

  return (
    <div className="panel-container">
      <img src="./UI/transparentpanel.png" alt="Panel" className="panel-background" />
      
      <div className="panel-content">
        {/* Hats Section */}
        <div className="panel-section">
          <img src="./UI/hatstitle.png" alt="Hats" className="section-title" />
        </div>

        {/* Hat Buttons Section */}
        <div className="panel-section">
          <div className="button-grid">
            <div className="button-row">
              <img 
                src="./UI/bunnybutton.png" 
                alt="Bunny Hat" 
                className="button" 
                onClick={() => handleHatClick('bunny')}
              />
              <img 
                src="./UI/capbutton.png" 
                alt="Cap" 
                className="button" 
                onClick={() => handleHatClick('cap')}
              />
            </div>
            <div className="button-row">
              <img 
                src="./UI/slimebutton.png" 
                alt="Slime Hat" 
                className="button" 
                onClick={() => handleHatClick('slime')}
              />
              <img 
                src="./UI/astronautbutton.png" 
                alt="Astronaut Hat" 
                className="button" 
                onClick={() => handleHatClick('astronaut')}
              />
            </div>
            <div className="button-row">
              <img 
                src="./UI/beaniebutton.png" 
                alt="Beanie" 
                className="button" 
                onClick={() => handleHatClick('beanie')}
              />
              <img 
                src="./UI/headphonesbutton.png" 
                alt="Headphones" 
                className="button" 
                onClick={() => handleHatClick('headphones')}
              />
            </div>
            <div className="button-row">
              <img 
                src="./UI/sproutbutton.png" 
                alt="Sprout Hat" 
                className="button" 
                onClick={() => handleHatClick('sprout')}
              />
              <img 
                src="./UI/catbutton.png" 
                alt="Cat Hat" 
                className="button" 
                onClick={() => handleHatClick('cathat')}
              />
            </div>
            <div className="button-row">
              <img 
                src="./UI/deletehatbutton.png" 
                alt="Delete Hat" 
                className="button" 
                onClick={() => handleHatClick('default')}
              />
            </div>
          </div>
        </div>

        {/* Furniture Title Section */}
        <div className="panel-section">
          <img src="./UI/furnituretitle.png" alt="Furniture" className="section-title" />
        </div>

        {/* Furniture Buttons Section */}
        <div className="panel-section">
          <div className="button-grid">
            <div className="button-row">
              <img 
                src="./UI/chairbutton.png" 
                alt="Chair" 
                className="button"
                onClick={() => handleFurnitureClick('chair')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/chairbuttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/chairbutton.png';
                }}
              />
              <img 
                src="./UI/lampbutton.png" 
                alt="Lamp" 
                className="button"
                onClick={() => handleFurnitureClick('lamp')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/lampbuttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/lampbutton.png';
                }}
              />
              <img 
                src="./UI/bedbutton.png" 
                alt="Bed" 
                className="button"
                onClick={() => handleFurnitureClick('bed')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/bedbuttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/bedbutton.png';
                }}
              />
            </div>
            <div className="button-row">
              <img 
                src="./UI/wallsbutton.png" 
                alt="Walls" 
                className="button"
                onClick={() => handleFurnitureClick('walls')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/wallsbuttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/wallsbutton.png';
                }}
              />
              <img 
                src="./UI/plant1button.png" 
                alt="Plant 1" 
                className="button"
                onClick={() => handleFurnitureClick('plant1')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/plant1buttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/plant1button.png';
                }}
              />
              <img 
                src="./UI/plant2button.png" 
                alt="Plant 2" 
                className="button"
                onClick={() => handleFurnitureClick('plant2')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/plant2buttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/plant2button.png';
                }}
              />
            </div>
            <div className="button-row">
              <img 
                src="./UI/blackcatbutton.png" 
                alt="Black Cat" 
                className="button"
                onClick={() => handleFurnitureClick('blackcat')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/blackcatbuttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/blackcatbutton.png';
                }}
              />
              <img 
                src="./UI/whitecatbutton.png" 
                alt="White Cat" 
                className="button"
                onClick={() => handleFurnitureClick('whitecat')}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/whitecatbuttonhover.png';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.src = './UI/whitecatbutton.png';
                }}
              />
              <img
                src={
                  isDeleteButtonHovered 
                    ? "./UI/furnitureselectedbutton.png"
                    : isDeleteMode 
                      ? "./UI/furnitureselectedbutton.png" 
                      : "./UI/deletefurniturebutton.png"
                }
                alt="Delete Furniture"
                className="button"
                onClick={() => onDeleteModeChange(!isDeleteMode)}
                onMouseEnter={(e) => {
                  e.currentTarget.src = './UI/furnitureselectedbutton.png';
                }}
                onMouseLeave={(e) => {
                  if (isDeleteMode) {
                    e.currentTarget.src = './UI/furnitureselectedbutton.png';
                  } else {
                    e.currentTarget.src = './UI/deletefurniturebutton.png';
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel; 