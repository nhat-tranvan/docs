#!/usr/bin/env python3
"""Point navigation entries for out-of-date translations back to English.

A translated page listed here predates the current English rewrite and would
mislead readers (for example, the retired demo environment). Until it is
retranslated, vi/ja/ko navigation shows the English page instead.
Run last, after the other nav scripts. Remove a page from STALE once retranslated.
"""
import json
import os

STALE = {
    "index", "quickstart", "learn/faq",
    "guide/use-cases/kubernetes-health-monitoring", "guide/skills/overview",
    "guide/knowledge", "guide/artifacts/overview",
    "guide/connections/cloudflare", "guide/connections/betterstack",
}

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open("docs.json"))
n = 0


def fix(node, lang):
    global n
    if isinstance(node, str):
        if node.startswith(f"{lang}/") and node[len(lang) + 1:] in STALE:
            n += 1
            return node[len(lang) + 1:]
        return node
    for k in ("tabs", "groups", "pages", "anchors", "menu"):
        if k in node:
            node[k] = [fix(x, lang) for x in node[k]]
    return node


for block in d["navigation"]["languages"]:
    if block["language"] != "en":
        fix(block, block["language"])
with open("docs.json", "w") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("pointed back to English:", n)
