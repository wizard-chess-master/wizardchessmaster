# Overview

**Wizard Chess Master** is a full-stack TypeScript application implementing a unique 10x10 chess variant with magical wizards, advanced AI opponents, and a rich medieval fantasy theme. Its purpose is to deliver an engaging, visually immersive chess experience with robust monetization and cloud save functionality for premium members, ensuring seamless cross-device progression. Key capabilities include custom wizard pieces, AI opponents with adjustable difficulty (including advanced minimax and neural network AI), an enhanced campaign mode, comprehensive leaderboards, a fully immersive medieval fantasy visual overhaul, user authentication, and cloud save. The business vision is to provide a captivating variant chess game with strong market potential through its unique features and streamlined subscription model.

## Recent Changes (January 2025)
- Fixed AI game functionality in multiplayer arena - players can now start AI games when no multiplayer games are available
- Added "Multiplayer Arena" button to main menu for accessing multiplayer features
- Resolved game state conflicts between multiplayer and AI modes
- **Task 1 Completed**: Enhanced logging with Winston logger, React error boundaries, and centralized error handling
- **Task 2 In Progress**: Debugging existing issues with memory leak detection, audio compatibility layer, and enhanced WebSocket management with ping-pong heartbeat

# User Preferences

Preferred communication style: Simple, everyday language.
Preferred workflow: Focus on substantial features over trivial UI issues. Avoid excessive time on minor problems that don't significantly impact core functionality.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based UI for type safety.
- **Zustand State Management**: Lightweight state management.
- **Tailwind CSS + Radix UI**: Modern styling with accessible components and a medieval theme.
- **Vite Build Tool**: Fast development and optimized production builds.
- **Canvas-Based Chess Rendering**: Custom sprite rendering with smooth animations and glowing effects.
- **Responsive Medieval Design**: Mobile-first approach with fantasy-themed layouts.

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
- **Chess Engine**: Complete 10x10 chess implementation with custom wizard abilities and piece movement validation.
- **Advanced AI System**: Integrates Minimax with alpha-beta pruning, neural network learning, and strategy pattern recognition.
- **AI Difficulty Levels**: Easy, medium, hard, advanced minimax, and adaptive difficulty based on player performance.
- **Comprehensive AI Training System**: Supports up to 500 game training sessions with batch processing.
- **Adaptive AI Difficulty Progression**: Real-time tracking and visualization of AI difficulty adjustments.

## UI/UX Decisions
- **Medieval Fantasy Visual Overhaul**: Features castle backgrounds, wooden UI panels, stone textures, gold accents, and atmospheric styling.
- **Enhanced Canvas Rendering**: Glowing highlights for selected squares and valid moves, with shadow effects.
- **Smooth Animations**: Piece movement animations and glowing canvas effects.
- **Medieval Typography**: Integrated Cinzel font.
- **Layout Optimization**: Streamlined component design, reduced blank space, single-column layouts, and consistent width constraints for improved responsiveness.
- **Comprehensive Leaderboard System**: Tracks campaign progress and PvP ratings with visual rankings and statistics.
- **Achievement Celebration Microinteractions**: Multi-layered celebration system with screen shake, particle bursts, confetti, and fireworks.
- **Enhanced Main Menu Integration**: Authentication status display, login/register dialogs, cloud save access, and user profile management integrated with premium status indicators.
- **Mobile-Friendly Responsive Design**: Optimized experiences for mobile, tablet, and desktop, including mobile-specific board sizing and touch-optimized controls.
- **Enhanced Premium Comparison Modal**: Revamped free vs. premium page with tabbed interface, social proof, discount offers, and animated visual elements.

## Technical Implementations
- **Castling System**: Implemented with king moving 3 squares and proper validation.
- **Enhanced Campaign Mode**: 12 progressive levels with story content, board variants, premium level locks, and a rewards system.
- **Streamlined Monetization System**: Single $5/month subscription with A/B price testing and strategic upgrade prompts.
- **Admin Security System**: Environment-based control and session authentication for admin features.
- **Enhanced Animation System**: Particle effects for captures, magical sparkles for wizard moves, and visual feedback for special moves.
- **Advanced Hint Modal System**: Immersive medieval-themed modals with 60 variations and anti-repetition logic.
- **Personalized Hint Learning Algorithm**: Machine learning system that tracks user interactions with hints and adapts hint selection.
- **Floating Mentor Notifications**: Enhanced AI mentor system with real-time feedback, text-to-speech, and auto-hide functionality.
- **Comprehensive User Authentication System**: Complete authentication with bcrypt hashing, session management, user registration/login/logout, and premium status tracking.
- **Cloud Save & Backup System**: Premium members get cloud save; all registered users can create local backups.
- **Upgraded Leaderboard System**: Migration to authenticated player data with PostgreSQL integration and server synchronization.
- **Comprehensive SEO & Marketing Website**: Full-featured landing page with CTAs, chess strategy content, AI training guides, and blog articles.
- **Strategic AdSense Integration**: Full AdSense integration with ad placements for revenue optimization.
- **Global Navigation System**: Seamless navigation between marketing pages and game interface.
- **Comprehensive Tournament System**: Multi-tiered tournament structure with free and premium-exclusive options.
- **Contextual Hint Overlay System**: Intelligent new player guidance with game state awareness, automatic triggers, and personalized learning.
- **Campaign Storyboard System**: Immersive visual story experience with scene progression, interactive level progression, character dialogue, and story triggers.
- **Founder Member Program**: System for early users with lifetime premium access, including database schema updates and automatic granting during registration.

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
- **GLSL Shaders**: Custom shader support.

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