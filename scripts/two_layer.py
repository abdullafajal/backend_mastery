"""two_layer.py: turn a lesson into the two-layer format (CLAUDE.md §4a), without retyping verified content.

What it does to one lesson file:
  1. adds an `!!! abstract "In 1 minute"` box right after the lesson meta card (replaces an existing one);
  2. moves the chosen `### Section` (or `#### Section`) blocks, in place, into collapsible `??? note "Going deeper: Section"` boxes
     (the block ends at the next heading of the same or higher level, or at an existing top-level `???`/`!!!` box);
  3. sets the "Reading time" in the meta card.

Usage (from Python):
    from two_layer import convert
    convert("docs/.../lesson.md", minute=["...", "..."], deeper=["Section title", ...], reading="15 min (+ optional deeper parts)")
"""

import re
from pathlib import Path


def _wrap(lines, title):
    title = title.replace('"', "'")   # a double quote inside the title would end it early
    out = [f'??? note "Going deeper: {title}"', ""]
    for line in lines:
        out.append(("    " + line) if line.strip() else "")
    while out and out[-1] == "":
        out.pop()
    return out + [""]


def convert(path, minute, deeper, reading):
    p = Path(path)
    lines = p.read_text(encoding="utf-8").split("\n")

    # 1. collapse the chosen sections
    missing = list(deeper)
    i = 0
    result = []
    while i < len(lines):
        line = lines[i]
        m = re.match(r"^(###|####) (.+?)\s*$", line)
        if m and m.group(2) in deeper:
            title = m.group(2)
            level = len(m.group(1))
            missing.remove(title)
            j = i + 1
            # the block ends at a heading of the same or a higher level, or at a top-level box
            while j < len(lines):
                h = re.match(r"^(#{2,6}) ", lines[j])
                if (h and len(h.group(1)) <= level) or re.match(r"^(\?\?\? |!!! )", lines[j]):
                    break
                j += 1
            body = lines[i + 1 : j]
            while body and body[0].strip() == "":
                body.pop(0)
            result.extend(_wrap(body, title))
            i = j
            continue
        result.append(line)
        i += 1
    if missing:
        raise SystemExit(f"{path}: sections not found: {missing}")

    text = "\n".join(result)

    # 2. the "In 1 minute" box (replace an old one, or insert after the meta card)
    box = '!!! abstract "In 1 minute"\n' + "\n".join(f"    - {b}" for b in minute) + "\n"
    text = re.sub(r'!!! abstract "In 1 minute"\n(?:    .*\n|\n(?=    ))*', "", text)
    text = re.sub(r"(<div class=\"bz-meta\" markdown>\n(?:.*\n)*?</div>\n)", lambda m: m.group(1) + "\n" + box, text, count=1)

    # 3. reading time
    text = re.sub(r"\*\*Reading time\*\* .*", f"**Reading time** {reading}", text, count=1)

    text = re.sub(r"\n{3,}", "\n\n", text)
    p.write_text(text, encoding="utf-8")
    return path
