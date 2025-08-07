# Overview

**Wizard Chess Duel** is a full-stack TypeScript application featuring a 10x10 chess variant with magical wizards. It offers local multiplayer and AI opponent modes, all within a comprehensive medieval fantasy theme. The project aims to provide an engaging and visually immersive chess experience with advanced AI capabilities and a robust monetization framework.

Key features include:
- A unique 10x10 board with custom wizard pieces.
- AI opponents with adjustable difficulty, including an advanced minimax AI and a neural network learning system.
- Comprehensive leaderboards for campaign and PvP modes.
- A robust monetization system with ad integration and an ad-free premium upgrade.
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

### Technical Implementations
- **Castling System**: Implemented with king moving 3 squares and proper validation.
- **Mass AI Training System**: Comprehensive training with improved minimax and neural network learning.
- **Admin Security System**: Environment-based control and session authentication for admin features (Mass AI Training, Debug tools, Reset AI Training, View AI Learning Stats).

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