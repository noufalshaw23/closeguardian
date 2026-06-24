# CloseGuardian

CloseGuardian is an agentic close assurance platform for enterprise finance teams. The MVP is a finance close command center for finance ops analysts and close managers, with controller review for high-risk actions.

The product monitors close tasks, scheduled jobs, dependency health, incident history, metadata issues, approval workflows, and supporting evidence. Critical decisions stay deterministic; OpenAI is used server-side for explanation, synthesis, and bounded reasoning over structured inputs.

## MVP Scope

- Generic enterprise close command center with one revenue-impacting scenario.
- Deterministic risk, readiness, rerun safety, approval requirement, and escalation logic.
- Server-side OpenAI synthesis for close summaries, likely root cause, recommended next actions, and controller-friendly updates.
- Approval queue for risky remediation actions.
- Evidence search over seeded and uploaded support files.
- Audit trail for recommendations, approvals, and agent activity.

## Architecture

- `app/` contains Nuxt pages, components, and composables.
- `server/api/` contains Nitro routes.
- `server/services/` contains deterministic services, orchestration services, evidence services, OpenAI integration, and evaluations.
- `server/connectors/` contains connector abstractions for seeded or external source systems.
- `server/repositories/` contains data access boundaries.
- `server/data/` contains MVP seed data.
- `shared/` contains typed domain models, API contracts, and agent configuration.

## Safety Principles

- OpenAI API usage is server-side only.
- Do not expose secrets through client runtime config.
- High-risk close decisions must be deterministic and auditable.
- Agents may explain, synthesize, recommend, and prepare actions, but approval boundaries remain explicit.
