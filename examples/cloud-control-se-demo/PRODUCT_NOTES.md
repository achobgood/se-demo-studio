# Cisco Cloud Control product notes (September 2026)

Read this only when a job's product is Cisco Cloud Control. These notes came from the September 2026 Cloud
Control jobs. They add to `.claude/skills/record-demo/references/CISCO_CLAIM_RULES.md`, which applies to every
Cisco product. Recheck anything here against current official sources and the live demo before relying on it.

## Claim rules

- Keep the UI footer "Assistant can make mistakes. Verify responses." legible at least once.
- Workflows cannot run inside a Reasoning investigation ("AI Canvas workflows are available in Default mode.
  They are not supported in Reasoning mode.").
- Contested, keep out of narration: whether one connected product is enough to start. Say "start with the Cisco
  products you already run" and "every product you connect adds context".
- Leave out or keep labeled: the Workflows agent (beta), Agent Studio, Cloud Control Studio third-party
  connections, Marketplace, autonomous agents, non-US regions, and anything tagged Controlled Availability.
- Webex Control Hub shares inventory only with Cloud Control (no alerts, no topology). Do not claim Cloud Control
  alerts on or pulls in Webex call quality.

## The dCloud instant demo

- The demo: "AgenticOps with Cisco Cloud Control" instant demo in dCloud, which opens
  https://cloud.cisco.com/home. Demo users are read-only for configuration. It may be shared with other demo users.
- Surfaces: Home (Assistant), Actions, AI Canvas (Default and Reasoning modes), Inventory, Workflows, and the
  top-bar product tabs. ThousandEyes opens embedded under the Cloud Control top bar; Meraki leaves Cloud Control
  (about 30 seconds to load); Collaboration Control Hub renders under the top bar with a "Read-only Mode" notice.
- Missing in that build: no Assign, Resolve or Dismiss in the action detail; no Workflows item in the canvas plus
  menu; no Reasoning plan-review step and no "Investigation limitations" section appeared.
- The canvas banner "There is an issue connecting to this canvas" is common; a reload usually clears it.
- Generate summary (canvas toolbar) opens a report with Download as PDF; Share copies an invite link.
- Timings: Reasoning in a canvas took 1 to 5 minutes; Default answers 15 seconds to 2.5 minutes.
- Control Hub free-text search was flaky on camera; the Geolocation row contradicted Location in call detail.
- Every Webex meeting in that org rated good; the usable poor-quality example was a Webex Calling call.
- A worked example of this whole flow is in this folder.
