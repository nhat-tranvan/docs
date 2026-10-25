#!/usr/bin/env python3
"""Products tab as a per-product switcher with task-based groups (docs v2).

The products render as anchors: a list at the top of the sidebar that is always
visible, so readers see every product and switch with one click.

Every language gets the same structure; a page uses <lang>/<page> when that
translation exists, otherwise the English page. Run from the repo root.
"""
import json
import os

MENU = [
    ("Resolve", "triangle-exclamation", [
        ("Get started", ["guide/incident/overview", "guide/incident/quickstart"]),
        ("Set up", ["guide/incident/integrations", "guide/pulse/setup", "guide/incident/webhook-integrations/overview",
                    "guide/incident/webhook-integrations/cloudwatch", "guide/incident/webhook-integrations/custom-source",
                    "guide/incident/settings"]),
        ("Work incidents", ["guide/pulse/overview", "guide/pulse/clusters", "guide/incident/root-cause-analysis",
                            "guide/incident/oncall", "guide/incident/runbooks", "guide/incident/manual-logging"]),
        ("Learn and improve", ["guide/incident/insights", "guide/pulse/analytics", "guide/incident/incident-memory"]),
        ("Help", ["guide/incident/troubleshooting", "guide/incident/detectors"]),
    ]),
    ("Review", "code-pull-request", [
        ("Get started", ["guide/code-review/overview", "guide/code-review/setup"]),
        ("Set up", ["guide/code-review/provider-auth", "guide/code-review/review-workspace",
                    "guide/code-review/convention-rules", "guide/code-review/extensions"]),
        ("Use Review", ["guide/code-review/mention-commands", "guide/code-review/conflict-resolution",
                        "guide/code-review/pipelines", "guide/code-review/releases"]),
        ("Insights and help", ["guide/code-review/analytics", "guide/code-review/troubleshooting"]),
    ]),
    ("Cyber", "shield-halved", [
        ("Get started", ["guide/security/cyber-overview", "guide/security/cyber-quickstart"]),
        ("Run tests", ["guide/security/pentest", "guide/security/pentest-deep-dive", "guide/security/captcha"]),
        ("Results", ["guide/security/cyber-findings", "guide/security/cyber-reports"]),
    ]),
    ("Optimize", "chart-line", [
        ("Get started", ["guide/cost-optimization/overview", "guide/cost-optimization/quickstart"]),
        ("Explore spend", ["guide/cost-optimization/analytics", "guide/cost-optimization/anomalies"]),
        ("Act on savings", ["guide/cost-optimization/recommendations", "guide/cost-optimization/savings",
                            "guide/cost-optimization/reports"]),
    ]),
    ("Customize", "sliders", [
        ("Get started", ["guide/agents/customize", "guide/agents/quickstart"]),
        ("Agents and skills", ["guide/skills/overview", "guide/skills/custom-skills", "guide/skills/skill-format",
                               "guide/knowledge"]),
        ("Approvals", ["guide/approvals/overview", "guide/approvals/rules", "guide/approvals/approval-mode",
                       "guide/approvals/approvers"]),
        ("Settings", ["guide/credentials", "guide/notifications"]),
    ]),
    ("Automation", "clock", [
        ("Automation", ["guide/automation/automations", "guide/automation/quickstart",
                        "guide/automation/autonomous-agents"]),
    ]),
]

# Memory and sharing are platform capabilities used by every product, so they
# live in the Platform tab, right after Workspaces and organization.
PLATFORM_GROUPS = [
    ("Memory", ["guide/memory", "guide/memory-dreaming"]),
    ("Artifacts and sharing", ["guide/artifacts/overview", "guide/sharing"]),
]
PLATFORM_TAB = {"en": "Platform", "vi": "Nền tảng", "ja": "プラットフォーム", "ko": "플랫폼"}

GROUP_L10N = {
    "Get started": {"vi": "Bắt đầu", "ja": "はじめに", "ko": "시작하기"},
    "Set up": {"vi": "Thiết lập", "ja": "セットアップ", "ko": "설정"},
    "Work incidents": {"vi": "Xử lý sự cố", "ja": "インシデント対応", "ko": "인시던트 처리"},
    "Learn and improve": {"vi": "Học và cải thiện", "ja": "学習と改善", "ko": "학습 및 개선"},
    "Help": {"vi": "Trợ giúp", "ja": "ヘルプ", "ko": "도움말"},
    "Use Review": {"vi": "Sử dụng Review", "ja": "Review を使う", "ko": "Review 사용"},
    "Insights and help": {"vi": "Phân tích và trợ giúp", "ja": "インサイトとヘルプ", "ko": "인사이트 및 도움말"},
    "Run tests": {"vi": "Chạy kiểm thử", "ja": "テストの実行", "ko": "테스트 실행"},
    "Results": {"vi": "Kết quả", "ja": "結果", "ko": "결과"},
    "Explore spend": {"vi": "Khám phá chi phí", "ja": "支出を確認", "ko": "지출 살펴보기"},
    "Act on savings": {"vi": "Tiết kiệm chi phí", "ja": "削減を実行", "ko": "절감 실행"},
    "Agents and skills": {"vi": "Agent và Skills", "ja": "エージェントとスキル", "ko": "에이전트 및 스킬"},
    "Approvals": {"vi": "Approvals", "ja": "Approvals", "ko": "Approvals"},
    "Settings": {"vi": "Cài đặt", "ja": "設定", "ko": "설정"},
    "Automation": {"vi": "Tự động hóa", "ja": "自動化", "ko": "자동화"},
    "Memory": {"vi": "Bộ nhớ", "ja": "メモリ", "ko": "메모리"},
    "Artifacts and sharing": {"vi": "Artifacts và chia sẻ", "ja": "アーティファクトと共有", "ko": "아티팩트 및 공유"},
    "Memory and sharing": {"vi": "Bộ nhớ và chia sẻ", "ja": "メモリと共有", "ko": "메모리 및 공유"},
}
PRODUCTS_TAB = {"en": "Products", "vi": "Sản phẩm", "ja": "プロダクト", "ko": "제품"}

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open("docs.json"))


def page(p, lang):
    if lang == "en":
        return p
    return f"{lang}/{p}" if os.path.exists(f"{lang}/{p}.mdx") else p


def label(text, lang):
    return text if lang == "en" else GROUP_L10N.get(text, {}).get(lang, text)


for block in d["navigation"]["languages"]:
    lang = block["language"]
    name = PRODUCTS_TAB[lang]
    menu = [
        {
            "anchor": item,
            "icon": icon,
            "groups": [{"group": label(g, lang), "pages": [page(p, lang) for p in pages]} for g, pages in groups],
        }
        for item, icon, groups in MENU
    ]
    for i, t in enumerate(block["tabs"]):
        if t.get("tab") == name:
            block["tabs"][i] = {"tab": name, "anchors": menu}
    for t in block["tabs"]:
        if t.get("tab") != PLATFORM_TAB[lang]:
            continue
        names = {label(g, lang) for g, _ in PLATFORM_GROUPS}
        groups = [g for g in t["groups"] if g.get("group") not in names]
        at = next(
            (i + 1 for i, g in enumerate(groups) if any(str(p).endswith("guide/organization") for p in g.get("pages", []))),
            len(groups),
        )
        t["groups"] = groups[:at] + [
            {"group": label(g, lang), "pages": [page(p, lang) for p in pages]} for g, pages in PLATFORM_GROUPS
        ] + groups[at:]

with open("docs.json", "w") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write("\n")

listed = {p for _, _, gs in MENU for _, ps in gs for p in ps}
print("products menu:", len(MENU), "items,", len(listed), "pages")
