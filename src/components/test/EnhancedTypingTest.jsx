// ================================
// FILE: src/components/test/EnhancedTypingTest.jsx
// Enhanced typing test with real-time analytics and corrections tracking
// ================================
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
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
  // Single-block target and typed stream — no auto-advance per sentence
  const [target, setTarget] = useState("");
  const [typed, setTyped] = useState("");
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
    typedRef.current = typed;
  }, [typed]);

  // Rebuild passage when difficulty changes — flatten to a single block with proper word wrapping
  useEffect(() => {
    const p = buildPassage(difficulty);
    // Replace newlines with spaces but preserve natural word boundaries
    const block = p.replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ').trim();
    setTarget(block);
    setTyped("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(TEST_SECONDS);
    setKeystrokes(0);
    setTimeline([]);
    tickRef.current = 0;
    analyticsRef.current.reset();
  }, [difficulty]);

  // Derived stats over everything typed so far
  const totalTyped = typed;

  // Enhanced accuracy calculation using real-time analytics
  const enhancedAccuracy = useMemo(() => {
    return analyticsRef.current.calculateTrueAccuracy(totalTyped, target);
  }, [totalTyped, target]);

  const accuracy = enhancedAccuracy.adjusted;
  const wpm = computeWPM(totalTyped, TEST_SECONDS - timeLeft);

  // Character-class stats (letters / numbers / symbols)
  const charStats = useMemo(() => buildCharStats(totalTyped, target), [totalTyped, target]);

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
    let v = e.target.value;
    if (!started) setStarted(true);

    // Clamp to target length
    if (v.length > target.length) v = v.slice(0, target.length);

    const prevLength = typed.length;
    const newLength = v.length;
    const position = newLength; // position in the single stream

    // Detect if this was a backspace/deletion vs addition (record last char only)
    if (newLength < prevLength) {
      analyticsRef.current.recordKeystroke('Backspace', null, true, Date.now(), position);
    } else if (newLength > prevLength) {
      const newChar = v[newLength - 1];
      const targetChar = target[newLength - 1];
      const isCorrect = newChar === targetChar;
      analyticsRef.current.recordKeystroke(newChar, targetChar, isCorrect, Date.now(), position);
    }

    setTyped(v);
    setKeystrokes((k) => k + 1);

    if (v.length >= target.length) {
      setFinished(true);
      setTimeLeft(0);
    }
  }

  // Enhanced keydown handler
  function handleKeyDown(e) {
    // Record special keys
    if (['Enter', 'Tab', 'Shift', 'Control', 'Alt'].includes(e.key)) {
      const position = typed.length;
      analyticsRef.current.recordKeystroke(e.key, null, true, Date.now(), position);
    }
    // Enter is not required; prevent inserting unexpected characters
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }
  // No advanceLine; we type through the single target block

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
    const block = p.replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ').trim();
    setTarget(block);
    setTyped("");
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
      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200/25 dark:bg-slate-400/25 border border-slate-200/35 dark:border-slate-400/35">
        <div
          className="h-full transition-professional bg-gradient-to-r from-blue-500 to-purple-600"
          style={{ width: `${((TEST_SECONDS - timeLeft) / TEST_SECONDS) * 100}%` }}
        />
      </div>

      {/* Stats — high-contrast segmented bar */}
      <div className="ribbon">
        {/* Centered analytics display */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h3 className="text-sm font-medium tracking-wide mb-2 text-slate-700/70 dark:text-white/70">
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
            <div className="h-20 w-px bg-white/10 dark:bg-white/10"></div>
            <StatItem
              icon={faGauge}
              label="WPM"
              value={wpm}
              subtext="Speed"
              status={wpm > 60 ? "success" : wpm > 30 ? "warning" : "idle"}
            />
            <div className="h-20 w-px bg-white/10 dark:bg-white/10"></div>
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
                <span className="text-xs font-medium tracking-wider text-white/70 dark:text-white/70">
                  WPM PROGRESSION
                </span>
              </div>
              <div className="h-12 w-full rounded-lg px-3 py-2 flex items-center bg-slate-100/80 dark:bg-black/80 border border-slate-300/20 dark:border-white/10">
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
                  <div className="w-full text-center text-xs text-slate-700/50 dark:text-white/50">
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
            <div className="h-20 w-px bg-slate-300/20 dark:bg-white/10"></div>
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
            <div className="h-20 w-px bg-slate-300/20 dark:bg-white/10"></div>
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

      {/* Typing passage — single static block with row highlight */}
      <div className="py-8">
        <BlockTypingPassage target={target} typed={typed} />
      </div>

      {/* Input field */}
      <div className="space-y-6 pt-8">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={finished}
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={!started ? "Click here and start typing..." : "Continue typing..."}
            className="w-full px-8 py-6 font-mono rounded-xl outline-none transition-all duration-300 glass"
            style={{ 
              height: '6.5rem',
              fontSize: '1.5rem',
              lineHeight: '1.4',
              color: 'rgb(var(--text))', 
              borderColor: started ? 'rgb(59, 130, 246)' : 'rgb(var(--border))', 
              borderWidth: '2px',
              background: started ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.04)',
              boxShadow: started 
                ? '0 0 24px rgba(59,130,246,0.3), inset 0 2px 4px rgba(0,0,0,0.1)' 
                : '0 6px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(0,0,0,0.1)',
              wordBreak: 'normal',
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
function BlockTypingPassage({ target, typed }) {
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  const [lineTop, setLineTop] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);

  // Measure marker position to place highlight bar on the active visual row
  const measure = () => {
    const el = containerRef.current;
    const mk = markerRef.current;
    if (!el || !mk) return;
    // Use geometry from DOM rectangles for reliable pixel values
    const elRect = el.getBoundingClientRect();
    const mkRect = mk.getBoundingClientRect();
    // Height of the current line: prefer marker rect height, fall back to computed px
    let lh = mkRect.height;
    if (!lh || lh < 2) {
      const cs = window.getComputedStyle(el);
      const parsed = parseFloat(cs.lineHeight);
      if (!isNaN(parsed) && cs.lineHeight.endsWith('px')) {
        lh = parsed;
      } else {
        const fs = parseFloat(cs.fontSize) || 25.6; // approx 1.6rem default above
        lh = fs * 1.7; // mirror inline style
      }
    }
    setLineHeight(lh);
    // Top relative to the container box
    const top = mkRect.top - elRect.top + el.scrollTop;
    setLineTop(Math.max(0, top));
  };

  useLayoutEffect(() => {
    measure();
    // Re-measure after paint too
    const rId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rId);
  }, [target, typed]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const caretIndex = Math.min(typed.length, target.length);

  return (
    <div className="w-full max-w-none">
      <div className="rounded-lg p-8 glass border border-slate-200/20 dark:border-white/10 bg-slate-50/10 dark:bg-white/2 shadow-lg" style={{ 
        minHeight: '14rem'
      }}>
        <div className="relative">
          {/* Row highlight overlay */}
          <div
            className="absolute left-0 right-0 pointer-events-none rounded"
            style={{
              top: `${Math.max(0, lineTop - 3)}px`,
              height: `${lineHeight + 6}px`,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)'
            }}
          />

          {/* Text content */}
          <div
            ref={containerRef}
            className="font-mono leading-relaxed"
            style={{
              fontSize: '1.75rem',
              lineHeight: '1.8',
              wordBreak: 'keep-all',
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
              color: 'rgb(var(--text))'
            }}
          >
            {(() => {
              const nodes = [];
              const words = target.split(/(\s+)/); // Split on whitespace but keep the separators
              let charIndex = 0;
              
              // Calculate progress segments for fading with sentence buffers
              const totalChars = target.length;
              const typedChars = typed.length;
              
              // Find sentence boundaries (periods, exclamation marks, question marks)
              const sentences = target.split(/([.!?]\s+)/).filter(s => s.trim().length > 0);
              let sentenceStartIndices = [];
              let currentIndex = 0;
              for (const sentence of sentences) {
                sentenceStartIndices.push(currentIndex);
                currentIndex += sentence.length;
              }
              
              // Find current sentence and apply buffer
              let currentSentence = 0;
              for (let i = 0; i < sentenceStartIndices.length; i++) {
                if (typedChars >= sentenceStartIndices[i]) {
                  currentSentence = i;
                } else {
                  break;
                }
              }
              
              // Buffer: keep current sentence + 1 before + 1 after fully visible
              const bufferStart = Math.max(0, currentSentence - 1);
              const bufferEnd = Math.min(sentences.length - 1, currentSentence + 1);
              
              const bufferStartChar = sentenceStartIndices[bufferStart] || 0;
              const bufferEndChar = sentenceStartIndices[bufferEnd + 1] || totalChars;
              
              for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
                const word = words[wordIdx];
                const wordNodes = [];
                const wordStartIndex = charIndex;
                
                // Calculate opacity based on position relative to typed area and buffer
                let opacity = 1;
                if (wordStartIndex < typedChars - 100) {
                  // Far behind typed text: fade out
                  opacity = 0.2;
                } else if (wordStartIndex < bufferStartChar) {
                  // Before buffer: dim
                  opacity = 0.4;
                } else if (wordStartIndex >= bufferStartChar && wordStartIndex <= bufferEndChar) {
                  // In buffer zone: full visibility
                  opacity = 1;
                } else if (wordStartIndex > bufferEndChar && wordStartIndex <= bufferEndChar + 200) {
                  // Just after buffer: slightly dimmed
                  opacity = 0.7;
                } else {
                  // Far ahead: very dimmed
                  opacity = 0.3;
                }
                
                for (let i = 0; i < word.length; i++) {
                  const globalIndex = charIndex + i;
                  
                  if (globalIndex === caretIndex) {
                    // Add invisible marker for positioning
                    wordNodes.push(
                      <span key={`mk-${globalIndex}`} ref={markerRef} style={{ display: 'inline-block', width: 0, height: 0 }} />
                    );
                  }
                  
                  const ch = word[i];
                  const t = typed[globalIndex];
                  let color;
                  if (t == null) {
                    color = `rgba(var(--text-rgb), ${opacity})`;
                  } else if (t === ch) {
                    color = `rgba(34, 197, 94, ${Math.min(1, opacity + 0.2)})`;
                  } else {
                    color = `rgba(239, 68, 68, ${Math.min(1, opacity + 0.3)})`;
                  }
                  
                  // Add underline indicator for current caret position
                  const isAtCaret = globalIndex === caretIndex;
                  
                  wordNodes.push(
                    <span 
                      key={globalIndex} 
                      style={{ 
                        color, 
                        transition: 'color 0.6s ease, opacity 0.6s ease',
                        position: 'relative',
                        borderBottom: isAtCaret ? '3px solid rgb(59, 130, 246)' : 'none',
                        borderRadius: isAtCaret ? '1px' : 'none',
                        boxShadow: isAtCaret ? '0 3px 6px rgba(59, 130, 246, 0.4)' : 'none',
                        animation: isAtCaret ? 'underlineBlink 1s infinite' : 'none'
                      }}
                    >
                      {ch === ' ' ? '\u00A0' : ch}
                    </span>
                  );
                }
                
                // Wrap each word in a span to preserve word boundaries
                nodes.push(
                  <span 
                    key={`word-${wordIdx}`} 
                    style={{ 
                      display: 'inline-block', 
                      whiteSpace: /^\s+$/.test(word) ? 'pre' : 'nowrap',
                      opacity: opacity,
                      transition: 'opacity 0.6s ease'
                    }}
                  >
                    {wordNodes}
                  </span>
                );
                
                charIndex += word.length;
              }
              
              // Marker at end if caret at the end
              if (caretIndex === target.length) {
                nodes.push(
                  <span key={`mk-end`} ref={markerRef} style={{ display: 'inline-block', width: 0, height: 0 }} />
                );
                nodes.push(
                  <span 
                    key={`caret-end`} 
                    style={{ 
                      display: 'inline-block',
                      width: '0.5em',
                      height: '3px',
                      backgroundColor: 'rgb(59, 130, 246)',
                      marginLeft: '2px',
                      borderRadius: '1px',
                      animation: 'underlineBlink 1s infinite',
                      boxShadow: '0 0 6px rgba(59, 130, 246, 0.6)'
                    }} 
                  />
                );
              }
              
              return nodes;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Professional stat item component
function StatItem({ icon, label, value, subtext, status = "idle" }) {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.hasAttribute('data-theme') && 
           document.documentElement.getAttribute('data-theme') === 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.hasAttribute('data-theme') && 
                        document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(newIsDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    return () => observer.disconnect();
  }, []);
  
  const colors = {
    idle: { 
      fg: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(30,35,42,0.85)', 
      accent: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(102,115,132,0.6)' 
    },
    active: { fg: 'rgb(59,130,246)', accent: 'rgba(59,130,246,0.8)' },
    success: { fg: 'rgb(34,197,94)', accent: 'rgba(34,197,94,0.85)' },
    warning: { fg: 'rgb(234,179,8)', accent: 'rgba(234,179,8,0.9)' },
    error: { fg: 'rgb(239,68,68)', accent: 'rgba(239,68,68,0.9)' },
    info: { fg: 'rgb(168,85,247)', accent: 'rgba(168,85,247,0.9)' },
  }[status] || { 
    fg: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(30,35,42,0.85)', 
    accent: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(102,115,132,0.6)' 
  };

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
      <div className={`text-xs font-medium tracking-wider mb-1 ${isDark ? 'text-white/90' : 'text-slate-800/90'}`}>
        {label.toUpperCase()}
      </div>
      
      {/* Subtext */}
      <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-700/60'}`}>
        {subtext}
      </div>
    </div>
  );
}