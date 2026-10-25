#!/usr/bin/env python3
"""Mechanical gates for the English docs. Exit 1 if any gate fails.

Each check here exists because the claim it guards was shipped wrong at least once.
Written rules did not hold: the On duty / Paused behaviour was reverted by five
separate review passes before it became STYLE.md fact 9, and twice more after.

Usage:  python3 scripts/verify-docs.py [--quiet]
"""
import json
import os
import re
import sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LANGS = ("vi/", "ja/", "ko/")
failures = []
notes = []


def english_pages():
    for root, _, files in os.walk("."):
        if any(p in root for p in (".git", "node_modules", "snippets/vi", "snippets/ja", "snippets/ko")):
            continue
        for f in files:
            if not f.endswith(".mdx"):
                continue
            p = os.path.relpath(os.path.join(root, f), ".")
            if not p.startswith(LANGS):
                yield p


PAGES = sorted(english_pages())


def read(p):
    with open(p, encoding="utf-8") as fh:
        return fh.read()


def fail(gate, detail):
    failures.append(f"{gate}: {detail}")


# ---------------------------------------------------------------- fact 9
# STYLE.md fact 9. While Paused, match_cluster_use_case.py creates the Incident
# unconditionally with status=OPEN; on_duty only stamps created_while_paused, and
# nothing replays those incidents. Both phrasings below assert the opposite.
FACT9_BANNED = [
    r"don'?t become incidents",
    r"do not become incidents",
    r"held triage",
    r"triage .{0,40}(was )?held",
    r"held while paused",
    r"wait until you switch back",
    r"goes ahead,? along with",
    r"never opens? an incident by itself",
    r"don't open incidents",
    r"triage,? or a person,? (decides|opens)",
]
for p in PAGES:
    body = read(p)
    for pat in FACT9_BANNED:
        for m in re.finditer(pat, body, re.I):
            line = body[: m.start()].count("\n") + 1
            fail("fact9", f"{p}:{line} {m.group(0)!r} — see STYLE.md fact 9 (verify in backend before rewording)")

# ------------------------------------------------- rule enforcement caveat
# Rule enforcement is off by default; while in preview Rules only record.
# A page may claim Rules decide only if it also carries the caveat or links it.
RULES_CLAIM = re.compile(
    r"(Rules (now )?decide|goes? through Rules|Rules apply before"
    r"|(Allow|Ask first|Ask-first|Deny)\**\s*\[?Rule"
    r"|add an? \*\*\w+\*\* \[?Rule|/create-policy"
    r"|no Rule allows|a Rule allows|Rule decides"
    r"|routine writes (don't|do not) depend"
    r"|routine writes run without)", re.I)
CAVEAT = re.compile(r"(enforcement|in preview|only record|off by default)", re.I)
# The pages that define the caveat are its source; they need not restate it per mention.
# Only the pages whose SUBJECT is the caveat are exempt. approvals/overview.mdx was
# exempt wholesale and that hid two uncaveated claims, so it is checked like any other.
CAVEAT_HOME = {"guide/concepts.mdx", "guide/approvals/approval-mode.mdx",
               "guide/approvals/rules.mdx"}
for p in PAGES:
    if p in CAVEAT_HOME:
        continue
    body = read(p)
    for m in RULES_CLAIM.finditer(body):
        line = body[: m.start()].count("\n") + 1
        window = body[max(0, m.start() - 600) : m.end() + 600]
        if not CAVEAT.search(window):
            fail("rules-caveat", f"{p}:{line} {m.group(0)!r} with no enforcement caveat nearby")

# ------------------------------------------------------- banned vocabulary
BANNED = {
    r"Scale\+": "plan name is 'Scale Plus' (STYLE fact 6)",
    r"#chart\b": "#chart does not exist in the product (STYLE fact 3)",
    r"#kb\b": "#kb does not exist in the product (STYLE fact 3)",
    r"\bCostOps\b": "retired module name; use Optimize",
    r"\bSecOps\b": "retired module name; use Cyber",
    r"Deep Response Engine|\bDRE\b": "retired module name; use Resolve",
    r"\bOlivier\b": "misspelling of the retired persona",
    r"[Ss]cheduled tasks?\b": "retired name; the surface is an Automation",
}
# Pages that document retired names on purpose. A page opts out either by living
# here or by carrying the marker comment below, so the gate stays useful elsewhere.
ALLOW_RETIRED = {"guide/glossary.mdx",
                 "guide/connections/clickup.mdx"}  # ClickUp's own scheduled tasks
MARKER = "verify-docs: allow-retired-names"

for p in PAGES:
    body = read(p)
    if p in ALLOW_RETIRED or MARKER in body:
        continue
    for pat, why in BANNED.items():
        for m in re.finditer(pat, body):
            line = body[: m.start()].count("\n") + 1
            fail("terminology", f"{p}:{line} {m.group(0)!r} — {why}")

# ------------------------------------------------------------- frontmatter
FM = re.compile(r"\A---\n(.*?)\n---", re.S)
titles = {}
for p in PAGES:
    if p.startswith("snippets/"):
        continue
    m = FM.search(read(p))
    if not m:
        fail("frontmatter", f"{p} has no frontmatter block")
        continue
    fm = m.group(1)
    t = re.search(r"^title:\s*(.+)$", fm, re.M)
    d = re.search(r"^description:\s*(.+)$", fm, re.M)
    if not t:
        fail("frontmatter", f"{p} has no title")
    else:
        val = t.group(1).strip().strip("\"'")
        titles.setdefault(val, []).append(p)
    if not d:
        fail("frontmatter", f"{p} has no description")
    else:
        val = d.group(1).strip().strip("\"'")
        if len(val) > 150:
            fail("frontmatter", f"{p} description is {len(val)} chars (max 150)")
for val, owners in titles.items():
    if len(owners) > 1:
        fail("frontmatter", f"duplicate title {val!r} on {', '.join(owners)}")

# --------------------------------------------------------------- docs.json
cfg = json.load(open("docs.json"))
en = cfg["navigation"]["languages"][0]
nav = []


def walk(node):
    if isinstance(node, dict):
        for v in node.values():
            if isinstance(v, (list, dict)):
                walk(v)
    elif isinstance(node, list):
        for v in node:
            if isinstance(v, str):
                nav.append(v)
            else:
                walk(v)


walk(en)
for slug in nav:
    if not os.path.exists(slug + ".mdx"):
        fail("nav", f"docs.json points at missing page {slug}")
        continue
    head = read(slug + ".mdx")[:400]
    for flag in ("hidden: true", "noindex: true"):
        if flag in head:
            fail("nav", f"{slug} is in the nav but sets '{flag}' \u2014 Mintlify keeps it out "
                        f"of the sidebar and search, so it is published but unreachable")

# One home per page. Mintlify renders and highlights every occurrence, so a page
# listed twice makes the reader unable to tell which section they are in. Mirror
# the app in the hub pages' tables instead of by listing a page in two groups.
for lb in cfg["navigation"]["languages"]:
    seen = []
    walk_lang = []

    def collect(node, out):
        if isinstance(node, dict):
            for v in node.values():
                if isinstance(v, (list, dict)):
                    collect(v, out)
        elif isinstance(node, list):
            for v in node:
                if isinstance(v, str):
                    out.append(v)
                else:
                    collect(v, out)

    collect(lb, walk_lang)
    for slug in sorted({s for s in walk_lang if walk_lang.count(s) > 1}):
        fail("nav-duplicate", f"[{lb['language']}] {slug} appears {walk_lang.count(slug)}x in nav")

# nav must agree with the generator, or a script run silently reverts it
gen = read("scripts/platform-nav.py")
for group in ("Workspace settings", "Admin Settings"):
    in_nav = next((g.get("pages", []) for t in en["tabs"] for g in t.get("groups", []) if g.get("group") == group), None)
    if in_nav is None:
        continue
    missing = [s for s in in_nav if f'"{s}"' not in gen]
    if missing:
        fail("nav-generator", f"{group}: {len(missing)} page(s) in docs.json but not in platform-nav.py "
                              f"(a script run would drop them): {', '.join(missing[:4])}")

# ---------------------------------------------------------------- llms.txt
if os.path.exists("llms.txt"):
    listed = set(re.findall(r"https://docs\.cloudthinker\.io/([^)\s]+)\.md", read("llms.txt")))
    navset = {s for s in nav if not s.startswith(LANGS)}
    for slug in sorted(navset - listed):
        fail("llms", f"{slug} is in nav but not llms.txt (run scripts/build-llms.py)")
    for slug in sorted(listed - navset):
        fail("llms", f"{slug} is in llms.txt but not nav")

# ----------------------------------------------------------- orphan pages
linked = set()
LINK = re.compile(r"\]\(/([^)#\s]+)")
HREF = re.compile(r'href="/([^"#?]+)')  # Cards and raw HTML link this way
for p in PAGES:
    body = read(p)
    for m in LINK.finditer(body):
        linked.add(m.group(1).rstrip("/"))
    for m in HREF.finditer(body):
        linked.add(m.group(1).rstrip("/"))
for slug in sorted({s for s in nav if not s.startswith(LANGS)}):
    if slug in ("index",):
        continue
    if slug not in linked:
        notes.append(f"orphan: {slug} is in nav but no page links to it")

# The reverse, and a harder failure: a page other pages link to that no nav lists.
# Regenerating a nav script drops any page the script does not know about, silently.
_all = []
collect(cfg["navigation"], _all)
all_nav = set(_all)
for slug in sorted(linked):
    if not os.path.exists(slug + ".mdx") or slug.startswith(LANGS):
        continue
    if slug not in all_nav:
        fail("nav-missing", f"{slug} is linked from other pages but is in no language's nav "
                            f"(a generator script may have dropped it)")

# ----------------------------------------------------------------- Beta
# One label word. Cyber is the only product the app badges pre-GA
# (navigation-config.schema.ts: "Marks a pre-GA product"; appsec carries beta: true),
# so every Cyber page declares it. Feature flags alone do NOT mean Beta: most are
# deployment kill-switches that default ON, including the Resolve module itself.
for p in PAGES:
    if p.startswith("guide/security/") and any(
        k in p for k in ("cyber", "pentest", "captcha", "code-audit")
    ):
        head = read(p)[:500]
        if 'tag: "Beta"' not in head:
            fail("beta", f"{p} is a Cyber page and must declare tag: \"Beta\" (the app badges Cyber pre-GA)")

# ------------------------------------------------------------ STYLE shape
# Every one of these was reported by hand across six review passes. Gate them so
# the next pass spends its attention on facts instead of counting cards.
STYLE_EXEMPT = ("learn/", "api-reference/", "essentials/", "snippets/")
ENDINGS = ("## Next steps", "## Related", "## Get started")  # (b) overviews end on Get started

for p in PAGES:
    if p.startswith(STYLE_EXEMPT) or p in ("index.mdx", "changelog.mdx"):
        continue
    body = read(p)

    # The closing CardGroup: 2-4 linked cards, two columns.
    groups = re.findall(r"<CardGroup\b([^>]*)>(.*?)</CardGroup>", body, re.S)
    if groups:
        attrs, inner = groups[-1]
        cards = len(re.findall(r"<Card\b", inner))
        if cards > 4:
            fail("style", f"{p} closing CardGroup has {cards} cards (max 4)")
        if cards < 2:
            fail("style", f"{p} closing CardGroup has {cards} card (min 2)")
        m = re.search(r"cols=\{(\d+)\}", attrs)
        if m and m.group(1) != "2":
            fail("style", f"{p} closing CardGroup uses cols={{{m.group(1)}}} (expected 2)")

    # The page should end on Next steps or Related.
    heads = re.findall(r"^## .+$", body, re.M)
    if heads and not any(heads[-1].startswith(e) for e in ENDINGS):
        fail("style", f"{p} ends on {heads[-1].strip()!r} (expected 'Next steps' or 'Related')")

    # Advisory only: STYLE splits a page past 1.5x its template budget. The
    # largest template budget is 1500, so 2250 is the ceiling for any page.
    words = len(re.sub(r"<[^>]+>|```.*?```", " ", body, flags=re.S).split())
    if words > 2250:
        notes.append(f"long: {p} is ~{words} words (over the 2,250 ceiling)")

# ------------------------------------------------------------------ report
quiet = "--quiet" in sys.argv
if notes and not quiet:
    print(f"{len(notes)} advisory note(s):")
    for n in notes[:20]:
        print("  -", n)
    if len(notes) > 20:
        print(f"  … and {len(notes) - 20} more")
    print()

if failures:
    by_gate = {}
    for f in failures:
        by_gate.setdefault(f.split(":")[0], []).append(f)
    print(f"FAIL — {len(failures)} problem(s) across {len(by_gate)} gate(s):\n")
    for gate, items in sorted(by_gate.items()):
        print(f"[{gate}] {len(items)}")
        for i in items[:12]:
            print("   ", i.split(": ", 1)[1])
        if len(items) > 12:
            print(f"    … and {len(items) - 12} more")
        print()
    sys.exit(1)

print(f"PASS — {len(PAGES)} English pages, {len(nav)} nav entries, all gates clean.")
