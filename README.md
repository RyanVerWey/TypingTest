# Typing Speed Test

A comprehensive web application for measuring and analyzing typing performance with advanced analytics and detailed insights. Built with React, Vite, and Tailwind CSS, featuring real-time metrics tracking, intelligent personality profiling, and professional results visualization.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Analytics Dashboard](#analytics-dashboard)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Performance Metrics](#performance-metrics)
- [Difficulty Levels](#difficulty-levels)
- [Export Features](#export-features)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

Typing Speed Test provides comprehensive typing performance analysis with advanced behavioral pattern recognition and personalized improvement recommendations. The application measures real-time WPM, character-level accuracy, keystroke patterns, and generates detailed personality profiles based on typing behavior.

**Key Highlights:**
- Real-time WPM calculation with timeline tracking
- Advanced character-level accuracy analysis (letters, numbers, symbols)  
- Interactive performance visualization with multiple chart types
- AI-powered personality profiling and improvement recommendations
- Four intelligent difficulty levels with progressive complexity
- Professional results dashboard with comprehensive analytics
- High-quality export functionality (PNG/CSV)
- Fully responsive design with dark/light mode support

---

## Features

### Core Testing Engine
- **Live Metrics**: Real-time WPM, accuracy, errors, and keystroke tracking
- **Smart Testing**: 120-second tests with automatic line advancement
- **Character Analysis**: Detailed breakdown by character type with accuracy metrics
- **Timeline Tracking**: WPM sampled every 5 seconds for progression analysis
- **Session Persistence**: Settings and results maintained across browser sessions

### Advanced Analytics Dashboard
- **Performance Over Time**: Interactive line chart showing WPM progression
- **Keystroke Analysis**: Pie chart visualization of correct vs incorrect keystrokes  
- **Character Accuracy**: Bar chart breakdown by character type (letters/numbers/symbols)
- **Skill Assessment**: Radar chart comparing current performance to target benchmarks
- **Typing Personality Profile**: AI-generated analysis of typing behavior patterns
- **Core Traits Analysis**: Detailed breakdown of strengths and growth areas
- **Data Insights**: Key findings and behavioral pattern recognition
- **Performance Enhancement Plan**: Personalized tips categorized by improvement area

### User Experience
- **Responsive Design**: Optimized for desktop and mobile devices with adaptive layouts
- **Dark/Light Themes**: Automatic system theme detection with manual override options
- **Accessibility**: Full keyboard navigation and screen reader compatibility
- **Error Highlighting**: Real-time visual feedback for typing mistakes and corrections
- **Auto-completion**: Test ends when all lines completed or 120-second timer expires
- **Professional Interface**: Clean, modern design with intuitive navigation and controls

### Data Visualization & Export
- **Interactive Charts**: Multiple chart types powered by Recharts for comprehensive analysis
- **Export Options**: High-quality PNG screenshots and CSV data export
- **Performance Insights**: Visual representation of typing patterns and improvement areas  
- **Historical Analysis**: Session storage with graceful privacy mode fallbacks
- **Professional Results**: Dashboard-style layout with KPI metrics and detailed breakdowns

---

## Analytics Dashboard

The enhanced results page provides comprehensive typing performance analysis through multiple visualization components:

### Performance Metrics Overview
- **Speed (WPM)**: Real-time calculation with visual progress indicators
- **Accuracy**: Overall percentage with character-type breakdown
- **Consistency**: Keystroke timing variance analysis
- **Error Rate**: Mistake frequency and correction patterns

### Visualization Components
- **Performance Over Time**: Line chart showing WPM progression throughout the test
- **Keystroke Analysis**: Pie chart displaying correct vs incorrect keystroke distribution
- **Character Accuracy**: Bar chart breaking down accuracy by letters, numbers, and symbols
- **Skill Assessment**: Radar chart comparing performance across multiple typing dimensions

### Intelligent Analysis
- **Typing Personality Profiles**: AI-generated behavioral analysis (Speed Demon, Accuracy Focused, etc.)
- **Core Traits**: Strengths identification with explanatory insights
- **Growth Areas**: Targeted improvement recommendations with specific metrics
- **Data Insights**: Pattern recognition and performance trend analysis
- **Enhancement Plan**: Categorized tips for speed, accuracy, efficiency, and advanced techniques

---

## Project Structure

```
TypingTest/
├── .github/
│   └── copilot-instructions.md    # AI coding assistant instructions
├── public/
│   └── typing-test-preview.png    # Preview image for meta tags
├── src/
│   ├── assets/
│   │   └── react.svg              # React logo asset
│   ├── components/
│   │   ├── analytics/
│   │   │   ├── PersonalityProfile.jsx  # AI-powered typing personality analysis
│   │   │   ├── ProblemCharacters.jsx   # Character-specific error analysis
│   │   │   ├── StrategyGuide.jsx       # Personalized improvement strategies
│   │   │   └── TypingTips.jsx          # Categorized performance tips
│   │   ├── layout/
│   │   │   ├── Footer.jsx         # Application footer with attribution
│   │   │   ├── Header.jsx         # Application header with navigation
│   │   │   └── Toolbar.jsx        # Difficulty selector toolbar
│   │   └── test/
│   │       └── EnhancedTypingTest.jsx  # Core typing test with real-time analytics
│   ├── lib/
│   │   ├── enhanced-metrics.js    # Advanced analytics and personality profiling
│   │   ├── metrics.js             # Core WPM, accuracy, and timing calculations
│   │   └── passage.js             # Dynamic passage generation across difficulty levels
│   ├── pages/
│   │   └── EnhancedResults.jsx    # Comprehensive analytics dashboard
│   ├── shared/
│   │   └── exporters.js           # PNG and CSV export functionality with chart support
│   ├── App.jsx                    # Main application with routing
│   ├── main.jsx                   # React DOM entry point
│   ├── App.css                    # Application-wide styles
│   └── index.css                  # Global styles and Tailwind imports
├── index.html                     # Vite HTML template
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── vite.config.js                 # Vite build configuration
├── eslint.config.js               # ESLint configuration
└── README.md                      # This file
```

---

## Technologies Used

### Core Framework
- **React 19** - Latest React with concurrent features
- **React Router DOM 7** - Client-side routing
- **Vite 7** - Lightning-fast build tool and dev server

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **PostCSS** - CSS processing and optimization

### Data Visualization
- **Recharts** - Comprehensive charting library with responsive design
- **html2canvas** - High-quality screenshot generation with chart support
- **FontAwesome** - Professional icon set for enhanced UI elements

### Development Tools
- **ESLint 9** - Code linting with modern configuration
- **TypeScript Types** - Type definitions for React
- **Node.js 24** - Latest LTS runtime environment

### Deployment
- **Heroku** - Cloud platform deployment
- **serve** - Static file serving for production

---

## Setup Instructions

### Prerequisites
- **Node.js 24.x** or higher
- **npm 11.x** or higher

### Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/RyanVerWey/TypingTest.git
    cd TypingTest
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Start Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:5173](http://localhost:5173).

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Create production build in dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint code analysis
npm start            # Serve production build (used by Heroku)
```

---

## Usage Guide

### Getting Started
1. **Select Difficulty**: Choose from Beginner, Student, Advanced, or Computer Wizard
2. **Start Typing**: Click in the input field and begin typing the displayed passage
3. **Auto-progression**: Lines advance automatically when completed (no Enter needed)
4. **Live Feedback**: Watch your WPM, accuracy, and error count update in real-time
5. **View Results**: Complete the test or let the timer expire to see detailed results

### Pro Tips
- **Focus Mode**: Lines auto-advance to keep you in the flow
- **Error Correction**: Backspace works to correct mistakes
- **Timer Display**: Time remaining shows in MM:SS format
- **Visual Cues**: Incorrect characters are highlighted as you type
- **Export Results**: Save your performance as PNG or CSV from results page

---

## Performance Metrics

### Core Calculations
- **WPM (Words Per Minute)**: `(word count ÷ elapsed seconds) × 60`
- **Accuracy**: `(correct characters ÷ total characters) × 100`
- **Error Rate**: `incorrect keystrokes ÷ total keystrokes`
- **Keystroke Count**: Total keys pressed including corrections

### Character Analysis
- **Letters**: A-Z accuracy tracking
- **Numbers**: 0-9 digit accuracy 
- **Symbols**: Punctuation and special character accuracy
- **Timeline**: WPM sampled every 5 seconds for progression analysis

### Data Persistence
- Difficulty settings saved in session storage
- Results passed to results page via React Router state
- Graceful fallbacks for private browsing mode
- Auto-recovery from storage failures

---

## Difficulty Levels

### Beginner Typer
Simple sentences with basic punctuation and common numbers
- **Example**: "We packed snacks for our walk at 7:30 and counted 10 red kites."
- **Focus**: Letter accuracy and basic rhythm development

### Student Typer  
Academic content with dates, equations, and measurements
- **Example**: "The temperature reached 21°C at 1:10 pm and we solved 3 + 4 = 7."
- **Focus**: Mixed content with educational context and special characters

### Advanced Typer
Professional content with statistics, units, and technical terms
- **Example**: "The model achieved 2.3 ± 0.4 units with 62% accuracy (λ=0.01)."
- **Focus**: Complex symbols and professional vocabulary

### Computer Wizard
Technical content with code, paths, JSON, and command syntax
- **Example**: "Run `npm run build` and verify `{"ok":true}` returns within 200ms."
- **Focus**: Programming syntax and technical accuracy with special characters

---

## Export Features

### PNG Export
- **High Resolution**: Automatically scales based on device pixel ratio for crisp images
- **Theme Aware**: Adapts to current dark/light mode settings with proper contrast
- **Professional Layout**: Clean formatting with shadows, spacing, and branded appearance
- **Complete Dashboard**: Captures metrics, charts, and analytics in a single image
- **Chart Integration**: Properly renders all interactive charts in exported format

### CSV Export
- **Timeline Data**: Complete WPM progression data with timestamps
- **Comprehensive Metrics**: All performance indicators and calculated statistics  
- **Metadata**: Test settings, difficulty level, completion status, and session information
- **Analysis Ready**: Formatted for immediate import into spreadsheet applications and data analysis tools

---

## Development

### Architecture Patterns
- **Component-based**: Modular React architecture with clear separation of concerns
- **Analytics Engine**: Advanced metrics calculation with personality profiling algorithms
- **Real-time Processing**: Efficient timer management with refs to prevent unnecessary re-renders
- **Session Persistence**: Robust storage handling with graceful fallbacks for privacy modes
- **Chart Integration**: Responsive data visualization with interactive tooltips and export support

### Code Organization
- **`/components/analytics`**: Advanced analysis components for personality profiling and insights
- **`/components/layout`**: Reusable UI components with consistent design patterns
- **`/components/test`**: Enhanced typing test engine with real-time analytics
- **`/lib`**: Pure utility functions for calculations, analytics, and data generation
- **`/pages`**: Top-level dashboard components with comprehensive results visualization
- **`/shared`**: Cross-cutting concerns including advanced export functionality

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Deployment

### Live Application
The application is deployed on Heroku with comprehensive analytics dashboard:

**Live URL**: [https://speedtest-b0c193f4cfb2.herokuapp.com](https://speedtest-b0c193f4cfb2.herokuapp.com)

### Deployment Configuration
- **Platform**: Heroku with Node.js buildpack
- **Build Process**: `npm run heroku-postbuild` → `vite build`
- **Serving**: Static files served via `serve` package
- **Environment**: Production build optimized for performance

---

## Contributing

We welcome contributions! Please see our contribution guidelines:

1. **Fork & Clone**: Fork the repo and clone your fork
2. **Branch**: Create a feature branch from `main`
3. **Develop**: Follow existing code patterns and conventions
4. **Test**: Ensure the app builds and runs correctly
5. **Commit**: Use clear, descriptive commit messages
6. **Pull Request**: Submit a PR with detailed description

### Development Guidelines
- Follow existing component patterns
- Use Tailwind classes for styling
- Maintain TypeScript compatibility
- Test across different difficulty levels
- Ensure responsive design works on mobile

---

## License

This project is open-source and available under the **MIT License**.

---

## Contributors

This project is brought to you by:

### Ryan VerWey
- **Role**: Lead Developer & Project Maintainer
- **GitHub**: [@RyanVerWey](https://github.com/RyanVerWey)
- **Contributions**: Core application development, analytics engine, React implementation, UI/UX design

### Rachel VerWey
- **Role**: Documentation Specialist & Co-Maintainer  
- **GitHub**: [@rachelanne421](https://github.com/rachelanne421)
- **Contributions**: Comprehensive documentation, README maintenance, user experience improvements

---

## Contact

**Created and maintained by Ryan VerWey & Rachel VerWey**

For questions, feedback, or collaboration opportunities:

- **Ryan's GitHub**: [RyanVerWey](https://github.com/RyanVerWey)
- **Rachel's GitHub**: [rachelanne421](https://github.com/rachelanne421)
- **Email**: ryan.w.verwey@gmail.com
- **Project Repository**: [TypingTest](https://github.com/RyanVerWey/TypingTest)

---

## Acknowledgments

- Built with modern React and Vite for optimal performance
- Styled with Tailwind CSS for responsive, utility-first design
- Charts powered by Recharts for interactive data visualization
- Deployed on Heroku platform with production optimization
- Enhanced analytics powered by advanced behavioral pattern recognition
- Documentation collaboration by Rachel VerWey

*Happy typing and performance improvement!*
