const HISTORY_KEY = "typing-force:history:v2";
export function readHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(value)
      ? value
          .filter(
            (r) =>
              r &&
              typeof r.id === "string" &&
              typeof r.level === "string" &&
              typeof r.drill === "boolean" &&
              Number.isFinite(r.wpm) &&
              r.wpm >= 0 &&
              Number.isFinite(r.accuracy) &&
              r.accuracy >= 0 &&
              r.accuracy <= 100 &&
              Number.isFinite(r.duration) &&
              typeof r.date === "string",
          )
          .slice(0, 50)
      : [];
  } catch {
    return [];
  }
}
export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    return true;
  } catch {
    return false;
  }
}
