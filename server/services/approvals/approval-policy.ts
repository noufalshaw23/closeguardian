import type {
  ApprovalRequest,
  CloseTask,
  RecommendedAction,
  RecommendedActionType,
  RerunSafetyAssessment,
  RiskLevel,
  ScheduledJob,
  ServiceDependency,
} from '../../../shared/domain'

export interface ApprovalPolicyInput {
  actionType: RecommendedActionType
  riskLevel: RiskLevel
  targetJob?: ScheduledJob
  targetTask?: CloseTask
}

export interface ApprovalPolicyDecision {
  approvalRequired: boolean
  reasonCodes: string[]
  explanation: string
}

export function computeApprovalRequirement(input: ApprovalPolicyInput): ApprovalPolicyDecision {
  const reasonCodes: string[] = []

  if (input.actionType === 'rerun_job' && input.targetJob?.criticality === 'close_critical') {
    reasonCodes.push('CLOSE_CRITICAL_JOB_RERUN')
  }

  if (input.actionType === 'rerun_job' && input.targetJob?.retryPolicy.requiresApprovalAfterFailure) {
    reasonCodes.push('RERUN_POLICY_REQUIRES_CONTROLLER')
  }

  if (
    input.actionType === 'fix_metadata_mapping' ||
    input.actionType === 'accept_risk' ||
    input.actionType === 'reopen_task' ||
    input.actionType === 'override_readiness'
  ) {
    reasonCodes.push('HUMAN_APPROVAL_BOUNDARY')
  }

  if (input.riskLevel === 'critical' && input.actionType !== 'notify_owner' && input.actionType !== 'attach_evidence') {
    reasonCodes.push('CRITICAL_RISK_REVIEW')
  }

  const approvalRequired = reasonCodes.length > 0

  return {
    approvalRequired,
    reasonCodes,
    explanation: approvalRequired
      ? 'The action crosses a deterministic approval boundary and must be routed to a human approver.'
      : 'The action is inside the automatic assistance boundary.',
  }
}

export function computeRerunSafety(
  job: ScheduledJob | undefined,
  dependencies: ServiceDependency[],
): RerunSafetyAssessment {
  if (!job || job.status !== 'failed') {
    return {
      status: 'not_applicable',
      reasonCodes: ['NO_FAILED_JOB'],
      explanation: 'No failed scheduled job requires a rerun safety decision.',
    }
  }

  const relatedDependencies = dependencies.filter((dependency) => job.dependencyIds.includes(dependency.id))
  const hasDownDependency = relatedDependencies.some((dependency) => dependency.status === 'down')
  const hasDegradedTransientDependency = relatedDependencies.some(
    (dependency) => dependency.status === 'degraded' && dependency.transientIssue,
  )
  const attemptsExhausted = job.retryPolicy.attemptsUsed >= job.retryPolicy.maxAttempts

  if (hasDownDependency || attemptsExhausted) {
    return {
      status: 'unsafe',
      reasonCodes: [
        ...(hasDownDependency ? ['DEPENDENCY_DOWN'] : []),
        ...(attemptsExhausted ? ['RETRY_ATTEMPTS_EXHAUSTED'] : []),
      ],
      explanation:
        'The job should not be rerun because a hard safety condition failed.',
    }
  }

  if (job.retryPolicy.requiresApprovalAfterFailure || job.criticality === 'close_critical') {
    return {
      status: 'requires_approval',
      reasonCodes: [
        'CLOSE_CRITICAL_JOB_FAILED',
        ...(job.retryPolicy.requiresApprovalAfterFailure
          ? ['RERUN_POLICY_REQUIRES_CONTROLLER']
          : []),
        ...(hasDegradedTransientDependency ? ['TRANSIENT_DEPENDENCY_MITIGATED'] : []),
      ],
      explanation:
        'The failed close-critical job appears eligible for controlled rerun, but policy requires controller approval.',
    }
  }

  return {
    status: 'safe',
    reasonCodes: ['FAILED_JOB_WITH_RETRY_AVAILABLE'],
    explanation: 'The failed job has retry capacity and no blocking dependency condition.',
  }
}

export function buildApprovalRequestForAction(params: {
  id: string
  action: RecommendedAction
  task: CloseTask
  requestedBy: string
  requestedAt: string
  reason: string
}): ApprovalRequest {
  return {
    id: params.id,
    closeTaskId: params.task.id,
    recommendedActionId: params.action.id,
    requestedBy: params.requestedBy,
    approver: params.task.approver ?? params.task.owner,
    status: 'pending',
    requestedAt: params.requestedAt,
    reason: params.reason,
    riskLevel: params.action.approvalRequired ? 'critical' : 'medium',
    evidenceIds: params.action.evidenceIds,
  }
}
