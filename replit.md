# Overview

**Wizard Chess Duel** is a full-stack TypeScript application featuring a 10x10 chess variant with magical wizards. It offers AI opponent modes within a comprehensive medieval fantasy theme. Online multiplayer has been temporarily disabled due to functionality issues and will be re-enabled later. The project aims to provide an engaging and visually immersive chess experience with advanced AI capabilities and a robust monetization framework.

Key features include:
- A unique 10x10 board with custom wizard pieces.
- AI opponents with adjustable difficulty, including an advanced minimax AI and a neural network learning system.
- Optimized AI training system limited to 500 games with batch processing and efficient alpha-beta pruning.
- Enhanced campaign mode with story unlocks, board variants, and premium progression system.
- Streamlined single-tier monetization with $5/month subscription, A/B price testing, and advanced freemium conversion optimization.
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

### Comprehensive HTML5 Audio System 
- **Wizard Chess Audio Manager**: Complete HTML5 Audio API implementation with MP3 file support
- **Sound Effects Integration**: Move sounds, captures, wizard abilities, game events triggered on gameplay
- **Voice Narration System**: Game intro, victory celebration, hints, and story elements
- **Background Music**: Theme music with looping functionality and dynamic volume control
- **Volume Controls**: Master volume slider, mute toggle, and test sound functionality
- **Button Click Integration**: All UI buttons play click sounds for enhanced user experience
- **Replit-Optimized**: Stable performance with graceful error handling and preloading system

### Technical Implementations
- **Castling System**: Implemented with king moving 3 squares and proper validation.
- **Optimized AI Training System**: Limited to 500 games maximum with batch processing, efficient minimax with alpha-beta pruning, and neural network learning optimized for performance.
- **Enhanced Campaign Mode**: 12 progressive levels with story content, board variants (classic, forest, castle, mountain, desert, volcanic, ice, cosmic), premium level locks, and comprehensive rewards system.
- **Streamlined Monetization System**: Single $5/month subscription with A/B price testing ($4.99-$6.99), advanced freemium limitations (1 hint/game, undos premium-only), strategic upgrade prompts, limited-time offers ($3.99 first month), and comprehensive Stripe integration.
- **Complete Ad Integration**: Post-game interstitial ads, in-play banner rotation, rewarded video ads for hints/undos, and premium user ad-free experience.
- **Admin Security System**: Environment-based control and session authentication for admin features (Mass AI Training, Reset AI Training, View AI Learning Stats). Debug buttons removed for cleaner interface.
- **Complete Audio System Removal**: All music and sound effects completely removed per user request - user will implement custom MP3-based audio system independently.
- **Enhanced Animation System**: Particle effects for captures, magical sparkles for wizard moves, smooth canvas animations, click effects, and visual feedback for special moves including teleport swirls and spell glows.
- **Immersive 3D Audio System**: Web Audio API-powered spatial audio with HRTF panning, piece-specific movement sounds, wizard teleport/attack effects, dynamic music intensity, medieval background music, convolution reverb for magical ambiance, and low-latency responsive audio optimized for Replit hosting.
- **Enhanced Audio Architecture**: Sound effects and voice system prepared for immersive content including voice management (narrator, coach, assistant), enhanced SFX manager with MP3 support, and audio coordinator for orchestrated sound experiences. Music system completely removed per user request.
- **Improved Settings Dialog**: Enhanced text visibility and contrast throughout settings interface with white background, dark text, proper borders, and organized sections for volume controls, audio information, and keyboard shortcuts.
- **Comprehensive System Initialization**: Coordinated initialization of all enhanced features with parallel loading, event management, and system status monitoring.
- **Custom Hint Modal System**: Replaced technical browser alerts with immersive medieval-themed modal featuring amber gradients, wizard styling, and fantasy language. Eliminates technical domain references for complete immersion.
- **Floating Mentor Notifications**: Enhanced AI mentor system with floating notifications featuring real-time feedback display, text-to-speech voice synthesis, auto-hide functionality, and prominent visual positioning to eliminate need for scrolling to see feedback.

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

### Advanced Monetization Architecture
- **Streamlined Subscription Model**: Single $5/month tier with comprehensive premium features
- **A/B Price Testing**: Dynamic pricing variants ($4.99-$6.99) with localStorage persistence
- **Advanced Freemium Limitations**: Reduced free hints (1/game), undos premium-only, strategic upgrade prompts
- **Conversion Optimization**: Strategic promo modals, limited-time offers, countdown timers
- **Google AdSense**: Banner ads, interstitial post-game, rewarded videos for hints
- **Stripe Integration**: Secure payment processing with plan selector UI
- **Admin Testing Tools**: Free/premium toggle, pricing cycling, promo testing for optimization