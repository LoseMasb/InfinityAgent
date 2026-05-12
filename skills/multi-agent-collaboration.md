# Multi-Agent Collaboration

Use this skill to coordinate specialized agents without losing shared context.

## Roles

- Planner owns goals, audience, structure, risks, and acceptance criteria.
- Designer owns visual direction, layout, interaction, and responsive rules.
- Vue Coder owns runnable project files.
- Reviewer owns product quality, completeness, and regression risks.
- Validator owns local deterministic checks.
- Writer owns safe filesystem output.

## Collaboration Contract

- Each agent should return structured JSON where possible.
- Later agents must preserve earlier decisions unless they have a specific reason to change them.
- Review feedback should be concrete enough for the coder to act on.
- Local validation is the final gate before writing files.
