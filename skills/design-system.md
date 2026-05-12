# Design System

Use this skill when defining visual direction for a generated website.

## UI Rules

- Use a balanced palette instead of a one-note color theme.
- Cards should use an 8px radius or less unless the local design demands otherwise.
- Do not nest cards inside cards.
- Use full-width page bands and constrained inner content instead of floating page sections.
- Avoid viewport-width font scaling. Prefer `clamp()` with sensible limits for display headings.
- Letter spacing should stay at `0` unless there is a clear brand reason.
- Buttons need stable min-height, clear focus/hover states, and text that wraps safely.

## Layout Rules

- The first viewport should reveal the core product, place, service, or experience.
- A hero should hint at the next section on common mobile and desktop viewports.
- Operational or SaaS-like tools should be quiet, dense, and scannable.
- Editorial, portfolio, or game-like experiences may be more expressive.
