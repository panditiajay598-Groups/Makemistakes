# BuildOS Final Test Checklist

> Acceptance checklist for final integration and stabilisation. All cases begin **Pending**; fill Actual Result and change status only after executing the exact case. This checklist does not replace automated correctness, authorization, security, or regression checks during development.

Tracker: [BuildOS Development Tracker](./BUILDOS_DEVELOPMENT_TRACKER.md).

## Testing strategy

1. Complete planned feature development.
2. Run basic automated checks during implementation, including relevant unit/integration tests, TypeScript, lint and security checks.
3. Record outstanding manual tests here; do not defer essential automated security or correctness checks.
4. Complete integration and stabilisation.
5. Execute comprehensive manual testing against a controlled test environment.
6. Fix critical issues and re-run affected automated checks.
7. Perform regression testing across BuildOS and surrounding journeys.
8. Approve release readiness only when required tests pass and blockers are resolved or explicitly accepted.

**Status values:** Pending / Pass / Fail / Blocked. **Severity:** Critical / High / Medium / Low. `Actual Result` is intentionally blank (`—`) until execution.

## Nova AI Mentor

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| NOVA-001 | Nova Mentor | Nova identifies the student's product accurately. | Test project has a distinctive product name and saved project record. | Open its BuildOS; ask Nova what product is being built. | Answer matches the saved project record and does not substitute another project. | — | Pending | High | Verify each supported provider/fallback as available. |
| NOVA-002 | Nova Mentor | Nova explains the project's purpose. | Project problem statement and objective are populated. | Ask what problem the project solves and for whom. | Explanation is grounded in saved project facts; unknown facts are labelled unknown. | — | Pending | Medium | — |
| NOVA-003 | Nova Mentor | Nova uses the selected technology stack. | Journey contains saved technology decisions. | Ask Nova to describe the stack and a relevant design trade-off. | Names match saved decisions; no unsupported framework is invented. | — | Pending | Medium | — |
| NOVA-004 | Nova Mentor | Engineering guidance is relevant to the active task. | Project has at least two distinct tasks and files. | Select a task and ask for a focused next step. | Guidance addresses the selected task and retrieved files. | — | Pending | Medium | — |
| NOVA-005 | Nova Mentor | Nova explains an engineering concept clearly. | BuildOS project is available. | Ask for a plain-language explanation of a concept used by the task. | Explanation is understandable, technically coherent and appropriate to the learner. | — | Pending | Low | — |
| NOVA-006 | Nova Mentor | Nova maintains conversation continuity. | Persistent conversation is available. | Ask a question, then refer to an earlier decision in a follow-up. | Nova uses relevant prior context without requiring the user to repeat it. | — | Pending | Medium | See MEM cases. |
| NOVA-007 | Nova Mentor | Nova handles an unclear request. | BuildOS project is available. | Send an ambiguous request such as “fix it” without error details. | Nova asks a useful clarifying question or states what evidence is missing. | — | Pending | Low | — |
| NOVA-008 | Nova Mentor | AI provider failure has a safe, usable outcome. | Test provider can be disabled or made to return an error in non-production. | Send a short request while the provider fails or times out. | User receives the documented fallback/error; no secret, stack trace or false success is shown. | — | Pending | High | Do not use production credentials or alter production configuration. |
| NOVA-009 | Nova Mentor | Nova avoids inventing implementation details. | Use a project with an absent/unknown feature or file. | Ask whether that feature exists and which file implements it. | Nova says it is unknown/not retrieved rather than claiming unsupported implementation. | — | Pending | High | — |

## Nova Context Engine

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| CTX-001 | Context Engine | Project facts are selected from the current project. | Two test projects have clearly different names/objectives. | Ask a project-purpose question in each project. | Each answer uses only the corresponding project's facts. | — | Pending | High | — |
| CTX-002 | Context Engine | Workspace file and folder structure is recognized. | Workspace contains nested folders and distinctive files. | Ask Nova to summarize the visible structure. | Listed paths match the current workspace tree; unlisted paths are not invented. | — | Pending | Medium | — |
| CTX-003 | Context Engine | Technology/dependencies reflect current workspace. | Workspace `package.json` has known dependencies. | Ask Nova which dependencies are present. | Answer matches retrieved dependency names and does not expose package secrets/config values. | — | Pending | Medium | — |
| CTX-004 | Context Engine | Current roadmap phase is authoritative. | Persist a valid journey step; repeat with a missing or invalid `currentPhase`. | Open BuildOS and ask Nova for the current phase. | Answer reflects the persisted BuildOS journey step, or clearly says unknown; no keyword guess or default phase is presented as fact. | — | Pending | High | Numeric steps map to the existing journey UI; `productJourney` phases are separate. |
| CTX-005 | Context Engine | Active task is correctly identified and restored. | Project has multiple tasks; select a non-first task. | Ask Nova which task is active, refresh BuildOS, and ask again. | Context corresponds to the persisted selected task before and after refresh; if selection was not saved, Nova says it is not recorded. | — | Pending | High | — |
| CTX-006 | Context Engine | Completed and pending task history is accurate. | Complete one task using the supported validation flow; leave another pending. | Ask Nova for progress. | Only server-validated completions are complete; remaining tasks have accurate pending/in-progress/blocked status. | — | Pending | High | — |
| CTX-007 | Context Engine | Relevant source files are selected. | Create several source files, including one directly related to a specific question. | Ask about that feature and request a source-specific explanation. | Retrieved source supports the answer; missing source is disclosed. | — | Pending | Medium | Respect configured file/context limits. |
| CTX-008 | Context Engine | Context refreshes after a file save. | Open a source file in the owned workspace. | Save a distinctive code change; ask Nova about it immediately. | Context reflects saved content, not stale content. | — | Pending | High | — |
| CTX-009 | Context Engine | Context refreshes after an approved Nova proposal. | A valid proposal for an existing file is available. | Approve/apply it; ask Nova about the changed implementation. | Context reflects the persisted approved code. | — | Pending | High | — |
| CTX-010 | Context Engine | Project and student context is isolated. | Two users own separate projects with distinctive private test markers. | Ask each user about the other's project/file marker using normal APIs. | Neither user receives the other's project facts, files, activity or conversation. | — | Pending | Critical | Coordinate with AUTH and MEM cases. |
| CTX-011 | Context Engine | Dependencies and unresolved failures constrain the next task. | Authored task plan has explicit `dependsOn` IDs; include a blocked prerequisite and a recoverable failed run. | Ask Nova for progress before and after completing the prerequisite and obtaining a ready preview. | Dependent tasks are blocked until prerequisites complete; failed runs are blocked until a later task selection/ready preview; next valid task follows authored order. | — | Pending | High | Current task data may not contain explicit dependencies; do not add mock production progress. |
| CTX-012 | Workspace Intelligence | Nova locates existing authentication logic. | Owned test workspace has a login component, auth API, session utility and user model. | Ask where authentication is implemented and how the request flows. | Answer cites retrieved existing paths and relationships; does not propose a duplicate auth system or expose environment values. | — | Pending | High | Test with realistic project files and normal authenticated API access. |
| CTX-013 | Workspace Intelligence | Nova identifies reusable components. | Workspace has a shared navigation component and a page that imports it. | Ask how to add navigation to another page. | Nova identifies the existing reusable component and recommends reuse when supported by retrieved source. | — | Pending | Medium | — |
| CTX-014 | Workspace Intelligence | Nova understands API and database relationships. | Workspace includes a frontend API call, backend route and database model with local imports. | Ask how the feature reads or saves data. | Explanation follows observed retrieved relationships and distinguishes uninspected files from verified evidence. | — | Pending | High | — |
| CTX-015 | Workspace Intelligence | Nova avoids duplicating an existing implementation. | Relevant feature is partially implemented in one or more files. | Ask to add the same feature and ask what already exists. | Nova describes observed implementation evidence and proposes only evidence-supported gaps; source markers alone are not treated as proof of completion. | — | Pending | High | — |
| CTX-016 | Workspace Intelligence | Nova handles missing or insufficient context. | Ask about a file/technology not present in the bounded workspace listing or not retrieved. | Ask where it is implemented or which dependency is installed. | Nova says evidence is unavailable/unknown and asks for needed details instead of guessing. | — | Pending | Medium | Large projects may be bounded/truncated; confirm this is disclosed. |
| CTX-017 | Workspace Intelligence | Workspace changes are visible in subsequent conversations. | Owned test workspace with a source file that can be safely edited. | Ask about the file, save a distinct change, then ask again. | Subsequent context reflects the latest saved workspace content; no stale metadata is reused. | — | Pending | High | Current implementation does not cache workspace metadata or source. |
| CTX-018 | Workspace Intelligence | Retrieval is isolated between students and projects. | Two test students each own separate projects with distinctive source markers. | Using normal authenticated APIs, ask each user about files and dependencies present only in the other workspace. | Neither student's response or context includes the other's paths, source, metadata, or project information. | — | Pending | Critical | Automated actual-route tests cover cross-student denial and forged owner fields; helper-level tests cover project scoping. Manual/browser acceptance and live service behavior remain unverified. Coordinate with CTX-010, AUTH-005 and MEM-006/007. |
| CTX-019 | Workspace Intelligence | Nova chat ignores client-supplied ownership identifiers and rejects unauthorized projects. | Two isolated test user/project fixtures. | Route integration tests submit a forged owner ID and an unowned project ID using signed test sessions. | Route derives owner from the authenticated identity; unowned project returns generic not-found without workspace messages. | 6/6 route tests pass | Pass | Critical | Automated only: real POST route, signed-session validation, ownership helper, and context builder; Mongo, payment, and model provider are test fixtures. Manual browser and live Mongo behavior remain Pending. |
| CTX-020 | Workspace Intelligence | Unauthenticated, missing workspace, and traversal requests fail safely. | Isolated test workspace plus inaccessible project fixture. | Route integration tests submit no session, a missing project, and an active file path attempting to escape the authorized root. | Unauthenticated request returns 401; missing/unowned workspace returns generic 404; outside-root file content is absent from the model context. | 6/6 route tests pass | Pass | Critical | Automated only; no real student data or production database. Manual browser/network verification remains Pending. |

## Persistent Conversation Memory

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| MEM-001 | Conversation Memory | Conversation survives a page refresh. | Authenticated owned project; send at least one exchange. | Refresh BuildOS. | Saved messages restore in the conversation panel. | — | Pending | High | — |
| MEM-002 | Conversation Memory | Conversation restores when reopening the same project. | Existing conversation for a project. | Leave BuildOS, reopen the same project. | Same project conversation ID/history is restored. | — | Pending | High | — |
| MEM-003 | Conversation Memory | Message order is preserved. | Conversation has several user/assistant turns. | Reload history and compare with send order. | All displayed turns are chronologically ordered with roles intact. | — | Pending | High | — |
| MEM-004 | Conversation Memory | Concurrent writes do not corrupt order. | Isolated test DB and one project conversation. | Submit multiple concurrent user messages; restore history. | Each persisted message has a unique, stable sequence and ordering is deterministic. | — | Pending | High | Requires live Mongo concurrency check in addition to unit tests. |
| MEM-005 | Conversation Memory | First message is not lost during initialization. | New project conversation with no prior history. | Open BuildOS and send as soon as the chat becomes available. | The first user message and resulting assistant response are persisted exactly once. | — | Pending | High | — |
| MEM-006 | Conversation Memory | Student A cannot access Student B's conversation. | Two authenticated test users and separate owned workspaces. | As A, request B's conversation ID/history through the API. | Request is denied/not found and no message content is returned. | — | Pending | Critical | Do not use real student content. |
| MEM-007 | Conversation Memory | Conversations are isolated by project for one student. | One student owns two projects with different histories. | Open each project and inspect history. | Each history contains only its project's messages and distinct project conversation. | — | Pending | Critical | — |
| MEM-008 | Conversation Memory | Technical memory retains useful implementation decisions. | Save a clear technical decision in conversation. | Continue after refresh and refer to that decision. | Nova can use the compact stored decision accurately. | — | Pending | Medium | Confirm no unsupported inference from summaries. |
| MEM-009 | Conversation Memory | Sensitive text is not stored or exposed. | Use synthetic credential-like strings only. | Submit them in a test message; inspect API response and test DB records. | Recognized secrets are redacted before persistence and model context; logs do not reveal them. | — | Pending | Critical | Never use actual credentials. |
| MEM-010 | Conversation Memory | Failed AI response is handled correctly. | Test provider failure in non-production. | Submit a message and force provider failure. | User message handling is consistent, error/fallback behavior is clear, and no fabricated provider success is recorded. | — | Pending | High | Verify whether failed exchanges are intentionally retained. |
| MEM-011 | Conversation Memory | Long histories stay within model limits. | Populate a long conversation with varied turn sizes. | Restore it and send another message; inspect request payload size in test environment. | Only bounded recent turns plus bounded compact memory are sent; request remains within configured limits. | — | Pending | High | — |
| MEM-012 | Conversation Memory | Declared message index is applied correctly. | Non-production database with index-management access. | Inspect the collection indexes after the approved index setup procedure. | Expected conversation lookup index exists with intended key order; no destructive index change occurs. | — | Pending | Medium | Index application was not part of baseline verification. |

## Guided Build

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GUIDED-001 | Guided Build | Nova proposes work in manageable steps. | Guided-mode project with a scoped task. | Ask for help implementing one small feature. | Response is focused, explains steps and does not silently apply code. | — | Pending | Medium | — |
| GUIDED-002 | Guided Build | Student approval applies a proposal. | Nova returned a valid proposal for a project file. | Review diff and approve it. | Only the reviewed file proposal is applied and saved; status reflects application. | — | Pending | High | — |
| GUIDED-003 | Guided Build | Student rejection leaves code unchanged. | Proposal exists for a file with known content. | Reject proposal; compare saved file before and after. | No proposed code is written; rejection is recorded if persistence succeeds. | — | Pending | High | — |
| GUIDED-004 | Guided Build | Revision request remains scoped. | Proposal is rejected. | Request a focused revision. | Revised proposal addresses feedback and does not alter unrelated files. | — | Pending | Medium | — |
| GUIDED-005 | Guided Build | Nova explains a proposed engineering decision. | Task and existing source are available. | Ask why a specific pattern was proposed. | Explanation is consistent with retrieved project evidence and labels trade-offs. | — | Pending | Low | — |
| GUIDED-006 | Guided Build | Approved proposal can create a file. | Proposal targets a safe new relative path. | Approve and apply proposal. | File is created at the intended path and appears in Explorer. | — | Pending | High | — |
| GUIDED-007 | Guided Build | Approved proposal modifies only its intended file. | Existing file contains preserved surrounding behavior. | Apply a proposal and inspect the resulting file/diff. | Intended change is present; unrelated existing code is preserved. | — | Pending | High | — |
| GUIDED-008 | Guided Build | Student can execute and validate the change. | Approved change is saved; task criteria are available. | Run preview, wait for readiness, validate task. | Run/validation results are shown and task completes only when server checks pass. | — | Pending | High | — |
| GUIDED-009 | Guided Build | Failed execution supports safe recovery. | Test project can produce a controlled validation/runtime failure. | Run failing version, read error, correct code and retry. | Failure is visible; retry works; failure does not mark task complete. | — | Pending | High | — |
| GUIDED-010 | Guided Build | Implementation plan and current step survive refresh. | A saved plan has at least two steps and one is active. | Reload BuildOS and reopen the same project. | The plan, statuses, and current step are restored from the project conversation. | — | Pending | High | — |
| GUIDED-011 | Guided Build | Planned proposal requires explicit approval of exact content. | A Build-mode proposal is awaiting review. | Attempt to apply without approval, then approve and apply the reviewed proposal. | Unapproved or changed proposal content is rejected; only the approved content is written. | — | Pending | Critical | — |
| GUIDED-012 | Guided Build | Rejection preserves workspace and records the outcome. | A proposal is awaiting review for a known file. | Reject it and compare the file before and after; reload the conversation. | Workspace content remains unchanged and rejection status is restored. | — | Pending | High | — |
| GUIDED-013 | Guided Build | Dependencies gate implementation-step progression. | Plan has a dependent second step. | Try to approve the second step before validating the first; then complete the first and retry. | The dependent step cannot be approved early and becomes current only after prerequisites pass. | — | Pending | High | — |
| GUIDED-014 | Guided Build | Step completion follows validation, not file application alone. | A plan proposal has been applied. | Inspect status before validation, then perform successful and failing validation scenarios. | Applying code alone does not complete the step; validation outcome is persisted accurately. | — | Pending | High | — |

**Automated Task 5 coverage:** Plan parsing/dependencies, proposal hash binding, persistence/restoration, authenticated progress ownership, and exact file-write enforcement are covered by isolated automated tests. These results do not mark any manual scenario above as passed; live MongoDB/provider behavior and browser acceptance remain unverified.

## Development Workspace

### Project Roadmap

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| WORKSPACE-001 | Project Roadmap | Six BuildOS categories are shown consistently. | Project has missions mapping to several categories. | Inspect roadmap at desktop and mobile widths. | Foundation & Setup, Design & Architecture, Core Features, Authentication & Integrations, Dashboard & Workflows, and Polish & Deploy are grouped consistently. | — | Pending | Medium | These are BuildOS groupings, not the eight lifecycle phases. |
| WORKSPACE-002 | Project Roadmap | Active phase/task and task progression are accurate. | Project has multiple missions; select a later task. | Navigate between tasks and compare selected/active markers. | UI identifies the selected task and progression without claiming unverified completion. | — | Pending | High | — |
| WORKSPACE-003 | Project Roadmap | Completion state persists and is validated. | One task is completed via supported server flow. | Reload project and inspect task state. | Validated completion persists; pending tasks remain pending. | — | Pending | High | — |

### Project Explorer

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| WORKSPACE-004 | Project Explorer | Navigate nested folders and select a file. | Workspace contains nested folders and multiple files. | Expand folders and select a nested file. | Tree navigation works and selected file opens with matching path/content. | — | Pending | Medium | — |
| WORKSPACE-005 | Project Explorer | Empty and refreshed tree states are handled. | Use an empty/new workspace and then add a file. | Open Explorer; create file; refresh/reload tree. | Empty state is usable; new file appears once in correct folder. | — | Pending | Low | — |
| WORKSPACE-006 | Project Explorer | Explorer reflects file creation and deletion. | Owned workspace with a disposable test file. | Create file, confirm it appears; delete it, confirm it disappears. | Tree accurately reflects both operations and no unrelated files disappear. | — | Pending | High | — |
| WORKSPACE-007 | Project Explorer | Invalid or unauthorized file paths are rejected. | Test-only workspace and authenticated owner/non-owner sessions. | Attempt traversal path and access to another user's file. | Requests are rejected; workspace root and other users' data remain untouched. | — | Pending | Critical | — |

### Code Editor

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| WORKSPACE-008 | Code Editor | Syntax highlighting and file content display. | Open representative TS/TSX, JSON and CSS files. | Select each file and inspect editor rendering. | Content is readable and syntax presentation does not alter source text. | — | Pending | Low | — |
| WORKSPACE-009 | Code Editor | Edit and save a file. | Open owned workspace file. | Make a distinctive change and save. | Save succeeds; reopening returns the saved content. | — | Pending | High | — |
| WORKSPACE-010 | Code Editor | Unsaved changes are surfaced. | Open a saved file. | Modify content without saving; switch file or navigate away. | UI preserves or clearly warns about unsaved edits; no silent data loss. | — | Pending | High | — |
| WORKSPACE-011 | Code Editor | Save failure is recoverable. | Test environment can simulate a rejected/failed save. | Edit, save during failure, then retry after recovery. | Error is visible; unsaved editor content remains available; retry persists it. | — | Pending | High | —|

### Preview Environment

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| WORKSPACE-012 | Preview Environment | Valid project renders in preview. | Valid workspace files and dependencies. | Run the project and wait for ready state. | Sandboxed preview renders and reports readiness for the current run. | — | Pending | High | Not a full Next.js server. |
| WORKSPACE-013 | Preview Environment | Manual refresh uses current preview. | Preview is ready. | Make/save a change, rerun and use refresh control. | Preview corresponds to the latest successful run. | — | Pending | Medium | — |
| WORKSPACE-014 | Preview Environment | Runtime error is reported. | Test code has a controlled runtime failure. | Run and trigger the failure in the iframe. | Preview/console show the error and current run is marked failed. | — | Pending | High | — |
| WORKSPACE-015 | Preview Environment | Stale preview events do not override a newer run. | Ability to start successive runs in a test project. | Start run A then run B; allow delayed event from A. | UI state and activity correspond to B; stale A event is ignored. | — | Pending | High | — |

### Developer Console

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| WORKSPACE-016 | Developer Console | Build logs are useful and ordered. | Run a valid project. | Inspect console output from save through preview startup. | Logs appear in meaningful order and reflect actual run events. | — | Pending | Medium | — |
| WORKSPACE-017 | Developer Console | Runtime/validation errors are actionable. | Trigger controlled dependency and runtime errors separately. | Run each failure and inspect console. | Error type/message and relevant file are visible; no success state is shown. | — | Pending | High | — |
| WORKSPACE-018 | Developer Console | Console handles repeated/long output. | Test with repeated and bounded long logs. | Run and inspect scrolling, tabs and responsiveness. | Recent useful output remains accessible; interface remains responsive. | — | Pending | Low | — |

## Authentication and Security

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| AUTH-001 | Authentication | Student login succeeds. | Valid test account and working test auth configuration. | Sign in and open an owned BuildOS project. | Authenticated student reaches only authorized workspace. | — | Pending | High | No synthetic account creation as part of this documentation task. |
| AUTH-002 | Authentication | Logout invalidates the usable session. | Authenticated test session. | Log out; retry a protected BuildOS/Nova API request. | Protected request is rejected. | — | Pending | Critical | — |
| AUTH-003 | Authentication | Session persists and expires correctly. | Test session with controlled lifetime. | Reload before expiry, then retry after expiry. | Valid session is recognized; expired session is rejected without leaking data. | — | Pending | High | — |
| AUTH-004 | Authentication | Unauthenticated APIs reject access. | No valid session. | Call Nova history/chat and workspace file/run endpoints. | Protected operations return an authorization error and do not mutate data. | — | Pending | Critical | — |
| AUTH-005 | Authentication | Workspace ownership is enforced. | Two test users own distinct workspace records. | User A requests User B's workspace metadata/files. | Access is denied/not found; no content is returned. | — | Pending | Critical | — |
| AUTH-006 | Authentication | Student data is isolated across endpoints. | Distinct user profiles, projects and activity markers. | Use A's session to query B's project, activity and conversation identifiers. | No B data or side effects are exposed to A. | — | Pending | Critical | — |
| AUTH-007 | Authentication | Project isolation is enforced for one student. | Student owns two projects with unique markers. | Attempt to use one project's identifiers in the other's routes. | Data and mutations stay within requested owned project. | — | Pending | Critical | — |
| AUTH-008 | Authentication | Authorization applies to every relevant API method. | Test owner and non-owner sessions. | Exercise GET/POST/PUT/DELETE paths for files, chat and activity. | Each operation enforces authentication and ownership consistently. | — | Pending | Critical | Include error and unsupported methods. |
| AUTH-009 | Authentication | Secret redaction covers chat, memory and logs. | Synthetic secret markers only; non-production logs. | Submit markers, trigger provider/storage errors, inspect outputs/logs. | Secrets are not present in model payload, stored records, API errors or logs. | — | Pending | Critical | — |
| AUTH-010 | Authentication | Database access is least-privilege and safe. | Approved non-production DB credentials and configuration review. | Verify app connection uses intended database/user permissions; attempt unauthorized collection action. | Application cannot access unintended production data; permission failures fail closed. | — | Pending | Critical | Operational/security review; do not probe production. |

## Database and Persistence

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| DB-001 | Database | Project/workspace creation and retrieval. | Non-production DB and authorized test project. | Provision workspace; reload workspace tree and metadata. | Project resources are retrieved for the same owner/project only. | — | Pending | High | — |
| DB-002 | Database | Conversation persistence is durable. | Non-production DB; send a conversation exchange. | Restart/reload app session and restore conversation. | Messages and stable conversation ID remain available. | — | Pending | High | — |
| DB-003 | Database | Workspace file persistence is durable. | Non-production project file. | Save file, restart/reopen workspace, read it back. | Exact saved content is restored. | — | Pending | High | — |
| DB-004 | Database | Task progression persistence is consistent. | Mission with successful validation. | Complete task and reload; compare activity/progress state. | Completion reflects validated saved code and is not duplicated inconsistently. | — | Pending | High | — |
| DB-005 | Database | Required indexes are present. | Non-production DB after approved index setup. | Inspect indexes for workspace, activity and Nova conversation collections. | Required definitions and key order match the registry; no duplicate/conflicting index issue. | — | Pending | Medium | Existing index script is the setup mechanism; not run in this task. |
| DB-006 | Database | Database connection failure is handled safely. | Simulated DB outage in non-production. | Request history and save a message while unavailable. | User receives a clear error; no false persistence success is reported. | — | Pending | High | — |
| DB-007 | Database | Recovery after transient DB failure. | Non-production DB can be interrupted/recovered. | Cause a transient failure, restore service, retry the same operation. | Retry succeeds without cross-project writes or silent lost-message reporting. | — | Pending | High | — |
| DB-008 | Database | Concurrent persistence remains consistent. | Isolated test DB and concurrent test clients. | Concurrently save multiple messages/files and read back. | No records cross scopes; message sequencing is deterministic; saved state is coherent. | — | Pending | High | — |
| DB-009 | Database | Backup and restore preserve required data. | Approved non-production backup procedure. | Back up test project data, restore to isolated target, verify files/journey/conversation. | Restore is complete and remains associated with the intended test identity/project. | — | Pending | High | Procedure/retention needs operational confirmation. |

## Performance

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PERF-001 | Performance | Nova response latency is acceptable. | Representative non-production provider and network. | Measure a defined sample of short requests. | Latencies meet a release threshold agreed by the team; failures/timeouts are reported. | — | Pending | Medium | Threshold is not specified in repository evidence; confirm before acceptance. |
| PERF-002 | Performance | Context assembly latency is acceptable. | Representative small, medium and large workspaces. | Measure server context construction for each size. | Latency remains within an agreed threshold without scanning unrelated files. | — | Pending | Medium | Define threshold and test data set. |
| PERF-003 | Performance | Large project structure stays bounded. | Workspace with many files/folders in test environment. | Build context and inspect paths/source selection. | Retrieval respects configured caps and returns relevant files without excessive work. | — | Pending | Medium | — |
| PERF-004 | Performance | Long conversation stays bounded. | Test conversation larger than normal prompt window. | Restore history and send a request. | Recent turns and technical memory remain within configured limits. | — | Pending | Medium | Also see MEM-011. |
| PERF-005 | Performance | File retrieval scales acceptably. | Representative file count and source sizes. | Open files and construct context repeatedly; record latency. | No unbounded file reads or unacceptable latency; errors remain explicit. | — | Pending | Low | — |
| PERF-006 | Performance | Code execution/validation latency is acceptable. | Representative valid and invalid workspaces. | Measure run validation and preview preparation. | Agreed thresholds are met; invalid projects fail without launching a misleading preview. | — | Pending | Medium | — |
| PERF-007 | Performance | Preview loads responsively. | Representative project, supported browsers/devices. | Run preview and measure time to ready/render. | Agreed load threshold is met and slow/error states are visible. | — | Pending | Medium | — |
| PERF-008 | Performance | Concurrent requests remain stable. | Isolated staging environment with controlled load. | Exercise concurrent chat, save and run requests. | No cross-user leakage, message corruption, resource exhaustion or unexplained 5xx spike. | — | Pending | High | Define load profile before execution. |

## Deployment and Release

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Severity | Notes |
|---|---|---|---|---|---|---|---|---|---|
| DEPLOY-001 | Deployment | Production build completes. | Clean release candidate and CI environment. | Run the documented production build. | Build exits successfully with no blocking errors. | — | Pending | Critical | No result recorded in this checklist. |
| DEPLOY-002 | Deployment | Required environment configuration is validated. | Release environment inventory; no secrets copied into test output. | Compare required variable presence/configuration to deployment runbook. | Required settings are present; no credentials appear in logs/client bundle. | — | Pending | Critical | Never paste secret values into this checklist. |
| DEPLOY-003 | Deployment | Deployed service connects to intended database. | Approved staging deployment and staging DB. | Deploy and exercise health plus a controlled owned-workspace request. | Service connects to staging DB only and handles DB failures safely. | — | Pending | Critical | No production DB connection as part of this checklist preparation. |
| DEPLOY-004 | Deployment | Deployment configuration and routes are correct. | Staging release candidate. | Verify runtime, API route availability, timeout and preview configuration. | Required APIs run in the intended environment with expected limits. | — | Pending | High | — |
| DEPLOY-005 | Deployment | Runtime health and error monitoring work. | Staging monitoring configured. | Trigger a controlled non-sensitive error and inspect health/alerting. | Health signals and error telemetry appear without exposing user content or secrets. | — | Pending | High | — |
| DEPLOY-006 | Deployment | Release rollback is viable. | Documented staging rollback artifact/procedure. | Perform rollback exercise and check app/data compatibility. | Prior release can be restored safely; persistence/index changes have a documented compatible path. | — | Pending | High | — |
| DEPLOY-007 | Deployment | End-to-end deployment workflow is complete. | Release candidate, GitHub integration and approved staging host. | Follow the student's documented Launch/Deploy flow from repository push through deployed URL validation. | Workflow has no undocumented manual gap; deployed project can be checked and status is accurate. | — | Pending | High | Current end-to-end production deployment is not evidenced. |

## Validation (Task 4) — automated status

Automated coverage added in Phase 2 Task 4 (run via `npm test`, loader-based ESM resolution):
- `tests/nova/validation.test.mjs` (8 tests): healthy static pass; missing-import failure with affected file; toolchain detection reported `blocked` (never passed); leftover task-marker failure; timeout → `blocked` (`guard:timeout`); output bounding to configured limit; secret redaction across output/errors/summary; input snapshot not mutated (deterministic).
- Combined suites pass **49/49**: validation 8, workspace intelligence 10, workspace isolation 3, project progress 5, conversations 4, security 13, chat route integration 6.
- TypeScript `npx tsc --noEmit --pretty false` passed. ESLint passed on all Task 4 changed files. `git diff --check` passed.

The following manual acceptance cases remain **Pending** (not executed here; do not mark passed without running them) and exercise the Task 4 validation behavior end-to-end in the browser/live service:
- **GUIDED-008 / GUIDED-009** — student runs and sees validation results; failed build/runtime supports safe recovery without task completion.
- **WORKSPACE-014 / WORKSPACE-015** — runtime error reported; stale preview events do not override a newer run.
- **WORKSPACE-016 / WORKSPACE-017 / WORKSPACE-018** — Developer Console reflects build/runtime/validation errors, ordered logs, and bounded long output.
- **AUTH-009** — secret redaction verified against real model payload/stored records/API errors/logs.
- **PERF-006** — run validation latency within an agreed threshold; invalid projects fail without a misleading preview.

Security properties covered by the passing automated suites: workspace ownership enforced (`requireOwnedWorkspace`), cross-project denial, path-traversal rejection (workspace isolation), validation output bounded, secrets redacted, timeouts/interruption handled, and unapproved changes not executed (Nova approval gating). These are implementation/test-verified; live production/live-service behavior remains unverified.

## Learning & Verification (Task 6) — automated status

Automated coverage added in Phase 2 Task 6 (run via `npm test`, loader-based ESM resolution):
- `tests/nova/learning.test.mjs` (9 tests): strong/partial/empty answer evaluation; learning record creation scoped to student+project and idempotent; concept tracking/deduplication; server-side assessment recording flags revision; practical exercise lifecycle recorded against a concept; learning route requires authentication and rejects cross-student access; understanding check evaluated server-side; invalid/forged records rejected; GET returns a bounded, owner-scoped learning summary.
- Combined suites pass **62/62**: validation 8, workspace intelligence 10, workspace isolation 3, project progress 5, conversations 4, security 13, chat route integration 6, learning 9.
- TypeScript `npx tsc --noEmit --pretty false` passed. ESLint passed on all Task 6 changed files (`learning.ts`, `learning/route.ts`, `activity.ts`, `contextBuilder.ts`, `learning.test.mjs`). The pre-existing legacy ESLint diagnostics in `chat/route.ts` `buildMentorSystemPrompt` fallback (lines 126-247) remain and are unchanged by Task 6. `git diff --check` passed.

The following manual acceptance cases remain **Pending** (not executed here; do not mark passed without running them) for Task 6 learning behavior in the browser/live service:
- **LEARN-001** — after an approved implementation, Nova explains what changed, the files involved, and why the approach was chosen, grounded in the actual workspace.
- **LEARN-002** — Nova explains relevant concepts in the context of the actual files (not a generic dump) and does not overwhelm with unrelated concepts.
- **LEARN-003** — Nova asks a contextual understanding question and reports the recorded assessment outcome (Understood / Partially understood / Needs clarification), never marking mastery without assessment evidence.
- **LEARN-004** — Nova assigns a small, workspace-scoped practical exercise and does not modify student code automatically; approval flow is respected.
- **LEARN-005** — learning progress persists across refresh and is isolated per student/project (cross-student and cross-project check).
- **LEARN-006** — a forged client-supplied learning outcome is ignored; the recorded outcome comes from server-side evaluation.

Security properties covered by the passing automated suites: learning route requires authenticated identity; `requireOwnedWorkspace` on every read/write; cross-student denial; server-side assessment (client cannot supply the outcome); bounded inputs and records; secret redaction in stored text; and persistence via the existing MongoDB layer. These are implementation/test-verified; live MongoDB/provider behavior and browser acceptance remain unverified.

## Release sign-off

- [ ] Required automated unit/integration/security checks pass in CI.
- [ ] All Critical and High manual cases pass, or have an explicit approved disposition.
- [ ] Failed cases have linked defects and successful retest evidence.
- [ ] No unresolved cross-student/project isolation or secret-handling issue remains.
- [ ] Production build, staging deployment, monitoring and rollback checks are complete.
- [ ] Tracker statuses and this checklist reflect actual execution evidence.
- **Release decision:** Pending
- **Approver / date:** Pending
