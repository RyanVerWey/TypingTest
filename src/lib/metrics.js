// ================================
// FILE: src/lib/metrics.js
// ================================

// Compute words per minute given typed text and elapsed seconds
export function computeWPM(text, elapsedSeconds) {
  if (!elapsedSeconds || elapsedSeconds <= 0) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words / elapsedSeconds) * 60);
}

// Format time as mm:ss
export function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Build accuracy stats by character class
export function buildCharStats(typed, target) {
  const stats = {
    letters: { attempted: 0, correct: 0 },
    numbers: { attempted: 0, correct: 0 },
    symbols: { attempted: 0, correct: 0 },
  };

  const n = Math.min(typed.length, target.length);
  for (let i = 0; i < n; i++) {
    const ch = target[i];
    const typedCh = typed[i];
    const group = classifyChar(ch);
    stats[group].attempted++;
    if (typedCh === ch) stats[group].correct++;
  }

  return stats;
}

function classifyChar(ch) {
  if (/[a-zA-Z]/.test(ch)) return "letters";
  if (/[0-9]/.test(ch)) return "numbers";
  return "symbols";
}

// Utility for percent (used in Results)
export function pct(correct, attempted) {
  return attempted ? Math.round((correct / attempted) * 100) : 0;
}
