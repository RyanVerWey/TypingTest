# Copilot Instructions for TypingTest

## Project Overview
This is a React-based typing speed test application built with Vite, Tailwind CSS, and Recharts. Users type passages with different difficulty levels while the app tracks WPM, accuracy, and detailed character-level statistics in real-time.

## Architecture & Data Flow

### Core Component Structure
- **`src/App.jsx`**: Main layout with React Router, renders Header → Toolbar → TypingTest/Results → Footer
- **`src/components/test/TypingTest.jsx`**: The heart of the app - manages test state, timer, and metrics calculation
- **`src/pages/Results.jsx`**: Displays comprehensive results with charts and export functionality
- **`src/lib/passage.js`**: Generates randomized passages across 4 difficulty levels (beginner/student/advanced/wizard)
- **`src/lib/metrics.js`**: Core calculation utilities for WPM, accuracy, and character classification

### Key Data Flow Patterns
1. **Session Storage Persistence**: Difficulty setting and final results persist via `sessionStorage` with graceful fallbacks
2. **Real-time Updates**: Uses refs (`typedRef`, `tickRef`) to avoid dependency loops in timer effects
3. **Timeline Sampling**: WPM tracked every 5 seconds during test, final sample added on completion
4. **Auto-advancement**: Lines advance automatically when complete; Enter key only works if line is finished

### State Management Conventions
- **No global state**: All state managed locally with React hooks
- **Effect patterns**: Separate useEffect for timer, passage generation, storage persistence
- **Derived calculations**: WPM, accuracy computed from current state, not stored separately
- **Navigation**: Results passed via React Router state AND sessionStorage backup

## Development Patterns

### Component Architecture
- **Layout components** (`src/components/layout/`): Header, Footer, Toolbar (difficulty selector)
- **Feature components** (`src/components/test/`): Self-contained TypingTest with all logic
- **Page components** (`src/pages/`): Results page with chart rendering and export
- **Utility libraries** (`src/lib/`): Pure functions for calculations and data generation

### Styling Conventions
- **Tailwind-first**: All styling via Tailwind classes, minimal custom CSS
- **Dark mode support**: Uses Tailwind's dark: prefix throughout
- **Responsive design**: Mobile-first approach with responsive containers
- **Glass morphism**: Export functionality creates glass effect backgrounds

### Testing & Metrics Logic
- **Timer precision**: 120-second test with 1-second intervals, uses elapsed time for calculations
- **Character classification**: Letters/numbers/symbols tracked separately for detailed accuracy
- **WPM calculation**: `(word count / elapsed seconds) * 60` where words = space-separated tokens
- **Auto-completion**: Test ends early if all lines completed OR timer reaches zero

## Build & Development

### Scripts & Commands
```bash
npm run dev          # Vite dev server on port 5173
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm start            # Serve production build (Heroku)
```

### Deployment Configuration
- **Heroku deployment**: Uses `Procfile` with `web: npm start`
- **Static serving**: Production uses `serve` package to serve `dist/` folder
- **Build optimization**: Vite handles bundling, Tailwind purges unused CSS

### Dependencies to Note
- **Recharts**: For WPM timeline and character accuracy charts
- **html2canvas**: Results export to PNG functionality  
- **Framer Motion**: Smooth animations and transitions
- **React Router DOM**: Client-side routing between test and results

## Difficulty System

### Passage Generation (`src/lib/passage.js`)
- **4 levels**: beginner, student, advanced, wizard
- **Content variety**: Each level has 6 different paragraph blocks
- **Randomization**: Paragraphs shuffled and joined with double newlines
- **Progressive complexity**: From simple sentences to technical content with symbols

### Character Patterns by Level
- **Beginner**: Basic punctuation, simple numbers (7:30, $2, 10 kites)
- **Student**: Academic content with dates, percentages, equations (21°C, 09/15, 3+4=7)
- **Advanced**: Professional tone with units, statistics (±0.4, 62%, λ=0.01)
- **Wizard**: Technical content with paths, JSON, regex (`npm run build`, `{"ok":true}`)

## Export System (`src/shared/exporters.js`)

### PNG Export
- **Target elements**: Uses `[data-export-root]` and `[data-glass]` attributes
- **Dark/light awareness**: Automatically detects theme and adjusts backgrounds
- **High DPI support**: Scales based on device pixel ratio for crisp images
- **Layout considerations**: Adds padding, shadows, and solid backgrounds for exports

### CSV Export  
- **Timeline data**: Exports WPM progression over time
- **Metadata included**: Test settings, final metrics, timestamps

## Common Modification Patterns

When adding features, follow these established patterns:
- **New metrics**: Add calculation to `src/lib/metrics.js`, integrate in TypingTest state
- **UI components**: Create in appropriate `src/components/` subfolder with Tailwind styling
- **Storage needs**: Use sessionStorage with try/catch blocks for privacy mode compatibility
- **Passage content**: Add new blocks to appropriate difficulty array in `src/lib/passage.js`
- **Charts/visualization**: Extend Results page using Recharts components