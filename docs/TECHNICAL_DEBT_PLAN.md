# Technical Debt Identification and Repayment Plan

## CampusFix version 2.0

**Student:** Ishmael Essilfie  
**Student ID:** 22424719  
**Review date:** 13 August 2026

## 1. Method

Technical debt is recorded when a shortcut or missing quality property increases later cost or risk. A deferred feature is not automatically debt; it becomes debt when the current design makes the future feature harder or when the present release could be misunderstood or unsafe. Each item follows Debt -> Cause -> Impact -> Priority -> Proposed Resolution.

Priority definitions: Critical blocks real institutional use; High is repaid before broader rollout; Medium is scheduled in a named release; Low is accepted temporarily and monitored.

## 2. Debt register

| ID | Debt | Cause | Impact | Priority | State | Proposed resolution and target |
|---|---|---|---|---|---|---|
| TD-01 | Public demonstration uses browser-local persistence | No student-owned database credentials were supplied and a reliable examiner demo was required | Data does not synchronize across devices; storage can be edited by the browser user | Critical for institutional use | Accepted only for demonstration | Implement the production repository against PostgreSQL/REST, run migrations and contract/RLS tests; v2.1, 14 h |
| TD-02 | Demonstration credentials and passwords are local fixtures | Six reproducible role journeys are needed without external accounts | They are not secure identity and must never be used for real users | Critical for institutional use | Clearly labelled | Connect managed authentication, hashing, reset, verification and secure sessions; v2.1, 8 h |
| TD-03 | Evidence upload stores metadata, not binary content | Object storage, malware scanning and retention policy are not configured | Before/after files are not shared or durable | High | Scheduled | Add signed upload URLs, MIME/content scan, 10 MB enforcement, lifecycle deletion and access policies; v2.1, 10 h |
| TD-04 | Evidence analysis uses report context and filename metadata | No vision-provider credential was supplied | It cannot inspect pixels and may produce weak assistance | High | Transparent fallback | Connect a vision-capable adapter server-side, validate JSON output, add image test set and show model/confidence; v2.2, 12 h |
| TD-05 | Role restrictions are enforced in the demonstration UI/repository | The deployed release has no shared server boundary | A user can manipulate their own local demonstration data | Critical for real data | Demonstration only | Enforce JWT identity, permission middleware and PostgreSQL RLS; test horizontal and vertical privilege escalation; v2.1, 12 h |
| TD-06 | No deployed REST API | Scope prioritised the complete user workflow and normalized data design | External clients and centralized validation are unavailable | High | Scheduled | Implement versioned Node/Express TypeScript services with schema validation, rate limiting and safe errors; v2.1, 18 h |
| TD-07 | In-app notifications are synchronous local events | Email provider and scheduled jobs are not connected | No off-site delivery; SLA escalation depends on viewing the demo | High | Scheduled | Add transactional email, retry queue, delivery state and scheduled SLA evaluator; v2.2, 12 h |
| TD-08 | Campus map is schematic | No institutional coordinates or GIS provider were supplied | Markers are illustrative, not navigation-grade | Medium | Accept temporarily | Add approved geocoding/map tiles, coordinate validation, clustering and privacy review; v2.2, 8 h |
| TD-09 | Local AI classifier is keyword/feature based | Explainability and offline operation were prioritised | Language variations and ambiguous reports reduce accuracy | Medium | Accepted fallback | Collect labelled, anonymized reports; measure precision/recall; combine provider output with rules and confidence thresholds; v2.2, 16 h |
| TD-10 | Trend insights use descriptive counts rather than time-series anomaly models | Seed history is too small for responsible anomaly or prediction claims | Insights are useful but cannot predict equipment failure | Medium | Correctly limited | Build monthly aggregates; require sufficient history; compare seasonal baseline and anomaly model; v3.0, 20 h |
| TD-11 | Issue data is loaded and filtered in the client | Demonstration dataset is small | Large datasets would increase load time and memory | Medium | Scheduled | Add cursor pagination, indexed server filters, caching and performance tests; v2.1, 8 h |
| TD-12 | Audit events are mutable browser records in demo mode | Central append-only storage is not connected | Demonstration audit is not tamper-evident | High | Scheduled | Use database-only inserts, restricted retention, immutable export and monitoring; v2.1, 8 h |
| TD-13 | Automated CI is not connected to a hosted source repository | External repository access is not configured in this workspace | Test execution relies on local release procedure | Medium | Scheduled | Add repository, protected main branch and CI gates for typecheck, tests, build and browser smoke; next release, 4 h |
| TD-14 | Runtime Google Font request remains | Fast consistent visual design | Offline appearance differs and a third party receives a font request | Low | Accepted temporarily | Self-host licensed font files or use the system stack; v2.2, 2 h |
| TD-15 | Formal load, recovery and cross-browser evidence is limited | Central services are not connected | Capacity and recovery objectives are unproven | High for production | Release gate | Define workload/RPO/RTO, load-test API, perform backup/restore drill and test supported browsers; v2.1, 10 h |

## 3. Classification and release gates

### Critical before real institutional use

TD-01, TD-02 and TD-05 are release gates. Real users or sensitive evidence must not be placed in the public demonstration. These items are acceptable only because the site is labelled and seeded with fictional data.

### High before wider pilot

TD-03, TD-04, TD-06, TD-07, TD-12 and TD-15 must be repaid before a multi-user pilot. Evidence and audit are particularly sensitive because misleading durability would undermine trust.

### Scheduled or accepted temporarily

TD-08 to TD-11, TD-13 and TD-14 are controlled and visible. They do not prevent an examination demonstration, but they have owners, evidence and target releases so they do not silently become permanent.

## 4. Repayment roadmap

| Release | Repayment work | Exit evidence |
|---|---|---|
| v2.1 - Shared service baseline | TD-01, TD-02, TD-03, TD-05, TD-06, TD-11, TD-12, TD-13, TD-15 | Database migrations, API/RLS/abuse tests, storage scan, CI run, backup restore report |
| v2.2 - Assisted operations | TD-04, TD-07, TD-08, TD-09, TD-14 | Vision evaluation set, email delivery logs, real map acceptance, classifier metrics, self-hosted assets |
| v3.0 - Evidence-based prediction | TD-10 | Minimum history threshold, baseline comparison, false-positive analysis and management approval |

## 5. Prioritisation model

Debt is reviewed using severity, likelihood, exposure, repayment cost and dependency. Critical identity/data-isolation debt is repaid before feature growth. A feature that depends on untrusted data is not promoted until input, authorization and audit controls are verified. Trend or predictive work is not started until data quality and sample size are adequate.

## 6. Debt prevention

- Keep requirements, source, tests and documents traceable by stable identifiers.
- Require typed AI results and schema validation at provider boundaries.
- Add a regression test before correcting a defect.
- Apply database changes through migrations with rollback/backup plans.
- Treat authorization as a server/data concern, not a hidden-button concern.
- Record new shortcuts during review rather than waiting for release day.
- Review dependencies and security advisories before every production release.
- Do not label a designed or mocked integration as deployed.

## 7. Tracking and acceptance

An item is repaid only when implementation, tests, operational evidence and documentation are complete. Closing TD-01, for example, requires more than connecting a database: role isolation, concurrent updates, migration, backup and restore must also pass. The debt register is reviewed after incidents, significant requirements changes and each planned release.
