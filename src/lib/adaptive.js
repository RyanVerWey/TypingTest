import { LEVELS, passage } from "./engine.js";

export function roundPassage(level) {
  const words = passage(level).split(" ");
  let text = "";
  for (const word of words) {
    text += (text ? " " : "") + word;
    if (text.length >= 85) break;
  }
  return text;
}
export function enableAdaptive(session, level) {
  session.adaptive = {
    stage: Math.max(
      0,
      LEVELS.findIndex((l) => l.id === level),
    ),
    round: 1,
    attemptStart: 0,
    textStart: 0,
    roundStartedAt: null,
    steps: [],
  };
  return session;
}
export function advanceAdaptive(session, now) {
  const state = session.adaptive;
  if (
    !state ||
    session.text.length !== session.target.length ||
    session.endedAt !== null
  )
    return null;
  const attempts = session.attempts.slice(state.attemptStart);
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length ? (correct / attempts.length) * 100 : 0;
  const seconds =
    (now - (state.roundStartedAt ?? session.startedAt ?? now)) / 1000;
  const retained = [...session.text.slice(state.textStart)].filter(
    (ch, i) => ch === session.target[state.textStart + i],
  ).length;
  const wpm = seconds > 0 ? retained / 5 / (seconds / 60) : 0;
  const previousStage = state.stage;
  const target = Math.round(LEVELS[state.stage].goal * 0.7);
  let reason;
  if (accuracy < 90 && state.stage > 0) {
    state.stage--;
    reason = "A lighter passage to rebuild accuracy.";
  } else if (
    accuracy >= 97 &&
    wpm >= target &&
    seconds >= 3 &&
    attempts.length >= 50 &&
    state.stage < LEVELS.length - 1
  ) {
    state.stage++;
    reason = "Strong control. A new layer of difficulty is ready.";
  } else if (accuracy >= 97 && state.stage === LEVELS.length - 1) {
    reason = "Top level. Keep your accuracy while building a steadier pace.";
  } else {
    reason =
      accuracy < 97
        ? "Stay at this level and aim for 97% accuracy."
        : `Keep building toward ${target} correct WPM before the next level.`;
  }
  const step = {
    round: state.round,
    level: LEVELS[previousStage].id,
    nextLevel: LEVELS[state.stage].id,
    accuracy,
    wpm,
    seconds,
    at: (now - session.startedAt) / 1000,
    reason,
  };
  state.steps.push(step);
  state.round++;
  state.attemptStart = session.attempts.length;
  state.textStart = session.text.length;
  state.roundStartedAt = now;
  session.target += " " + roundPassage(LEVELS[state.stage].id);
  return step;
}
