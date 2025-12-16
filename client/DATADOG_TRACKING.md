# What is Datadog being used for??

I currently work at Datadog and this data is only for me to see so that I can improve iamafk and improve Datadog UX. Outlined below are what it's tracking. You can choose to remove it. Outlined is where it's located.

## Currently Tracked Events

### 1. User Login
- **Event**: `user_login`
- **Location**: `hooks/connection/useSocket.ts` - `usernameAccepted` handler
- **Data Tracked**: 
  - Username
  - User ID (socket ID)
  - Timestamp

### 2. Furniture Panel Click
- **Event**: `furniture_panel_click`
- **Location**: `components/ui/FurniturePanel.tsx` - `handleFurnitureClick`
- **Data Tracked**:
  - Furniture type (chair, lamp, bed, etc.)
  - Timestamp

### 3. Gacha Machine Clicks
- **Event**: `gacha_machine_click`
- **Location**: 
  - `components/game/GachaponMachine.tsx` (hat gacha)
  - `components/game/FurnitureGachaponMachine.tsx` (furniture gacha)
- **Data Tracked**:
  - Machine type ('hat' or 'furniture')
  - Whether user had enough AFK time
  - Timestamp

### 4. Gacha Wins
- **Event**: `gacha_win`
- **Location**: `hooks/connection/useSocket.ts` - `gachaponWin` and `furnitureGachaponWin` handlers
- **Data Tracked**:
  - Machine type ('hat' or 'furniture')
  - Unlocked item name
  - Winner name
  - Timestamp

### 5. Session End
- **Event**: `session_end`
- **Location**: `hooks/connection/useSocket.ts` - `disconnect` handler
- **Data Tracked**:
  - Disconnect reason
  - Timestamp

### 6. Double Click
- **Event**: `double_click`
- **Location**: `hooks/ui/useMouseInteractions.ts` - `onDblClick` handler
- **Data Tracked**:
  - X coordinate (canvas space)
  - Y coordinate (canvas space)
  - Timestamp

### 7. Hats Panel Click
- **Event**: `hats_panel_click`
- **Location**: `components/ui/Panel.tsx` - `handleHatClick`
- **Data Tracked**:
  - Hat type (bunny, cap, slime, etc.)
  - Timestamp

### 8. Furniture Placement
- **Event**: `furniture_placement`
- **Location**: 
  - `hooks/game/useFurnitureHandlers.ts` - `handleFurnitureSpawn`
  - `hooks/game/useFurniture.ts` - `furnitureSpawned` event handler (catches all placements including presets)
- **Data Tracked**:
  - Furniture type
  - X coordinate (canvas space)
  - Y coordinate (canvas space)
  - Timestamp

### 9. Furniture Interactions
- **Event**: `furniture_interaction`
- **Location**: 
  - **Select**: `hooks/ui/useMouseInteractions.ts` - when furniture is clicked
  - **Delete**: `hooks/game/useFurniture.ts` - when `furnitureDeleted` event is received
  - **Move**: `hooks/game/useFurniture.ts` - when `furnitureMoved` event is received (only for moves from other users/server)
  - **Flip**: `components/furniture/FurnitureRenderer.tsx` - `handleFlip` function
  - **Toggle**: `components/furniture/FurnitureRenderer.tsx` - `handleToggle` function
- **Data Tracked**:
  - Action type ('select', 'delete', 'move', 'flip', 'toggle')
  - Furniture ID
  - Furniture type
  - Timestamp
