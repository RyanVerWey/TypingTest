import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Toolbar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="w-full bg-white/60 dark:bg-neutral-900/60 border-b border-black/5 dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
        <button onClick={() => nav("/")} className={`px-3 py-2 rounded-xl text-sm shadow border border-black/5 dark:border-white/10 ${pathname === "/" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-white dark:bg-neutral-800"}`}>Test</button>
        <button onClick={() => nav("/results")} className={`px-3 py-2 rounded-xl text-sm shadow border border-black/5 dark:border-white/10 ${pathname === "/results" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-white dark:bg-neutral-800"}`}>Results</button>
        <div className="ml-auto text-xs opacity-70">2-minute timer • Finish early by completing passage</div>
      </div>
    </div>
  );
}