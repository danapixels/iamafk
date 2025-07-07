import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import './FurniturePresetPanel.css';
import { useUserStats } from '../../contexts/UserStatsContext';

interface FurniturePreset {
  id: string;
  name: string;
  furniture: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    zIndex?: number;
    isFlipped?: boolean;
    isOn?: boolean;
  }>;
  createdAt: number;
}

interface FurniturePresetPanelProps {
  socket: Socket | null;
  onSelectionToggle?: (active: boolean) => void;
  onPresetPlace?: (preset: FurniturePreset) => void;
  furniture?: { [key: string]: any };
  isFurnitureSelectionMode?: boolean;
  setTempFurniture?: React.Dispatch<React.SetStateAction<Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean; isTemp?: boolean }>>>;
  style?: React.CSSProperties;
  viewportOffset?: { x: number; y: number };
}

const FurniturePresetPanel: React.FC<FurniturePresetPanelProps> = ({
  socket,
  onSelectionToggle,
  furniture,
  isFurnitureSelectionMode,
  setTempFurniture,
  style,
  viewportOffset
}) => {
  const { userStats } = useUserStats();
  const [selectedFurniture, setSelectedFurniture] = useState<Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean }>>([]);
  const [presets, setPresets] = useState<(FurniturePreset | null)[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  // Load presets from user stats context
  useEffect(() => {
    if (userStats?.furniturePresets) {
      setPresets([userStats.furniturePresets[0] || null]);
    } else {
      setPresets([null]);
    }
  }, [userStats]);

  // Listen for preset save confirmation
  useEffect(() => {
    if (socket) {
      socket.on('furniturePresetSaved', (data) => {
        const { slotIndex, preset } = data;
        if (slotIndex === 0) {
          setPresets([preset]);
        }
      });

      // Listen for preset delete confirmation
      socket.on('furniturePresetDeleted', (data) => {
        const { slotIndex } = data;
        if (slotIndex === 0) {
          setPresets([null]);
        }
      });

      return () => {
        socket.off('furniturePresetSaved');
        socket.off('furniturePresetDeleted');
      };
    }
  }, [socket]);

  // Handle furniture selection when in selection mode
  useEffect(() => {
    if (isFurnitureSelectionMode && furniture) {
      // Listen for clicks on furniture elements
      const handleFurnitureClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-furniture-id]')) {
          const furnitureId = target.closest('[data-furniture-id]')?.getAttribute('data-furniture-id');
          if (furnitureId && furniture[furnitureId]) {
            const furnitureItem = furniture[furnitureId];
            setSelectedFurniture(prev => {
              // Check if already selected
              const isAlreadySelected = prev.some(item => 
                item.id === furnitureId && 
                item.type === furnitureItem.type
              );
              if (isAlreadySelected) {
                return prev;
              }
              return [...prev, {
                id: furnitureId,
                type: furnitureItem.type,
                x: furnitureItem.x,
                y: furnitureItem.y,
                zIndex: furnitureItem.zIndex,
                isFlipped: furnitureItem.isFlipped,
                isOn: furnitureItem.isOn
              }];
            });
          }
        }
      };

      // Listen for selection box completion
      const handleSelectionBoxComplete = (e: CustomEvent<{ selectedItems: Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean }> }>) => {
        const { selectedItems } = e.detail;
        setSelectedFurniture(prev => {
          // Add new items, avoiding duplicates
          const newItems = selectedItems.filter((newItem: { id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean }) => 
            !prev.some(existingItem => 
              existingItem.id === newItem.id && 
              existingItem.type === newItem.type
            )
          );
          return [...prev, ...newItems];
        });
      };

      document.addEventListener('click', handleFurnitureClick);
      window.addEventListener('furnitureSelectionBoxComplete', handleSelectionBoxComplete as EventListener);
      
      return () => {
        document.removeEventListener('click', handleFurnitureClick);
        window.removeEventListener('furnitureSelectionBoxComplete', handleSelectionBoxComplete as EventListener);
      };
    }
  }, [isFurnitureSelectionMode, furniture]);

  // Handle keyboard events for selection mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSelecting) {
        setIsSelecting(false);
        setSelectedFurniture([]);
        onSelectionToggle?.(false);
      }
    };

    if (isSelecting) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelecting]);

  const handleStartSelection = () => {
    if (isSelecting) {
      // Exit selection mode
      setIsSelecting(false);
      setSelectedFurniture([]);
      onSelectionToggle?.(false);
    } else {
      // Enter selection mode
      setIsSelecting(true);
      setSelectedFurniture([]);
      onSelectionToggle?.(true);
    }
  };

  const handleSavePreset = () => {
    if (selectedFurniture.length === 0) return;

    // Only one slot (slot 0)
    if (presets[0]) {
      alert('Delete the save to create another preset!');
      return;
    }

    const preset: FurniturePreset = {
      id: `slot_0_${Date.now()}`,
      name: `Preset 1`,
      furniture: [...selectedFurniture],
      createdAt: Date.now()
    };

    if (socket) {
      socket.emit('saveFurniturePreset', { slotIndex: 0, preset });
    }

    setPresets([preset]);
    setSelectedFurniture([]);
    setIsSelecting(false);
    onSelectionToggle?.(false);
  };

  const handleLoadPreset = (preset: FurniturePreset) => {
    // Calculate the center of the preset furniture
    const presetCenterX = preset.furniture.reduce((sum, item) => sum + item.x, 0) / preset.furniture.length;
    const presetCenterY = preset.furniture.reduce((sum, item) => sum + item.y, 0) / preset.furniture.length;
    
    // Calculate the target center (center of current viewport)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const canvasX = centerX + (viewportOffset?.x || 0);
    const canvasY = centerY + (viewportOffset?.y || 0);
    

    
    // Create temporary furniture items positioned at center of viewport
    const tempFurniture = preset.furniture.map((item, index) => {
      // Calculate the offset from the preset center
      const offsetX = item.x - presetCenterX;
      const offsetY = item.y - presetCenterY;
      
      // Position at target center + offset
      const finalX = canvasX + offsetX;
      const finalY = canvasY + offsetY;
      

      
      return {
        ...item,
        id: `temp_preset_${index}`,
        x: finalX,
        y: finalY,
        isTemp: true,
        presetId: preset.id // Group them together
      };
    });
    
    setTempFurniture?.(tempFurniture);
  };

  const handleDeletePresetSlot = (slotIndex: number) => {
    if (socket && slotIndex === 0) {
      socket.emit('deleteFurniturePreset', { slotIndex });
    }
  };

  const getPresetForSlot = () => {
    return presets[0];
  };

  const getPresetUsageInfo = () => {
    const usageCount = userStats?.presetUsageCount || 0;
    const limit = 10;
    const remaining = limit - usageCount;
    return { usageCount, limit, remaining };
  };

  return (
    <div className="furniture-preset-panel-container" style={style}>
      <img src="/UI/presetpanel.png" alt="Preset Panel" className="furniture-preset-panel-background" />
      
      <div className="furniture-preset-panel-content">
        {/* Save Slots Container */}
        <div className="preset-slots-container">
          {(() => {
            const preset = getPresetForSlot();
            const { remaining, limit } = getPresetUsageInfo();
            const isLimitReached = remaining <= 0;
            
            return (
              <div key={0} className="preset-slot">
                <div className="preset-slot-header">
                  <span className="preset-slot-name">
                    {preset ? `${preset.furniture.length} items` : 'Empty'}
                  </span>
                  {preset && (
                    <span className="preset-usage-count" style={{ fontSize: '0.7em', color: isLimitReached ? '#ff6b6b' : '#4ecdc4' }}>
                      {remaining}/{limit} uses left
                    </span>
                  )}
                </div>
                
                <div className="preset-slot-actions">
                  {preset ? (
                    <>
                      <button 
                        className="preset-load-button"
                        onClick={() => handleLoadPreset(preset)}
                        disabled={isLimitReached}
                        style={{ 
                          fontSize: '0.5em',
                          opacity: isLimitReached ? 0.5 : 1,
                          cursor: isLimitReached ? 'not-allowed' : 'pointer'
                        }}
                        title={isLimitReached ? 'Delete and recreate your preset to continue' : 'Load preset'}
                      >
                        Load
                      </button>
                      <button 
                        className="preset-delete-button"
                        onClick={() => handleDeletePresetSlot(0)}
                        style={{ fontSize: '0.5em' }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button 
                      className={`preset-button ${isSelecting ? 'selecting' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStartSelection();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={isSelecting ? "/UI/selectbuttonhover.png" : "/UI/selectbutton.png"} 
                        alt="Select Furniture" 
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Selection mode indicator */}
      {isSelecting && (
        <div className="selection-mode-indicator">
          <div className="selection-mode-content">
            <span className="selection-mode-text">preset selection mode</span>
            <span className="selection-mode-hint">click and drag the furniture you want to include in your preset. esc to exit.</span>
            {selectedFurniture.length > 0 && (
              <button 
                className="selection-save-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSavePreset();
                }}
                style={{ pointerEvents: 'auto', zIndex: 10001 }}
              >
                💾 Save Preset ({selectedFurniture.length} items)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FurniturePresetPanel; 