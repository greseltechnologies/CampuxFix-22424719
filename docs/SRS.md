# Software Requirements Specification

## CampusFix - AI-Powered Campus Issue and Facilities Management Platform

**Version:** 2.0  
**Student:** Ishmael Essilfie  
**Student ID:** 22424719  
**Course:** CSCD 602 Advanced Software Engineering  
**Date:** 13 August 2026

## 1. Introduction

### 1.1 Purpose

This SRS defines the verifiable release baseline for CampusFix. It separates requirements demonstrated in the deployed release from planned production integrations, avoiding the assumption that a design artefact is already operational.

### 1.2 Product scope

CampusFix is a responsive web platform for reporting, triaging, routing, processing and analysing campus issues. It supports students, lecturers, maintenance staff, department managers, administrators and super administrators. AI services assist with classification, priority, duplication, summarisation, evidence context, grounded questions and trend insights. Human review remains mandatory for safety and closure decisions.

### 1.3 Definitions

| Term | Definition |
|---|---|
| AI suggestion | Editable recommendation produced by a local or external AI provider |
| Affected user | Authenticated user who joins/follows an existing issue |
| SLA | Target time for response or resolution based on priority |
| RLS | Database row-level authorization policy |
| Grounded answer | Answer retrieved from actual system records rather than invented data |
| Demonstration adapter | Versioned browser storage used by the public release |
| Production adapter | Planned REST/PostgreSQL/Supabase persistence implementation |

## 2. Overall description

### 2.1 User classes

| Role | Primary capabilities |
|---|---|
| Student | Sign in with an administrator-provisioned account, report, attach evidence metadata, track, join, comment, verify, rate, view notifications and ask AI |
| Lecturer | Report teaching-related faults, track, join, comment and ask AI |
| Maintenance staff | View assigned/department work, acknowledge, update, note, resolve and view workload |
| Department manager | View department queue, SLA state, performance and escalations |
| System administrator | View all issues, users, analytics, configuration summaries and audit events |
| Super administrator | Institution-wide administration and security configuration target |

### 2.2 Operating environment

The client supports current desktop and mobile browsers and is built with React, TypeScript and Vite. The public build is hosted over HTTPS. Demonstration records use browser storage. The production target uses PostgreSQL, managed authentication, object storage, a REST boundary and provider-neutral AI services.

### 2.3 Constraints

- External database, email and AI credentials were not supplied.
- The deployed release must remain demonstrable if an external AI provider is unavailable.
- The product vision is larger than the implemented release, so deferred integrations must be labelled.
- No real personal data may be used in seed records.
- Safety procedures and authorized staff decisions take precedence over AI output.

### 2.4 Assumptions

- Each authenticated user has one active role in the demonstration.
- Managers and maintenance staff are associated with a department.
- A campus location can be represented by institution, campus, building, floor and room/facility.
- Production email, maps, storage and AI providers will be selected by the institution.

## 3. Functional requirements

### 3.1 Authentication and authorization

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-AUTH-01 | The system shall provide one common credential form and route each authenticated account according to its administrator-assigned role. | Must | Implemented |
| FR-AUTH-02 | New user accounts and roles shall be created by an administrator; public account creation and role selection shall not be displayed. | Must | Implemented |
| FR-AUTH-03 | The system shall deny incorrect credentials and inactive accounts with a safe message. | Must | Implemented |
| FR-AUTH-04 | Navigation and workflow actions shall be hidden when not permitted by role. | Must | Implemented |
| FR-AUTH-05 | The production target shall hash passwords, verify email, support reset, secure sessions and enforce authorization server-side. | Must for production | Designed/deferred integration |
| FR-AUTH-06 | Logout from the user profile shall remove the active session. | Must | Implemented |
| FR-AUTH-07 | Each signed-in user shall have a profile showing identity, assigned role, department and account state. | Must | Implemented |

### 3.2 Issue reporting and AI review

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-REP-01 | Students and lecturers shall describe an issue using a title and natural-language description. | Must | Implemented |
| FR-REP-02 | The form shall validate title, description, category, priority, department and hierarchical location. | Must | Implemented |
| FR-REP-03 | The user may select image, video or PDF evidence up to 10 MB per item. | Should | Validation/metadata implemented |
| FR-REP-04 | AI shall recommend category, issue type, priority, department, summary, action and safety flag with confidence and reasons. | Must | Implemented |
| FR-REP-05 | The user shall review and edit AI category, priority, department, issue type and location before submission. | Must | Implemented |
| FR-REP-06 | AI failure shall not prevent manual reporting. | Must | Implemented by local fallback architecture |
| FR-REP-07 | A stored report shall receive a human-readable CF reference and SLA target. | Must | Implemented |

### 3.3 Duplicate detection and community confirmation

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-DUP-01 | The system shall compare a draft with non-terminal issues using text, category and location signals. | Must | Implemented |
| FR-DUP-02 | A likely match shall show reference, title, location, status, affected count, confidence and reasons. | Must | Implemented |
| FR-DUP-03 | The user shall choose Join Existing or Create Separate Issue. | Must | Implemented |
| FR-DUP-04 | Joining shall increase the affected count at most once for that user and add an audit event. | Must | Implemented |

### 3.4 Workflow, maintenance and verification

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-WF-01 | The system shall support reported, AI analysis, verified, assigned, acknowledged, in progress, awaiting parts, resolved, user verification and closed states. | Must | Implemented |
| FR-WF-02 | It shall also support rejected, reopened, escalated and cancelled branches. | Must | Implemented |
| FR-WF-03 | Role-aware controls shall expose only permitted next transitions. | Must | Implemented |
| FR-WF-04 | Maintenance staff shall see assigned/department work and may add work notes. | Must | Implemented |
| FR-WF-05 | Before/after evidence purpose shall be associated with an issue. | Should | Seed/metadata implemented |
| FR-WF-06 | A resolution update shall notify the reporter and request verification. | Must | Implemented in demonstration repository |
| FR-WF-07 | The original reporter shall close and rate a fixed issue or reopen an unresolved issue with feedback. | Must | Implemented |
| FR-WF-08 | Every workflow change shall record actor, time, previous value, new value and optional note. | Must | Implemented |

### 3.5 SLA and notifications

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-SLA-01 | Priorities shall map to resolution targets: emergency 2h, critical 4h, high 8h, medium 24h, low 72h. | Must | Implemented |
| FR-SLA-02 | Active issues beyond their target shall be shown as overdue. | Must | Implemented |
| FR-SLA-03 | Notifications shall represent assignment, status, breach and verification events. | Must | In-app demonstration implemented |
| FR-SLA-04 | Users shall mark their notifications as read. | Should | Implemented |
| FR-SLA-05 | Production email delivery and scheduled breach escalation shall be provided. | Should | Deferred integration |

### 3.6 Dashboards, search, map and analytics

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-DASH-01 | Each role shall receive a dashboard appropriate to its workload and permissions. | Must | Implemented |
| FR-DASH-02 | Campus issues shall support global text search and status, priority, category and ownership filters. | Must | Implemented |
| FR-DASH-03 | The map shall show non-sensitive priority markers and open issue details. | Should | Schematic implementation |
| FR-DASH-04 | Management analytics shall include workload, category, priority, SLA, affected users and satisfaction. | Must | Implemented |
| FR-DASH-05 | AI insights shall describe electrical risk, SLA health and location hotspots from actual issue records. | Must | Implemented |
| FR-DASH-06 | A future production view shall filter by date, campus, building and department on the server. | Could | Deferred |

### 3.7 CampusFix AI Assistant

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-AI-01 | The assistant shall answer how-to-report and immediate-safety guidance. | Must | Implemented |
| FR-AI-02 | Status answers shall retrieve a matching current issue and include reference, state, priority, department and update date. | Must | Implemented |
| FR-AI-03 | When no record matches, the assistant shall explicitly say so. | Must | Implemented |
| FR-AI-04 | The assistant shall not expose protected reporter identity. | Must | Implemented by response design |
| FR-AI-05 | A future provider may add institutional FAQs while retaining retrieval and authorization controls. | Could | Deferred |

### 3.8 Administration and audit

| ID | Requirement | Priority | Release status |
|---|---|---|---|
| FR-ADM-01 | Administrators shall view role, user, category, location, SLA, AI and audit summaries. | Must | Demonstration implemented |
| FR-ADM-02 | Managers, administrators and super administrators shall access the audit trail. | Must | Implemented |
| FR-ADM-03 | Administrators shall add, edit, activate, deactivate and delete demonstration users, subject to role and self-account safeguards. | Must | Implemented with audit events |
| FR-ADM-04 | Production administrators shall manage users, roles, locations, categories and SLA rules through secure APIs. | Should | Contract/schema design only |
| FR-ADM-05 | Super administrators shall manage institutions and tenant security. | Could | UI/design only |

## 4. Non-functional requirements

| ID | Requirement and acceptance measure | Release evidence |
|---|---|---|
| NFR-01 Usability | A first-time user shall complete a valid report through three labelled steps with field-level feedback. | Functional UI test and live test |
| NFR-02 Accessibility | Forms shall use labels; controls shall support keyboard focus; status shall use text as well as colour. | Source inspection and browser check |
| NFR-03 Responsiveness | Core pages shall remain usable at 320px and common desktop widths. | Responsive CSS and mobile browser check |
| NFR-04 Reliability | Core reporting and retrieval shall work without an external AI provider. | Local fallback tests |
| NFR-05 Maintainability | TypeScript modules shall separate AI, validation, repository and UI responsibilities. | Source structure/type check |
| NFR-06 Security | Normal user errors shall not expose stack traces, keys or tokens. | Functional/security inspection |
| NFR-07 Authorization | Production access shall be checked at the data/API boundary, not only hidden in the UI. | PostgreSQL RLS design; deployment integration pending |
| NFR-08 Performance | Initial demonstration data shall render without perceptible blocking on a modern device. | Live smoke test; formal load test deferred |
| NFR-09 Auditability | Important issue actions shall include actor, issue, action and timestamp. | Repository tests/audit view |
| NFR-10 Privacy | Public issue views shall not reveal reporter identity to unauthorized users. | Issue-detail behavior |
| NFR-11 AI transparency | AI output shall show confidence/reasons and a human-review disclaimer. | Report wizard and issue detail |
| NFR-12 Portability | The production build shall deploy to a static-capable managed host. | Vite build and Vercel URL |

## 5. Data requirements

The production relational model shall include Users/Profiles, Roles, Permissions, Institutions, Campuses, Buildings, Floors, Rooms, Departments, Issue Categories, Issues, Attachments, Comments, Status History, Assignments, Followers, Votes, Notifications, SLA Rules, SLA Events, Ratings, Maintenance Records, AI Analysis Results, AI Recommendations and Audit Logs. Primary keys, foreign keys, timestamps, constraints and targeted indexes are defined in `supabase/schema.sql`.

Passwords, reset tokens and provider secrets shall not be stored in the application tables. Reporter identity shall not be displayed in public campus issue or map responses. AI input/output shall be retained only according to institutional privacy and retention policy.

## 6. External interface requirements

### 6.1 User interface

Main permission-filtered navigation: Dashboard, Report Issue, Campus Issues, Campus Map, Notifications, AI Assistant, Analytics, Maintenance, Administration, Audit Trail and My Profile. Menu items use recognizable icons as well as text.

### 6.2 REST target

The production adapter shall expose versioned HTTPS endpoints for authentication, issues, comments, votes, assignment, resolution, verification, dashboards, analytics, AI and administration. Requests shall use JSON except multipart evidence uploads. Success shall use appropriate 2xx codes; validation 400/422; unauthenticated 401; forbidden 403; missing 404; conflict 409; rate limit 429; and safe internal failure 500/503.

### 6.3 AI provider interface

AI services shall use a provider abstraction configured through `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL` and `AI_VISION_MODEL` on the server. A provider failure shall return a safe unavailability result and allow manual business workflow. External output shall be schema validated before use.

## 7. Acceptance criteria

1. A student enters credentials on the common sign-in page, is routed to the Student workspace, describes exposed wiring, runs analysis and sees Electrical, Critical, safety risk and Electrical Unit recommendations.
2. The student edits suggestions if desired, confirms a hierarchical location and completes duplicate checking.
3. Joining an existing issue increases its affected count once; creating separately produces a CF reference.
4. Maintenance staff see the electrical assignment and can acknowledge it with an audit event.
5. A reporter can verify CF-1035, enter a rating and close it, or reopen it with feedback.
6. A manager sees SLA breaches and AI insights calculated from issue data.
7. Asking about CF-1042 returns its real current state and department; an unknown query produces a no-match response.
8. Unauthorized roles do not see Maintenance, Analytics, Administration or Audit navigation.
9. An administrator can add, edit and delete a user; the operation is recorded and the signed-in account cannot be deleted or deactivated.
10. A signed-in user can open My Profile, review the assigned role and log out; no role chooser or public account-creation control appears on sign-in.
11. Type checking, automated tests and production build pass.
12. The deployed URL loads over HTTPS and completes the selected live smoke journeys without console errors.

## 8. Requirement traceability summary

| Requirement group | Main implementation | Verification |
|---|---|---|
| Authentication/roles/profile | `AuthScreen.tsx`, `App.tsx`, `repository.ts`, permission-filtered navigation | Repository and UI tests |
| AI triage | `ai.ts`, `IssueReportWizard.tsx` | AI unit tests and reporter journey |
| Duplicate/community | `findDuplicates`, `joinIssue` | AI and repository tests |
| Workflow/verification | `validation.ts`, `IssueDetail.tsx`, repository audit | Workflow/repository tests |
| Dashboard/analytics | `App.tsx`, `generateTrendInsights` | UI navigation and live browser checks |
| Administrator users | `AdminUserManager.tsx`, repository user methods and audit | Repository, UI and live browser checks |
| Production data design | `supabase/schema.sql`, `seed.sql` | Schema review; deployment integration deferred |
| Deployment | Vite build and Vercel production release | Build output and live smoke test |

## 9. Change control

New requirements are evaluated for business value, dependency, risk, effort and tests. A change that affects status rules, role permissions, AI schemas or persistent data requires updated SRS identifiers, migration design, regression tests, technical-debt review and release notes. Working behavior is not removed silently; deprecation and migration are documented first.
