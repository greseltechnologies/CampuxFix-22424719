# Development Tools, Ownership and Integration Guide

## Student: Ishmael Essilfie - 22424719

## 1. Academic-integrity statement

CampusFix was developed and is owned by Ishmael Essilfie. Development tools supported planning, code suggestions, debugging, testing and document review, while the submitted decisions, validation and explanations remain his responsibility. Before submission, Ishmael should read the source and documents, repeat the demonstration and be able to explain the requirements, estimation, architecture, algorithms, tests, limitations and technical debt.

Do not claim stakeholder interviews, UAT, production database operation, real image recognition, email delivery or performance results that were not actually completed. Keep library and service acknowledgements in the project documentation.

## 2. Work completed in the development workspace

- inspect and edit the React/TypeScript project;
- implement the local AI algorithms and role workflow;
- create and run unit, integration and functional tests;
- build and verify the web interface;
- prepare the normalized SQL design and seed data;
- deploy the compiled application to the connected Vercel account;
- generate and visually inspect the required PDFs; and
- assemble and validate the submission ZIP.

## 3. Tasks requiring the student's account, judgment or institutional access

| Task | Recommended tool | Why student action is required |
|---|---|---|
| Maintain the published source repository | GitHub | Repository ownership, visibility and final release decisions remain with Ishmael |
| Configure shared PostgreSQL and storage | Supabase or Neon | Requires account, project creation, keys, migration approval and cost/security choices |
| Enable external language/vision AI | OpenAI-compatible provider or Vercel AI Gateway | Requires a billing-approved server-side credential and privacy decision |
| Send real email | Resend or institutional SMTP | Requires a verified sender/domain and authorized recipients |
| Conduct an independent multi-user pilot | Student, lecturer and facilities participants | The completed project-owner UAT is not a substitute for broader institutional acceptance |
| Configure real campus coordinates | OpenStreetMap/Mapbox plus campus facilities data | Requires approved locations and privacy review |
| Final Sakai submission | Sakai LMS | Requires the student's login and confirmation of the uploaded archive |

## 4. Safe external-AI integration

Use server-only environment variables:

```text
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=
AI_VISION_MODEL=
```

Never place a secret in `VITE_*`, source control, screenshots or PDF documents. Validate provider output against a schema. Store the model, timestamp, confidence, input hash and human decision. Remove unnecessary personal data before sending content to a provider. Use timeouts and a safe fallback so the reporting workflow continues.

## 5. How to prepare for the viva

1. Read `PROJECT_DOCUMENTATION.md` and the SRS.
2. Follow the complete demonstration in `USER_MANUAL.md`.
3. Explain `analyzeIssue`, `findDuplicates`, `allowedTransitions` and the repository boundary from the source.
4. Run `pnpm run typecheck`, `pnpm run test:run` and `pnpm run build`.
5. Review every debt item and choose the three most important.
6. Practise saying what is implemented, designed and deferred without exaggeration.

## 6. Final student actions

- Confirm the published repository and live application remain publicly accessible.
- Re-check every live credential in a private/incognito browser.
- Keep the confirmed project-owner UAT record with the testing evidence.
- Ensure the ZIP filename and internal folder begin with `22424719_CampusFix`.
- Upload only the final ZIP to Sakai and retain a local backup plus submission confirmation.
