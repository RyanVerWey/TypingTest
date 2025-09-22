# Typing Speed Test

A modern, interactive web application for testing and improving typing speed and accuracy in real time. Built with React 19, Vite, and Tailwind CSS 4, featuring responsive design, comprehensive metrics tracking, and intelligent difficulty progression.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
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

Typing Speed Test presents users with dynamically generated passages across four difficulty levels and measures comprehensive typing metrics including WPM, character-level accuracy, and keystroke patterns. All calculations are performed client-side with session persistence and detailed performance visualization.

**Key Highlights:**
- ⚡ Real-time WPM calculation with timeline tracking
- 🎯 Character-level accuracy breakdown (letters, numbers, symbols)
- 📊 Interactive WPM progression charts
- 🎚️ Four intelligent difficulty levels with progressive complexity
- 📱 Fully responsive design with dark/light mode support
- 📈 Comprehensive results export (PNG/CSV)
- 🔄 Auto-advancing lines with smart completion detection

---

## Features

### Core Functionality
- **Live Metrics**: Real-time WPM, accuracy, errors, and keystroke tracking
- **Smart Testing**: 120-second tests with automatic line advancement
- **Character Analysis**: Detailed breakdown by character type (letters/numbers/symbols)
- **Timeline Tracking**: WPM sampled every 5 seconds for progression analysis
- **Session Persistence**: Difficulty settings and results saved across sessions

### User Experience
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Themes**: Automatic theme detection with manual override
- **Accessibility**: Keyboard navigation and screen reader friendly
- **Error Highlighting**: Real-time visual feedback for typing mistakes
- **Auto-completion**: Test ends when all lines completed or timer expires

### Data & Export
- **Performance Visualization**: Interactive charts powered by Recharts
- **Export Options**: High-quality PNG and CSV export functionality
- **Historical Data**: Session storage with graceful privacy mode fallbacks
- **Comprehensive Results**: Detailed metrics with visual breakdowns

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
│   │   ├── layout/
│   │   │   ├── Footer.jsx         # Application footer
│   │   │   ├── Header.jsx         # Application header
│   │   │   └── Toolbar.jsx        # Difficulty selector toolbar
│   │   └── test/
│   │       └── TypingTest.jsx     # Core typing test component
│   ├── lib/
│   │   ├── metrics.js             # WPM, accuracy, and time utilities
│   │   └── passage.js             # Dynamic passage generation
│   ├── pages/
│   │   └── Results.jsx            # Comprehensive results page
│   ├── shared/
│   │   └── exporters.js           # PNG and CSV export functionality
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
- **Recharts** - Responsive chart library for React
- **html2canvas** - High-quality screenshot generation

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

### 🟢 Beginner Typer
Simple sentences with basic punctuation and common numbers
- **Example**: "We packed snacks for our walk at 7:30 and counted 10 red kites."
- **Focus**: Letter accuracy and basic rhythm

### 🟡 Student Typer  
Academic content with dates, equations, and measurements
- **Example**: "The temperature reached 21°C at 1:10 pm and we solved 3 + 4 = 7."
- **Focus**: Mixed content with educational context

### 🟠 Advanced Typer
Professional content with statistics, units, and technical terms
- **Example**: "The model achieved 2.3 ± 0.4 units with 62% accuracy (λ=0.01)."
- **Focus**: Complex symbols and professional vocabulary

### 🔴 Computer Wizard
Technical content with code, paths, JSON, and command syntax
- **Example**: "Run `npm run build` and verify `{"ok":true}` returns within 200ms."
- **Focus**: Programming syntax and technical accuracy

---

## Export Features

### PNG Export
- **High Resolution**: Automatically scales for crisp images on all devices
- **Theme Aware**: Adapts to current dark/light mode settings
- **Professional Layout**: Clean formatting with shadows and spacing
- **Chart Inclusion**: Captures both metrics and performance graphs

### CSV Export
- **Timeline Data**: Complete WPM progression over time
- **Metadata**: Test settings, final metrics, and timestamps
- **Analysis Ready**: Formatted for spreadsheet import and analysis

---

## Development

### Architecture Patterns
- **Component-based**: Modular React components with clear responsibilities
- **State Management**: Local state with hooks, no global state needed
- **Real-time Updates**: Efficient timer management with refs to avoid re-renders
- **Session Persistence**: Graceful storage handling with fallbacks

### Code Organization
- **`/components`**: Reusable UI components organized by feature
- **`/lib`**: Pure utility functions for calculations and data generation
- **`/pages`**: Top-level page components with routing
- **`/shared`**: Cross-cutting concerns like export functionality

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Deployment

### Live Application
The application is deployed on Heroku and publicly accessible:

**🌐 Live URL**: [https://speedtest-b0c193f4cfb2.herokuapp.com](https://speedtest-b0c193f4cfb2.herokuapp.com)

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

## Contact

**Created and maintained by Ryan VerWey & Rachel VerWey**

For questions, feedback, or collaboration opportunities:

- **Ryan's GitHub**: [RyanVerWey](https://github.com/RyanVerWey)
- **Rachel's GitHub**: [rachelanne421](https://github.com/rachelanne421)
- **Email**: ryan.w.verwey@gmail.com
- **Project Repository**: [TypingTest](https://github.com/RyanVerWey/TypingTest)

---

## Acknowledgments

- Built with modern React 19 and Vite 7
- Styled with Tailwind CSS 4
- Charts powered by Recharts
- Deployed on Heroku platform
- Documentation collaboration by Rachel VerWey

*Happy typing! 🎯⚡*
