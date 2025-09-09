// ================================
// FILE: src/shared/exporters.js
// ================================
import html2canvas from "html2canvas";

/**
 * Export a crisp PNG of the results area (KPIs + charts).
 * Requires a wrapper with [data-export-root] and each “card” with [data-glass].
 */
export async function exportPNG(nodeOrSelector) {
  const node = typeof nodeOrSelector === "string"
    ? document.querySelector(nodeOrSelector)
    : nodeOrSelector;
  if (!node) return;

  const root = node.closest("[data-export-root]") || node;

  // Wait for fonts/layout to settle
  try { await (document.fonts && document.fonts.ready); } catch {
    // Intentionally ignored
  }
  await new Promise(r => setTimeout(r, 60));

  const isDark  = document.documentElement.classList.contains("dark");
  const bgPage  = isDark ? "#0b0b0b" : "#ffffff";
  const bgCard  = isDark ? "#111214" : "#ffffff";
  const fgText  = isDark ? "#e5e7eb" : "#111827";
  const scale   = Math.min(Math.max((window.devicePixelRatio || 1) * 1.75, 2), 3);

  const canvas = await html2canvas(root, {
    backgroundColor: bgPage,
    useCORS: true,
    scale,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    logging: false,
    onclone: (doc) => {
      const clonedRoot = doc.querySelector("[data-export-root]") || doc.body;

      // solid base + spacing
      clonedRoot.style.background = bgPage;
      clonedRoot.style.padding = "24px";
      clonedRoot.style.borderRadius = "20px";

      // make “glass” sections opaque
      doc.querySelectorAll("[data-glass]").forEach((el) => {
        el.style.background = bgCard;
        el.style.color = fgText;
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.backdropFilter = "none";
      });

      // recharts wrapper background
      doc.querySelectorAll(".recharts-wrapper").forEach((el) => {
        el.style.background = bgCard;
        const svg = el.querySelector("svg");
        if (svg) {
          svg.style.background = "transparent";
          svg.style.opacity = "1";
          svg.style.filter = "none";
        }
      });

      // flatten any rgba(alpha<1)
      const flattenAlpha = (el) => {
        const cs = doc.defaultView.getComputedStyle(el);
        const bg = cs.backgroundColor || "";
        const m = bg.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/i);
        if (m && parseFloat(m[4]) < 1) {
          el.style.backgroundColor = `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
        }
        if (cs.opacity && parseFloat(cs.opacity) < 1) el.style.opacity = "1";
      };
      clonedRoot.querySelectorAll("*").forEach(flattenAlpha);

      const style = doc.createElement("style");
      style.textContent = `
        [data-export-root] * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-shadow: none !important;
          filter: none !important;
        }
        [data-export-root] .recharts-cartesian-axis-tick text,
        [data-export-root] .recharts-legend-item-text,
        [data-export-root] .recharts-tooltip-wrapper {
          fill: ${fgText} !important;
          color: ${fgText} !important;
        }
      `;
      doc.head.appendChild(style);
    },
  });

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `typing-results-${Date.now()}.png`;
  a.click();
}

/**
 * Export a CSV with session KPIs and timeline samples.
 */
export function exportCSV(data) {
  if (!data) return;
  const { wpm, accuracy, errors, keystrokes, timeline, date } = data;

  const header = ["timestamp","wpm_final","accuracy_percent","errors","keystrokes"];
  const row = [date, wpm, accuracy, errors, keystrokes];

  const lines = [header.join(","), row.join(",")];
  lines.push("t,,,,wpm");
  for (const pt of (timeline || [])) {
    const t = pt?.t ?? pt?.time ?? "";
    const v = pt?.wpm ?? "";
    lines.push(`${t},,,,${v}`);
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `typing-results-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// (optional) also export a default object if you prefer default imports elsewhere
export default { exportPNG, exportCSV };
