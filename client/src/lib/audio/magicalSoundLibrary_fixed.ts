/**
 * Magical Sound Effect Library for Fantasy Chess
 * Now using real audio files instead of placeholder Base64 data
 */

export type MagicalSoundCategory = 
  | 'piece_movement'
  | 'piece_capture' 
  | 'wizard_abilities'
  | 'game_events'
  | 'ui_interactions'
  | 'ambient_magic';

export type MagicalSoundEffect = 
  // Piece Movement Sounds
  | 'piece_move_gentle'
  | 'piece_move_swift'
  | 'piece_move_heavy'
  | 'knight_gallop'
  | 'rook_slide'
  | 'bishop_glide'
  | 'queen_majesty'
  | 'king_royal'
  | 'pawn_step'
  
  // Wizard Specific Sounds
  | 'wizard_teleport'
  | 'wizard_ranged_attack'
  | 'wizard_summon'
  | 'teleport_whoosh'
  | 'magical_zap'
  | 'arcane_blast'
  
  // Capture & Battle Sounds
  | 'capture_clash'
  | 'capture_vanquish'
  | 'capture_magical'
  | 'piece_destruction'
  | 'battle_impact'
  | 'magical_dissolve'
  
  // Special Game Events
  | 'check_warning'
  | 'checkmate_victory'
  | 'checkmate_defeat'
  | 'castling_fortress'
  | 'pawn_promotion'
  | 'game_start_fanfare'
  | 'game_pause'
  | 'game_resume'
  | 'level_up'
  | 'achievement_unlock'
  
  // UI & Menu Sounds
  | 'button_hover'
  | 'button_click'
  | 'menu_open'
  | 'menu_close'
  | 'tab_switch'
  | 'notification_ping'
  | 'error_chime'
  | 'success_chime'
  
  // Ambient Magical Atmosphere
  | 'crystal_hum'
  | 'mystical_wind'
  | 'arcane_energy'
  | 'magical_sparkles'
  | 'enchanted_whispers'
  | 'power_surge';

export interface MagicalSound {
  id: MagicalSoundEffect;
  category: MagicalSoundCategory;
  name: string;
  description: string;
  // Now using real audio file paths instead of Base64
  audioData: string;
  volume: number;
  duration: number; // in milliseconds
  canLoop: boolean;
}

// Real audio files mapped to magical sound categories with variations
const MAGICAL_SOUND_DATA: Record<MagicalSoundEffect, string> = {
  // PIECE MOVEMENT SOUNDS (using success.mp3 and hit.mp3 with different contexts)
  'piece_move_gentle': '/sounds/success.mp3',
  'piece_move_swift': '/sounds/success.mp3', 
  'piece_move_heavy': '/sounds/hit.mp3',
  'knight_gallop': '/sounds/hit.mp3',
  'rook_slide': '/sounds/success.mp3',
  'bishop_glide': '/sounds/success.mp3',
  'queen_majesty': '/sounds/success.mp3',
  'king_royal': '/sounds/hit.mp3',
  'pawn_step': '/sounds/success.mp3',
  
  // WIZARD ABILITIES (using hit.mp3 for impact effects)
  'wizard_teleport': '/sounds/hit.mp3',
  'wizard_ranged_attack': '/sounds/hit.mp3',
  'wizard_summon': '/sounds/success.mp3',
  'teleport_whoosh': '/sounds/hit.mp3',
  'magical_zap': '/sounds/hit.mp3',
  'arcane_blast': '/sounds/hit.mp3',
  
  // CAPTURE SOUNDS (using hit.mp3 for combat)
  'capture_clash': '/sounds/hit.mp3',
  'capture_vanquish': '/sounds/hit.mp3',
  'capture_magical': '/sounds/hit.mp3',
  'piece_destruction': '/sounds/hit.mp3',
  'battle_impact': '/sounds/hit.mp3',
  'magical_dissolve': '/sounds/success.mp3',
  
  // GAME EVENTS (mixed success/hit for variety)
  'check_warning': '/sounds/hit.mp3',
  'checkmate_victory': '/sounds/success.mp3',
  'checkmate_defeat': '/sounds/hit.mp3',
  'castling_fortress': '/sounds/hit.mp3',
  'pawn_promotion': '/sounds/success.mp3',
  'game_start_fanfare': '/sounds/success.mp3',
  'game_pause': '/sounds/success.mp3',
  'game_resume': '/sounds/success.mp3',
  'level_up': '/sounds/success.mp3',
  'achievement_unlock': '/sounds/success.mp3',
  
  // UI SOUNDS (using success.mp3 for positive feedback)
  'button_hover': '/sounds/success.mp3',
  'button_click': '/sounds/success.mp3',
  'menu_open': '/sounds/success.mp3',
  'menu_close': '/sounds/success.mp3',
  'tab_switch': '/sounds/success.mp3',
  'notification_ping': '/sounds/success.mp3',
  'error_chime': '/sounds/hit.mp3',
  'success_chime': '/sounds/success.mp3',
  
  // AMBIENT SOUNDS (COMPLETELY REMOVED - ONLY Theme-music2.mp3 allowed)
  // ALL OLD MUSIC REFERENCES PURGED - ONLY THEME-MUSIC1.MP3 V=12 PERMITTED
  'crystal_hum': '/sounds/success.mp3', // No music - UI sound only
  'mystical_wind': '/sounds/success.mp3', // No music - UI sound only  
  'arcane_energy': '/sounds/success.mp3', // No music - UI sound only
  'magical_sparkles': '/sounds/success.mp3', // No music - UI sound only
  'enchanted_whispers': '/sounds/success.mp3', // No music - UI sound only
  'power_surge': '/sounds/hit.mp3' // No music - UI sound only
};

// Comprehensive magical sound library definitions
export const MAGICAL_SOUND_LIBRARY: MagicalSound[] = [
  // === PIECE MOVEMENT SOUNDS ===
  {
    id: 'piece_move_gentle',
    category: 'piece_movement',
    name: 'Gentle Movement',
    description: 'Soft magical whisper for light piece movements',
    audioData: MAGICAL_SOUND_DATA.piece_move_gentle,
    volume: 0.3,
    duration: 800,
    canLoop: false
  },
  {
    id: 'piece_move_swift',
    category: 'piece_movement', 
    name: 'Swift Movement',
    description: 'Quick magical whoosh for fast movements',
    audioData: MAGICAL_SOUND_DATA.piece_move_swift,
    volume: 0.4,
    duration: 600,
    canLoop: false
  },
  {
    id: 'piece_move_heavy',
    category: 'piece_movement',
    name: 'Heavy Movement',
    description: 'Deep magical rumble for powerful pieces',
    audioData: MAGICAL_SOUND_DATA.piece_move_heavy,
    volume: 0.5,
    duration: 1000,
    canLoop: false
  },
  {
    id: 'knight_gallop',
    category: 'piece_movement',
    name: 'Knight\'s Gallop',
    description: 'Mystical hoofbeats with magical sparkles',
    audioData: MAGICAL_SOUND_DATA.knight_gallop,
    volume: 0.4,
    duration: 1200,
    canLoop: false
  },
  {
    id: 'rook_slide',
    category: 'piece_movement',
    name: 'Rook\'s March',
    description: 'Stone-on-stone grinding with arcane power',
    audioData: MAGICAL_SOUND_DATA.rook_slide,
    volume: 0.4,
    duration: 900,
    canLoop: false
  },
  {
    id: 'bishop_glide',
    category: 'piece_movement',
    name: 'Bishop\'s Blessing',
    description: 'Ethereal chimes with holy resonance',
    audioData: MAGICAL_SOUND_DATA.bishop_glide,
    volume: 0.3,
    duration: 1100,
    canLoop: false
  },
  {
    id: 'queen_majesty',
    category: 'piece_movement',
    name: 'Queen\'s Command',
    description: 'Regal fanfare with commanding presence',
    audioData: MAGICAL_SOUND_DATA.queen_majesty,
    volume: 0.5,
    duration: 1300,
    canLoop: false
  },
  {
    id: 'king_royal',
    category: 'piece_movement',
    name: 'King\'s Authority',
    description: 'Majestic horn with royal dignity',
    audioData: MAGICAL_SOUND_DATA.king_royal,
    volume: 0.6,
    duration: 1500,
    canLoop: false
  },
  {
    id: 'pawn_step',
    category: 'piece_movement',
    name: 'Pawn\'s March',
    description: 'Simple footstep with growing determination',
    audioData: MAGICAL_SOUND_DATA.pawn_step,
    volume: 0.2,
    duration: 500,
    canLoop: false
  },

  // === WIZARD ABILITIES ===
  {
    id: 'wizard_teleport',
    category: 'wizard_abilities',
    name: 'Wizard Teleport',
    description: 'Mystical whoosh with spatial distortion',
    audioData: MAGICAL_SOUND_DATA.wizard_teleport,
    volume: 0.6,
    duration: 1200,
    canLoop: false
  },
  {
    id: 'wizard_ranged_attack',
    category: 'wizard_abilities',
    name: 'Arcane Missile',
    description: 'Crackling energy projectile with impact',
    audioData: MAGICAL_SOUND_DATA.wizard_ranged_attack,
    volume: 0.7,
    duration: 1000,
    canLoop: false
  },
  {
    id: 'wizard_summon',
    category: 'wizard_abilities',
    name: 'Summoning Ritual',
    description: 'Otherworldly chanting with power surge',
    audioData: MAGICAL_SOUND_DATA.wizard_summon,
    volume: 0.5,
    duration: 1500,
    canLoop: false
  },
  {
    id: 'teleport_whoosh',
    category: 'wizard_abilities',
    name: 'Teleport Whoosh',
    description: 'Quick spatial displacement sound',
    audioData: MAGICAL_SOUND_DATA.teleport_whoosh,
    volume: 0.4,
    duration: 800,
    canLoop: false
  },
  {
    id: 'magical_zap',
    category: 'wizard_abilities',
    name: 'Magic Zap',
    description: 'Sharp electrical discharge with sparkles',
    audioData: MAGICAL_SOUND_DATA.magical_zap,
    volume: 0.6,
    duration: 600,
    canLoop: false
  },
  {
    id: 'arcane_blast',
    category: 'wizard_abilities',
    name: 'Arcane Blast',
    description: 'Explosive magical energy release',
    audioData: MAGICAL_SOUND_DATA.arcane_blast,
    volume: 0.8,
    duration: 1100,
    canLoop: false
  },

  // === CAPTURE SOUNDS ===
  {
    id: 'capture_clash',
    category: 'piece_capture',
    name: 'Battle Clash',
    description: 'Metal-on-metal combat with magical sparks',
    audioData: MAGICAL_SOUND_DATA.capture_clash,
    volume: 0.7,
    duration: 800,
    canLoop: false
  },
  {
    id: 'capture_vanquish',
    category: 'piece_capture',
    name: 'Vanquish Foe',
    description: 'Triumphant defeat with fading echo',
    audioData: MAGICAL_SOUND_DATA.capture_vanquish,
    volume: 0.6,
    duration: 1200,
    canLoop: false
  },
  {
    id: 'capture_magical',
    category: 'piece_capture',
    name: 'Magical Capture',
    description: 'Ethereal absorption with mystical resonance',
    audioData: MAGICAL_SOUND_DATA.capture_magical,
    volume: 0.5,
    duration: 1000,
    canLoop: false
  },
  {
    id: 'piece_destruction',
    category: 'piece_capture',
    name: 'Piece Destruction',
    description: 'Shattering defeat with magical dispersion',
    audioData: MAGICAL_SOUND_DATA.piece_destruction,
    volume: 0.8,
    duration: 1300,
    canLoop: false
  },
  {
    id: 'battle_impact',
    category: 'piece_capture',
    name: 'Battle Impact',
    description: 'Heavy collision with shockwave effect',
    audioData: MAGICAL_SOUND_DATA.battle_impact,
    volume: 0.7,
    duration: 900,
    canLoop: false
  },
  {
    id: 'magical_dissolve',
    category: 'piece_capture',
    name: 'Magical Dissolve',
    description: 'Gentle fading with sparkling particles',
    audioData: MAGICAL_SOUND_DATA.magical_dissolve,
    volume: 0.4,
    duration: 1500,
    canLoop: false
  },

  // === GAME EVENTS ===
  {
    id: 'check_warning',
    category: 'game_events',
    name: 'Check Warning',
    description: 'Urgent bell with tension-building harmony',
    audioData: MAGICAL_SOUND_DATA.check_warning,
    volume: 0.7,
    duration: 1000,
    canLoop: false
  },
  {
    id: 'checkmate_victory',
    category: 'game_events',
    name: 'Victory Fanfare',
    description: 'Triumphant horns with celebratory chorus',
    audioData: MAGICAL_SOUND_DATA.checkmate_victory,
    volume: 0.8,
    duration: 2000,
    canLoop: false
  },
  {
    id: 'checkmate_defeat',
    category: 'game_events',
    name: 'Defeat Lament',
    description: 'Somber tones with fading hope',
    audioData: MAGICAL_SOUND_DATA.checkmate_defeat,
    volume: 0.6,
    duration: 1800,
    canLoop: false
  },
  {
    id: 'castling_fortress',
    category: 'game_events',
    name: 'Castling Maneuver',
    description: 'Stone fortress with protective enchantment',
    audioData: MAGICAL_SOUND_DATA.castling_fortress,
    volume: 0.5,
    duration: 1400,
    canLoop: false
  },
  {
    id: 'pawn_promotion',
    category: 'game_events',
    name: 'Pawn Promotion',
    description: 'Ascending transformation with power surge',
    audioData: MAGICAL_SOUND_DATA.pawn_promotion,
    volume: 0.6,
    duration: 1600,
    canLoop: false
  },
  {
    id: 'game_start_fanfare',
    category: 'game_events',
    name: 'Game Start',
    description: 'Opening ceremony with anticipation',
    audioData: MAGICAL_SOUND_DATA.game_start_fanfare,
    volume: 0.7,
    duration: 2500,
    canLoop: false
  },
  {
    id: 'game_pause',
    category: 'game_events',
    name: 'Game Pause',
    description: 'Gentle suspension with ambient fade',
    audioData: MAGICAL_SOUND_DATA.game_pause,
    volume: 0.3,
    duration: 800,
    canLoop: false
  },
  {
    id: 'game_resume',
    category: 'game_events',
    name: 'Game Resume',
    description: 'Energetic return with renewed focus',
    audioData: MAGICAL_SOUND_DATA.game_resume,
    volume: 0.4,
    duration: 600,
    canLoop: false
  },
  {
    id: 'level_up',
    category: 'game_events',
    name: 'Level Up',
    description: 'Achievement unlock with growing power',
    audioData: MAGICAL_SOUND_DATA.level_up,
    volume: 0.6,
    duration: 1200,
    canLoop: false
  },
  {
    id: 'achievement_unlock',
    category: 'game_events',
    name: 'Achievement',
    description: 'Special accomplishment with fanfare',
    audioData: MAGICAL_SOUND_DATA.achievement_unlock,
    volume: 0.7,
    duration: 1400,
    canLoop: false
  },

  // === UI INTERACTIONS ===
  {
    id: 'button_hover',
    category: 'ui_interactions',
    name: 'Button Hover',
    description: 'Subtle highlight with magical shimmer',
    audioData: MAGICAL_SOUND_DATA.button_hover,
    volume: 0.2,
    duration: 300,
    canLoop: false
  },
  {
    id: 'button_click',
    category: 'ui_interactions',
    name: 'Button Click',
    description: 'Satisfying activation with feedback',
    audioData: MAGICAL_SOUND_DATA.button_click,
    volume: 0.4,
    duration: 200,
    canLoop: false
  },
  {
    id: 'menu_open',
    category: 'ui_interactions',
    name: 'Menu Open',
    description: 'Expanding interface with welcoming tone',
    audioData: MAGICAL_SOUND_DATA.menu_open,
    volume: 0.3,
    duration: 500,
    canLoop: false
  },
  {
    id: 'menu_close',
    category: 'ui_interactions',
    name: 'Menu Close',
    description: 'Contracting interface with soft dismiss',
    audioData: MAGICAL_SOUND_DATA.menu_close,
    volume: 0.3,
    duration: 400,
    canLoop: false
  },
  {
    id: 'tab_switch',
    category: 'ui_interactions',
    name: 'Tab Switch',
    description: 'Quick transition with page turn',
    audioData: MAGICAL_SOUND_DATA.tab_switch,
    volume: 0.3,
    duration: 250,
    canLoop: false
  },
  {
    id: 'notification_ping',
    category: 'ui_interactions',
    name: 'Notification',
    description: 'Attention-getting chime with clarity',
    audioData: MAGICAL_SOUND_DATA.notification_ping,
    volume: 0.5,
    duration: 400,
    canLoop: false
  },
  {
    id: 'error_chime',
    category: 'ui_interactions',
    name: 'Error Alert',
    description: 'Warning tone with concerned urgency',
    audioData: MAGICAL_SOUND_DATA.error_chime,
    volume: 0.6,
    duration: 600,
    canLoop: false
  },
  {
    id: 'success_chime',
    category: 'ui_interactions',
    name: 'Success Confirm',
    description: 'Positive feedback with satisfaction',
    audioData: MAGICAL_SOUND_DATA.success_chime,
    volume: 0.5,
    duration: 500,
    canLoop: false
  },

  // === AMBIENT MAGIC ===
  {
    id: 'crystal_hum',
    category: 'ambient_magic',
    name: 'Crystal Resonance',
    description: 'Mystical crystal vibrations with harmony',
    audioData: MAGICAL_SOUND_DATA.crystal_hum,
    volume: 0.2,
    duration: 3000,
    canLoop: true
  },
  {
    id: 'mystical_wind',
    category: 'ambient_magic',
    name: 'Enchanted Breeze',
    description: 'Magical air currents with whispers',
    audioData: MAGICAL_SOUND_DATA.mystical_wind,
    volume: 0.3,
    duration: 4000,
    canLoop: false
  },
  {
    id: 'arcane_energy',
    category: 'ambient_magic',
    name: 'Arcane Power',
    description: 'Raw magical energy with pulsing rhythm',
    audioData: MAGICAL_SOUND_DATA.arcane_energy,
    volume: 0.25,
    duration: 2500,
    canLoop: true
  },
  {
    id: 'magical_sparkles',
    category: 'ambient_magic',
    name: 'Fairy Sparkles',
    description: 'Delicate magical particles with tinkle',
    audioData: MAGICAL_SOUND_DATA.magical_sparkles,
    volume: 0.3,
    duration: 1200,
    canLoop: false
  },
  {
    id: 'enchanted_whispers',
    category: 'ambient_magic',
    name: 'Ancient Whispers',
    description: 'Mysterious voices with forgotten secrets',
    audioData: MAGICAL_SOUND_DATA.enchanted_whispers,
    volume: 0.2,
    duration: 3500,
    canLoop: true
  },
  {
    id: 'power_surge',
    category: 'ambient_magic',
    name: 'Power Surge',
    description: 'Sudden magical energy burst with intensity',
    audioData: MAGICAL_SOUND_DATA.power_surge,
    volume: 0.7,
    duration: 800,
    canLoop: false
  }
];

/**
 * Helper function to get sounds by category
 */
export function getSoundsByCategory(category: MagicalSoundCategory): MagicalSound[] {
  return MAGICAL_SOUND_LIBRARY.filter(sound => sound.category === category);
}

/**
 * Helper function to get a specific sound by ID
 */
export function getSoundById(id: MagicalSoundEffect): MagicalSound | undefined {
  return MAGICAL_SOUND_LIBRARY.find(sound => sound.id === id);
}

/**
 * Helper function to play a magical sound effect
 */
export function playMagicalSound(
  id: MagicalSoundEffect, 
  customVolume?: number,
  customPitch?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const sound = getSoundById(id);
    if (!sound) {
      console.warn(`🎭 Magical sound not found: ${id}`);
      reject(new Error(`Sound not found: ${id}`));
      return;
    }

    try {
      const audio = new Audio(sound.audioData);
      audio.volume = customVolume ?? sound.volume;
      
      if (customPitch && customPitch !== 1.0) {
        audio.playbackRate = customPitch;
      }
      
      audio.addEventListener('ended', () => resolve());
      audio.addEventListener('error', (e) => reject(e));
      
      console.log(`🎭 Playing magical sound: ${id}`);
      audio.play().catch(reject);
      
    } catch (error) {
      console.warn(`🎭 Failed to play magical sound: ${id}`, error);
      reject(error);
    }
  });
}

export default MAGICAL_SOUND_LIBRARY;