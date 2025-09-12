# Typing Speed Test

Typing Speed Test is an interactive web application for testing and improving typing speed and accuracy in real time. Built with React and Tailwind CSS, it features a responsive UI, live metrics tracking, and customizable difficulty settings.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Performance Metrics](#performance-metrics)
- [Deployment](#deployment)
- [License](#license)
- [Contact](#contact)

---

## Overview

Typing Speed Test presents users with dynamically generated passages and measures typing speed (WPM), character accuracy, errors, and keystrokes. Metrics are calculated client-side and persisted using session storage. A results screen visualizes performance over time.

**Highlights:**
- Real-time WPM calculation
- Character-level accuracy (letters, numbers, symbols)
- WPM trend graph (timeline sampling)
- Difficulty selection
- Responsive interface

---

## Features

- Live tracking of WPM and accuracy
- Character breakdown: letters, numbers, symbols
- Real-time input validation and error highlighting
- WPM timeline tracking
- Automatic line advancement
- Resettable test session
- Session-persistent difficulty selection
- Performance data stored and passed to results page
- Mobile and desktop responsive layout
- Built with Vite and Tailwind CSS

---

## Project Structure

```
src/
├── public/
│ └── typing-test-preview.png # Static image used for preview/meta
├── src/
│ ├── assets/
│ │ └── react.svg # Static asset used in the UI
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Footer.jsx # App footer component
│ │ │ ├── Header.jsx # App header component
│ │ │ └── Toolbar.jsx # Contains the difficulty selector
│ │ └── test/
│ │ └── TypingTest.jsx # Core typing test logic and UI
│ ├── lib/
│ │ ├── metrics.js # Utility functions for WPM, accuracy, time formatting
│ │ └── passage.js # Passage generation logic and difficulty configuration
│ ├── pages/
│ │ └── Results.jsx # Results summary page with performance metrics
│ ├── shared/
│ │ └── exporters.js # Placeholder or utility functions used across files
│ ├── App.jsx # Main application layout and routing logic
│ ├── main.jsx # App entry point (bootstraps React DOM)
│ ├── App.css # App-wide styles
│ ├── index.css # Global CSS reset and Tailwind base
├── index.html # HTML template used by Vite
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js # PostCSS setup
├── vite.config.js # Vite configuration
├── package.json # Project metadata and scripts
├── .gitignore # Files/folders to exclude from Git
├── README.md # This file
```
---

## Technologies Used

- React 18
- React Router DOM
- Vite
- Tailwind CSS
- JavaScript (ES2020+)
- HTML5 & CSS3
- Heroku (deployment)

---

## Setup Instructions

1. **Clone the Repository**
    ```bash
    git clone https://github.com/RyanVerWey/TypingTest
    cd typing-speed-test
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Run the Development Server**
    ```bash
    npm run dev
    ```
    The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Usage Guide

1. Select a difficulty level from the dropdown (affects passage complexity).
2. Begin typing in the input field; the test starts automatically.
3. The test runs for a fixed duration (default: 120 seconds) with auto-advancing lines.
4. View live metrics: time remaining, WPM, accuracy, errors, and keystrokes.
5. Upon completion, view a summary of your performance on the results page.

*Note: Lines advance automatically; no need to press Enter.*

---

## Performance Metrics

- **WPM (Words Per Minute):** `(word count / elapsed time) * 60`
- **Accuracy:** Percentage of correct characters typed
- **Errors:** Incorrect keystrokes
- **Keystrokes:** Total keys pressed
- **Character Breakdown:** Letters, numbers, symbols
- **Timeline:** WPM sampled every 5 seconds

Metrics are stored in session storage and passed to the results page.

---

## Deployment

The app is deployed on Heroku and publicly accessible.

**Live URL:**  
[https://speedtest-b0c193f4cfb2.herokuapp.com](https://speedtest-b0c193f4cfb2.herokuapp.com)

---

## License

This project is open-source under the MIT License.

---

## Contact

Created and maintained by Ryan VerWey
For questions, feedback, or contributions:

- GitHub: [https://github.com/RyanVerWey/github.com/RyanVerWey]
- Email: ryan.w.verwey@gmail.com
