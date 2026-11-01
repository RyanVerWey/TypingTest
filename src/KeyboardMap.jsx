const ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

export default function KeyboardMap({ keys }) {
  // Upper/lowercase share a physical key here; the table below preserves case.
  const counts = new Map();
  for (const key of keys) {
    const label = key.label.toLowerCase();
    const total = counts.get(label) || { attempts: 0, errors: 0 };
    total.attempts += key.attempts;
    total.errors += key.errors;
    counts.set(label, total);
  }
  const renderKey = (label) => {
    const total = counts.get(label);
    const state = !total ? "untried" : total.errors ? "missed" : "clean";
    return (
      <div
        key={label}
        className={`keyboard-key ${state} ${label === " " ? "space-key" : ""}`}
      >
        <span>{label === " " ? "space" : label.toUpperCase()}</span>
        <small>
          {total ? (
            <>
              {total.errors}
              <span className="keyboard-unit">
                {" "}
                {total.errors === 1 ? "miss" : "misses"}
              </span>
            </>
          ) : (
            "n/a"
          )}
        </small>
      </div>
    );
  };
  return (
    <figure className="keyboard-map">
      <figcaption>
        <strong>
          {keys.some((key) => key.errors)
            ? "Where your fingers got tangled"
            : "A clean run on the keys you tried"}
        </strong>
        <span>
          Letters, numbers, and space. Case combined; symbols appear in the full
          map below.
        </span>
      </figcaption>
      <div className="keyboard-deck" aria-label="Keyboard error map">
        {ROWS.map((row) => (
          <div className="keyboard-row" key={row}>
            {[...row].map(renderKey)}
          </div>
        ))}
        <div className="keyboard-row">{renderKey(" ")}</div>
      </div>
      <p className="keyboard-legend">
        <span className="clean">● No misses</span>
        <span className="missed">● Needs practice</span>
        <span>○ Not attempted</span>
      </p>
    </figure>
  );
}
