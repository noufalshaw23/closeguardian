import type {
  AuditEvent,
  CloseTask,
  EvidenceItem,
  Incident,
  MetadataIssue,
  RecommendedAction,
  RiskAssessment,
  RiskLevel,
  RiskSignal,
  ScheduledJob,
  ServiceDependency,
} from '../../../shared/domain'
import type { CloseGuardianSeedData, DeterministicAssessmentBundle } from '../../../shared/contracts'
import {
  buildApprovalRequestForAction,
  computeApprovalRequirement,
  computeRerunSafety,
} from '../approvals'
import { evaluateReadiness } from '../readiness'

export interface RiskEvaluationInput {
  task: CloseTask
  scheduledJobs: ScheduledJob[]
  serviceDependencies: ServiceDependency[]
  incidents: Incident[]
  metadataIssues: MetadataIssue[]
  evidenceItems: EvidenceItem[]
  assessedAt: string
}

export function evaluateScenarioTask(
  scenario: CloseGuardianSeedData,
  taskId: string,
): DeterministicAssessmentBundle {
  const task = scenario.tasks.find((candidate) => candidate.id === taskId)

  if (!task) {
    throw new Error(`Close task not found: ${taskId}`)
  }

  return evaluateTaskRisk({
    task,
    scheduledJobs: scenario.scheduledJobs.filter((job) => job.closeTaskId === task.id),
    serviceDependencies: scenario.serviceDependencies.filter((dependency) =>
      task.dependencyIds.includes(dependency.id),
    ),
    incidents: scenario.incidents.filter(
      (incident) =>
        task.scheduledJobIds.includes(incident.scheduledJobId ?? '') ||
        task.dependencyIds.includes(incident.serviceDependencyId ?? ''),
    ),
    metadataIssues: scenario.metadataIssues.filter((issue) => issue.closeTaskId === task.id),
    evidenceItems: scenario.evidenceItems,
    assessedAt: scenario.generatedAt,
  })
}

export function evaluateTaskRisk(input: RiskEvaluationInput): DeterministicAssessmentBundle {
  const readiness = evaluateReadiness(input)
  const primaryFailedJob = input.scheduledJobs.find((job) => job.status === 'failed')
  const rerunSafety = computeRerunSafety(primaryFailedJob, input.serviceDependencies)
  const signals = buildRiskSignals(input)
  const score = computeRiskScore(signals)
  const level = computeTaskRiskLevel(score)
  const recommendedActions = buildRecommendedActions({
    input,
    riskLevel: level,
    primaryFailedJob,
  })
  const approvalRequired = recommendedActions.some((action) => action.approvalRequired)
  const escalationRequired = computeEscalationRequired({
    riskLevel: level,
    score,
    approvalRequired,
    signalCount: signals.length,
  })

  const approvalRequests = recommendedActions
    .filter((action) => action.approvalRequired)
    .map((action) =>
      buildApprovalRequestForAction({
        id: 'approval-rerun-revenue-job',
        action,
        task: input.task,
        requestedBy: 'Close Orchestrator',
        requestedAt: input.assessedAt,
        reason:
          'Revenue posting job is close-critical and policy requires controller approval before rerun after failure.',
      }),
    )

  const riskAssessment: RiskAssessment = {
    id: `risk-${input.task.id}`,
    closeTaskId: input.task.id,
    assessedAt: input.assessedAt,
    createdBy: 'deterministic_risk_service',
    level,
    score,
    readinessStatus: readiness.readinessStatus,
    blockerSeverity: readiness.blockerSeverity,
    approvalRequired,
    escalationRequired,
    rerunSafety,
    signals,
    deterministicRationale: [
      ...readiness.rationale,
      ...rerunSafety.reasonCodes.map((reasonCode) => `Rerun safety rule matched: ${reasonCode}.`),
      ...(escalationRequired ? ['Escalation threshold was met.'] : []),
    ],
    recommendedActionIds: recommendedActions.map((action) => action.id),
  }

  return {
    riskAssessment,
    recommendedActions,
    approvalRequests,
    auditEvents: buildAuditEvents({
      input,
      riskAssessment,
      recommendedActions,
      approvalRequestIds: approvalRequests.map((request) => request.id),
    }),
  }
}

export function computeTaskRiskLevel(score: number): RiskLevel {
  if (score >= 85) {
    return 'critical'
  }

  if (score >= 65) {
    return 'high'
  }

  if (score >= 35) {
    return 'medium'
  }

  return 'low'
}

export function computeEscalationRequired(params: {
  riskLevel: RiskLevel
  score: number
  approvalRequired: boolean
  signalCount: number
}): boolean {
  return (
    params.riskLevel === 'critical' ||
    params.score >= 85 ||
    (params.approvalRequired && params.riskLevel === 'high') ||
    params.signalCount >= 3
  )
}

function buildRiskSignals(input: RiskEvaluationInput): RiskSignal[] {
  const signals: RiskSignal[] = []

  for (const job of input.scheduledJobs) {
    if (job.status === 'failed' && job.criticality === 'close_critical') {
      signals.push({
        code: 'FAILED_CLOSE_CRITICAL_JOB',
        label: 'Close-critical job failed',
        severity: 'critical',
        observedAt: job.failureStartedAt ?? job.lastRunAt,
        sourceEntityType: 'scheduled_job',
        sourceEntityId: job.id,
        explanation:
          'A close-critical scheduled job failed during the close window and has not completed successfully.',
      })
    }
  }

  for (const dependency of input.serviceDependencies) {
    if (dependency.status === 'down' || dependency.status === 'degraded') {
      signals.push({
        code: dependency.transientIssue
          ? 'TRANSIENT_DEPENDENCY_DEGRADED'
          : 'SERVICE_DEPENDENCY_UNHEALTHY',
        label: dependency.transientIssue
          ? 'Dependency degraded with transient issue'
          : 'Service dependency unhealthy',
        severity: dependency.status === 'down' ? 'critical' : 'high',
        observedAt: dependency.statusUpdatedAt,
        sourceEntityType: 'service_dependency',
        sourceEntityId: dependency.id,
        explanation: dependency.impactSummary,
      })
    }
  }

  for (const issue of input.metadataIssues) {
    if (issue.status === 'open') {
      signals.push({
        code:
          issue.issueType === 'missing_revenue_mapping'
            ? 'MISSING_REVENUE_METADATA'
            : 'OPEN_METADATA_ISSUE',
        label:
          issue.issueType === 'missing_revenue_mapping'
            ? 'New product missing revenue mapping'
            : 'Open metadata issue',
        severity: issue.severity,
        observedAt: issue.detectedAt,
        sourceEntityType: 'metadata_issue',
        sourceEntityId: issue.id,
        explanation: issue.blockerReason,
      })
    }
  }

  if (
    input.incidents.some(
      (incident) =>
        incident.rootCauseCategory === 'transient_infrastructure' &&
        (incident.status === 'mitigated' || incident.status === 'resolved'),
    )
  ) {
    const incident = input.incidents.find(
      (candidate) => candidate.rootCauseCategory === 'transient_infrastructure',
    )

    if (incident) {
      signals.push({
        code: 'RECURRENT_TRANSIENT_INCIDENT_HISTORY',
        label: 'Recurring transient incident pattern',
        severity: 'medium',
        observedAt: incident.resolvedAt ?? incident.startedAt,
        sourceEntityType: 'incident',
        sourceEntityId: incident.id,
        explanation:
          'Incident history indicates a similar transient dependency pattern has affected prior close activity.',
      })
    }
  }

  return signals
}

function computeRiskScore(signals: RiskSignal[]): number {
  const baseScore = signals.reduce((score, signal) => score + riskSignalWeight(signal.severity), 0)

  return Math.min(100, baseScore)
}

function riskSignalWeight(level: RiskLevel): number {
  switch (level) {
    case 'critical':
      return 42
    case 'high':
      return 20
    case 'medium':
      return 10
    case 'low':
      return 3
  }
}

function buildRecommendedActions(params: {
  input: RiskEvaluationInput
  riskLevel: RiskLevel
  primaryFailedJob?: ScheduledJob
}): RecommendedAction[] {
  const actions: RecommendedAction[] = []
  const failedJob = params.primaryFailedJob

  if (failedJob) {
    const approvalDecision = computeApprovalRequirement({
      actionType: 'rerun_job',
      riskLevel: params.riskLevel,
      targetJob: failedJob,
      targetTask: params.input.task,
    })

    const action: RecommendedAction = {
      id: 'action-request-rerun-approval',
      closeTaskId: params.input.task.id,
      type: 'rerun_job',
      title: 'Request approval to rerun revenue posting job',
      summary:
        'Route a controller approval request before rerunning the failed revenue posting job after dependency mitigation.',
      createdAt: params.input.assessedAt,
      createdBy: 'deterministic_risk_service',
      status: approvalDecision.approvalRequired ? 'pending_approval' : 'recommended',
      executionMode: approvalDecision.approvalRequired ? 'approval_required' : 'automatic',
      approvalRequired: approvalDecision.approvalRequired,
      targetEntityType: 'scheduled_job',
      targetEntityId: failedJob.id,
      evidenceIds: unique([
        ...failedJob.evidenceIds,
        ...params.input.incidents.flatMap((incident) => incident.relatedEvidenceIds),
        ...params.input.evidenceItems
          .filter((evidence) => evidence.tags.includes('approval-policy'))
          .map((evidence) => evidence.id),
      ]),
      reasonCodes: approvalDecision.reasonCodes,
    }

    if (approvalDecision.approvalRequired) {
      action.approvalRequestId = 'approval-rerun-revenue-job'
    }

    actions.push(action)
  }

  const openMetadataIssue = params.input.metadataIssues.find((issue) => issue.status === 'open')

  if (openMetadataIssue) {
    actions.push({
      id: 'action-notify-metadata-owner',
      closeTaskId: params.input.task.id,
      type: 'notify_owner',
      title: 'Notify metadata owner of unmapped product',
      summary:
        'Notify the finance metadata owner that the new product needs revenue mapping review before certification.',
      createdAt: params.input.assessedAt,
      createdBy: 'deterministic_risk_service',
      status: 'recommended',
      executionMode: 'automatic',
      approvalRequired: false,
      targetEntityType: 'metadata_issue',
      targetEntityId: openMetadataIssue.id,
      evidenceIds: openMetadataIssue.evidenceIds,
      reasonCodes: ['MISSING_REVENUE_METADATA'],
    })
  }

  actions.push({
    id: 'action-attach-evidence-pack',
    closeTaskId: params.input.task.id,
    type: 'attach_evidence',
    title: 'Attach close assurance evidence pack',
    summary:
      'Attach job logs, incident history, metadata exception details, and rerun policy to the task record.',
    createdAt: params.input.assessedAt,
    createdBy: 'deterministic_readiness_service',
    status: 'recommended',
    executionMode: 'automatic',
    approvalRequired: false,
    targetEntityType: 'close_task',
    targetEntityId: params.input.task.id,
    evidenceIds: unique([
      ...params.input.task.evidenceIds,
      ...params.input.scheduledJobs.flatMap((job) => job.evidenceIds),
      ...params.input.metadataIssues.flatMap((issue) => issue.evidenceIds),
    ]),
    reasonCodes: ['AUDIT_READY_EVIDENCE_REQUIRED'],
  })

  return actions
}

function buildAuditEvents(params: {
  input: RiskEvaluationInput
  riskAssessment: RiskAssessment
  recommendedActions: RecommendedAction[]
  approvalRequestIds: string[]
}): AuditEvent[] {
  const events: AuditEvent[] = [
    {
      id: 'audit-risk-assessed-001',
      type: 'risk_assessed',
      actorType: 'service',
      actorId: 'deterministic_risk_service',
      subjectType: 'risk_assessment',
      subjectId: params.riskAssessment.id,
      summary: `Deterministic risk assessment marked ${params.input.task.title} as ${params.riskAssessment.readinessStatus} and ${params.riskAssessment.level}.`,
      occurredAt: params.input.assessedAt,
      evidenceIds: params.input.task.evidenceIds,
      metadata: {
        score: params.riskAssessment.score,
        approvalRequired: params.riskAssessment.approvalRequired,
        escalationRequired: params.riskAssessment.escalationRequired,
      },
    },
  ]

  for (const action of params.recommendedActions) {
    events.push({
      id: `audit-action-recommended-${action.id}`,
      type: 'action_recommended',
      actorType: 'service',
      actorId: action.createdBy,
      subjectType: 'recommended_action',
      subjectId: action.id,
      summary: `Recommended action: ${action.title}.`,
      occurredAt: params.input.assessedAt,
      evidenceIds: action.evidenceIds,
    })
  }

  for (const approvalRequestId of params.approvalRequestIds) {
    events.push({
      id: `audit-approval-requested-${approvalRequestId}`,
      type: 'approval_requested',
      actorType: 'agent',
      actorId: 'close_orchestrator',
      subjectType: 'approval_request',
      subjectId: approvalRequestId,
      summary: 'Close Orchestrator routed the remediation to the controller for approval.',
      occurredAt: params.input.assessedAt,
      evidenceIds:
        params.recommendedActions.find((action) => action.approvalRequestId === approvalRequestId)
          ?.evidenceIds ?? [],
    })
  }

  return events
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}
