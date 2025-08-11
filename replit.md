# Overview

**Wizard Chess Master** is a full-stack TypeScript application featuring a unique 10x10 chess variant with magical wizards, advanced AI opponents, and a rich medieval fantasy theme. The project aims to provide an engaging and visually immersive chess experience with robust monetization and cloud save functionality for premium members, offering seamless cross-device progression.

## Recent Changes (August 10, 2025)
- **Complete Audio Conflict Resolution**: Fixed persistent unwanted music during campaign interactions
  - Completely removed conflicting Theme-music1.mp3 files from all directories
  - Updated all code references to use correct Theme-music2.mp3 file
  - Eliminated multiple competing audio initialization systems (App.tsx, ChessAudioController, main.tsx)
  - Campaign level selection now bypasses all audio triggers using direct state management
  - Disabled automatic audio initialization to prevent unwanted music on campaign clicks
- **Campaign Storyboard System**: Complete visual story experience implementation
  - StoryboardModal with scene progression, character introductions, and background images
  - CampaignMapView with interactive level nodes, connected paths, and star ratings
  - CharacterDialogue system with personality-based conversations and dialogue choices
  - Enhanced CampaignMode integration with story triggers and character interactions
  - Responsive dialog positioning that adapts to screen boundaries
- **Contextual Hint Overlay for New Players**: Complete implementation of intelligent hint system
  - Smart triggers based on game state (first move, piece selection, check warnings, wizard moves, endgame)
  - Dismissible overlay system with priority levels and anti-repetition logic
  - Experience level tracking (auto-graduates to experienced after 5 games)
  - Settings integration for hint preferences and reset functionality
  - Quick hint button component for instant tips
  - LocalStorage persistence for dismissed hints and user preferences
- **Password Recovery System**: Complete password recovery implementation with secure token-based reset functionality
- **System Stability**: All major API routing issues resolved, comprehensive testing completed
- **Development Premium Access**: Added debug endpoint to grant premium access for testing multiplayer features
- **Button Functionality Resolved**: Fixed Join Free button and navigation buttons that were not responding to clicks
- **Console Error Management**: Enhanced error handling for AdSense sizing issues and audio DOMExceptions

Key capabilities include:
- A unique 10x10 board with custom wizard pieces.
- AI opponents with adjustable difficulty, including advanced minimax AI and neural network learning.
- Enhanced campaign mode with story unlocks and board variants.
- Streamlined single-tier monetization with a subscription model, A/B price testing, and freemium conversion optimization.
- Comprehensive leaderboards for campaign and PvP modes.
- A fully immersive medieval fantasy visual overhaul, including custom assets, UI, and animations.
- Complete user authentication system with secure registration, login, and session management.
- Cloud save functionality for premium members enabling cross-device progress synchronization, with local backup for all registered users.

# User Preferences

Preferred communication style: Simple, everyday language.
Preferred workflow: Focus on substantial features over trivial UI issues. Avoid excessive time on minor problems that don't significantly impact core functionality.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based UI for type safety.
- **Zustand State Management**: Lightweight state management for game state.
- **Tailwind CSS + Radix UI + Medieval Theme**: Modern styling with accessible components and a comprehensive medieval fantasy CSS design.
- **Vite Build Tool**: Fast development and optimized production builds.
- **Canvas-Based Chess Rendering**: Custom sprite rendering with smooth animations and glowing effects.
- **Responsive Medieval Design**: Mobile-first approach with fantasy-themed layouts and wooden UI elements.

## Backend Architecture
- **Express.js Server**: RESTful API with TypeScript.
- **Modular Route System**: Organized route handlers with consistent error handling.
- **In-Memory Storage**: Simple storage interface, designed for future database integration.

## Data Storage Solutions
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL.
- **Neon Database**: Serverless PostgreSQL hosting.
- **Schema Management**: Shared schema definitions with Zod validation.
- **Migration System**: Database migrations managed via Drizzle Kit.

## Game Logic Architecture
- **Chess Engine**: Complete 10x10 chess implementation with piece movement validation, including custom wizard abilities.
- **Advanced AI System**: Integrates Minimax with alpha-beta pruning, neural network learning, and strategy pattern recognition.
- **AI Difficulty Levels**: Easy, medium, hard, plus an advanced minimax AI and adaptive difficulty based on player performance.
- **Comprehensive AI Training System**: Allows for up to 500 game training sessions with batch processing and efficient alpha-beta pruning.
- **Adaptive AI Difficulty Progression**: Real-time tracking and visualization of AI difficulty adjustments.

## UI/UX Decisions
- **Medieval Fantasy Visual Overhaul**: Features castle backgrounds, wooden UI panels, stone textures, gold accents, and atmospheric styling.
- **Enhanced Canvas Rendering**: Glowing highlights for selected squares and valid moves, with shadow effects.
- **Smooth Animations**: 0.5s piece movement animations and glowing canvas effects.
- **Medieval Typography**: Integrated Cinzel font for authentic text styling.
- **Layout Optimization**: Streamlined component design, reduced blank space, single-column layouts, and consistent width constraints for improved responsiveness.
- **Comprehensive Leaderboard System**: Tracks campaign progress and PvP ratings with visual rankings, advanced statistics, and real-time updates.
- **Achievement Celebration Microinteractions**: Multi-layered celebration system with screen shake, particle bursts, confetti, fireworks, and haptic feedback.
- **Improved Settings Dialog**: Enhanced text visibility and contrast with clear organization.

## Technical Implementations
- **Castling System**: Implemented with king moving 3 squares and proper validation.
- **Enhanced Campaign Mode**: 12 progressive levels with story content, board variants, premium level locks, and a comprehensive rewards system.
- **Streamlined Monetization System**: Single $5/month subscription with A/B price testing, advanced freemium limitations, and strategic upgrade prompts.
- **Admin Security System**: Environment-based control and session authentication for admin features (Mass AI Training, Reset AI Training, View AI Learning Stats).
- **Enhanced Animation System**: Particle effects for captures, magical sparkles for wizard moves, smooth canvas animations, click effects, and visual feedback for special moves.
- **Production Deployment Configuration**: Comprehensive deployment fixes including proper host binding, environment variable configuration, and Replit.toml setup for Autoscale.
- **Comprehensive System Initialization**: Coordinated initialization of all enhanced features with parallel loading and event management.
- **Advanced Hint Modal System**: Replaced technical alerts with immersive medieval-themed modals featuring 60 total hint variations and anti-repetition logic.
- **Personalized Hint Learning Algorithm**: Machine learning system that tracks user interactions with hints, analyzes patterns, and adapts hint selection based on learned preferences.
- **Floating Mentor Notifications**: Enhanced AI mentor system with floating notifications featuring real-time feedback, text-to-speech, and auto-hide functionality.
- **Comprehensive User Authentication System**: Complete authentication implementation with bcrypt password hashing, session management, user registration/login/logout flows, and secure session-based authentication. Features user profile management and premium status tracking.
- **Cloud Save & Backup System**: Premium members get cloud save functionality for cross-device progress synchronization; all registered users can create local backups. Features automatic save detection and manual sync controls.
- **Enhanced Main Menu Integration**: Authentication status display, login/register dialogs, cloud save access, and user profile management integrated into the main menu with premium status indicators.
- **Upgraded Leaderboard System**: Migration from manual name entry to authenticated player data with PostgreSQL database integration, comprehensive API routes, player statistics tracking, and server synchronization for registered users.
- **Mobile-Friendly Responsive Design**: Comprehensive device detection with optimized experiences for mobile, tablet, and desktop, including mobile-specific board sizing, touch-optimized controls, and performance optimizations.
- **Comprehensive SEO & Marketing Website**: Full-featured landing page with compelling CTAs, chess strategy content pages, AI training guides, tournament information, and blog articles targeting profitable keywords like "chess strategy," "AI training," and "online chess."
- **Strategic AdSense Integration**: Full AdSense integration with verified publisher ID `ca-pub-4938312134119004`, complete ad placements throughout (header, content, sidebar, footer, mobile) with revenue optimization and proper ad sizing for maximum monetization potential.
- **Marketing Content Infrastructure**: SEO-optimized pages with meta tags, structured data markup, sitemap.xml, robots.txt, and compelling join-free forms designed for high conversion rates and organic traffic attraction.
- **Global Navigation System**: Seamless navigation between marketing pages and game interface with responsive design, ensuring users can easily access strategy guides, training content, and premium features.
- **Comprehensive Tournament System**: Multi-tiered tournament structure featuring free tournaments (badge rewards, premium time prizes) and premium-exclusive tournaments (special titles, avatars, exclusive badges) designed to maintain competitive integrity without cash incentives that could encourage cheating.
- **Enhanced Premium Comparison Modal**: Completely revamped free vs premium page with tabbed interface, social proof testimonials, limited-time discount offers, animated visual elements, and conversion-optimized pricing presentation designed to maximize subscription conversions.
- **Contextual Hint Overlay System**: Intelligent new player guidance system with game state awareness, featuring automatic hint triggers, dismissible overlays, experience tracking, and personalized learning preferences integrated throughout the game interface.
- **Campaign Storyboard System**: Immersive visual story experience featuring StoryboardModal with scene progression, CampaignMapView with interactive level progression, CharacterDialogue system with personality-based conversations, and enhanced campaign mode with story triggers and character interactions.

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Database queries and schema management.
- **PostgreSQL**: Primary database dialect.

## UI & Styling
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Inter Font**: Typography via Fontsource.

## 3D Graphics
- **Three.js**: 3D rendering engine.
- **React Three Fiber**: React renderer for Three.js.
- **React Three Drei**: Helpers for R3F.
- **GLSL Shaders**: Custom shader support via vite-plugin-glsl.

## Development Tools
- **Vite**: Build tool and dev server.
- **ESBuild**: Fast bundling for production.
- **TypeScript**: Type checking and compilation.

## State & Data Management
- **Zustand**: State management library.
- **TanStack Query**: Server state management and caching.
- **Zod**: Runtime type validation.

## Monetization Integration
- **Stripe**: Secure payment processing for subscriptions.