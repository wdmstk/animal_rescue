# AGENTS.md
AI Agent Instructions for this repository
(For GPT-5.x implementation agents)

---

## 1. Project Overview

This repository uses Next.js + Supabase.
Implementation agents must:

- Read existing code before changes
- Prefer minimal diffs
- Preserve conventions and structure
- Ask when requirements are unclear
- Never invent missing specifications

---

## 2. Development Environment

Install:
```bash
npm ci
```

Run dev:
```bash
npm run dev
```

Lint:
```bash
npm run lint
```

Unit tests:
```bash
npx vitest run
```

E2E tests:
```bash
npm run test:e2e
```

Before finishing:
- Run lint/tests
- Fix all issues

---

## 3. Code Style Rules

- Use TypeScript strictly (`strict: true`)
- Keep functions small and readable
- Avoid deep nesting
- Avoid unnecessary dependencies
- Keep business rules outside UI components

Naming:
- `camelCase` for variables/functions
- `PascalCase` for React components/classes
- `UPPER_SNAKE_CASE` for constants

---

## 4. Architecture Rules

- Routing/UI: `src/app`
- Business logic: `src/lib`
- Shared UI: `src/components`
- Types: `src/types`
- Tests mirror source structure

Preferred file size: under 400 lines

---

## 5. Testing Policy

Testing is mandatory for every change.

- Add/update tests with each feature or bug fix
- No meaningless assertions (`expect(true).toBe(true)` 禁止)
- Include boundary/error cases
- Keep mocks minimal and realistic
- Do not hardcode production logic to pass tests

---

## 6. Safety Rules

Never:
- Delete large code sections without explicit request
- Commit secrets/API keys
- Change environment config without reason

If unsure, ask for confirmation.

---

## 7. Git Workflow

Before commit:
```bash
git status
git diff
```

Commit format:
- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `test: ...`
- `docs: ...`

---

## 8. Task Management

Use `TASKS.md` as canonical task tracker.

Status order:
1. `in_progress`
2. `todo`
3. `blocked`
4. `done`

Within each status: Task ID descending.

Branch format:
`<type>/TASK-<id>-<short-description>`

---

## 9. Output Format

When requested by policy, provide code changes as unified diff.
Keep unrelated lines untouched.
