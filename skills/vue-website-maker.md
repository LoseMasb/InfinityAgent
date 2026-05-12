# Vue Website Maker

Use this skill when producing a Vue website from a natural-language brief.

## Principles

- Build the actual usable page as the first screen.
- Prefer Vite + Vue 3 single-file components.
- Keep generated projects small, understandable, and easy to iterate.
- Use real layout structure: navigation, main content, sections, calls to action, and footer or closing band when useful.
- Keep file paths relative to the project root.
- Include `package.json`, `index.html`, `vite.config.js`, `src/main.js`, `src/App.vue`, `src/styles.css`, and `README.md`.

## Output Standards

- The page should be responsive on mobile and desktop.
- Text must not overlap controls or neighboring content.
- Avoid placeholder-only pages and generic filler.
- Include dependencies in `package.json` when used.
- Keep the generated code runnable with `npm install` and `npm run dev`.
