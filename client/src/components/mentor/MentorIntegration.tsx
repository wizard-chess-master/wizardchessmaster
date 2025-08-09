import React, { useEffect } from 'react';
import { useDynamicAIMentor } from '../../lib/stores/useDynamicAIMentor';
import { useChess } from '../../lib/stores/useChess';
import { DynamicMentorPanel } from './DynamicMentorPanel';

export function MentorIntegration() {
  const { isActive, initializeMentor } = useDynamicAIMentor();
  const { moveHistory, gamePhase } = useChess();

  // Initialize mentor system on mount
  useEffect(() => {
    if (isActive) {
      initializeMentor();
    }
  }, [isActive, initializeMentor]);

  // Monitor game state changes for mentor analysis
  useEffect(() => {
    const mentorState = useDynamicAIMentor.getState();
    if (isActive && moveHistory.length > 0) {
      // Increment games played when game ends
      if (gamePhase === 'ended') {
        mentorState.sessionProgress.improvementPoints += 10;
        
        // Check for milestones
        if (moveHistory.length < 30) {
          mentorState.recordMilestone('Quick Game Completion');
        }
        if (moveHistory.filter(m => m.isWizardTeleport || m.isWizardAttack).length > 2) {
          mentorState.recordMilestone('Wizard Mastery');
        }
      }
    }
  }, [moveHistory, gamePhase, isActive]);

  return (
    <div className="mentor-integration">
      <DynamicMentorPanel />
    </div>
  );
}