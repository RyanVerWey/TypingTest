import React from "react";

export default function Header() {
  return (
    <header className="w-full border-b border-black/5 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Typing Speed Tester</h1>
          <p className="text-xs md:text-sm opacity-70">Tailwind v3 • React • Vite</p>
        </div>
        <span className="text-xs md:text-sm opacity-70">No data leaves your browser</span>
      </div>
    </header>
  );
}