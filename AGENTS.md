# AGENTS.md
AI Agent Instructions for this repository
(For GPT-5.x implementation agents)

---

## 1. Project Overview

This repository uses Next.js + Supabase + Prisma.
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

When creating a new task, create a corresponding GitHub Issue and manage progress with both (`TASKS.md` + Issue).
When closing a task (`done`), close the corresponding GitHub Issue in the same delivery flow.

Status order:
1. `in_progress`
2. `todo`
3. `blocked`
4. `done`

Within each status: Task ID descending.

Branch format:
`<type>/TASK-<id>-<short-description>`

Issue design policy (for CodexApp parallel implementation):
- Split issues into independently implementable units (API/UI/test/docs etc.) so they can run in parallel
- Keep one issue focused on one primary objective and acceptance criteria
- Define dependency order explicitly (`blocked by`, prerequisite issue IDs)

---

## 9. Output Format

When requested by policy, provide code changes as unified diff.
Keep unrelated lines untouched.

---

## 10. Mandatory Delivery Flow (Every Change)

The following flow is mandatory for every implementation/fix task:

1. Task management
   - Add/update task in `TASKS.md` first (`TASK INDEX` + detail section)
   - Keep status order and Task ID descending rules
   - Create/update corresponding GitHub Issue and keep `TASK`/`Issue` linked
2. Branch management
   - Create branch from latest `main`
   - Branch format: `<type>/TASK-<id>-<short-description>`
3. Implementation and tests
   - Implement with minimal diff
   - Run required checks with no omission:
     - `npm run lint`
     - `npx vitest run`
     - UI/route impact exists: `npm run test:e2e`
     - DB dependent change exists: required DB integration test
4. Self review (initial)
   - Review the intended diff before opening PR
   - Ensure no unrelated changes are included
5. PR creation
   - Open 1 task = 1 PR
   - Open as a ready-for-review PR by default (use draft only when explicitly requested)
   - Fill PR checklist:
     - 必須チェック（Lint, Vitest, DB Integration, E2E）が通っている
     - 関連Issueをクローズした（マージ後）
6. CI confirmation
   - Confirm required checks are green before merge
   - If failed, fix and re-run until green
7. Merge to `main`
   - Merge only after CI is green
   - Close corresponding GitHub Issue
   - Delete merged branch and update local `main`

Do not mark work done before this full flow is completed.
