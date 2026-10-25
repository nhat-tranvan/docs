#!/usr/bin/env python3
"""Regenerate llms.txt from the English navigation and each page's frontmatter.

Run from the repo root after any navigation or title change:
  python3 scripts/build-llms.py
"""
import json
import os
import re

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE = "https://docs.cloudthinker.io"
d = json.load(open("docs.json"))
en = d["navigation"]["languages"][0]


def meta(page):
    s = open(f"{page}.mdx").read()
    m = re.match(r"---\n(.*?)\n---", s, re.S)
    fm = m.group(1) if m else ""
    def field(k):
        f = re.search(rf'^{k}:\s*["\']?(.*?)["\']?\s*$', fm, re.M)
        return f.group(1).strip() if f else ""
    return field("title") or page, field("description")


out = [
    "# CloudThinker",
    "",
    "> CloudThinker builds Frontier Investigation Agents. They find the root cause. You approve the fix. "
    "Products: Resolve (incidents), Review (code changes), Cyber (application security), Optimize (cloud cost), "
    "Customize (your rules, runbooks and tools) and Automation (scheduled and event-driven runs).",
    "",
]


def pages(node):
    if isinstance(node, str):
        yield node
        return
    for p in node.get("pages", []):
        yield from pages(p)


for tab in en["tabs"]:
    if "href" in tab:
        continue
    sections = [(a["anchor"], a["groups"]) for a in tab["anchors"]] if "anchors" in tab else [(None, tab["groups"])]
    for anchor, groups in sections:
        for g in groups:
            title = " / ".join(x for x in (tab["tab"], anchor, g["group"]) if x)
            out += [f"## {title}", ""]
            for p in pages(g):
                t, desc = meta(p)
                out.append(f"- [{t}]({BASE}/{p}.md): {desc}" if desc else f"- [{t}]({BASE}/{p}.md)")
            out.append("")

open("llms.txt", "w").write("\n".join(out).rstrip() + "\n")
print(sum(1 for l in out if l.startswith("- [")), "entries")
