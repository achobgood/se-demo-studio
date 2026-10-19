# Cisco Cloud Control: virtual SE demo script (final v3 cut)

Runtime 5:20.27 (320.267 s, `build/cues.json` "total"). Voice: google/gemini-3.8-flash-tts, voice
Iapetus, take V3e with the "path" and "q2" paragraphs from take V3h (`build/cues.json` "takes";
model per `logs/costs.jsonl`). The talk track below is `script/speech.txt` word for word (24
paragraphs, one per cue segment), with the pronunciation spellings restored for reading: "S D WAN"
is written SD-WAN and "Thousand Eyes" is written ThousandEyes. `speech.txt` itself is locked and
unchanged.

Every time is on the final timeline. Chapter and talk-track times come from the `segments` array in
`build/cues.json`; click, typing, and ramp times come from `build/footage.json` and from the
recording keys in `lib/build_clips.py`, which map timeline seconds to recording seconds in take t6
(`capture/rec/t6`, Home through the Reasoning result) and take t7 (`capture/rec/t7`, ThousandEyes
through Share). The clicks and typed text are what `capture/t6_full.js` and `capture/t7_tail.js`
actually performed, confirmed against the `marks` arrays in each take's `log.json`. Overlay text is
copied from `build/scenes.js`. Product UI text was read from the captured frames
(`python3 lib/frameat.py <take> <seconds>`).

Source IDs: S1 to S20 are in `../cloud-control-ad/research/SOURCES.md`; A1 to A14 are in
`research/SOURCES_ADDENDUM.md`. "Shown" means the footage demonstrates it and no general product
claim is attached. Full claim table and flagged lines: `research/CLAIMS.md`.

Punctuation note: this file uses no em dashes. Where product UI or a Cisco quote contains an em
dash, it is written as `[em dash]` so the quote stays exact without reproducing the character.

This script is also meant for a human SE running the same demo live in the Cisco dCloud instant
demo "AgenticOps with Cisco Cloud Control". Read "Live-run notes" at the end first: the waits are
long, opening an action changes shared state, and the demo data is dated.

## The action this demo uses

- Title: **SD-WAN and Meraki device connectivity and UTD connection disruptions in San Jose and
  Mexico City** (list date "September 20, 10:08 PM"; tags SD-WAN, Meraki; "Critical Alert").
- URL: https://cloud.cisco.com/home/actions/dc914971-24f8-4b40-9ea9-661372066d0b
- How to reach it: Home, **Actions** sub-tab, type `Mexico` in **Search actions**, press Enter, click
  the card. In the recorded take it was the third of 8 results.
- Canvas created from it in take t6 (reused by take t7):
  https://cloud.cisco.com/home/canvas/boards/79f74b7a-6a82-4f4f-8cf4-7c4b71939025

Why this action and not the earlier "VPN and connectivity outage impacting RTP-DC3edge2 and Mexico
City wireless AP": see `research/DEMO_MAP.md`, section 2.

## Persistent overlay text (scenes.js)

These sit over the product footage from 0:42.39 (frame in) to 4:45.89 (frame out,
`S1('share') + 1.3` = 285.885 s):

| Element | Text | When (timeline) |
|---|---|---|
| Footer | "Real product UI · Cisco dCloud demo, fictional data" | fades in from 0:43.09, stays until the frame exits |
| Lower third | "Virtual SE demo · AI-generated voice" | 0:43.59 to 0:49.89 |
| Chapter chips (`CHAP`) | "1 · Start in one place", "2 · Triage the action", "3 · Investigate with AI", "4 · Verify at the source", "5 · Hand off" | highlighted chip changes at 0:42.39, 1:02.85, 2:05.49, 3:43.65, 4:24.52 (`CH_AT`) |
| Browser frame URL (`URLS`) | "cloud.cisco.com/home/assistant" (0:42.39), "cloud.cisco.com/home/actions" (1:04.26), "cloud.cisco.com/home/canvas/boards" (2:39.59), "app.thousandeyes.com/dashboard" (3:45.78), "app.thousandeyes.com/network-app-synthetics/views" (3:55.62), "cloud.cisco.com/home/canvas/boards" (4:26.42) | as listed |
| Speed-ramp chips (`RAMPS`) | "Sped up · the analysis took about 2 minutes 40 seconds" (1:20.69 to 1:34.67); "Sped up · the answer took about 75 seconds" (2:13.79 to 2:16.09); "Sped up · the Reasoning run took about 1 minute 30 seconds" (2:56.71 to 3:11.61); "Sped up · loading ThousandEyes" (3:46.75 to 3:53.69) | chip shows from 0.2 s before to 0.3 s after each ramp |

Ramp durations checked against the recording logs: automatic analysis, click on the action at
t6 rec 73.9 s, analysis text complete by about rec 226 to 234 s, stability check fired at 235.1 s
(about 2 min 40 s); Default answer, Enter at rec 341.4 s, still streaming with the stop button at
414 s, send arrow back by 418 s (about 75 s; the script's own "answered" mark at 374.2 s fired early
during a pause in streaming); Reasoning, Enter at rec 466.0 s, "steps completed" detected at 558.9 s
(93 s; the answer header itself reported "1m 21s").

The only cut between takes is at 3:43.45 (t6 rec 609.5 s to t7 rec 15.0 s), on the same canvas.
t7 re-recorded the tail because the account-level Dark theme flipped t6's ThousandEyes page and
later pages to dark mid-take (see `logs/state_changes.md`, 21:39 rows).

---

## 1. Open (0:00.00 to 0:22.43)

**Timeline.** Title card from 0:00.00; it fades as the agenda card starts at 0:22.43 (`planIn` =
`S0('plan') - 0.4`). Talk: segment "intro", 5.00 to 22.13 s (0:05.00 to 0:22.13). Music bed under
the title.

**Picture.** Generated title card. No product UI.

**Clicks and typing.** None.

**On screen (scenes.js, title card).**
- Kicker: "Virtual SE demo"
- Title: "Cisco Cloud Control"
- Subtitle: "Following one incident at the Mexico City campus through to the handoff"
- Disclosure: "**About this video.** A virtual systems engineer demo with an AI-generated voice. The
  SE is not a real person. Recorded in a Cisco dCloud demo environment with fictional data
  (PseudoCo). Not official Cisco marketing."

**Talk track (0:05.00 to 0:22.13).**
> Hi, and thanks for making the time. I'm your Cisco systems engineer, and for the next few minutes
> I'm going to show you Cisco Cloud Control, running in a demo environment. The company is PseudoCo,
> a fictional enterprise. We'll follow one problem from start to finish. Something's wrong at their
> Mexico City campus.

**Sources.** No product claim. "Mexico City campus" matches demo device names such as
MexicoCity-Campus-Edge1 and MexicoCity-Campus-Edge2 (ThousandEyes agents, shown in chapter 7).

**Live.** Introduce yourself by name. Keep the disclosure that this is a shared dCloud demo with
fictional data.

## 2. Plan (0:22.43 to 0:42.39)

**Timeline.** Agenda card from 0:22.43 until the browser frame rises in at 0:42.39. Talk: segment
"plan", 22.83 to 42.39 s (0:22.83 to 0:42.39). At most a very quiet bed.

**Picture.** Generated agenda card; each row lights as the SE names it.

**Clicks and typing.** None.

**On screen (scenes.js, agenda card).**
- Kicker: "Today"
- Heading: "The plan for today"
- Rows (`AGI`), each lighting on its cue word: "01 Start in one place" (0:24.05, "start"), "02 Triage
  the action" (0:25.05, "triage"), "03 Investigate with AI" (0:26.29, "investigate"), "04 Verify at
  the source" (0:29.64, "check"), "05 Hand off" (0:32.15, "hand")
- Note (from about 0:23.63): "Demo company: PseudoCo, fictional. Site: Mexico City campus."

**Talk track (0:22.83 to 0:42.39).**
> Here's the plan. We'll start from one place, triage the alert, investigate with the AI Assistant
> and AI Canvas, check the evidence in the product that owns it, and then hand it off. In Cisco's
> own words, teams are forced to move among specialized tools and reconstruct the same issue from
> different vantage points. That's the part we want to shorten.

**Sources.**
- "In Cisco's own words ...": S2, "Teams are forced to move among specialized tools, reconstruct
  the same issue from different vantage points, and coordinate across products and people before
  they can act." The spoken words match S2 verbatim up to "vantage points".
- "That's the part we want to shorten": S2, "spending less time assembling information before they
  can address a problem"; S9, "Move across products more easily: spend less time signing in,
  switching tools, and rebuilding context". No number is given or implied.

## 3. Home (0:42.39 to 1:02.85)

**Timeline.** Browser frame rises in at 0:42.39; chip 1 is lit until 1:02.85. Talk: "home" 43.29 to
55.34 s (0:43.29 to 0:55.34) and "home2" 55.74 to 62.25 s (0:55.74 to 1:02.25). Picture: take t6,
rec 11.8 to 41.2 s. Push-in on the top bar at about 0:47.25, back out at 0:55.54, push-in on the
top-action cards at about 0:57, then on the prompt box at 0:59.67.

**Clicks and typing.** None (t6 marks "home", "tabs", "topactions", "prompt"). The cursor sweeps
along the top-bar tabs, then points at the action cards and the prompt box.

**On screen (product, t6 frames).** Top bar: Home, Intersight, Nexus Hyperfabric, Security,
Collaboration Control Hub, Meraki, IQ, ThousandEyes, "+2". Sub-tabs Assistant, Canvas, Actions (red
dot). Greeting with the demo user's first name; "Here are your top 3 actions that require review."
Cards at recording time: "Unreachable device" (Meraki), a Nexus Dashboard eth1/13 utilization card,
"High interface utilization causing buffer drops on Leaf2" (Nexus Dashboard). Prompt placeholder
seen: "Summarize DNS server availability across my DNS tests from ThousandEyes over the past 7
days." Footer: "Assistant can make mistakes. Verify responses. Learn how the Assistant handles
data at Assistant disclosures." Overlay: see "Persistent overlay text".

**Talk track.**
> (0:43.29 to 0:55.34) So this is Cloud Control after I sign in. Across the top are the Cisco
> products this environment has connected. Intersight, Meraki, ThousandEyes, and a few more. They
> stay right there as tabs.
>
> (0:55.74 to 1:02.25) In the middle, it's pulled up the top actions that need review. And there's
> a box where I can ask a question in plain language.

**Sources.**
- Tabs stay: S4, "The top navigation bar remains available as you move between Cisco Cloud Control
  and onboarded products, so you can move across products without losing context."
- Top actions: shown; S4 "Home page tabs: Switch between Assistant , Canvas , and Actions to ask
  questions, investigate issues in a shared workspace, and review issues that need attention."
- Plain language: A11 (S1), "Ask the AI Assistant anything about an alert, device, or domain in
  plain language."; A12 (S4), "AI Assistant is the natural language entry point in Cisco Cloud
  Control."

**Live.** Do not read out the greeting name or any counts. The top three cards change as alerts
arrive.

## 4. Actions / Triage (1:02.85 to 2:05.49)

**Timeline.** Chip 2 from 1:02.85. Talk: "actions" 62.85 to 73.74 s, "found" 75.04 to 84.22 s,
"wait1" 85.42 to 93.27 s, "related" 94.67 to 104.23 s, "analysis" 106.73 to 124.49 s. Picture: t6
rec 41.2 to 322.0 s, with the automatic analysis sped up (rec 74.3 to 235.0 s shown in 1:20.89 to
1:34.37).

**Clicks and typing (t6_full.js, t6 marks).**
1. 1:04.26 (rec 43.1): click **Actions** (sub-tab next to Assistant and Canvas). The list loads and
   auto-opens the newest action, "Unreachable device" (Meraki, "Today, 9:04 PM"), which starts its
   own automatic Assistant analysis.
2. 1:12.49 (rec 59.8): click **Search actions**.
3. 1:13.0 to 1:13.5 (rec 60.3 to 60.9): type `Mexico`; press Enter at about 1:14.0. "8 results".
4. 1:17.2 (rec 67.4): cursor settles on the card; tooltip shows the full title.
5. 1:20.49 (rec 73.9): click the card **SD-WAN and Meraki device connectivity and UTD connection
   disruptions in San...** ("September 20, 10:08 PM"). The Assistant analysis starts ("Analyzing...").
6. After the analysis: scroll to the top, hover the related alerts, then scroll (the wheel lands
   inside the Related alerts table, so it scrolls the table, not the page).

**On screen (product).**
- List: "Open | Resolved | Dismissed", "Search actions", "Filters", "8 results"; cards include
  "Unreachable device", "VPN and connectivity outage impacting RTP-DC3edge2 and Mexico City wireless
  AP", the Sept 20 action, "SD-WAN topology disruptions with multiple TLOC, BFD, OMP, VPN tracker, and
  UTD...", "Widespread SD-WAN and Meraki device connectivity and routing outages".
- Header: title, "...", **Collaborate in Canvas**, "Critical Alert", "September 20, 10:08 PM".
- Summary ("Assistant, Last Sunday at 9:03 PM"): "Between 00:29 and 02:08 UTC on September 21,
  2026, multiple SD-WAN devices in San Jose and Meraki devices in Mexico City experienced
  connectivity issues including unreachable devices and VPN tunnel interface state changes. ... The
  incident affected six devices across SD-WAN and Meraki platforms ..."
- **Related alerts** (tags Meraki, SD-WAN; Product | Title | Description | Tenant | Time): first row
  Meraki "Unreachable device" (CW9162-AP-2, Mexico City - wireless, "Sun, Sep 20, 9:26 PM"), then
  SD-WAN "UTD Con", "Interface State Change", "Control TLOC Down", "OMP Node Down", "Tracker State
  Change" rows on SanJose-Branch1-Edge1/Edge2 and SanJose-DC2-Edge1/Edge2 (host names in hover
  tooltips). A second Meraki row, C9200-Access-1 ("Mexico City - switch; Duration: 1 min"), exists
  far down the table but scrolls past unread.
- Status lines during the ramp: "Analyzing...", "Network Platform Agent: Thinking about your
  question.", "Network Platform Agent: Getting device switch ports statuses", then "Reviewed alerts
  from Action SD-WAN and Meraki Multi-Site Connectivity Incident [em dash] San Jose & Mexico City.
  Checked insights from: the action record, Catalyst SD-WAN telemetry, Meraki Dashboard API."
- **Analysis** (visible briefly at the end of the ramp, then fully from about 2:06.5 to 2:14.0):
  "... This strongly suggests a sustained SD-WAN control-plane instability event ... The Meraki
  Mexico City devices (CW9162-AP-2 AP and C9200-Access-1 switch) became unreachable independently
  during the same window [em dash] the AP experienced a power event/reboot at ~01:23 UTC ... indicating
  that the control-plane disruption also interrupted security service connectivity ..."; then
  **Recommendation** (UTD/AMP Cloud checks on the San Jose edges).
- Overlay: ramp chip "Sped up · the analysis took about 2 minutes 40 seconds" (1:20.69 to 1:34.67).

**Talk track.**
> (1:02.85 to 1:13.74) Let's go to Actions. This is the team's work list. Related notifications get
> grouped into one action, so you're not reviewing alerts product by product. I'll search for
> Mexico.
>
> (1:15.04 to 1:24.22) This one groups SD-WAN events from San Jose with Meraki devices in Mexico
> City. Let me open it, and the Assistant takes a first pass at the analysis.
>
> (1:25.42 to 1:33.27) It's reading the action record, the Catalyst SD-WAN telemetry, and the Meraki
> data. That takes a couple of minutes, so I'll skip ahead.
>
> (1:34.67 to 1:44.23) Here's the summary and the related alerts. Most of them are SD-WAN events
> from the San Jose edges. The Meraki rows are the Mexico City access point and switch going
> unreachable.
>
> (1:46.73 to 2:04.49) The analysis separates the two. San Jose had a control plane problem that
> took down tunnels and interrupted security services. The Mexico City devices dropped on their own
> in the same window, and the access point shows a power event. The San Jose piece goes to the
> SD-WAN team. I want to understand Mexico City.

**Sources.**
- Work list and grouping: S4, "This displays a list of actions that require attention."; "Notifications
  are grouped into a single action when they: Are related in timeframe / Occur on devices within the
  same network topology, and are high or critical in severity / Are repeatedly generated by the same
  device"; "Actions help you focus on prioritized operational tasks from one place instead of
  reviewing alerts across individual products."
- "the Assistant takes a first pass": shown (opening the action starts the analysis on screen).
  Closest general support: S2, "Actions correlate and prioritize alerts, and AI insights help
  operators identify anomalies and understand where attention is needed."; A13 (S5). No source says
  opening an action starts an analysis automatically (flagged in CLAIMS.md).
- What it reads, the San Jose and Mexico City split, the power event: shown (on-screen "Checked
  insights from" line and Analysis text). "The San Jose piece goes to the SD-WAN team" is the SE's
  own routing decision, not a product claim.
- Picture-sync flags: only the AP's Meraki row is readable during "The Meraki rows are ...", and
  the "analysis" paragraph plays over the scrolling table; the Analysis text is on screen just
  before (sped up) and just after (2:06.5 to 2:14.0). See CLAIMS.md.

**Live.** Opening an action runs an analysis that is saved for every demo user; this one took about
2 min 40 s. The build has no Assign, Resolve, or Dismiss control; the "..." menu holds only "Copy
link". Scroll the page (not the table) to show the Analysis while you describe it.

## 5. Ask the Assistant (2:05.49 to 2:32.84)

**Timeline.** Chip 3 from 2:05.49. Talk: "ask" 125.49 to 129.59 s (2:05.49 to 2:09.59) and "answer"
136.09 to 151.74 s (2:16.09 to 2:31.74). Picture: t6 rec 322.0 to 426.1 s; the wait (rec 341.4 to
414.0) is compressed into 2:13.99 to 2:15.79.

**Clicks and typing (t6 marks).**
1. 2:07.09 (rec 332.7): click the action's **Ask anything** box (mode already **Default**; no mode
   change was needed).
2. 2:07.9 to 2:13.2 (rec 333.4 to 340.3): type `What's going on at the Mexico City site right now?`
   (the script read the box back and would abort on a mismatch).
3. 2:14.0 (rec 341.4): press Enter. "Network Platform Agent: Gathering data".
4. After the answer: scroll up to its start, then down through it.

**On screen (product).**
- "You / What's going on at the Mexico City site right now?"
- "Network Platform Agent: Done"; "Based on the Meraki Dashboard data retrieved just now (as of
  **2026-09-25 ~01:08 UTC**), here is the current picture at the Mexico City site:"
- "Mexico City [em dash] Current Status"; "C9200-Access-1 (Switch) [em dash] Online" ("The access-layer
  switch is fully healthy"); "CW9162-AP-2 (Wireless AP) [em dash] Offline" ("This AP has not recovered
  since the Sept 21 incident ... roughly 4 days later"; "No active Meraki assurance alerts are firing
  for it right now (the original unreachability alert was marked resolved) ..."; "No MX/VMX security
  appliance is present in the Mexico City wireless network, so WAN uplink health for this site
  cannot be validated from the Meraki side").
- "Summary" table (C9200-Access-1 Online; CW9162-AP-2 Offline); "What Needs Attention".
- Overlay: ramp chip "Sped up · the answer took about 75 seconds" (2:13.79 to 2:16.09).

**Talk track.**
> (2:05.49 to 2:09.59) So I'll ask it right here. What's going on at the site right now?
>
> (2:16.09 to 2:31.74) Okay. The switch is back online, but one access point is still offline, even
> though its original alert was marked resolved. And notice this. There's no Meraki security
> appliance at this site, so Meraki can't check the WAN uplink. That's a visibility gap, and we'll
> come back to it.

**Sources.**
- Asking in the action's context: A13 (S5), "AI Assistant generally works with the context available
  in the product or workflow where the user invokes it."; S4, "To investigate further, continue the
  conversation in Assistant ."; Default mode for a focused question, A10.
- Answer content: shown.

**Live.** Spoken question is shorter than the typed one; type the full question. The real wait was
about 75 s; wait for the send arrow to return (a pause in streaming is not the end).

## 6. AI Canvas and Reasoning (2:32.84 to 3:43.65)

**Timeline.** Talk: "canvas" 152.84 to 163.66 s, "mode" 164.76 to 172.51 s, "q1" 175.71 to 190.81 s,
"result" 191.81 to 213.05 s, "verify" 213.65 to 222.85 s. Picture: t6 rec 426.2 to 609.5 s; the
Reasoning wait (rec 468.0 to 556.0) is compressed into 2:56.91 to 3:11.31. Close push-in on the
footer from 3:34.05 to 3:43.25. Cut to take t7 at 3:43.45.

**Clicks and typing (t6 marks).**
1. 2:38.79 (rec 426.7): click **Collaborate in Canvas** (top right of the action). A new canvas opens
   titled after the action, with the action's conversation in the left panel and an empty board.
2. 2:45.19 (rec 452.6): click the mode picker (**Default**). Menu: "Default / Answers right away",
   "Reasoning / For complex queries".
3. 2:45.36 (rec 455.4): click **Reasoning**.
4. 2:46.66 (rec 458.6): click the prompt box.
5. 2:47.2 to 2:54.3 (rec 459.3 to 465.1): type `Why are devices unreachable at the Mexico City site?`
6. 2:55.5 (rec 466.0): press Enter. Status "Network Platform Agent: Gathering data". No plan-review
   step appeared.
7. After "Added to canvas": scroll the answer, point at the new card, then at the footer.

**On screen (product).**
- Breadcrumb "Canvas overview > SD-WAN and Meraki device connectivity and UTD...", owner avatar,
  **Share**, "..."; right toolbar; zoom "80%"; "Context 2".
- Answer (canvas panel): "The Meraki Dashboard is showing repeated "Unreachable device" alerts across
  three devices over the last 24 hours" (CW9162-AP-2, CW9164-AP-1, C9200-Access-1); "The fact that
  **both APs and the switch** are all showing unreachability at overlapping times points squarely to
  a **site-wide upstream connectivity problem** [em dash] not a fault on any individual device.";
  "Root Cause Assessment"; "Most Likely: Upstream WAN/Cloud Connectivity Loss"; "1. WAN link outage
  or instability ... Since there is **no MX/VMX security appliance** in these Meraki networks, WAN
  uplink health cannot be confirmed from Meraki's side [em dash] this is a visibility gap."; then
  firewall/NAT, local power/switching, DNS; "Connection to the Sept 21 Incident"; "Recommended Next
  Steps" (1. Verify WAN uplink ...).
- Conversation row "Canvas now / Mexico City Device Unreachability [em dash] Root Cause Analysis /
  Added to canvas / View".
- Card "Mexico City Device Unreachability [em dash] Root Cause Analysis", tags "Network Platform" and
  "Network Devices": three device rows ("Repeated unreachable alerts ... Sep 24, 2026"); "Multiple
  devices affected [em dash] pattern indicates a site-wide or upstream issue, not an isolated endpoint
  failure."; "Most likely causes" 1 Upstream WAN / cloud reachability loss, 2 Firewall or NAT
  misconfiguration, 3 Power or cabling problems, 4 Local gateway reachability; "Recommended
  investigation steps"; "Reference: Dashboard Alerts [em dash] Connectivity Issues".
- No "Investigation limitations" section appeared in this answer.
- Footer (close-up): "Assistant can make mistakes. Verify responses. Learn how the AI Assistant
  handles data at AI Assistant disclosures."
- Overlay: ramp chip "Sped up · the Reasoning run took about 1 minute 30 seconds" (2:56.71 to
  3:11.61).

**Talk track.**
> (2:32.84 to 2:43.66) We still don't know why, and it might span more than one product. That's what
> AI Canvas is for. I'll click Collaborate in Canvas. The action's context comes with me, so I'm not
> starting over.
>
> (2:44.76 to 2:52.51) Now I'll switch to Reasoning mode, which is meant for complex questions, and
> ask why devices are unreachable at the Mexico City site.
>
> (2:55.71 to 3:10.81) While that runs, a fair question here is, can the AI change my network on its
> own? In what I'm showing you, no. It gathers evidence and recommends next steps. Changes go through
> workflows that a person reviews and runs, and your permissions in each product still apply.
>
> (3:11.81 to 3:33.05) Here's the answer, and it's added a card to the canvas. It sees both access
> points and the switch going unreachable at overlapping times, which points to a site-wide upstream
> problem, not individual devices. Its top candidate is the WAN link, and it flags the same gap.
> Without a Meraki security appliance, it can't confirm uplink health from the Meraki side.
>
> (3:33.65 to 3:42.85) That's a good lead. And the line at the bottom says it well. Assistant can
> make mistakes, verify responses. So let's check the WAN side with a product that watches it.

**Sources.**
- When to use Canvas: S5, "Use AI Canvas when the work needs to be treated as an investigation rather
  than as an individual question or task." / "The issue may involve more than one product, system,
  or technology domain." / "The cause is not yet known and evidence must be gathered and correlated."
- Context carries over: S4, "When you open Canvas from an action, the related context is preserved so
  you can continue without starting over."
- Reasoning for complex questions: A1 (S5), "Reasoning mode is designed for complex troubleshooting
  and investigations that require a structured, evidence-based approach." (UI also: "For complex
  queries".)
- Question 1: S5, "It can develop an investigation plan, assign work to the appropriate agents,
  correlate their findings, generate relevant visualizations, and present proposed next steps for
  review."; S12, "Agents surface findings and propose next steps[em dash]your team approves before
  execution."; S5, "Selecting a workflow opens its configuration form. It does not start the
  workflow." and "Select Run to confirm and start the workflow."; S8, "For integrated products, Cisco
  Cloud Control respects the permissions that a user has in the source product."; S5, "AI Canvas
  follows the access permissions assigned to your Cisco Cloud Control account."
- Answer and card content: shown. Footer line: UI text, shown; A8 (S5), "Review the supporting
  evidence and limitations before acting on a conclusion or recommended next step."

**Live.** Reasoning took about 93 s here (header "1m 21s"); earlier runs of the same question took
1 min 40 s to 5 min 10 s. Fill the wait with question 1. S5 documents a plan review for Reasoning
mode (A9); if a "Plan Review Required" panel appears, read the plan and approve it. Workflows cannot
run in Reasoning mode (S5), and this build has no Workflows item in the canvas plus menu.

## 7. Verify in ThousandEyes (3:43.65 to 4:24.52)

**Timeline.** Chip 4 from 3:43.65. Talk: "te" 223.65 to 233.39 s, "path" 234.09 to 251.14 s, "q2"
251.94 to 263.52 s. Picture: take t7 (light theme) rec 15.0 to 103.0 s. The t7 canvas is still
rendering for about the first second after the cut (3:43.45 to about 3:44.5), inside the top-bar
push-in. Dashboard load sped up 3:46.95 to 3:53.39.

**Clicks and typing (t7_tail.js, t7 marks).**
1. 3:44.58 (rec 31.3): click **ThousandEyes** in the top bar. The page moves to app.thousandeyes.com
   while the Cloud Control top bar stays.
2. 3:54.62 (rec 62.6): click the alert source **MEXICO-UPLINK-PUBLIC-Inet** in the Alert List.
3. From 4:03.0 (rec 85.3): hover the red node where the Edge2 path stops, then the Edge1 node, then
   move left.

**On screen (product, t7 frames).**
- Cloud Control top bar with "+4", **Canvas** button, and the header "Sec Ops User NN / PseudoCo";
  ThousandEyes left navigation.
- "Dashboard: ThousandEyes Built-in", "Alert List", "Total Alerts 16", "Active Alerts 14"; row
  "MEXICO-UPLINK-PUBLIC-Inet | Default Network Alert Rule 2.0 | Network - Agent to Server | 14 hours
  ago | 13h 38m 41s".
- "Test: MEXICO-UPLINK-PUBLIC-Inet", "198.18.14.1 ICMP", "Metrics: Loss", "Thu, Sep 24 12:02 [en
  dash] 12:04 UTC (13 hours ago)"; Loss chart at 100% (red) across Sep 24; "Forwarding Loss > 10% (2
  nodes)"; "Path Visualization" from MexicoCity-Campus-Edge2 and MexicoCity-Campus-Edge1, both ending
  at 10.255.0.3 before destination 198.18.14.1.
- Node tooltip: "Node in Agent's Network (with forwarding loss)", "rt-bl-1-enet-1-9.or1.ne.adobe.net",
  "3 traces terminate here", "Locations Morrisville, North Carolina, United States", "Forwarding Loss
  100% (36 of 36 packets)".
- Overlay: ramp chip "Sped up · loading ThousandEyes" (3:46.75 to 3:53.69).

**Talk track.**
> (3:43.65 to 3:53.39) I'll click ThousandEyes, in the same top bar. ThousandEyes monitors this
> site's internet uplinks, and there's an active alert on the Mexico City public uplink test.
>
> (3:54.09 to 4:11.14) Let me open it. The packet loss chart is red across the day, and the path view
> shows traffic from both Mexico City edges stopping before it reaches the destination. So the
> uplinks themselves are losing traffic. That's the piece Meraki couldn't see, and ThousandEyes stays
> the authority for this data.
>
> (4:11.94 to 4:23.52) Which brings up another fair question. Does Cloud Control replace my
> controllers? It doesn't. Each product still handles its own specialized management, and Cloud
> Control connects the work between them.

**Sources.**
- Same top bar: S4 (quoted in chapter 3).
- Alert, chart, path: shown (demo data). "So the uplinks themselves are losing traffic" is the SE's
  reading of the path view (flagged as advisory in CLAIMS.md).
- ThousandEyes stays the authority: S2, "Each Cisco product continues to provide the specialized
  control customers expect."; S4, "This data is not removed from the source product. To view
  historical data beyond this time period, go to the product directly."
- Question 2: S2, "Domain controllers remain responsible for their specialized management and
  execution, while Cloud Control connects the work between them."; S4, "complements existing Cisco
  product controllers" and "without replacing individual product dashboards".

**Live.** The dashboard rendered about 8 s after the click in t7 (the script then waited longer).
Dismiss a cookie banner if one appears. Do not click "Run Instant Test" (starts a test) or
"Snapshot" (creates a share link). Say "losing traffic on the uplink path", not "confirms the
cause".

## 8. Hand off (4:24.52 to 4:45.89)

**Timeline.** Chip 5 from 4:24.52. Talk: "handoff" 264.52 to 274.545 s, "share" 275.245 to 284.585 s.
Picture: t7 rec 103.0 to 193.0 s. The frame exits at 4:45.89.

**Clicks and typing (t7 marks).**
1. 4:25.42 (rec 107.8): click **Canvas** in the top bar. It opens the Canvas overview list, not the
   board.
2. 4:26.72 (rec 124.9): click the canvas row "SD-WAN and Meraki device connectivity ...".
3. 4:29.32 (rec 148.4): click **Generate summary** in the canvas right toolbar (icon; tooltip
   "Generating..." while it runs).
4. Report opens about 13 s later in real time (rec 161.3, timeline 4:35.2). Scroll it.
5. 4:38.85 (rec 180.1): click **Close**.
6. 4:40.75 (rec 184.4): click **Share** (top right). Toast: "Invite link copied to clipboard."

**On screen (product).**
- Canvas with the card, "Context 3", conversation row "Canvas 9:16 PM", Share now a split button.
- Report modal: "Network Connectivity Incident Report: San Jose and Mexico City", "Table of
  Contents" (Incident Overview, Affected Infrastructure, Root Cause Analysis, Resolution and
  Investigation Steps), "Mexico City Site" (CW9162-AP-2, CW9164-AP-1, C9200-Access-1), "San Jose
  Site", "Root Cause Analysis", "Resolution and Investigation Steps", **Close**, **Download as PDF**.
  The first report frame is a half-faded frame (screencast artifact) from 4:35.2 to about 4:37.5.
- Toast: "Invite link copied to clipboard."

**Talk track.**
> (4:24.52 to 4:34.55) Back to the canvas. The next step belongs to the WAN team, so I'll set up the
> handoff. Generate summary turns the canvas into a report for whoever picks this up.
>
> (4:35.25 to 4:44.59) And Share gives other authorized operators access to this canvas. Everything
> we asked and found stays here, so the next person doesn't have to rebuild the context.

**Sources.**
- Generate summary: A5, "Generate summary [em dash] Create a summary of the current canvas."; A6,
  "Select Generate summary to capture the current state of the investigation."
- Share: S5, "Select Share to give other authorized operators access to the canvas."; A7.
- Context stays: S5, "The workspace preserves the questions asked, evidence collected, findings
  reached, decisions made, and actions taken. This allows another operator to join the investigation
  or continue it later without rebuilding the context."
- Flag: the ThousandEyes evidence was viewed in the ThousandEyes console and never added to the
  canvas, so the report and the canvas do not contain it (see CLAIMS.md).

**Live.** Before Generate summary, add a text annotation to the canvas with the ThousandEyes finding
so the report carries it. Do not invite anyone in the shared demo. No Resolve control exists in this
build.

## 9. Value (4:45.89 to 5:05.13)

**Timeline.** Value card from about 4:45.58 (`frameOut - 0.3`) to the close card at 5:05.13. Talk:
"value" 285.885 to 294.425 s, "cost" 295.225 to 304.335 s.

**Clicks and typing.** None.

**On screen (scenes.js, `VITEMS`).**
- Kicker: "Where the value comes from"
- Row 1 (4:48.58, "builds"): "Starts from the Cisco products you already run" / "Each product keeps
  its own console and specialized control"
- Row 2 (4:52.19, "every"): "Each connected product adds context" / "Data, tools, or actions from
  one more domain"
- Row 3 (5:00.60, "included"): "Included at no additional cost*" / "with eligible Cisco
  subscriptions"
- Fine print (5:01.00): "*Generally available for customers managing US-based infrastructure.
  Included with eligible Cisco Essential and Advantage subscriptions; Cisco may change this."

**Talk track.**
> (4:45.89 to 4:54.43) So where does the value come from? It builds on the Cisco products you already
> run. Start with those, and every product you connect adds context.
>
> (4:55.23 to 5:04.34) And the last fair question. What does this cost? Cloud Control and AI Canvas
> are included at no additional cost with eligible Cisco subscriptions.

**Sources.**
- Builds on what you run: S1, "Your existing investments become part of a unified environment."
- Each product adds context: S2, "Each integration adds relevant data, tools, or actions to the
  context available to Cloud Control services, operators, and agents."
- Own console and control: S2, "Each Cisco product continues to provide the specialized control
  customers expect."; S4, "without replacing individual product dashboards".
- Cost: S1, "Cisco Cloud Control and AI Canvas are included with your existing Cisco product
  subscriptions, available in both Essential and Advantage tiers at no additional cost. We reserve
  the right to change this in the future."; S12, "AI Canvas is included with your eligible Cisco
  license at no additional cost."; S9 ("eligible Cisco products").
- US scope: S4, "Cisco Cloud Control is now in General Availability for customers and partners
  managing US-based infrastructure."

## 10. Close (5:05.13 to 5:20.27)

**Timeline.** Close card from 5:05.13 (`S0('close') - 0.6`) to the end at 5:20.27. Talk: "close"
305.735 to 313.755 s. Music returns under the close.

**Clicks and typing.** None.

**On screen (scenes.js).**
- "Cisco Cloud Control"
- "Built on the Cisco products you already run" (from 5:05.74)
- "Learn more at cisco.com" (rises at 5:09.51, on "account")
- Fine print (`clFine`, from 5:06.63): "Generally available for customers managing US-based
  infrastructure. Included at no additional cost with eligible Cisco Essential and Advantage
  subscriptions; Cisco may change this. / Capabilities depend on connected products, subscriptions,
  permissions, and region. AI responses can be wrong; verify them. / Virtual SE demo with an
  AI-generated voice, recorded in a Cisco dCloud demo environment with fictional data. Not official
  Cisco marketing."

**Talk track (5:05.74 to 5:13.76).**
> That's the demo. If you'd like to see this on your own environment, talk with your Cisco account
> team about connecting the products you already run. Thanks for your time.

**Sources.** Next step: GA wording from the brief, not a product claim. "Built on ...": S1 (as in
chapter 9). Fine print: S4 (US scope), S1 (tiers, may change), S2 ("Available capabilities depend on
the products and integrations connected to Cloud Control, as well as customer subscriptions,
permissions, configuration, and region."), UI footer plus A8.

---

## Live-run notes

Observed in the shared dCloud tenant on 2026-09-24 (take t6 at about 21:02 EDT, take t7 at about
21:39 EDT; `capture/rec/*/log.json` marks, `logs/state_changes.md`, `research/explore_*.md`).

### Before you start
- Confirm the action still exists: Actions, search `Mexico`, look for the Sept 20 SD-WAN and Meraki
  UTD action. Its related alerts are historical (Sep 20 and 21), so they do not change; the
  Assistant's live answers about "right now" do.
- Theme: the demo account had its profile **Theme** preference set to Dark, which flipped the
  embedded ThousandEyes page and later pages to dark partway through take t6. It was set to Light at
  21:39 (profile menu). Check it before you present.
- The Threads panel and canvas list are shared with every demo user; their prompts and names are
  visible to your audience.

### Timings seen (real time)

| Step | Observed | Evidence |
|---|---|---|
| Automatic analysis after opening the action | about 2 min 40 s | t6: click rec 73.9 s, text complete by about 226 to 234 s, stable at 235.1 s |
| Default question in the action | about 75 s | t6: Enter 341.4 s, still streaming at 414 s, done by 418 s |
| Reasoning question in the canvas | about 93 s (answer header "1m 21s") | t6: Enter 466.0 s, done 558.9 s |
| Other runs of the same kinds (exploration) | analysis 35 to 60 s; Default 14 s to 2 min 30 s; Reasoning 1 min 40 s to 5 min 10 s | `research/explore_*.md` |
| ThousandEyes dashboard after the tab click | about 8 s in t7 (about 18 s in an earlier take) | t7 frames |
| Generate summary until the report | about 12 to 13 s | t6 745.9 to 758.2 s; t7 148.4 to 161.3 s |
| Share toast | about 2 s | t7 frames |

Plan on about 3 minutes of total waiting. Have one bridge line for the analysis, one for the Default
answer, and customer question 1 for the Reasoning run.

### Opening an action changes state
- Clicking **Actions** auto-opens the newest action. In t6 that was "Unreachable device" (Meraki,
  "Today, 9:04 PM"), and it started its own analysis.
- Opening the Sept 20 action ran a fresh Assistant analysis live and saved it into the action for
  every demo user. The Default question, the new canvas, the Reasoning question, Generate summary,
  and Share (invite link) are also shared-state changes (logged in `logs/state_changes.md`).

### Typing reliability
- The prompt box is a rich-text field. The capture scripts type with uneven key timing, read the box
  back, and abort on any mismatch; earlier automated attempts scrambled characters. A person should
  read the box before pressing Enter and retype if anything is off.
- Restate the subject in every question. A bare "Why?" was refused in exploration.

### Tool flakiness (from exploration, 19:04 to 19:40 EDT)
- In Default mode only the Meraki path ("Network Platform Agent") returned data; ThousandEyes, SD-WAN,
  Nexus Dashboard, Intersight, Splunk, firewall, Secure Access, and Hyperfabric agents errored, and
  retries failed. A failing agent shows a "<1s" chip.
- A canvas follow-up asking for the Mexico City ThousandEyes tests returned "the ThousandEyes tools are
  not available in this session for your tenant". That is why this demo verifies in the ThousandEyes
  console, opened from the top bar.
- Canvases can show "There is an issue connecting to this canvas. Some features are temporarily
  disabled while the connection is down." Reload once.
- The capture Chrome's debug port hung three times during the session (log rows 19:44, 20:32, 21:06).

### Things a sharp customer may notice
- **Dates.** The action is dated "September 20, 10:08 PM" and its events are 00:29 to 02:08 UTC on
  September 21, but the Default answer is "as of 2026-09-25 ~01:08 UTC" and says the AP is offline
  "roughly 4 days later". The Reasoning card and the ThousandEyes alert are about September 24. The
  investigation is about the site now, not the Sept 21 window.
- **Recurring drops.** The Reasoning answer sees repeated drops on September 24. Exploration found
  scheduled demo workflows ("AP-Reboot" every 2 hours, "Power on/Shutdown 9200 Switch") that cycle
  Mexico City devices; hypothesis, strong, not verified for these exact events.
- **ThousandEyes node.** The node where both paths stop is labeled "Node in Agent's Network" with a
  public hostname (rt-bl-1-enet-1-9.or1.ne.adobe.net) and location "Morrisville, North Carolina".
- **Report scope.** The summary report covers the canvas (Meraki and SD-WAN findings); it does not
  contain the ThousandEyes evidence, which stayed in the ThousandEyes console.
- **Only one Meraki row is readable** in the related alerts on screen, though the narration mentions
  the AP and the switch.
- **Identity in the UI.** The Home greeting shows the demo user's first name and the ThousandEyes
  header shows "Sec Ops User NN / PseudoCo". The owner decided no blur is needed (fictional demo).
- **Take cut.** At 3:43.45 the canvas card is briefly empty while take t7 finishes rendering, and the
  context count changes from "Context 2" (t6) to "Context 3" (t7).

### Not in this build (do not promise them)
- No Assign, Resolve, or Dismiss control on the action.
- No Workflows item in the canvas plus menu, so no workflow configuration or review screen was shown.
- No Reasoning plan-review step and no "Investigation limitations" section in this run.
- The Agents list includes "Workflows"; S5 says "The Workflows agent is in beta". Do not select it.

