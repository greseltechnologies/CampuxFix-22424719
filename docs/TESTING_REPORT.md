# Testing and Quality Assurance Report

## CampusFix version 2.0

**Student:** Ishmael Essilfie  
**Student ID:** 22424719  
**Test date:** 13 August 2026  
**Production deployment:** `dpl_AFLNCpG7cPpNM7dwqnMXFWUDCPFP`  
**Live URL:** https://campusfix-22424719.vercel.app

## 1. Strategy

Testing follows risk and traceability. Unit tests cover AI and business rules. Repository integration tests cover domain operations and persistence boundaries. Functional component tests execute role journeys. Build checks prevent type/bundle failure. Live system checks verify the deployed artifact and requested alias. Security checks distinguish what can be proven in the demonstration from the server/RLS work required before real data.

Automated success does not replace representative-user acceptance. No UAT participant or production database result is fabricated.

## 2. Environments

| Environment | Configuration | Result |
|---|---|---|
| Automated local | React 19, TypeScript 5.9, Vitest 3.2.7, jsdom | Executed |
| Production build | Vite 7.3.6 compiled static assets | Executed |
| Local browser | Current in-app Chromium plus Playwright on installed Chrome, desktop and Pixel 7 profiles | Executed |
| Public hosting | Vercel HTTPS, exact requested alias | Executed |
| Production data/API | Browser-local demonstration adapter | Clearly identified; shared PostgreSQL/REST pending |
| External AI/vision | Explainable local fallback | Executed; provider-backed inference pending |

## 3. Automated execution summary

| Check | Expected | Actual | Result |
|---|---|---|---|
| `pnpm run typecheck` | No TypeScript errors | Completed with zero errors | PASS |
| `pnpm run test:run` | All automated tests pass | 4 files; 22 tests passed; 0 failed | PASS |
| `pnpm run build` | Production bundle created | 38 modules transformed; JS chunks total about 272.16 kB; CSS 204.73 kB including the optimized inlined login image | PASS |
| Playwright end-to-end suite | Four journeys on desktop and mobile | 8 scenarios reported passed; 0 scenario failures | PASS |
| Production HTTP | Exact URL and assets return 200 | HTML, JS and CSS returned 200 with expected lengths | PASS |
| Vercel runtime error scan | No runtime error clusters after verification | No runtime errors in selected range | PASS |

## 4. Executed unit tests

| ID | Requirement | Test | Expected result | Actual result | Result |
|---|---|---|---|---|---|
| UT-01 | FR-AI/REP | Classify exposed wiring | Electrical, Critical, Electrical Unit, safety true, LT4 entity | All expected fields returned | PASS |
| UT-02 | FR-AI/REP | Classify projector failure | ICT/Internet and ICT Support | Expected category and route | PASS |
| UT-03 | FR-REP-04 | Summarise long description | Concise actionable first statement | Expected extractive summary | PASS |
| UT-04 | FR-DUP-01 | Compare same-room projector reports | CF-1042 returned with same-room reason | Expected match and reason | PASS |
| UT-05 | FR-AI-02 | Ask status of CF-1042 | Answer says in progress and ICT Support | Grounded fields returned | PASS |
| UT-06 | FR-REP-02 | Validate short/missing input | Title, description, campus, building and room errors | All expected errors returned | PASS |
| UT-07 | FR-REP-02 | Validate complete input | Empty error object | No errors returned | PASS |
| UT-08 | FR-WF-03 | Check controlled transitions | Assigned -> Acknowledged allowed; skip to Resolved denied | Role map matched | PASS |
| UT-09 | FR-SLA-01 | Calculate SLA hours | Emergency 2, Critical 4, Low 72 | Expected targets returned | PASS |
| UT-10 | UI | Humanise `user_verification` | User Verification | Expected label returned | PASS |

## 5. Repository integration tests

| ID | Requirement | Test | Expected result | Actual result | Result |
|---|---|---|---|---|---|
| IT-01 | FR-AUTH/REP | Student signs in and creates analysed electrical issue | Verified issue, critical route, persistent in list | Expected issue persisted | PASS |
| IT-02 | FR-WF-04/08 | Maintenance lists queue and acknowledges assignment with note | Relevant department rows and newest status audit | Queue restricted; audit recorded | PASS |
| IT-03 | FR-DUP-04 | Lecturer joins existing issue twice | Count increases once only | Idempotent affected count | PASS |
| IT-04 | FR-WF-07 | Original reporter verifies and rates CF-1035 | Status Closed and rating 5 | Expected result stored | PASS |
| IT-05 | FR-AUTH-03 | Submit wrong password | Safe rejection | Incorrect email or password | PASS |
| IT-06 | FR-AUTH-01/ADM-03 | Administrator creates a Lecturer, the new account signs in with the stored role, then Admin updates/deactivates and deletes it | Role route, user list changes and each management action is audited | Expected role, state and audit events stored | PASS |

<!-- PAGEBREAK -->

## 6. Functional UI tests

| ID | Requirement | Test | Expected result | Actual result | Result |
|---|---|---|---|---|---|
| FT-00 | FR-AUTH-01/02/06/07 | Use the common form as Lecturer, open My Profile and log out | No public role/account creation; Lecturer workspace, profile details and login return | Full route/profile/logout journey completed | PASS |
| FT-01 | FR-REP-01..07 | Student natural-language report through AI review and submit | AI step appears, editable suggestions, valid location and routed issue | Created/routed confirmation displayed | PASS |
| FT-02 | FR-REP-02 | Attempt analysis with incomplete report | Remain on step one and show field feedback | Title/description messages displayed | PASS |
| FT-03 | FR-AUTH-04/WF-04 | Sign in as Maintenance | Maintenance link/workbench visible; Administration absent | Role navigation matched | PASS |
| FT-04 | FR-DASH/ADM | Sign in as Admin and open Analytics and Audit Trail | Both protected pages render | Headings and audit rows displayed | PASS |
| FT-05 | FR-ADM-03 | Administrator adds, updates and deletes a user through the interface | User appears, changes and is removed | Full UI journey completed | PASS |

## 7. Local browser system checks

| ID | Scenario | Expected | Actual | Result |
|---|---|---|---|---|
| ST-01 | Open login screen | Campus image beside one common credential form, with no role chooser or Create Account | Expected desktop layout and controls visible; no blank/error overlay | PASS |
| ST-02 | Student creates unique handrail issue | Three-step wizard completes and routed toast appears | Completed | PASS |
| ST-03 | Ask whether CF-1042 is fixed | Current in-progress state from seeded record | Correct grounded answer | PASS |
| ST-04 | Administrator opens Analytics/Audit | Role-protected pages and records visible | Completed | PASS |
| ST-05 | Visual desktop review | No overlap, clipping or unreadable content | Login and audit views visually clean | PASS |
| ST-06 | Playwright desktop/mobile suite | Reporting, validation, assistant and administrator journeys work in both profiles | All 8 scenarios reported passed | PASS |
| ST-07 | Live administrator user controls | Add, update and delete a temporary account without affecting seed users | Temporary account completed the full journey and was removed | PASS |

## 8. Production deployment checks

| ID | Scenario | Expected | Actual | Result |
|---|---|---|---|---|
| PT-01 | Fetch exact live URL | HTTPS 200 and CampusFix title | 200 OK; expected HTML/title | PASS |
| PT-02 | Fetch hashed JS/CSS | Hashed assets return 200 and complete | Split production JS and CSS assets loaded successfully | PASS |
| PT-03 | Open public login | Campus image, one common credential form, responsive stylesheet and no blank page | Visible at exact alias | PASS |
| PT-04 | Live exposed-wiring analysis | Electrical, Critical, Electrical Unit and safety reason | All selected; confidence 83% | PASS |
| PT-05 | Live assistant query CF-1042 | Grounded in-progress response | Correct response displayed | PASS |
| PT-06 | Live administrator navigation | Dashboard, Analytics and Audit accessible | All views rendered | PASS |
| PT-07 | Runtime error scan | No Vercel runtime error clusters | None found | PASS |
| PT-08 | Live administrator user management and assigned-role routing | Add a temporary Lecturer, sign in through the common form, confirm Lecturer navigation, then delete the account | Correct role workspace opened; temporary record removed | PASS |

## 9. Defects and corrective action

| Defect | Detection | Impact | Corrective action | Retest |
|---|---|---|---|---|
| DEP-01 first production asset upload truncated/mis-mapped files | Live page rendered blank; JS path length wrong and CSS returned 404 | Release unusable | Reassembled file contents in bounded chunks and redeployed all hashed assets | Exact JS/CSS lengths, browser rendering and live journeys passed |
| TEST-01 authentication test matched both tab and submit controls | Functional test reported ambiguous Sign in selector | Test instability only | Targeted the final form submit button | All UI tests passed |
| AI-01 exposed socket phrase used `exposes` but risk list contained only `exposed` | Repository test predicted Low | Safety-language false negative | Added `exposes` risk form and kept risk check before minor-fault rule | AI/repository tests passed |
| UX-01 administration controls were summaries only | Requirement review | Administrator could not manage accounts | Added role-protected add/edit/activate/deactivate/delete controls, audit events and safeguards | Repository, UI and live production journey passed |
| UX-02 application text was slightly small | Visual review | Reduced readability | Increased the shared type scale for navigation, forms, tables, cards and workflow content | Desktop administration page visually reviewed |
| UX-03 sign-in exposed account creation and role choices | Updated access requirement | Users could imply a role before authentication and logout was separated from identity | Replaced it with one credential form, automatic stored-role routing and a profile containing logout; added icon navigation, the supplied campus image and removed the desktop top-bar notification shortcut | Automated and local browser role/profile checks passed |
| TEST-02 Playwright initially expected its downloaded Chromium build, which was absent | End-to-end launch | Browser specifications could not start | Configured Playwright to use the installed Chrome channel and corrected responsive navigation selectors | Eight desktop/mobile scenarios reported passed; the terminal wrapper was cleaned up after its Vite child remained open |

## 10. Security test status

| Control | Demonstration result | Production requirement |
|---|---|---|
| Wrong password | Rejected safely | Managed hash/session tests required |
| Role navigation | Unauthorized pages hidden | API/RLS must independently return 403 |
| Input length/category | Client/domain validation passes | Repeat server schema and database constraints |
| File type/size | UI rejects unsupported/over-10MB metadata | Scan file content, signed uploads and storage RLS |
| Reporter privacy | Protected in non-authorized issue detail/map | Verify API serialization and tenant isolation |
| Injection/XSS | React escapes displayed text; no raw HTML | API validation, stored-XSS, SQL injection and CSP tests |
| Rate limiting | Not applicable to local repository | Required on auth, create, vote, upload and AI routes |
| Secrets | No API/database secrets in public build | Server-only secret scan and rotation procedure |

The shared-data security cases are explicitly pending because the public demonstration has no deployed API/database. They are release gates in the technical-debt plan, not unreported passes.

<!-- PAGEBREAK -->

## 11. Performance, usability and compatibility

The production bundle is small enough for a demonstration SPA and rendered promptly in the live browser. Responsive CSS covers 1080px, 820px and 560px breakpoints down to a 320px minimum. Labels, visible focus, text badges and role names support keyboard/screen-reader interpretation. Formal Lighthouse, slow-network, load, Safari/Firefox and assistive-technology sessions remain appropriate before a broad pilot.

## 12. Project-owner user acceptance test

**Participant:** Ishmael Essilfie  
**Role:** Project Owner / Stakeholder  
**Date:** 14 August 2026  
**Environment:** Live application at `https://campusfix-22424719.vercel.app`  
**Decision:** Accepted for examination demonstration

The participant reviewed the live outcomes below and confirmed acceptance. This is a project-owner acceptance session, not an independently witnessed multi-user study. That limitation is recorded so the evidence is not overstated.

| ID | Test case | Expected result | Actual result | Result | Defect / action |
|---|---|---|---|---|---|
| UAT-01 | Describe an exposed-wiring hazard and review the AI suggestions | Editable category, priority, department and location suggestions | Electrical, Critical and Electrical Unit were recommended; fields were edited and restored successfully | PASS | None |
| UAT-02 | Check whether the report duplicates an open issue | A relevant match with Join Existing and Create Separate choices | CF-1048 was shown at 78% similarity with both decisions available; Join Existing completed | PASS | None |
| UAT-03 | Search for the issue and interpret its status | One clear result with current status, priority and ownership | Searching CF-1048 returned one Assigned, Critical issue owned by Electrical Unit | PASS | None |
| UAT-04 | Use the maintenance workbench to take the next permitted action | Assigned technician can add a note and acknowledge the job | Esi Mensah added an isolation/inspection note; status changed to Acknowledged and the audit history updated | PASS | None |
| UAT-05 | Verify a completed repair and rate the service | Reporter can review evidence, rate and close the issue | CF-1035 displayed before/after evidence; a five-star rating and feedback were saved and the issue closed | PASS | None |
| UAT-06 | Ask the assistant for an issue status | Answer must match the stored issue record | The assistant returned CF-1048 as Assigned, Critical and routed to Electrical Unit, matching the issue view | PASS | None |

No blocking acceptance defects were found. The demonstration data was reset after the walkthrough so the examination scenario remains in its original state.

## 13. Release conclusion

The deployed demonstration passes its automated, live and project-owner acceptance baseline. It is accepted for examination of the implemented vertical slice. It is not approved for real institutional data until the shared authentication, API, database, storage and security release gates are completed and retested.
