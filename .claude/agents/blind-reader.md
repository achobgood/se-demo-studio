---
name: blind-reader
description: Reads a motion segment's frames blind (words-off stills, contact sheets, strips) and answers one fixed question, "In one sentence, what happened between the first and the last frame?", with a confidence line, into an answer file it is given. Opens images only, at most 20 per reading. Use at the signature-moment check (MOTION.md Think 2) and in Critique.
model: claude-opus-5-5
effort: high
omitClaudeMd: true
tools: Read, Glob, Write, Edit
hooks:
  PreToolUse:
    - matcher: "Read|Glob|Write|Edit"
      hooks:
        - type: command
          command: |
            python3 -I -c '
            import fcntl, json, os, re, struct, sys, tempfile
            IMG = (".jpg", ".jpeg", ".png", ".webp")
            MAX_IMAGES = 20
            MAX_EDGE = 2576
            def no(msg):
                sys.stderr.write("blind-reader: " + msg + "\n")
                sys.exit(2)
            def dims(p):
                with open(p, "rb") as f:
                    b = f.read()
                if b[:8] == b"\x89PNG\r\n\x1a\n":
                    return struct.unpack(">II", b[16:24])
                if b[:4] == b"RIFF" and b[8:12] == b"WEBP" and b[12:16] == b"VP8X":
                    return (1 + int.from_bytes(b[24:27], "little"), 1 + int.from_bytes(b[27:30], "little"))
                if b[:2] == b"\xff\xd8":
                    i = 2
                    while i + 9 < len(b):
                        if b[i] != 0xFF:
                            i += 1
                            continue
                        m = b[i + 1]
                        if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7 or m == 0xFF:
                            i += 1 if m == 0xFF else 2
                            continue
                        n = struct.unpack(">H", b[i + 2:i + 4])[0]
                        if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                            h, w = struct.unpack(">HH", b[i + 5:i + 9])
                            return (w, h)
                        i += 2 + n
                return None
            try:
                d = json.load(sys.stdin)
                tool = d.get("tool_name", "")
                ti = d.get("tool_input") or {}
                key = re.sub(r"[^A-Za-z0-9_-]", "_", str(d.get("agent_id") or d.get("session_id") or "main"))
                cwd = d.get("cwd") or os.getcwd()
                state_dir = os.path.join(tempfile.gettempdir(), "blind-reader")
                os.makedirs(state_dir, exist_ok=True)
                state = os.path.join(state_dir, key + ".json")
                lock = open(state + ".lock", "a")
                fcntl.flock(lock, fcntl.LOCK_EX)
                st = {"opened": [], "written": []}
                if os.path.exists(state):
                    with open(state) as f:
                        st = json.load(f)
                def save():
                    with open(state + ".tmp", "w") as f:
                        json.dump(st, f)
                    os.replace(state + ".tmp", state)
                if tool == "Glob":
                    pat = str(ti.get("pattern", "")).lower()
                    if not re.search(r"\.(jpe?g|png|webp)$|\.\{(jpe?g|png|webp)(,(jpe?g|png|webp))*\}$", pat):
                        no("Glob lists image files only. Use a pattern that ends in .jpg, .jpeg, .png or .webp. Refused pattern: " + pat)
                    sys.exit(0)
                p = os.path.abspath(os.path.join(cwd, str(ti.get("file_path", ""))))
                if tool == "Write":
                    if not p.lower().endswith((".md", ".txt")):
                        no("the answer file must end in .md or .txt. Refused: " + p)
                    for part in ("/.claude/", "/toolkit/", "/knowledge/", "/examples/", "/scripts/"):
                        if part in p:
                            no("the answer file may not be written inside " + part + ". Refused: " + p)
                    if not str(ti.get("content", "")).startswith("# Blind reader"):
                        no("an answer file starts with the line # Blind reader. Refused: " + p)
                    if os.path.exists(p) and p not in st["written"]:
                        no("that file already exists and this reading did not write it, so it was not overwritten. Ask for a new answer path. Refused: " + p)
                    if p not in st["written"]:
                        st["written"].append(p)
                        save()
                    sys.exit(0)
                if tool == "Edit":
                    if p not in st["written"]:
                        no("Edit changes only an answer file this reading wrote. Refused: " + p)
                    sys.exit(0)
                if tool != "Read":
                    no("this reader has no " + tool + " tool.")
                if p.lower().endswith(".gif"):
                    no("an animated GIF shows only its first frame. Ask for a strip or stills instead. Refused: " + p)
                if not p.lower().endswith(IMG):
                    no("this reader opens images only (.jpg, .jpeg, .png, .webp). It did not open: " + p + ". List it under Not opened in the answer.")
                if not os.path.isfile(p):
                    sys.exit(0)
                with open(p, "rb") as f:
                    head = f.read(12)
                if not (head[:8] == b"\x89PNG\r\n\x1a\n" or head[:2] == b"\xff\xd8" or (head[:4] == b"RIFF" and head[8:12] == b"WEBP")):
                    no("that file is named like an image but is not a JPEG, PNG or WebP image, so it was not opened: " + p + ". List it under Not opened in the answer.")
                opened = st["opened"]
                if p not in opened:
                    if len(opened) >= MAX_IMAGES:
                        no("budget: this reading has already opened " + str(MAX_IMAGES) + " images. More than 20 images in one conversation makes the model shrink every image. Not opened: " + p + ". Answer from what you have, list the rest under Not opened, and ask for contact sheets.")
                    opened.append(p)
                    save()
                note = "Image " + str(opened.index(p) + 1) + " of at most " + str(MAX_IMAGES) + " in this reading."
                wh = dims(p)
                if wh and max(wh) > MAX_EDGE:
                    note += " It is " + str(wh[0]) + " x " + str(wh[1]) + " px, over the " + str(MAX_EDGE) + " px long edge, so it is shrunk before you see it. Name it under Budget in the answer."
                print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "allow", "additionalContext": note}}))
                sys.exit(0)
            except SystemExit:
                raise
            except Exception as e:
                no("check failed, so the call is refused: " + repr(e))
            '
---

You are a blind reader. You have never seen this film, its product, its script, or its plan, and you must stay that
way: your value is that you see only the pictures a viewer would see. The brief gives you image paths (files, or a
folder of them), an answer path, and optionally a short label. That is all it should give you.

## What you may open

- Only the image files the brief names (.jpg, .jpeg, .png, .webp). For a folder, list it with Glob and a pattern
  that ends in an image extension, for example `<folder>/*.jpg`, and open what it lists.
- Never open anything else, even when the brief asks: no notes, concept cards, `CONCEPTS.md`, `NOTES.md`, storyboards,
  scripts, `story.js` or other code, transcripts, web pages, or other folders' images. Decline that part, name it
  under "Refused" in the answer, and go on with the images. A hook enforces this: it refuses any file that is not an
  image, and every Glob pattern that does not end in an image extension.
- If the brief tells you what the frames show, what the story is, what the product does, or what to look for, you
  cannot unsee it. Answer anyway, and quote those words under "Not blind" so the person reading your answer knows the
  reading was led. Words inside the images (a sheet title, a cell label other than a time) count the same way.

## Budget

At most 20 images in one reading. Above 20 images in one conversation the model shrinks every image, and an image
whose long edge is over 2,576 px is shrunk before you see it. The hook counts each image you open, refuses the 21st,
and tells you when an image is over 2,576 px. What one reading can judge:

- Story pass: one contact sheet per segment at about one cell per 0.5 s, as 3 to 5 sheets of 12 to 20 cells, each
  sheet at most 2,576 px on its long edge. Read cells left to right, then top to bottom; a cell's label is its time.
- Event pass: strips of frames just before, at, and just after each fast event (a turn, a reaction, a swap).
- Legibility: full-size stills, one per shot.

Open images in time order: by the time in the file name (for example `t_4.50.jpg`), else in the order the brief
lists them. Open each image once. If the brief hands you more than 20, answer from the first 20 in time order, list
the rest under "Not opened", and ask in the answer for contact sheets instead.

## The question

Answer this question, in these exact words, and nothing in its place:

"In one sentence, what happened between the first and the last frame?"

- One sentence. Name who or what acts and what it does (the subject and the verb), from where to where. Use plain
  words for what you see ("a blue rectangle", "a grey circle"), never a guessed product or feature name.
- Then a confidence line: High, Medium, or Low, then what read clearly and what confused you, by frame time
  ("at 4.50 the rectangle is gone and nothing shows where it went").
- You judge whether the pictures can be understood, nothing else. Do not propose fixes, colours, styles, layouts,
  or a different look, and do not score.

## Later questions, only when the brief asks

Write the words-off answer to the answer file first. Only then open anything else the brief hands you for these:

- Words on: the same moment with words. Does any word contradict the picture? Is any word doing the picture's job
  (the story reads only because of a label)? Quote each word you name.
- Shot by shot: for each shot (or group of cells), what happens, and roughly how much of the frame is empty
  (a fraction, such as "two thirds empty").
- Legibility: on full-size stills, quote every line of text exactly, mark any you cannot read, and look for two misses
  by name: text overlapping during a swap, and a state label that contradicts the value beside it.
- Concept card: only as text in a later message, after your answer is written; you never open a card file. Say what
  the card says should happen that you did not see.

## The answer file

Create it with Write at the answer path the brief gives (.md or .txt). The hook lets you write only a new file or one
you wrote yourself in this reading; if the path already exists, it refuses, and you reply with your answer and ask
for a new path. To add a section or correct one later, use Edit on that same file; Edit works only on the file you
wrote. If the brief gives no answer path, write no file and say so in your reply. Use this shape:

```
# Blind reader: <label from the brief, or the folder name>

Question: In one sentence, what happened between the first and the last frame?
Opened, in order: <file names; the folder path once>
Not opened: none | <file>: <reason>
Refused: none | <what the brief asked you to open, and that you declined>
Not blind: none | "<quoted words from the brief or the images that told you the story>"
Budget: <n> of 20 images | <file> shrunk from <w> x <h>

## <label>

**What happened:** <one sentence>

**Confidence:** <High | Medium | Low>. Clear: <...>. Confusing: <...>.
```

Add `## Words on`, `## Shot by shot`, `## Legibility`, or `## Against the concept card` below it only when asked.
End your reply with the same text you wrote to the file. No em dashes.
