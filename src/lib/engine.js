export const LEVELS = [
  {
    id: "foundation",
    name: "Foundation",
    detail: "Common words · lowercase",
    goal: 30,
  },
  {
    id: "flow",
    name: "Flow",
    detail: "Sentences · capitals · punctuation",
    goal: 45,
  },
  {
    id: "precision",
    name: "Precision",
    detail: "Numbers · dates · symbols",
    goal: 55,
  },
  {
    id: "code",
    name: "Code",
    detail: "Developer syntax · mixed case",
    goal: 60,
  },
];
const TEXT = {
  foundation: [
    "small steps build strong habits when we make time to learn something new each day",
    "the quiet morning gives us room to think and find a clear path through our work",
    "keep your hands relaxed and let each word find its own steady place on the page",
    "we can take a short walk by the river and watch the light move across the water",
    "a good idea starts with a simple question and grows when we share it with others",
    "read the next word before you reach it and give each letter the space it needs",
  ],
  flow: [
    "Good work begins with a clear question. Take your time, notice the details, and keep moving.",
    "The afternoon train arrived early. Maya closed her book, found her bag, and stepped outside.",
    "A useful habit is easy to repeat. Start small, practice often, and let progress follow.",
    "Can you keep a steady pace? Read a little ahead, relax your shoulders, and trust your practice.",
    "We learn by trying, reflecting, and trying again. A mistake is information we can use.",
  ],
  precision: [
    "On May 14, 2026, the team shipped version 3.2. Revenue rose 18%, while costs fell by $42.50.",
    "Meet at 09:30 in room #204. Bring 3 notebooks, 12 pens, and a 64 GB drive (USB-C).",
    "The order totals $128.75: 4 items at $25.00, plus $28.75 for shipping & handling.",
    "Compare Q1 (72%) with Q2 (89%). Is the difference > 10%? Yes: 89 - 72 = 17.",
    'Save the file as report_2026-11.csv; use the label "Ready" for records 101 through 125.',
  ],
  code: [
    "const score = Math.round((correct / 5) / minutes); return { score, accuracy: 98 };",
    "function greet(name) { return `Hello, ${name}!`; } const ready = items.length > 0;",
    "const result = users.filter(user => user.active).map(user => user.name);",
    'if (response.ok && count !== 0) { cache.set("status", true); count += 1; }',
    "export async function loadData(url) { const res = await fetch(url); return res.json(); }",
  ],
};
export function practiceChunk(level, random = Math.random) {
  const pool = TEXT[level] || TEXT.foundation;
  return pool[Math.floor(random() * pool.length)];
}
export function passage(level, random = Math.random) {
  const pool = [...(TEXT[level] || TEXT.foundation)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return Array.from({ length: 12 }, () => pool.join(" ")).join(" ");
}
export function createSession(target, duration) {
  return {
    target,
    duration,
    text: "",
    startedAt: null,
    endedAt: null,
    attempts: [],
    deletions: 0,
    correctedErrors: 0,
    timeline: [],
  };
}
export function elapsed(session, now) {
  return session.startedAt === null
    ? 0
    : Math.max(
        0,
        Math.min(
          session.duration,
          ((session.endedAt ?? now) - session.startedAt) / 1000,
        ),
      );
}
export function input(session, value, now) {
  if (
    session.endedAt !== null ||
    (session.startedAt !== null && elapsed(session, now) >= session.duration)
  )
    return false;
  // Append and end-delete only. Replacements and bulk input cannot inflate the score.
  if (value.length < session.text.length && session.text.startsWith(value)) {
    const removed = session.text.slice(value.length);
    session.deletions += removed.length;
    [...removed].forEach((ch, i) => {
      if (ch !== session.target[value.length + i]) session.correctedErrors++;
    });
    session.text = value;
    return true;
  }
  if (
    value.length !== session.text.length + 1 ||
    !value.startsWith(session.text) ||
    value.length > session.target.length
  )
    return false;
  session.startedAt ??= now;
  const index = session.text.length;
  session.attempts.push({
    expected: session.target[index],
    actual: value[index],
    correct: value[index] === session.target[index],
    at: now,
    index,
  });
  session.text = value;
  return true;
}
export function metrics(session, now) {
  const seconds = elapsed(session, now),
    attempts = session.attempts.length;
  const correctAttempts = session.attempts.filter((a) => a.correct).length;
  const correct = [...session.text].filter(
    (ch, i) => ch === session.target[i],
  ).length;
  const intervals = session.attempts
    .slice(1)
    .map((a, i) => a.at - session.attempts[i].at);
  const mean = intervals.length
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length
    : 0;
  const deviation = mean
    ? Math.sqrt(
        intervals.reduce((sum, n) => sum + (n - mean) ** 2, 0) /
          intervals.length,
      )
    : 0;
  return {
    seconds,
    attempts,
    correct,
    errors: attempts - correctAttempts,
    accuracy: attempts ? (correctAttempts / attempts) * 100 : null,
    finalAccuracy: session.text.length
      ? (correct / session.text.length) * 100
      : null,
    wpm: seconds >= 1 ? correct / 5 / (seconds / 60) : 0,
    rawWpm: seconds >= 1 ? attempts / 5 / (seconds / 60) : 0,
    consistency:
      intervals.length >= 20 && mean > 0
        ? Math.max(0, 100 * (1 - deviation / mean))
        : null,
    pauses: intervals.filter((n) => n > 1000).length,
    deletions: session.deletions,
    correctedErrors: session.correctedErrors,
    remainingErrors: session.text.length - correct,
  };
}
export function sample(session, now) {
  const m = metrics(session, now),
    last = session.timeline.at(-1);
  if (m.seconds >= 1 && (!last || m.seconds - last.seconds >= 1))
    session.timeline.push({
      seconds: m.seconds,
      wpm: m.wpm,
      accuracy: m.accuracy,
    });
}
export function finish(session, now) {
  if (session.startedAt === null || session.endedAt !== null) return false;
  session.endedAt = Math.min(now, session.startedAt + session.duration * 1000);
  const m = metrics(session, session.endedAt);
  if (m.seconds > 0 && session.timeline.at(-1)?.seconds !== m.seconds)
    session.timeline.push({
      seconds: m.seconds,
      wpm: m.wpm,
      accuracy: m.accuracy,
    });
  return true;
}
const group = (ch) =>
  /[a-z]/i.test(ch)
    ? "Letters"
    : /[0-9]/.test(ch)
      ? "Numbers"
      : ch === " "
        ? "Spaces"
        : "Punctuation & symbols";
export const keyName = (ch) => (ch === " " ? "Space" : ch);
export function analyze(session, now) {
  const m = metrics(session, now),
    keys = new Map(),
    pairs = new Map(),
    categories = new Map();
  session.attempts.forEach((event, i) => {
    for (const [map, label] of [
      [keys, event.expected],
      [categories, group(event.expected)],
    ]) {
      const row = map.get(label) || { label, attempts: 0, errors: 0 };
      row.attempts++;
      row.errors += Number(!event.correct);
      map.set(label, row);
    }
    const previous = session.attempts[i - 1];
    if (
      previous &&
      event.index === previous.index + 1 &&
      event.correct &&
      previous.correct
    ) {
      const label = previous.expected + event.expected,
        row = pairs.get(label) || { label, times: [] };
      row.times.push(event.at - previous.at);
      pairs.set(label, row);
    }
  });
  const weakKeys = [...keys.values()]
    .filter((k) => k.errors > 0)
    .sort((a, b) => b.errors - a.errors || b.attempts - a.attempts)
    .slice(0, 8);
  const slowPairs = [...pairs.values()]
    .filter((p) => p.times.length >= 3)
    .map((p) => ({
      label: p.label,
      samples: p.times.length,
      ms: Math.round(p.times.reduce((a, b) => a + b, 0) / p.times.length),
    }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 4);
  return {
    ...m,
    weakKeys,
    slowPairs,
    categories: [...categories.values()],
    timeline: [...session.timeline],
  };
}
export function practiceText(result) {
  const keys = result.weakKeys.slice(0, 4).map((k) => k.label);
  const words = Object.values(TEXT).flat().join(" ").split(/\s+/);
  const focus = [
    ...new Set(
      keys.flatMap((key) =>
        [
          ...new Set(words.filter((word) => key === " " || word.includes(key))),
        ].slice(0, 6),
      ),
    ),
  ];
  const seed = focus.length ? focus.join(" ") : TEXT.flow.join(" ");
  return Array.from({ length: 20 }, () => seed).join(" ");
}
