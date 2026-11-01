import { CONTENT_LEVELS, LESSONS } from "./lessons.js";

export const ROTATION_KEY = "typing-force:passage-rotation:v1";
const byId = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));
const validLevel = (level) =>
  CONTENT_LEVELS.includes(level) ? level : "foundation";
const emptyState = () => ({ remaining: [], openings: [], lastId: null });

export function createContentSource({
  random = Math.random,
  storage = null,
} = {}) {
  let state = emptyState();
  try {
    const raw = storage?.getItem(ROTATION_KEY);
    const saved = raw && raw.length < 20000 ? JSON.parse(raw) : null;
    const validIds = (ids, max) =>
      Array.isArray(ids) &&
      ids.length <= max &&
      ids.every((id) => byId.has(id)) &&
      new Set(ids).size === ids.length;
    if (
      saved &&
      validIds(saved.remaining, LESSONS.length) &&
      validIds(saved.openings, 8) &&
      (saved.lastId === null || byId.has(saved.lastId))
    ) {
      state = {
        remaining: saved.remaining,
        openings: saved.openings,
        lastId: saved.lastId,
      };
    }
  } catch {
    /* Rotation still works in memory when storage is unavailable. */
  }

  function persist() {
    try {
      storage?.setItem(ROTATION_KEY, JSON.stringify(state));
    } catch {
      /* Never interrupt a timed session for a storage failure. */
    }
  }
  function shuffle(values) {
    const shuffled = [...values];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  function freshDeck() {
    const groups = shuffle(["typing", "habits", "life"]).map((topic) =>
      shuffle(
        LESSONS.filter((lesson) => lesson.topic === topic).map(
          (lesson) => lesson.id,
        ),
      ),
    );
    // Mix all three themes while keeping each authored lesson once per deck.
    return Array.from(
      { length: Math.max(...groups.map((group) => group.length)) },
      (_, i) => groups.map((group) => group[i]).filter(Boolean),
    ).flat();
  }
  function rememberOpening(id) {
    state.openings = [
      ...state.openings.filter((previous) => previous !== id),
      id,
    ].slice(-8);
  }
  function take(count, opening) {
    const ids = [],
      used = new Set();
    while (ids.length < count) {
      const blocked = new Set([
        ...used,
        state.lastId,
        ...(opening && ids.length === 0 ? state.openings : []),
      ]);
      let index = state.remaining.findIndex((id) => !blocked.has(id));
      if (index < 0) {
        // A long benchmark may cross a deck boundary. Its already selected
        // lessons stay excluded, so the resulting passage is still unique.
        state.remaining = freshDeck().filter((id) => !used.has(id));
        index = state.remaining.findIndex((id) => !blocked.has(id));
      }
      const [id] = state.remaining.splice(index, 1);
      ids.push(id);
      used.add(id);
      state.lastId = id;
    }
    if (opening) rememberOpening(ids[0]);
    return ids;
  }
  function bestVariant(id, keys, level) {
    const lesson = byId.get(id);
    return [level, ...CONTENT_LEVELS.filter((other) => other !== level)]
      .map((variant) => ({
        id,
        text: lesson[variant],
        score: keys.filter((key) => lesson[variant].includes(key)).length,
      }))
      .reduce((best, candidate) =>
        candidate.score > best.score ? candidate : best,
      );
  }

  return {
    chunk(level, { opening = false } = {}) {
      const [id] = take(1, opening);
      persist();
      return byId.get(id)[validLevel(level)];
    },
    passage(level) {
      const ids = take(LESSONS.length, true);
      persist();
      return ids.map((id) => byId.get(id)[validLevel(level)]).join(" ");
    },
    drill(focusKeys = [], level = "flow") {
      const keys = [
        ...new Set(
          focusKeys.filter(
            (key) => typeof key === "string" && key.length === 1,
          ),
        ),
      ].slice(0, 4);
      level = validLevel(level);
      const previousLast = state.lastId;
      const ids = take(LESSONS.length, false);
      const remainingKeys = new Set(keys),
        selected = [],
        used = new Set();
      // Put passages covering the missed keys near the start, instead of
      // repeating a short list of words for the entire drill.
      while (remainingKeys.size) {
        const candidates = ids
          .filter((id) => !used.has(id))
          .map((id) => bestVariant(id, [...remainingKeys], level))
          .sort((a, b) => b.score - a.score);
        const best = candidates[0];
        if (!best?.score) break;
        selected.push(best);
        used.add(best.id);
        for (const key of remainingKeys)
          if (best.text.includes(key)) remainingKeys.delete(key);
      }
      const rest = ids
        .filter((id) => !used.has(id))
        .map((id) => bestVariant(id, keys, level));
      const ordered = [...selected, ...rest];
      const first = ordered.findIndex(
        (item) => item.id !== previousLast && !state.openings.includes(item.id),
      );
      ordered.unshift(...ordered.splice(first, 1));
      state.lastId = ordered.at(-1).id;
      rememberOpening(ordered[0].id);
      persist();
      return ordered.map((item) => item.text).join(" ");
    },
    reset() {
      state = emptyState();
      try {
        storage?.removeItem(ROTATION_KEY);
        return true;
      } catch {
        return false;
      }
    },
  };
}

let source;
function currentSource() {
  if (!source) {
    let storage;
    try {
      storage = globalThis.localStorage;
    } catch {
      /* Private browsing. */
    }
    source = createContentSource({ storage });
  }
  return source;
}
export const practiceChunk = (level, options) =>
  currentSource().chunk(level, options);
export const passage = (level) => currentSource().passage(level);
export const targetedPassage = (keys, level) =>
  currentSource().drill(keys, level);
export const resetPassageRotation = () => currentSource().reset();
