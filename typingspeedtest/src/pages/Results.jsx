// ================================
// FILE: src/pages/Results.jsx
// ================================
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend
} from "recharts";
import { exportPNG, exportCSV } from "../shared/exporters.js";
import { DIFFICULTY_LABELS } from "../lib/passage.js";

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

export default function Results() {
  const nav = useNavigate();
  const { state } = useLocation();
  const resultsRef = useRef(null);
  const [data] = useState(() => state || safeRead());

  useEffect(() => {
    if (!data) nav("/", { replace: true });
  }, [data, nav]);

  const {
    difficulty,
    wpm = 0,
    accuracy = 0,
    errors = 0,
    keystrokes = 0,
    timeline = [],
    date = new Date().toISOString(),
    charStats = {},
  } = data || {};

  const timelineSeries = useMemo(() => {
    const src = Array.isArray(timeline) ? timeline : [];
    const norm = src
      .map((d) => ({
        t: Number(d.t ?? d.time ?? 0),
        wpm: Number(d.wpm ?? 0),
      }))
      .filter((d) => Number.isFinite(d.t) && Number.isFinite(d.wpm));
    return norm.length ? norm : [{ t: 0, wpm: 0 }];
  }, [timeline]);

  const deriveAcc = (key) => {
    const accKey = `${key}Acc`;
    if (typeof charStats[accKey] === "number") {
      return { attempted: undefined, correct: undefined, accuracy: Math.round(charStats[accKey]) };
    }
    const bucket = charStats[key] || { attempted: 0, correct: 0 };
    return {
      attempted: bucket.attempted || 0,
      correct: bucket.correct || 0,
      accuracy: pct(bucket.correct || 0, bucket.attempted || 0),
    };
  };

  const byClass = [
    { type: "Letters", ...deriveAcc("letters") },
    { type: "Numbers", ...deriveAcc("numbers") },
    { type: "Symbols", ...deriveAcc("symbols") },
  ];

  if (!data) {
    return (
      <div className="rounded-2xl p-6 bg-white/60 dark:bg-neutral-900/60 shadow-xl">
        <p className="text-sm opacity-70">No results yet. Start a new test to see your dashboard.</p>
        <button
          onClick={() => nav("/")}
          className="mt-3 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow"
        >
          New Test
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ⬇️ Wrap EVERYTHING you want in the PNG inside this container */}
      <div ref={resultsRef} data-export-root>
        {/* KPI grid */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <KPI label="WPM" value={wpm} sub={new Date(date).toLocaleString()} />
          <KPI label="Accuracy" value={`${accuracy}%`} sub="final" />
          <KPI label="Errors" value={errors} sub={`${keystrokes} keys`} />
          <KPI label="Samples" value={timelineSeries.length} sub="every 5s" />
          <KPI label="Difficulty" value={DIFFICULTY_LABELS?.[difficulty] ?? (difficulty || "—")} sub="session" />
        </section>

        {/* WPM over time */}
        <section className="rounded-2xl p-4 dark:bg-neutral-900/60 shadow-xl mb-6">
          <h2 className="text-sm font-semibold mb-2">WPM over time</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" tickFormatter={(t) => `${t}s`} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} wpm`, "WPM"]} labelFormatter={(l) => `${l}s`} />
                <Line type="monotone" dataKey="wpm" stroke="#6366f1" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Accuracy by character type */}
        <section className="rounded-2xl p-4 dark:bg-neutral-900/60 shadow-xl mb-6">
          <h2 className="text-sm font-semibold mb-2">Accuracy by Character Type</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byClass} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(v, _, ctx) => [
                    `${v}%`,
                    `${ctx?.payload?.correct ?? 0}/${ctx?.payload?.attempted ?? 0} correct`,
                  ]}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => exportPNG(resultsRef.current)}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow hover:opacity-90"
        >
          Export PNG
        </button>
        <button
          onClick={() => exportCSV(data)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow hover:opacity-90"
        >
          Export CSV
        </button>
        <button
          onClick={() => nav("/")}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow hover:opacity-90"
        >
          New Test
        </button>
      </div>
    </div>
  );
}

function KPI({ label, value, sub }) {
  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-neutral-900 shadow border border-black/5 dark:border-white/5">
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-60">{sub}</div>
    </div>
  );
}

function safeRead() {
  try {
    const raw = sessionStorage.getItem("typingTester:last");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
