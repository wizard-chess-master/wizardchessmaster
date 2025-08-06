import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useChess } from "./lib/stores/useChess";
import { MainMenu } from "./components/chess/MainMenu";
import { ChessBoard } from "./components/chess/ChessBoard";
import { GameUI } from "./components/chess/GameUI";
import { SettingsDialog } from "./components/chess/SettingsDialog";
import { GameOverDialog } from "./components/chess/GameOverDialog";
import { TrainingViewer } from "./components/chess/TrainingViewer";
import "@fontsource/inter";
import "./styles/chess.css";

function App() {
  const { gamePhase } = useChess();
  const { setHitSound, setSuccessSound } = useAudio();
  const [showSettings, setShowSettings] = useState(false);
  const [showTrainingViewer, setShowTrainingViewer] = useState(false);

  // Initialize audio and keyboard shortcuts
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
  }, [setHitSound, setSuccessSound]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { selectSquare, undoMove, resetGame } = useChess.getState();
      const { toggleMute } = useAudio.getState();
      
      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undoMove();
      }
      
      // Ctrl+M for mute toggle
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        toggleMute();
      }
      
      // Escape to deselect
      if (event.key === 'Escape') {
        const { selectedPosition, selectSquare } = useChess.getState();
        if (selectedPosition) {
          selectSquare(null);
        }
      }
      
      // Ctrl+H for home/menu
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="App">
      <div className="game-container">
        {gamePhase === 'menu' && !showTrainingViewer && (
          <div className="main-menu">
            <h1>⚔️ Fantasy Wizard Chess ⚔️</h1>
            <div className="menu-buttons">
              <MainMenu 
                onSettings={() => setShowSettings(true)}
                onTrainingViewer={() => setShowTrainingViewer(true)}
              />
            </div>
            
            {/* Subtle Ad Banner */}
            <div className="ad-banner-horizontal ad-banner">
              <span style={{ opacity: 0.6 }}>🏰 Medieval Adventures Await 🏰</span>
            </div>
          </div>
        )}

        {showTrainingViewer && (
          <div className="medieval-panel">
            <TrainingViewer onBack={() => setShowTrainingViewer(false)} />
          </div>
        )}
        
        {(gamePhase === 'playing' || gamePhase === 'ended') && !showTrainingViewer && (
          <div className="game-ui">
            {/* Left Panel - Game Controls */}
            <div className="side-panel">
              <h3>🎮 Game Controls</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => useChess.getState().resetGame()}
                  className="medieval-btn"
                >
                  🏠 Back to Menu
                </button>
              </div>
              
              {/* Left Ad Space */}
              <div className="ad-banner">
                <span style={{ opacity: 0.7 }}>⚔️ Strategy Guide</span>
              </div>
            </div>

            {/* Center - Game Board */}
            <div className="board-container">
              <ChessBoard />
              <GameUI onSettings={() => setShowSettings(true)} />
              {gamePhase === 'ended' && <GameOverDialog />}
            </div>

            {/* Right Panel - Game Info */}
            <div className="side-panel">
              <h3>📊 Game Status</h3>
              <div className="medieval-text">
                <div>Current Phase: <strong>{gamePhase}</strong></div>
                <div>Turn: <strong>{useChess.getState().currentPlayer}</strong></div>
              </div>
              
              {/* Right Ad Space */}
              <div className="ad-banner">
                <span style={{ opacity: 0.7 }}>🧙 Master Tips</span>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <SettingsDialog onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}

export default App;
