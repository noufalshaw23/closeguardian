import { runControllerExplanationFixtureEvaluations } from './controller-explanation-evaluations'
import { runDeterministicEvaluations } from './deterministic-evaluations'
import type { EvaluationSuiteResult } from './evaluation-types'

export function runCloseGuardianEvaluations(): EvaluationSuiteResult[] {
  return [
    runDeterministicEvaluations(),
    runControllerExplanationFixtureEvaluations(),
  ]
}

export function hasEvaluationFailures(results: EvaluationSuiteResult[]): boolean {
  return results.some((result) => result.failed > 0)
}
