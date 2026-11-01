import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  input,
  metrics,
  finish,
  analyze,
  passage,
  practiceText,
  LEVELS,
} from "../src/lib/engine.js";

test("idle state has no invented accuracy or elapsed time", () => {
  const s = createSession("hello", 30);
  assert.equal(metrics(s, 10000).seconds, 0);
  assert.equal(metrics(s, 10000).accuracy, null);
  assert.equal(finish(s, 10000), false);
});
test("WPM uses five-character words, including spaces, and elapsed wall time", () => {
  const s = createSession("hi there x", 30);
  for (const [i, ch] of [...s.target].entries()) input(s, s.text + ch, i * 200);
  assert.equal(metrics(s, 10000).wpm, 12);
  assert.equal(metrics(s, 20000).wpm, 6);
  assert.equal(metrics(s, 20000).accuracy, 100);
});
test("backspacing an error never awards accuracy or WPM bonuses", () => {
  const s = createSession("cat", 30);
  input(s, "c", 0);
  input(s, "cx", 100);
  input(s, "c", 200);
  input(s, "ca", 300);
  input(s, "cat", 400);
  const m = metrics(s, 1000);
  assert.equal(m.accuracy, 75);
  assert.equal(m.finalAccuracy, 100);
  assert.equal(m.correctedErrors, 1);
  assert.equal(m.deletions, 1);
  assert.equal(m.rawWpm, 48);
  assert.equal(m.wpm, 36);
});
test("deleting a correct letter reduces retained WPM and does not count as fixed error", () => {
  const s = createSession("cat", 30);
  input(s, "c", 0);
  input(s, "ca", 100);
  input(s, "c", 200);
  assert.equal(metrics(s, 1000).correctedErrors, 0);
  assert.equal(metrics(s, 1000).wpm, 12);
});
test("timer catches up after background throttling and rejects late keys", () => {
  const s = createSession("cat", 15);
  input(s, "c", 1000);
  assert.equal(input(s, "ca", 16000), false);
  finish(s, 100000);
  assert.equal(s.endedAt, 16000);
  assert.equal(metrics(s, 100000).seconds, 15);
  assert.equal(metrics(s, 100000).wpm, 0.8);
  assert.equal(finish(s, 100001), false);
  assert.equal(input(s, "ca", 100002), false);
});
test("paste, replacement, and exceeding passage length are rejected", () => {
  const s = createSession("cat", 30);
  assert.equal(input(s, "cat", 0), false);
  assert.equal(s.startedAt, null);
  input(s, "c", 0);
  assert.equal(input(s, "a", 200), false);
  input(s, "ca", 300);
  input(s, "cat", 400);
  assert.equal(input(s, "cats", 500), false);
});
test("reports errors on expected keys and includes attempts as denominator", () => {
  const s = createSession("aa 2!", 30);
  for (const [i, ch] of [..."ax 3!"].entries()) input(s, s.text + ch, i * 300);
  const r = analyze(s, 2000);
  assert.deepEqual(
    r.weakKeys.find((k) => k.label === "a"),
    { label: "a", attempts: 2, errors: 1 },
  );
  assert.equal(r.categories.find((c) => c.label === "Numbers").errors, 1);
  assert.equal(r.remainingErrors, 2);
});
test("rhythm requires enough evidence and includes long pauses", () => {
  const s = createSession("a".repeat(30), 60);
  for (let i = 0; i < 20; i++) input(s, s.text + "a", i * 100);
  assert.equal(metrics(s, 2000).consistency, null);
  input(s, s.text + "a", 2000);
  assert.equal(metrics(s, 2100).consistency, 100);
  input(s, s.text + "a", 5000);
  assert.equal(metrics(s, 5100).pauses, 1);
  assert.ok(metrics(s, 5100).consistency < 100);
});
test("pair insights require three correct transitions", () => {
  const s = createSession("ababab", 30);
  [...s.target].forEach((ch, i) => input(s, s.text + ch, i * 200));
  assert.deepEqual(analyze(s, 1500).slowPairs, [
    { label: "ab", samples: 3, ms: 200 },
  ]);
});
test("levels contain enough text for a full session and use typeable ASCII", () => {
  for (const l of LEVELS) {
    const text = passage(l.id);
    assert.ok(text.length > 4000);
    assert.match(text, /^[\x20-\x7e]+$/);
  }
  assert.match(passage("foundation"), /^[a-z .]+$/);
  assert.match(passage("precision"), /\d/);
  assert.match(passage("code"), /[{}]/);
});
test("drill is based on missed keys with a useful error-free fallback", () => {
  assert.ok(practiceText({ weakKeys: [{ label: "q" }] }).includes("q"));
  assert.ok(practiceText({ weakKeys: [] }).length > 1000);
});
test("completion captures the precise final sample once", () => {
  const s = createSession("abc", 30);
  input(s, "a", 0);
  input(s, "ab", 500);
  input(s, "abc", 1550);
  finish(s, 1550);
  assert.equal(s.timeline.at(-1).seconds, 1.55);
  finish(s, 2000);
  assert.equal(s.timeline.length, 1);
});
