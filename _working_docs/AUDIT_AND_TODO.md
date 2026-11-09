# Audit and todo

Updated 2026-11-08. Application is not implemented. The plan tracks future feature work; this audit tracks specific gaps/risks, not falsely completed features.

| ID | State | Gap / root cause | Owner / planned action | Closure evidence required |
|---|---|---|---|---|
| GAP-001 | CLOSED | Repository had no committed requirements or execution roadmap. | Planning session: preserve attachments and create detailed session plan. | Source equality, plan completeness, link/secret checks and committed docs; see implementation log. |
| GAP-002 | OPEN — blocks S05 pricing | Original length-only ink intent conflicts with spec stroke-count/width costs. | Owner clarification before S05. Original idea takes precedence unless explicitly amended. | Owner answer recorded in decisions and matching pricing tests. |
| GAP-003 | OPEN — S19–S21 | Browser/CORS/model/image provider capabilities are unverified. | Verify authoritative docs and real browser calls; hide unsupported adapters without proxy. | Dated capability matrix and authorized live smoke results, or explicit exclusion reason. |
| GAP-004 | OPEN — S01/S04/S09/S30/S36 | Upstream existence/licenses/compatibility and audio rights unverified. | Audit before each reuse; write precise notices. | Source commit/path/license and compatibility checks. |
| GAP-005 | OPEN — S35/S39 | Device/performance/memory budgets have no measurements. | Profile required workloads and soak; record missing-device blockers. | Actual device reports and passed budget gates. |
| GAP-006 | OPEN — S32/S33, owner | Production collection endpoint, deletion service and legal approval do not exist. | Keep endpoint empty and uploads disabled; test contract only; owner supplies service later. | Consent/legal approval and real endpoint security/deletion smoke before enabling; not required for local-only release. |
| GAP-007 | OPEN — S38/S39 | No app build or GitHub Pages deployment exists. | Implement build/workflow and verify settings/permissions after owner approval. | Live production subpath test and successful Actions deployment. |
| GAP-008 | OPEN — S11–S13 | Storage eviction, lifecycle loss and malformed import recovery not implemented. | Transactions, backup, quota UI, migrations and bounded archives. | Failure-injection/round-trip/reload/catch-up tests. |
| GAP-009 | OPEN — S02/S22/S26 | Identity continuity, Trait Card completeness and image safety are not implemented. | Complete schemas (including omitted ancestry/runtime fields); conservative validators and safe fallback. | Adversarial schemas/images and continuity tests. |
| GAP-010 | OPEN — S34 | Economy/carrying capacity and recovery grant thresholds are starting assumptions. | Run seeded archetypes and tune centrally, including anti-spam rewards. | Reproducible harness reports and failure demonstrations. |

GAP-003/004/005/007–010 are future implementation/release gates, not failures of a completed game. Live AI tests require player-controlled credentials/authorization; no keys are requested in chat or stored in Git.
