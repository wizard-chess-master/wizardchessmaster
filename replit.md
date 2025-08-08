# Overview

**Wizard Chess Duel** is a full-stack TypeScript application featuring a 10x10 chess variant with magical wizards. It offers local multiplayer and AI opponent modes, all within a comprehensive medieval fantasy theme. The project aims to provide an engaging and visually immersive chess experience with advanced AI capabilities and a robust monetization framework.

Key features include:
- A unique 10x10 board with custom wizard pieces.
- AI opponents with adjustable difficulty, including an advanced minimax AI and a neural network learning system.
- Optimized AI training system limited to 500 games with batch processing and efficient alpha-beta pruning.
- Enhanced campaign mode with story unlocks, board variants, and premium progression system.
- Comprehensive monetization with $2.99 one-time IAP and $4.99/month subscription plans.
- Complete ad integration featuring post-game interstitials, in-play banners, and rewarded videos for hints/undos.
- Comprehensive leaderboards for campaign and PvP modes.
- A fully immersive medieval fantasy visual overhaul, including custom assets, UI, and animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Component-based UI for type safety.
- **Zustand State Management**: Lightweight state management for game state and audio.
- **Tailwind CSS + Radix UI + Medieval Theme**: Modern styling with accessible components and a comprehensive medieval fantasy CSS design.
- **Vite Build Tool**: Fast development and optimized production builds.
- **Canvas-Based Chess Rendering**: Custom sprite rendering with smooth animations and glowing effects.
- **Responsive Medieval Design**: Mobile-first approach with fantasy-themed layouts and wooden UI elements.

### Backend Architecture
- **Express.js Server**: RESTful API with TypeScript.
- **Modular Route System**: Organized route handlers with consistent error handling.
- **In-Memory Storage**: Simple storage interface, designed for future database integration.

### Data Storage Solutions
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL.
- **Neon Database**: Serverless PostgreSQL hosting.
- **Schema Management**: Shared schema definitions with Zod validation.
- **Migration System**: Database migrations managed via Drizzle Kit.

### Game Logic Architecture
- **Chess Engine**: Complete 10x10 chess implementation with piece movement validation, including custom wizard abilities.
- **Advanced AI System**: Integrates Minimax with alpha-beta pruning, neural network learning, and strategy pattern recognition.
- **AI Difficulty Levels**: Easy, medium, hard, plus an advanced minimax AI and adaptive difficulty based on player performance.
- **Comprehensive AI Training System**: Allows for 1-10000 game training sessions with real-time statistics and progress tracking.
- **Adaptive AI Difficulty Progression**: Real-time tracking and visualization of AI difficulty adjustments.
- **Audio System**: HTML5 Audio for sound effects with user-configurable mute controls managed via a centralized audio store.

### UI/UX Decisions
- **Medieval Fantasy Visual Overhaul**: Features castle backgrounds, wooden UI panels, stone textures, gold accents, and atmospheric styling.
- **Enhanced Canvas Rendering**: Glowing highlights for selected squares and valid moves, with shadow effects.
- **Smooth Animations**: 0.5s piece movement animations and glowing canvas effects.
- **Medieval Typography**: Integrated Cinzel font for authentic text styling.
- **Layout Optimization**: Streamlined component design, reduced blank space, single-column layouts, and consistent width constraints for improved responsiveness.
- **Comprehensive Leaderboard System**: Tracks campaign progress and PvP ratings with visual rankings, advanced statistics, and real-time updates.

### Enhanced Audio Architecture (User MP3 Implementation Ready)
- **Basic Audio Infrastructure**: Minimal audio system with mute controls and initialization hooks
- **User MP3 System Ready**: All music and sound effects removed - clean foundation for user's custom MP3 file implementation
- **Audio Store**: Simplified to basic mute functionality only, ready for user's MP3 integration
- **System Status**: Audio infrastructure cleaned and prepared for independent MP3 implementation

### Technical Implementations
- **Castling System**: Implemented with king moving 3 squares and proper validation.
- **Optimized AI Training System**: Limited to 500 games maximum with batch processing, efficient minimax with alpha-beta pruning, and neural network learning optimized for performance.
- **Enhanced Campaign Mode**: 12 progressive levels with story content, board variants (classic, forest, castle, mountain, desert, volcanic, ice, cosmic), premium level locks, and comprehensive rewards system.
- **Comprehensive Monetization System**: Stripe integration with $2.99 one-time IAP and $4.99/month subscription, featuring plan selector UI and premium feature management.
- **Complete Ad Integration**: Post-game interstitial ads, in-play banner rotation, rewarded video ads for hints/undos, and premium user ad-free experience.
- **Admin Security System**: Environment-based control and session authentication for admin features (Mass AI Training, Debug tools, Reset AI Training, View AI Learning Stats).
- **Complete Audio System Removal**: All music and sound effects completely removed per user request - user will implement custom MP3-based audio system independently.
- **Enhanced Animation System**: Particle effects for captures, magical sparkles for wizard moves, smooth canvas animations, click effects, and visual feedback for special moves including teleport swirls and spell glows.
- **Immersive 3D Audio System**: Web Audio API-powered spatial audio with HRTF panning, piece-specific movement sounds, wizard teleport/attack effects, dynamic music intensity, medieval background music, convolution reverb for magical ambiance, and low-latency responsive audio optimized for Replit hosting.
- **Enhanced Audio Architecture**: Sound effects and voice system prepared for immersive content including voice management (narrator, coach, assistant), enhanced SFX manager with MP3 support, and audio coordinator for orchestrated sound experiences. Music system completely removed per user request.
- **Comprehensive System Initialization**: Coordinated initialization of all enhanced features with parallel loading, event management, and system status monitoring.

## External Dependencies

### Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Database queries and schema management.
- **PostgreSQL**: Primary database dialect.

### UI & Styling
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Inter Font**: Typography via Fontsource.

### 3D Graphics
- **Three.js**: 3D rendering engine.
- **React Three Fiber**: React renderer for Three.js.
- **React Three Drei**: Helpers for R3F.
- **GLSL Shaders**: Custom shader support via vite-plugin-glsl.

### Development Tools
- **Vite**: Build tool and dev server.
- **ESBuild**: Fast bundling for production.
- **TypeScript**: Type checking and compilation.

### State & Data Management
- **Zustand**: State management library.
- **TanStack Query**: Server state management and caching.
- **Zod**: Runtime type validation.

### Monetization
- **Google AdSense**: Integration for banner, interstitial, and rewarded video ads.
- **Stripe**: Payment integration for ad-free upgrades.