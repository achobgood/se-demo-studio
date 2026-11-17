# Agent probe: <product> (<date>)

Probe every AI agent or assistant feature the story might use before building on it, and again just before
recording (L9). Answers change run to run (L4) and saved threads can disappear (L100).

- One narrow question per new thread, so one agent's failure does not hide another's answer.
- Copy the exact prompt and the exact completion line. Quote error wording.
- Retry each failure about 8 minutes later with the same wording, and record whether it recovered.
- Note the tell for a failed agent if there is one (for example a time chip of `<1s` where working agents take
  20 seconds or more).
- Probes create threads in a shared tenant. Probe only if the interview allows asking the assistant, and log each
  thread in `logs/state_changes.md`.

| # | Sent | Prompt (exact) | Agents shown (time) | Completion line | Data? |
|---|---|---|---|---|---|
| 1 | | | | | |

## Error wording (verbatim)

## What the working agents can carry
