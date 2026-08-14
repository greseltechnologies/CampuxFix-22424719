# CampusFix

CampusFix is an AI-assisted campus issue reporting, facilities management and service-request platform developed by Ishmael Essilfie (22424719) for CSCD 602 Advanced Software Engineering.

Live application: https://campusfix-22424719.vercel.app

## What the demonstration implements

- Six role views: student, lecturer, maintenance staff, department manager, administrator and super administrator
- One common sign-in that applies the administrator-assigned role automatically, plus a user profile with logout
- Natural-language issue reporting with editable AI classification, priority, routing, safety explanations and summaries
- Similar-report detection with a join/affected-user workflow
- Evidence metadata analysis with a clear assistance disclaimer
- Controlled status transitions, assignments, comments, before/after evidence metadata, verification, reopening and ratings
- Notifications, SLA signals, audit history, role dashboards, analytics, campus map and grounded issue-status assistant
- Administrator user management for adding, editing, activating, deactivating and deleting demonstration accounts, with audit events and self-protection
- Explainable local AI fallback so the reporting workflow remains usable without an external provider
- Responsive, accessible React interface with icon navigation, a campus-photo login layout and realistic fictional Ghanaian university-style data

The public examination build deliberately uses versioned browser storage. It is safe to explore and reset, but records are not shared between devices. The normalized PostgreSQL schema in `supabase/schema.sql`, seed data in `supabase/seed.sql`, REST contract and provider variables describe the production evolution; they are not presented as a deployed cloud database or live external AI service.

## Architecture

- React 19, TypeScript and Vite
- Repository contract separating interface logic from persistence
- Modular AI services for classification, priority, duplicate detection, evidence assistance, summarization, grounded chat and trends
- Normalized PostgreSQL/Supabase reference schema with constraints, indexes, audit entities and row-level-security baseline
- Vitest and Testing Library for automated unit, repository-integration and UI-flow tests
- Playwright desktop/mobile end-to-end specifications
- Vercel static deployment

## Run locally

1. Install Node.js 20 or later and pnpm.
2. Run `pnpm install`.
3. Run `pnpm dev`.
4. Open the local address shown in the terminal.
5. Enter a demonstration email and the common password, then choose **Sign in**. The assigned role opens automatically.

All demonstration accounts use the password `Demo123!`:

| Role | Email |
|---|---|
| Student | `student@campusfix.test` |
| Lecturer | `lecturer@campusfix.test` |
| Maintenance staff | `maintenance@campusfix.test` |
| Department manager | `manager@campusfix.test` |
| System administrator | `admin@campusfix.test` |
| Super administrator | `superadmin@campusfix.test` |

Use **Reset demonstration data** in the sidebar to restore the original scenario.

## Quality checks

```text
pnpm run typecheck
pnpm run test:run
pnpm run build
pnpm run test:e2e
```

The verified release passes the TypeScript check, production build and all 22 automated tests in four test files. The deployed site was also checked for common login and role routing, profile logout, student reporting and AI review, grounded assistant output, administrator user management, analytics, audit access and asset/runtime errors.

## Production evolution

The repository contains the artifacts needed to replace demonstration storage with shared services:

- `supabase/schema.sql` — normalized relational design and security baseline
- `supabase/seed.sql` — fictional demonstration data
- `docs/API_CONTRACT.md` — planned REST resources and status codes
- `.env.example` — server-side database and provider settings

That change should be implemented behind the existing repository and AI-service interfaces. Keep AI credentials on the server, add verified authentication and authorization, store uploads in protected object storage, run security tests, and only then enable real email or vision APIs. Core issue reporting must continue to work when AI is unavailable.

## Project evidence

The `docs` folder contains the editable source documentation, including the SRS, test report, technical-debt plan, user manual, API contract, development-tool guide and viva guide. The finished PDFs and submission ZIP are supplied separately in the examination package.

## Ownership and academic responsibility

CampusFix was developed and is owned by Ishmael Essilfie. Development tools provided bounded assistance with planning, code suggestions, review, testing and document drafting; Ishmael selected the design, reviewed the implementation, deployed the release, confirmed the project-owner acceptance results and remains responsible for explaining every architectural, testing and scope decision during the viva. The documented acceptance is a project-owner session rather than an independent multi-user pilot. No shared production database, real notification delivery or external vision result is claimed without evidence.
