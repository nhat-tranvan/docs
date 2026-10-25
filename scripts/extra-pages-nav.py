#!/usr/bin/env python3
"""Place pages added after the v2 build into the Platform and Resources tabs,
and drop redirects whose source is now a live page. Run after the other nav
scripts and before stale-translations.py and build-llms.py."""
import json
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open("docs.json"))

# (tab names per language, group to append to, pages to add after `after`)
PLACE = [
    (("Platform", "Nền tảng", "プラットフォーム", "플랫폼"), ("Workspaces and organization", "Tổ chức", "組織", "조직"),
     "guide/workspace-branding", ["guide/capabilities"]),
    (("Resources", "Tài nguyên", "リソース", "리소스"), ("Scenarios", "Tình huống thực tế", "シナリオ", "시나리오"),
     None, ["guide/use-cases/resolve-checkout-incident", "guide/use-cases/review-risky-pull-request",
            "guide/use-cases/cyber-pentest-staging"]),
]


def loc(p, lang):
    return f"{lang}/{p}" if lang != "en" and os.path.exists(f"{lang}/{p}.mdx") else p


for block in d["navigation"]["languages"]:
    lang = block["language"]
    for tabs, groups, after, pages in PLACE:
        for t in block["tabs"]:
            if t.get("tab") not in tabs:
                continue
            for g in t["groups"]:
                if g["group"] not in groups:
                    continue
                cur = [x for x in g["pages"] if isinstance(x, str)]
                new = [loc(p, lang) for p in pages if loc(p, lang) not in cur]
                if after and loc(after, lang) in g["pages"]:
                    i = g["pages"].index(loc(after, lang)) + 1
                    g["pages"][i:i] = new
                else:
                    g["pages"].extend(new)

live = set()


def walk(x):
    if isinstance(x, str):
        live.add("/" + x)
        return
    for k in ("tabs", "groups", "pages", "anchors"):
        for c in x.get(k, []):
            walk(c)


for block in d["navigation"]["languages"]:
    walk(block)
before = len(d["redirects"])
d["redirects"] = [r for r in d["redirects"] if r["source"] not in live and not any(
    r["source"] == f"/{l}/{p.lstrip('/')}" for l in ("vi", "ja", "ko") for p in live)]
with open("docs.json", "w") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("redirects removed:", before - len(d["redirects"]))
