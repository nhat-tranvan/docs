#!/usr/bin/env python3
"""Lean Get started sidebar (docs v2).

Three short groups: the essentials first, then the basics to learn, then the
places you can work from, with chat apps and the CLI collapsed. Every
language gets the same structure; a page uses <lang>/<page> when translated.
"""
import json
import os

NAV = [
    ("Start here", ["index", "quickstart", "guide/concepts", "guide/tutorial/agenticops"]),
    ("Learn the basics", ["guide/agents/overview", "guide/activity", "guide/commands", "guide/glossary"]),
    ("Work where you are", [
        {"group": "Chat apps", "expanded": False, "pages": [
            "guide/slack-integration", "guide/teams-integration", "guide/google-chat-integration"]},
        {"group": "CLI", "expanded": False, "pages": [
            "guide/cli/overview", "guide/cli/authentication", "guide/cli/agent",
            "guide/cli/headless-chat", "guide/cli/reference"]},
    ]),
]
L10N = {
    "Start here": {"vi": "Bắt đầu tại đây", "ja": "スタートガイド", "ko": "여기서 시작"},
    "Learn the basics": {"vi": "Kiến thức cơ bản", "ja": "基本を学ぶ", "ko": "기본 익히기"},
    "Work where you are": {"vi": "Làm việc ở nơi bạn quen", "ja": "いつもの場所で使う", "ko": "익숙한 곳에서 사용"},
    "Chat apps": {"vi": "Ứng dụng chat", "ja": "チャットアプリ", "ko": "채팅 앱"},
    "CLI": {"vi": "CLI", "ja": "CLI", "ko": "CLI"},
}
TAB = {"en": "Get started", "vi": "Bắt đầu", "ja": "はじめに", "ko": "시작하기"}

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open("docs.json"))


def loc(node, lang):
    if isinstance(node, str):
        if lang == "en":
            return node
        return f"{lang}/{node}" if os.path.exists(f"{lang}/{node}.mdx") else node
    out = {"group": node["group"] if lang == "en" else L10N.get(node["group"], {}).get(lang, node["group"])}
    if "expanded" in node:
        out["expanded"] = node["expanded"]
    out["pages"] = [loc(p, lang) for p in node["pages"]]
    return out


for block in d["navigation"]["languages"]:
    lang = block["language"]
    for t in block["tabs"]:
        if t.get("tab") == TAB[lang]:
            t["groups"] = [loc({"group": g, "pages": pages}, lang) for g, pages in NAV]
            t.pop("menu", None)

with open("docs.json", "w") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("get started: 3 groups")
