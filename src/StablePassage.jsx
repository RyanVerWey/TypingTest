import { memo, useLayoutEffect, useMemo, useRef } from "react";

// The complete passage keeps the same DOM positions for the entire round.
// Only changed character states and the caret are updated on each keystroke.
const StablePassage = memo(function StablePassage({ target, typed }) {
  const boxRef = useRef(null),
    previous = useRef("");
  const characters = useMemo(
    () =>
      [...target].map((ch, index) => (
        <span key={index} data-character={index}>
          {ch}
        </span>
      )),
    [target],
  );
  useLayoutEffect(() => {
    const box = boxRef.current,
      nodes = box.children;
    const before = previous.current;
    const from = Math.min(before.length, typed.length);
    const to = Math.min(
      nodes.length - 1,
      Math.max(before.length, typed.length),
    );
    for (let i = from; i <= to; i++) {
      nodes[i].className =
        i < typed.length
          ? typed[i] === target[i]
            ? "correct"
            : "incorrect"
          : "";
    }
    const caret = nodes[typed.length];
    if (caret) {
      caret.className = "cursor";
      const lineHeight = parseFloat(getComputedStyle(box).lineHeight);
      const lineTop = Math.floor(caret.offsetTop / lineHeight) * lineHeight;
      // Four visible lines leave two full lines ahead when the caret advances.
      // Never shift horizontally or rewrap already displayed words.
      if (lineTop >= box.scrollTop + lineHeight * 2)
        box.scrollTop = lineTop - lineHeight;
      else if (lineTop < box.scrollTop) box.scrollTop = lineTop;
    }
    if (typed.length === 0) box.scrollTop = 0;
    previous.current = typed;
  }, [target, typed]);
  return (
    <div className="passage" ref={boxRef} aria-hidden="true">
      {characters}
    </div>
  );
});
export default StablePassage;
