# ARCHITECTURE.md

## 1. Architecture Overview

- Frontend: Next.js App Router
- Backend: Next.js Route Handlers (`src/app/api`)
- Database/Auth/Storage: Supabase
- Validation: Zod

## 2. Layering

- `src/app`: routing + page composition
- `src/components`: reusable UI
- `src/lib`: business logic / data access / integrations
- `src/types`: shared types
- `tests`: unit/integration/e2e

Rules:
- Keep business rules in `src/lib`
- Keep route handlers thin (validate -> call service -> map response)
- Avoid circular dependencies

## 3. Data Flow

1. UI submits action
2. Route handler validates input (Zod)
3. Service in `src/lib` executes domain logic
4. Supabase queried via typed client
5. Typed response returned

## 4. Non-functional Requirements

- Type safety first (strict mode)
- Tenant/store isolation (RLS)
- Predictable error handling
- Testability and modularity

## 5. Test Strategy

- Unit: domain logic / utilities
- Integration: API + Supabase mocks or test DB
- E2E: key user flows
- Mandatory checks before merge: lint + unit + affected e2e
