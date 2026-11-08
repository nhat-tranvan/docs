# Cyber documentation figures

Captured on 2026-10-12 from the actual CloudThinker frontend components at release tag `0.23.8`, commit `66960032d9ae5b85fb844b6f3704ae4fde457034`.

These are browser screenshots of release components rendered in Storybook with illustrative demo data. They are not records of customer assessments. Capture fixtures supply example domains, test identities, findings, and query responses; they do not change the product components or styles. Findings are examples, not security claims about the named applications. No pentest, code audit, export, login, or other write operation was submitted.

PNG files use the light theme and a device scale factor of 2. Dialogs and the credential form are cropped to the rendered component. Figure 06 uses a compact capture with 32 CSS pixels of surrounding space; figure 07 includes 32 CSS pixels of padding and a subtle rounded frame around the run controls. The same English UI figures appear in the English, Vietnamese, Japanese, and Korean guides with localized captions.

| Figure | Release component / Storybook example |
| --- | --- |
| 01 Cyber overview | `CyberOverviewCapabilities`, `CyberActivityPanel`; Cyber overview / Populated |
| 02 Pentest target | `TargetsStep`; Setup / Domain Proof / Verified |
| 03 Pentest access | `TestUsersStepContent`, `CodeContextStepContent`; optional access inputs |
| 04 Verified domains | `CyberDomainManagerDialog`; verified and pending demo domains |
| 05 DNS proof | `CyberVerifyDomainDialog`; clearly illustrative ownership proof |
| 06 Scope | `ScopeSettingsSection`; Scope Settings Section / Viewer |
| 07 Run pentest | `PentestRunStep`; Context Attached |
| 08 Run workbench | `CyberRunsSection`; Runs / Workbench / Ready, with a single-result fixture |
| 09 OWASP breakdown | `OwaspMappingList`; OWASP Mapping / Findings And Scored |
| 10 Findings board | `FindingsWorkspace`; seven demo findings across all six columns |
| 11 Finding evidence | `FindingDetail`; demo invoice evidence with a redacted authorization placeholder |
| 12 Standard report | `FindingsReportExport`; Selected Findings / Report Styles, with two demo findings selected |
| 13 Test-user credentials | `AuthCredentialForm`; Authentication / Password / Ready, with demo identity metadata and an empty password |

When refreshing these assets, pin the requested release, render its components with demo fixtures, interact through the browser, and inspect every screenshot before replacing it. Keep figure filenames and guide references synchronized. Do not redraw controls or capture unreleased behavior as a released feature.

## CAPTCHA figures

Figures 14 and 15 were captured on 2026-10-13 from `AuthCaptchaFields` at product `develop` commit `470642d86a9a3279b6234fa0521948f0bf9e30b1` (SHA-256 `3c8d88339431c7d2986221653ca605e11a181e0d891a1f8b2413789942586680`). The exact component was rendered in the existing password-identity Storybook harness with release 0.23.8 dependencies. These figures show current CAPTCHA controls, not a login result or a live vendor challenge.

| Figure | Browser interaction |
| --- | --- |
| 14 CAPTCHA options | Expand CAPTCHA options; show None and Allow for this identity |
| 15 CAPTCHA test keys | Select Target test keys and hCaptcha; leave Installed test sitekey empty |

Screenshots are cropped to the CAPTCHA controls in the light theme at device scale factor 2. No credential, key, bypass secret, login, or pentest was submitted. The same English controls are used by the localized guides. Capture evidence includes the component hash, browser text, crop bounds, and an empty browser-error list.
