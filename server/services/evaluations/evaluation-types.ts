export type EvaluationStatus = 'pass' | 'fail'

export interface EvaluationCheck {
  name: string
  status: EvaluationStatus
  message: string
  expected?: unknown
  actual?: unknown
}

export interface EvaluationSuiteResult {
  suite: string
  passed: number
  failed: number
  checks: EvaluationCheck[]
}

export function pass(name: string, message: string): EvaluationCheck {
  return {
    name,
    status: 'pass',
    message,
  }
}

export function fail(
  name: string,
  message: string,
  expected?: unknown,
  actual?: unknown,
): EvaluationCheck {
  return {
    name,
    status: 'fail',
    message,
    expected,
    actual,
  }
}

export function expectEqual<T>(name: string, actual: T, expected: T): EvaluationCheck {
  if (actual === expected) {
    return pass(name, `Expected value matched: ${String(expected)}.`)
  }

  return fail(name, 'Expected value did not match.', expected, actual)
}

export function expectTrue(name: string, condition: boolean, message: string): EvaluationCheck {
  return condition ? pass(name, message) : fail(name, message, true, condition)
}

export function summarizeSuite(suite: string, checks: EvaluationCheck[]): EvaluationSuiteResult {
  const passed = checks.filter((check) => check.status === 'pass').length
  const failed = checks.length - passed

  return {
    suite,
    passed,
    failed,
    checks,
  }
}
