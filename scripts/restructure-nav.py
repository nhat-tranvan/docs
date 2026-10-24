#!/usr/bin/env python3
"""Rebuild docs.json navigation around products (docs v2).

English is defined below. Each locale mirrors it: a page uses the locale's
own translation when one exists (``<lang>/<page>.mdx``), otherwise the English
page, which is what Mintlify did for untranslated pages before. Connections,
Resources and Pricing keep each locale's existing, already-translated groups.

Run from the repo root: python3 scripts/restructure-nav.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs.json")

# Tab and group labels per locale. English is the key.
L = {
    "Get started": {"vi": "Bắt đầu", "ja": "はじめに", "ko": "시작하기"},
    "Products": {"vi": "Sản phẩm", "ja": "プロダクト", "ko": "제품"},
    "Platform": {"vi": "Nền tảng", "ja": "プラットフォーム", "ko": "플랫폼"},
    "Enterprise": {"vi": "Doanh nghiệp", "ja": "エンタープライズ", "ko": "엔터프라이즈"},
    "Developers": {"vi": "Nhà phát triển", "ja": "開発者", "ko": "개발자"},
    "Changelog": {"vi": "Nhật ký thay đổi", "ja": "変更履歴", "ko": "변경 로그"},
    "Start here": {"vi": "Bắt đầu tại đây", "ja": "スタートガイド", "ko": "여기서 시작"},
    "Core concepts": {"vi": "Khái niệm cốt lõi", "ja": "基本概念", "ko": "핵심 개념"},
    "Ways to work": {"vi": "Cách làm việc", "ja": "CloudThinker を使う", "ko": "CloudThinker 사용하기"},
    "Investigation": {"vi": "Sự cố", "ja": "インシデント", "ko": "인시던트"},
    "Webhook integrations": {"vi": "Tích hợp Webhook", "ja": "Webhook連携", "ko": "Webhook 통합"},
    "Artifacts and sharing": {"vi": "Artifacts & Dashboard", "ja": "アーティファクトとダッシュボード", "ko": "아티팩트 및 대시보드"},
    "Memory": {"vi": "Bộ nhớ", "ja": "メモリ", "ko": "메모리"},
    "Automation": {"vi": "Tự động hóa", "ja": "自動化", "ko": "자동화"},
    "Workspaces and organization": {"vi": "Tổ chức", "ja": "組織", "ko": "조직"},
    "Run anywhere": {"vi": "Triển khai", "ja": "デプロイメント", "ko": "배포"},
    "Billing": {"vi": "Thanh toán", "ja": "請求", "ko": "결제"},
    "Security and trust": {"vi": "Bảo mật", "ja": "セキュリティ", "ko": "보안"},
    "Identity and access": {"vi": "Danh tính và truy cập", "ja": "IDとアクセス", "ko": "ID 및 액세스"},
    "Governance": {"vi": "Quản trị", "ja": "ガバナンス", "ko": "거버넌스"},
    "APIs and integrations": {"vi": "API & Công cụ", "ja": "APIとツール", "ko": "API 및 도구"},
}


def g(name, pages):
    return {"group": name, "pages": pages}


EN_TABS = [
    {
        "tab": "Get started",
        "groups": [
            g("Start here", ["index", "quickstart", "guide/tutorial/agenticops"]),
            g(
                "Core concepts",
                [
                    "guide/platform-model",
                    "guide/agents/overview",
                    "guide/harness",
                    "guide/modules",
                    "guide/activity",
                    "guide/glossary",
                ],
            ),
            g(
                "Ways to work",
                [
                    "guide/commands",
                    g(
                        "ChatOps",
                        [
                            "guide/slack-integration",
                            "guide/teams-integration",
                            "guide/google-chat-integration",
                        ],
                    ),
                    g(
                        "CLI",
                        [
                            "guide/cli/overview",
                            "guide/cli/authentication",
                            "guide/cli/agent",
                            "guide/cli/headless-chat",
                            "guide/cli/reference",
                        ],
                    ),
                ],
            ),
        ],
    },
    {
        "tab": "Products",
        "groups": [
            g(
                "Resolve",
                [
                    "guide/incident/overview",
                    g(
                        "Pulse",
                        [
                            "guide/pulse/overview",
                            "guide/pulse/setup",
                            "guide/pulse/clusters",
                            "guide/pulse/analytics",
                        ],
                    ),
                    g(
                        "Investigation",
                        [
                            "guide/incident/root-cause-analysis",
                            "guide/incident/manual-logging",
                            "guide/incident/insights",
                            "guide/incident/integrations",
                            g(
                                "Webhook integrations",
                                [
                                    "guide/incident/webhook-integrations/overview",
                                    "guide/incident/webhook-integrations/cloudwatch",
                                    "guide/incident/webhook-integrations/custom-source",
                                ],
                            ),
                            "guide/incident/runbooks",
                            "guide/incident/incident-memory",
                            "guide/incident/settings",
                        ],
                    ),
                    "guide/incident/detectors",
                ],
            ),
            g(
                "Review",
                [
                    "guide/code-review/overview",
                    "guide/code-review/setup",
                    "guide/code-review/provider-auth",
                    "guide/code-review/review-workspace",
                    "guide/code-review/mention-commands",
                    "guide/code-review/conflict-resolution",
                    "guide/code-review/convention-rules",
                    "guide/code-review/pipelines",
                    "guide/code-review/releases",
                    "guide/code-review/analytics",
                    "guide/code-review/extensions",
                ],
            ),
            g(
                "Cyber",
                [
                    "guide/security/cyber-overview",
                    "guide/security/pentest",
                    "guide/security/pentest-deep-dive",
                    "guide/security/cyber-findings",
                    "guide/security/cyber-reports",
                    "guide/security/captcha",
                ],
            ),
            g(
                "Optimize",
                [
                    "guide/cost-optimization/overview",
                    "guide/cost-optimization/analytics",
                    "guide/cost-optimization/recommendations",
                    "guide/cost-optimization/anomalies",
                    "guide/cost-optimization/reports",
                    "guide/cost-optimization/savings",
                ],
            ),
            g(
                "Customize",
                [
                    "guide/agents/customize",
                    g(
                        "Skills",
                        [
                            "guide/skills/overview",
                            "guide/skills/custom-skills",
                            "guide/skills/skill-format",
                        ],
                    ),
                    "guide/knowledge",
                    "guide/credentials",
                    "guide/notifications",
                    g(
                        "Approvals",
                        [
                            "guide/approvals/overview",
                            "guide/approvals/rules",
                            "guide/approvals/approval-mode",
                            "guide/approvals/approvers",
                        ],
                    ),
                ],
            ),
            g(
                "Automation",
                [
                    "guide/automation/automations",
                    "guide/automation/autonomous-agents",
                ],
            ),
            g("Memory", ["guide/memory", "guide/memory-dreaming"]),
            g("Artifacts and sharing", ["guide/artifacts/overview", "guide/sharing"]),
        ],
    },
    {
        "tab": "Platform",
        "groups": [
            "__CONNECTIONS__",
            g(
                "Workspaces and organization",
                [
                    "guide/organization",
                    "guide/workspaces",
                    "guide/workspace-users",
                    "guide/workspace-branding",
                ],
            ),
            g("Run anywhere", ["guide/workers", "guide/deployment/overview"]),
            g(
                "Billing",
                [
                    "guide/billing/pricing",
                    "guide/billing/usage",
                    "guide/billing/credit-limits",
                    "guide/billing/subscription",
                ],
            ),
        ],
    },
    {
        "tab": "Enterprise",
        "groups": [
            g(
                "Security and trust",
                [
                    "guide/security/overview",
                    "guide/security/data-protection",
                    "guide/security/custom-guardrails",
                    "guide/byok",
                ],
            ),
            g(
                "Identity and access",
                [
                    "guide/security/sso",
                    "guide/security/sso-saml",
                    "guide/security/sso-oidc",
                    "guide/security/scim",
                ],
            ),
            g("Governance", ["guide/security/audit-logs"]),
        ],
    },
    {
        "tab": "Developers",
        "groups": [
            g(
                "APIs and integrations",
                [
                    "guide/api/overview",
                    "guide/mcp/overview",
                    "guide/webhooks/overview",
                ],
            ),
        ],
    },
    "__RESOURCES__",
    {"tab": "Changelog", "groups": [g("Changelog", ["changelog"])]},
    "__PRICING__",
]


def find_tab(tabs, pred):
    for t in tabs:
        if pred(t):
            return t
    return None


def find_group(tabs, names):
    for t in tabs:
        for gr in t.get("groups", []):
            if gr.get("group") in names:
                return gr
    return None


def localize(node, lang, have):
    if isinstance(node, str):
        loc = f"{lang}/{node}"
        return loc if loc in have else node
    out = {"group": L.get(node["group"], {}).get(lang, node["group"])}
    out["pages"] = [localize(p, lang, have) for p in node["pages"]]
    return out


def build(lang, old_tabs):
    have = set()
    for dirpath, _, files in os.walk(os.path.join(ROOT, lang)) if lang != "en" else []:
        for f in files:
            if f.endswith(".mdx"):
                rel = os.path.relpath(os.path.join(dirpath, f), ROOT)[:-4]
                have.add(rel)
    conn = find_group(old_tabs, {"Connections", "Kết nối", "接続", "연결"})
    resources = find_tab(
        old_tabs, lambda t: t["tab"] in {"Resources", "Tài nguyên", "リソース", "리소스"}
    )
    pricing = find_tab(old_tabs, lambda t: "href" in t)
    tabs = []
    for t in EN_TABS:
        if t == "__RESOURCES__":
            tabs.append(resources)
            continue
        if t == "__PRICING__":
            tabs.append(pricing)
            continue
        groups = []
        for gr in t["groups"]:
            if gr == "__CONNECTIONS__":
                groups.append(conn)
            elif lang == "en":
                groups.append(gr)
            else:
                groups.append(localize(gr, lang, have))
        name = t["tab"] if lang == "en" else L.get(t["tab"], {}).get(lang, t["tab"])
        tabs.append({"tab": name, "groups": groups})
    return tabs


def main():
    with open(DOCS) as f:
        d = json.load(f)
    for lang_block in d["navigation"]["languages"]:
        lang = lang_block["language"]
        lang_block["tabs"] = build(lang, lang_block["tabs"])
    with open(DOCS, "w") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write("\n")


if __name__ == "__main__":
    main()
