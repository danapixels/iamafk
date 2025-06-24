import { useEffect, useRef, useState } from 'react';
import './App.css';
import Panel from './components/ui/Panel';
import GachaponMachine from './components/game/GachaponMachine';
import { AFKTimeDisplay } from './components/ui/AFKTimeDisplay';
import { LogoAndLeaderboard } from './components/ui/LogoAndLeaderboard';
import { ConfettiOverlay } from './components/overlay/ConfettiOverlay';
import { DialogBanner } from './components/overlay/DialogBanner';
import ConnectionModal from './components/ui/ConnectionModal';
import CanvasContainer from './components/ui/CanvasContainer';

// Custom hooks
import { useSocket } from './hooks/connection/useSocket';
import { useCursor } from './hooks/game/useCursor';
import { useFurniture } from './hooks/game/useFurniture';
import { useStats } from './hooks/game/useStats';
import { useConfetti } from './hooks/ui/useConfetti';
import { useMouseInteractions } from './hooks/ui/useMouseInteractions';
import { useKeyboardInteractions } from './hooks/ui/keyboardInteractions';
import { useAnimationCleanup } from './hooks/ui/useAnimationCleanup';
import { useGachapon } from './hooks/game/useGachapon';
import { useViewportFiltering } from './hooks/ui/useViewportFiltering';
import { useConnectionHandlers } from './hooks/connection/useConnectionHandlers';
import { useCursorHandlers } from './hooks/game/useCursorHandlers';
import { useFurnitureHandlers } from './hooks/game/useFurnitureHandlers';

// Constants and utilities
import { 
  Z_INDEX_LAYERS
} from './constants';
import { 
  initializeUserData, 
  getSavedUsername,
  getSavedCursorType,
  saveUsername,
  getUserStats,
  exportUserData,
  setAFKTimeForTesting,
  clearDailyFurnitureLimit,
  testGachaponWinRate,
  clearUserData,
  getRemainingDailyPlacements
} from './utils/localStorage';
import { getGachaponStyle } from './utils/gachapon';

function App() {
  // ===== USER STATE =====
  const [username, setUsername] = useState(getSavedUsername);
  const [cursorType, setCursorType] = useState(getSavedCursorType);
  const [userStats, setUserStats] = useState(getUserStats());

  // ===== UI STATE =====
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [isCursorFrozen, setIsCursorFrozen] = useState(false);
  const [frozenCursorPosition, setFrozenCursorPosition] = useState<{ x: number; y: number } | null>(null);

  // ===== GAME STATE =====
  const [gachaponWinner, setGachaponWinner] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiTimestamp, setConfettiTimestamp] = useState<number | null>(null);

  // ===== VIEWPORT STATE =====
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  
  // ===== REFS =====
  const furnitureRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});
  const usernameRef = useRef(username);

  // ===== CUSTOM HOOKS =====
  // Socket and connection management
  const {
    socketRef,
    hasConnected,
    setHasConnected,
    cursors,
    hearts,
    setHearts,
    circles,
    setCircles,
    emotes,
    setEmotes,
    furniture,
    setFurniture,
    showDialogBanner
  } = useSocket();

  // Game state management
  const { afkStartTimeRef } = useStats(socketRef, hasConnected, cursors, userStats, setUserStats);
  useCursor(socketRef, hasConnected, cursors, username, isCursorFrozen, setIsCursorFrozen, setFrozenCursorPosition);
  const { clickEnabledTimeRef, mouseStateRef, draggedFurnitureId } = useMouseInteractions({
    socketRef,
    hasConnected,
    cursors,
    furniture,
    setFurniture,
    setSelectedFurnitureId,
    selectedFurnitureId,
    isCursorFrozen,
    setIsCursorFrozen,
    setFrozenCursorPosition,
    viewportOffset,
    setViewportOffset,
    username,
    setUserStats,
    afkStartTimeRef
  });
  useKeyboardInteractions({
    socketRef,
    hasConnected,
    cursors,
    selectedFurnitureId,
    setSelectedFurnitureId,
    isCursorFrozen,
    frozenCursorPosition,
    viewportOffset,
    mouseStateRef
  });
  useFurniture(socketRef, setFurniture, setSelectedFurnitureId, hasConnected, draggedFurnitureId, mouseStateRef);
  useConfetti(socketRef, setGachaponWinner, setShowConfetti);

  // Animation and cleanup
  useAnimationCleanup({
    hearts,
    circles,
    emotes,
    setHearts,
    setCircles,
    setEmotes
  });

  // Gachapon machine logic
  const { handleGachaponUse, handleGachaponUnfreeze } = useGachapon({
    socket: socketRef.current,
    setUserStats,
    setFrozenCursorPosition,
    setIsCursorFrozen
  });

  // Viewport filtering for performance
  const {
    visibleCircles,
    visibleHearts,
    visibleEmotes,
    visibleFurniture,
    visibleCursors
  } = useViewportFiltering({
    viewportOffset,
    circles,
    hearts,
    emotes,
    furniture,
    cursors,
    socketRef,
    hasConnected,
    isCursorFrozen,
    frozenCursorPosition
  });

  // Event handlers
  const { handleConnect } = useConnectionHandlers({
    socket: socketRef.current,
    username,
    setHasConnected,
    setUserStats,
    clickEnabledTimeRef
  });

  const { handleCursorChange } = useCursorHandlers({
    socket: socketRef.current,
    setCursorType
  });

  const { handleMoveUp, handleMoveDown, handleFurnitureSpawn } = useFurnitureHandlers({
    socket: socketRef.current,
    setUserStats
  });

  // ===== EFFECTS =====
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    if (username.trim()) {
      const userData = initializeUserData(username.trim());
      setUserStats(userData.stats);
      saveUsername(username.trim());
    }
  }, [username]);

  useEffect(() => {
    (window as any).setAFKTimeForTesting = setAFKTimeForTesting;
    (window as any).exportUserData = exportUserData;
    (window as any).clearDailyFurnitureLimit = clearDailyFurnitureLimit;
    (window as any).testGachaponWinRate = testGachaponWinRate;
    (window as any).clearUserData = clearUserData;
    (window as any).getRemainingDailyPlacements = getRemainingDailyPlacements;
  }, []);

  useEffect(() => {
    if (showConfetti) {
      setConfettiTimestamp(Date.now());
    }
  }, [showConfetti]);

  return (
    <div 
      id="app-root" 
      className={hasConnected ? (isCursorFrozen ? '' : 'cursor-hidden') : ''} 
      style={{ 
        userSelect: 'none',
        cursor: hasConnected ? (isCursorFrozen ? 'default' : 'none') : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Canvas container with viewport offset */}
      <CanvasContainer
        viewportOffset={viewportOffset}
          visibleCircles={visibleCircles}
          visibleHearts={visibleHearts}
          visibleEmotes={visibleEmotes}
          visibleFurniture={visibleFurniture}
        visibleCursors={visibleCursors}
          selectedFurnitureId={selectedFurnitureId}
          furnitureRefs={furnitureRefs}
          socketRef={socketRef}
        cursorType={cursorType}
        isCursorFrozen={isCursorFrozen}
        frozenCursorPosition={frozenCursorPosition}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDelete={(furnitureId) => setSelectedFurnitureId(prev => prev === furnitureId ? null : prev)}
        />

      {/* UI Elements */}
      <Panel 
        socket={socketRef.current} 
        onCursorChange={handleCursorChange} 
        onFurnitureSpawn={handleFurnitureSpawn}
        cursorPosition={cursors[socketRef.current?.id || '']}
        viewportOffset={viewportOffset}
        gachaponWinner={gachaponWinner}
        username={username}
        style={{ zIndex: Z_INDEX_LAYERS.PANEL }}
      />
      
      <AFKTimeDisplay hasConnected={hasConnected} userStats={userStats} />
      <LogoAndLeaderboard cursors={cursors} />

      {/* Gachapon Machine */}
      <GachaponMachine
        src={'/UI/gacha.gif'}
        alt="Gacha"
        username={username}
        socket={socketRef.current}
        onUse={handleGachaponUse}
        isCursorFrozen={isCursorFrozen}
        onUnfreeze={handleGachaponUnfreeze}
        style={getGachaponStyle(viewportOffset)}
      />

      {/* Connection Modal */}
      <ConnectionModal
        username={username}
        onUsernameChange={setUsername}
        onConnect={handleConnect}
        hasConnected={hasConnected}
      />

      {/* Overlays */}
      <ConfettiOverlay showConfetti={showConfetti} confettiTimestamp={confettiTimestamp} />
      <DialogBanner showDialogBanner={showDialogBanner} />
    </div>
  );
}

export default App;