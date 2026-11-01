# Typing Force contributor instructions

Read PRODUCT.md and DESIGN.md for confirmed product and design context.

This is a static React/Vite application. UI is in src/PracticeApp.jsx, scoring and analytics in src/lib/engine.js, persistence in src/lib/storage.js, and semantic CSS in src/practice.css. Use real measurement evidence, never invented psychological classifications. Preserve correction-sensitive accuracy and wall-time measurement. No server, user account, or external analytics is needed.

Run npm test, npm run lint, and npm run build locally. Add meaningful tests when changing scoring, timing, or storage behavior. Keep all levels open. Preserve keyboard access, light/dark contrast, and reduced motion.

Deploy directly through Vercel in ryanverweys-projects. Never add or trigger GitHub Actions. Before publishing, verify GitHub identity, commit attribution, existing workflow triggers, and repository protections. Use a cohesive feature PR. Do not commit .env.local, .vercel, output, or browser artifacts.
