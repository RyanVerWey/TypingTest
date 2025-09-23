// ================================
// FILE: src/components/test/EnhancedTypingTest.jsx
// Enhanced typing test with real-time analytics and corrections tracking
// ================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildPassage, DIFFICULTY_OPTIONS, DIFFICULTY_LABELS } from "../../lib/passage.js";
import { computeWPM, fmtTime, buildCharStats } from "../../lib/metrics.js";
import TypingAnalytics from "../../lib/enhanced-metrics.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faGauge, 
  faBullseye, 
  faExclamationTriangle, 
  faChartLine,
  faRedo,
  faLeaf,
  faGraduationCap,
  faRocket,
  faMagicWandSparkles,
  faKeyboard
} from '@fortawesome/free-solid-svg-icons';

const TEST_SECONDS = 120;
const BUCKET = 5;

// Difficulty configuration with icons and themes
const DIFFICULTY_CONFIG = {
  beginner: {
    icon: faLeaf,
    color: 'rgb(34, 197, 94)', // green
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  student: {
    icon: faGraduationCap,
    color: 'rgb(59, 130, 246)', // blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  advanced: {
    icon: faRocket,
    color: 'rgb(168, 85, 247)', // purple
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)'
  },
  wizard: {
    icon: faMagicWandSparkles,
    color: 'rgb(239, 68, 68)', // red
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  }
};

export default function EnhancedTypingTest({ difficulty, _setDifficulty }) {
  const [lines, setLines] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [lineInput, setLineInput] = useState("");
  const [typedSoFar, setTypedSoFar] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_SECONDS);
  const [keystrokes, setKeystrokes] = useState(0);
  const [timeline, setTimeline] = useState([]);
  
  const inputRef = useRef(null);
  const tickRef = useRef(0);
  const typedRef = useRef("");
  const analyticsRef = useRef(new TypingAnalytics());
  const nav = useNavigate();

  // Keep latest typed string in a ref so the timer effect doesn't depend on it
  useEffect(() => {
    typedRef.current = typedSoFar + lineInput;
  }, [typedSoFar, lineInput]);

  // Rebuild passage when difficulty changes
  useEffect(() => {
    const p = buildPassage(difficulty);
    // Split by sentences to maintain natural breaks and prevent word wrapping
    const sentences = p.split(/(?<=[.!?])\s+/).filter(Boolean);
    setLines(sentences);
    setLineIdx(0);
    setLineInput("");
    setTypedSoFar("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(TEST_SECONDS);
    setKeystrokes(0);
    setTimeline([]);
    tickRef.current = 0;
    analyticsRef.current.reset();
  }, [difficulty]);

  // Linearized target that matches how we join completed lines (single \n)
  const targetLinearized = useMemo(() => lines.join("\n"), [lines]);

  // Derived stats over everything typed so far
  const totalTyped = typedSoFar + lineInput;

  // Enhanced accuracy calculation using real-time analytics
  const enhancedAccuracy = useMemo(() => {
    return analyticsRef.current.calculateTrueAccuracy(totalTyped, targetLinearized);
  }, [totalTyped, targetLinearized]);

  const accuracy = enhancedAccuracy.adjusted;
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

  // Enhanced keystroke handler with analytics
  function handleChange(e) {
    const v = e.target.value;
    if (!started) setStarted(true);
    
    const prevLength = lineInput.length;
    const newLength = v.length;
    const position = typedSoFar.length + newLength;
    const target = lines[lineIdx] || "";
    
    // Detect if this was a backspace/deletion
    if (newLength < prevLength) {
      // Backspace detected
      analyticsRef.current.recordKeystroke('Backspace', null, true, Date.now(), position);
    } else if (newLength > prevLength) {
      // New character typed
      const newChar = v[newLength - 1];
      const targetChar = target[newLength - 1];
      const isCorrect = newChar === targetChar;
      
      analyticsRef.current.recordKeystroke(newChar, targetChar, isCorrect, Date.now(), position);
    }
    
    setLineInput(v);
    setKeystrokes((k) => k + 1);

    // Auto-advance when line is complete
    if (v.length >= target.length) {
      advanceLine(v);
    }
  }

  // Enhanced keydown handler
  function handleKeyDown(e) {
    // Record special keys
    if (['Enter', 'Tab', 'Shift', 'Control', 'Alt'].includes(e.key)) {
      const position = typedSoFar.length + lineInput.length;
      analyticsRef.current.recordKeystroke(e.key, null, true, Date.now(), position);
    }

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

  // Enhanced finish handler with analytics
  useEffect(() => {
    if (!finished) return;

    const elapsed = TEST_SECONDS - timeLeft;
    const last = timeline[timeline.length - 1];
    const needsFinal = !last || last.t !== elapsed;

    const finalTimeline = needsFinal
      ? [...timeline, { t: elapsed, wpm: computeWPM(typedRef.current, elapsed), ts: Date.now() }]
      : timeline;

    const duration = elapsed > 0 ? elapsed : TEST_SECONDS;
    const finalWPM = computeWPM(typedRef.current, duration);

    // Get enhanced analytics
    const analytics = analyticsRef.current.getSummary();

    const payload = {
      difficulty,
      wpm: finalWPM,
      accuracy,
      enhancedAccuracy,
      errors: enhancedAccuracy.errorsCommitted || 0,
      keystrokes,
      timeline: finalTimeline,
      charStats,
      analytics, // Include full analytics
      date: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("typingTester:last", JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
    nav("/results", { state: payload, replace: true });
  }, [finished, timeLeft, difficulty, accuracy, enhancedAccuracy, keystrokes, timeline, nav, charStats]);

  function resetTest() {
    const p = buildPassage(difficulty);
    // Split by sentences to maintain natural breaks and prevent word wrapping
    const sentences = p.split(/(?<=[.!?])\s+/).filter(Boolean);
    setLines(sentences);
    setLineIdx(0);
    setLineInput("");
    setTypedSoFar("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(TEST_SECONDS);
    setKeystrokes(0);
    setTimeline([]);
    tickRef.current = 0;
    analyticsRef.current.reset();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="space-y-16">
      {/* Session progress */}
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.25)', border: '1px solid rgba(148,163,184,0.35)' }}>
        <div
          className="h-full transition-professional"
          style={{ width: `${((TEST_SECONDS - timeLeft) / TEST_SECONDS) * 100}%`, background: 'linear-gradient(90deg, rgba(59,130,246,1), rgba(147,51,234,1))' }}
        />
      </div>

      {/* Stats — high-contrast segmented bar */}
      <div className="ribbon">
        {/* Centered analytics display */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h3 className="text-sm font-medium tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              LIVE ANALYTICS
            </h3>
            <div className="w-16 h-0.5 mx-auto" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.8), rgba(147,51,234,0.8))' }}></div>
          </div>
        </div>
        
        {/* Main analytics layout with integrated graph */}
        <div className="flex items-center justify-between">
          {/* Left stats group */}
          <div className="flex items-center gap-12">
            <StatItem
              icon={faClock}
              label="Time"
              value={fmtTime(timeLeft)}
              subtext={started && !finished ? "Running" : finished ? "Complete" : "Ready"}
              status={started && !finished ? "active" : finished ? "success" : "idle"}
            />
            <div className="h-20 w-px" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
            <StatItem
              icon={faGauge}
              label="WPM"
              value={wpm}
              subtext="Speed"
              status={wpm > 60 ? "success" : wpm > 30 ? "warning" : "idle"}
            />
            <div className="h-20 w-px" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
            <StatItem
              icon={faKeyboard}
              label="Keys"
              value={keystrokes}
              subtext={`${Math.round(analyticsRef.current.analyzeRhythm().consistency)}% rhythm`}
              status="info"
            />
          </div>

          {/* Center: Live typing graph */}
          {timeline.length > 0 && (
            <div className="flex-1 max-w-xs mx-8">
              <div className="text-center mb-2">
                <span className="text-xs font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  WPM PROGRESSION
                </span>
              </div>
              <div className="h-12 w-full rounded-lg px-3 py-2 flex items-center" style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {timeline.length > 1 ? (
                  <svg viewBox="0 0 100 18" preserveAspectRatio="none" className="w-full h-full">
                    {
                      (() => {
                        const maxWpm = Math.max(...timeline.map(d => d.wpm), wpm || 1);
                        
                        // Create segments with different colors based on speed change
                        const segments = [];
                        for (let i = 1; i < timeline.length; i++) {
                          const prevWpm = timeline[i-1].wpm;
                          const currWpm = timeline[i].wpm;
                          const isIncreasing = currWpm > prevWpm;
                          const x1 = ((i-1) / Math.max(timeline.length - 1, 1)) * 100;
                          const x2 = (i / Math.max(timeline.length - 1, 1)) * 100;
                          const y1 = 18 - Math.min(16, (prevWpm / maxWpm) * 14 + 2);
                          const y2 = 18 - Math.min(16, (currWpm / maxWpm) * 14 + 2);
                          
                          segments.push(
                            <line
                              key={i}
                              x1={x1} y1={y1} x2={x2} y2={y2}
                              stroke={isIncreasing ? "#32CD32" : "#FF4500"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          );
                        }
                        
                        return segments;
                      })()
                    }
                  </svg>
                ) : (
                  <div className="w-full text-center text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Start typing...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right stats group */}
          <div className="flex items-center gap-12">
            <StatItem
              icon={faBullseye}
              label="Accuracy"
              value={`${accuracy}%`}
              subtext={enhancedAccuracy.corrections > 0 ? 
                `+${enhancedAccuracy.correctionBonus}% bonus` : 
                enhancedAccuracy.totalTyped > 0 ? 
                  `${enhancedAccuracy.correctTyped}/${enhancedAccuracy.totalTyped}` : 
                  "Ready"
              }
              status={accuracy >= 95 ? "success" : accuracy >= 85 ? "warning" : "error"}
            />
            <div className="h-20 w-px" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
            <StatItem
              icon={faExclamationTriangle}
              label="Errors"
              value={enhancedAccuracy.errorsCommitted || 0}
              subtext={enhancedAccuracy.corrections > 0 ? 
                `${enhancedAccuracy.corrections} fixed` : 
                enhancedAccuracy.totalTyped > 0 ? 
                  `${((enhancedAccuracy.errorsCommitted / Math.max(enhancedAccuracy.totalTyped, 1)) * 100).toFixed(1)}% rate` : 
                  "None"
              }
              status={enhancedAccuracy.errorsCommitted === 0 ? "success" : enhancedAccuracy.errorsCommitted < 5 ? "warning" : "error"}
            />
            <div className="h-20 w-px" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
            <StatItem
              icon={faChartLine}
              label="Flow"
              value={`${Math.round(analyticsRef.current.analyzeRhythm().consistency)}%`}
              subtext="Rhythm"
              status="info"
            />
          </div>
        </div>

      </div>

      {/* Typing passage */}
      <div className="py-8">
        <TypingPassage lines={lines} lineIdx={lineIdx} lineInput={lineInput} />
      </div>

      {/* Input field */}
      <div className="space-y-6 pt-8">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={finished}
            value={lineInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={!started ? "Click here and start typing..." : "Continue typing..."}
            className="w-full px-8 py-6 font-mono rounded-xl outline-none transition-all duration-300 glass"
            style={{ 
              height: '5rem',
              fontSize: '1.5rem',
              lineHeight: '1.4',
              color: 'rgb(var(--text))', 
              borderColor: started ? 'rgb(59, 130, 246)' : 'rgb(var(--border))', 
              borderWidth: '2px',
              background: started ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.04)',
              boxShadow: started 
                ? '0 0 24px rgba(59,130,246,0.3), inset 0 2px 4px rgba(0,0,0,0.1)' 
                : '0 6px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(0,0,0,0.1)',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word'
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button onClick={resetTest} className="btn btn-primary">
            <FontAwesomeIcon icon={faRedo} />
            <span>Reset Test</span>
          </button>
          <div className="text-sm" style={{ color: 'rgb(var(--muted))' }}>
            Enhanced analytics track corrections and typing patterns
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple, clean typing display with natural sentence flow
function TypingPassage({ lines, lineIdx, lineInput }) {
  const activePos = lineInput.length;
  const currentLine = lines[lineIdx];
  const nextLine = lines[lineIdx + 1];
  
  if (!currentLine) return null;
  
  return (
    <div className="w-full max-w-none">
      <div className="rounded-lg p-8 glass" style={{ 
        borderColor: 'rgb(var(--border))',
        borderWidth: '1px',
        background: 'rgba(255,255,255,0.02)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
      }}>
        {/* Current line being typed */}
        <div className="mb-6">
          <div 
            className="font-mono leading-relaxed break-words"
            style={{ 
              fontSize: '1.75rem', 
              lineHeight: '1.6',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              width: '100%'
            }}
          >
            {[...currentLine].map((ch, idx) => {
              const typed = lineInput[idx];
              const atCursor = idx === activePos;
              
              let className = '';
              let style = {};
              
              if (typed == null) {
                // Untyped characters
                if (idx < activePos + 10) {
                  style.color = 'rgb(var(--text))';
                  style.opacity = '0.9';
                } else {
                  style.color = 'rgb(var(--muted))';
                  style.opacity = '0.5';
                }
              } else if (typed === ch) {
                // Correct characters
                style.color = 'rgb(34, 197, 94)';
              } else {
                // Incorrect characters
                style.color = 'rgb(239, 68, 68)';
              }
              
              if (atCursor) {
                className = 'bg-blue-500 bg-opacity-20 rounded px-1';
              }
              
              return (
                <span key={idx} className={className} style={style}>
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              );
            })}
            {activePos >= currentLine.length && (
              <span 
                className="inline-block w-0.5 bg-blue-500 animate-pulse ml-1"
                style={{ height: '1.75rem' }}
              />
            )}
          </div>
        </div>

        {/* Next line preview - simple and clean */}
        {nextLine && (
          <div 
            className="font-mono leading-relaxed break-words opacity-40"
            style={{ 
              fontSize: '1.25rem', 
              lineHeight: '1.5',
              color: 'rgb(var(--muted))',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              width: '100%'
            }}
          >
            {nextLine}
          </div>
        )}
      </div>
    </div>
  );
}

// Professional stat item component
function StatItem({ icon, label, value, subtext, status = "idle" }) {
  const colors = {
    idle: { fg: 'rgba(255,255,255,0.85)', accent: 'rgba(148,163,184,0.6)' },
    active: { fg: 'rgb(59,130,246)', accent: 'rgba(59,130,246,0.8)' },
    success: { fg: 'rgb(34,197,94)', accent: 'rgba(34,197,94,0.85)' },
    warning: { fg: 'rgb(234,179,8)', accent: 'rgba(234,179,8,0.9)' },
    error: { fg: 'rgb(239,68,68)', accent: 'rgba(239,68,68,0.9)' },
    info: { fg: 'rgb(168,85,247)', accent: 'rgba(168,85,247,0.9)' },
  }[status] || { fg: 'rgba(255,255,255,0.85)', accent: 'rgba(148,163,184,0.6)' };

  return (
    <div className="text-center min-w-[120px]">
      {/* Icon with glow effect */}
      <div className="mb-3 flex justify-center">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{ 
            background: `linear-gradient(135deg, ${colors.accent}40, ${colors.accent}20)`,
            border: `1px solid ${colors.accent}60`,
            boxShadow: `0 0 20px ${colors.accent}30`
          }}
        >
          <FontAwesomeIcon icon={icon} className="text-lg" style={{ color: colors.fg }} />
        </div>
      </div>
      
      {/* Value */}
      <div className="text-2xl font-bold mb-1" style={{ color: colors.fg }}>
        {value}
      </div>
      
      {/* Label */}
      <div className="text-xs font-medium tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
        {label.toUpperCase()}
      </div>
      
      {/* Subtext */}
      <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {subtext}
      </div>
    </div>
  );
}