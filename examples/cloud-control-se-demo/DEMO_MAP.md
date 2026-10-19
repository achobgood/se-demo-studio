# Demo map: Cisco Cloud Control dCloud instant demo

Synthesis of `explore_A_actions_products.md`, `explore_B_threads_canvases.md`,
`explore_C_workflows.md`, and `explore_D_agent_probe.md` (explored 2026-09-24, about 18:55 to
19:40 EDT), plus what the recording takes showed. Earlier takes t1 to t5b (19:36 to 20:18 EDT)
used the older action and were deleted; the final v3 cut uses take t6 (about 21:02 EDT) and take t7
(about 21:39 EDT), in `capture/rec/t6` and `capture/rec/t7`.

**Final demo action:** "SD-WAN and Meraki device connectivity and UTD connection disruptions in San
Jose and Mexico City" (list date September 20, 10:08 PM),
https://cloud.cisco.com/home/actions/dc914971-24f8-4b40-9ea9-661372066d0b, opened from the
Actions tab by searching `Mexico`. Why it replaced the earlier action: see section 2. Tenant:
"AgenticOps with Cisco Cloud Control", organization PseudoCo, signed in as a shared demo user. The
tenant is shared with other demo users and resets or regenerates data (the hero incident is dated
"today" each day).

Quoted UI text keeps its original punctuation. "State change: yes" means the step writes something
other demo users can see.

## 1. Surfaces

### Shell (every page)
- **Top bar** (1920 px wide): Home, Intersight, Nexus Hyperfabric, Security, Collaboration Control
  Hub, Meraki, IQ, ThousandEyes, "+2" (holds Nexus Dashboard and likely Splunk). Collapses to "+3"
  or "+4" on narrower layouts. Right side: help, bell, profile.
- **Main menu** (grid icon next to "dCloud"): search "Search for products, apps, and favorites...";
  **Platform Services** Home, Inventory, Topology, Workflows, Identity, Licensing, Admin Console;
  **Products** Meraki, Intersight, Nexus Hyperfabric, Security, Splunk, Collaboration Control Hub,
  ThousandEyes, IQ, Nexus Dashboard; **Apps** (several apps whose release status was unknown; keep off camera);
  **Favorites**; "More Cisco Products".
- **Notifications** (bell): drawer "Notifications", grouped by day, product chips, "Your activity is
  complete" rows for every Assistant run. Read-only except per-row "..." menus (not used).
- Footer on AI surfaces: "Assistant can make mistakes. Verify responses. Learn how the AI Assistant
  handles data at AI Assistant disclosures."

### Home (`/home/assistant`)
- Sub-tabs **Assistant | Canvas | Actions** (red dot on Actions).
- Greeting with the demo user's first name; "Here are your top 3 actions that require review." with
  three cards that change as alerts arrive (Nexus Dashboard and ThousandEyes items at recording).
- Prompt box with a rotating placeholder ("Which Meraki networks have degraded performance right
  now?", "Show me my recent poor-quality Webex Calls."), **Default** mode picker, send.
- **Threads** panel: "Create new", "Canvas overview", history "Today / Yesterday / Previous", "Load
  more conversations". Grid icon = canvas-backed thread; lightning icon = action-linked thread.
  Shared with all demo users.
- Load: about 10 to 12 s.

### Actions (`/home/actions`)
- Tabs **Open | Resolved | Dismissed**; hamburger "Expand Threads"; **Search actions** (keyword over
  title and summary); **Filters** drawer "Filter actions" (Sort by severity or time; Severity;
  Source: Intersight, Meraki, Nexus Dashboard, Nexus Hyperfabric, Security, Splunk, ThousandEyes;
  Assigned to; Reset to default / Cancel / Apply).
- Open list is dominated by single-product ThousandEyes and Nexus Dashboard actions. Multi-product
  actions surface only through search or filters.
- Search results seen: `Mexico` 7 in exploration and 8 in take t6 (a new Meraki "Unreachable
  device" action appeared at 9:04 PM), `SD-WAN` 9, `wireless` 9, `tunnel` 7, `packet loss` 516 (all
  Nexus Dashboard), `uplink` none, `AP` no filtering.
- Action detail: header, "..." (only **Copy link**), blue **Collaborate in Canvas**; meta row;
  Assistant summary; **Related alerts** table (Product | Title | Description | Tenant | Time);
  Assistant analysis blocks; composer ("Context N", "Clear context", "Ask anything, / for prompts,
  # for knowledge", Default or Reasoning).
- **Not present in this build:** Assign, Resolve, Dismiss, timeline section, "Open canvas".
- Load: list about 9 s (auto-opens the newest action); detail about 9 s.
- **State change: yes, on open.** Opening an action auto-runs an Assistant analysis (35 to 60 s
  for actions opened in exploration; about 2 min 40 s for the Sept 20 action in take t6), saves it
  into the action, and posts notifications. Clicking Actions and some searches auto-open
  an action.

### AI Assistant (thread pages `/home/assistant/<id>` and the action composer)
- Modes: "Default / Answers right away" and "Reasoning / For complex queries".
- Answer header on newer threads: "Completed", "N steps completed, M agents used, Xm Ys", eye icon
  and chevron for step details. Plain threads have **Create Canvas** at top right.
- **State change: yes** for every prompt (creates or extends a shared thread).
- Default-mode behavior on 2026-09-24: only the Meraki path ("Network Platform Agent") returned
  data; eight other product agents errored (section 3).

### AI Canvas (`/home/canvas/boards/<id>`)
- Breadcrumb "Canvas overview > <title>", owner avatar, **Share**, "...".
- Left conversation panel (cards post a row "Canvas <date> / <title> / Added to canvas / View").
- Board with cards grouped by type ("Network Devices", "Topologies", "Tables", "Health",
  "Reports", "Charts", "Clients", "Alerts", "Deep Reasoning"); product tags such as "Meraki",
  "Network Platform", "Catalyst SD-WAN", "sdwan-routing", "ThousandEyes", "Splunk", "DeepAgent".
- Right toolbar: Auto layout, Stack cards, Add image, Add text annotation, Lock cards, **Generate
  summary**, View activity, Show minimap, Expand. Zoom "80%".
- Card "..." menu: View originating message, View details, Export CSV, Export PDF, Rename, Remove.
- Plus menu ("Prompts, knowledge, agents, and attachments"): Prompts /, Knowledge bases #, Agents @,
  Add image or file. **No Workflows item** in Default or Reasoning. Prompt categories: Health &
  Availability, Performance, Incidents, Anomalies & Alerts, Topology, Security, Policy & Access.
  Agents list: Cisco Identity, Collaboration Control..., Deep Network Model, firewall, Hyperfabric,
  intersight, Network Platform, NexusDashboard, sdwan-routing, secure-access, Splunk, ThousandEyes,
  Workflows (S5 says the Workflows agent is beta; not used).
- **Collaborate in Canvas** from an action: **state change: yes** (creates a canvas titled after the
  action, carries the conversation, "Context 2"). About 17 s to render.
- **Generate summary**: toolbar tooltip "Generating..." (an earlier take showed a "Generating
  report..." modal with "Cancel"), then a report modal with **Close** / **Download as PDF**. In the
  final cut: "Network Connectivity Incident Report: San Jose and Mexico City" (Table of Contents,
  Incident Overview, Affected Infrastructure, Mexico City Site, San Jose Site, Root Cause Analysis,
  Resolution and Investigation Steps). About 12 to 13 s in takes t6 and t7 (about 22 s earlier). It
  summarizes only what is in the canvas. State change: likely none beyond the session (not verified).
- **Share**: one click showed the toast "Invite link copied to clipboard." (takes t6 and t7). S5 documents
  Share > Invite collaborators > shareable link; anyone joining by link becomes an editor.
  **State change: yes** in effect (creates a live invite link); nobody was invited.
- Banner risk on every canvas: "There is an issue connecting to this canvas. Some features are
  temporarily disabled while the connection is down." Reload once.
- On another owner's canvas, "Lock cards" is replaced by "Only the board owner can lock or unlock
  cards." Do not edit other users' canvases.

### Reasoning mode (observed)
- Final recorded run (take t6, canvas created from the Sept 20 action with Collaborate in Canvas):
  no plan-review step; status "Network Platform Agent: Gathering data"; about 93 s by the log
  (header "4 steps completed, 1 agents used, 1m 21s"); posted the card "Mexico City Device
  Unreachability [em dash] Root Cause Analysis" (tags "Network Platform", "Network Devices") listing
  CW9162-AP-2, CW9164-AP-1, C9200-Access-1, "Multiple devices affected [em dash] pattern indicates a
  site-wide or upstream issue", four most likely causes (upstream WAN first), and recommended
  investigation steps. The chat answer flags "no MX/VMX security appliance ... this is a visibility
  gap". No "Investigation limitations" section. (An earlier take, t3, on the older action produced a
  similar card in 1 min 40 s.)
- Earlier run in another session, same question: 5 min 10 s, "3 steps completed, 2 agents used",
  Meraki plus ThousandEyes, phased answer, a "Deep Reasoning" card tagged "DeepAgent" with KPI
  tiles, Domain status, Timeline, Recommended actions, Key evidence, Analysis status. That output
  names real people as authors of API scripts.
- "Investigation limitations (3)" exists on the "Network & Datacenter Bottleneck Report" card
  (canvas "Network and Datacenter Bottlenecks"), listing Meraki, Nexus Dashboard, and SD-WAN gaps.
- The documented "Plan Review Required / Revise / Approve Plan" UI was not seen anywhere.

### Topology (`/topology`, about 11 s)
- "Scope: All Sites", search, "SD-WAN Fabric" and "Product" dropdowns, **View in Inventory**. Left
  panel "Sites (52)", "Site Status: Poor 6, Warning 5, Healthy 41", **Troubleshoot in Canvas**
  (disabled until a site is chosen from the list), **Browse site connections**.
- Search `Mexico`: site Mexico City; MexicoCity-Campus-Edge1 and Edge2 (Catalyst SD-WAN, SITE_105);
  MexicoCity-Campus-HA (FMC FTD). Site panel shows only "Misconfigured DNS" warnings, status
  Warning; **Open Device Topology** draws FTD, C9500 spine/border, C9300X leaves, C9200 access,
  APs. The site view does not show the AP outage or the SD-WAN failure. Read-only.

### Inventory (`/inventory`, about 11 s)
- Insights cards, "Asset class mix", "Cisco platform" donut; list view with "Search with AI using
  natural language" ("Results are AI-generated and may not be fully accurate."). `Mexico City`
  returned 12 assets in about 5 s. Asset drawer: AI Match Explanation, Topology Preview, **View in
  Topology**, **View in Meraki** (opens a new browser tab). Read-only.

### Product tabs
- **ThousandEyes** (used in takes t4, t6, and t7; the final cut uses t7): the page moves to
  `app.thousandeyes.com` but the Cloud Control top bar stays (with a **Canvas** button and the header
  "Sec Ops User NN / PseudoCo"). About 8 s (t7) to 18 s (t4) to the dashboard. "Dashboard:
  ThousandEyes Built-in", "Alert List" ("Total Alerts 16", "Active Alerts 14" in t7), row
  "MEXICO-UPLINK-PUBLIC-Inet | Default Network Alert Rule 2.0 | Network - Agent to Server | 14 hours
  ago | 13h 38m 41s" in t7. Clicking it opens the test view in about 16 s: "Test:
  MEXICO-UPLINK-PUBLIC-Inet", "198.18.14.1 ICMP", "Metrics: Loss" (100% across Sep 24),
  "Path Visualization" from MexicoCity-Campus-Edge1 and Edge2, both ending at 10.255.0.3 ("3 traces
  terminate here", "Forwarding Loss 100% (36 of 36 packets)"). Controls not used: "Run Instant
  Test" (would start a test, state change), "Explain Selection" (AI), "Snapshot" (share link).
  A cookie banner can appear; dismiss it.
- **Meraki**: leaves the Cloud Control shell in the same tab, 20 to 30 s, lands on the Buenos Aires
  network (not Mexico City), dark theme, cookie banner, footer with org ID and last-login IP. The
  network selector hung the shared Chrome once. Avoid live.
- Other tabs not opened.

### Workflows (`/automate/workflows`, main menu > Workflows, about 12 s)
- Left nav: Exchange, Workspace, Run Monitoring, User Tasks, Targets, Variables, Rules.
- Workspace: 49 workflows, many junk or invalid entries, owner emails of real Cisco staff. Row click
  opens a read-only side panel; **View workflow** opens the editor (never Save).
- Candidates read: "Run Ping from Meraki Device" (diagnostic, status "Import completed", no target,
  never run: do not run); "Remediate Webex Performance Degradation" (writes Meraki traffic
  steering, no approval step); "AP-Reboot" and "Meraki Wireless Network Optimization" (write).
- Run Monitoring: 1,201 runs in 30 days, almost all scheduled: "Power on 9200 Switch" (750),
  "AP-Reboot" (330, every 2 h), "Shutdown 9200 Switch" (120).
- User Tasks > Approvals: 0 pending. No workflow has a Request Approval step among those read.
- Targets: 15, none for Catalyst SD-WAN or ThousandEyes. Variables include `mexico_aps`.
- **State change: yes** for Run, Install (Exchange), Save, rule toggles. None were used.

## 2. The hero incident's data (Mexico City)

- **Final action (used in the v3 cut):** "SD-WAN and Meraki device connectivity and UTD connection
  disruptions in San Jose and Mexico City", Critical Alert, list date "September 20, 10:08 PM", tags
  SD-WAN and Meraki, URL https://cloud.cisco.com/home/actions/dc914971-24f8-4b40-9ea9-661372066d0b.
  Summary: "Between 00:29 and 02:08 UTC on September 21, 2026, multiple SD-WAN devices in San Jose
  and Meraki devices in Mexico City experienced connectivity issues ... The incident affected six
  devices across SD-WAN and Meraki platforms ..." Related alerts (66 rows, all dated Sun, Sep 20, 9:26
  PM to 10:08 PM): Meraki "Unreachable device" for CW9162-AP-2 (Mexico City - wireless, 23 min) and
  C9200-Access-1 (Mexico City - switch, 1 min); the rest SD-WAN UTD Con, Interface State Change
  (Tunnel16000001), Control TLOC Down, OMP Node Down, Tracker State Change, and UTD File Reputation
  rows on SanJose-Branch1-Edge1/Edge2 and SanJose-DC2-Edge1/Edge2. The live analysis in t6 (about 2
  min 40 s) "Checked insights from: the action record, Catalyst SD-WAN telemetry, Meraki Dashboard
  API", called the San Jose event "a sustained SD-WAN control-plane instability event" that also
  "interrupted security service connectivity", and said the Mexico City AP and switch "became
  unreachable independently during the same window", the AP with "a power event/reboot at ~01:23
  UTC". The Default follow-up (about 75 s) found the switch online, CW9162-AP-2 still offline "roughly
  4 days later", and "No MX/VMX security appliance ... WAN uplink health for this site cannot be
  validated from the Meraki side".
- **Why this action replaced the earlier one.** Takes t1 to t5b used "VPN and connectivity outage
  impacting RTP-DC3edge2 and Mexico City wireless AP" (dated "today", window 17:04 to 17:32 UTC;
  Meraki CW9162-AP-2 plus five SD-WAN alerts on RTP-DC3edge2, a device outside Mexico City). Per the
  orchestrator's account of exploration, that Mexico City action was being re-triggered by the demo's
  own scheduled AP-Reboot workflow and its data changed across attempts. What is verified here:
  AP-Reboot runs every 2 hours "to trigger device unrechability events" (explore C), the older
  action carried "today" dates, and a new Meraki "Unreachable device" action appeared at 9:04 PM
  during take t6. The Sept 20 action's related alerts are historical and fixed, it names Mexico City
  devices directly, and its live analysis completed cleanly in the take-6 recording.
- **Earlier action (superseded, kept for reference):** related alerts were Meraki CW9162-AP-2 and
  SD-WAN Tunnel17000101/Tunnel17000102 down, Control TLOC Down, BFD TLOC Down (biz-internet), BGP
  Router Down on RTP-DC3edge2 (Site 13); its saved analysis read the biz-internet TLOC loss as the
  driver and noted an RF profile change on CW9162-AP-2.
- **Meraki (via Assistant):** Mexico City is the one "Fair" network (score about 85 to 88),
  client scores about 70 to 76, 14 critical "Unreachable device" alerts, about 20 "Port not
  forwarding traffic due to access policy" warnings, 2.4 GHz radio issues on CW9164-AP-1 and
  CW9162-AP-3.
- **ThousandEyes (console):** MEXICO-UPLINK-PUBLIC-Inet at 100% loss across Sep 24 from both
  Mexico City edge agents; MEXICO-UPLINK-BIZ-Inet looked healthy in a 09/02 thread; another run
  reported 50% on both. Data disagrees across runs; check live.
- **Catalyst SD-WAN:** Site_105 Mexico City exists (edges MexicoCity-Campus-Edge1 and Edge2). The
  SD-WAN events in the final action are on San Jose edges, not Mexico City; the analysis treats them
  as a separate problem. The SD-WAN agent errored in Default mode during exploration.
- **Likely fault injection (hypothesis, strong):** "AP-Reboot" disables a switch port every 2 hours
  "to trigger device unrechability events"; "Power on/Shutdown 9200 Switch" cycle a switch. Devices
  therefore drop on a schedule (the Reasoning card's timeline shows roughly two-hour intervals).

## 3. Agent availability (Default mode, 19:04 to 19:20 EDT)

| Agent | Result | Time chip |
|---|---|---|
| Network Platform (Meraki) | data | 24 to 46 s |
| ThousandEyes | error ("tools are not available for this query category"; retry also failed) | <1 s |
| SD-WAN | error ("returning an error for tunnel health and BFD session queries"; retry failed) | <1 s |
| Nexus Dashboard | error ("not accessible in this session") | <1 s |
| Intersight | error (offered other tools) | 1 s |
| Splunk | error ("currently unavailable") | <1 s |
| Firewall (cdFMC) | error ("availability error") | <1 s |
| Secure Access (Beta), Hyperfabric | error inside the multi-agent probe | <1 s |

Reasoning mode reached ThousandEyes data once in a rehearsal (1 min 52 s) and in another session
(5 min 10 s), but a Reasoning follow-up about ThousandEyes during recording failed ("the
ThousandEyes tools are not available in this session for your tenant", 17 s).

## 4. Slow steps (for pacing and speed ramps)

| Step | Time |
|---|---|
| Automatic analysis when an action is first opened | 35 to 60 s (exploration); about 2 min 40 s (Sept 20 action, t6) |
| Default question | 14 s to 2 min 30 s; about 48 s (older action, t2); about 75 s (final, t6); one follow-up 4 min 2 s |
| Reasoning question | about 93 s (final, t6; header "1m 21s"), 1 min 40 s (t3), 1 min 52 s, 5 min 10 s |
| Collaborate in Canvas | about 15 to 17 s |
| Generate summary | about 12 to 13 s (t6, t7); about 22 s (t5b) |
| ThousandEyes tab / test view | about 8 s (t7) to 18 s (t4) / about 16 s |
| Meraki tab | 20 to 30 s |
| Topology, Inventory, Workflows pages | 11 to 16 s |

## 5. Which incidents the data supports end to end

1. **Mexico City via the Sept 20 action (chosen for v3).** Correlated SD-WAN plus Meraki action; its
   live analysis separates the San Jose SD-WAN event from the Mexico City devices; a Default
   question returns the current Mexico City picture and the missing-MX visibility gap; Collaborate
   in Canvas and Reasoning produce a card pointing to an upstream WAN cause; the ThousandEyes console
   shows 100% loss on the Mexico City public uplink test and both edges' paths stopping. Gaps: no
   Assign or Resolve, no workflow, SD-WAN and ThousandEyes agents unreliable, the ThousandEyes
   evidence stays outside the canvas, and the action's dates (Sept 20 and 21) differ from the live
   answers (Sept 24 and 25). The older Mexico City action ("VPN and connectivity outage impacting
   RTP-DC3edge2 ...") supported the same story in takes t1 to t5b but was replaced (section 2).
2. **Buenos Aires (Cisco's scripted site).** Long scripted prompt about a new switch: 10 steps, 4
   agents, 2 min 25 s, strong 802.1X plus STP root cause; site thread with Meraki, ThousandEyes, and
   SD-WAN answers (7 steps, 3 agents, 2 min 14 s). No correlated action found for it. Depends on
   agents that errored on recording day.
3. **ThousandEyes HTTP alert (Morrisville agent).** "Default HTTP Alert Rule 2.0" action with auto
   analysis in about 45 s. Single product; the analysis itself says ThousandEyes tools were
   unavailable.
4. **SD-WAN VPN topology link.** Clicking a VPN link on an "Organization SD-WAN Topology" card
   auto-generates a troubleshooting prompt (7 steps, 2 agents, 2 min 47 s). Meraki Auto VPN and
   Secure Access, not Catalyst SD-WAN.
5. Other correlated SD-WAN plus Meraki actions (Sept 17 widespread, 32 devices; Sept 16 and 14
   widespread; Sept 18 topology disruptions). Noisier; one is assigned to a named person. The Sept
   20 San Jose and Mexico City action from this list became the final demo action (item 1).

## 6. Hazards

- Shared tenant: every prompt, canvas, and thread is visible to other demo users, and theirs to us.
- Real names and IDs appear in thread titles, avatars, assignee filters, workflow owners, the
  Meraki footer, and one Reasoning output. The owner said blurring is not needed for this internal
  fictional demo.
- The ThousandEyes path tooltip shows a public router hostname ("rt-bl-1-enet-1-9.or1.ne.adobe.net")
  and "Morrisville, North Carolina"; the ThousandEyes header shows the demo user name.
- The shared Chrome's debug port hung twice during exploration (after the Meraki network selector
  and under multi-agent load).
- Theme: the demo account's profile **Theme** preference was Dark, which flipped the embedded
  ThousandEyes page and later pages to dark partway through take t6. It was set to Light at 21:39
  (profile menu, logged in `logs/state_changes.md`), and take t7 re-recorded the tail in light theme.
