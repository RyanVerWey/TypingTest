import { useEffect, useRef, useState } from "react";
import {
  LEVELS,
  passage,
  createSession,
  input,
  metrics,
  sample,
  finish,
  analyze,
  practiceText,
  keyName,
} from "./lib/engine";
import { readHistory, saveHistory } from "./lib/storage";
import StablePassage from "./StablePassage";
import DetailedResults from "./DetailedResults";
import { roundPassage, enableAdaptive, advanceAdaptive } from "./lib/adaptive";
import { detailedReport } from "./lib/report";
import { resetPassageRotation } from "./lib/content";

const number = (n) => (n === null ? "—" : Math.round(n));
function Chart({ points }) {
  if (points.length < 2)
    return (
      <p className="empty">Keep typing for a few seconds to see your pace.</p>
    );
  const max = Math.max(20, ...points.map((p) => p.wpm)),
    end = Math.max(1, points.at(-1).seconds);
  const line = points
    .map((p) => `${42 + (p.seconds / end) * 708},${152 - (p.wpm / max) * 126}`)
    .join(" ");
  return (
    <div className="chart">
      <svg
        viewBox="0 0 780 185"
        role="img"
        aria-label={`Speed over ${Math.round(end)} seconds. Final speed ${Math.round(points.at(-1).wpm)} words per minute.`}
      >
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line
              x1="42"
              x2="750"
              y1={152 - t * 126}
              y2={152 - t * 126}
              className="grid-line"
            />
            <text x="30" y={156 - t * 126} textAnchor="end">
              {Math.round(max * t)}
            </text>
          </g>
        ))}
        <polyline
          points={line}
          fill="none"
          className="speed-line"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text x="42" y="177">
          0s
        </text>
        <text x="750" y="177" textAnchor="end">
          {Math.round(end)}s
        </text>
      </svg>
    </div>
  );
}
function Metric({ value, label }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
function Results({ result, onRepeat, onDrill, history }) {
  const enough = result.attempts >= 50 && result.seconds >= 15;
  const previous =
    !result.detail.adaptive &&
    history.find(
      (r) =>
        r.id !== result.id &&
        r.level === result.level &&
        r.duration === result.duration &&
        r.drill === result.drill &&
        !r.adaptive,
    );
  const focus = result.weakKeys
    .slice(0, 3)
    .map((k) => keyName(k.label))
    .join(", ");
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "typing-force-result.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="results" aria-labelledby="result-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            SESSION COMPLETE ·{" "}
            {result.detail.adaptive
              ? "ADAPTIVE PRACTICE"
              : result.drill
                ? "TARGETED PRACTICE"
                : LEVELS.find((l) => l.id === result.level)?.name.toUpperCase()}
          </p>
          <h1 id="result-heading" tabIndex="-1">
            Your session, unpacked.
          </h1>
          <p>
            {Math.round(result.seconds)} seconds of practice. Here’s what to
            work on next.
          </p>
        </div>
        <button className="primary" onClick={onRepeat}>
          Try again <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="result-metrics">
        <Metric value={number(result.wpm)} label="Correct WPM" />
        <Metric
          value={`${number(result.accuracy)}%`}
          label="Attempt accuracy"
        />
        <Metric value={number(result.consistency)} label="Rhythm / 100" />
        <Metric value={result.errors} label="Mistyped characters" />
      </div>
      <nav className="report-navigation" aria-label="Result sections">
        <a href="#psychology-title">Psychology & learning</a>
        <a href="#full-breakdown">Full metrics breakdown</a>
        <button onClick={onDrill}>Start targeted practice →</button>
      </nav>
      {previous && (
        <p className="comparison">
          {result.wpm >= previous.wpm ? "+" : ""}
          {Math.round(result.wpm - previous.wpm)} WPM versus your last{" "}
          {result.duration}s{" "}
          {result.drill
            ? "drill"
            : LEVELS.find((l) => l.id === result.level)?.name}{" "}
          session. Compare like-for-like conditions.
        </p>
      )}
      {result.challenge && !result.detail.adaptive && (
        <p className="notice">
          {result.wpm >= result.goal && result.accuracy >= 97
            ? "Challenge met."
            : "Keep practicing."}{" "}
          Your target was {result.goal} correct WPM with at least 97% attempt
          accuracy.
        </p>
      )}
      <div className="report-grid">
        <section>
          <div className="section-heading small">
            <h2>Your pace</h2>
            <span>Correct words per minute</span>
          </div>
          <Chart points={result.timeline} />
        </section>
        <section className="practice-plan">
          <p className="eyebrow">YOUR NEXT 5 MINUTES</p>
          <h2>
            {result.accuracy < 97
              ? "Make accuracy your foundation."
              : result.consistency !== null && result.consistency < 55
                ? "Find a steadier rhythm."
                : "Build speed in small steps."}
          </h2>
          <ol>
            <li>
              <strong>1 minute · Reset</strong>
              <span>
                Relax your hands. Try the same level at a comfortable pace.
              </span>
            </li>
            <li>
              <strong>2 minutes · Focus</strong>
              <span>
                {focus
                  ? `Practice ${focus} in real words. Aim for 97% accuracy before adding speed.`
                  : "Read one word ahead and keep your movement even. Aim for 97% accuracy."}
              </span>
            </li>
            <li>
              <strong>2 minutes · Repeat</strong>
              <span>
                Repeat your original test. Compare accuracy first, then correct
                WPM.
              </span>
            </li>
          </ol>
          <button className="primary" onClick={onDrill}>
            Practice {focus ? "my problem keys" : "my rhythm"}{" "}
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
      <div className="report-grid">
        <section>
          <p className="eyebrow">WHERE TO FOCUS</p>
          <h2>Make the difficult keys familiar.</h2>
          {result.weakKeys.length ? (
            <div className="key-list">
              {result.weakKeys.map((k) => (
                <div key={k.label}>
                  <kbd>{keyName(k.label)}</kbd>
                  <span>
                    <strong>
                      {k.errors} {k.errors === 1 ? "miss" : "misses"}
                    </strong>
                    <small>
                      {k.attempts} attempts ·{" "}
                      {Math.round((1 - k.errors / k.attempts) * 100)}% correct
                    </small>
                  </span>
                  <meter
                    min="0"
                    max={k.attempts}
                    value={k.errors}
                    aria-label={`${keyName(k.label)} mistakes`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">
              No mistyped characters in this session. Try a longer test or the
              next level to explore your limits.
            </p>
          )}
          <h3>Character breakdown</h3>
          <div className="category-list">
            {result.categories.map((c) => (
              <div key={c.label}>
                <span>
                  {c.label}
                  <small>{c.attempts} attempts</small>
                </span>
                <strong>
                  {Math.round((1 - c.errors / c.attempts) * 100)}%
                </strong>
              </div>
            ))}
          </div>
        </section>
        <section>
          <p className="eyebrow">PATTERNS, WITH CONTEXT</p>
          <h2>Your typing style, this time.</h2>
          {!enough ? (
            <p className="notice">
              A small sample: type for at least 15 seconds and attempt 50
              characters for a more useful style observation.
            </p>
          ) : (
            <p>
              {result.deletions / result.attempts > 0.12
                ? "You revised frequently in this session. Corrections were a noticeable part of your typing process."
                : result.accuracy >= 97
                  ? "You kept mistakes low in this session. This was an accuracy-focused performance."
                  : "Your pace came with some mistakes. A slightly slower pass may produce more correct text per minute."}
            </p>
          )}
          <dl className="observations">
            <div>
              <dt>Corrections</dt>
              <dd>
                {result.deletions} deleted characters, including{" "}
                {result.correctedErrors} incorrect characters.
              </dd>
            </div>
            <div>
              <dt>Pauses</dt>
              <dd>
                {result.pauses} gaps longer than one second between character
                attempts.
              </dd>
            </div>
            <div>
              <dt>Rhythm</dt>
              <dd>
                {result.consistency === null
                  ? "At least 21 character attempts are needed to estimate timing consistency."
                  : `${Math.round(result.consistency)}/100 timing consistency, including pauses. This depends on the passage and input device.`}
              </dd>
            </div>
          </dl>
          <h3>Slowest repeated pairs</h3>
          {result.slowPairs.length ? (
            <ul className="pair-list">
              {result.slowPairs.map((p) => (
                <li key={p.label}>
                  <kbd>{p.label.replaceAll(" ", "␣")}</kbd>
                  <span>
                    {p.ms} ms average{" "}
                    <small>{p.samples} correct transitions</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              More repetitions needed. Pairs appear after three correct
              transitions.
            </p>
          )}
        </section>
      </div>
      <DetailedResults result={result} />
      <details className="methodology">
        <summary>How your results are calculated</summary>
        <p>
          Correct WPM = characters still correct in your final text ÷ 5 ÷
          elapsed minutes. Raw WPM counts all character attempts, including
          retyped characters. Attempt accuracy = correct attempts ÷ all
          attempts; deleting a mistake never erases it from this measure. Final
          text accuracy only evaluates the text left on screen. Spaces and
          punctuation count as characters.
        </p>
        <p>
          The timer starts on your first character and includes pauses,
          corrections, and time away from the tab. Rhythm is 100 × (1 − standard
          deviation ÷ mean interval), bounded at zero, across character-attempt
          intervals. It is a descriptive score, not a validated psychological
          measure.
        </p>
        <p>
          Raw speed: {number(result.rawWpm)} WPM · Final text accuracy:{" "}
          {number(result.finalAccuracy)}% · Uncorrected characters:{" "}
          {result.remainingErrors}. Local practice targets are goals, not
          population percentiles or certifications.
        </p>
      </details>
      <div className="actions">
        <button onClick={download}>Download result</button>
        <span className="muted">
          Results stay in this browser. No account required.
        </span>
      </div>
    </section>
  );
}
export default function App() {
  const [level, setLevel] = useState("foundation"),
    [duration, setDuration] = useState(60),
    [challenge, setChallenge] = useState(false);
  const [history, setHistory] = useState(readHistory),
    [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("typing-force:theme") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });
  const [adaptive, setAdaptive] = useState(true);
  const session = useRef(null);
  if (!session.current)
    session.current = enableAdaptive(
      createSession(roundPassage("foundation", true), 60),
      "foundation",
    );
  const inputRef = useRef(null),
    completeRef = useRef(null);
  const [tick, setTick] = useState(0),
    [result, setResult] = useState(null),
    [drill, setDrill] = useState(false),
    [notice, setNotice] = useState("");
  const current = session.current,
    m = metrics(current, tick),
    running = current.startedAt !== null && current.endedAt === null;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("typing-force:theme", theme);
    } catch {
      /* Session-only theme remains usable. */
    }
  }, [theme]);
  function complete(now) {
    if (!finish(session.current, now)) return;
    const base = analyze(session.current, now);
    const final = {
      ...base,
      detail: detailedReport(session.current, base),
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      level,
      duration,
      drill,
      challenge,
      goal: LEVELS.find((l) => l.id === level).goal,
    };
    const next = [
      {
        id: final.id,
        date: final.date,
        level,
        duration,
        drill,
        adaptive: Boolean(session.current.adaptive),
        wpm: final.wpm,
        accuracy: final.accuracy,
      },
      ...history,
    ].slice(0, 50);
    setHistory(next);
    if (!saveHistory(next))
      setNotice(
        "Browser storage is unavailable. This result will last until you close the page.",
      );
    setResult(final);
    setTick(now);
  }
  completeRef.current = complete;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const now = performance.now();
      sample(session.current, now);
      setTick(now);
      if (metrics(session.current, now).seconds >= session.current.duration)
        completeRef.current(now);
    }, 100);
    const catchUp = () => {
      const now = performance.now();
      if (metrics(session.current, now).seconds >= session.current.duration)
        completeRef.current(now);
    };
    document.addEventListener("visibilitychange", catchUp);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", catchUp);
    };
  }, [running]);
  useEffect(() => {
    if (result) document.getElementById("result-heading")?.focus();
  }, [result]);
  function reset(
    nextLevel = level,
    nextDuration = duration,
    target = null,
    nextAdaptive = adaptive,
  ) {
    const useAdaptive = nextAdaptive && !target;
    session.current = createSession(
      target ||
        (useAdaptive ? roundPassage(nextLevel, true) : passage(nextLevel)),
      nextDuration,
    );
    if (useAdaptive) enableAdaptive(session.current, nextLevel);
    setAdaptive(useAdaptive);
    setLevel(nextLevel);
    setDuration(nextDuration);
    setDrill(Boolean(target));
    setResult(null);
    setNotice("");
    // Restart also needs a render before the first key, when every other
    // setting is unchanged. The new session has no start time yet.
    setTick(performance.now());
    setShowHistory(false);
  }
  function change(e) {
    const now = performance.now();
    if (
      current.startedAt !== null &&
      metrics(current, now).seconds >= duration
    ) {
      complete(now);
      return;
    }
    if (!input(current, e.target.value, now)) {
      setNotice(
        "Type one character at a time at the end of the passage. Paste and text replacement are disabled.",
      );
      e.target.value = current.text;
    } else {
      setNotice("");
      sample(current, now);
      setTick(now);
      if (current.adaptive) advanceAdaptive(current, now);
      else if (current.text.length === current.target.length) complete(now);
    }
  }
  const activeLevel = LEVELS.find((l) => l.id === level);
  return (
    <div className="app-shell">
      <header>
        <a className="brand" href="/" aria-label="Typing Force home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/brand/mark.svg" alt="" width="43" height="43" />
          </span>
          <span>
            TYPING<span className="brand-light">FORCE</span>
            <small>TYPE. LEARN. REPEAT.</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button
            aria-pressed={showHistory}
            onClick={() => setShowHistory(!showHistory)}
          >
            Progress <span className="count">{history.length}</span>
          </button>
          <button
            className="theme-button"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "◐" : "◑"}
          </button>
          <a className="portfolio-link" href="https://ryanverwey.dev">
            By Ryan VerWey <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <main>
        {showHistory && (
          <section className="history" aria-labelledby="history-title">
            <div className="section-heading small">
              <div>
                <p className="eyebrow">YOUR PRACTICE LOG</p>
                <h2 id="history-title">
                  Progress is built one session at a time.
                </h2>
              </div>
              <button onClick={() => setShowHistory(false)}>Close</button>
            </div>
            {history.length ? (
              <>
                <div
                  className="table-wrap"
                  tabIndex="0"
                  role="region"
                  aria-label="Saved practice sessions"
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Practice</th>
                        <th>Length</th>
                        <th>WPM</th>
                        <th>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((h) => (
                        <tr key={h.id}>
                          <td>{new Date(h.date).toLocaleDateString()}</td>
                          <td>
                            {h.adaptive
                              ? "Adaptive journey"
                              : h.drill
                                ? "Targeted drill"
                                : LEVELS.find((l) => l.id === h.level)?.name ||
                                  h.level}
                          </td>
                          <td>{h.duration}s</td>
                          <td>{Math.round(h.wpm)}</td>
                          <td>{Math.round(h.accuracy)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="muted">
                  Showing the latest {Math.min(10, history.length)} of{" "}
                  {history.length} saved sessions. Up to 50 stay on this device.
                </p>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete all typing history saved in this browser?",
                      )
                    ) {
                      if (saveHistory([])) {
                        setHistory([]);
                        if (!resetPassageRotation())
                          setNotice(
                            "Scores cleared. Passage rotation could not be cleared; use browser site settings to remove it.",
                          );
                      } else
                        setNotice(
                          "Unable to clear browser storage. Please clear site data in browser settings.",
                        );
                    }
                  }}
                >
                  Clear local history
                </button>
              </>
            ) : (
              <p className="empty">
                Your first completed test will appear here. No sign-up, no
                leaderboard pressure.
              </p>
            )}
          </section>
        )}
        {notice && (
          <p role="status" className="notice">
            {notice}
          </p>
        )}
        {result ? (
          <Results
            result={result}
            history={history}
            onRepeat={() => reset()}
            onDrill={() => reset(level, 60, practiceText(result))}
          />
        ) : (
          <>
            <section className="intro">
              <div className="intro-copy">
                <p className="eyebrow intro-label">YOUR KEYBOARD. YOUR PACE.</p>
                <h1>
                  Make every
                  <br />
                  <span>key count.</span>
                </h1>
                <p>
                  Find your rhythm. Fix the keys that trip you up. A few focused
                  minutes is a good place to start.
                </p>
              </div>
              <div className="brand-poster">
                <img
                  className="brand-art"
                  src="/brand/typing-force-keyboard.webp"
                  width="1000"
                  height="523"
                  alt="Typing Force: Make every key count. A green and ivory mechanical keyboard."
                  fetchPriority="high"
                />
                <span className="practice-stamp" aria-hidden="true">
                  FIND YOUR
                  <strong>
                    OWN
                    <br />
                    RHYTHM.
                  </strong>
                </span>
              </div>
            </section>
            <section className="practice" aria-label="Typing practice">
              <div className="mode-controls">
                <fieldset disabled={running}>
                  <legend>Practice mode</legend>
                  <div className="segments">
                    <button
                      aria-pressed={adaptive}
                      onClick={() => reset(level, duration, null, true)}
                    >
                      Adaptive journey
                    </button>
                    <button
                      aria-pressed={!adaptive}
                      onClick={() => reset(level, duration, null, false)}
                    >
                      Fixed benchmark
                    </button>
                  </div>
                </fieldset>
                <p>
                  {adaptive
                    ? "Difficulty grows with your control, one completed passage at a time."
                    : "One level throughout. Best for comparing scores over time."}
                </p>
              </div>
              <div className="controls">
                <fieldset disabled={running}>
                  <legend>
                    {adaptive ? "Starting level" : "Practice level"}
                  </legend>
                  <div className="segments levels">
                    {LEVELS.map((l, i) => (
                      <button
                        key={l.id}
                        aria-pressed={level === l.id}
                        title={l.detail}
                        onClick={() => reset(l.id, duration)}
                        data-level={l.id}
                      >
                        <span className="level-number">0{i + 1}</span>
                        {l.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset disabled={running}>
                  <legend>Duration</legend>
                  <div className="segments">
                    {[15, 30, 60, 120].map((d) => (
                      <button
                        key={d}
                        aria-pressed={duration === d}
                        onClick={() => reset(level, d)}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="session-meta">
                <span>
                  {adaptive
                    ? `${LEVELS[current.adaptive.stage].name} · Round ${current.adaptive.round}`
                    : drill
                      ? "Targeted drill · drawn from your problem keys"
                      : activeLevel.detail}
                </span>
                {!adaptive && (
                  <label>
                    <input
                      type="checkbox"
                      checked={challenge}
                      disabled={running}
                      onChange={(e) => setChallenge(e.target.checked)}
                    />{" "}
                    Challenge target{" "}
                    {challenge && <strong>{activeLevel.goal} WPM · 97%</strong>}
                  </label>
                )}
              </div>
              <div
                className="live-metrics"
                aria-label="Live measurements"
                data-time-low={running && duration - m.seconds <= 10}
              >
                <Metric
                  value={m.seconds < 1 ? "—" : number(m.wpm)}
                  label="WPM"
                />
                <Metric
                  value={m.accuracy === null ? "—" : `${number(m.accuracy)}%`}
                  label="Accuracy"
                />
                <Metric
                  value={`${Math.ceil(duration - m.seconds)}`}
                  label="Seconds left"
                />
                <div className="session-state">
                  <span className="status-dot" />
                  {running
                    ? "You’re on the clock"
                    : "Your first key starts the clock"}
                </div>
              </div>
              {adaptive && (
                <div className="adaptive-status" role="status">
                  <strong>
                    {current.adaptive.steps.at(-1)?.reason ||
                      "Reach 97% accuracy and a comfortable pace to unlock the next level."}
                  </strong>
                  <span>
                    {current.adaptive.stage < 3
                      ? `Read ahead: ${LEVELS[current.adaptive.queuedStage].name} ready · Next goal: ${Math.round(LEVELS[current.adaptive.stage].goal * 0.7)}+ correct WPM`
                      : "Top level · reinforce precise, steady typing"}
                  </span>
                </div>
              )}
              <div className="typing-surface">
                <StablePassage
                  key={`${level}-${duration}-${adaptive}-${drill}`}
                  target={current.target}
                  typed={current.text}
                />
                <label className="input-label" htmlFor="typing-input">
                  {running
                    ? "Keep going. Accuracy before speed."
                    : "Click here and start typing. The timer starts with your first key."}
                </label>
                <textarea
                  id="typing-input"
                  ref={inputRef}
                  value={current.text}
                  onChange={change}
                  onPaste={(e) => {
                    e.preventDefault();
                    setNotice(
                      "Paste is disabled so results reflect typed input.",
                    );
                  }}
                  onDrop={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      reset();
                    }
                  }}
                  onSelect={(e) => {
                    const el = e.target;
                    if (
                      el.selectionStart !== el.value.length ||
                      el.selectionEnd !== el.value.length
                    )
                      el.setSelectionRange(el.value.length, el.value.length);
                  }}
                  spellCheck="false"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  aria-describedby="typing-help accessible-passage"
                  placeholder="Type the passage here…"
                  rows="2"
                />
                <p id="accessible-passage" className="sr-only">
                  Passage: {current.target.slice(0, 2200)}
                </p>
                <div
                  className="time-track"
                  role="progressbar"
                  aria-label="Elapsed test time"
                  aria-valuemin="0"
                  aria-valuemax={duration}
                  aria-valuenow={Math.floor(m.seconds)}
                >
                  <span
                    style={{ transform: `scaleX(${m.seconds / duration})` }}
                  />
                </div>
              </div>
              <div className="test-footer">
                <p id="typing-help">
                  <kbd>esc</kbd> restart <span>·</span> Backspace to correct{" "}
                  <span>·</span> Timer includes pauses
                </p>
                <button
                  onClick={() => {
                    reset();
                    inputRef.current?.focus();
                  }}
                  aria-label="Restart typing test"
                >
                  ↻ <span>Restart</span>
                </button>
              </div>
            </section>
            <section className="practice-notes" aria-label="Practice tips">
              <div className="home-keys" aria-hidden="true">
                <kbd>F</kbd>
                <kbd>J</kbd>
              </div>
              <div>
                <h2>Small sessions. Useful habits.</h2>
                <p>
                  Relax your hands and read a word ahead. When you finish, your
                  missed keys become your next drill.
                </p>
              </div>
              <p className="privacy-note">
                <strong>Just you and the keys.</strong>No login. No leaderboard.
                Your practice stays on this device.
              </p>
            </section>
          </>
        )}
      </main>
      <footer>
        <span>
          Typing Force <span className="muted">/</span> Built for deliberate
          practice.
        </span>
        <span>Private by default. Saved on your device.</span>
        <a href="https://github.com/RyanVerWey/TypingTest">View source ↗</a>
      </footer>
    </div>
  );
}
