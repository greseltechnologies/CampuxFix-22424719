# AI Use, Academic Integrity and Tool Guide

## Student: Ishmael Essilfie - 22424719

## 1. Academic-integrity statement

AI tools may assist with planning, code suggestions, debugging and document review, but the submitted decisions and explanations remain the student's responsibility. Before submission, the student should read the source and documents, run the application, repeat the demonstration and be able to explain the requirements, estimation, architecture, algorithms, tests, limitations and technical debt.

Do not claim stakeholder interviews, UAT, production database operation, real image recognition, email delivery or performance results that were not actually completed. Keep library and service acknowledgements in the project documentation.

## 2. What ChatGPT/Codex can execute in this workspace

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
| Create/publish source repository | GitHub or GitLab | Requires the student's account, ownership and final visibility decision |
| Configure shared PostgreSQL and storage | Supabase or Neon | Requires account, project creation, keys, migration approval and cost/security choices |
| Enable external language/vision AI | OpenAI-compatible provider or Vercel AI Gateway | Requires a billing-approved server-side credential and privacy decision |
| Send real email | Resend or institutional SMTP | Requires a verified sender/domain and authorized recipients |
| Collect representative acceptance | Human participants and signed checklist | UAT cannot be fabricated by an AI tool |
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

- Upload the source to a repository owned by the student and add the URL to `Deployment_and_Source_Links.txt`.
- Re-check every live credential in a private/incognito browser.
- Ask a real representative user to execute the UAT script and record their name/date/result if permitted.
- Ensure the ZIP filename and internal folder begin with `22424719_CampusFix`.
- Upload only the final ZIP to Sakai and retain a local backup plus submission confirmation.
