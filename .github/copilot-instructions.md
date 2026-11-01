# Typing Force contributor instructions

Read PRODUCT.md and DESIGN.md for confirmed product and design context.

This is a static React/Vite application. UI is in src/PracticeApp.jsx, scoring and analytics in src/lib/engine.js, persistence in src/lib/storage.js, and semantic CSS in src/practice.css. Use real measurement evidence, never invented psychological classifications. Preserve correction-sensitive accuracy and wall-time measurement. No server, user account, or external analytics is needed.

Run npm test, npm run lint, and npm run build locally. Add meaningful tests when changing scoring, timing, or storage behavior. Keep all levels open. Preserve keyboard access, light/dark contrast, and reduced motion.

Practice material lives in src/lib/lessons.js and rotation in src/lib/content.js. Preserve shared lesson IDs across levels, complete sentence boundaries, varied fixed/drill passages, recent-opening exclusions, and stable queued text. New passages must remain typeable ASCII and match the difficulty of their level. Rotation storage contains IDs only and must fail safely.

Deploy directly through Vercel in ryanverweys-projects. Never add or trigger GitHub Actions. Before publishing, verify GitHub identity, commit attribution, existing workflow triggers, and repository protections. Use a cohesive feature PR. Do not commit .env.local, .vercel, output, or browser artifacts.
