# CloseGuardian Agent Guide

This repo is for the CloseGuardian Track 1 hackathon MVP.

## Product Posture

CloseGuardian is not a chatbot-first app. It is a close assurance command center that uses deterministic business services for high-risk decisions and OpenAI for bounded explanation, synthesis, and assisted review.

## Architecture Boundaries

- UI belongs in `app/pages`, `app/components`, and `app/composables`.
- API handlers belong in `server/api`.
- Deterministic risk and readiness logic belongs in `server/services/risk` and `server/services/readiness`.
- Approval behavior belongs in `server/services/approvals`.
- Agent coordination belongs in `server/services/orchestration`.
- Evidence retrieval and evidence metadata handling belongs in `server/services/evidence`.
- OpenAI calls belong only in `server/services/openai`.
- Evaluation fixtures and checks belong in `server/services/evaluations`.
- Source-system boundaries belong in `server/connectors`.
- Data access belongs in `server/repositories`.
- Seed data belongs in `server/data`.
- Shared types belong in `shared/domain`, `shared/contracts`, and `shared/agent-config`.

## MVP Agent Roles

- Close Orchestrator
- Retry Safety Agent
- Metadata Governance Agent
- Recurrence Intelligence Agent
- Controller Copilot

## Approval Boundaries

Allowed without approval:

- Notify owner.
- Surface blockers.
- Attach evidence.
- Recommend a plan.

Requires human approval:

- Rerun risky jobs.
- Mark risk accepted.
- Reopen a task.
- Override readiness.
- Apply metadata fix actions.

## Implementation Rules

- Keep tasks small and reviewable.
- Preserve separation between UI, API, services, agents, repositories, connectors, and shared types.
- Do not add dependencies unless the MVP slice requires them.
- Do not place secrets in client code or public runtime config.
- Favor typed contracts and deterministic services before OpenAI enrichment.
