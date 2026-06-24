import { demoScenario } from '../data'
import { evaluateScenarioTask } from '../services/risk'
import type {
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalsResponse,
  AuditResponse,
  ControllerExplanationInput,
  DashboardResponse,
  RecommendationsResponse,
  TaskDetailResponse,
  TasksResponse,
} from '../../shared/contracts'
import type {
  ApprovalRequest,
  AuditEvent,
  CloseTask,
  RecommendedAction,
  RiskAssessment,
} from '../../shared/domain'

type StoredApprovalDecision = {
  status: 'approved' | 'rejected'
  decidedAt: string
  decidedBy: string
  notes?: string
}

interface CloseAssuranceReadModel {
  task: CloseTask
  riskAssessment: RiskAssessment
  recommendedActions: RecommendedAction[]
  approvalRequests: ApprovalRequest[]
  auditEvents: AuditEvent[]
}

const approvalDecisions = new Map<string, StoredApprovalDecision>()

export function getDashboard(): DashboardResponse {
  const readModel = getReadModel()

  return {
    scenario: {
      id: demoScenario.scenarioId,
      title: demoScenario.title,
      closePeriod: demoScenario.closePeriod,
      generatedAt: demoScenario.generatedAt,
    },
    summary: {
      taskCount: demoScenario.tasks.length,
      blockedTaskCount: demoScenario.tasks.filter((task) => task.status === 'blocked').length,
      criticalRiskCount: readModel.riskAssessment.level === 'critical' ? 1 : 0,
      pendingApprovalCount: readModel.approvalRequests.filter(
        (approval) => approval.status === 'pending',
      ).length,
      approvalRequiredActionCount: readModel.recommendedActions.filter(
        (action) => action.approvalRequired,
      ).length,
      evidenceItemCount: demoScenario.evidenceItems.length,
      readinessStatus: readModel.riskAssessment.readinessStatus,
      highestRiskLevel: readModel.riskAssessment.level,
      revenueAtRiskUsd: demoScenario.tasks.reduce(
        (total, task) => total + (task.businessImpact.revenueAtRiskUsd ?? 0),
        0,
      ),
    },
    primaryTask: readModel.task,
    riskAssessment: readModel.riskAssessment,
    recommendedActions: readModel.recommendedActions,
    approvalRequests: readModel.approvalRequests,
    agentRuns: demoScenario.agentRuns,
    auditEvents: readModel.auditEvents,
  }
}

export function listTasks(): TasksResponse {
  const readModel = getReadModel()

  return {
    tasks: demoScenario.tasks.map((task) => ({
      task,
      riskAssessment: readModel.riskAssessment,
      scheduledJobCount: demoScenario.scheduledJobs.filter((job) => job.closeTaskId === task.id).length,
      metadataIssueCount: demoScenario.metadataIssues.filter((issue) => issue.closeTaskId === task.id)
        .length,
      pendingApprovalCount: readModel.approvalRequests.filter(
        (approval) => approval.closeTaskId === task.id && approval.status === 'pending',
      ).length,
    })),
  }
}

export function getTaskDetail(taskId: string): TaskDetailResponse | undefined {
  const readModel = getReadModel()
  const task = demoScenario.tasks.find((candidate) => candidate.id === taskId)

  if (!task) {
    return undefined
  }

  return {
    task,
    riskAssessment: readModel.riskAssessment,
    scheduledJobs: demoScenario.scheduledJobs.filter((job) => job.closeTaskId === task.id),
    serviceDependencies: demoScenario.serviceDependencies.filter((dependency) =>
      task.dependencyIds.includes(dependency.id),
    ),
    incidents: demoScenario.incidents.filter(
      (incident) =>
        task.scheduledJobIds.includes(incident.scheduledJobId ?? '') ||
        task.dependencyIds.includes(incident.serviceDependencyId ?? ''),
    ),
    metadataIssues: demoScenario.metadataIssues.filter((issue) => issue.closeTaskId === task.id),
    evidenceItems: demoScenario.evidenceItems.filter((evidence) =>
      evidence.relatedEntityIds.some((entityId) =>
        [
          task.id,
          ...task.scheduledJobIds,
          ...task.metadataIssueIds,
          ...task.dependencyIds,
          ...task.approvalRequestIds,
        ].includes(entityId),
      ),
    ),
    recommendedActions: readModel.recommendedActions.filter((action) => action.closeTaskId === task.id),
    approvalRequests: readModel.approvalRequests.filter((approval) => approval.closeTaskId === task.id),
    auditEvents: readModel.auditEvents.filter(
      (event) =>
        event.subjectId === task.id ||
        event.evidenceIds.some((evidenceId) => task.evidenceIds.includes(evidenceId)) ||
        readModel.recommendedActions.some((action) => action.id === event.subjectId),
    ),
  }
}

export function listRecommendations(): RecommendationsResponse {
  return {
    recommendedActions: getReadModel().recommendedActions,
  }
}

export function listApprovals(): ApprovalsResponse {
  return {
    approvalRequests: getReadModel().approvalRequests,
  }
}

export function listAuditEvents(): AuditResponse {
  return {
    auditEvents: getReadModel().auditEvents,
  }
}

export function resetCloseAssuranceRepositoryState() {
  approvalDecisions.clear()
}

export function getControllerExplanationInput(taskId?: string): ControllerExplanationInput | undefined {
  const dashboard = getDashboard()
  const detail = getTaskDetail(taskId ?? dashboard.primaryTask.id)

  if (!detail) {
    return undefined
  }

  return {
    scenario: dashboard.scenario,
    readinessSummary: dashboard.summary,
    closeTask: detail.task,
    riskAssessment: detail.riskAssessment,
    blockers: {
      failedJobs: detail.scheduledJobs.filter((job) => job.status === 'failed'),
      metadataIssues: detail.metadataIssues.filter((issue) => issue.status === 'open'),
      serviceDependencies: detail.serviceDependencies.filter(
        (dependency) => dependency.status === 'degraded' || dependency.status === 'down',
      ),
    },
    incidents: detail.incidents,
    recommendedActions: detail.recommendedActions,
    approvalRequests: detail.approvalRequests,
    evidenceItems: detail.evidenceItems,
    auditEvents: detail.auditEvents,
  }
}

export function decideApproval(
  approvalRequestId: string,
  decisionRequest: ApprovalDecisionRequest,
): ApprovalDecisionResponse | undefined {
  const readModel = getReadModel()
  const approvalRequest = readModel.approvalRequests.find(
    (approval) => approval.id === approvalRequestId,
  )

  if (!approvalRequest) {
    return undefined
  }

  const recommendedAction = readModel.recommendedActions.find(
    (action) => action.id === approvalRequest.recommendedActionId,
  )

  if (!recommendedAction) {
    return undefined
  }

  const decidedAt = new Date().toISOString()
  const storedDecision: StoredApprovalDecision = {
    status: decisionRequest.decision === 'approve' ? 'approved' : 'rejected',
    decidedAt,
    decidedBy: decisionRequest.decidedBy ?? 'Controller Reviewer',
  }

  if (decisionRequest.notes) {
    storedDecision.notes = decisionRequest.notes
  }
  approvalDecisions.set(approvalRequestId, storedDecision)

  const updatedModel = getReadModel()
  const updatedApprovalRequest = updatedModel.approvalRequests.find(
    (approval) => approval.id === approvalRequestId,
  )
  const updatedRecommendedAction = updatedModel.recommendedActions.find(
    (action) => action.id === approvalRequest.recommendedActionId,
  )
  const auditEvent = buildApprovalDecisionAuditEvent(
    approvalRequestId,
    approvalRequest.recommendedActionId,
    storedDecision,
  )

  if (!updatedApprovalRequest || !updatedRecommendedAction) {
    return undefined
  }

  return {
    approvalRequest: updatedApprovalRequest,
    recommendedAction: updatedRecommendedAction,
    auditEvent,
  }
}

function getReadModel(): CloseAssuranceReadModel {
  const task = demoScenario.tasks[0]

  if (!task) {
    throw new Error('Demo scenario does not contain a close task.')
  }

  const assessmentBundle = evaluateScenarioTask(demoScenario, task.id)
  const recommendedActions = applyActionDecisions(assessmentBundle.recommendedActions)
  const approvalRequests = applyApprovalDecisions(assessmentBundle.approvalRequests)
  const auditEvents = [
    ...assessmentBundle.auditEvents,
    ...Array.from(approvalDecisions.entries()).map(([approvalRequestId, decision]) =>
      buildApprovalDecisionAuditEvent(
        approvalRequestId,
        approvalRequests.find((approval) => approval.id === approvalRequestId)
          ?.recommendedActionId ?? 'unknown-recommended-action',
        decision,
      ),
    ),
  ]

  return {
    task,
    riskAssessment: assessmentBundle.riskAssessment,
    recommendedActions,
    approvalRequests,
    auditEvents,
  }
}

function applyApprovalDecisions(approvalRequests: ApprovalRequest[]): ApprovalRequest[] {
  return approvalRequests.map((approvalRequest) => {
    const decision = approvalDecisions.get(approvalRequest.id)

    if (!decision) {
      return approvalRequest
    }

    return {
      ...approvalRequest,
      status: decision.status,
      decidedAt: decision.decidedAt,
      decisionNotes: formatDecisionNotes(decision),
    }
  })
}

function applyActionDecisions(recommendedActions: RecommendedAction[]): RecommendedAction[] {
  return recommendedActions.map((action) => {
    if (!action.approvalRequestId) {
      return action
    }

    const decision = approvalDecisions.get(action.approvalRequestId)

    if (!decision) {
      return action
    }

    return {
      ...action,
      status: decision.status,
    }
  })
}

function buildApprovalDecisionAuditEvent(
  approvalRequestId: string,
  recommendedActionId: string,
  decision: StoredApprovalDecision,
): AuditEvent {
  return {
    id: `audit-approval-${decision.status}-${approvalRequestId}`,
    type: 'approval_decided',
    actorType: 'human',
    actorId: decision.decidedBy,
    subjectType: 'approval_request',
    subjectId: approvalRequestId,
    summary: `Controller ${decision.status} remediation action ${recommendedActionId}.`,
    occurredAt: decision.decidedAt,
    evidenceIds: ['ev-rev-job-log', 'ev-incident-history', 'ev-rerun-policy'],
    metadata: {
      decision: decision.status,
      recommendedActionId,
    },
  }
}

function formatDecisionNotes(decision: StoredApprovalDecision): string {
  if (!decision.notes) {
    return `Decision recorded by ${decision.decidedBy}.`
  }

  return `${decision.notes} Decision recorded by ${decision.decidedBy}.`
}
