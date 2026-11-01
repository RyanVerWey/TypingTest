export function insights(r) {
  if (r.attempts < 50 || r.seconds < 15)
    return [
      {
        title: "A first observation, not a pattern yet",
        evidence: `${r.attempts} character attempts across ${Math.round(r.seconds)} seconds.`,
        interpretation:
          "This is too little evidence to characterize your approach. A few awkward words or an interruption can dominate a short sample.",
        experiment:
          "Try a 60-second fixed-level session. Notice whether you look ahead at words or check each letter; compare that reflection with your pauses and correction rate.",
      },
    ];
  const d = r.detail,
    items = [];
  if (r.errors && d.errorRecovery >= 65)
    items.push({
      title: "You actively checked and repaired errors",
      evidence: `${r.correctedErrors} of ${r.errors} mistyped character attempts were deleted. ${Math.round(d.correctionRate)} deletions per 100 attempts.`,
      interpretation:
        "Your behavior is consistent with active error monitoring: you were willing to interrupt forward typing to repair output. That can protect quality, while repeated revisions consume time. It does not establish perfectionism.",
      experiment:
        "Repeat at a slightly easier pace. If accuracy rises while deletions fall, preventing errors is helping more than correcting them faster.",
    });
  else if (r.errors)
    items.push({
      title: "Some errors stayed in your output",
      evidence: `${r.remainingErrors} incorrect characters remained; ${Math.round(d.errorRecovery || 0)}% of error attempts were subsequently deleted.`,
      interpretation:
        "You may have been prioritizing forward movement, or some errors may have gone unnoticed. The result alone cannot distinguish a deliberate speed strategy from missed feedback.",
      experiment:
        "Run one accuracy-first round and deliberately check the end of each word. Compare final text accuracy and correct WPM, not just raw speed.",
    });
  else
    items.push({
      title: "This passage stayed under control",
      evidence: `${r.attempts} character attempts with no recorded mistypes; ${r.deletions} deleted characters.`,
      interpretation:
        "The result is compatible with either fluent automatic execution or careful conscious control. Low errors alone cannot tell them apart.",
      experiment:
        "Add one difficulty level while keeping a comfortable pace. Watch whether accuracy holds or checking and pauses increase.",
    });
  const gap = Math.max(0, r.rawWpm - r.wpm);
  items.push(
    r.accuracy < 97
      ? {
          title: "Speed is not all turning into usable output",
          evidence: `${Math.round(r.rawWpm)} raw WPM versus ${Math.round(r.wpm)} correct WPM, a ${Math.round(gap)} WPM gap.`,
          interpretation:
            "Mistakes and retyping reduced the yield from your effort. This is a useful signal for speed–accuracy regulation, not evidence that you are impulsive.",
          experiment:
            "Choose a pace about 10% slower for the next fixed-level round. If correct WPM stays similar while accuracy rises, the slower pace is more efficient.",
        }
      : {
          title: "Most of your effort became accurate output",
          evidence: `${Math.round(r.accuracy)}% attempt accuracy and ${Math.round(d.efficiency)}% retained correct characters per input action.`,
          interpretation:
            "Your current speed–accuracy balance is productive for this material. It may reflect familiarity with these patterns; it does not mean every harder task will feel automatic.",
          experiment:
            "Increase difficulty one step. Keep the change only if accuracy remains near 97% across a complete round.",
        },
  );
  if (r.consistency !== null)
    items.push(
      r.consistency >= 60 && r.accuracy >= 97
        ? {
            title: "Your timing shows signs of practiced fluency",
            evidence: `${Math.round(r.consistency)}/100 rhythm, ${Math.round(d.medianInterval)} ms median interval, and a ${d.longestClean}-character clean streak.`,
            interpretation:
              "Accurate, relatively even execution is compatible with well-practiced motor sequences. Timing alone cannot prove a flow state or tell us where your attention was directed.",
            experiment:
              "Try a new passage at the same level. If the pattern repeats, this may be a stable skill rather than familiarity with one sentence.",
          }
        : {
            title: "Your effort was uneven across the passage",
            evidence: `${Math.round(d.medianInterval)} ms median interval; the slowest 10% took at least ${Math.round(d.p90Interval)} ms. ${r.pauses} gaps exceeded one second.`,
            interpretation:
              "You alternated faster execution with slower transitions. Reading ahead, unfamiliar key combinations, corrections, and outside interruptions can all produce this pattern; it is not a measure of attention span.",
            experiment:
              "Use the slow-pair table to practice one repeated transition, then retest. If its timing improves while other pairs stay similar, the bottleneck was probably local to that pattern.",
          },
    );
  const cats = r.categories
    .filter((c) => c.attempts >= 10)
    .map((c) => ({ ...c, accuracy: (1 - c.errors / c.attempts) * 100 }))
    .sort((a, b) => a.accuracy - b.accuracy);
  if (cats.length >= 2 && cats.at(-1).accuracy - cats[0].accuracy >= 8)
    items.push({
      title: "Some material demanded more control",
      evidence: `${cats[0].label}: ${Math.round(cats[0].accuracy)}% across ${cats[0].attempts} attempts; ${cats.at(-1).label}: ${Math.round(cats.at(-1).accuracy)}%.`,
      interpretation:
        "Performance changed with the kind of characters being typed. Familiarity, keyboard layout, and switching between character types are plausible explanations; this cannot isolate mental workload.",
      experiment: `Practice ${cats[0].label.toLowerCase()} in short blocks, then mixed text. Compare whether the difficulty comes from the characters themselves or switching between them.`,
    });
  if (d.adaptive?.steps.length) {
    const rises = d.adaptive.steps.filter(
      (s) => s.level !== s.nextLevel && s.accuracy >= 97,
    ).length;
    items.push({
      title: "You tested your current learning edge",
      evidence: `${d.adaptive.steps.length} completed rounds; ${rises} increases in difficulty.`,
      interpretation:
        "Adaptive practice deliberately changes the task. A slower later segment can be a response to harder material, not fatigue or lost focus. Look at each round’s accuracy before judging the overall speed curve.",
      experiment:
        "Use the highest level you held accurately as the starting point next time. Choose a fixed-level session when you want a fair progress comparison.",
    });
  }
  return items;
}
