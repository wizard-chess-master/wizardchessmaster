// Runner for debug tests - can be imported and called from anywhere
import { DebugTests } from './debugTests';

export function runDebugVerification(): void {
  console.log('🚀 Starting comprehensive functionality verification...');
  console.log('📋 Testing: Board layout, Wizard movement, Castling, AI evaluation, Game flow');
  
  try {
    DebugTests.runAllTests();
    
    console.log('');
    console.log('🎯 VERIFICATION COMPLETE');
    console.log('✅ All core functionality working correctly');
    console.log('✅ New board layout with wizards at d1/g1 confirmed'); 
    console.log('✅ Castling system operational');
    console.log('✅ Enhanced AI evaluation active');
    console.log('✅ System ready for 1000-game training');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ VERIFICATION FAILED');
    console.error('Issue detected:', error);
    console.error('Fix required before mass training');
    console.error('');
    throw error;
  }
}

// Quick test runner for AI game
export async function runQuickAITest(): Promise<void> {
  console.log('🤖 Running quick AI vs AI test...');
  try {
    await DebugTests.testQuickAIGame();
    console.log('✅ AI system operational and ready for mass training');
  } catch (error) {
    console.error('❌ AI test failed:', error);
    throw error;
  }
}