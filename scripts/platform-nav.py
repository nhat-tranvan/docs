#!/usr/bin/env python3
"""Platform tab mirrors the app's settings: Connections, Customize, Approvals,
Workspace settings, Admin Settings, Run anywhere, Artifacts and sharing.
Connections keeps its existing per-category groups. Run after products-menu.py."""
import json
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open("docs.json"))

GROUPS = [
    ("Customize", ["guide/agents/customize", "guide/agents/quickstart", "guide/skills/overview",
                   "guide/skills/custom-skills", "guide/skills/skill-format", "guide/knowledge"]),
    ("Approvals", ["guide/approvals/overview", "guide/approvals/rules", "guide/approvals/approval-mode",
                   "guide/approvals/approvers"]),
    ("Workspace settings", ["guide/workspace-settings", "guide/workspaces", "guide/workspace-users",
                            "guide/workspace-branding", "guide/credentials", "guide/notifications",
                            "guide/memory", "guide/memory-dreaming"]),
    ("Admin Settings", ["guide/admin-settings", "guide/organization", "guide/capabilities",
                        "guide/billing/pricing", "guide/billing/subscription", "guide/billing/usage",
                        "guide/billing/credit-limits"]),
    ("Run anywhere", ["guide/workers", "guide/deployment/overview"]),
    ("Artifacts and sharing", ["guide/artifacts/overview", "guide/sharing"]),
]
L10N = {
    "Customize": {}, "Approvals": {},
    "Workspace settings": {"vi": "Cài đặt workspace", "ja": "ワークスペース設定", "ko": "워크스페이스 설정"},
    "Admin Settings": {"vi": "Admin Settings", "ja": "Admin Settings", "ko": "Admin Settings"},
    "Run anywhere": {"vi": "Triển khai", "ja": "デプロイメント", "ko": "배포"},
    "Artifacts and sharing": {"vi": "Artifacts và chia sẻ", "ja": "アーティファクトと共有", "ko": "아티팩트 및 공유"},
}
TAB = {"en": "Platform", "vi": "Nền tảng", "ja": "プラットフォーム", "ko": "플랫폼"}
CONN = ("Connections", "Kết nối", "接続", "연결")


def loc(p, lang):
    return f"{lang}/{p}" if lang != "en" and os.path.exists(f"{lang}/{p}.mdx") else p


for block in d["navigation"]["languages"]:
    lang = block["language"]
    for t in block["tabs"]:
        if t.get("tab") != TAB[lang]:
            continue
        conn = [g for g in t["groups"] if g["group"] in CONN]
        t["groups"] = conn + [
            {"group": g if lang == "en" else L10N[g].get(lang, g), "pages": [loc(p, lang) for p in pages]}
            for g, pages in GROUPS
        ]

with open("docs.json", "w") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("platform:", len(GROUPS) + 1, "groups")
