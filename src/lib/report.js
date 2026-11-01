import { keyName } from "./engine.js";
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length
    ? sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
    : null;
};
export function detailedReport(session, base) {
  const attempts = session.attempts;
  const intervals = attempts.slice(1).map((a, i) => a.at - attempts[i].at);
  const sorted = [...intervals].sort((a, b) => a - b);
  const gaps = intervals.filter((n) => n > 1000);
  const latestByPosition = new Map();
  attempts.forEach((a) => latestByPosition.set(a.index, a));
  const retainedEvents = [...latestByPosition.values()].filter(
    (a) =>
      a.index < session.text.length &&
      a.correct &&
      session.text[a.index] === a.expected,
  );
  const windows = [];
  for (let from = 0; from < base.seconds; from += 5) {
    const to = Math.min(from + 5, base.seconds),
      seconds = to - from;
    const within = (a) => {
      const t = (a.at - session.startedAt) / 1000;
      return t >= from && (t < to || (to === base.seconds && t === to));
    };
    const slice = attempts.filter(within),
      correct = retainedEvents.filter(within).length;
    windows.push({
      from,
      to,
      seconds,
      wpm: correct / 5 / (seconds / 60),
      rawWpm: slice.length / 5 / (seconds / 60),
      accuracy: slice.length
        ? (slice.filter((a) => a.correct).length / slice.length) * 100
        : null,
      attempts: slice.length,
      errors: slice.filter((a) => !a.correct).length,
    });
  }
  const fullWindows = windows.filter((w) => w.seconds >= 5);
  const keys = new Map(),
    confusions = new Map();
  let streak = 0,
    longestClean = 0,
    errors = 0,
    longestErrors = 0;
  attempts.forEach((a, i) => {
    if (a.correct) {
      streak++;
      errors = 0;
    } else {
      errors++;
      streak = 0;
      const label = `${keyName(a.expected)} → ${keyName(a.actual)}`;
      confusions.set(label, (confusions.get(label) || 0) + 1);
    }
    longestClean = Math.max(longestClean, streak);
    longestErrors = Math.max(longestErrors, errors);
    const row = keys.get(a.expected) || {
      label: a.expected,
      attempts: 0,
      errors: 0,
      times: [],
    };
    row.attempts++;
    row.errors += Number(!a.correct);
    const prev = attempts[i - 1];
    if (prev && a.index === prev.index + 1 && a.correct && prev.correct)
      row.times.push(a.at - prev.at);
    keys.set(a.expected, row);
  });
  const keyDetails = [...keys.values()]
    .map((k) => ({
      label: k.label,
      attempts: k.attempts,
      errors: k.errors,
      accuracy: (1 - k.errors / k.attempts) * 100,
      medianMs: k.times.length >= 3 ? median(k.times) : null,
      timingSamples: k.times.length,
    }))
    .sort((a, b) => b.errors - a.errors || b.attempts - a.attempts);
  const first = windows[0],
    last = windows.at(-1);
  const totalPauseMs = gaps.reduce((a, b) => a + b, 0);
  const endGap =
    session.startedAt === null
      ? 0
      : Math.max(
          0,
          (session.endedAt ?? session.startedAt + base.seconds * 1000) -
            (attempts.at(-1)?.at ?? session.startedAt),
        );
  return {
    windows,
    keyDetails,
    confusions: [...confusions]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    correctAttempts: attempts.filter((a) => a.correct).length,
    retainedCharacters: session.text.length,
    efficiency:
      attempts.length + session.deletions
        ? (base.correct / (attempts.length + session.deletions)) * 100
        : null,
    correctionRate: attempts.length
      ? (session.deletions / attempts.length) * 100
      : null,
    errorRecovery: base.errors
      ? Math.min(100, (session.correctedErrors / base.errors) * 100)
      : null,
    longestClean,
    longestErrors,
    medianInterval: median(intervals),
    p90Interval: sorted.length
      ? sorted[Math.ceil(sorted.length * 0.9) - 1]
      : null,
    longestPause: gaps.length ? Math.max(...gaps) : 0,
    pauseSeconds: totalPauseMs / 1000,
    endIdleSeconds: endGap / 1000,
    peakWpm: fullWindows.length
      ? Math.max(...fullWindows.map((w) => w.wpm))
      : null,
    paceChange:
      fullWindows.length >= 2 && last.seconds >= 5
        ? last.wpm - first.wpm
        : null,
    adaptive: session.adaptive
      ? {
          steps: [...session.adaptive.steps],
          round: session.adaptive.round,
          stage: session.adaptive.stage,
        }
      : null,
  };
}
