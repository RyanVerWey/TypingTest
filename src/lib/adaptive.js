import { LEVELS, practiceChunk } from "./engine.js";

export function roundPassage(level, opening = false) {
  return practiceChunk(level, { opening });
}
export function enableAdaptive(session, level) {
  const stage = Math.max(
    0,
    LEVELS.findIndex((l) => l.id === level),
  );
  session.adaptive = {
    stage,
    queuedStage: stage,
    roundEnd: session.target.length,
    round: 1,
    attemptStart: 0,
    textStart: 0,
    roundStartedAt: null,
    steps: [],
  };
  // Keep the next passage readable before the current checkpoint is reached.
  // Once shown, its text and difficulty are locked; new decisions affect the tail.
  session.target += " " + roundPassage(LEVELS[stage].id);
  return session;
}
export function advanceAdaptive(session, now) {
  const state = session.adaptive;
  if (
    !state ||
    session.text.length !== state.roundEnd ||
    session.endedAt !== null ||
    (session.startedAt !== null &&
      now - session.startedAt >= session.duration * 1000)
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
  let scheduledStage = state.stage;
  const target = Math.round(LEVELS[state.stage].goal * 0.7);
  let reason;
  if (accuracy < 90 && state.stage > 0) {
    scheduledStage--;
    reason = `A lighter ${LEVELS[scheduledStage].name} passage is queued after the text already visible.`;
  } else if (
    accuracy >= 97 &&
    wpm >= target &&
    seconds >= 3 &&
    attempts.length >= 50 &&
    state.stage < LEVELS.length - 1
  ) {
    scheduledStage++;
    reason = `Strong control. ${LEVELS[scheduledStage].name} is queued after the text already visible.`;
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
    nextLevel: LEVELS[state.queuedStage].id,
    scheduledLevel: LEVELS[scheduledStage].id,
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
  state.stage = state.queuedStage;
  state.queuedStage = scheduledStage;
  state.roundEnd = session.target.length;
  session.target += " " + roundPassage(LEVELS[scheduledStage].id);
  return step;
}
