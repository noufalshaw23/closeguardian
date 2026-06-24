# CloseGuardian Evaluations

This folder contains a lightweight evaluation harness for the MVP.

The evaluations intentionally reinforce the product boundary:

- deterministic services decide readiness, severity, rerun safety, and approval requirements
- controller explanation output may explain and synthesize only
- explanation output must reference existing action and evidence ids

## Suites

- `runDeterministicEvaluations()` checks the seeded close scenario, risk/readiness outputs, approval-required remediation count, metadata action boundary, and approval decision state updates.
- `evaluateControllerExplanationResponse(response)` validates a real controller explanation response against shape, grounding, and decision-boundary rules.
- `runControllerExplanationFixtureEvaluations()` verifies the explanation validator accepts a grounded fixture and rejects an invented-evidence fixture.
- `runCloseGuardianEvaluations()` aggregates the deterministic suite and fixture-based explanation suite.

## Future Script

Once the repo has package scripts and a TypeScript runner, wire these functions to a small command such as:

```powershell
npm run evals
```

Suggested runner behavior:

1. call `runCloseGuardianEvaluations()`
2. optionally call `POST /api/copilot/explain` in an environment with server-side synthesis config, then pass the response to `evaluateControllerExplanationResponse(response)`
3. fail the process if any suite has `failed > 0`
