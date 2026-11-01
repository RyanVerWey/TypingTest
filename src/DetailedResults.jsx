import { LEVELS, keyName } from "./lib/engine";
import { insights } from "./lib/insights";
const fmt = (n, suffix = "") =>
  n === null ? "Not enough data" : `${Math.round(n)}${suffix}`;
function Facts({ rows }) {
  return (
    <dl className="fact-table">
      {rows.map(([name, value, help]) => (
        <div key={name}>
          <dt>
            {name}
            <small>{help}</small>
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export default function DetailedResults({ result: r }) {
  const d = r.detail;
  return (
    <>
      <section
        className="psychology deep-report"
        aria-labelledby="psychology-title"
      >
        <p className="eyebrow">THE PSYCHOLOGY OF YOUR PRACTICE</p>
        <h2 id="psychology-title">How you approached the task.</h2>
        <p>
          Useful hypotheses about attention, control, and learning, grounded in
          this session. These are coaching interpretations, not a personality
          test.
        </p>
        <div className="insight-list">
          {insights(r).map((item, i) => (
            <article key={item.title}>
              <span className="section-index">0{i + 1} / OBSERVATION</span>
              <h3>{item.title}</h3>
              <p className="evidence">{item.evidence}</p>
              <p>{item.interpretation}</p>
              <div className="experiment">
                <strong>Test this next time</strong>
                <p>{item.experiment}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="research-note">
          Why these lenses? Research distinguishes monitoring the text from the
          processes that execute keystrokes. It also shows that typing
          strategies vary widely. Those findings inform the questions here; they
          do not validate this app as a psychological assessment.{" "}
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/21030660/"
            target="_blank"
            rel="noreferrer"
          >
            Logan & Crump, 2010 ↗
          </a>{" "}
          ·{" "}
          <a
            href="https://userinterfaces.aalto.fi/136Mkeystrokes/"
            target="_blank"
            rel="noreferrer"
          >
            Dhakal et al., 2018 ↗
          </a>
        </p>
      </section>
      <section className="deep-report" id="full-breakdown">
        <p className="eyebrow">THE FULL BREAKDOWN</p>
        <h2>See where your effort went.</h2>
        <div className="report-grid">
          <section>
            <h3>Speed & output</h3>
            <Facts
              rows={[
                [
                  "Correct speed",
                  fmt(r.wpm, " WPM"),
                  "Retained correct characters, including spaces",
                ],
                [
                  "Raw speed",
                  fmt(r.rawWpm, " WPM"),
                  "All character attempts, including retyping",
                ],
                [
                  "Peak 5-second pace",
                  fmt(d.peakWpm, " WPM"),
                  "Best complete five-second interval",
                ],
                [
                  "Correct characters per minute",
                  fmt(r.wpm * 5, " CPM"),
                  "Five characters per standardized word",
                ],
                [
                  "Pace change",
                  d.paceChange === null
                    ? "Not enough data"
                    : `${d.paceChange >= 0 ? "+" : ""}${Math.round(d.paceChange)} WPM`,
                  "Last complete interval compared with first",
                ],
                [
                  "Retained output",
                  `${d.retainedCharacters} characters`,
                  `${r.correct} correct, ${r.remainingErrors} incorrect`,
                ],
              ]}
            />
          </section>
          <section>
            <h3>Accuracy & correction cost</h3>
            <Facts
              rows={[
                [
                  "Attempt accuracy",
                  fmt(r.accuracy, "%"),
                  `${d.correctAttempts} correct / ${r.attempts} attempts`,
                ],
                [
                  "Final text accuracy",
                  fmt(r.finalAccuracy, "%"),
                  "Only the text left at the finish",
                ],
                [
                  "Input efficiency",
                  fmt(d.efficiency, "%"),
                  "Retained correct characters / (attempts + deleted characters)",
                ],
                [
                  "Deletion rate",
                  fmt(d.correctionRate, " per 100 attempts"),
                  `${r.deletions} deleted characters, including ${r.deletions - r.correctedErrors} correct characters`,
                ],
                [
                  "Error removal",
                  fmt(d.errorRecovery, "%"),
                  `${r.correctedErrors} error attempts subsequently deleted`,
                ],
                [
                  "Longest clean run",
                  `${d.longestClean} attempts`,
                  "Consecutive correct character attempts",
                ],
                [
                  "Longest error run",
                  `${d.longestErrors} attempts`,
                  "Consecutive incorrect character attempts",
                ],
              ]}
            />
          </section>
          <section>
            <h3>Rhythm & pauses</h3>
            <Facts
              rows={[
                [
                  "Median interval",
                  fmt(d.medianInterval, " ms"),
                  "Typical gap between character attempts",
                ],
                [
                  "90th-percentile interval",
                  fmt(d.p90Interval, " ms"),
                  "90% of character gaps were at or below this",
                ],
                [
                  "Rhythm consistency",
                  fmt(r.consistency, " / 100"),
                  "Includes pauses; requires 20 intervals",
                ],
                [
                  "Long gaps",
                  `${r.pauses}`,
                  "Gaps over one second between attempts",
                ],
                [
                  "Time in long gaps",
                  `${d.pauseSeconds.toFixed(1)}s`,
                  "Full duration of gaps over one second",
                ],
                [
                  "Longest long gap",
                  `${(d.longestPause / 1000).toFixed(1)}s`,
                  "Between character attempts",
                ],
                [
                  "Time after final character",
                  `${d.endIdleSeconds.toFixed(1)}s`,
                  "Included in the score, separate from inter-key pauses",
                ],
              ]}
            />
          </section>
          <section>
            <h3>Common substitutions</h3>
            <p className="muted">
              Expected key → typed key. Repeated substitutions are useful drill
              targets; they do not establish which finger you used.
            </p>
            {d.confusions.length ? (
              <Facts
                rows={d.confusions.map((c) => [
                  c.label,
                  `${c.count} ${c.count === 1 ? "time" : "times"}`,
                  "",
                ])}
              />
            ) : (
              <p className="empty">No incorrect substitutions recorded.</p>
            )}
          </section>
        </div>
      </section>
      <section className="deep-report">
        <p className="eyebrow">MOMENT BY MOMENT</p>
        <h2>Speed and accuracy, together.</h2>
        <p className="muted">
          Actual five-second intervals. Short final intervals are labeled and
          excluded from peak pace. Unlike cumulative WPM, these show where you
          accelerated, slowed down, or stopped.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Interval</th>
                <th>Correct WPM</th>
                <th>Raw WPM</th>
                <th>Accuracy</th>
                <th>Errors / attempts</th>
              </tr>
            </thead>
            <tbody>
              {d.windows.map((w) => (
                <tr key={w.from}>
                  <td>
                    {w.from}–{Math.round(w.to)}s{" "}
                    {w.seconds < 5 ? "(partial)" : ""}
                  </td>
                  <td>
                    <span
                      className="inline-bar"
                      style={{
                        "--bar": `${Math.min(100, (w.wpm / Math.max(1, ...d.windows.map((x) => x.wpm))) * 100)}%`,
                      }}
                    >
                      {Math.round(w.wpm)}
                    </span>
                  </td>
                  <td>{Math.round(w.rawWpm)}</td>
                  <td>
                    {w.accuracy === null
                      ? "No input"
                      : `${Math.round(w.accuracy)}%`}
                  </td>
                  <td>
                    {w.errors} / {w.attempts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="deep-report">
        <p className="eyebrow">EVERY KEY, ACCOUNTED FOR</p>
        <h2>Your character map.</h2>
        <p className="muted">
          Accuracy uses every attempt. Timing uses correct consecutive
          transitions, with at least three samples per key. A slow key can also
          reflect the letter before it.
        </p>
        <div className="key-map">
          {d.keyDetails.map((k) => (
            <div
              className={k.errors ? "key-cell has-errors" : "key-cell"}
              key={k.label}
            >
              <kbd>{keyName(k.label)}</kbd>
              <strong>{Math.round(k.accuracy)}%</strong>
              <span>
                {k.errors} / {k.attempts} misses
              </span>
              <small>
                {k.medianMs === null
                  ? "More timing samples needed"
                  : `${Math.round(k.medianMs)} ms median · ${k.timingSamples} samples`}
              </small>
            </div>
          ))}
        </div>
      </section>
      {d.adaptive && (
        <section className="deep-report">
          <p className="eyebrow">YOUR ADAPTIVE JOURNEY</p>
          <h2>Challenge that moved with you.</h2>
          <p className="muted">
            Ended on {LEVELS[d.adaptive.stage].name}, round {d.adaptive.round}.
            The final in-progress round is included in overall metrics.
            Difficulty changes are queued one passage ahead so visible text never changes.
          </p>
          {d.adaptive.steps.length ? (
            <ol className="journey">
              {d.adaptive.steps.map((s) => (
                <li key={s.round}>
                  <strong>
                    Round {s.round} ·{" "}
                    {LEVELS.find((l) => l.id === s.level).name} →{" "}
                    {LEVELS.find((l) => l.id === s.nextLevel).name}
                  </strong>
                  <span>
                    {Math.round(s.accuracy)}% accuracy · {Math.round(s.wpm)}{" "}
                    correct WPM · {Math.round(s.seconds)}s
                  </span>
                  <p>{s.reason}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty">
              Finish a passage to reach your first checkpoint. Accuracy and pace
              determine the next challenge.
            </p>
          )}
        </section>
      )}
    </>
  );
}
