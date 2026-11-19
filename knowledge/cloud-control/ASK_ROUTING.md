# Cisco Cloud Control: routing customer asks to demo stories

Read this at interview Step 1 when the product is Cisco Cloud Control. It maps customer asks to paths in the dCloud
instant demo that earlier jobs inspected (see `PLATFORM_MAP.md` in this folder). It is a starting point for a
rehearsal, not a promise that the next session shows the same data. Re-check each path live (L90).

Last updated: 2026-11-16. Evidence dates are in each row.

## Choose the outcome before the screen

Reduce the ask to the decision the customer wants to make. A branch outage ask might be about diagnosing the
fault, understanding affected users, handing off to another team, or confirming recovery; each needs different
evidence even when it starts at the same site.

Pick one main story the environment can support, with its site, time window, and a natural stopping point. A
useful demo can end with evidence, a named coverage gap, and the right next owner. It does not need an invented
fix or a solved root cause.

For an ask that crosses products ("after product A decides, can product B act?"), first break it into links
(decide, send, receive, approve, act, verify, report back) and mark each link verified, docs, absent, or
hypothesis before touring screens (L83). The Splunk row below shows the result of that pass.

## Candidate stories

| Customer ask | Candidate path | Evidence we have | Recheck and stopping point |
|---|---|---|---|
| Investigate a branch outage across products | Home > Actions (search the site name) > a historical multi-product action > Assistant > Collaborate in Canvas > Reasoning > owning product (ThousandEyes) > Generate summary | Finished 5-minute demo on Mexico City, 2026-09-24 (`examples/cloud-control-se-demo/`) | Opening an action starts an analysis (state change). Product agents failed often in Default mode; probe them. End with verified findings and the next team |
| After a Splunk decision, can Cloud Control carry out the remediation? | Splunk inside Cloud Control (context) > Workflows > Rules (Type filter, Webhooks tab) > Exchange > "Meraki Restrict Client BW - Webhook_Driven" Details > Targets > User Tasks; Splunk decision, handoff, approval, and the Meraki change drawn as labeled motion | 2026-11-16 chain: decide (docs: Splunk ES and SOAR, absent in this Splunk), send (docs: SOAR HTTP "post data" can set headers; the alert webhook cannot), receive (verified empty: no webhook, no webhook rule), approve (docs: Request Approval; User Tasks verified empty), act (verified real but not installed: the Exchange item), verify and report back (docs only for status; report back undocumented) | It is a pattern built from documented pieces, not a packaged integration. The "Agentic Workflows" catalog items are Sleep-step outlines. End on what the customer configures, with the requirements fine print |
| What happened after an access-policy change | Topology (site) > device context > a saved site canvas > owning product evidence | Policy warnings and a saved investigation with stated gaps, 2026-10-01 | Do not join different dates into one cause. Saved AI findings need source checks. End with affected scope and next checks |
| How the next shift picks up an investigation | An existing canvas > evidence cards > conversation > annotation > Generate summary > Share | Real cards and a recorded summary and share sequence, 2026-09-24 and 2026-10-02 | Add externally viewed findings to the canvas before saying the handoff includes them. Summary and Share change state |
| Unified estate visibility | Inventory insights and table > asset drawer > Topology site and device view > owning product | Inventory and Topology rendered, 2026-10-02 | Healthy, reachable, compliant, and fresh are separate properties. End on one asset or site drill-down |
| Licensing exposure and affected equipment | Licensing filter > a negative-balance record > Associated Devices | Licensing and an Aironet record inspected, 2026-10-01 | Entitlement freshness unverified. End with a review list, not a purchase recommendation or a compliance verdict |
| Identity sources and authentication health | Identity > Integrations > ISE Monitoring > node and RADIUS views | Providers and the Beta ISE dashboard inspected, 2026-10-01; ISE collected 2026-11-16 | Keep the Beta label visible; check collection times. End with health evidence or a named collection gap |
| Compute lifecycle and configuration readiness | Intersight Servers > health, HCL, profile, and support facets > one server's detail | Server inventory seen, 2026-10-01; detail not opened | All-healthy does not settle compatibility or profiles. Open the detail before designing the story |
| Data center operations across sites | Nexus Dashboard Clusters > Fabrics > one fabric or switch | Cluster and fabric summaries after loading, 2026-10-01 | Wait for the table to fill before narrating a count. Inspect a critical fabric first |
| Do application symptoms have network evidence | Network App Impact > service search > expand a service > its Splunk link | A degraded service without network correlation and a healthy one with eight hosts, 2026-10-01 | Missing network evidence does not rule the network out. End with the next domain to investigate |
| AI operations, cost, and quality review | Agent Observability > project and stream > usage and cost > signals > controls > evaluators | Overview and trends inspected, 2026-10-01 | Zero evaluated observations is not a pass. Keep raw prompts off screen. End on one signal drill-down after inspecting it |
| Build a team-specific app | Studio > Build app or Build agent > a Quick start > preview | Entry screens 2026-10-02; one Quick start draft built and previewed | Custom app prompts are read-only in this dCloud build and apps cannot be installed. Show only an observed build |
| Sharing and community | Studio explanation > Marketplace catalog | Marketplace says "Demo only", 2026-10-02 | Present the described model and say it is a demo catalog. No staged install |
| Better Webex meeting or call troubleshooting | Collaboration Control Hub > Monitoring > Troubleshooting | Overview and labels, 2026-10-01; a Webex Calling call was the usable example in September | Troubleshooting did not open on 2026-10-01. Get a usable call record before choosing this story |
| Change verification and rollback readiness | A site baseline > relevant product evidence > a change summary | Concept only | Not a demonstrated workflow. Build it as a labeled concept or use current product checks |

## Represent the customer honestly

- The customer's need can be shown in PseudoCo's fictional environment, but say what is being represented. Do not
  narrate PseudoCo data as the customer's estate.
- If the requested integration, condition, or action is absent, choose a supported subset and state the boundary,
  or bridge the missing step with labeled motion graphics (L92).
- A named product in the ask does not establish entitlement or a configured integration, and a documented feature
  does not establish that this dCloud build has it.

## Before recording

Capture the audience and their question, the takeaway, the represented scenario, the products shown, the exact
click path, permitted state changes, redaction needs (see the redaction list in `PLATFORM_MAP.md`), expected waits,
one fallback, and where the story ends. Then follow the normal interview and storyboard approval.
