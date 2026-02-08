---
name: onboarding
description: Codebase onboarding for the Lower That repo. Use when a new agent needs an overview of architecture, key files, data flow, setup, and testing for this project.
---

# Onboarding

Use this skill to orient quickly in the Lower That codebase.

## Quick orientation

- Read `references/codebase-overview.md` for architecture, data flow, and key files.
- Use it as the primary map before making changes.

## When making changes

- Prefer server changes in `server/src/...` and web changes in `web/src/...`.
- Update `env.example` when adding or changing env vars.
- Update tests in `server/__tests__/...` or `web/tests/...` as needed.

## Common workflows

- Dev server: `cd server && npm start`, `cd web && npm run dev`.
- Tests: `cd server && npm test`, `cd web && npm test`, `cd web && npm run e2e`.
- Docker: `docker compose up -d --build` from repo root.
