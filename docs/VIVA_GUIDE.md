# CampusFix Viva and Demonstration Guide

## Student: Ishmael Essilfie - 22424719

Use this to practise the ideas in your own words. Do not memorise an answer you cannot explain or claim that a deferred integration is live.

## One-minute explanation

CampusFix solves the untraceable way campus faults are often reported. A student or lecturer describes a problem normally. The AI layer recommends a category, priority, department, summary and safety flag, but the user reviews everything. Before submission it searches open reports, so the user can join a likely duplicate instead of creating noise. Operational roles process the issue through a controlled lifecycle with SLA state, notes, evidence metadata, notifications and audit history. The original reporter verifies the repair and can close and rate it or reopen it. Management dashboards and the assistant are grounded in actual issue records. The public release uses safe fictional browser-local data, while the submission includes a normalized PostgreSQL production design.

## Architecture explanation

The React UI does not call storage directly. It uses a repository interface containing domain operations such as create, join, comment, status update and verify. The demonstration repository persists versioned JSON in localStorage. A production repository can implement the same contract through a REST API and PostgreSQL. AI logic is another separate module, so classification, duplicate detection or an external provider can change without rewriting the workflow screens.

Core business rules remain outside external AI. Validation, allowed status transitions, one-person-one-vote behavior, SLA targets, reporter-only verification and audit creation continue to work even if a model is unavailable.

## Likely questions and defensible answers

### 1. Why is this not just CRUD?

CRUD would only create and edit issue records. CampusFix interprets free text, explains category and safety decisions, scores duplicates, tracks community impact, enforces a role-dependent state machine, calculates SLA exposure, grounds assistant answers in issue data, generates operational insights and requires human verification before closure.

### 2. What makes the AI meaningful?

It changes user and operational decisions. It reduces category knowledge needed from the reporter, raises explicit safety hazards, recommends routing and priority, compresses long descriptions, prevents likely duplicates and answers status questions from retrieved records. The output is typed, includes confidence/reasons and remains editable.

### 3. Is the current classifier a large language model?

No. The live fallback is an explainable feature-based model using campus-domain terms and risk signals. This was selected so the workflow works without a secret API key. The same typed service interface can call an external language/vision provider server-side. I would not call the current attachment analysis pixel-level vision; it uses report context and file metadata and says so in the UI.

### 4. How does duplicate detection work?

The text is normalized into unique meaningful tokens. Jaccard-style token similarity supplies most of the score, then same category, building and room add weighted evidence. Terminal issues are excluded. A threshold exposes likely matches and the user decides whether to join or create separately.

### 5. How is priority predicted?

Rules evaluate explicit safety terms, emergency phrases, essential services and estimated scope. Fire or major active hazards map to Emergency, exposed wiring and shock indicators to Critical, essential-service outages to High, routine localized requests to Medium, and clearly minor single-item faults may be Low. The reasoning is shown and a human confirms it.

### 6. Why can AI not close an issue?

Closure affects safety and accountability. Maintenance can report completion, but the original reporter or an authorized process must verify the outcome. AI may assist with comparison, but cannot replace inspection, safety procedures or authority.

### 7. What is grounded retrieval in the assistant?

The assistant first searches the current issue list by reference and meaningful terms. It only states status, priority, department and update date from the matched record. If no score is strong enough, it reports no match. This prevents invented issue status.

### 8. Which estimation method did you use?

I used a Work Breakdown Structure with three-point PERT. For each engineering package I estimated optimistic, most-likely and pessimistic hours and calculated `(O + 4M + P) / 6`. The base estimate is about 41.6 person-hours and the risk-adjusted planning estimate is about 45.8.

### 9. How did estimation change scope?

The largest uncertainties were production identity/data integration, binary evidence storage, email and external AI. I protected the complete report-to-verification workflow and deferred those external services. Predictive maintenance was also excluded because credible prediction needs enough historical equipment data.

### 10. Explain the workflow.

The main states are Reported, AI Analysis, Verified, Assigned, Acknowledged, In Progress, Awaiting Parts, Resolved, User Verification and Closed. Rejected, Reopened, Escalated and Cancelled are branches. The allowed-transition map varies by role and every change records an audit event.

### 11. How is the database normalized?

Identity, roles and permissions are separate. The location hierarchy uses institution, campus, building, floor and room tables. Issues reference category, reporter, department and location. Repeating data such as attachments, comments, status history, assignments, followers, votes, notifications, SLA events, ratings, maintenance records, AI results and audit logs are separate related tables. Queue, location, SLA, notification, audit and full-text fields are indexed.

### 12. Where is authorization enforced?

In the demonstration it is enforced by permission-filtered navigation and repository operations, but local browser data is not a secure multi-user boundary. The production design enforces identity and authorization through JWT/session middleware and PostgreSQL row-level policies. I clearly classify that integration as a release gate.

### 13. Are the demo passwords secure?

No; they are deliberate fictional fixtures for repeatable assessment. A real release must use a managed authentication service where password hashes and reset tokens are outside the application tables.

### 14. What tests were executed?

Twenty-two automated tests cover AI classification, prioritisation, summarisation, duplicate matching, grounded answers, validation, SLA mapping, workflow permissions, common authentication and role routing, profile logout, persistence, joining, audit, administrator user management, verification/rating and role-sensitive UI journeys. Type checking and the production build pass. The final report separately records live browser checks.

### 15. What is the most important debt?

The browser-local repository and demonstration authentication are the largest debt for real use because they do not provide shared, tamper-resistant multi-user data. They are clearly labelled and scheduled before any institutional pilot. Binary storage, external vision, REST, email and append-only audit follow.

### 16. Why does predictive maintenance remain future work?

A prediction model without enough equipment age, failure, usage and repair history would be theatre. The schema has maintenance records, but a later release should set a minimum sample threshold, build a baseline, evaluate false positives and only then expose a prediction with uncertainty.

### 17. How does the system scale to multiple institutions?

The schema keys campuses, departments, categories, issues, SLA and audit data to an institution. Scaling also requires tested tenant policies, per-tenant settings, retention and isolation. Adding an institution column alone is not sufficient security.

### 18. How does AI fail gracefully?

The browser uses an explainable local model by default, so there is always a result. A future external adapter returns a typed success or unavailable response. The user can still select fields manually, and validation/business rules do not depend on the provider.

### 19. What would you improve first?

Connect shared authentication/database/storage through the repository boundary, implement the REST layer, test authorization and file security, then enable transactional notifications. External vision and model improvement come after the data/security baseline.

### 20. How can you prove traceability?

Pick an SRS identifier such as FR-DUP-04. It maps to `joinIssue` in the repository, the I Am Affected/Join Existing UI and a repository test that verifies the count increases once. The testing report lists the same behavior and result.

## Demonstration script

1. Open the production URL and identify the fictional local demonstration mode.
2. Enter the Student credentials on the common sign-in page and explain that the stored account role determines the workspace.
3. Report: `There is exposed electrical wiring beside the entrance of Lecture Theatre 4.`
4. Show Critical, Electrical, safety risk, Electrical Unit, confidence and editable fields.
5. Confirm location and explain duplicate scoring.
6. Open CF-1042 and ask the AI Assistant whether it is fixed.
7. Sign in as Maintenance Staff and acknowledge CF-1048 with a work note.
8. Sign in as Student, open CF-1035, verify it and rate the service.
9. Sign in as Administrator and show analytics, role controls and audit history.
10. Open My Profile, show the assigned role and log out.
11. Explain the production schema and the top three debt items.

## Never bluff

- Do not say the public demonstration shares data across devices.
- Do not say evidence files are uploaded or visually inspected by a model.
- Do not call local fixtures secure production authentication.
- Do not say email, SMS or predictive maintenance is active.
- Do not claim a PostgreSQL migration was run if it was not.
- If asked about a limitation, explain its reason, risk, control and repayment evidence.
