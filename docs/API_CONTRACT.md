# CampusFix Production REST API Contract

This contract describes the production adapter. The public demonstration currently uses the local repository and does not claim these endpoints are deployed.

## Conventions

- Base path: `/api/v1`
- JSON request/response except multipart evidence upload.
- Bearer JWT or secure same-site session cookie.
- Error shape: `{ "error": { "code": "VALIDATION_ERROR", "message": "Safe user message", "fields": {} } }`
- Pagination: `?cursor=<opaque>&limit=25`, maximum 100.
- Idempotency key required for create, vote, assignment and notification side effects.

## Authentication

| Method and path | Purpose | Success |
|---|---|---|
| POST `/auth/register` | Register permitted user | 201 |
| POST `/auth/login` | Create session | 200 |
| POST `/auth/logout` | Revoke session | 204 |
| POST `/auth/forgot-password` | Request reset without account enumeration | 202 |
| POST `/auth/reset-password` | Complete valid reset | 204 |

## Issues

| Method and path | Purpose | Authorization |
|---|---|---|
| GET `/issues` | Search/filter visible issues | Authenticated, tenant scoped |
| POST `/issues` | Create reviewed report | Student/Lecturer |
| GET `/issues/:id` | Read issue detail | Authorized institution user |
| PATCH `/issues/:id` | Edit permitted fields | Reporter before assignment or staff |
| POST `/issues/:id/comments` | Add comment/work note | Authorized follower/staff |
| POST `/issues/:id/votes` | Join/confirm affected | Student/Lecturer, idempotent |
| POST `/issues/:id/assignments` | Assign or reassign | Manager/Admin |
| POST `/issues/:id/status-transitions` | Apply controlled transition | Role and state checked |
| POST `/issues/:id/resolve` | Record work/evidence and resolution | Maintenance/Manager |
| POST `/issues/:id/verify` | Close or reopen and optionally rate | Original reporter |
| POST `/issues/:id/attachments` | Upload validated evidence | Authorized user |

## AI

| Method and path | Purpose | Required behavior |
|---|---|---|
| POST `/ai/classify` | Classification, entities and safety | Typed result, timeout, manual fallback |
| POST `/ai/priority` | Explainable priority recommendation | Reasons and human confirmation |
| POST `/ai/duplicate-check` | Similar open issues | Tenant/location scoped |
| POST `/ai/analyze-image` | Vision assistance | Authorized attachment, disclaimer |
| POST `/ai/summarize` | Concise actionable summary | Retain original text |
| POST `/ai/chat` | Grounded response | Retrieval and authorization before generation |
| GET `/ai/insights` | Data-derived management insight | Manager/Admin only |

## Operations and administration

| Method and path | Purpose |
|---|---|
| GET `/dashboard` | Role-specific summary |
| GET `/analytics` | Filtered operational measures |
| GET `/notifications` | Current user's notifications |
| PATCH `/notifications/:id/read` | Mark read |
| GET `/maintenance/assignments` | Staff workload |
| GET `/admin/users` | Authorized user management |
| POST `/admin/users` | Create an authorized user account |
| PATCH `/admin/users/:id` | Update role, department, identity fields or active status |
| DELETE `/admin/users/:id` | Delete an authorized user subject to self/super-admin safeguards |
| GET `/admin/departments` | Department configuration |
| GET `/admin/categories` | Category hierarchy |
| GET `/admin/locations` | Campus hierarchy |
| GET `/admin/sla-rules` | SLA configuration |
| GET `/admin/audit-logs` | Immutable audit query |

## Security checks

Every handler authenticates first, resolves institution/role server-side, validates input, enforces ownership and status transition, rate limits sensitive routes and records an audit event. File handlers verify content, not only filename/MIME. Stack traces, SQL messages, secrets and provider responses are never returned to normal users.
