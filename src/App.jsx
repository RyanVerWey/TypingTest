import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Toolbar from "./components/layout/Toolbar.jsx";
import TypingTest from "./components/test/TypingTest.jsx";
import Results from "./pages/Results.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-neutral-900 dark:to-neutral-950 text-neutral-900 dark:text-neutral-50 flex flex-col">
      <Header />
      <Toolbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-6">
        <Routes>
          <Route path="/" element={<TypingTest />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}