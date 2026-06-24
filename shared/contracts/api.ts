import type {
  AgentRun,
  ApprovalRequest,
  AuditEvent,
  CloseTask,
  EvidenceItem,
  Incident,
  MetadataIssue,
  RecommendedAction,
  RiskAssessment,
  ScheduledJob,
  ServiceDependency,
} from '../domain'

export interface DashboardResponse {
  scenario: {
    id: string
    title: string
    closePeriod: string
    generatedAt: string
  }
  summary: {
    taskCount: number
    blockedTaskCount: number
    criticalRiskCount: number
    pendingApprovalCount: number
    approvalRequiredActionCount: number
    evidenceItemCount: number
    readinessStatus: RiskAssessment['readinessStatus']
    highestRiskLevel: RiskAssessment['level']
    revenueAtRiskUsd: number
  }
  primaryTask: CloseTask
  riskAssessment: RiskAssessment
  recommendedActions: RecommendedAction[]
  approvalRequests: ApprovalRequest[]
  agentRuns: AgentRun[]
  auditEvents: AuditEvent[]
}

export interface TasksResponse {
  tasks: Array<{
    task: CloseTask
    riskAssessment: RiskAssessment
    scheduledJobCount: number
    metadataIssueCount: number
    pendingApprovalCount: number
  }>
}

export interface TaskDetailResponse {
  task: CloseTask
  riskAssessment: RiskAssessment
  scheduledJobs: ScheduledJob[]
  serviceDependencies: ServiceDependency[]
  incidents: Incident[]
  metadataIssues: MetadataIssue[]
  evidenceItems: EvidenceItem[]
  recommendedActions: RecommendedAction[]
  approvalRequests: ApprovalRequest[]
  auditEvents: AuditEvent[]
}

export interface RecommendationsResponse {
  recommendedActions: RecommendedAction[]
}

export interface ApprovalsResponse {
  approvalRequests: ApprovalRequest[]
}

export interface AuditResponse {
  auditEvents: AuditEvent[]
}

export type ApprovalDecision = 'approve' | 'reject'

export interface ApprovalDecisionRequest {
  decision: ApprovalDecision
  decidedBy?: string
  notes?: string
}

export interface ApprovalDecisionResponse {
  approvalRequest: ApprovalRequest
  recommendedAction: RecommendedAction
  auditEvent: AuditEvent
}
