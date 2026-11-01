import test from "node:test";
import assert from "node:assert/strict";
import { LESSONS, CONTENT_LEVELS } from "../src/lib/lessons.js";
import { createContentSource, ROTATION_KEY } from "../src/lib/content.js";
import { createSession, input } from "../src/lib/engine.js";
import {
  roundPassage,
  enableAdaptive,
  advanceAdaptive,
} from "../src/lib/adaptive.js";

const variants = LESSONS.flatMap((lesson) =>
  CONTENT_LEVELS.map((level) => ({
    id: lesson.id,
    topic: lesson.topic,
    level,
    text: lesson[level],
  })),
).sort((a, b) => b.text.length - a.text.length);
function decode(text) {
  const result = [];
  while (text) {
    const match = variants.find(
      (item) => text === item.text || text.startsWith(item.text + " "),
    );
    assert.ok(match, `Unknown or truncated passage: ${text.slice(0, 80)}`);
    result.push(match);
    text = text.slice(match.text.length + 1);
  }
  return result;
}
function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

test("lesson library has 240 distinct, complete, typeable variants and all three themes", () => {
  assert.equal(LESSONS.length, 60);
  assert.equal(new Set(LESSONS.map((lesson) => lesson.id)).size, 60);
  assert.equal(
    new Set(variants.map((item) => item.text.toLowerCase())).size,
    240,
  );
  for (const topic of ["typing", "habits", "life"])
    assert.equal(LESSONS.filter((lesson) => lesson.topic === topic).length, 20);
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  for (const lesson of LESSONS) {
    for (const level of CONTENT_LEVELS) {
      assert.match(lesson[level], /^[\x20-\x7e]+$/);
      assert.ok(lesson[level].length >= 65 && lesson[level].length <= 210);
    }
    assert.match(lesson.foundation, /^[a-z ]+\.$/);
    assert.match(lesson.precision, /\d/);
    assert.doesNotThrow(() => new AsyncFunction(lesson.code));
  }
  const beginnerLetters = new Set(
    LESSONS.map((lesson) => lesson.foundation).join(""),
  );
  assert.ok(
    [..."abcdefghijklmnopqrstuvwxyz"].every((letter) =>
      beginnerLetters.has(letter),
    ),
  );
});

test("adaptive selection exhausts the full deck and mixes themes, even with constant randomness", () => {
  for (const random of [() => 0, () => 0.999999]) {
    const source = createContentSource({ random });
    let previous;
    for (let cycle = 0; cycle < 5; cycle++) {
      const ids = [],
        topics = [];
      for (let i = 0; i < LESSONS.length; i++) {
        const [item] = decode(source.chunk(CONTENT_LEVELS[i % 4]));
        assert.notEqual(item.id, previous);
        previous = item.id;
        ids.push(item.id);
        topics.push(item.topic);
      }
      assert.equal(new Set(ids).size, 60);
      for (let i = 0; i < topics.length; i += 3)
        assert.equal(new Set(topics.slice(i, i + 3)).size, 3);
    }
  }
});

test("fixed benchmarks contain every lesson once, including when a partly used deck rolls over", () => {
  const source = createContentSource({ random: () => 0 });
  for (let i = 0; i < 17; i++) source.chunk("flow");
  for (const level of CONTENT_LEVELS) {
    const text = source.passage(level),
      entries = decode(text);
    assert.ok(text.length > 4000);
    assert.equal(entries.length, 60);
    assert.equal(new Set(entries.map((item) => item.id)).size, 60);
    assert.ok(entries.every((item) => item.level === level));
  }
});

test("recent opening lessons stay different across modes, level changes, and page reloads", () => {
  const storage = memoryStorage(),
    recent = [];
  for (let i = 0; i < 80; i++) {
    const source = createContentSource({ storage, random: () => 0 });
    const level = CONTENT_LEVELS[i % 4];
    const text =
      i % 3 === 0
        ? source.passage(level)
        : i % 3 === 1
          ? source.chunk(level, { opening: true })
          : source.drill(["q", "?"], level);
    const first = decode(text)[0].id;
    assert.ok(!recent.slice(-8).includes(first), `Repeated opening: ${first}`);
    recent.push(first);
  }
  assert.ok(storage.getItem(ROTATION_KEY).length < 10000);
  assert.deepEqual(
    Object.keys(JSON.parse(storage.getItem(ROTATION_KEY))).sort(),
    ["lastId", "openings", "remaining"],
  );
});

test("targeted drills use varied full passages and bring every supported focus key near the start", () => {
  const source = createContentSource({ random: () => 0 });
  for (const keys of [
    ["q", "7", "?", "{"],
    ["/", "&", "%", "$"],
    ["Q", " ", "z", "."],
    [],
  ]) {
    const text = source.drill(keys, "foundation"),
      entries = decode(text);
    assert.equal(entries.length, 60);
    assert.equal(new Set(entries.map((item) => item.id)).size, 60);
    const firstPassages = entries
      .slice(0, 5)
      .map((item) => item.text)
      .join(" ");
    for (const key of keys)
      assert.ok(firstPassages.includes(key), `Missing focused key: ${key}`);
    assert.ok(text.length > 4000);
  }
});

test("bad or unavailable rotation storage cannot break practice or allow adjacent repeats", () => {
  for (const raw of [
    "{broken",
    "null",
    '{"remaining":["unknown"],"openings":[],"lastId":null}',
    "x".repeat(25000),
  ]) {
    const storage = memoryStorage();
    storage.setItem(ROTATION_KEY, raw);
    const source = createContentSource({ storage, random: () => 0 });
    assert.notEqual(
      decode(source.chunk("foundation"))[0].id,
      decode(source.chunk("foundation"))[0].id,
    );
  }
  const storage = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
  };
  const source = createContentSource({ storage, random: () => 0 });
  const ids = Array.from(
    { length: 60 },
    () => decode(source.chunk("flow"))[0].id,
  );
  assert.equal(new Set(ids).size, 60);
});

test("clearing practice history can clear the persisted passage rotation too", () => {
  const storage = memoryStorage(),
    source = createContentSource({ storage });
  source.passage("flow");
  assert.ok(storage.getItem(ROTATION_KEY));
  assert.equal(source.reset(), true);
  assert.equal(storage.getItem(ROTATION_KEY), null);
  assert.equal(decode(source.passage("flow")).length, 60);
});

test("lesson-backed adaptive queues preserve visible text and never append the previous lesson", () => {
  const session = enableAdaptive(
    createSession(roundPassage("foundation", true), 120),
    "foundation",
  );
  let now = 0;
  for (let i = 0; i < 6; i++) {
    const before = session.target;
    while (session.text.length < session.adaptive.roundEnd) {
      assert.equal(
        input(session, session.text + session.target[session.text.length], now),
        true,
      );
      now += 100;
    }
    assert.ok(advanceAdaptive(session, now));
    assert.ok(session.target.startsWith(before + " "));
    const queued = decode(session.target);
    assert.notEqual(queued.at(-1).id, queued.at(-2).id);
  }
});
