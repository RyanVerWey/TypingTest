import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildPassage, DIFFICULTY_OPTIONS, DIFFICULTY_LABELS } from "../../lib/passage.js";
import { computeWPM, fmtTime, buildCharStats } from "../../lib/metrics.js";

const TEST_SECONDS = 120;
const BUCKET = 5;

export default function TypingTest() {
  const [difficulty, setDifficulty] = useState(() => {
    try { return sessionStorage.getItem("typingTester:difficulty") || "beginner"; }
    catch { return "beginner"; }
  });

  const [lines, setLines] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [lineInput, setLineInput] = useState("");
  const [typedSoFar, setTypedSoFar] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_SECONDS);
  const [errors, setErrors] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const inputRef = useRef(null);
  const tickRef = useRef(0);
  const typedRef = useRef("");
  const nav = useNavigate();

  // Keep latest typed string in a ref so the timer effect doesn't depend on it
  useEffect(() => {
    typedRef.current = typedSoFar + lineInput;
  }, [typedSoFar, lineInput]);

  // Rebuild passage when difficulty changes
  useEffect(() => {
    const p = buildPassage(difficulty);
    const ls = p.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
    setLines(ls);
    setLineIdx(0);
    setLineInput("");
    setTypedSoFar("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(TEST_SECONDS);
    setErrors(0);
    setKeystrokes(0);
    setTimeline([]);
    tickRef.current = 0;
  }, [difficulty]);

  // Persist difficulty
  useEffect(() => {
    try {
      sessionStorage.setItem("typingTester:difficulty", difficulty);
    } catch {
      // Ignore sessionStorage errors (quota/private mode)
    }
  }, [difficulty]);

  // Linearized target that matches how we join completed lines (single \n)
  const targetLinearized = useMemo(() => lines.join("\n"), [lines]);

  // Derived stats over everything typed so far
  const totalTyped = typedSoFar + lineInput;

  const correctChars = useMemo(() => {
    let c = 0;
    const n = Math.min(totalTyped.length, targetLinearized.length);
    for (let i = 0; i < n; i++) if (totalTyped[i] === targetLinearized[i]) c++;
    return c;
  }, [totalTyped, targetLinearized]);

  const accuracy = totalTyped.length === 0 ? 100 : Math.max(0, Math.round((correctChars / totalTyped.length) * 100));
  const wpm = computeWPM(totalTyped, TEST_SECONDS - timeLeft);

  // Character-class stats (letters / numbers / symbols)
  const charStats = useMemo(() => buildCharStats(totalTyped, targetLinearized), [totalTyped, targetLinearized]);

  // Seed an initial timeline point when the test starts so a line will render
  useEffect(() => {
    if (started) {
      setTimeline(prev => (prev.length ? prev : [{ t: 0, wpm: 0, ts: Date.now() }]));
    }
  }, [started]);

  // Timer — compute elapsed inside the state updater, push timeline there
  useEffect(() => {
    if (!started || finished) return;

    const id = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        const elapsed = TEST_SECONDS - next; // AFTER this tick

        // sample every BUCKET seconds using the REF (no typing dep)
        tickRef.current += 1;
        if (tickRef.current % BUCKET === 0) {
          const typedNow = typedRef.current;
          setTimeline((arr) => [
            ...arr,
            { t: Math.min(elapsed, TEST_SECONDS), wpm: computeWPM(typedNow, elapsed), ts: Date.now() },
          ]);
        }

        if (next <= 0) {
          setFinished(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [started, finished]);

  // Handle typing for the active line
  function handleChange(e) {
    const v = e.target.value;
    if (!started) setStarted(true);
    setLineInput(v);
    setKeystrokes((k) => k + 1);

    const idx = v.length - 1;
    const target = lines[lineIdx] || "";
    if (idx >= 0 && v[idx] !== target[idx]) setErrors((e2) => e2 + 1);

    // Auto-advance when line is complete
    if (v.length >= target.length) {
      advanceLine(v);
    }
  }

  // Ignore Enter (unless the line is complete, then advance)
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const target = lines[lineIdx] || "";
      if (lineInput.length >= target.length) advanceLine(lineInput);
    }
  }

  function advanceLine(finalValueForLine) {
    const target = lines[lineIdx] || "";
    const lineToAppend = finalValueForLine.slice(0, target.length);
    setTypedSoFar((prev) => (prev ? prev + "\n" + lineToAppend : lineToAppend));
    setLineInput("");
    const next = lineIdx + 1;
    if (next >= lines.length) {
      setFinished(true);
      setTimeLeft(0);
    } else {
      setLineIdx(next);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  // On finish -> ensure last sample exists, save, and go to results
  // On finish -> ensure last sample exists, save, and go to results
useEffect(() => {
  if (!finished) return;

  const elapsed = TEST_SECONDS - timeLeft; // seconds actually elapsed
  const last = timeline[timeline.length - 1];
  const needsFinal = !last || last.t !== elapsed;

  const finalTimeline = needsFinal
    ? [...timeline, { t: elapsed, wpm: computeWPM(typedRef.current, elapsed), ts: Date.now() }]
    : timeline;

  //  Use elapsed time if user finished early, otherwise use TEST_SECONDS
  const duration = elapsed > 0 ? elapsed : TEST_SECONDS;
  const finalWPM = computeWPM(typedRef.current, duration);

  const payload = {
    difficulty,
    wpm: finalWPM,
    accuracy,
    errors,
    keystrokes,
    timeline: finalTimeline,
    charStats,
    date: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem("typingTester:last", JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
  nav("/results", { state: payload, replace: true });
}, [finished, timeLeft, difficulty, accuracy, errors, keystrokes, timeline, nav, charStats]);


  function resetTest() {
    const p = buildPassage(difficulty);
    const ls = p.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);
    setLines(ls);
    setLineIdx(0);
    setLineInput("");
    setTypedSoFar("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(TEST_SECONDS);
    setErrors(0);
    setKeystrokes(0);
    setTimeline([]);
    tickRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div>
      {/* Difficulty selector */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm opacity-70">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/10 text-sm shadow"
        >
          {DIFFICULTY_OPTIONS.map((key) => (
            <option key={key} value={key}>{DIFFICULTY_LABELS[key]}</option>
          ))}
        </select>
        <span className="text-xs opacity-60">
          {DIFFICULTY_LABELS[difficulty]} — randomized blocks each run
        </span>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI label="Time Left" value={fmtTime(timeLeft)} sub={started && !finished ? "running" : finished ? "done" : "ready"} />
        <KPI label="WPM" value={wpm} sub="live" />
        <KPI label="Accuracy" value={`${accuracy}%`} sub={`${correctChars}/${totalTyped.length}`} />
        <KPI label="Errors" value={errors} sub={`${keystrokes} keys`} />
      </section>

      {/* Passage with active-line underline indicator */}
      <section className="mb-4">
        <Passage lines={lines} lineIdx={lineIdx} lineInput={lineInput} />
      </section>

      {/* Single-line input */}
      <section className="mb-2">
        <input
          ref={inputRef}
          type="text"
          disabled={finished}
          value={lineInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={!started ? "Click and start typing… (auto-jumps to next line)" : "Type the active line…"}
          className="w-full h-12 p-4 font-mono rounded-2xl outline-none bg-white/70 dark:bg-neutral-900/70 shadow focus:ring-4 focus:ring-indigo-500/30"
        />
      </section>

      <div className="flex items-center gap-2">
        <button onClick={resetTest} className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow hover:opacity-90">
          Reset
        </button>
        <span className="text-xs opacity-70">No need to press Enter — it advances automatically.</span>
      </div>
    </div>
  );
}

// Active-line renderer with underlined next-character indicator
function Passage({ lines, lineIdx, lineInput }) {
  const activePos = lineInput.length; // next expected char index
  return (
    <div className="rounded-2xl p-6 bg-white/60 dark:bg-neutral-900/60 shadow-xl backdrop-blur">
      <div className="space-y-2">
        {lines.map((line, i) => {
          const isActive = i === lineIdx;
          if (!isActive) {
            return (
              <div key={i} className="font-mono text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                {line}
              </div>
            );
          }
          const chars = [...line];
          return (
            <div key={i} className="font-mono text-sm leading-7">
              {chars.map((ch, idx) => {
                const typed = lineInput[idx];
                const atCursor = idx === activePos;
                let cls = "";
                if (typed == null) cls = "text-neutral-500";
                else if (typed === ch) cls = "text-emerald-600";
                else cls = "text-rose-600 bg-rose-50 dark:bg-rose-900/40";
                const underline = atCursor ? " underline decoration-2 decoration-indigo-500/70" : "";
                return (
                  <span key={idx} className={`px-[1px] ${cls}${underline}`}>
                    {ch}
                  </span>
                );
              })}
              {activePos >= chars.length && (
                <span className="inline-block w-2 border-b-2 border-indigo-500/70 align-baseline" />
              )}
            </div>
          );
        })}
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
