# CloseGuardian MVP Plan

## Fixed Scope

Build a finance close command center for a finance ops analyst or close manager, with controller review for high-risk actions.

The demo scenario includes:

- A close-critical scheduled job failure caused by a transient dependency issue.
- A new product missing finance metadata mapping.
- Deterministic assessment of risk, readiness, approval requirements, and safe remediation boundaries.
- Server-side OpenAI synthesis for root cause, business impact, next-best actions, and controller-friendly updates.

## Feature Tiers

### Core Build

- Seeded close scenario data.
- Deterministic risk and readiness services.
- Nitro API routes for dashboard state, task detail, recommendations, approvals, evidence, and audit history.
- Nuxt command center UI.
- Server-side OpenAI synthesis.
- Approval queue and audit trail.
- Evidence search.
- Evaluation fixtures for deterministic rules and AI response shape.

### Learning Touch

- MCP-style connector abstraction.
- Skills/personas via typed agent configuration.
- Batch analysis endpoint for multiple close tasks.
- Basic image evidence support.
- Assistant-style agent configuration.
- Optional web search integration behind a disabled-by-default flag.

### Roadmap

- Audio briefings.
- Fine-tuning.
- ChatGPT Apps integration.
- Advanced multimodal evidence workflows.
- Production connectors, persistent storage, RBAC, and enterprise deployment controls.

## Implementation Order

1. Define shared domain types, contracts, and seed data.
2. Implement deterministic risk and readiness services.
3. Add repositories and connector interfaces over seeded data.
4. Expose core Nitro API routes.
5. Build the command center UI.
6. Add server-side OpenAI synthesis over structured deterministic inputs.
7. Implement approval queue and audit trail.
8. Add evidence search and minimal file support.
9. Add evaluations and learning-touch slices.

## Non-Goals For Initial Scaffold

- Business logic implementation.
- Production authentication or RBAC.
- Real ERP, scheduler, ServiceNow, Jira, or warehouse integrations.
- Client-side OpenAI usage.
- Unnecessary dependencies.
