# Pulse — Source Material for Docs

> Consolidated reference for writing the Pulse section under the Mintlify "Features" tab. Delete this file once the MDX docs ship.

---

## 1. Elevator Pitch (use in overview front-matter)

**One-liner**: Pulse turns the firehose of cloud signals — Slack/Teams chatter, AWS CloudTrail, Health, Cost Anomaly, GuardDuty, Config, Access Analyzer, custom webhooks — into a small ranked list of *things you should care about*, with AI suppression, correlation, classification, and one-click escalation to an Incident with auto-RCA.

**Positioning** (anti-AWS-Console, anti-PagerDuty-noise):
- PagerDuty/Opsgenie route alerts; Pulse first decides which alerts matter.
- Datadog Watchdog correlates; Pulse correlates **and** suppresses noise **and** auto-classifies severity/category via LLM.
- AWS Console scatters CloudTrail, Health, Cost Anomaly, GuardDuty across 6 tabs; Pulse fuses them into one timeline.

**Pillars** (good for "What Makes This Different" Cards):
1. **Noise reduction** — 7-stage suppression chain (dedup, rate-limit, snooze, flapping, cascade, noise signature, severity normalization). Typical reduction: events → signals → clusters → incidents shown live in the Pipeline panel.
2. **Auto-correlation** — time-window + service-name grouping into Clusters with confidence scores.
3. **LLM enrichment** — auto-assigns category, severity, actionability, and a one-line summary.
4. **One-click escalation** — Cluster → Incident → auto-RCA, with critical-severity bypass (skips 60s debounce).
5. **Multi-channel ingestion** — Slack, Teams, custom webhooks, AWS pollers, all unified.

---

## 2. Recommended Docs Structure

Add a new group **"Pulse"** under the **Features** tab in `docs.json`, placed between **Code Review** and **Infrastructure** (or right above **Incident** — Pulse feeds incidents).

```
guide/pulse/
├── overview.mdx                 # What is Pulse, why, what makes it different (icon: wave-pulse)
├── how-it-works.mdx             # End-to-end pipeline: ingest → filter → suppress → correlate → classify → route
├── signal-sources.mdx           # Slack, Teams, webhooks, AWS pollers (CloudTrail/Health/Cost Anomaly/GuardDuty/Config/Access Analyzer)
├── clusters.mdx                 # Clusters, correlation, status lifecycle, ack/assign/claim, escalate-to-incident
├── suppression.mdx              # 7-stage chain explained; snooze (signal/pattern/resource scopes); humanized reasons
├── subscriptions.mdx            # Slack/Teams channel subscriptions, filter_config, channel_type
├── polling.mdx                  # Enable AWS pollers per connection, validate, bulk toggle, auto-pause
└── analytics.mdx                # Stats, timeseries, lifecycle, KPIs, heatmap, top-noisy-sources
```

`docs.json` snippet:

```json
{
  "group": "Pulse",
  "pages": [
    "guide/pulse/overview",
    "guide/pulse/how-it-works",
    "guide/pulse/signal-sources",
    "guide/pulse/clusters",
    "guide/pulse/suppression",
    "guide/pulse/subscriptions",
    "guide/pulse/polling",
    "guide/pulse/analytics"
  ]
}
```

Cross-links to add elsewhere:
- `guide/incident/overview.mdx` — mention Pulse as the upstream funnel.
- `guide/connections/aws.mdx` — mention CloudTrail/Health/Cost-Anomaly polling lives in Pulse.
- `guide/slack-integration.mdx` and `guide/teams-integration.mdx` — link to Pulse subscriptions.
- `llms.txt` — add a `## Pulse` section with all 8 entries.

---

## 3. Concept Glossary (use as inline definitions / Accordion)

| Term | Meaning |
|---|---|
| **Signal** | A normalized operational event (one row in `pulse_signal`). Has source, type, category, severity, title, resource, timestamp, dedup_hash. |
| **Source** | Where the signal came from: `aws.cloudtrail`, `aws.health`, `aws.cost_anomaly`, `slack`, `teams`, `webhook`, etc. |
| **Category** | What it's about: Compute, Network, Security, Deploy, Communication, Cost, Data, Unclassified. Pre-assigned by collectors or LLM-classified. |
| **Severity** | Critical, High, Medium, Low, Info. May start null and be filled in by LLM. `raw_severity` keeps the source's claimed value for audit. |
| **Cluster** | A group of correlated signals (`pulse_signal_cluster`). Has a status, signal_count, optional title/summary, optional incident link, optional investigating agent or assignee. |
| **Cluster status** | `forming` → `active` → `routed` (escalated to incident) → `resolved`. |
| **Suppression** | Marking a signal as noise. Stored (suppressed=true) but hidden by default. Reasons: duplicate, rate_limited, snoozed, flapping, cascade, llm_not_actionable, noise_signature, severity_normalized. |
| **Routing** | Sending a cluster to a target — incident creation, notification, etc. |
| **Subscription** | A Slack/Teams channel opted into receiving Pulse signals, with optional filter_config (regex patterns, bot exclusions). |
| **Polling config** | Per-(connection, source_type) toggle for AWS pollers. Auto-pauses after consecutive failures. |

---

## 4. The Pipeline (the heart of the feature)

End-to-end path of one event from arrival to incident. Use this as the spine of `how-it-works.mdx` with a Mermaid or numbered Steps component.

```
Raw Event (Slack message / Teams activity / AWS API response / webhook payload)
        │
        ▼
[1] COLLECTOR  — normalize into Signal shape (source-specific)
        │       e.g. cloudtrail_collector, slack_collector, webhook_collector
        ▼
[2] DEDUP      — Redis-backed SHA-256 hash; bumps dedup_count if seen
        │
        ▼
[3] FILTER CHAIN  — drop based on subscription, regex patterns, bot exclusions
        │
        ▼
[4] SUPPRESSION CHAIN  (7 layers, in order):
        │   ① dedup_suppressor       (already deduped above; double-check)
        │   ② rate_limit_suppressor  (per-signal-key rate cap)
        │   ③ snooze_suppressor      (manual snooze: signal/pattern/resource scope)
        │   ④ noise_signature_suppressor (regex-matched known-noise patterns)
        │   ⑤ flapping_suppressor    (oscillation detection)
        │   ⑥ cascade_suppressor     (parent already suppressed → suppress children)
        │   ⑦ severity_normalization_suppressor (downgrade overclaimed severities)
        │
        ▼
[5] PERSIST    — write to pulse_signal table (suppressed=true if any layer fired)
        │
        ▼  (only if NOT suppressed; async via Celery 'low' queue)
[6] CORRELATE  — find recent signals (15-min window) matching by title+resource_id
        │       fallback: service-name correlator. Creates/joins pulse_signal_cluster.
        ▼
[7] CLASSIFY   — LLM (Claude or Gemini) assigns category, severity, is_actionable,
        │       reasoning, summary. Tries cluster-match first, then plain classify.
        ▼
[8] ROUTE      — evaluate routing rules. If actionable + severity threshold met:
                 → Incident creation (auto-RCA)
                 → Notification (Slack/Teams)
                 Critical-severity bypass: skip 60s debounce.
```

### Producers (where Pulse signals come from)

| Producer | Code path | Trigger |
|---|---|---|
| **Slack middleware** | `platforms/slack/handlers/events.py` | Bolt event listener (3-sec ack window) |
| **Teams middleware** | `platforms/teams/webhook.py` | Bot Framework middleware |
| **Custom webhook** | `features/webhooks/use_cases/trigger_webhook_use_case.py:219` | User-configured webhook hits `ingest_pulse_signal()` |
| **CloudTrail poller** | Celery `pulse_tasks.polling_worker` (5-min cadence) | `cloudtrail_collector` |
| **AWS Health poller** | same (5-min cadence) | `aws_health_collector` |
| **AWS Cost Anomaly poller** | same (6-hour cadence) | `aws_cost_anomaly_collector` |
| **AWS GuardDuty / Config / Access Analyzer pollers** | same (periodic) | respective collectors |

Public contract: `app.features.pulse.contracts.ingest_pulse_signal(workspace_id, source_type, raw_event, ...)` — the single entry point for all producers.

---

## 5. UX Surface (what users see in the app)

Frontend lives at `frontend/app/(home)/incidents/pulse/page.tsx`, with feature module at `frontend/features/pulse/` (~8k LOC, 70+ components).

### Main page layout
- **Header**: title, date-range picker (1h / 3h / 6h / 12h / 24h / 3d / 7d **default** / 14d / 30d / custom), live indicator badge.
- **Pipeline panel** (sidebar / top): 4-stage funnel — **Raw Events → Signals → Clusters → Incidents** — with running counts and "noise reduction %".
- **Filter chips**: severity[], source[], category[], cluster_status[], `needs_attention`, `show_suppressed`, freetext search.
- **Feed**: infinite-scroll, grouped by severity. Two card types — `PulseSignalCard` (single signal) and `PulseGroupCard` (cluster with status badge, signal count, assignee avatar, escalate/resolve actions).
- **Detail drawer**: right-side panel with three tabs — **Overview** (title, summary, timeline, assignee, ack info, escalation form), **Routing** (where it went), **Raw** (full payload).
- **Banners**: "Pulse needs you" (unack'd critical/high in window), "Stale ingest" (no recent events), "Quiet" empty state.

### User-visible labels (lift verbatim — these match the UI)

**Severities**: Critical · High · Medium · Low · Info

**Categories**: Compute · Network · Security · Deploy · Communication · Cost · Data · Unclassified

**Cluster statuses**: Active · Forming · Routed · Resolved

**Suppression reason labels** (humanized for users):
- `duplicate` → "duplicates"
- `rate_limited` → "rate limit"
- `snoozed` → "snooze"
- `flapping` → "alert storms"
- `cascade` → "related silenced"
- `llm_not_actionable` → "not actionable"
- `noise_signature` → "noise"
- `severity_normalized` → "downgraded"

**Time windows**: "Last 1 hour" · "Last 3 hours" · "Last 6 hours" · "Last 12 hours" · "Last 24 hours" · "Last 3 days" · **"Last 7 days" (default)** · "Last 14 days" · "Last 30 days"

### Top components by user-facing job

| User job | Component(s) |
|---|---|
| Skim what's happening now | `pulse-feed`, `pulse-feed-section`, `pulse-signal-card`, `pulse-group-card` |
| See pipeline efficiency | `pulse-pipeline-panel`, `pulse-pipeline-flow`, `pulse-noise-reduction-tile`, `pulse-suppressed-tile` |
| Drill into one signal/cluster | `pulse-detail-panel` + `overview-tab`, `routing-tab`, `raw-tab`, `cluster-context-section`, `suppression-chain-block` |
| Take action | `signal-snooze-button`, `pulse-cluster-inline-actions`, `escalate-cluster-dialog`, `resolve-cluster-dialog`, `pulse-cluster-assign-control` |
| Filter / focus | `pulse-filter-popover`, `pulse-applied-filter-chips`, `pulse-active-all-toggle`, `pulse-needs-you-banner` |
| Manage subscriptions | `subscription-card`, `subscription-form-dialog` |
| Manage polling | `continuous-polling-section` |
| Analytics tab | `pulse-analytics-kpis`, `pulse-cluster-lifecycle-chart`, `pulse-conversion-heatmap`, `pulse-suppression-timeseries`, `pulse-signal-volume-section`, `pulse-top-noisy-sources-table` |

---

## 6. Cluster Lifecycle (good for a Mermaid diagram)

```
                 first signal arrives
                         │
                         ▼
                    ┌─────────┐
                    │ FORMING │  (correlator collecting members)
                    └────┬────┘
                         │ second matching signal
                         ▼
                    ┌────────┐
                    │ ACTIVE │  (signals continuing to land)
                    └────┬───┘
                         │
            ┌────────────┴────────────┐
            │                         │
   user clicks Escalate         user clicks Resolve
   → creates Incident           → terminal state
   → auto-triggers RCA                  │
            │                           ▼
            ▼                      ┌──────────┐
       ┌────────┐                  │ RESOLVED │
       │ ROUTED │                  └──────────┘
       └────────┘
```

Per-cluster fields users can set:
- **Acknowledged** — `acknowledged_at`, `acknowledged_by_user_id`. Marks "I've seen this." Reversible.
- **Assigned** — `assigned_to_user_id`, `assigned_at`. Hand it to a teammate.
- **Claimed by agent** — `investigating_agent_id`, `investigation_started_at`. An agent (e.g., Alex, Oliver) is investigating.

---

## 7. Suppression Deep Dive (for `suppression.mdx`)

The 7 layers run in priority order. First match wins; signal is stored with `suppressed=true` and the matching `suppressed_reason`.

| # | Layer | What it catches | Tunable? |
|---|---|---|---|
| 1 | `dedup_suppressor` | Same SHA-256 hash within window | No (always on) |
| 2 | `rate_limit_suppressor` | Same signal-key over rate threshold | No (system default) |
| 3 | `snooze_suppressor` | Manual snoozes by user | **Yes** — Snooze API |
| 4 | `noise_signature_suppressor` | Known-noise regex patterns | Curated; user-extensible (roadmap) |
| 5 | `flapping_suppressor` | Signal oscillating within window | No |
| 6 | `cascade_suppressor` | Parent already suppressed | No |
| 7 | `severity_normalization_suppressor` | Downgrades overclaimed severities | No |

### Snooze (the only user-facing suppression action)

`POST /workspaces/{ws}/pulse/signals/{signal_id}/snooze`

| Field | Type | Notes |
|---|---|---|
| `duration_minutes` | int 1–43200 | Up to 30 days |
| `scope` | `signal` \| `pattern` \| `resource` | Default `signal` |

Scopes:
- **signal** — silence this exact signal only.
- **pattern** — silence similar signals (same title/source/type pattern).
- **resource** — silence all signals from this resource_id.

`DELETE` to unsnooze (idempotent).

---

## 8. API Surface (for `analytics.mdx` + an optional API reference page)

All routes scoped under `/workspaces/{workspace_id}/pulse/...`. All require `PULSE_VIEW` for reads, `PULSE_MANAGE` or `INCIDENTS_EDIT` for writes.

### Reads
| Endpoint | Returns |
|---|---|
| `GET /timeline` | flat list of signals, cursor-paginated |
| `GET /timeline-grouped` | clusters as primary items, with optional children expansion + agent_handling sidebar |
| `GET /signals/{id}` | full signal detail |
| `GET /groups/{group_id}/signals` | members of a correlation group |
| `GET /clusters/{id}` | cluster row + aggregates (member_count, suppressed_count, max_dedup_count) |
| `GET /stats` | by_source, by_severity, by_category, totals, suppressed breakdown, conversion %s |
| `GET /stats/timeseries` | volume buckets (5m/1h/1d), by_severity per bucket |
| `GET /stats/clusters/lifecycle` | cluster status counts per bucket |
| `GET /stats/suppression/timeseries` | suppression reasons per bucket |
| `GET /stats/top-noisy-sources` | sources ranked by volume + suppression % |
| `GET /stats/conversion-heatmap` | hour × day-of-week routed/signals rate |
| `GET /stats/kpis` | correlation_yield_pct, mtt_resolve_seconds, resolved_clusters_count |
| `GET /stats/summary` | all of the above in one response (single cache hit) |
| `GET /subscriptions` | list channel subscriptions |
| `GET /polling/configs` | list polling configs |
| `GET /polling/connections` | AWS connections + polling status |

### Writes
| Endpoint | Action |
|---|---|
| `POST /clusters/{id}/escalate` | create Incident, auto-RCA |
| `POST /clusters/{id}/resolve` | mark resolved |
| `POST /clusters/{id}/ack` · `DELETE …/ack` | toggle acknowledged |
| `POST /clusters/{id}/claim` | agent claims investigation |
| `POST /clusters/{id}/assign` · `DELETE …/assign` | user assignment |
| `POST /signals/{id}/snooze` · `DELETE …/snooze` | snooze with scope + duration |
| `POST /subscriptions` · `PUT /{id}` · `DELETE /{id}` | CRUD subscriptions |
| `POST /polling/validate` | dry-run a polling config (creds + perms) |
| `PUT /polling/configs` · `POST /polling/configs/bulk` | toggle pollers |

### Common filter params (most read endpoints)
`from`, `to`, `source[]`, `severity[]`, `category[]`, `search`, `show_suppressed`, `cluster_status[]`, `needs_attention`, `granularity` (timeseries only), `cursor`, `limit`.

---

## 9. Polling — AWS Sources (for `polling.mdx`)

`PollingSourceType` enum:
- `CLOUDTRAIL` — control-plane API call audit (5-min cadence)
- `AWS_HEALTH` — AWS Health Dashboard events (5-min)
- `AWS_COST_ANOMALY` — Cost Anomaly Detector findings (6-hour)
- `AWS_GUARDDUTY` — threat detection findings
- `AWS_ACCESS_ANALYZER` — IAM access findings
- `AWS_CONFIG` — config rule violations

Per-(connection, source_type) row in `pulse_polling_config`:
- `enabled` — user toggle
- `consecutive_failures` — incremented on poll failure
- `last_error_code`, `last_error_at` — surfaced to UI for debugging
- `auto_paused` — true after N consecutive failures; user must re-enable

Validate-before-enable: `POST /pulse/polling/validate` returns `{ ok, error_code, message }`. Error codes are stable for client parsing (e.g. `AccessDenied`, `InvalidCredentials`).

---

## 10. Subscriptions (for `subscriptions.mdx`)

`pulse_channel_subscription` row per (workspace, platform, channel_id):

| Field | Notes |
|---|---|
| `platform` | `slack`, `teams` (also `webhook` in enum) |
| `channel_id` | Slack channel ID / Teams conversation ID |
| `channel_name` | Display name |
| `enabled` | Toggle |
| `channel_type` | `alert` / `communication` / `mixed` (default) — drives how the collector handles bot messages |
| `filter_config` | `{ patterns: [regex…], exclude_bots: [bot_id…] }` |

Auto-subscribe: workspace flag `pulse_auto_subscribe` (default **false** — was changed from true; see migration `b5c723eb6dde`). When true, every Slack channel the bot joins becomes a subscription automatically.

---

## 11. Data Model (one-liner for each table)

| Table | Purpose |
|---|---|
| `pulse_signal` | Core signal row. Indexed on (workspace_id, timestamp/source/severity/category/correlation_group_id/suppressed). |
| `pulse_signal_cluster` | Correlated group. Holds RCA dispatch tracking, ack/assign/investigating fields, optional incident_id FK. |
| `pulse_channel_subscription` | Slack/Teams opt-in config. Unique per (workspace, platform, channel_id). |
| `pulse_polling_config` | AWS poller toggle. Unique per (workspace, connection_id, source_type). |
| `pulse_ingestion_counter` | Hourly count per workspace (Redis-buffered, flushed to DB). Powers "events ingested" metric. |
| `pulse_llm_retry_queue` | Backlog for failed classification jobs. |

---

## 12. Cross-Feature Hooks (mention in overview / how-it-works)

**Pulse → Incidents**: `escalate_cluster_use_case.py` calls into Incidents via `contracts.py`, creates an Incident with metadata bridge, sets cluster.status = ROUTED, auto-triggers RCA.

**Pulse → Multi-Agent system**: agents can search signals via `@tool` `pulse_search_signals` (`backend/app/modules/multi_agents/tools/pulse/`). Cluster context is injected into agent prompts when investigating (see `prompt_manager.py:584`).

**Pulse → Notifications**: routed signals fire `notify_signal_routed_task` (Celery), which delivers to Slack/Teams via existing notification rails.

**Webhooks → Pulse**: the existing webhook system (`features/webhooks`) routes incident-style webhooks through Pulse first, so they get the same dedup/suppression/correlation treatment before becoming an Incident.

---

## 13. Suggested copy hooks (for "What Makes This Different")

- "Most tools detect. Pulse decides what's worth waking you for."
- "From 10,000 events to 1 incident — in one screen, with the math shown."
- "Snooze a signal, a pattern, or a whole resource — for an hour or 30 days."
- "Critical-severity signals skip the queue. Everything else gets correlated, classified, and ranked first."
- "AWS Console makes you stitch CloudTrail + Health + Cost Anomaly + GuardDuty by hand. Pulse fuses them on arrival."

---

## 14. Open questions / gaps to fill while writing

- [ ] Confirm exact retention default (`SIGNAL_RETENTION_DAYS_DEFAULT`) — code says 90 days; UI shows none. Mention in overview?
- [ ] Confirm RCA debounce window — code references 60s; verify before claiming in copy.
- [ ] Are noise-signature patterns user-editable today, or curated-only? (`noise_signature_suppressor.py` worth a 30s read.)
- [ ] Permission model: `PULSE_VIEW` vs `PULSE_MANAGE` vs `INCIDENTS_EDIT` — confirm which roles get each by default; reference the [Workspace Users](../../guide/workspace-users) doc.
- [ ] Screenshots needed (place under `images/pulse/`):
  - `01-pulse-feed.png` — main feed with severity sections
  - `02-pipeline-panel.png` — events → signals → clusters → incidents funnel
  - `03-detail-drawer-overview.png` — drawer overview tab
  - `04-snooze-menu.png` — signal/pattern/resource scope picker
  - `05-escalate-dialog.png` — escalate-to-incident dialog
  - `06-subscriptions.png` — subscription list + form
  - `07-polling.png` — AWS polling config table
  - `08-analytics.png` — KPIs + heatmap + top noisy sources
