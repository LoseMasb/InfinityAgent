# Vue Data-Driven Pages

Use this skill when generating Vue pages from structured content.

## Principles

- Put page content in a data module when the structure repeats.
- Keep `App.vue` focused on layout and composition.
- Use `v-for` for repeated blocks instead of duplicating markup.
- Keep generated files easy to revise after the first pass.

## Output Rules

- `src/data/site.js` may contain hero, metrics, sections, and closing content.
- `App.vue` should import that data and render it cleanly.
- Keep the generated site readable without adding extra framework complexity.
