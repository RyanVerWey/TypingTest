import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Toolbar from "./components/layout/Toolbar.jsx";
import EnhancedTypingTest from "./components/test/EnhancedTypingTest.jsx";
import EnhancedResults from "./pages/EnhancedResults.jsx";

export default function App() {
  // Lift difficulty state to App level for sharing between components
  const [difficulty, setDifficulty] = useState(() => {
    try { return sessionStorage.getItem("typingTester:difficulty") || "beginner"; }
    catch { return "beginner"; }
  });

  return (
    <div className="app-container" style={{ color: 'rgb(var(--text))', background: 'rgb(var(--bg))' }}>
      {/* Hero gradient field */}
      <div className="hero-bg"></div>
      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0" style={{ opacity: 0.06 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          color: 'rgba(0,0,0,0.35)'
        }}></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          color: 'rgba(255,255,255,0.35)'
        }}></div>
      </div>

      {/* Content with proper margins */}
      <div className="relative z-10 app-container">
        <Header />
        <Toolbar difficulty={difficulty} setDifficulty={setDifficulty} />
        <main className="main-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<EnhancedTypingTest difficulty={difficulty} setDifficulty={setDifficulty} />} />
              <Route path="/results" element={<EnhancedResults />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}