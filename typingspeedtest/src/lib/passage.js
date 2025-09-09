// ================================
// FILE: src/lib/passage.js
// Paragraph-style passages with intentional numbers & symbols
// ================================

// Beginner: simple, short paragraphs with gentle numbers/symbols used naturally
const BEGINNER_BLOCKS = [
  `We packed snacks for our walk to the park. At 7:30 we met by the big oak tree and counted 10 red kites. I brought $2 for a small juice, and my brother saved 3 cookies to share.`,
  `Our class grew beans in small cups. We watered them 2 times a day and wrote notes every morning. By day 7, most sprouts were 5 cm tall, and we drew happy faces in our journals.`,
  `Dad set the timer for 15 minutes to clean the living room. I folded 4 blankets, picked up 12 blocks, and put books on 2 shelves. When the timer beeped, we high-fived and had apples.`,
  `We practiced reading for 20 minutes after dinner. I finished 3 short stories and circled 8 new words. Mom said we would visit the library at 4:00 to get 2 more books.`,
  `On Saturday we made lemonade. We squeezed 6 lemons, added 4 cups of water, and 2 spoons of sugar. We sold each cup for $1 at our small stand and kept a neat list of 12 customers.`,
  `At the pool I swam 6 laps while my friend counted. We rested for 5 minutes and then did 3 more. The clock showed 2:45 when we left, and we promised to return next week.`,
];

// Student: everyday school content, a bit longer, with dates/times/units/equations
const STUDENT_BLOCKS = [
  `Our science group recorded the temperature every 10 minutes during a 60-minute lab. The first reading was 21°C at 1:10 pm and the last reached 26°C at 2:10 pm. We graphed all 6 points and wrote a short claim backed by our data.`,
  `For history we created a timeline with 8 events between 1930 and 1968. I met with Maya at 3:45 to compare notes, and we split the sources: I took chapters 2–3 while she reviewed 4–5. We planned to submit a single PDF by 09/15.`,
  `Coach posted the practice plan: warm-up (10 min), drills (25 min), and a 15-minute scrimmage. I tracked my heart rate and average pace of 5:30 per km. Our goal is to improve by 10% before the tournament on 10/21.`,
  `In math we checked the rule 3 + 4 = 7 and then tried 30 + 40 = 70 to see patterns. The teacher asked us to explain why 7×8 = 56 using arrays and to label each axis clearly. My notes include 2 examples with neat diagrams.`,
  `The media lab opens at 7:15 am for equipment checkout. I reserved camera #2 and a tripod for 48 hours and confirmed the pickup email from team@school.edu. Our interview has 12 questions and should run about 18 minutes.`,
  `For the book club I read 2 chapters a night and logged quotes with page numbers. By day 5 I had 14 notes and 3 questions for discussion. Our group meets on Thursdays at 4:30 and shares a one-page summary.`,
];

// Advanced: work/academic tone; measured use of symbols like %, (), ±, and units
const ADVANCED_BLOCKS = [
  `During the pilot study, we surveyed 120 participants across 3 cohorts. The response rate improved from 62% to 74% after a single reminder sent at 09:00. We documented all deviations (n=5) and noted two items requiring clarification.`,
  `The model achieved an average error of 2.3 ± 0.4 units on the validation set. Even after regularization (λ=0.01), bias persisted in category B, which accounted for 18% of observations. We propose collecting 200 additional samples.`,
  `Our quarterly report compares revenue growth of 7.2% year-over-year with operating costs rising 3.1%. Section 2.4 details assumptions, while Appendix A lists 12 data sources. All figures are rounded to 1 decimal place unless stated otherwise.`,
  `In the workshop, we mapped objectives to outcomes using a simple RACI matrix. Of 10 planned tasks, 8 met their targets within ±2 days. The remaining 2 deferred items require cross-team approval by 10/05.`,
  `The A/B test ran for 14 days and collected 92,000 sessions. Variant B improved completion rate from 4.9% to 5.6% (Δ=+0.7 pp, p<0.05). A follow-up test will focus on the 18–24 age segment identified in Table 3.`,
  `Our dataset includes timestamps in ISO-8601, e.g., 2025-09-05T10:15:00Z. We normalized currency in USD, applied a $50 floor to outliers, and capped totals at the 99th percentile. See Figure 5 for the final distribution.`,
];

// Computer Wizard: technical paragraphs with purposeful symbols (paths, JSON, CLI, regex)
const WIZARD_BLOCKS = [
  `Deploy step 1/3: run \`npm run build\` and verify the output size is < 500 KB. Step 2/3: \`node server.js --port=8080\`. Step 3/3: set \`NODE_ENV=production LOG_LEVEL=info\` and confirm the health check at /health returns \`{"ok":true}\` within 200 ms.`,
  `Windows path rules: configuration lives in \`C:\\\\Users\\\\Public\\\\AppData\\\\Roaming\\\\app\\\\config.json\`. On Linux/macOS the same file is at \`/etc/app/config.json\`. We bumped the schema version to 2.1 and added \`retries: 3\` plus a \`timeout: 1500\` field.`,
  `Database quick check: \`SELECT id, email FROM users WHERE last_login >= '2025-09-01' LIMIT 25;\`. For local testing, export \`PGHOST=localhost PGPORT=5432\`. Use a hashed admin password (sha256) and rotate tokens every 24 h.`,
  `API notes: POST /v2/auth/login expects \`{"user":"demo","pass":"secret"}\` and returns 200 with a JWT. Rate limits apply at 100 req/min per IP; exceeding the limit yields HTTP 429 and a \`Retry-After: 60\` header.`,
  `Regex clinic: emails match \`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$\`. For IDs we require 8–12 hex chars, e.g., \`^[0-9a-f]{8,12}$\`. We log 5 samples per batch to stderr and redact secrets with \`****\`.`,
  `Container runbook: \`docker run -it --rm -p 3000:3000 app:1.4.2\`. Check image size (≤ 300 MB) and ensure \`HEALTHCHECK --interval=30s --timeout=3s\`. On failure codes, restart policy is set to \`on-failure:5\`.`,
];

export const DIFFICULTY_OPTIONS = ["beginner", "student", "advanced", "wizard"];
export const DIFFICULTY_LABELS = {
  beginner: "Beginner Typer",
  student: "Student Typer",
  advanced: "Advanced Typer",
  wizard: "Computer Wizard",
};

export function buildPassage(difficulty = "student") {
  let source;
  switch (difficulty) {
    case "beginner": source = BEGINNER_BLOCKS; break;
    case "student":  source = STUDENT_BLOCKS;  break;
    case "advanced": source = ADVANCED_BLOCKS; break;
    case "wizard":   source = WIZARD_BLOCKS;   break;
    default:         source = STUDENT_BLOCKS;
  }
  // Shuffle paragraphs; join with a blank line to form a passage
  const order = shuffle([...source]);
  return order.join("\n\n");
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
