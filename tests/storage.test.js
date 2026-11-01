import test from "node:test";
import assert from "node:assert/strict";
import { readHistory, saveHistory } from "../src/lib/storage.js";
test("unavailable or corrupted storage cannot break practice", () => {
  globalThis.localStorage = {
    getItem: () => "{broken",
    setItem: () => {
      throw new Error("blocked");
    },
  };
  assert.deepEqual(readHistory(), []);
  assert.equal(saveHistory([]), false);
  localStorage.getItem = () => "{}";
  assert.deepEqual(readHistory(), []);
  localStorage.getItem = () => '[null,{"wpm":"oops"}]';
  assert.deepEqual(readHistory(), []);
  delete globalThis.localStorage;
});
test("history is bounded and malformed rows are ignored", () => {
  const record = {
    id: "a",
    level: "flow",
    drill: false,
    wpm: 42,
    accuracy: 98,
    duration: 30,
    date: "2026-11-01",
  };
  let value = JSON.stringify([
    null,
    ...Array.from({ length: 70 }, () => record),
  ]);
  globalThis.localStorage = {
    getItem: () => value,
    setItem: (_, v) => {
      value = v;
    },
  };
  assert.equal(readHistory().length, 50);
  assert.equal(saveHistory(Array(60).fill(record)), true);
  assert.equal(JSON.parse(value).length, 50);
  delete globalThis.localStorage;
});
