# Cisco Cloud Control: platform map

- **Last verified:** 2026-11-16. Each fact carries its own date; older dates are older observations.
- **Environment:** dCloud instant demo "AgenticOps with Cisco Cloud Control", organization PseudoCo (fictional
  data), at `cloud.cisco.com`. Shared with other demo users; the lab regenerates data and injects faults on a
  schedule, so every count below is a snapshot.
- **Identity and role:** a shared dCloud demo login (`sec_ops_user_NN`). Read-only for configuration: workflow
  editor fields render disabled and Exchange Install buttons are disabled [verified 2026-11-16].
- **Source jobs** (job folders in the jobs copy; `scripts/find-notes.sh cloud control` lists them):
  `cloud-control-se-demo` (2026-09-24), `cloud-control-platform-research` (2026-10-01, 2026-10-02, 2026-11-16),
  `splunk-ccc-remediation` (2026-11-16). The finished September demo is in this repo at
  `examples/cloud-control-se-demo/` (its `DEMO_MAP.md` and `PRODUCT_NOTES.md` hold more September detail).

Labels: **verified** = seen in the UI on that date; **docs** = official documentation only; **absent** = looked for
in the tenant and not found on that date; **hypothesis** = inferred, not checked. Re-check every fact live before
a storyboard depends on it (L90). Paths in backticks help you recognize where you are; get there by clicking the
product's own menus (L88).

## Navigation

- The address is `cloud.cisco.com`; `cloudcontrol.cisco.com` does not load [verified 2026-11-16].
- The product menu is the grid control named "Open product search", next to "dCloud". Groups [verified
  2026-09-24, Apps reconfirmed 2026-10-01]:
  - **Platform Services:** Home, Inventory, Topology, Workflows, Identity, Licensing, Admin Console.
  - **Products:** Meraki, Intersight, Nexus Hyperfabric, Security, Splunk, Collaboration Control Hub,
    ThousandEyes, IQ, Nexus Dashboard.
  - **Apps:** DefenseClaw, Agentic Security, Agent Security, Agent Observability, Multicloud Fabric, Network App
    Impact. Then Favorites and "More Cisco Products".
  - Pin controls sit beside each item. Click the item name, not the pin.
- Top bar at 1920 px: Home, Intersight, Nexus Hyperfabric, Security, Collaboration Control Hub, Meraki, IQ,
  ThousandEyes, and a "+2" overflow (it holds more on narrower windows); help, bell, and profile on the right
  [verified 2026-09-24]. A Licensing button is also on the top bar [verified 2026-10-01].
- Typed paths fail where menus work: `/automate/rules` and `/identity` returned "Page not found"; the sidebar
  routes were `/automate/triggers` and `/identity/integrations` [verified 2026-11-16].
- Agent Observability's landing URL carries a project, stream, time range, and interval. Open it from the menu to
  get a current selection; an old URL replays old timestamps [verified 2026-10-01].

### Cross-launch behavior

| Product | What happens | Last verified |
|---|---|---|
| Splunk | Opens the lab's Splunk Cloud site inside the Cloud Control frame, same tab. A brief white page during the launch (cut it). Shell about 6 s, panels about 20 s | 2026-11-16 |
| ThousandEyes | Moves to `app.thousandeyes.com` and keeps the Cloud Control top bar (with a Canvas button). 8 to 18 s to the dashboard. A cookie banner can appear | 2026-09-24 |
| Intersight | Opens the regional Intersight site in the same tab and keeps Cloud Control navigation | 2026-10-01 |
| Meraki | Leaves the Cloud Control shell in the same tab, 20 to 30 s. Landed on the Buenos Aires network, not the incident site. Its network selector hung the shared Chrome once | 2026-09-24 |
| Collaboration Control Hub | Shows `admin.webex.com/login` briefly, then reaches Overview through the existing session with no sign-in typed. Do not call the login URL a blocker until it settles | 2026-10-01 |
| Security | Opens `security.cisco.com`; the Chrome extension needs that site allowed separately | 2026-11-16 |
| Inventory asset drawer | "View in Meraki" opens a new browser tab | 2026-09-24 |

### Loading and reading the screen

- An initial zero, empty table, or placeholder can mean loading rather than absence. Nexus Dashboard Fabrics
  showed zero totals and skeleton rows, then 13 fabrics; Identity and ISE views took tens of seconds; Agent
  Observability's headline and trend regions loaded after placeholders [verified 2026-10-01].
- The first snapshot after a click can still show the previous page. Confirm the new URL and heading before
  deciding what a destination shows or calling a link broken [verified 2026-10-01].
- Intersight's accessibility text included inactive dialogs (session expiry, licensing) while the screen showed a
  tour over the server table. Its "Got it" button did not match a text selector and was clicked at its screenshot
  location. Use screenshots for visual claims and page text for exact labels [verified 2026-10-01].

## What lives where

### Home (Assistant, Canvas, Actions)

- **Assistant** (`/home/assistant`): greeting with the demo user's first name, "top 3 actions" cards, a prompt box
  with a Default or Reasoning mode picker, and a Threads panel shared by all demo users. Load 10 to 12 s
  [verified 2026-09-24]. The composer menu lists Prompts, Knowledge bases, Agents, Workflows, and Add image or file
  [verified 2026-10-02]. The composer is a contenteditable field: the first typing attempt moved a trailing period
  to the start; collapsing the selection to the end before each character fixed it [verified 2026-09-24].
- **Actions** (`/home/actions`): Open, Resolved, and Dismissed tabs; Search actions (title and summary keywords);
  Filters with Source values Intersight, Meraki, Nexus Dashboard, Nexus Hyperfabric, Security, Splunk,
  ThousandEyes. The Open list is mostly single-product ThousandEyes and Nexus Dashboard items; multi-product
  actions surface through search or filters. The action detail has Copy link and Collaborate in Canvas; no
  Assign, Resolve, or Dismiss [verified 2026-09-24].
- **Canvas** (`/home/canvas/boards/...`): Share, cards grouped by type with product tags, conversation panel, and a
  toolbar with Auto layout, Add image, Add text annotation, Lock cards, Generate summary, View activity
  [verified 2026-09-24]. A saved board from 2026-09-30 kept the conversation plus a ThousandEyes packet-loss card
  and an SD-WAN BFD-session card, each marked "Added to canvas", with an activity timeline [verified 2026-10-02].

### Topology and Inventory

- **Topology** (`/topology`, about 11 s): Sites (52), status Poor 6, Warning 5, Healthy 41; Troubleshoot in Canvas
  is disabled until a site is chosen. The Mexico City site showed only "Misconfigured DNS" warnings, not its AP
  outage; Open Device Topology draws the site's FTD, switches, and APs [verified 2026-09-24].
- **Inventory** (`/inventory`, about 11 s): insight cards for security advisories, active anomalies, non-compliant
  assets, stale telemetry, missing version tracking, and management-source offline (87, 78, 40, 66, 40, and 5 on
  2026-10-02). "Search with AI using natural language" returned 12 Mexico City assets in about 5 s [verified
  2026-09-24]. Opening "Non-Compliant Assets at Risk" filtered the table, but some rows read Partial or missing
  rather than Non Compliant; the filter's meaning was not established [verified 2026-10-02].

### Workflows (Platform Services > Workflows)

- Sidebar: Exchange, Workspace, Run Monitoring, User Tasks, Targets, Variables, Rules [verified 2026-11-16].
- **Workspace:** 49 workflows on 2026-09-24, 77 on 2026-11-16, including other users' test items. A row opens a
  read-only side panel; View workflow opens the editor [verified 2026-11-16].
- **Run Monitoring:** 1,201 runs in 30 days on 2026-09-24 and 1,241 on 2026-11-16, almost all from Schedule rules
  (the lab's fault workflows; see "Real, staged, or empty") [verified].
- **Rules > Automation Rules:** 4 rules, all type Schedule. The Type filter offers Approval Task, Email, Schedule,
  Webhook [verified 2026-11-16].
- **Rules > Webhooks:** "No Webhooks found." [verified 2026-11-16].
- **User Tasks:** Approvals and Prompts tabs, 0 tasks, "No User Tasks found." [verified 2026-11-16].
- **Targets:** 15 on 2026-09-24; 17, all Valid, on 2026-11-16, including Cisco ISE, Identity Fabric, Meraki, a
  PseudoCo Meraki organization, a Catalyst SD-WAN test target, a Cisco Inventory target, several HTTP targets, and
  AI endpoints. The Type list includes Splunk Platform Endpoint, ServiceNow Endpoint, and Webex Control Hub
  Endpoint, but no Splunk target exists [verified 2026-11-16].
- **Exchange:** search "webhook" returns 7 items, including "Meraki Restrict Client BW - Webhook_Driven" (Cisco
  Verified) and Meraki webhook items marked Cisco-Managed. The Integration filter with ISE returns no Exchange
  workflows [verified 2026-11-16].

### Identity and Licensing

- **Identity** side navigation: Dashboard, Users, Applications, Endpoints, Agents, Non-Human Identities,
  Integrations, Checks, ISE Monitoring, System Logs, Settings. Several posture charts showed loading placeholders
  for a long time [verified 2026-10-01].
- **Identity > Integrations:** AD, Duo, Microsoft Entra ID, and ISE, all labeled Connected [verified 2026-10-01 and
  2026-11-16]. On 2026-10-01 AD's last collection was from August and some providers showed zero records; on
  2026-11-16 ISE's last collection was that day. Connected and recently collected are separate facts.
- **ISE Monitoring:** an ISE Health Dashboard marked Beta: agent connectivity, heartbeat, collected-data age,
  sessions, authentication latency, and a node table. Deployment "PseudoCo ISE", version 3.4.0.608 Patch 1, one
  node. Tens of seconds to load [verified 2026-10-01].
- **Licensing:** 57 licenses with filters for method, billing type, balance, and architecture. An Aironet DNA
  Advantage Term Licenses record had a negative balance and an Associated Devices tab; Purchases And Transactions
  was disabled [verified 2026-10-01].

### Apps

- **Network App Impact** ("Powered by Splunk"): 37 services. "coreapi" was degraded with "No network signal" and
  no correlated hosts; "assistant-service" was healthy, network correlated, with eight hosts. Service links point
  to the lab's Splunk APM site (not followed) [verified 2026-10-01].
- **Agent Observability:** project "PseudoCo Assistant", stream "MedAdvice": requests, tool and LLM failures,
  tokens, cost, signals, controls (observed, denied, steered, not triggered), and evaluator trends. The stream
  holds sensitive-content signal categories; read category summaries, do not open raw prompts on camera
  [verified 2026-10-01].
- **Agentic Security:** banner "Demo only. Agentic Security App is for demonstration purposes only and is not
  currently functional." It is about securing AI agents, not security operations [verified 2026-11-16].
- **Studio** (`/agent-studio`): Agent and App entry points. App Quick starts: Golden Image Compliance, Unified
  Software and Advisory Attention, Connected Clients and VPN Sessions. Agent Quick starts: Meraki operations,
  Secure Access operations. The App prompt is a read-only text area (custom app prompts are not accepted here);
  Manage Applications showed "No applications yet" [verified 2026-10-02]. A Golden Image build produced a draft
  whose preview loaded, with "Install is not available for Apps yet" [verified 2026-10-02].
- **Marketplace** (`/marketplace`): "Demo only" and not currently functional; its listings are illustrative
  [verified 2026-10-02].

### Products

- **Intersight** Servers: 53 servers, all labeled healthy, while HCL, profile, and support facets still held
  incomplete or not-evaluated states. An informational tour must be dismissed first [verified 2026-10-01].
- **Nexus Dashboard:** Clusters showed 5 clusters and 13 nodes (RTP, SJC, SNG, LON); Fabrics loaded 13 fabrics and
  58 switches after starting at zero [verified 2026-10-01].
- **Collaboration Control Hub:** Overview with "Read-only admin" and "Webex site admin" role labels; Monitoring
  lists Analytics, Troubleshooting, and Reports. A click on Troubleshooting did not leave Overview [verified
  2026-10-01]. The September job found every Webex meeting in the org rated good; the usable poor-quality example
  was a Webex Calling call (see `examples/cloud-control-se-demo/PRODUCT_NOTES.md`).
- **ThousandEyes:** Dashboard "ThousandEyes Built-in" and Alert List. Test "MEXICO-UPLINK-PUBLIC-Inet" showed 100%
  loss from both Mexico City edge agents, with Path Visualization ending at one hop; the test view took about
  16 s [verified 2026-09-24]. A later Assistant answer found one of the "MexicoCity" agents located in
  Morrisville, North Carolina [verified 2026-10-02]. Loss figures disagreed across runs; check live.
- **Splunk:** lands in Splunk Secure Networking Essentials, last-used workspace. The workspace switcher holds
  Secure Networking, Zero Trust Access, Network Resilience, Agentic Security Operations Center, Security
  Operations, Executive Briefing. "Agentic Security Operations Center" is telemetry panels (DNS, Firewall Threat
  Defense, Zeek, DHCP), several at zero, with no incident or decision objects. Splunk renders dark whatever the
  Cloud Control theme [verified 2026-11-16].

## Real, staged, or empty

| Item | Status | Last verified | Notes |
|---|---|---|---|
| Webhook receiving (Rules > Webhooks) | empty | 2026-11-16 | Capability exists; no webhook configured |
| Webhook automation rule | absent | 2026-11-16 | All 4 rules are Schedule |
| Approval inbox (User Tasks) | empty | 2026-11-16 | Approvals and Prompts tabs, 0 tasks |
| Request Approval step in workflows | absent in those read | 2026-09-24 | Documented (docs 2026-11-16); none of the workflows opened had one |
| "Agentic Workflows" catalog items (Quarantine User Login Remediation, Cisco Secure Access Remediation) | staged | 2026-11-16 | Validated and well described, but the steps opened are Sleep activities with no target; no runs in 30 days (L84) |
| "Quarantine a Rogue Client" | staged (hypothesis: enforcement missing) | 2026-11-16 | Its "Quarantine the Rogue client" step only updates a variable; no apply-policy call seen |
| "Meraki Restrict Client BW - Webhook_Driven" (Exchange) | real, not installed | 2026-11-16 | Cisco Verified (partner authored and supported). Details page documents body fields, outcomes, release, and limits; showable without installing (L85) |
| "Remediate Webex Performance Degradation" | real write | 2026-09-24 | Changes Meraki traffic steering and posts to Webex with no approval step |
| Splunk Enterprise Security, Mission Control, SOAR | absent | 2026-11-16 | Searched the Splunk apps panel for "secur", "soar", "enterprise", "mission" |
| Splunk target in Workflows | absent | 2026-11-16 | |
| Scheduled faults | real, lab-made | 2026-09-24 | "AP-Reboot" runs every 2 hours "to trigger device unrechability events"; "Power on 9200 Switch" and "Shutdown 9200 Switch" cycle a switch. Run Monitoring was still all scheduled runs on 2026-11-16 |
| Canvas keeping cross-product evidence | real | 2026-10-02 | ThousandEyes and SD-WAN cards on one saved board |
| Marketplace, Agentic Security app | staged | 2026-10-02, 2026-11-16 | "Demo only" banners |
| Studio app install | absent | 2026-10-02 | "Install is not available for Apps yet" |

## Actions that change state

The tenant is shared: other demo users see every one of these. Agree in the interview which ones the job may use.

- **Opening an Action** auto-runs an Assistant analysis and saves it into the action (35 s to 2 min 40 s), and posts
  notifications. Clicking the Actions tab and some searches auto-open the newest action [verified 2026-09-24].
- **Selectors with side effects:** a selector for the "Default" mode button matched the Home action card "Default
  HTTP Alert Rule 2.0" by substring and opened it, which started an analysis [verified 2026-09-24]. Match Home
  controls by exact name and role, never by substring.
- **Every Assistant prompt** creates or extends a shared thread [verified 2026-09-24].
- **Collaborate in Canvas** creates a board titled after the action [verified 2026-09-24].
- **Share** copies a live invite link ("Invite link copied to clipboard."); anyone joining by link becomes an
  editor [verified 2026-09-24; editor role from docs].
- **Generate summary** opens a report modal with Download as PDF. Whether it saves anything was not verified;
  treat it as a state change.
- **Workflows:** Run, Save, Exchange Install, and rule on/off toggles. Answers from the Workflows Agent carry Run
  and Install buttons; never click them [verified 2026-11-16].
- **Studio:** a Quick start's Build creates a persistent draft app. In the Golden Image preview, "Edit policy"
  reported "Policy applied" and started a refresh [verified 2026-10-02].
- **ThousandEyes:** Run Instant Test starts a test; Snapshot creates a share link [verified 2026-09-24].
- **Profile Theme** is an account setting. On 2026-11-16 it was "System", and the app caches its resolved theme;
  pin the theme in the job instead of changing the account [verified 2026-11-16].

## Agent probe results

Probe each agent the story needs, in a new thread, before building on it (L9). Template:
`toolkit/job-template/research/AGENT_PROBE.md`.

**2026-09-24, Assistant, Default mode** (one question per new thread; failures retried about 8 minutes later):

| Agent | Result | Time chip |
|---|---|---|
| Network Platform Agent (Meraki) | data | 24 to 46 s |
| ThousandEyes Agent | error, "tools are not available for this query category"; retry failed | <1 s |
| SD-WAN Agent | error, "returning an error for tunnel health and BFD session queries"; retry failed | <1 s |
| Nexus Dashboard Agent | error, "not accessible in this session" | <1 s |
| Intersight Agent | error; offered other tools | 1 s |
| Splunk Agent | error, "currently unavailable in this session" | <1 s |
| Firewall Agent | error, "availability error for this query category" | <1 s |
| Secure Access Agent (Beta), Hyperfabric Agent | error inside a multi-agent question | <1 s |

- The tell for a failed agent: its time chip shows `<1s` or `1s`. Some error replies say they are "relaying this
  feedback to our development team"; keep those off camera.
- Reasoning mode reached ThousandEyes data once in rehearsal (1 min 52 s), then failed during recording (17 s).

**2026-10-02:** a broad Mexico City request across Meraki and ThousandEyes looped on a Meraki organization
question and was stopped. A narrower prompt naming the PseudoCo organization completed in 57 s (Network Platform
Agent, 21 s). A ThousandEyes follow-up completed in 1 min 48 s, but its generated Mean Latency and Mean Packet
Loss cards showed `NaN` labels instead of a plot. Narrow questions with the organization named worked better.

**2026-11-16:** "What Splunk integrations are connected to this tenant?" ran the Splunk Cloud Platform Agent and
answered in about 20 s (answers varied run to run, L4). A question about Exchange workflows started by a webhook
ran the Workflows Agent (Beta label shown) in 29 to 38 s. That agent lists catalog items and quotes docs, but it
could not return workflow definitions (trigger, inputs, steps); the Workflows editor is the source (L86). A thread
saved earlier that day was gone by evening (L100).

## Slow steps

| Step | Time | Last verified |
|---|---|---|
| Analysis when an action is first opened | 35 to 60 s; about 2 min 40 s for one older action | 2026-09-24 |
| Default Assistant question | 14 s to 2 min 30 s; one follow-up took 4 min | 2026-09-24 |
| Reasoning question in a canvas | 1 min 20 s to 5 min 10 s | 2026-09-24 |
| Collaborate in Canvas | 15 to 17 s | 2026-09-24 |
| Generate summary | 12 to 22 s | 2026-09-24 |
| Topology, Inventory, Workflows pages | 11 to 16 s | 2026-09-24 |
| Exchange page and item details | about 6 s | 2026-11-16 |
| Splunk shell, then panels | about 6 s, then about 20 s | 2026-11-16 |

## Traps

- The Home action named "Splunk Alert" is a ThousandEyes alert with that name, not a Splunk event [verified
  2026-11-16].
- Workflow names overstate. Open two or three action steps and read the step type and target, then check run
  history, before building on any "remediation" or "quarantine" workflow (L84) [verified 2026-11-16].
- The incident data is lab-made and moves: scheduled workflows reboot APs and cycle a switch every two hours, and
  an action dated "today" changed between takes. A historical action with fixed related alerts was steadier
  [verified 2026-09-24].
- Dates disagree across surfaces: an action from September 20 sat beside live answers dated September 24; a saved
  canvas narrative listed BFD event times four hours apart from the times on its own card [verified 2026-09-24,
  2026-10-02]. Do not join different dates into one cause.
- The canvas banner "There is an issue connecting to this canvas. Some features are temporarily disabled while
  the connection is down." is common; reload once. A visible control is not proof that it works while the banner
  shows [verified 2026-09-24, 2026-10-02].
- On another owner's canvas, Lock cards is replaced by "Only the board owner can lock or unlock cards." Do not edit
  other users' canvases [verified 2026-09-24].
- Theme: a light-theme emulation mixed light and dark pages and one take was discarded; Splunk renders dark
  regardless [verified 2026-11-16].
- The shared Chrome's debug port hung twice during exploration: after the Meraki network selector and under
  several browser-driving agents (L12) [verified 2026-09-24].
- Names to keep distinct: Cisco Cloud Control is not Cisco Security Cloud Control. Targets include HTTP targets
  named "Secure Cloud Control" and "scc"; do not narrate them as Cloud Control [verified 2026-11-16].
- **Redaction list.** These show real people or account details: thread and canvas lists (other users' titles),
  Owner columns in Rules, Targets, and Workspace (employee email addresses), workflow and target names that
  include a person's name, the Exchange install panel's target, the Splunk top bar (demo login email), the
  ThousandEyes header (demo user name), the Meraki footer (organization ID, last sign-in IP), a ThousandEyes path
  tooltip (a public router hostname), and one Reasoning output that named real people as script authors
  [verified 2026-09-24, 2026-11-16]. Collapse the Threads panel before takes; crop or blur the rest.

## Evidence that is easy to overstate

Planning notes for storyboards and claim checks. Do not copy these "X is not Y" lines into narration (L98); say
plainly what the screen shows instead.

- Connected is not the same as recently collected.
- Device online is not the same as clients having service.
- A healthy controller cluster is not the same as a healthy managed fabric.
- A healthy server is not the same as accepted HCL, supported lifecycle, or a consistent profile.
- A missing network metric is not zero loss or proof that the network is uninvolved.
- A within-threshold evaluator with zero observations is not a passing evaluation.
- A generated root-cause label is not verified causality.
- A catalog listing, a "Validated" badge, or an "Added" badge is not a configured integration or a working
  action.
- A Studio-reported build result (for example "61 passing tests") is the product's claim, not a check we ran.

## Documented, not seen in this tenant

From official Cloud Control Workflows documentation (page updated 2026-10-27) and Splunk documentation; quotes and
URLs are in `splunk-ccc-remediation/research/SOURCES.md` in the jobs copy [docs 2026-11-16].

- Webhooks: Workflows > Rules > Webhooks > New webhook gives a Webhook ID, API key, and URL. POST to it with the
  `x-automate-api-key` header (preferred) or an `api_key` query parameter; it answers 202 with no body. Limits: 30
  webhooks per organization, 10 triggers per minute per event, 5,000 per day, 1 MB payload, 60-minute maximum run.
  Webhook API keys expire after one year by default.
- A Webhook rule checks headers or body values (ALL, ANY, or Advanced) and maps the request body to one string
  workflow input; one webhook can start several workflows.
- Request Approval pauses a run for approvers chosen by role or email, with a minimum number of approvals. If the
  request expires, the run resumes, so the workflow must branch on the answer.
- Splunk's built-in webhook alert action has no documented custom headers; a Splunk SOAR playbook (HTTP app "post
  data") can send them. No packaged Splunk-to-Cloud Control remediation integration was found; the documented
  integration is sign-on, cross-launch, Splunk data and skills in AI Canvas, and the AI Assistant.
- Availability: "Generally Available in the United States only". The Splunk connection needs Splunk Cloud Platform
  10.5 or later on US Commercial AWS. The Workflows agent in AI Canvas is beta. Workflows are not supported in
  Reasoning mode.

## Not yet explored

As of 2026-11-16, these were not opened, or opened without enough to build on. Menu presence does not show that
they work.

- Admin Console, Variables, Models, IQ, DefenseClaw, Agent Security, Multicloud Fabric, Nexus Hyperfabric detail,
  and the Security product (the browser extension had not been allowed on `security.cisco.com`).
- Intersight server detail, Nexus fabric and switch detail, Meraki and ThousandEyes detail since 2026-09-24.
- Control Hub troubleshooting with call or meeting data in the current build.
- Raw Splunk searches, and whether a Splunk webhook alert sends the headers a Cloud Control webhook requires.
- Whether Reasoning mode fixes the SD-WAN, Nexus Dashboard, and Intersight agent errors.
- Whether ISE containment actions are available in Cloud Control Workflows (a Cisco ISE target exists; ISE
  actions are documented only in another product's catalog).
- Any write path: creating a webhook, a rule, or a run needs a role this demo login does not have.
