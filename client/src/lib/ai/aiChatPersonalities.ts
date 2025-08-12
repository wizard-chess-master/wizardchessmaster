// AI Chat Personalities for Multiplayer Games
// Each personality has different speaking styles and reactions

export interface AIPersonality {
  id: string;
  name: string;
  avatar: string;
  description: string;
  greetings: string[];
  movePraise: string[];
  moveNeutral: string[];
  moveCritique: string[];
  checkReactions: string[];
  captureReactions: string[];
  castlingReactions: string[];
  endgameComments: string[];
  idleChatter: string[];
  encouragement: string[];
}

export const aiPersonalities: Record<string, AIPersonality> = {
  coach: {
    id: 'coach',
    name: 'Coach Magnus',
    avatar: '🎓',
    description: 'A friendly chess coach who offers helpful tips',
    greetings: [
      "Hello! I'm Coach Magnus. Let me observe this game and offer some insights!",
      "Welcome to the match! I'll be here to comment on the exciting plays.",
      "Great to see you playing! Remember, every move is a learning opportunity."
    ],
    movePraise: [
      "Excellent move! You're controlling the center beautifully.",
      "That's a strong positional play!",
      "Great tactical awareness there!",
      "You're setting up a nice attack pattern.",
      "Wonderful development of your pieces!"
    ],
    moveNeutral: [
      "Interesting choice. Let's see how this develops.",
      "That's a solid, classical approach.",
      "Standard book move - nothing wrong with that!",
      "Keeping things simple, I see.",
      "A patient move. Chess is a game of patience."
    ],
    moveCritique: [
      "Hmm, that move might weaken your position a bit.",
      "Consider protecting your king better next time.",
      "That piece might be a bit exposed there.",
      "Interesting... but it creates some weaknesses.",
      "Bold choice! Though it has some risks."
    ],
    checkReactions: [
      "Check! The game is heating up!",
      "Nice check! Keep the pressure on!",
      "Check! Force them to react to your threats!",
      "That's how you take initiative - check!",
      "Check! The king must move!"
    ],
    captureReactions: [
      "Good exchange! Material balance is important.",
      "Captured! Every piece counts.",
      "Nice tactical capture there!",
      "Trading pieces - simplifying the position.",
      "Material advantage gained!"
    ],
    castlingReactions: [
      "Castling! Safety first - excellent decision!",
      "King to safety! That's proper chess fundamentals.",
      "Good castling! The king needs protection.",
      "Castled! Now your rook can join the game too."
    ],
    endgameComments: [
      "We're entering the endgame now. Every move is critical!",
      "The endgame - where precision matters most!",
      "Simplified position. Time to activate the king!",
      "Endgame technique will decide this match."
    ],
    idleChatter: [
      "Remember - in 10x10 chess, controlling those extra ranks is crucial.",
      "The wizards change everything! They can teleport anywhere within 2 squares.",
      "Wizard attacks go through pieces - perfect for surprise tactics.",
      "Double the board size means double the tactical possibilities!",
      "Those corner wizards can be devastating if left unchecked.",
      "The extended board creates fascinating new opening patterns."
    ],
    encouragement: [
      "You're doing great! Keep it up!",
      "Don't worry about that last move. Focus forward!",
      "Every game makes you stronger!",
      "You're improving with each move!",
      "Stay focused, you've got this!"
    ]
  },
  
  rival: {
    id: 'rival',
    name: 'Viktor the Bold',
    avatar: '⚔️',
    description: 'A competitive but respectful rival',
    greetings: [
      "Viktor here! Let's see some exciting chess!",
      "May the best player win! This should be interesting.",
      "Time for battle on the 64... err, 100 squares!"
    ],
    movePraise: [
      "Impressive! I didn't see that coming!",
      "Now that's a power move!",
      "Respect! That's championship-level play!",
      "You're bringing your A-game today!",
      "That's the fighting spirit!"
    ],
    moveNeutral: [
      "Playing it safe, I see.",
      "Standard stuff. Let's see what comes next.",
      "Methodical approach. Not bad.",
      "Taking the classical route.",
      "Keeping me guessing..."
    ],
    moveCritique: [
      "Really? That's your move?",
      "I think you might regret that one...",
      "Interesting strategy... if you want to lose!",
      "That's... certainly a choice.",
      "Are you sure about that?"
    ],
    checkReactions: [
      "Check! The battle intensifies!",
      "Check! No mercy on the board!",
      "Ha! Check! Feel the pressure!",
      "Check! The hunt is on!",
      "Check! Can you handle the heat?"
    ],
    captureReactions: [
      "Blood has been drawn! Well, pieces captured!",
      "Another one bites the dust!",
      "The battlefield claims another victim!",
      "Casualties of war!",
      "Down goes another piece!"
    ],
    castlingReactions: [
      "Running to safety? Smart move!",
      "Castling! The king retreats to his fortress!",
      "Ah, seeking shelter! Wise choice!",
      "The king finds refuge!"
    ],
    endgameComments: [
      "The final battle approaches!",
      "This is where legends are made!",
      "May the strongest mind prevail!",
      "The climax of our duel!"
    ],
    idleChatter: [
      "Wizard chess demands bold tactics and strategic foresight!",
      "Remember - those wizards can strike from unexpected angles!",
      "The larger board creates more opportunities for brilliant combinations.",
      "Every wizard placement could be the key to victory!",
      "Use those teleport abilities to surprise your opponent!"
    ],
    encouragement: [
      "Come on, show me your best!",
      "Don't give up now!",
      "The game's not over yet!",
      "Fight to the last piece!",
      "Where's your warrior spirit?"
    ]
  },
  
  wizard: {
    id: 'wizard',
    name: 'Merlin the Wise',
    avatar: '🧙',
    description: 'A mystical wizard who speaks in riddles',
    greetings: [
      "Greetings, mortals! The mystical game begins!",
      "I sense powerful magic in this match...",
      "The cosmic chess spirits are watching!"
    ],
    movePraise: [
      "The chess spirits smile upon that move!",
      "Ah, the ancient patterns reveal themselves!",
      "Your aura glows with strategic wisdom!",
      "The magical forces align with your play!",
      "Destiny favors the bold!"
    ],
    moveNeutral: [
      "The fates are still undecided...",
      "An interesting ripple in the chess continuum.",
      "The cosmic balance shifts slightly.",
      "Time will reveal the wisdom of this choice.",
      "The mystic patterns continue to unfold."
    ],
    moveCritique: [
      "The dark shadows gather around that square...",
      "I sense disturbance in the chess force.",
      "Beware! Danger lurks in that decision!",
      "The omens are troubling...",
      "The spirits whisper warnings..."
    ],
    checkReactions: [
      "The king's aura flickers! Check!",
      "Lightning strikes the royal throne!",
      "The magical assault begins!",
      "Mystical forces threaten the crown!",
      "The spell of check is cast!"
    ],
    captureReactions: [
      "A soul returns to the void!",
      "The piece vanishes into the ethereal realm!",
      "Another warrior falls to fate!",
      "The cosmic balance shifts!",
      "Magic claims another!"
    ],
    castlingReactions: [
      "The king teleports to safety!",
      "Ancient protective magic activated!",
      "The fortress spell is complete!",
      "Royal translocation successful!"
    ],
    endgameComments: [
      "The final prophecy approaches!",
      "Destiny's hand guides these last moves!",
      "The cosmic endgame begins!",
      "The ultimate spell shall be cast!"
    ],
    idleChatter: [
      "The wizard pieces hold ancient magical powers beyond mortal understanding...",
      "I sense the mystical energy of the teleportation magic around the board...",
      "The cosmic chess forces whisper secrets of the 10x10 realm...",
      "Beware - wizard attacks pierce through all earthly obstacles!",
      "The expanded board reveals pathways to new magical possibilities..."
    ],
    encouragement: [
      "Channel your inner chess wizard!",
      "The magic is within you!",
      "Trust in the cosmic forces!",
      "Your destiny awaits!",
      "Believe in the power of your moves!"
    ]
  }
};

// Get a random message from a category
export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Select appropriate message based on move quality (simplified analysis)
export function getAIComment(
  personality: AIPersonality,
  moveType: 'good' | 'neutral' | 'bad' | 'check' | 'capture' | 'castle' | 'idle'
): string {
  switch (moveType) {
    case 'good':
      return getRandomMessage(personality.movePraise);
    case 'neutral':
      return getRandomMessage(personality.moveNeutral);
    case 'bad':
      return getRandomMessage(personality.moveCritique);
    case 'check':
      return getRandomMessage(personality.checkReactions);
    case 'capture':
      return getRandomMessage(personality.captureReactions);
    case 'castle':
      return getRandomMessage(personality.castlingReactions);
    case 'idle':
      return getRandomMessage(personality.idleChatter);
    default:
      return getRandomMessage(personality.moveNeutral);
  }
}