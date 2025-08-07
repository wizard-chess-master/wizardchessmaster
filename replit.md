# Overview

This is a **Fantasy Chess** web application - a 10x10 chess variant with magical wizards positioned in corners. The project is built as a full-stack TypeScript application with React frontend and Express backend, featuring both local multiplayer and AI opponent modes with different difficulty levels.

**NEW: Comprehensive Medieval Fantasy Visual Overhaul** - The application now features a fully immersive medieval fantasy theme with castle backgrounds, wooden UI elements, glowing highlights, smooth animations, and mobile-responsive design.

## Recent Changes (August 7, 2025)

### COMPREHENSIVE MONETIZATION SYSTEM - FULLY OPERATIONAL
- **Complete Ad Framework**: Implemented Google AdSense integration with banner ads, interstitial ads, and rewarded videos
- **Strategic Ad Placement**: Banner ads in MainMenu and GameUI, interstitial ads after game completion
- **Rewarded Video System**: Watch ads for extra hints (2 free per game) and undos (1 free per game)
- **Stripe Payment Integration**: $2.99 ad-free upgrade with secure Stripe checkout process
- **Game Hints System**: AI-powered hint system with tactical analysis and move reasoning
- **Ad-Free Experience**: Premium users get unlimited hints/undos and complete ad removal
- **Balanced Monetization**: Designed to encourage upgrades without breaking core gameplay
- **User Experience**: Tasteful ad integration that maintains medieval fantasy atmosphere
- **Streamlined UI**: Removed redundant "Watch AI Training" feature - AI vs AI Battle mode now serves as both training and entertainment

## Previous Changes (January 6, 2025)

### MAJOR VISUAL OVERHAUL - Medieval Fantasy Theme
- **Generated Medieval Assets**: Created castle background, wooden UI panels, and stone textures using AI image generation
- **Complete CSS Redesign**: Implemented comprehensive medieval-theme.css with wooden buttons, gold accents, and atmospheric styling
- **Enhanced Canvas Rendering**: Added glowing highlights for selected squares (gold) and valid moves (green) with shadow effects
- **Smooth Animations**: Implemented 0.5s piece movement animations with glowing canvas effects during moves
- **Responsive Design**: Full mobile responsiveness with adaptive grid layouts and scaled elements
- **Subtle Ad Integration**: Added tasteful medieval-themed ad spaces that blend with the fantasy atmosphere
- **Medieval Typography**: Integrated Cinzel font for authentic medieval text styling throughout the interface
- **Interactive Elements**: All buttons, menus, and UI panels now use wooden textures with bronze borders and hover effects

### Previous Updates (January 6, 2025)
- **NEW: Updated Board Layout**: Changed starting positions - wizards now in home row (d1/g1), full 10-column setup
- **NEW: Castling System**: Implemented castling with king moving 3 squares (to c1/g1), rook to d1/f1
- **Castling Rules**: Proper validation - no pieces between, king not in check, neither piece has moved
- **Board Setup**: White: rook, knight, bishop, wizard, queen, king, wizard, bishop, knight, rook (mirrored for black)
- **Wizard Movement Fixed**: Corrected wizard attack/teleport logic in all game modes

## Previous Changes (January 5, 2025)
- **Advanced Minimax AI Integration**: Implemented user-specified minimax algorithm with alpha-beta pruning (depth 4+)
- **Updated Piece Values**: All AI systems now use user-specified values (pawn 10, knight 30, bishop 30, rook 50, queen 90, king 900, wizard 35)
- **AIManager Class**: Clean minimax implementation matching user pseudocode structure with simplified evaluation
- **Mass AI Training System - FULLY OPERATIONAL**: Comprehensive training system with 1-10000 game range, now using improved minimax
- **Fixed Learning Stats Dialog**: "Back to Menu" button moved to top of dialog for guaranteed visibility
- **Advanced AI Training System**: Dual AI system with both neural network learning and pure minimax approaches
- **Neural Network Learning**: AI learns from game outcomes using adaptive weights for material, position, king safety, and mobility
- **Strategy Pattern Recognition**: AI discovers and logs strategic patterns (aggressive-tactical, strategic-development, wizard-focused, etc.)
- **Unified Training Interface**: Single, comprehensive UI for all training needs - removed redundant training options
- **Training Controls**: Start/stop functionality, configurable game counts, and real-time progress tracking
- **JSON Strategy Logging**: Export/import training data with neural weights, strategy patterns, and game statistics
- **10% Exploration**: Built-in randomness for varied gameplay and strategy discovery (in neural AI)
- **Transposition Tables**: Optimized move search with position caching for better performance
- **UI Improvements**: Fixed win rate display issues, added main menu navigation, eliminated redundant controls
- **Performance Optimization**: Limited AI learning records to prevent UI freezing during large training sessions
- Enhanced AI tactical intelligence: threat analysis, piece defense evaluation, blunder prevention
- Improved AI strategic diversity: penalties for overusing same pieces, coordination bonuses, piece development incentives

## Bug Fixes (January 4, 2025)
- Fixed wizard movement logic: Wizards can now teleport to any unoccupied square within 2 squares in straight lines
- Added missing pawn promotion: Pawns now auto-promote to queen when reaching the opposite end
- Fixed AI move validation: AI moves now properly check if they would put own king in check
- Improved getAllValidMoves function: Now properly validates moves don't put own king in check
- Fixed keyboard shortcut selection clearing: Escape key now properly clears piece selection
- Enhanced move validation for wizard attacks in AI player logic
- Updated wizard teleportation: Wizards can now teleport over pieces to reach empty squares
- Fixed wizard attack rules: Wizards can now attack any enemy within 2 squares through occupied squares
- Added AI vs AI mode: Fully automated gameplay for testing and demonstration purposes using advanced AI difficulty
- Implemented AI training system: Runs multiple games to analyze strategies and improve AI performance
- Added visual AI training viewer: Watch AI games in slow motion with controls and statistics
- Implemented comprehensive AI learning system: AI analyzes every completed game (human vs AI and AI vs AI) to learn patterns, track strategies, and improve over time
- Added learning statistics display: Shows total games analyzed, win rates, move patterns learned, and preferred strategies
- AI now uses learned patterns when available, falling back to original difficulty-based strategies
- Learning data persists in localStorage and can be reset via the UI

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript** - Component-based UI with type safety
- **Zustand State Management** - Lightweight state management for game state and audio
- **Tailwind CSS + Radix UI + Medieval Theme** - Modern styling with accessible components and comprehensive medieval fantasy CSS
- **Vite Build Tool** - Fast development and optimized production builds
- **Canvas-Based Chess Rendering** - Custom sprite rendering with smooth animations and glowing effects
- **Responsive Medieval Design** - Mobile-first approach with fantasy-themed layouts and wooden UI elements

### Backend Architecture
- **Express.js Server** - RESTful API with TypeScript
- **Modular Route System** - Organized route handlers with consistent error handling
- **In-Memory Storage** - Simple storage interface with potential for database integration
- **Development/Production Separation** - Vite integration for dev, static serving for production

### Data Storage Solutions
- **Drizzle ORM** - Type-safe database toolkit configured for PostgreSQL
- **Neon Database** - Serverless PostgreSQL via `@neondatabase/serverless`
- **Schema Management** - Shared schema definitions with Zod validation
- **Migration System** - Database migrations managed via Drizzle Kit

### Game Logic Architecture
- **Chess Engine** - Complete 10x10 chess implementation with piece movement validation
- **Advanced AI System** - Minimax with alpha-beta pruning, neural network learning, strategy pattern recognition
- **Unified Training System** - Comprehensive training interface handling 1-1000 games with full control capabilities
- **AI Difficulty Levels** - Easy/medium/hard with different strategies plus advanced minimax AI
- **State Management** - Zustand stores for game state, audio controls, and UI state
- **Move Validation** - Comprehensive piece movement rules including special wizard abilities
- **Neural Learning** - Adaptive AI that learns from game outcomes and adjusts evaluation weights
- **Training Features** - Start/stop controls, configurable game counts (1-10000), real-time statistics, and performance optimization

### Audio System
- **HTML5 Audio** - Sound effects for moves and game events
- **Mute Controls** - User-configurable audio settings
- **Audio Store** - Centralized audio state management

## External Dependencies

### Database & ORM
- **Neon Database** - Serverless PostgreSQL hosting
- **Drizzle ORM** - Database queries and schema management
- **PostgreSQL** - Primary database dialect

### UI & Styling
- **Radix UI** - Accessible component primitives (dialogs, buttons, forms, etc.)
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Inter Font** - Typography via Fontsource

### 3D Graphics
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **GLSL Shaders** - Custom shader support via vite-plugin-glsl

### Development Tools
- **Vite** - Build tool and dev server
- **ESBuild** - Fast bundling for production
- **TypeScript** - Type checking and compilation
- **Replit Integration** - Error overlay and development utilities

### State & Data Management
- **Zustand** - State management library
- **TanStack Query** - Server state management and caching
- **Zod** - Runtime type validation

The application follows a clean separation between client and server code, with shared type definitions and schemas. The chess game logic is entirely client-side, while the backend provides user management and potential multiplayer functionality in the future.