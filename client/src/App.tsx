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
    <div className="chess-app">
      {gamePhase === 'menu' && !showTrainingViewer && (
        <MainMenu 
          onSettings={() => setShowSettings(true)}
          onTrainingViewer={() => setShowTrainingViewer(true)}
        />
      )}

      {showTrainingViewer && (
        <TrainingViewer onBack={() => setShowTrainingViewer(false)} />
      )}
      
      {(gamePhase === 'playing' || gamePhase === 'ended') && !showTrainingViewer && (
        <>
          <div className="game-container">
            <ChessBoard />
            <GameUI onSettings={() => setShowSettings(true)} />
          </div>
          {gamePhase === 'ended' && <GameOverDialog />}
        </>
      )}

      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
