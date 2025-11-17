# American Football Scoreboard Application

## Overview

This is an interactive American football scoreboard application that provides real-time game state management with a broadcast-quality visual interface. The application allows users to control all aspects of a football game including scores, game clock, quarters, down tracking, field position, and team customization. Built with a focus on stadium energy and broadcast aesthetics (ESPN/NFL Network style), it combines sports broadcasting design principles with Material Design's clear information hierarchy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component System:**
- Shadcn/ui component library (New York style variant) for consistent, accessible UI components
- Radix UI primitives for headless, accessible component foundations
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for variant-based component styling

**State Management:**
- TanStack Query (React Query) for server state management, caching, and synchronization
- Local React state for UI interactions and client-side clock management
- Polling mechanism (5-second intervals) for background state synchronization

**Design System:**
- Dark mode primary theme with "stadium night" aesthetics
- Custom color palette supporting dynamic team color injection
- Typography: Rajdhani (athletic numbers) and Inter (controls/labels) from Google Fonts
- Spacing system based on Tailwind's 2, 4, 8, 12, 16 unit primitives
- Glass morphism effects with backdrop blur for scoreboard panels

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js with ESM modules
- TypeScript for type safety across the entire backend
- Development mode supports Vite middleware integration for HMR

**API Design:**
- RESTful endpoints for game state management:
  - `GET /api/game-state` - Retrieve current game state
  - `PATCH /api/game-state` - Update game state with partial changes
  - `POST /api/game-state/reset` - Reset game to initial state
- JSON-based request/response format
- Centralized error handling middleware

**Data Storage:**
- In-memory storage implementation (`MemStorage` class) for game state
- Interface-based storage abstraction (`IStorage`) allowing future database integration
- Drizzle ORM configured for PostgreSQL (schema defined but not actively used)
- Session management support via connect-pg-simple (configured for future use)

**Data Model:**
The game state maintains:
- Team information (names, scores, colors)
- Game clock (quarter, time remaining, running state)
- Possession tracking
- Down and distance information
- Field position with side-of-field tracking

### External Dependencies

**Core Framework Dependencies:**
- `express` - Web server framework
- `react` & `react-dom` - UI framework
- `vite` - Build tool and dev server
- `typescript` - Type system
- `drizzle-orm` - Database ORM (configured for future use)
- `@neondatabase/serverless` - Serverless PostgreSQL driver

**UI & Styling:**
- `tailwindcss` - Utility-first CSS framework
- `@radix-ui/*` packages - Headless accessible UI primitives (20+ components)
- `lucide-react` - Icon library
- `class-variance-authority` - Variant-based styling utility
- `tailwind-merge` & `clsx` - Class name utilities

**State Management & Data Fetching:**
- `@tanstack/react-query` - Server state management
- `wouter` - Client-side routing
- `react-hook-form` & `@hookform/resolvers` - Form management
- `zod` & `drizzle-zod` - Schema validation

**Developer Experience:**
- `tsx` - TypeScript execution for development
- `esbuild` - JavaScript bundler for production builds
- `@replit/vite-plugin-*` - Replit-specific development tools
- `drizzle-kit` - Database migration toolkit

**Database (Configured but Not Active):**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries
- Migration system via drizzle-kit
- Connection via `DATABASE_URL` environment variable

The application is designed to support future database persistence while currently operating with in-memory storage, making it easy to switch to persistent storage when needed.