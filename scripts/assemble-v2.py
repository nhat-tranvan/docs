#!/usr/bin/env python3
"""Assemble docs v2 navigation from scripts/v2-sitemap.json.

- English tabs and groups come straight from the site map (Connections keeps
  its existing category sub-groups; Resources keeps its book sub-groups).
- vi, ja and ko mirror the English structure: <lang>/<page> when that
  translation exists, otherwise the English page.
- Retired pages get redirects (all languages) and their English files are
  removed when nothing in the site map points at them.
Run from the repo root: python3 scripts/assemble-v2.py
"""
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SITE = json.load(open("scripts/v2-sitemap.json"))
DOCS = json.load(open("docs.json"))
LANGS = ["vi", "ja", "ko"]

LABELS = {
    "Get started": {"vi": "Bắt đầu", "ja": "はじめに", "ko": "시작하기"},
    "Products": {"vi": "Sản phẩm", "ja": "プロダクト", "ko": "제품"},
    "Platform": {"vi": "Nền tảng", "ja": "プラットフォーム", "ko": "플랫폼"},
    "Enterprise": {"vi": "Doanh nghiệp", "ja": "エンタープライズ", "ko": "엔터프라이즈"},
    "Developers": {"vi": "Nhà phát triển", "ja": "開発者", "ko": "개발자"},
    "Resources": {"vi": "Tài nguyên", "ja": "リソース", "ko": "리소스"},
    "Changelog": {"vi": "Nhật ký thay đổi", "ja": "変更履歴", "ko": "변경 로그"},
    "Start here": {"vi": "Bắt đầu tại đây", "ja": "スタートガイド", "ko": "여기서 시작"},
    "Ways to work": {"vi": "Cách làm việc", "ja": "CloudThinker を使う", "ko": "CloudThinker 사용하기"},
    "Workspaces and organization": {"vi": "Tổ chức", "ja": "組織", "ko": "조직"},
    "Run anywhere": {"vi": "Triển khai", "ja": "デプロイメント", "ko": "배포"},
    "Billing": {"vi": "Thanh toán", "ja": "請求", "ko": "결제"},
    "Security and trust": {"vi": "Bảo mật", "ja": "セキュリティ", "ko": "보안"},
    "Identity and access": {"vi": "Danh tính và truy cập", "ja": "IDとアクセス", "ko": "ID 및 액세스"},
    "Governance": {"vi": "Quản trị", "ja": "ガバナンス", "ko": "거버넌스"},
    "APIs and integrations": {"vi": "API & Công cụ", "ja": "APIとツール", "ko": "API 및 도구"},
    "Connections": {"vi": "Kết nối", "ja": "接続", "ko": "연결"},
    "Learn": {"vi": "Học", "ja": "学ぶ", "ko": "배우기"},
    "Help": {"vi": "Trợ giúp", "ja": "ヘルプ", "ko": "도움말"},
    "Workshops": {"vi": "Workshop", "ja": "ワークショップ", "ko": "워크숍"},
    "Scenarios": {"vi": "Tình huống thực tế", "ja": "シナリオ", "ko": "시나리오"},
    "Memory": {"vi": "Bộ nhớ", "ja": "メモリ", "ko": "메모리"},
    "Automation": {"vi": "Tự động hóa", "ja": "自動化", "ko": "자동화"},
    "Artifacts and sharing": {"vi": "Artifacts & Dashboard", "ja": "アーティファクトとダッシュボード", "ko": "아티팩트 및 대시보드"},
}

en_block = DOCS["navigation"]["languages"][0]


def old_group(name):
    for t in en_block["tabs"]:
        for g in t.get("groups", []):
            if g.get("group") == name:
                return g
    return None


def flat(x, acc):
    if isinstance(x, str):
        acc.append(x)
        return
    for p in x.get("pages", []):
        flat(p, acc)


def group_pages(sec):
    """Keep the existing sub-grouping for Connections and Learn."""
    paths = [p["path"] for p in sec["pages"]]
    old = old_group(sec["group"])
    if sec["group"] in ("Connections", "Learn") and old:
        kept = set()
        flat(old, kept_list := [])
        kept = set(kept_list)
        out = [p for p in paths if p not in kept and not any(p == q for q in kept)]
        # existing structure first, filtered to pages still in the map
        def prune(node):
            if isinstance(node, str):
                return node if node in paths else None
            pages = [x for x in (prune(n) for n in node["pages"]) if x]
            return {"group": node["group"], "pages": pages} if pages else None
        body = [x for x in (prune(n) for n in old["pages"]) if x]
        return body + out
    return paths


tabs = {}
order = []
for sec in SITE["sections"]:
    if sec["tab"] not in tabs:
        tabs[sec["tab"]] = []
        order.append(sec["tab"])
    tabs[sec["tab"]].append({"group": sec["group"], "pages": group_pages(sec)})

pricing = next((t for t in en_block["tabs"] if "href" in t), None)
en_tabs = [{"tab": t, "groups": tabs[t]} for t in order]
if pricing:
    en_tabs.append(pricing)

have = set()
for lang in LANGS:
    for dirpath, _, files in os.walk(lang):
        for f in files:
            if f.endswith(".mdx"):
                have.add(os.path.join(dirpath, f)[:-4])


def localize(node, lang):
    if isinstance(node, str):
        loc = f"{lang}/{node}"
        return loc if loc in have else node
    if "href" in node:
        return {**node, "tab": {"vi": "Bảng giá", "ja": "料金", "ko": "요금"}.get(lang, node["tab"])}
    if "tab" in node:
        return {"tab": LABELS.get(node["tab"], {}).get(lang, node["tab"]), "groups": [localize(g, lang) for g in node["groups"]]}
    return {"group": LABELS.get(node["group"], {}).get(lang, node["group"]), "pages": [localize(p, lang) for p in node["pages"]]}


for block in DOCS["navigation"]["languages"]:
    lang = block["language"]
    block["tabs"] = en_tabs if lang == "en" else [localize(t, lang) for t in en_tabs]

# Redirects for retired pages, all languages; drop any redirect whose source is now a live page.
live = set()
for block in DOCS["navigation"]["languages"]:
    flat({"pages": [g for t in block["tabs"] for g in t.get("groups", [])]}, acc := [])
    live.update("/" + p for p in acc)
R = [r for r in DOCS.get("redirects", []) if r["source"] not in live]
srcs = {r["source"] for r in R}
for r in SITE["retired"]:
    for pre in ["", "/vi", "/ja", "/ko"]:
        s = f"{pre}/{r['old']}"
        t = f"{pre}/{r['redirect_to']}" if pre and os.path.exists(f"{pre[1:]}/{r['redirect_to']}.mdx") else f"/{r['redirect_to']}"
        if s not in srcs:
            R.append({"source": s, "destination": t})
            srcs.add(s)
m = {r["source"]: r["destination"] for r in R}
for r in R:
    d, seen = r["destination"], set()
    while d in m and d not in seen:
        seen.add(d)
        d = m[d]
    r["destination"] = d
DOCS["redirects"] = R

with open("docs.json", "w") as f:
    json.dump(DOCS, f, indent=2, ensure_ascii=False)
    f.write("\n")

# Remove retired English files.
for r in SITE["retired"]:
    p = f"{r['old']}.mdx"
    if os.path.exists(p):
        subprocess.run(["git", "rm", "-q", p], check=False)
print("assembled", sum(len(s["pages"]) for s in SITE["sections"]), "pages;", len(R), "redirects")
