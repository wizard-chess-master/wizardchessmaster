# Overview

This is a **Fantasy Chess** web application - a 10x10 chess variant with magical wizards positioned in corners. The project is built as a full-stack TypeScript application with React frontend and Express backend, featuring both local multiplayer and AI opponent modes with different difficulty levels.

## Recent Changes (January 4, 2025)
- Updated board layout: Standard chess pieces centered (8 pieces + 8 pawns per side), wizards in corners (a1/j1 for white, a10/j10 for black)
- Added comprehensive keyboard shortcuts (Ctrl+Z undo, Ctrl+M mute, Ctrl+H menu, Escape deselect)
- Enhanced audio feedback for captures and wizard attacks
- Fixed TypeScript type issues with piece capture handling
- Complete implementation with fantasy UI, AI opponents, and ad/IAP placeholders

## Bug Fixes (January 4, 2025)
- Fixed wizard movement logic: Wizards can no longer teleport through or beyond own pieces
- Added missing pawn promotion: Pawns now auto-promote to queen when reaching the opposite end
- Fixed AI move validation: AI moves now properly check if they would put own king in check
- Improved getAllValidMoves function: Now properly validates moves don't put own king in check
- Fixed keyboard shortcut selection clearing: Escape key now properly clears piece selection
- Enhanced move validation for wizard attacks in AI player logic

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript** - Component-based UI with type safety
- **Zustand State Management** - Lightweight state management for game state and audio
- **Tailwind CSS + Radix UI** - Modern styling with accessible component primitives
- **Vite Build Tool** - Fast development and optimized production builds
- **Three.js Integration** - 3D graphics support via React Three Fiber (with GLSL shader support)

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
- **AI System** - Three difficulty levels (easy/medium/hard) with different strategies
- **State Management** - Zustand stores for game state, audio controls, and UI state
- **Move Validation** - Comprehensive piece movement rules including special wizard abilities

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