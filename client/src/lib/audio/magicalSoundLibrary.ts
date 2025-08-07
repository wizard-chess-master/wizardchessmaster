/**
 * Magical Sound Effect Library for Fantasy Chess
 * Provides immersive magical audio experiences for various game actions
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
  // We'll use base64 encoded magical sounds to avoid external file dependencies
  audioData: string;
  volume: number;
  duration: number; // in milliseconds
  canLoop: boolean;
}

// Base64 encoded magical sound effects (shortened for demo - these would be actual audio data)
const MAGICAL_SOUND_DATA: Record<MagicalSoundEffect, string> = {
  // Piece Movement Sounds
  'piece_move_gentle': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'piece_move_swift': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'piece_move_heavy': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'knight_gallop': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'rook_slide': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'bishop_glide': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'queen_majesty': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'king_royal': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'pawn_step': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  
  // Wizard Abilities
  'wizard_teleport': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'wizard_ranged_attack': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'wizard_summon': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'teleport_whoosh': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'magical_zap': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'arcane_blast': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  
  // Capture Sounds
  'capture_clash': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'capture_vanquish': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'capture_magical': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'piece_destruction': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'battle_impact': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'magical_dissolve': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  
  // Game Events
  'check_warning': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'checkmate_victory': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'checkmate_defeat': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'castling_fortress': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'pawn_promotion': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'game_start_fanfare': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'game_pause': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'game_resume': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'level_up': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'achievement_unlock': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  
  // UI Sounds
  'button_hover': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'button_click': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'menu_open': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'menu_close': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'tab_switch': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'notification_ping': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'error_chime': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'success_chime': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  
  // Ambient Magical Atmosphere
  'crystal_hum': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'mystical_wind': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'arcane_energy': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'magical_sparkles': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'enchanted_whispers': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ',
  'power_surge': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQCjiH3/LNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmYQ'
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
    name: 'Fortress Slide',
    description: 'Stone sliding with magical reinforcement',
    audioData: MAGICAL_SOUND_DATA.rook_slide,
    volume: 0.4,
    duration: 900,
    canLoop: false
  },
  {
    id: 'bishop_glide',
    category: 'piece_movement',
    name: 'Sacred Glide',
    description: 'Ethereal choir-like gliding sound',
    audioData: MAGICAL_SOUND_DATA.bishop_glide,
    volume: 0.35,
    duration: 800,
    canLoop: false
  },
  {
    id: 'queen_majesty',
    category: 'piece_movement',
    name: 'Royal Majesty',
    description: 'Majestic orchestral movement with sparkles',
    audioData: MAGICAL_SOUND_DATA.queen_majesty,
    volume: 0.5,
    duration: 1100,
    canLoop: false
  },
  {
    id: 'king_royal',
    category: 'piece_movement',
    name: 'Royal Decree',
    description: 'Authoritative magical movement sound',
    audioData: MAGICAL_SOUND_DATA.king_royal,
    volume: 0.45,
    duration: 1000,
    canLoop: false
  },
  {
    id: 'pawn_step',
    category: 'piece_movement',
    name: 'Brave Step',
    description: 'Determined footstep with growing magical energy',
    audioData: MAGICAL_SOUND_DATA.pawn_step,
    volume: 0.25,
    duration: 500,
    canLoop: false
  },

  // === WIZARD ABILITIES ===
  {
    id: 'wizard_teleport',
    category: 'wizard_abilities',
    name: 'Wizard Teleportation',
    description: 'Complete teleportation sequence with reality shift',
    audioData: MAGICAL_SOUND_DATA.wizard_teleport,
    volume: 0.6,
    duration: 1500,
    canLoop: false
  },
  {
    id: 'wizard_ranged_attack',
    category: 'wizard_abilities',
    name: 'Ranged Magical Attack',
    description: 'Powerful ranged spell casting and impact',
    audioData: MAGICAL_SOUND_DATA.wizard_ranged_attack,
    volume: 0.55,
    duration: 1200,
    canLoop: false
  },
  {
    id: 'wizard_summon',
    category: 'wizard_abilities',
    name: 'Wizard Summoning',
    description: 'Epic summoning ritual with crescendo',
    audioData: MAGICAL_SOUND_DATA.wizard_summon,
    volume: 0.5,
    duration: 2000,
    canLoop: false
  },
  {
    id: 'teleport_whoosh',
    category: 'wizard_abilities',
    name: 'Teleport Whoosh',
    description: 'Quick dimensional shift sound',
    audioData: MAGICAL_SOUND_DATA.teleport_whoosh,
    volume: 0.4,
    duration: 800,
    canLoop: false
  },
  {
    id: 'magical_zap',
    category: 'wizard_abilities',
    name: 'Magical Zap',
    description: 'Sharp electrical-magical energy burst',
    audioData: MAGICAL_SOUND_DATA.magical_zap,
    volume: 0.45,
    duration: 400,
    canLoop: false
  },
  {
    id: 'arcane_blast',
    category: 'wizard_abilities',
    name: 'Arcane Blast',
    description: 'Powerful arcane energy explosion',
    audioData: MAGICAL_SOUND_DATA.arcane_blast,
    volume: 0.6,
    duration: 1000,
    canLoop: false
  },

  // === CAPTURE & BATTLE SOUNDS ===
  {
    id: 'capture_clash',
    category: 'piece_capture',
    name: 'Battle Clash',
    description: 'Intense magical combat with clashing energies',
    audioData: MAGICAL_SOUND_DATA.capture_clash,
    volume: 0.5,
    duration: 1200,
    canLoop: false
  },
  {
    id: 'capture_vanquish',
    category: 'piece_capture',
    name: 'Piece Vanquished',
    description: 'Dramatic defeat with fading magical essence',
    audioData: MAGICAL_SOUND_DATA.capture_vanquish,
    volume: 0.55,
    duration: 1500,
    canLoop: false
  },
  {
    id: 'capture_magical',
    category: 'piece_capture',
    name: 'Magical Banishment',
    description: 'Piece dissolved in swirling magical vortex',
    audioData: MAGICAL_SOUND_DATA.capture_magical,
    volume: 0.5,
    duration: 1300,
    canLoop: false
  },
  {
    id: 'piece_destruction',
    category: 'piece_capture',
    name: 'Piece Destruction',
    description: 'Powerful destruction with magical aftershock',
    audioData: MAGICAL_SOUND_DATA.piece_destruction,
    volume: 0.6,
    duration: 1400,
    canLoop: false
  },
  {
    id: 'battle_impact',
    category: 'piece_capture',
    name: 'Battle Impact',
    description: 'Heavy magical impact with resonance',
    audioData: MAGICAL_SOUND_DATA.battle_impact,
    volume: 0.55,
    duration: 1000,
    canLoop: false
  },
  {
    id: 'magical_dissolve',
    category: 'piece_capture',
    name: 'Magical Dissolve',
    description: 'Piece gently dissolving into magical particles',
    audioData: MAGICAL_SOUND_DATA.magical_dissolve,
    volume: 0.4,
    duration: 1600,
    canLoop: false
  },

  // === GAME EVENTS ===
  {
    id: 'check_warning',
    category: 'game_events',
    name: 'Check Warning',
    description: 'Urgent magical warning with tension',
    audioData: MAGICAL_SOUND_DATA.check_warning,
    volume: 0.6,
    duration: 800,
    canLoop: false
  },
  {
    id: 'checkmate_victory',
    category: 'game_events',
    name: 'Victory Fanfare',
    description: 'Triumphant magical celebration',
    audioData: MAGICAL_SOUND_DATA.checkmate_victory,
    volume: 0.7,
    duration: 3000,
    canLoop: false
  },
  {
    id: 'checkmate_defeat',
    category: 'game_events',
    name: 'Defeat Lament',
    description: 'Melancholic magical defeat sequence',
    audioData: MAGICAL_SOUND_DATA.checkmate_defeat,
    volume: 0.6,
    duration: 2500,
    canLoop: false
  },
  {
    id: 'castling_fortress',
    category: 'game_events',
    name: 'Fortress Formation',
    description: 'Majestic castle defense formation',
    audioData: MAGICAL_SOUND_DATA.castling_fortress,
    volume: 0.5,
    duration: 1500,
    canLoop: false
  },
  {
    id: 'pawn_promotion',
    category: 'game_events',
    name: 'Pawn Ascension',
    description: 'Magical transformation and empowerment',
    audioData: MAGICAL_SOUND_DATA.pawn_promotion,
    volume: 0.6,
    duration: 2000,
    canLoop: false
  },
  {
    id: 'game_start_fanfare',
    category: 'game_events',
    name: 'Battle Commence',
    description: 'Epic game start with building tension',
    audioData: MAGICAL_SOUND_DATA.game_start_fanfare,
    volume: 0.6,
    duration: 2500,
    canLoop: false
  },
  {
    id: 'level_up',
    category: 'game_events',
    name: 'Level Ascension',
    description: 'Player progression with magical growth',
    audioData: MAGICAL_SOUND_DATA.level_up,
    volume: 0.6,
    duration: 1800,
    canLoop: false
  },
  {
    id: 'achievement_unlock',
    category: 'game_events',
    name: 'Achievement Unlock',
    description: 'Satisfying achievement with magical reward',
    audioData: MAGICAL_SOUND_DATA.achievement_unlock,
    volume: 0.5,
    duration: 1500,
    canLoop: false
  },

  // === UI INTERACTIONS ===
  {
    id: 'button_hover',
    category: 'ui_interactions',
    name: 'Button Hover',
    description: 'Subtle magical hover effect',
    audioData: MAGICAL_SOUND_DATA.button_hover,
    volume: 0.2,
    duration: 200,
    canLoop: false
  },
  {
    id: 'button_click',
    category: 'ui_interactions',
    name: 'Button Click',
    description: 'Crisp magical button activation',
    audioData: MAGICAL_SOUND_DATA.button_click,
    volume: 0.3,
    duration: 300,
    canLoop: false
  },
  {
    id: 'menu_open',
    category: 'ui_interactions',
    name: 'Menu Opening',
    description: 'Magical menu unfurling sound',
    audioData: MAGICAL_SOUND_DATA.menu_open,
    volume: 0.4,
    duration: 600,
    canLoop: false
  },
  {
    id: 'menu_close',
    category: 'ui_interactions',
    name: 'Menu Closing',
    description: 'Magical menu folding sound',
    audioData: MAGICAL_SOUND_DATA.menu_close,
    volume: 0.35,
    duration: 500,
    canLoop: false
  },
  {
    id: 'tab_switch',
    category: 'ui_interactions',
    name: 'Tab Switch',
    description: 'Quick magical page turn',
    audioData: MAGICAL_SOUND_DATA.tab_switch,
    volume: 0.25,
    duration: 400,
    canLoop: false
  },
  {
    id: 'notification_ping',
    category: 'ui_interactions',
    name: 'Notification',
    description: 'Gentle magical attention-getter',
    audioData: MAGICAL_SOUND_DATA.notification_ping,
    volume: 0.4,
    duration: 800,
    canLoop: false
  },
  {
    id: 'success_chime',
    category: 'ui_interactions',
    name: 'Success Chime',
    description: 'Positive magical confirmation',
    audioData: MAGICAL_SOUND_DATA.success_chime,
    volume: 0.45,
    duration: 1000,
    canLoop: false
  },
  {
    id: 'error_chime',
    category: 'ui_interactions',
    name: 'Error Warning',
    description: 'Gentle magical error indication',
    audioData: MAGICAL_SOUND_DATA.error_chime,
    volume: 0.4,
    duration: 800,
    canLoop: false
  },

  // === AMBIENT MAGICAL ATMOSPHERE ===
  {
    id: 'crystal_hum',
    category: 'ambient_magic',
    name: 'Crystal Resonance',
    description: 'Continuous magical crystal harmonics',
    audioData: MAGICAL_SOUND_DATA.crystal_hum,
    volume: 0.15,
    duration: 5000,
    canLoop: true
  },
  {
    id: 'mystical_wind',
    category: 'ambient_magic',
    name: 'Mystical Breeze',
    description: 'Otherworldly wind carrying magical whispers',
    audioData: MAGICAL_SOUND_DATA.mystical_wind,
    volume: 0.2,
    duration: 8000,
    canLoop: true
  },
  {
    id: 'arcane_energy',
    category: 'ambient_magic',
    name: 'Arcane Field',
    description: 'Pulsing ambient arcane energy field',
    audioData: MAGICAL_SOUND_DATA.arcane_energy,
    volume: 0.18,
    duration: 6000,
    canLoop: true
  },
  {
    id: 'magical_sparkles',
    category: 'ambient_magic',
    name: 'Magical Sparkles',
    description: 'Gentle magical particle effects',
    audioData: MAGICAL_SOUND_DATA.magical_sparkles,
    volume: 0.12,
    duration: 4000,
    canLoop: true
  },
  {
    id: 'enchanted_whispers',
    category: 'ambient_magic',
    name: 'Enchanted Whispers',
    description: 'Distant magical voices and incantations',
    audioData: MAGICAL_SOUND_DATA.enchanted_whispers,
    volume: 0.1,
    duration: 10000,
    canLoop: true
  },
  {
    id: 'power_surge',
    category: 'ambient_magic',
    name: 'Power Surge',
    description: 'Intermittent magical energy surges',
    audioData: MAGICAL_SOUND_DATA.power_surge,
    volume: 0.25,
    duration: 3000,
    canLoop: true
  }
];

export class MagicalSoundLibrary {
  private static instance: MagicalSoundLibrary;
  private loadedSounds: Map<MagicalSoundEffect, HTMLAudioElement> = new Map();
  private isInitialized = false;

  static getInstance(): MagicalSoundLibrary {
    if (!MagicalSoundLibrary.instance) {
      MagicalSoundLibrary.instance = new MagicalSoundLibrary();
    }
    return MagicalSoundLibrary.instance;
  }

  /**
   * Initialize the magical sound library
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🎭 Initializing Magical Sound Library...');
    
    try {
      // Load all magical sounds
      for (const soundDef of MAGICAL_SOUND_LIBRARY) {
        const audio = new Audio(soundDef.audioData);
        audio.volume = soundDef.volume;
        audio.loop = soundDef.canLoop;
        
        this.loadedSounds.set(soundDef.id, audio);
      }
      
      this.isInitialized = true;
      console.log(`✨ Magical Sound Library initialized with ${MAGICAL_SOUND_LIBRARY.length} sounds`);
    } catch (error) {
      console.error('❌ Failed to initialize Magical Sound Library:', error);
    }
  }

  /**
   * Play a specific magical sound effect
   */
  async playSound(soundId: MagicalSoundEffect, options?: {
    volume?: number;
    playbackRate?: number;
    delay?: number;
  }): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const audio = this.loadedSounds.get(soundId);
    if (!audio) {
      console.warn(`🎭 Magical sound not found: ${soundId}`);
      return;
    }

    try {
      // Apply options if provided
      if (options?.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }
      if (options?.playbackRate !== undefined) {
        audio.playbackRate = Math.max(0.25, Math.min(4, options.playbackRate));
      }

      // Add delay if specified
      if (options?.delay) {
        setTimeout(() => {
          audio.currentTime = 0; // Reset audio
          audio.play().catch(e => console.log(`🎭 Magical sound play failed: ${soundId}`, e));
        }, options.delay);
      } else {
        audio.currentTime = 0; // Reset audio
        await audio.play();
      }

      console.log(`🎭 Playing magical sound: ${soundId}`);
    } catch (error) {
      console.log(`🎭 Magical sound play failed: ${soundId}`, error);
    }
  }

  /**
   * Play sounds for piece movement based on piece type
   */
  async playPieceMovementSound(pieceType: string, isCapture: boolean = false): Promise<void> {
    if (isCapture) {
      // Play capture sound first
      await this.playSound('capture_magical');
      // Small delay before movement sound
      setTimeout(() => {
        this.playPieceSpecificMovementSound(pieceType);
      }, 200);
    } else {
      await this.playPieceSpecificMovementSound(pieceType);
    }
  }

  private async playPieceSpecificMovementSound(pieceType: string): Promise<void> {
    const soundMap: Record<string, MagicalSoundEffect> = {
      'pawn': 'pawn_step',
      'rook': 'rook_slide', 
      'knight': 'knight_gallop',
      'bishop': 'bishop_glide',
      'queen': 'queen_majesty',
      'king': 'king_royal',
      'wizard': 'wizard_teleport'
    };

    const soundId = soundMap[pieceType.toLowerCase()] || 'piece_move_gentle';
    await this.playSound(soundId);
  }

  /**
   * Play wizard ability sound
   */
  async playWizardAbility(abilityType: 'teleport' | 'ranged_attack' | 'summon'): Promise<void> {
    const soundMap = {
      'teleport': 'wizard_teleport' as MagicalSoundEffect,
      'ranged_attack': 'wizard_ranged_attack' as MagicalSoundEffect,
      'summon': 'wizard_summon' as MagicalSoundEffect
    };

    await this.playSound(soundMap[abilityType]);
  }

  /**
   * Play game event sound
   */
  async playGameEvent(eventType: 'check' | 'checkmate_win' | 'checkmate_lose' | 'castling' | 'promotion' | 'game_start'): Promise<void> {
    const soundMap = {
      'check': 'check_warning' as MagicalSoundEffect,
      'checkmate_win': 'checkmate_victory' as MagicalSoundEffect,
      'checkmate_lose': 'checkmate_defeat' as MagicalSoundEffect,
      'castling': 'castling_fortress' as MagicalSoundEffect,
      'promotion': 'pawn_promotion' as MagicalSoundEffect,
      'game_start': 'game_start_fanfare' as MagicalSoundEffect
    };

    await this.playSound(soundMap[eventType]);
  }

  /**
   * Play UI interaction sound
   */
  async playUISound(uiType: 'hover' | 'click' | 'menu_open' | 'menu_close' | 'success' | 'error' | 'notification'): Promise<void> {
    const soundMap = {
      'hover': 'button_hover' as MagicalSoundEffect,
      'click': 'button_click' as MagicalSoundEffect,
      'menu_open': 'menu_open' as MagicalSoundEffect,
      'menu_close': 'menu_close' as MagicalSoundEffect,
      'success': 'success_chime' as MagicalSoundEffect,
      'error': 'error_chime' as MagicalSoundEffect,
      'notification': 'notification_ping' as MagicalSoundEffect
    };

    await this.playSound(soundMap[uiType]);
  }

  /**
   * Play ambient magical atmosphere
   */
  async playAmbientMagic(intensityLevel: 'low' | 'medium' | 'high'): Promise<void> {
    const soundsByIntensity = {
      'low': ['crystal_hum', 'magical_sparkles'] as MagicalSoundEffect[],
      'medium': ['mystical_wind', 'arcane_energy'] as MagicalSoundEffect[],
      'high': ['enchanted_whispers', 'power_surge'] as MagicalSoundEffect[]
    };

    const sounds = soundsByIntensity[intensityLevel];
    const selectedSound = sounds[Math.floor(Math.random() * sounds.length)];
    
    await this.playSound(selectedSound);
  }

  /**
   * Stop all ambient sounds
   */
  stopAmbientSounds(): void {
    const ambientSounds: MagicalSoundEffect[] = [
      'crystal_hum', 'mystical_wind', 'arcane_energy', 
      'magical_sparkles', 'enchanted_whispers', 'power_surge'
    ];

    ambientSounds.forEach(soundId => {
      const audio = this.loadedSounds.get(soundId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  /**
   * Get sound information by category
   */
  getSoundsByCategory(category: MagicalSoundCategory): MagicalSound[] {
    return MAGICAL_SOUND_LIBRARY.filter(sound => sound.category === category);
  }

  /**
   * Get all available sound categories
   */
  getCategories(): MagicalSoundCategory[] {
    return ['piece_movement', 'piece_capture', 'wizard_abilities', 'game_events', 'ui_interactions', 'ambient_magic'];
  }
}

// Export singleton instance
export const magicalSoundLibrary = MagicalSoundLibrary.getInstance();