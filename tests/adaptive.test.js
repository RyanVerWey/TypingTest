import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  input,
  metrics,
  analyze,
  finish,
} from "../src/lib/engine.js";
import { enableAdaptive, advanceAdaptive } from "../src/lib/adaptive.js";
import { detailedReport } from "../src/lib/report.js";
import { insights } from "../src/lib/insights.js";

function round(level, wrong = false) {
  const s = enableAdaptive(createSession("a".repeat(90), 60), level);
  for (let i = 0; i < 90; i++)
    input(s, s.text + (wrong && i % 4 === 0 ? "x" : "a"), i * 100);
  return s;
}
test("adaptive progression is earned at a completed boundary and never rewrites existing text", () => {
  const s = round("foundation"),
    before = s.target;
  const change = advanceAdaptive(s, 9000);
  assert.equal(change.nextLevel, "flow");
  assert.equal(s.adaptive.round, 2);
  assert.ok(s.target.startsWith(before + " "));
  assert.equal(s.text, before);
  assert.equal(advanceAdaptive(s, 9100), null);
  assert.equal(metrics(s, 10000).seconds, 10);
});
test("low accuracy offers a lighter round; foundation never underflows", () => {
  const s = round("precision", true);
  assert.equal(advanceAdaptive(s, 9000).nextLevel, "flow");
  const first = round("foundation", true);
  assert.equal(advanceAdaptive(first, 9000).nextLevel, "foundation");
});
test("insufficient pace holds the stage, top stage cannot overflow", () => {
  const s = round("flow");
  assert.equal(advanceAdaptive(s, 55000).nextLevel, "flow");
  const top = round("code");
  assert.equal(advanceAdaptive(top, 9000).nextLevel, "code");
});
test("a timed-out session cannot append another adaptive passage", () => {
  const s = round("foundation");
  finish(s, 60000);
  assert.equal(advanceAdaptive(s, 60001), null);
});
test("detailed intervals reconcile retained correct output and preserve error attempts", () => {
  const s = createSession("cat", 15);
  input(s, "c", 0);
  input(s, "cx", 100);
  input(s, "c", 200);
  input(s, "ca", 300);
  input(s, "cat", 400);
  finish(s, 15000);
  const b = analyze(s, 15000),
    d = detailedReport(s, b);
  assert.equal(d.correctAttempts, 3);
  assert.equal(d.errorRecovery, 100);
  assert.equal(d.efficiency, 60);
  assert.ok(Math.abs(d.windows[0].wpm - 7.2) < 1e-9);
  assert.ok(Math.abs(d.windows[0].rawWpm - 9.6) < 1e-9);
  assert.equal(d.windows[1].accuracy, null);
  assert.equal(d.endIdleSeconds, 14.6);
  assert.equal(d.confusions[0].label, "a → x");
  assert.equal(d.keyDetails.find((k) => k.label === "a").accuracy, 50);
});
test("timing quantiles and streaks use observed character intervals", () => {
  const s = createSession("abcd", 30);
  [0, 100, 300, 1800].forEach((t, i) => input(s, s.text + "abcd"[i], t));
  finish(s, 5000);
  const b = analyze(s, 5000),
    d = detailedReport(s, b);
  assert.equal(d.medianInterval, 200);
  assert.equal(d.p90Interval, 1500);
  assert.equal(d.pauseSeconds, 1.5);
  assert.equal(d.longestClean, 4);
});
test("psychology shows limited evidence for a small sample and specific experiments for a substantial one", () => {
  const s = round("foundation");
  finish(s, 30000);
  const b = analyze(s, 30000),
    r = { ...b, detail: detailedReport(s, b) };
  const items = insights(r);
  assert.ok(items.length >= 3);
  assert.ok(items.every((i) => i.evidence && i.interpretation && i.experiment));
  assert.match(
    insights({ attempts: 3, seconds: 15 })[0].title,
    /first observation/,
  );
});
