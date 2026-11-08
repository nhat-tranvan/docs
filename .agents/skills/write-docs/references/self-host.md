# Self-hosted services and self-hosted CloudThinker

Read this before you write a page for a service customers run inside their own network, such as
QRadar, PAN-OS, FortiGate, Wazuh, vCenter, or a database. Those services are often reachable only on a
private network, and some of their connections are offered only on self-hosted deployments of
CloudThinker.

## Hard rule

Public docs are read by CloudThinker Cloud (SaaS) customers first. Never tell them about:

- instance settings, instance configuration, or an instance admin;
- runtime settings, feature flags, rollout levels, or environment-variable keys;
- deployment internals: Helm values, cluster or service names, internal hostnames, images, executors,
  sandboxes;
- developer-only or operator-only commands and CLIs.

When a feature is gated, say **in beta**, or **contact CloudThinker**. Nothing more.

## Two meanings of "self-hosted"

Keep them apart. One term per concept.

| You mean | Write | Link |
|---|---|---|
| The customer runs the vendor's service on their own servers | "self-hosted Wazuh", "your QRadar console" | the vendor's docs for install and hosting |
| The customer runs CloudThinker itself in their own cloud or data center | "self-hosted deployment of CloudThinker", "your CloudThinker deployment" | `/guide/deployment/overview` |
| A machine the customer runs where the agent executes commands | "Worker" | `/guide/workers` |

Never call a Worker a self-hosted deployment in a connection page, and never imply a Worker makes a
connection private. The connections overview states the rule; link it instead of restating it.

## Who reads the page

- **CloudThinker Cloud customer.** Uses app.cloudthinker.io. Connections run from CloudThinker Cloud,
  so the service must accept connections from the internet, limited to CloudThinker's egress IPs.
- **Self-hosted deployment customer.** Uses CloudThinker inside their own perimeter. Connections start
  from their CloudThinker deployment, so the service needs a route from it, often a private one.
  Their CloudThinker deployment is set up during onboarding. The page never tells them how.

Both readers do the same thing on the page: create the credential and fill in the form. Write one page
for both. Do not fork the page by deployment, and do not add a per-connection self-host page.

## Availability: read it from the product, then map it

The product source says where a connection is offered. Find its rollout level in the backend's
connection runtime settings (search the connection key next to `BUILTIN_CONNECTION_ROLLOUT_LEVELS`).
Use the level to decide what the page says. Never print the level, the setting name, or the file.

| Rollout level in code | What the page says |
|---|---|
| `production` | Nothing. The connection is generally available. |
| `selfhost` | The availability note below, directly under the intro. |
| `local` or `dev` | Do not publish the page. Ask the user. |

"In beta" comes from the app, not from the rollout level: write it only when the product shows a Beta
badge for that feature, and then add `tag: "Beta"` to the frontmatter as the sibling pages do.

The availability note for a self-hosted-only connection, word for word, so pages stay consistent:

```mdx
<Note>
<Name> is available on [self-hosted deployments](/guide/deployment/overview) of CloudThinker. To use it on CloudThinker Cloud, [contact us](https://cloudthinker.io/contact).
</Note>
```

Even a self-hosted-only connection can be turned on for a Cloud customer after they contact us, so the
rest of the page must still work for a Cloud reader.

## Network reach

Describe what the reader must open, from their side. Name ports, protocols, and the vendor's own
allowlist field. Do not describe how CloudThinker routes, resolves, or proxies traffic.

- **One prerequisite bullet covers both readers.** Pattern:
  "An HTTPS path from CloudThinker to the console. On CloudThinker Cloud, allow CloudThinker's egress
  IPs (see [Reaching private services](/guide/connections/overview#reaching-private-services)). On a
  [self-hosted deployment](/guide/deployment/overview), allow your CloudThinker deployment."
- **Egress IPs.** The docs don't publish them. Reuse the established sentence: "These docs don't
  publish CloudThinker's egress IP list: ask your CloudThinker contact, or [contact us](https://cloudthinker.io/contact)."
- **Example addresses.** Use reserved names such as `qradar.example.internal`, a private address such
  as `10.1.2.3`, or the documentation range `203.0.113.0/24` for a public address. Never a real
  customer host or a CloudThinker internal host.
- **Vendor allowlists**, such as **Permitted IP Addresses** on PAN-OS or **Trusted Hosts** on FortiGate.
  Name the vendor's field and its UI path, checked against the vendor docs.
- **Management interfaces.** When the vendor advises against exposing the interface to the internet,
  say so and cite it. Then point to the private-route options. Never advise exposing a service with no
  authentication.

## TLS and certificates

On-prem consoles usually ship a self-signed or internal-CA certificate.

- Explain the connection's own TLS field by its on-screen label and options (for example **Skip SSL
  verification** / **Verify SSL certificate**). State its default exactly as the product source sets it.
- Say what skipping costs in one sentence: traffic stays encrypted, but an impostor can't be detected.
- Tell the reader the fix on their side: install a certificate from a trusted certificate authority on
  the service, then switch to verification.
- Do not mention instance-wide CA bundles, trust stores, or any setting the reader cannot see in the
  connection form. If a customer needs a private CA trusted, they contact CloudThinker.

## Proxies

- Document a proxy only when the connection form has a proxy field. Use its label.
- Otherwise say nothing about outbound proxies. If the product source shows the connection refuses
  redirects, say that in plain words ("CloudThinker doesn't follow redirects, so the token isn't sent
  anywhere else") and tell the reader to enter the service's exact address.
- A reverse proxy or load balancer in front of the service is the reader's network. Say the address must
  reach the service's API root, as the connection test checks it.

## Where self-host notes go

| Content | Place |
|---|---|
| Availability (self-hosted only, beta) | One `<Note>` directly under the intro |
| Network reach, allowlists, ports | One `## Prerequisites` bullet |
| TLS field and its trade-off | `## Connection details`, under the field table |
| Unreachable, untrusted certificate, wrong address | `## Troubleshooting`, one accordion per product message |
| Exposure and allowlist advice | `## Security`, at most one bullet |
| Deployment-level content (sizing, topology, onboarding) | Never on a connection page. It lives under `/guide/deployment/` and is confirmed during onboarding. |

## Checklist

- [ ] No instance settings, instance admin, runtime settings, feature flags, rollout levels,
      environment-variable keys, or developer commands anywhere on the page.
- [ ] Availability matches the product's rollout level, using the exact note above or "in beta".
- [ ] "Self-hosted" always says whose: the vendor's service or a self-hosted deployment of CloudThinker.
- [ ] The prerequisite on network reach works for both a Cloud and a self-hosted reader.
- [ ] Egress-IP wording reuses the established sentence; nothing invents an IP list.
- [ ] Every vendor allowlist field and certificate step is checked against the vendor docs.
- [ ] The TLS default matches the product source, and the table example matches the default.
- [ ] Each network or TLS troubleshooting title is a message the product can return.
- [ ] No install, sizing, or hosting steps for the vendor's service or for CloudThinker.
