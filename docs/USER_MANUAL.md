# CampusFix User Manual

## Version 2.0

**Student:** Ishmael Essilfie  
**Student ID:** 22424719  
**Live application:** https://campusfix-22424719.vercel.app

## 1. Purpose and safe use

CampusFix demonstrates how a university can report, triage, route, repair and verify campus issues. It contains fictional data. Do not enter real passwords, private student information, medical information or sensitive security details.

The public site uses local demonstration storage. Changes remain in the current browser only and may be cleared by browser settings or the Reset Demonstration Data control. Evidence selection records file metadata for the workflow demonstration; it does not upload the file to shared storage.

For fire, exposed live wiring, violence or another immediate danger, move away and contact campus security or emergency services first. CampusFix does not replace emergency response.

## 2. Open and sign in

1. Open `https://campusfix-22424719.vercel.app` in a current browser.
2. Enter the email address for the assigned account.
3. Enter the account password.
4. Select the large **Sign in** button. CampusFix opens the workspace allowed for the role assigned by the administrator.

| Role | Username | Password | Main demonstration |
|---|---|---|---|
| Student | student@campusfix.test | Demo123! | Report, follow, verify and rate |
| Lecturer | lecturer@campusfix.test | Demo123! | Teaching-location issue tracking |
| Maintenance Staff | maintenance@campusfix.test | Demo123! | Assigned electrical work |
| Department Manager | manager@campusfix.test | Demo123! | Department workload and SLA |
| System Administrator | admin@campusfix.test | Demo123! | Analytics, administration and audit |
| Super Administrator | superadmin@campusfix.test | Demo123! | Institution-wide configuration view |

To leave the account, open **My Profile** from the left menu or select the profile name/avatar in the top bar, then select **Log out**.

## 3. Navigation

The left menu changes according to role:

- **Dashboard** shows workload, service indicators and AI insights.
- **Report Issue** opens the reporting wizard for students and lecturers.
- **Campus Issues** searches and filters issue records.
- **Campus Map** shows priority markers without reporter identity.
- **Notifications** lists assignments, status changes, SLA and verification notices.
- **AI Assistant** answers from current CampusFix records.
- **Analytics** is available to managers and administrators.
- **Maintenance** is available to operational staff.
- **Administration** is available to administrators.
- **Audit Trail** is available to managers and administrators.
- **My Profile** shows the signed-in identity, assigned role, department and logout control.

On a small screen, select **Menu** to open navigation.

## 4. Report an issue

### Step 1 - Describe

1. Sign in as Student or Lecturer.
2. Select **Report an issue**.
3. Enter a specific title.
4. Describe what was observed, where it is, who is affected and any danger.
5. Optionally choose an image, video or PDF no larger than 10 MB.
6. Select **Analyse report with AI**.

Example description: `There is exposed electrical wiring beside the entrance of Lecture Theatre 4.`

### Step 2 - Review AI suggestions

CampusFix shows a concise summary, suggested action, confidence, reasons and safety statement. Review the editable Category, Priority, Department and Issue Type fields. Confirm Campus, Building, Floor and Room/Facility. GPS coordinates are optional.

AI assistance is not an absolute diagnosis. If it misses a risk or selects the wrong department, correct it before continuing. Select **Check similar reports**.

### Step 3 - Duplicate decision and submit

If likely open matches appear, review their location, affected count and status.

- Select **Join existing** when it is the same problem. Your account follows it and the affected count increases once.
- Select **Create separate issue** when the report is genuinely different.
- If no likely duplicate appears, select **Submit report**.

A created issue receives a CF reference and is routed to the selected department.

## 5. Find and follow issues

Open **Campus Issues**. Search by reference, title, description, location, category or department. Filter by status, priority and category. Students and lecturers can select **Only my issues**.

Select any issue card to open details. The panel shows the report, AI summary, evidence metadata, comments, service details, affected count, department, SLA state, workflow controls where allowed and audit history where permitted.

Select **I am affected** on an open issue to follow it. CampusFix prevents the same user from increasing the count repeatedly.

## 6. Comment and track status

Open an issue and enter a note in **Comments and work notes**, then select **Post note**. Do not include confidential information. Status badges use both text and colour.

The normal sequence is:

`Reported -> AI Analysis -> Verified -> Assigned -> Acknowledged -> In Progress -> Awaiting Parts/Approval -> Resolved -> User Verification -> Closed`

Rejected, Reopened, Escalated and Cancelled are controlled branches. Available buttons depend on the current state and signed-in role.

## 7. Maintenance work

1. Sign in as Maintenance Staff.
2. Open **Maintenance** to view Assigned, In Progress, Awaiting Parts and Resolved columns.
3. Select a work card.
4. Enter an optional action note.
5. Select the permitted next state, such as **Acknowledged** or **In Progress**.
6. When work is complete, enter the repair note and select **Resolved**.

The seed includes CF-1048, exposed wiring assigned to Esi Mensah. Evidence cards distinguish Evidence, Before and After metadata. The production extension will store the actual files.

## 8. Verify and rate a repair

1. Sign in as the original Student reporter.
2. Open an issue marked **User Verification**. CF-1035 is seeded for this task.
3. Inspect the location and repair evidence.
4. If the problem remains, enter the reason and select **No - reopen**.
5. If fixed, choose a one-to-five-star rating, add optional feedback and select **Yes - close issue**.

Only the original reporter can perform this action. Reopening notifies the response workflow; confirming stores the rating and closes the issue.

## 9. Use the AI Assistant

Open **AI Assistant** and ask a question such as:

- `Has CF-1042 been fixed?`
- `What is happening at Unity Hostel?`
- `How do I report an issue?`

The assistant searches current records. A status answer includes the matching reference, state, priority, department and last update. If it cannot find a match, it says so. It does not guess database information.

## 10. View management information

Managers and administrators can open **Analytics** to see SLA compliance, satisfaction, critical workload, affected users, category bars, priority distribution and AI-generated management observations. These insights use only records in the current demonstration dataset.

**Maintenance** shows the operational board. **Administration** provides user management and summarises roles, categories, location hierarchy, SLA and AI configuration. **Audit Trail** shows date, issue/user reference, actor, action and value change.

### Manage users as an administrator

1. Sign in with the Administrator demonstration account and open **Administration**.
2. Select **Add user**, enter the name, email, role, optional department and a temporary password of at least eight characters, then save.
3. Select **Edit** beside an account to change its details, role, department, active status or password.
4. Use **Activate** or **Deactivate** to control access, or **Delete** then **Confirm** to remove an account.

Every change is audited. Administrators cannot deactivate or delete themselves or manage the Super Administrator. Changes remain in the current browser; **Reset demonstration data** restores the seeded accounts.

## 11. Notifications and reset

Open **Notifications** and select **Mark all as read** when appropriate. Notifications are local demonstration events.

To restore the original scenario, select **Reset demonstration data** at the bottom of the navigation. The application signs back in as the Student account and restores fictional seed records. This removes changes made in the demonstration browser.

## 12. Common messages

| Message or symptom | Meaning and action |
|---|---|
| Incorrect email or password | Select a demonstration role again or enter the credentials exactly |
| Use at least 5 characters | Make the issue title more specific |
| Add at least 20 characters | Add enough detail for the response team |
| Evidence must be an image, video or PDF no larger than 10 MB | Choose an accepted smaller file |
| Possible duplicate | Review and join if it is the same problem |
| SLA overdue | The configured resolution target has passed and management attention is required |
| No matching issue | Include a CF reference, location or clearer problem wording in the assistant question |
| Data disappeared in another browser | Public demonstration storage is local to each browser; production sharing is not connected |

<!-- PAGEBREAK -->

## 13. Recommended demonstration sequence

1. Sign in as Student and show the dashboard.
2. Report the exposed-wiring example and explain the editable Critical/Electrical recommendation.
3. Open Campus Issues and show search, affected count and issue details.
4. Ask the assistant about CF-1042.
5. Sign in as Maintenance Staff and acknowledge CF-1048 with a note.
6. Sign in as Student, open CF-1035 and verify/rate the completed repair.
7. Sign in as Administrator, add/edit/delete a temporary user, then show Analytics and Audit Trail.
8. Open My Profile, log out and leave the login screen ready.
