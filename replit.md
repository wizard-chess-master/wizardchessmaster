# Overview

**Wizard Chess Master** is a full-stack TypeScript application featuring a unique 10x10 chess variant with magical wizards, advanced AI opponents, and a rich medieval fantasy theme. The project aims to provide an engaging and visually immersive chess experience with robust monetization and cloud save functionality for premium members, offering seamless cross-device progression. Key capabilities include a unique 10x10 board with custom wizard pieces, AI opponents with adjustable difficulty (including advanced minimax AI and neural network learning), an enhanced campaign mode with story unlocks and board variants, and streamlined single-tier monetization with a subscription model. It also features comprehensive leaderboards for campaign and PvP modes, a fully immersive medieval fantasy visual overhaul, a complete user authentication system, and cloud save functionality for premium members with local backup for all registered users.

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

## Recent Features Added (August 2025)
- **Fixed Wizard Moves in Online Mode** (August 11, 2025): CRITICAL FIX - Wizard pieces now function properly in multiplayer online games. Fixed missing synchronization between chess store and multiplayer store where wizard moves (teleport and attack) were being processed locally but not sent to the server. All multiplayer moves now properly sync via Socket.IO to both players.
- **AI Chat in Multiplayer Games** (August 11, 2025): Integrated AI commentary system for online multiplayer games. Features three distinct AI personalities (Coach Magnus, Viktor the Bold, Merlin the Wise) that provide contextual commentary during matches. The AI comments on moves, offers encouragement, and adds engaging dialogue to make online games feel more lively even when opponents aren't chatting. Uses OpenAI GPT-4o when API key is available, falls back to personality templates otherwise.
- **Enhanced AI Dialog System** (August 12, 2025): Major improvements to AI chat frequency, relevance, and randomness. Reduced idle commentary from 60s to 120s intervals, decreased random move commentary from 30% to 15% chance, and added logic to skip 70% of neutral moves to reduce spam. Updated all personality idle chatter to be 10x10 wizard chess specific, mentioning teleportation, wizard attacks, and expanded board tactics. Enhanced OpenAI prompts for shorter, more relevant comments with improved move quality analysis.
- **Adaptive AI Difficulty** (August 11, 2025): Implemented skill-based matchmaking for AI opponents. System tracks player win rate across games and automatically adjusts AI difficulty - Easy for win rate < 40%, Medium for 40-70%, Hard for > 70%. Added "Adaptive AI" button in main menu showing current matching status. Play Now button now starts games with adaptive difficulty based on player performance.
- **Fixed Play Now Button** (August 11, 2025): Resolved routing issue where Play Now button would show menu instead of starting game directly. Now properly starts AI game with adaptive difficulty immediately. Multiplayer quick match also correctly falls back to AI game when no opponents are available.

# Recent Issues Resolved (August 2025)
- **Reward Popup Sizing Issues** (August 12, 2025): Fixed misaligned reward popups and victory dialogs with messages being cut off. Increased dialog max-widths (GameOverDialog: 600px→768px, CampaignRewardCelebration: md→2xl, Achievement notifications: md→lg), added responsive mobile breakpoints, and implemented minimum height constraints for better content display.
- **Wizard Check Validation Bug** (August 12, 2025): Fixed critical bug where kings couldn't escape from wizard checks. The move validation logic was incorrectly simulating wizard attacks - it was moving the wizard to the target square instead of keeping it in place. Corrected the test board simulation to properly handle wizard attacks (wizard stays in place, only target is removed). Fix confirmed working by user.
- **Multiplayer Online Play Buttons** (August 11, 2025): Fixed critical multiplayer connection issues preventing online play buttons from functioning. Resolved database storage errors (missing getUserById/updateUser methods), enabled guest user connections without login requirement, and updated button logic to check connection status. All online play features now work for both authenticated and guest users.
- **Premium Status UI Display**: Fixed React rendering issues where premium benefits weren't showing despite correct backend detection. Added fallback UI states and improved component refresh logic.
- **Missing AI Easy Mode**: Restored accidentally removed "Play AI Easy" button to game mode selection.
- **Authentication System**: Enhanced login flow with proper premium status synchronization and UI updates.
- **Production Stability**: Completed comprehensive testing of all APIs, build system, and core functionality. System verified as deployment-ready with all tests passing.

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
- **Enhanced Main Menu Integration**: Authentication status display, login/register dialogs, cloud save access, and user profile management integrated with premium status indicators.
- **Mobile-Friendly Responsive Design**: Comprehensive device detection with optimized experiences for mobile, tablet, and desktop, including mobile-specific board sizing, touch-optimized controls, and performance optimizations.
- **Enhanced Premium Comparison Modal**: Completely revamped free vs premium page with tabbed interface, social proof testimonials, limited-time discount offers, animated visual elements, and conversion-optimized pricing presentation.

## Technical Implementations
- **Castling System**: Implemented with king moving 3 squares and proper validation.
- **Enhanced Campaign Mode**: 12 progressive levels with story content, board variants, premium level locks, and a comprehensive rewards system.
- **Streamlined Monetization System**: Single $5/month subscription with A/B price testing, advanced freemium limitations, and strategic upgrade prompts.
- **Admin Security System**: Environment-based control and session authentication for admin features.
- **Enhanced Animation System**: Particle effects for captures, magical sparkles for wizard moves, smooth canvas animations, click effects, and visual feedback for special moves.
- **Production Deployment Configuration**: Comprehensive deployment fixes including proper host binding, environment variable configuration, and Replit.toml setup for Autoscale.
- **Comprehensive System Initialization**: Coordinated initialization of all enhanced features with parallel loading and event management.
- **Advanced Hint Modal System**: Replaced technical alerts with immersive medieval-themed modals featuring 60 total hint variations and anti-repetition logic.
- **Personalized Hint Learning Algorithm**: Machine learning system that tracks user interactions with hints, analyzes patterns, and adapts hint selection based on learned preferences.
- **Floating Mentor Notifications**: Enhanced AI mentor system with floating notifications featuring real-time feedback, text-to-speech, and auto-hide functionality.
- **Comprehensive User Authentication System**: Complete authentication implementation with bcrypt password hashing, session management, user registration/login/logout flows, and secure session-based authentication, including user profile management and premium status tracking.
- **Cloud Save & Backup System**: Premium members get cloud save functionality for cross-device progress synchronization; all registered users can create local backups. Features automatic save detection and manual sync controls.
- **Upgraded Leaderboard System**: Migration from manual name entry to authenticated player data with PostgreSQL database integration, comprehensive API routes, player statistics tracking, and server synchronization for registered users.
- **Comprehensive SEO & Marketing Website**: Full-featured landing page with compelling CTAs, chess strategy content pages, AI training guides, tournament information, and blog articles targeting profitable keywords.
- **Strategic AdSense Integration**: Full AdSense integration with verified publisher ID `ca-pub-4938312134119004`, complete ad placements throughout for revenue optimization.
- **Marketing Content Infrastructure**: SEO-optimized pages with meta tags, structured data markup, sitemap.xml, robots.txt, and compelling join-free forms for high conversion rates.
- **Global Navigation System**: Seamless navigation between marketing pages and game interface with responsive design.
- **Comprehensive Tournament System**: Multi-tiered tournament structure featuring free tournaments (badge rewards, premium time prizes) and premium-exclusive tournaments (special titles, avatars, exclusive badges).
- **Contextual Hint Overlay System**: Intelligent new player guidance system with game state awareness, featuring automatic hint triggers, dismissible overlays, experience tracking, and personalized learning preferences.
- **Campaign Storyboard System**: Immersive visual story experience featuring StoryboardModal with scene progression, CampaignMapView with interactive level progression, CharacterDialogue system with personality-based conversations, and enhanced campaign mode with story triggers and character interactions.
- **Founder Member Program**: System for the first 1000 users with lifetime premium access, including database schema updates, automatic granting during registration, a FounderPromotion component, FounderWelcome modal, API routes for status and analytics, enhanced authentication, a dedicated landing page, countdown, social proof, and analytics dashboard.

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
- **Google AdSense**: Advertising platform for monetization.