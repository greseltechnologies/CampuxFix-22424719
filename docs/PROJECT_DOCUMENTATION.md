# CampusFix Project Documentation

## AI-Powered Campus Issue Reporting and Facilities Management Platform

**Version:** 2.0  
**Student:** Ishmael Essilfie  
**Student ID:** 22424719  
**Course:** CSCD 602 Advanced Software Engineering  
**Date:** 13 August 2026

## 1. Executive summary

CampusFix provides one accountable route for campus problems. A user describes a fault in normal language; the system recommends a category, priority, responsible department, concise summary and safety flag. The user reviews those suggestions, checks likely duplicates and either joins an existing issue or creates a separate report. Operational staff then process the issue through a controlled lifecycle with notes, evidence, notifications, service targets, user verification and an audit trail.

The implemented release is an interactive, responsive demonstration of the complete vertical workflow rather than a claim to be a finished university enterprise system. It includes six role views reached through one common sign-in, automatic administrator-assigned role routing, a user profile, explainable local AI assistance, seeded Ghanaian university-style data, dashboards, issue search, a campus map, grounded question answering, analytics, maintenance work management and administration/audit views. A normalized PostgreSQL reference schema supports planned production persistence. The public demonstration intentionally uses browser-local data so it remains usable without external credentials.

## 2. Problem statement

Campus faults are often reported verbally, in informal messaging groups or through disconnected offices. Details are incomplete, repeated reports create noise, urgent safety hazards may not be distinguished from routine requests, and reporters cannot see whether work was assigned or completed. Managers also lack consistent service data for identifying recurring locations, breached targets and maintenance trends.

CampusFix addresses this by combining a controlled service workflow with AI assistance. AI reduces the effort of categorising natural-language reports, but human users remain responsible for confirming classification, priority, safety action and final closure.

## 3. Aim and objectives

The aim is to design, implement, test and deploy a maintainable web application that demonstrates disciplined requirements engineering and a meaningful AI-assisted campus maintenance workflow.

The objectives are to:

- let students and lecturers submit a clear report in natural language;
- classify and summarise the report and recommend priority and department;
- identify explicit safety language and keep safety-critical decisions under human control;
- compare new reports with open records and allow the user to join a likely duplicate;
- provide role-appropriate dashboards for reporters, maintenance personnel and management;
- control status transitions from reporting through assignment, repair, verification and closure;
- record affected-user confirmations, notes, evidence metadata, notifications and audit events;
- provide grounded issue-status answers and data-derived management insights;
- demonstrate a secure, normalized production data design and graceful AI fallback; and
- document testing, debt, maintenance and future evolution honestly.

## 4. Stakeholders and users

| Stakeholder or role | Main need | Release support |
|---|---|---|
| Student | Simple reporting, tracking, following and repair verification | Implemented |
| Lecturer | Teaching-location reports and status tracking | Implemented |
| Maintenance staff | Assigned queue, work notes and controlled progress | Implemented |
| Department manager | Department workload, SLA attention and assignment oversight | Implemented demonstration |
| System administrator | Add, update, activate, deactivate and delete users; review categories, locations, SLA, analytics and audit | Implemented demonstration |
| Super administrator | Institution and system-wide configuration | Implemented demonstration |
| Facilities management | Reliable trend, workload and satisfaction evidence | Implemented from seeded/live demo data |
| IT and security team | Identity, authorization, validation, audit and safe deployment | Designed; external services require configuration |
| Examiner | Functional live system and traceable lifecycle evidence | Included in submission package |

No stakeholder interview is claimed. Requirements were elicited through scenario analysis, task decomposition, risk analysis and the supplied CampusFix product requirements. Representative-user acceptance remains a real human activity and is not fabricated.

## 5. Requirements analysis and prioritisation

Requirements were first grouped by business value and dependency. MoSCoW prioritisation prevented the large product vision from becoming an untestable collection of screens.

### 5.1 Must-have release scope

- Common credential sign-in, automatic role routing, user profile and six administrator-assigned role identities.
- Natural-language issue reporting with validation and optional evidence metadata.
- Editable AI classification, priority, routing, summary and safety output.
- Similar-report detection and affected-user joining.
- Controlled issue lifecycle and role-aware actions.
- Reporter verification, reopening and service rating.
- Role dashboards, campus issue search and issue detail.
- Maintenance queue, notifications, SLA indicators and audit history.
- Grounded CampusFix AI Assistant and database-derived analytics.
- Responsive interface with icon navigation and campus-photo login, automated tests, deployable build and live URL.
- Normalized PostgreSQL reference schema with keys, constraints, indexes and RLS design.

### 5.2 Should-have scope implemented

- Schematic campus map with priority markers.
- Evidence metadata grouped as evidence, before and after.
- Management trend briefing and satisfaction metrics.
- Comment/work-note recording.
- Demonstration reset for reliable examiner use.

### 5.3 Deferred product roadmap

- Real binary upload to object storage and provider-backed pixel-level vision analysis.
- Email delivery, password reset and email verification in the public demonstration.
- Production PostgreSQL connection and server-side REST implementation.
- Real GIS tiles, SMS/push delivery and multi-institution provisioning.
- Predictive maintenance trained on sufficient equipment history.
- Automated assignment optimisation, procurement and inventory integration.

Deferred functions are not presented as completed. Interfaces and data entities are designed so they can be added without replacing the core domain model.

## 6. Software effort estimation

### 6.1 Technique and assumptions

A Work Breakdown Structure combined with three-point PERT estimation was selected because the release has identifiable engineering work packages and several uncertain integrations. For each package, expected effort is `(optimistic + 4 x most likely + pessimistic) / 6`.

Assumptions: one developer; existing familiarity with React and TypeScript; managed hosting available; no external AI or database key supplied; demonstration data may be used; and scope changes are handled by deferring low-priority integrations rather than weakening core workflow quality.

| Work package | Optimistic | Most likely | Pessimistic | PERT expected person-hours |
|---|---:|---:|---:|---:|
| Requirements, scope and acceptance criteria | 4 | 5 | 6 | 5.0 |
| Architecture, domain model and database design | 3 | 4 | 6 | 4.2 |
| Explainable AI services and fallback behavior | 5 | 7 | 10 | 7.2 |
| Role interface and end-to-end workflow | 8 | 11 | 14 | 11.0 |
| Unit, integration, functional and live checks | 5 | 7 | 9 | 7.0 |
| Deployment, documentation and packaging | 5 | 7 | 10 | 7.2 |
| **Base estimate** |  |  |  | **41.6** |

A ten-percent risk reserve gives a planning estimate of about 45.8 person-hours. The largest uncertainty is external service configuration. This estimate directly removed real-time email, live vision inference, production database migration and predictive maintenance from the implemented release, while preserving a demonstrable report-to-closure workflow.

## 7. System analysis

### 7.1 Main use cases

| Actor | Use case | Successful outcome |
|---|---|---|
| Student or lecturer | Report issue | Validated, reviewed AI suggestions produce a routed issue |
| Community user | Join similar report | Existing issue affected-user count increases once |
| Maintenance staff | Process assignment | Accepted task advances with an accountable note |
| Manager | Monitor department | Workload and SLA exceptions are visible |
| Reporter | Verify resolution | Fixed issue closes and stores rating, or reopens with reason |
| Administrator | Inspect operations | Analytics, configuration summary and audit records are available |
| Any authenticated user | Ask AI Assistant | Answer is based on matching issue data or explicitly reports no match |

### 7.2 Business rules

- AI suggestions are editable and do not override an authorised user.
- Immediate danger must be handled through campus security or emergency procedures first.
- A community user can join an issue once; joining increases the affected-user count.
- Only the original reporter can confirm or reopen a resolution.
- Maintenance staff see their assigned or departmental work; management views are role protected.
- Status changes follow the permitted transition map and produce an audit event.
- Closed, rejected and cancelled issues are excluded from duplicate suggestions.
- Assistant answers use current issue records and say when no match is found.

## 8. System design

### 8.1 Architecture

```text
Responsive React/TypeScript client
        |
        +-- Role-aware UI and workflow controls
        +-- Repository interface
        |       +-- Demonstration adapter: versioned localStorage
        |       +-- Production target: REST/Supabase adapter
        |
        +-- Modular AI service layer
                +-- Classifier and entity extraction
                +-- Priority and safety predictor
                +-- Duplicate detector
                +-- Extractive summarizer
                +-- Evidence-analysis adapter
                +-- Grounded assistant
                +-- Trend analyzer

Production target
        +-- PostgreSQL normalized schema and row-level authorization
        +-- Object storage for evidence
        +-- Email provider and scheduled SLA monitoring
        +-- Provider-neutral external AI adapter
```

The repository boundary keeps the UI independent of storage. The AI module returns typed results, confidence and reasons. Core issue functions use those results as suggestions, so reporting remains operational when an external model is unavailable.

### 8.2 Component responsibilities

| Component | Responsibility |
|---|---|
| `AuthScreen` | Common sign-in without public registration or role selection |
| `IssueReportWizard` | Describe, attach, analyse, review, duplicate-check and submit |
| `IssueDetail` | Full issue data, evidence, notes, workflow, verification and audit |
| `AppWorkspace` | Icon-based role navigation, profile/logout, page state, data refresh and notifications |
| `ai.ts` | Provider-independent classification, priority, duplicate, summary, assistant and trend logic |
| `repository.ts` | Versioned data persistence and auditable domain operations |
| `validation.ts` | Input constraints, lifecycle transitions and SLA targets |
| `schema.sql` | Normalized production data model, indexes, triggers and RLS baseline |

### 8.3 Data design

The normalized schema separates identity and authorization from institution, campus, building, floor and room hierarchy. Issues reference reporter, location, category and department. Attachments, comments, status history, assignments, followers, votes, notifications, SLA events, ratings, maintenance records, AI results, recommendations and audit logs use independent tables. Frequently queried reporter, queue, location, SLA, notification, audit and full-text fields are indexed.

### 8.4 AI decision design

| Service | Current method | Guardrail |
|---|---|---|
| Classification | Weighted domain keyword profiles | Editable; low-match reports become Other |
| Priority prediction | Safety, essential-service, scale and category signals | Safety output requires human confirmation |
| Duplicate detection | Token-set similarity plus category/building/room weights | User may join or create separately |
| Summarisation | Extractive first-actionable-sentence reduction | Original description is retained |
| Evidence assistance | Report context and attachment metadata fallback | Clearly states it is not pixel diagnosis |
| Assistant | Issue ID and text retrieval over current records | Says when no matching record exists |
| Trend analysis | Counts, open/overdue state and location grouping | Uses only actual visible records |

## 9. Implementation

The application uses React 19, TypeScript and Vite. It is a single-page application with one common sign-in, automatic routing from the stored account role, icon-based role-controlled navigation, a user profile and responsive layouts for mobile and desktop. The login presents the supplied campus image beside the credential form on desktop. Demonstration data persists in versioned browser storage and can be reset from the sidebar. The seed covers three campuses, multiple departments, every role, several priorities, SLA breaches, a resolved issue with before/after metadata, comments, ratings and the required exposed-wiring scenario.

The report wizard follows the intended low-friction sequence: describe, attach, analyse, review AI suggestions, confirm the location, check similar reports and submit. The classification response includes confidence and reasons. Priority logic recognises explicit risks such as exposed wiring, smoke and shock. Duplicate scoring combines report language with category and location. The assistant retrieves an actual issue before answering status questions.

The controlled workflow supports reported, AI analysis, verified, assigned, acknowledged, in progress, awaiting parts, resolved, user verification and closed, with rejected, reopened, escalated and cancelled branches. Allowed transitions are restricted by role in the interface and recorded by the repository. The administration workspace supports adding, updating, activating, deactivating and deleting users. It prevents a normal administrator from changing a super administrator or removing/deactivating the signed-in account, and records each change in the audit trail.

## 10. Security and privacy

The public release is an examination demonstration and must not contain real personal or sensitive information. It stores only fictional seed records and user-created demonstration data in the current browser. Evidence files are validated for media type and size, but the public build records metadata rather than uploading binary content.

The production design uses managed authentication, hashed passwords outside the application schema, active-account checks, role and permission tables, JWT/session identity, row-level policies, constraints, file limits, audit logs and environment variables. A production API must add rate limiting, CSRF controls where cookie sessions are used, MIME/content validation, safe error mapping and provider-side secret storage. Service-role and AI keys must never be placed in `VITE_` variables.

## 11. Testing and quality assurance

Twenty-two automated tests cover AI behavior, validation, SLA calculation, workflow authorization, common sign-in and role routing, profile logout, persistence, joining, rating, administrator user management and role-sensitive UI journeys. Type checking and the production build are also executed. The testing report records expected and actual results, defects and remaining security/integration work. Live browser checks cover sign-in, reporting, navigation, assistant output, analytics, administrator add/update/delete, profile logout, responsive rendering and console errors.

## 12. Technical debt management

The main deliberate debt is the demonstration storage adapter. It makes the live site reliable without external credentials but is not shared multi-user persistence. Other debt includes context-only evidence analysis, no real email delivery, schematic map data, no deployed REST service, limited performance evidence and no automatic CI pipeline. Each item is recorded as Debt -> Cause -> Impact -> Priority -> Resolution with a release target in the separate debt plan.

## 13. Deployment

The production build is hosted at `https://campusfix-22424719.vercel.app`. The same credential form serves every role and automatically opens the workspace permitted by the account's assigned role. Demonstration credentials are listed in the user manual and deployment-links file. A reset control restores deterministic seed data for examination.

Deployment verification checks the production HTTP response, page title, visible sign-in, role login, key navigation, issue wizard, AI result, assistant answer and absence of console errors. Source, schema, tests and documents are included in the submission package.

## 14. Maintenance strategy

- **Corrective:** reproduce defects with a test, repair the smallest responsible module and add regression coverage.
- **Adaptive:** monitor Vite, React, browser, Supabase, Vercel and AI-provider changes; test upgrades in a preview deployment.
- **Perfective:** use feedback and analytics to simplify reporting, improve routing and refine dashboards.
- **Preventive:** review dependencies, authorization policies, audit retention and recovery procedures on a regular schedule.
- **Operational:** monitor availability, client errors, SLA jobs, email delivery and AI-provider failures when production services are connected.
- **Data:** define backup, restore, retention, deletion and multi-campus isolation procedures before live institutional use.

## 15. Future evolution

Version 2.1 should connect managed authentication, PostgreSQL, storage and email and run contract/security tests. Version 2.2 should add real map tiles, audited administration and server-side filtering. Version 2.3 can connect a vision-capable provider through the AI interface and compare before/after evidence. Predictive maintenance should only be introduced after enough reliable equipment, maintenance and failure history exists; evaluation must compare predictions with a simple statistical baseline and record false positives.

Multi-institution operation requires tenant-scoped policies, institution-aware configuration, per-tenant encryption/retention rules and tested isolation. The existing institution and campus keys provide the data-model foundation but do not by themselves prove tenant security.

## 16. Limitations

- Public demonstration data is browser-local and does not synchronize across devices.
- Demonstration passwords are convenience fixtures, not production authentication.
- Attachment content is not uploaded; metadata only is retained in the demonstration.
- Evidence analysis is a context/metadata fallback, not pixel-level vision inference.
- Email, SMS, push, password reset and verification delivery are not active.
- The campus map is schematic and not a real geospatial service.
- Predictive maintenance is intentionally not presented without adequate historical data.
- The PostgreSQL schema is a production design baseline and has not been applied to the public demonstration.

## 17. Conclusion

CampusFix demonstrates a complete, testable software-engineering vertical slice: requirements and estimation guide scope; typed modules separate UI, AI, validation and persistence; the issue lifecycle is controlled and audited; AI adds useful classification, prioritisation, duplicate detection, summarisation, retrieval and insights without replacing business rules; and the deployed system remains functional without an external AI provider. The documented limitations and repayment plan distinguish a credible release from an unsupported claim of enterprise completeness.

## 18. References

- React documentation, https://react.dev/
- TypeScript documentation, https://www.typescriptlang.org/docs/
- Vite documentation, https://vite.dev/guide/
- PostgreSQL documentation, https://www.postgresql.org/docs/
- Supabase documentation, https://supabase.com/docs
- Vercel documentation, https://vercel.com/docs
- OWASP Application Security Verification Standard, https://owasp.org/www-project-application-security-verification-standard/
- ISO/IEC/IEEE 29148 requirements-engineering principles.
