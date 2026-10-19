# Models

Claude: every Claude Code session and subagent in this studio runs `claude-opus-5-5` at high effort (set in
`.claude/settings.json`, the skill, and every agent file). Launch NodeTerm sessions with the exact id
`--model claude-opus-5-5`, never the `opus` alias, which resolved to an older Opus on 2026-09-23.

OpenRouter models that worked in September 2026. The catalog changes often: list the current ones from inside a
job folder with `python3 lib/models.py speech|transcription|audio|image|text [filter]` before choosing.

| Job | Model | Notes |
|---|---|---|
| Demo voice | `google/gemini-3.8-flash-tts`, voice `Iapetus` | Won for "calm, assured, technical demo voice". Also `Charon` (better for ads). One call holds a 5-minute script, about $0.08. No working style field. |
| Alternative voices | `minimax/speech-2.8-hd` (`English_magnetic_voiced_man`), `microsoft/mai-voice-2` | MAI has a working style field; MAI Harper said "won" for WAN. |
| Voice for test runs | The demo voice above | The test run used it on 2026-10-19: about 1 cent per 50-second take. The free `deepgram/flux-tts:free` was gone from the catalog that day; the only free voice listed was `fish-audio/s2.1-pro-free:free`, not tested here. |
| Word timestamps | `openai/whisper-large-v3` | Mishears some words; confirm by ear before rewording. |
| Listening judge | `openai/gpt-audio` | Scores takes, checks pronunciation and missing words. Judge joins by `build_voice.py`'s JOIN numbers instead (L56). |
| Music | `google/lyria-3-pro-preview` | Make 2 or 3 beds; one had garbled vocals. |
| Frame and fact review | `google/gemini-3.1-pro-preview`, then a second model family (e.g. `openai/gpt-6-sol`, used for the Cloud Control fact check) | Use different models from the script writer and from each other. |
| Connective art | `google/gemini-3-pro-image`, `openai/gpt-image-2` | Title backgrounds only; never imitate product UI. |

If a model returns "no endpoints found" or a data-policy error, see SETUP.md, "Model access".
