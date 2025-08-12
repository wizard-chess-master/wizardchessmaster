// AI Chat System for Multiplayer Games
// Provides contextual commentary during online games

import OpenAI from 'openai';
import { aiPersonalities, getAIComment, getRandomMessage, type AIPersonality } from './aiChatPersonalities';
import type { ChessMove, ChessPiece } from '../chess/types';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = 'gpt-4o';

export class MultiplayerAIChat {
  private openai: OpenAI | null = null;
  private currentPersonality: AIPersonality;
  private lastMoveTime: number = Date.now();
  private moveCount: number = 0;
  private useOpenAI: boolean = false;
  private recentMessages: string[] = []; // Track recent messages to avoid repetition
  private lastIdleCommentTime: number = 0;
  private conversationContext: string[] = []; // Track conversation for context
  
  constructor(personalityId: string = 'coach') {
    this.currentPersonality = aiPersonalities[personalityId] || aiPersonalities.coach;
    
    // Initialize OpenAI if API key is available
    // Check for API key in window object (browser environment)
    const apiKey = (window as any).OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      this.useOpenAI = true;
      console.log('🤖 AI Chat initialized with OpenAI');
    } else {
      console.log('🤖 AI Chat initialized with personality templates (no OpenAI key)');
    }
  }
  
  // Change AI personality
  setPersonality(personalityId: string) {
    this.currentPersonality = aiPersonalities[personalityId] || aiPersonalities.coach;
  }
  
  // Get greeting message when game starts
  getGreeting(): string {
    return getRandomMessage(this.currentPersonality.greetings);
  }
  
  // Analyze a move and generate appropriate commentary
  async analyzeMove(
    move: ChessMove,
    boardState: (ChessPiece | null)[][],
    currentPlayer: 'white' | 'black'
  ): Promise<string> {
    this.moveCount++;
    
    // Determine basic move type
    let moveType: 'good' | 'neutral' | 'bad' | 'check' | 'capture' | 'castle' | 'idle' = 'neutral';
    
    if (move.isCastling) {
      moveType = 'castle';
    } else if (move.captured) {
      moveType = 'capture';
    } else if (this.isCheck(boardState, currentPlayer === 'white' ? 'black' : 'white')) {
      moveType = 'check';
    } else {
      // Simple heuristic for move quality
      const centralSquares = [
        [3, 3], [3, 4], [3, 5], [3, 6],
        [4, 3], [4, 4], [4, 5], [4, 6],
        [5, 3], [5, 4], [5, 5], [5, 6],
        [6, 3], [6, 4], [6, 5], [6, 6]
      ];
      
      const isCentralMove = centralSquares.some(
        ([row, col]) => move.to.row === row && move.to.col === col
      );
      
      if (isCentralMove && this.moveCount < 10) {
        moveType = 'good';
      } else if (move.piece.type === 'wizard' && move.isWizardAttack) {
        moveType = 'good';
      }
    }
    
    // Reduce AI commentary frequency - only comment on significant moves or randomly (15% chance)
    if (this.useOpenAI && this.openai && (moveType === 'check' || moveType === 'capture' || moveType === 'castle' || Math.random() < 0.15)) {
      try {
        const smartComment = await this.getSmartCommentary(move, boardState, moveType);
        if (smartComment) return smartComment;
      } catch (error) {
        console.log('🤖 Falling back to template comments');
      }
    }
    
    // Skip commentary for neutral moves more often to reduce frequency
    if (moveType === 'neutral' && Math.random() < 0.7) {
      return '';
    }
    
    // Use personality templates
    return getAIComment(this.currentPersonality, moveType);
  }
  
  // Get idle chatter when no moves for a while (less frequently)
  getIdleComment(): string {
    const now = Date.now();
    // Only send idle comments every 120 seconds (2 minutes), and avoid repetition
    if (now - this.lastIdleCommentTime > 120000 && now - this.lastMoveTime > 45000) {
      this.lastIdleCommentTime = now;
      const messages = this.currentPersonality.idleChatter.filter(
        msg => !this.recentMessages.includes(msg)
      );
      if (messages.length > 0) {
        const message = getRandomMessage(messages);
        this.recentMessages.push(message);
        if (this.recentMessages.length > 5) {
          this.recentMessages.shift(); // Keep only last 5 messages
        }
        return message;
      }
    }
    return '';
  }
  
  // Get encouragement after a bad move or difficult position
  getEncouragement(): string {
    return getRandomMessage(this.currentPersonality.encouragement);
  }
  
  // Respond to player messages in chat
  async respondToMessage(playerMessage: string): Promise<string> {
    // Add to conversation context
    this.conversationContext.push(`Player: ${playerMessage}`);
    if (this.conversationContext.length > 10) {
      this.conversationContext.shift(); // Keep only last 10 messages for context
    }
    
    // If OpenAI is available, use it for natural conversation
    if (this.useOpenAI && this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are ${this.currentPersonality.name}, a chess commentator. ${this.currentPersonality.description}
              You're chatting with a player during a multiplayer chess game. Keep responses brief (1-2 sentences), friendly, and chess-related when appropriate.
              Conversation context: ${this.conversationContext.join('\n')}`
            },
            {
              role: 'user',
              content: playerMessage
            }
          ],
          max_tokens: 60,
          temperature: 0.8
        });
        
        const aiResponse = response.choices[0].message.content || '';
        this.conversationContext.push(`AI: ${aiResponse}`);
        return aiResponse;
      } catch (error) {
        console.log('🤖 Using template responses for chat');
      }
    }
    
    // Fallback to template-based responses
    const lowerMessage = playerMessage.toLowerCase();
    
    // Common greetings
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      const greetings = [
        `Hello there! Ready for some chess?`,
        `Hey! Let's see some great moves today!`,
        `Greetings! May the best player win!`,
        `Hi! I'm excited to watch this match!`
      ];
      return getRandomMessage(greetings);
    }
    
    // Questions about the game
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why')) {
      const responses = [
        `That's an interesting question! Focus on controlling the center.`,
        `Good thinking! Watch for tactical opportunities.`,
        `Consider developing your pieces before attacking.`,
        `Think about your opponent's threats too!`
      ];
      return getRandomMessage(responses);
    }
    
    // Good game / thanks
    if (lowerMessage.includes('gg') || lowerMessage.includes('good game') || lowerMessage.includes('thanks')) {
      const responses = [
        `Great game! Well played!`,
        `Thanks for the match! That was exciting!`,
        `Good game indeed! You played well!`,
        `It was a pleasure watching this match!`
      ];
      return getRandomMessage(responses);
    }
    
    // Nice move / good move
    if (lowerMessage.includes('nice') || lowerMessage.includes('good move') || lowerMessage.includes('great')) {
      const responses = [
        `Yes, that was brilliant!`,
        `Excellent observation! That was indeed a strong move.`,
        `I agree! Very well calculated.`,
        `Absolutely! That's the kind of play I love to see!`
      ];
      return getRandomMessage(responses);
    }
    
    // Help / advice
    if (lowerMessage.includes('help') || lowerMessage.includes('advice') || lowerMessage.includes('tip')) {
      const responses = [
        `Remember: Control the center, develop pieces, and castle early!`,
        `Look for pins, forks, and skewers - they win material!`,
        `Don't forget about the wizards - they can teleport and attack from range!`,
        `Think at least 2-3 moves ahead and consider your opponent's best reply.`
      ];
      return getRandomMessage(responses);
    }
    
    // Default responses for other messages
    const defaultResponses = [
      `Interesting point! Let's see how this game develops.`,
      `I'm watching closely! This is getting exciting.`,
      `Good to hear from you! Keep those moves coming!`,
      `Indeed! Chess is full of surprises.`,
      `Let's focus on the game - every move counts!`
    ];
    
    return getRandomMessage(defaultResponses);
  }
  
  // Use OpenAI for more sophisticated commentary
  private async getSmartCommentary(
    move: ChessMove,
    boardState: (ChessPiece | null)[][],
    moveType: string
  ): Promise<string | null> {
    if (!this.openai) return null;
    
    try {
      const prompt = `You are ${this.currentPersonality.name}, a chess commentator with this personality: ${this.currentPersonality.description}.
      
      A ${move.piece.color} ${move.piece.type} just moved from ${this.positionToAlgebraic(move.from)} to ${this.positionToAlgebraic(move.to)}.
      Move type: ${moveType}
      ${move.captured ? `Captured: ${move.captured.type}` : ''}
      
      Provide a SHORT (max 15 words), personality-appropriate comment about this move. Be ${this.currentPersonality.id === 'coach' ? 'encouraging and educational' : this.currentPersonality.id === 'rival' ? 'competitive but respectful' : 'mystical and mysterious'}.`;
      
      const response = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.8
      });
      
      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('🤖 OpenAI commentary error:', error);
      return null;
    }
  }
  
  // Helper: Convert position to algebraic notation
  private positionToAlgebraic(pos: { row: number; col: number }): string {
    const files = 'abcdefghij';
    const rank = 10 - pos.row;
    return `${files[pos.col]}${rank}`;
  }
  
  // Helper: Check if king is in check
  private isCheck(board: (ChessPiece | null)[][], kingColor: 'white' | 'black'): boolean {
    // Simplified check detection
    // In a real implementation, this would check all enemy pieces' valid moves
    return false; // Placeholder
  }
}

// Singleton instance for the app
let aiChatInstance: MultiplayerAIChat | null = null;

export function getAIChatInstance(personalityId?: string): MultiplayerAIChat {
  if (!aiChatInstance) {
    aiChatInstance = new MultiplayerAIChat(personalityId);
  } else if (personalityId && personalityId !== aiChatInstance['currentPersonality'].id) {
    aiChatInstance.setPersonality(personalityId);
  }
  return aiChatInstance;
}