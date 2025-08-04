import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useChess } from "./lib/stores/useChess";
import { MainMenu } from "./components/chess/MainMenu";
import { ChessBoard } from "./components/chess/ChessBoard";
import { GameUI } from "./components/chess/GameUI";
import { SettingsDialog } from "./components/chess/SettingsDialog";
import { GameOverDialog } from "./components/chess/GameOverDialog";
import "@fontsource/inter";
import "./styles/chess.css";

function App() {
  const { gamePhase } = useChess();
  const { setHitSound, setSuccessSound } = useAudio();
  const [showSettings, setShowSettings] = useState(false);

  // Initialize audio
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
  }, [setHitSound, setSuccessSound]);

  return (
    <div className="chess-app">
      {gamePhase === 'menu' && (
        <MainMenu onSettings={() => setShowSettings(true)} />
      )}
      
      {(gamePhase === 'playing' || gamePhase === 'ended') && (
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
