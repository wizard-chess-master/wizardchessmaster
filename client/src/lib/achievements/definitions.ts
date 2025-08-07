import { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // === BEGINNER ACHIEVEMENTS (1-20) ===
  // Gameplay Basics
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game of Fantasy Chess',
    icon: '🏆',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'wins', target: 1 },
    reward: { experiencePoints: 100, unlockMessage: 'Welcome to the realm of Fantasy Chess!' }
  },
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 1 },
    reward: { experiencePoints: 50, unlockMessage: 'Your journey into magical chess begins!' }
  },
  {
    id: 'first_checkmate',
    name: 'Checkmate!',
    description: 'Deliver your first checkmate',
    icon: '♔',
    rarity: 'common',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 1 },
    reward: { experiencePoints: 150, unlockMessage: 'The king falls before your strategy!' }
  },
  {
    id: 'first_capture',
    name: 'First Blood',
    description: 'Capture your first piece',
    icon: '⚔️',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'captures', target: 1 },
    reward: { experiencePoints: 75, unlockMessage: 'The battle has begun!' }
  },
  {
    id: 'first_wizard',
    name: 'Wizard\'s Apprentice',
    description: 'Move a wizard for the first time',
    icon: '🧙',
    rarity: 'common',
    category: 'special',
    criteria: { type: 'special_moves', target: 1 },
    reward: { experiencePoints: 125, unlockMessage: 'You have awakened the magical arts!' }
  },

  // Early Progress
  {
    id: 'novice_player',
    name: 'Novice Player',
    description: 'Play 5 games',
    icon: '🎯',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 5 },
    reward: { experiencePoints: 200, unlockMessage: 'You are learning the game!' }
  },
  {
    id: 'chess_apprentice',
    name: 'Chess Apprentice',
    description: 'Win 5 games',
    icon: '⚔️',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'wins', target: 5 },
    reward: { experiencePoints: 250, title: 'Apprentice', unlockMessage: 'You are learning the ways of magical chess!' }
  },
  {
    id: 'tactical_start',
    name: 'Tactical Thinking',
    description: 'Achieve 3 checkmates',
    icon: '🎯',
    rarity: 'common',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 3 },
    reward: { experiencePoints: 300, unlockMessage: 'Your tactical skills are developing!' }
  },
  {
    id: 'piece_hunter',
    name: 'Piece Hunter',
    description: 'Capture 10 pieces',
    icon: '🏹',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'captures', target: 10 },
    reward: { experiencePoints: 200, unlockMessage: 'You have a keen eye for captures!' }
  },
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play for 30 minutes total',
    icon: '⏰',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'time_played', target: 30 },
    reward: { experiencePoints: 150, unlockMessage: 'Your dedication is noticed!' }
  },

  // Piece Movement
  {
    id: 'active_player',
    name: 'Active Player',
    description: 'Move 100 pieces',
    icon: '🏃',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'pieces_moved', target: 100 },
    reward: { experiencePoints: 175, unlockMessage: 'You are becoming more active on the board!' }
  },
  {
    id: 'wizard_initiate',
    name: 'Wizard Initiate',
    description: 'Use wizard abilities 5 times',
    icon: '✨',
    rarity: 'common',
    category: 'special',
    criteria: { type: 'special_moves', target: 5 },
    reward: { experiencePoints: 250, unlockMessage: 'You are mastering magical abilities!' }
  },
  {
    id: 'first_castle',
    name: 'Royal Protection',
    description: 'Perform your first castling move',
    icon: '🏰',
    rarity: 'common',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 1, condition: 'castling' },
    reward: { experiencePoints: 200, unlockMessage: 'The king is safely protected!' }
  },
  {
    id: 'first_promotion',
    name: 'Rising Power',
    description: 'Promote a pawn for the first time',
    icon: '👑',
    rarity: 'common',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 1, condition: 'promotion' },
    reward: { experiencePoints: 300, unlockMessage: 'A humble pawn ascends to greatness!' }
  },
  {
    id: 'consistent_player',
    name: 'Consistent Player',
    description: 'Play 10 games',
    icon: '📊',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 10 },
    reward: { experiencePoints: 350, unlockMessage: 'Consistency breeds improvement!' }
  },

  // Early Strategy
  {
    id: 'winning_start',
    name: 'Winning Start',
    description: 'Win 2 games in a row',
    icon: '🔥',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'streaks', target: 2 },
    reward: { experiencePoints: 300, unlockMessage: 'You are on a roll!' }
  },
  {
    id: 'swift_victory',
    name: 'Swift Victory',
    description: 'Win a game in under 20 moves',
    icon: '⚡',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 1 },
    reward: { experiencePoints: 500, unlockMessage: 'Lightning fast tactics!' }
  },
  {
    id: 'ai_challenger',
    name: 'AI Challenger',
    description: 'Defeat an AI opponent',
    icon: '🤖',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'ai_defeats', target: 1 },
    reward: { experiencePoints: 250, unlockMessage: 'You have proven yourself against artificial intelligence!' }
  },
  {
    id: 'perfect_start',
    name: 'Perfect Start',
    description: 'Win a game without losing any pieces',
    icon: '💯',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 1 },
    reward: { experiencePoints: 600, unlockMessage: 'Flawless execution!' }
  },
  {
    id: 'battle_veteran',
    name: 'Battle Veteran',
    description: 'Capture 25 pieces',
    icon: '⚔️',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'captures', target: 25 },
    reward: { experiencePoints: 400, unlockMessage: 'You are becoming a feared opponent!' }
  },

  // === INTERMEDIATE ACHIEVEMENTS (21-50) ===
  // Skill Development
  {
    id: 'chess_knight',
    name: 'Chess Knight',
    description: 'Win 25 games',
    icon: '🛡️',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'wins', target: 25 },
    reward: { experiencePoints: 750, title: 'Knight', pieceSet: 'crystal', unlockMessage: 'Your skills have been recognized by the realm! Unlocked: Crystal Realm piece set!' }
  },
  {
    id: 'experienced_player',
    name: 'Experienced Player',
    description: 'Play 50 games',
    icon: '📈',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 50 },
    reward: { experiencePoints: 600, unlockMessage: 'Experience is your greatest teacher!' }
  },
  {
    id: 'checkmate_expert',
    name: 'Checkmate Expert',
    description: 'Achieve 15 checkmates',
    icon: '🎯',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 15 },
    reward: { experiencePoints: 700, unlockMessage: 'Your finishing moves are becoming legendary!' }
  },
  {
    id: 'time_warrior',
    name: 'Time Warrior',
    description: 'Play for 2 hours total',
    icon: '⏳',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'time_played', target: 120 },
    reward: { experiencePoints: 500, unlockMessage: 'Your dedication knows no bounds!' }
  },
  {
    id: 'movement_master',
    name: 'Movement Master',
    description: 'Move 500 pieces',
    icon: '🏃‍♂️',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'pieces_moved', target: 500 },
    reward: { experiencePoints: 600, unlockMessage: 'Every move matters, and you understand this!' }
  },

  // Magic Mastery
  {
    id: 'wizard_adept',
    name: 'Wizard Adept',
    description: 'Use wizard abilities 25 times',
    icon: '🔮',
    rarity: 'rare',
    category: 'special',
    criteria: { type: 'special_moves', target: 25 },
    reward: { experiencePoints: 800, unlockMessage: 'The magical arts bend to your will!' }
  },
  {
    id: 'castle_guardian',
    name: 'Castle Guardian',
    description: 'Perform castling 10 times',
    icon: '🏰',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 10, condition: 'castling' },
    reward: { experiencePoints: 650, unlockMessage: 'You understand the importance of king safety!' }
  },
  {
    id: 'promotion_master',
    name: 'Promotion Master',
    description: 'Promote pawns 5 times',
    icon: '⬆️',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 5, condition: 'promotion' },
    reward: { experiencePoints: 750, unlockMessage: 'You transform weakness into strength!' }
  },
  {
    id: 'hunter_elite',
    name: 'Hunter Elite',
    description: 'Capture 75 pieces',
    icon: '🎯',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'captures', target: 75 },
    reward: { experiencePoints: 700, unlockMessage: 'Your hunting instincts are unmatched!' }
  },
  {
    id: 'winning_streak',
    name: 'Winning Streak',
    description: 'Win 5 games in a row',
    icon: '🔥',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'streaks', target: 5 },
    reward: { experiencePoints: 900, unlockMessage: 'You are on fire!' }
  },

  // Speed and Efficiency
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win 3 games in under 20 moves',
    icon: '💨',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 3 },
    reward: { experiencePoints: 1000, unlockMessage: 'Speed and precision combined!' }
  },
  {
    id: 'ai_hunter',
    name: 'AI Hunter',
    description: 'Defeat AI opponents 10 times',
    icon: '🔫',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'ai_defeats', target: 10 },
    reward: { experiencePoints: 800, unlockMessage: 'Artificial intelligence bows before you!' }
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Win 3 perfect games (no pieces lost)',
    icon: '✨',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 3 },
    reward: { experiencePoints: 1200, unlockMessage: 'Perfection is within your grasp!' }
  },
  {
    id: 'royal_ascension',
    name: 'Royal Ascension',
    description: 'Reach level 10',
    icon: '👑',
    rarity: 'rare',
    category: 'mastery',
    criteria: { type: 'custom', target: 10, condition: 'level' },
    reward: { experiencePoints: 1000, title: 'Noble', boardTheme: 'marble', unlockMessage: 'You have ascended to nobility! Unlocked: Royal Marble board theme!' }
  },
  {
    id: 'marathon_player',
    name: 'Marathon Player',
    description: 'Play 100 games',
    icon: '🏃‍♀️',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 100 },
    reward: { experiencePoints: 1000, unlockMessage: 'Your endurance is legendary!' }
  },

  // Advanced Strategy
  {
    id: 'tactical_genius',
    name: 'Tactical Genius',
    description: 'Achieve 30 checkmates',
    icon: '🧠',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 30 },
    reward: { experiencePoints: 1100, unlockMessage: 'Your tactical prowess is undeniable!' }
  },
  {
    id: 'devoted_strategist',
    name: 'Devoted Strategist',
    description: 'Play for 5 hours total',
    icon: '📚',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'time_played', target: 300 },
    reward: { experiencePoints: 900, unlockMessage: 'Strategy requires dedication!' }
  },
  {
    id: 'piece_commander',
    name: 'Piece Commander',
    description: 'Move 1000 pieces',
    icon: '⚡',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'pieces_moved', target: 1000 },
    reward: { experiencePoints: 1000, unlockMessage: 'You command your army with precision!' }
  },
  {
    id: 'magic_scholar',
    name: 'Magic Scholar',
    description: 'Use wizard abilities 50 times',
    icon: '📖',
    rarity: 'rare',
    category: 'special',
    criteria: { type: 'special_moves', target: 50 },
    reward: { experiencePoints: 1200, unlockMessage: 'You have studied the arcane arts deeply!' }
  },
  {
    id: 'fortress_builder',
    name: 'Fortress Builder',
    description: 'Perform castling 25 times',
    icon: '🏯',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 25, condition: 'castling' },
    reward: { experiencePoints: 1000, unlockMessage: 'You build impenetrable defenses!' }
  },

  // Combat Excellence
  {
    id: 'battle_legend',
    name: 'Battle Legend',
    description: 'Capture 150 pieces',
    icon: '⚔️',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'captures', target: 150 },
    reward: { experiencePoints: 1300, pieceSet: 'shadow', unlockMessage: 'Legends speak of your prowess in battle! Unlocked: Shadow Legion piece set!' }
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Win 10 games in a row',
    icon: '🌟',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'streaks', target: 10 },
    reward: { experiencePoints: 1500, unlockMessage: 'Your consistency is unmatched!' }
  },
  {
    id: 'lightning_lord',
    name: 'Lightning Lord',
    description: 'Win 5 games in under 15 moves',
    icon: '⚡',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 5 },
    reward: { experiencePoints: 1500, boardTheme: 'crystal_ice', unlockMessage: 'You strike faster than lightning! Unlocked: Frozen Realm board theme!' }
  },
  {
    id: 'ai_nemesis',
    name: 'AI Nemesis',
    description: 'Defeat AI opponents 25 times',
    icon: '🤖',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'ai_defeats', target: 25 },
    reward: { experiencePoints: 1200, unlockMessage: 'You are the bane of artificial minds!' }
  },
  {
    id: 'flawless_warrior',
    name: 'Flawless Warrior',
    description: 'Win 5 perfect games',
    icon: '💎',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 5 },
    reward: { experiencePoints: 2000, unlockMessage: 'Flawless victory defines you!' }
  },

  // Promotion Mastery
  {
    id: 'ascension_master',
    name: 'Ascension Master',
    description: 'Promote pawns 15 times',
    icon: '👑',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 15, condition: 'promotion' },
    reward: { experiencePoints: 1400, unlockMessage: 'You elevate the humble to greatness!' }
  },
  {
    id: 'chess_scholar',
    name: 'Chess Scholar',
    description: 'Win 50 games',
    icon: '📚',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'wins', target: 50 },
    reward: { experiencePoints: 1200, title: 'Scholar', unlockMessage: 'Your knowledge of chess is profound!' }
  },
  {
    id: 'seasoned_veteran',
    name: 'Seasoned Veteran',
    description: 'Play 200 games',
    icon: '🎖️',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 200 },
    reward: { experiencePoints: 1500, unlockMessage: 'Experience has forged you into a veteran!' }
  },
  {
    id: 'checkmate_virtuoso',
    name: 'Checkmate Virtuoso',
    description: 'Achieve 50 checkmates',
    icon: '🎭',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 50 },
    reward: { experiencePoints: 1600, unlockMessage: 'Your finishing moves are pure artistry!' }
  },
  {
    id: 'time_master',
    name: 'Time Master',
    description: 'Play for 10 hours total',
    icon: '⏰',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'time_played', target: 600 },
    reward: { experiencePoints: 1400, unlockMessage: 'Time bends to your mastery!' }
  },

  // === EXPERT ACHIEVEMENTS (51-80) ===
  // Mastery Level
  {
    id: 'chess_master',
    name: 'Chess Master',
    description: 'Win 100 games',
    icon: '👑',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'wins', target: 100 },
    reward: { experiencePoints: 2000, title: 'Master', pieceSet: 'golden', unlockMessage: 'You have mastered the art of Fantasy Chess! Unlocked: Golden Empire piece set!' }
  },
  {
    id: 'movement_virtuoso',
    name: 'Movement Virtuoso',
    description: 'Move 2500 pieces',
    icon: '🎯',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'pieces_moved', target: 2500 },
    reward: { experiencePoints: 1800, unlockMessage: 'Every movement is calculated perfection!' }
  },
  {
    id: 'arcane_master',
    name: 'Arcane Master',
    description: 'Use wizard abilities 100 times',
    icon: '🧙‍♂️',
    rarity: 'epic',
    category: 'special',
    criteria: { type: 'special_moves', target: 100 },
    reward: { experiencePoints: 2200, unlockMessage: 'The arcane arts are yours to command!' }
  },
  {
    id: 'castle_architect',
    name: 'Castle Architect',
    description: 'Perform castling 50 times',
    icon: '🏛️',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 50, condition: 'castling' },
    reward: { experiencePoints: 1900, unlockMessage: 'You design impregnable fortresses!' }
  },
  {
    id: 'transformation_lord',
    name: 'Transformation Lord',
    description: 'Promote pawns 30 times',
    icon: '🔄',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 30, condition: 'promotion' },
    reward: { experiencePoints: 2100, unlockMessage: 'You master the art of transformation!' }
  },

  // Combat Supremacy
  {
    id: 'war_general',
    name: 'War General',
    description: 'Capture 300 pieces',
    icon: '⚔️',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'captures', target: 300 },
    reward: { experiencePoints: 2000, unlockMessage: 'You command the battlefield like a general!' }
  },
  {
    id: 'unstoppable_force',
    name: 'Unstoppable Force',
    description: 'Win 15 games in a row',
    icon: '🌪️',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'streaks', target: 15 },
    reward: { experiencePoints: 2500, unlockMessage: 'Nothing can stop your momentum!' }
  },
  {
    id: 'blitz_master',
    name: 'Blitz Master',
    description: 'Win 10 games in under 15 moves',
    icon: '💨',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 10 },
    reward: { experiencePoints: 2300, unlockMessage: 'Speed and strategy unite in perfect harmony!' }
  },
  {
    id: 'ai_destroyer',
    name: 'AI Destroyer',
    description: 'Defeat AI opponents 50 times',
    icon: '🔥',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'ai_defeats', target: 50 },
    reward: { experiencePoints: 1900, pieceSet: 'dragon', unlockMessage: 'You crush artificial intelligence with ease! Unlocked: Dragon Lords piece set!' }
  },
  {
    id: 'perfectionist_supreme',
    name: 'Perfectionist Supreme',
    description: 'Win 10 perfect games',
    icon: '💯',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 10 },
    reward: { experiencePoints: 3000, unlockMessage: 'Perfection is your standard!' }
  },

  // Advanced Progress
  {
    id: 'dedicated_master',
    name: 'Dedicated Master',
    description: 'Play 500 games',
    icon: '🏅',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 500 },
    reward: { experiencePoints: 2500, unlockMessage: 'Your dedication surpasses all others!' }
  },
  {
    id: 'tactical_emperor',
    name: 'Tactical Emperor',
    description: 'Achieve 100 checkmates',
    icon: '👨‍⚔️',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 100 },
    reward: { experiencePoints: 2800, unlockMessage: 'You rule the realm of tactics!' }
  },
  {
    id: 'time_lord',
    name: 'Time Lord',
    description: 'Play for 25 hours total',
    icon: '⌛',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'time_played', target: 1500 },
    reward: { experiencePoints: 2200, unlockMessage: 'Time itself bows to your will!' }
  },
  {
    id: 'movement_god',
    name: 'Movement God',
    description: 'Move 5000 pieces',
    icon: '🌟',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'pieces_moved', target: 5000 },
    reward: { experiencePoints: 3000, unlockMessage: 'Your mastery of movement is divine!' }
  },
  {
    id: 'noble_lord',
    name: 'Noble Lord',
    description: 'Reach level 25',
    icon: '🏰',
    rarity: 'epic',
    category: 'mastery',
    criteria: { type: 'custom', target: 25, condition: 'level' },
    reward: { experiencePoints: 2000, title: 'Lord', unlockMessage: 'You have achieved noble lordship!' }
  },

  // Magical Mastery
  {
    id: 'wizard_supreme',
    name: 'Wizard Supreme',
    description: 'Use wizard abilities 200 times',
    icon: '🔮',
    rarity: 'legendary',
    category: 'special',
    criteria: { type: 'special_moves', target: 200 },
    reward: { experiencePoints: 3500, pieceSet: 'elemental', unlockMessage: 'You are supreme among wizards! Unlocked: Elemental Forces piece set!' }
  },
  {
    id: 'fortress_emperor',
    name: 'Fortress Emperor',
    description: 'Perform castling 100 times',
    icon: '🏯',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 100, condition: 'castling' },
    reward: { experiencePoints: 3200, unlockMessage: 'You build empires of stone and strategy!' }
  },
  {
    id: 'metamorphosis_god',
    name: 'Metamorphosis God',
    description: 'Promote pawns 50 times',
    icon: '🦋',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 50, condition: 'promotion' },
    reward: { experiencePoints: 3300, unlockMessage: 'You transform reality itself!' }
  },
  {
    id: 'battle_god',
    name: 'Battle God',
    description: 'Capture 500 pieces',
    icon: '⚡',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'captures', target: 500 },
    reward: { experiencePoints: 3500, unlockMessage: 'You are divine in warfare!' }
  },
  {
    id: 'immortal_streak',
    name: 'Immortal Streak',
    description: 'Win 25 games in a row',
    icon: '♾️',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'streaks', target: 25 },
    reward: { experiencePoints: 4000, unlockMessage: 'Your streak transcends mortal limits!' }
  },

  // Speed Legends
  {
    id: 'lightning_god',
    name: 'Lightning God',
    description: 'Win 15 games in under 12 moves',
    icon: '⚡',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 15 },
    reward: { experiencePoints: 3800, unlockMessage: 'You strike with the fury of storms!' }
  },
  {
    id: 'ai_apocalypse',
    name: 'AI Apocalypse',
    description: 'Defeat AI opponents 100 times',
    icon: '💀',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'ai_defeats', target: 100 },
    reward: { experiencePoints: 3000, unlockMessage: 'You bring about the end of artificial intelligence!' }
  },
  {
    id: 'flawless_deity',
    name: 'Flawless Deity',
    description: 'Win 20 perfect games',
    icon: '✨',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 20 },
    reward: { experiencePoints: 5000, unlockMessage: 'Perfection flows through your divine essence!' }
  },
  {
    id: 'marathon_legend',
    name: 'Marathon Legend',
    description: 'Play 1000 games',
    icon: '🏃‍♂️',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 1000 },
    reward: { experiencePoints: 4000, unlockMessage: 'Your endurance becomes legend!' }
  },
  {
    id: 'checkmate_deity',
    name: 'Checkmate Deity',
    description: 'Achieve 200 checkmates',
    icon: '👑',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 200 },
    reward: { experiencePoints: 4500, unlockMessage: 'Your finishing moves are divine providence!' }
  },

  // Time Mastery
  {
    id: 'eternal_player',
    name: 'Eternal Player',
    description: 'Play for 50 hours total',
    icon: '⌚',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'time_played', target: 3000 },
    reward: { experiencePoints: 3500, unlockMessage: 'You have devoted an eternity to mastery!' }
  },
  {
    id: 'chess_grandmaster',
    name: 'Grandmaster',
    description: 'Win 500 games',
    icon: '💎',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'wins', target: 500 },
    reward: { experiencePoints: 5000, title: 'Grandmaster', pieceSet: 'cosmic', unlockMessage: 'You are among the greatest chess masters in the realm! Unlocked: Cosmic Guardians piece set!' }
  },
  {
    id: 'movement_transcendent',
    name: 'Movement Transcendent',
    description: 'Move 10000 pieces',
    icon: '🌌',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'pieces_moved', target: 10000 },
    reward: { experiencePoints: 4500, unlockMessage: 'Your movement transcends physical reality!' }
  },
  {
    id: 'arcane_god',
    name: 'Arcane God',
    description: 'Use wizard abilities 500 times',
    icon: '🌟',
    rarity: 'legendary',
    category: 'special',
    criteria: { type: 'special_moves', target: 500 },
    reward: { experiencePoints: 5500, unlockMessage: 'You are a god among wizards!' }
  },
  {
    id: 'royal_emperor',
    name: 'Royal Emperor',
    description: 'Reach level 50',
    icon: '👑',
    rarity: 'legendary',
    category: 'mastery',
    criteria: { type: 'custom', target: 50, condition: 'level' },
    reward: { experiencePoints: 4000, title: 'Emperor', unlockMessage: 'You have ascended to imperial majesty!' }
  },

  // === LEGENDARY ACHIEVEMENTS (81-100) ===
  // Ultimate Mastery
  {
    id: 'chess_legend',
    name: 'Chess Legend',
    description: 'Win 1000 games',
    icon: '🏆',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'wins', target: 1000 },
    reward: { experiencePoints: 7500, title: 'Legend', unlockMessage: 'Your name will be remembered for all time!' }
  },
  {
    id: 'infinite_streak',
    name: 'Infinite Streak',
    description: 'Win 50 games in a row',
    icon: '∞',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'streaks', target: 50 },
    reward: { experiencePoints: 8000, unlockMessage: 'Your winning streak defies comprehension!' }
  },
  {
    id: 'speed_of_light',
    name: 'Speed of Light',
    description: 'Win 25 games in under 10 moves',
    icon: '🌟',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 25 },
    reward: { experiencePoints: 6000, unlockMessage: 'You move faster than light itself!' }
  },
  {
    id: 'ai_terminator',
    name: 'AI Terminator',
    description: 'Defeat AI opponents 250 times',
    icon: '🔥',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'ai_defeats', target: 250 },
    reward: { experiencePoints: 5000, unlockMessage: 'You are the end of artificial intelligence!' }
  },
  {
    id: 'perfect_immortal',
    name: 'Perfect Immortal',
    description: 'Win 50 perfect games',
    icon: '💫',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 50 },
    reward: { experiencePoints: 10000, unlockMessage: 'Your perfection is immortal!' }
  },

  // Ultimate Progress
  {
    id: 'infinite_player',
    name: 'Infinite Player',
    description: 'Play 2500 games',
    icon: '♾️',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 2500 },
    reward: { experiencePoints: 7000, unlockMessage: 'Your dedication knows no bounds!' }
  },
  {
    id: 'checkmate_omnipotent',
    name: 'Checkmate Omnipotent',
    description: 'Achieve 500 checkmates',
    icon: '🌌',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 500 },
    reward: { experiencePoints: 8000, unlockMessage: 'You hold omnipotent power over checkmate!' }
  },
  {
    id: 'timeless_master',
    name: 'Timeless Master',
    description: 'Play for 100 hours total',
    icon: '⏰',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'time_played', target: 6000 },
    reward: { experiencePoints: 6500, unlockMessage: 'You have achieved timeless mastery!' }
  },
  {
    id: 'movement_omnipresent',
    name: 'Movement Omnipresent',
    description: 'Move 25000 pieces',
    icon: '🌟',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'pieces_moved', target: 25000 },
    reward: { experiencePoints: 7500, unlockMessage: 'You are omnipresent in every movement!' }
  },
  {
    id: 'wizard_omniscient',
    name: 'Wizard Omniscient',
    description: 'Use wizard abilities 1000 times',
    icon: '🔮',
    rarity: 'legendary',
    category: 'special',
    criteria: { type: 'special_moves', target: 1000 },
    reward: { experiencePoints: 9000, unlockMessage: 'You possess omniscient magical knowledge!' }
  },

  // Ultimate Combat
  {
    id: 'war_omnipotent',
    name: 'War Omnipotent',
    description: 'Capture 1000 pieces',
    icon: '⚔️',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'captures', target: 1000 },
    reward: { experiencePoints: 8500, unlockMessage: 'You wield omnipotent power in warfare!' }
  },
  {
    id: 'castle_omnipresent',
    name: 'Castle Omnipresent',
    description: 'Perform castling 250 times',
    icon: '🏰',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 250, condition: 'castling' },
    reward: { experiencePoints: 7000, unlockMessage: 'Your castles exist in all realities!' }
  },
  {
    id: 'transformation_omnipotent',
    name: 'Transformation Omnipotent',
    description: 'Promote pawns 100 times',
    icon: '🔄',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'special_moves', target: 100, condition: 'promotion' },
    reward: { experiencePoints: 7500, unlockMessage: 'You possess omnipotent transformation power!' }
  },
  {
    id: 'divine_emperor',
    name: 'Divine Emperor',
    description: 'Reach level 100',
    icon: '👑',
    rarity: 'legendary',
    category: 'mastery',
    criteria: { type: 'custom', target: 100, condition: 'level' },
    reward: { experiencePoints: 10000, title: 'Divine Emperor', unlockMessage: 'You have achieved divine imperial status!' }
  },

  // === MYTHIC ACHIEVEMENTS (Special/Hidden) ===
  {
    id: 'chess_deity',
    name: 'Chess Deity',
    description: 'Win 5000 games',
    icon: '👑',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'wins', target: 5000 },
    reward: { experiencePoints: 15000, title: 'Deity', unlockMessage: 'You have transcended mortal limits!' },
    hidden: true
  },
  {
    id: 'omnipotent_streak',
    name: 'Omnipotent Streak',
    description: 'Win 100 games in a row',
    icon: '♾️',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'streaks', target: 100 },
    reward: { experiencePoints: 20000, unlockMessage: 'Your power is truly omnipotent!' },
    hidden: true
  },
  {
    id: 'instant_victory',
    name: 'Instant Victory',
    description: 'Win 50 games in under 8 moves',
    icon: '💫',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 50 },
    reward: { experiencePoints: 12000, unlockMessage: 'Victory comes instantly to your call!' },
    hidden: true
  },
  {
    id: 'ai_annihilator',
    name: 'AI Annihilator',
    description: 'Defeat AI opponents 500 times',
    icon: '💀',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'ai_defeats', target: 500 },
    reward: { experiencePoints: 10000, unlockMessage: 'You have annihilated artificial intelligence!' },
    hidden: true
  },
  {
    id: 'perfect_omnipotent',
    name: 'Perfect Omnipotent',
    description: 'Win 100 perfect games',
    icon: '✨',
    rarity: 'legendary',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 100 },
    reward: { experiencePoints: 25000, unlockMessage: 'Your perfection is omnipotent and eternal!' },
    hidden: true
  },
  {
    id: 'ultimate_transcendence',
    name: 'Ultimate Transcendence',
    description: 'Achieve all other achievements',
    icon: '🌌',
    rarity: 'legendary',
    category: 'special',
    criteria: { type: 'custom', target: 99, condition: 'achievements' },
    reward: { experiencePoints: 50000, title: 'Transcendent One', unlockMessage: 'You have transcended all mortal achievements!' },
    hidden: true
  }
];

export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  300,   // Level 3
  600,   // Level 4
  1000,  // Level 5
  1500,  // Level 6
  2200,  // Level 7
  3000,  // Level 8
  4000,  // Level 9
  5500,  // Level 10
  7500,  // Level 11
  10000, // Level 12
  13000, // Level 13
  16500, // Level 14
  20500, // Level 15
  25000  // Level 16+
];

export function calculateLevel(experience: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getExperienceForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 5000;
  }
  return LEVEL_THRESHOLDS[currentLevel] || 0;
}