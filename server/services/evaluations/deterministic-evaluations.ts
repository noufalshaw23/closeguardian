import { demoScenario } from '../../data'
import {
  decideApproval,
  listApprovals,
  listRecommendations,
  resetCloseAssuranceRepositoryState,
} from '../../repositories'
import { evaluateScenarioTask } from '../risk'
import { expectEqual, expectTrue, summarizeSuite, type EvaluationSuiteResult } from './evaluation-types'

export function runDeterministicEvaluations(): EvaluationSuiteResult {
  resetCloseAssuranceRepositoryState()

  const task = demoScenario.tasks[0]

  if (!task) {
    return summarizeSuite('deterministic-close-assurance', [
      expectTrue('seeded task exists', false, 'Seeded scenario must contain a close task.'),
    ])
  }

  const bundle = evaluateScenarioTask(demoScenario, task.id)
  const approvalRequiredActions = bundle.recommendedActions.filter((action) => action.approvalRequired)
  const metadataNotificationAction = bundle.recommendedActions.find(
    (action) => action.id === 'action-notify-metadata-owner',
  )

  const checks = [
    expectEqual(
      'readiness classification',
      bundle.riskAssessment.readinessStatus,
      'blocked',
    ),
    expectEqual(
      'blocker severity classification',
      bundle.riskAssessment.blockerSeverity,
      'close_blocking',
    ),
    expectEqual('risk severity', bundle.riskAssessment.level, 'critical'),
    expectEqual('risk score', bundle.riskAssessment.score, 92),
    expectEqual('exactly one approval-required remediation', approvalRequiredActions.length, 1),
    expectEqual(
      'approval-required remediation id',
      approvalRequiredActions[0]?.id,
      'action-request-rerun-approval',
    ),
    expectTrue(
      'metadata blocker is not approval-required by default',
      metadataNotificationAction?.approvalRequired === false &&
        metadataNotificationAction.executionMode === 'automatic',
      'Metadata owner notification should remain an automatic recommendation.',
    ),
  ]

  const pendingApproval = listApprovals().approvalRequests.find(
    (approval) => approval.id === 'approval-rerun-revenue-job',
  )
  checks.push(expectEqual('approval starts pending', pendingApproval?.status, 'pending'))

  const approvalDecision = decideApproval('approval-rerun-revenue-job', {
    decision: 'approve',
    decidedBy: 'Evaluation Controller',
    notes: 'Evaluation approval decision.',
  })
  const updatedApproval = listApprovals().approvalRequests.find(
    (approval) => approval.id === 'approval-rerun-revenue-job',
  )
  const updatedAction = listRecommendations().recommendedActions.find(
    (action) => action.id === 'action-request-rerun-approval',
  )

  checks.push(
    expectTrue(
      'approval decision response is returned',
      Boolean(approvalDecision),
      'Approval decision should return updated approval, action, and audit event.',
    ),
    expectEqual('approval decision updates approval state', updatedApproval?.status, 'approved'),
    expectEqual('approval decision updates action state', updatedAction?.status, 'approved'),
    expectEqual('approval decision audit event type', approvalDecision?.auditEvent.type, 'approval_decided'),
  )

  resetCloseAssuranceRepositoryState()

  return summarizeSuite('deterministic-close-assurance', checks)
}
