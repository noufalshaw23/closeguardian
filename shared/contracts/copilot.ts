import type {
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
import type { DashboardResponse } from './api'

export interface ControllerExplanationInput {
  scenario: DashboardResponse['scenario']
  readinessSummary: DashboardResponse['summary']
  closeTask: CloseTask
  riskAssessment: RiskAssessment
  blockers: {
    failedJobs: ScheduledJob[]
    metadataIssues: MetadataIssue[]
    serviceDependencies: ServiceDependency[]
  }
  incidents: Incident[]
  recommendedActions: RecommendedAction[]
  approvalRequests: ApprovalRequest[]
  evidenceItems: EvidenceItem[]
  auditEvents: AuditEvent[]
}

export interface ControllerExplanationAction {
  actionId: string
  title: string
  controllerRationale: string
}

export interface ControllerEvidenceBasis {
  evidenceId: string
  title: string
  relevance: string
}

export interface ControllerExplanationOutput {
  executiveSummary: string
  businessImpact: string
  likelyRootCause: string
  recommendedActions: ControllerExplanationAction[]
  approvalNotes: string
  confidenceNotes: string
  evidenceBasis: ControllerEvidenceBasis[]
}

export interface ControllerExplanationRequest {
  taskId?: string
  input?: ControllerExplanationInput
}

export interface ControllerExplanationResponse {
  generatedAt: string
  generatedBy: 'server_openai_synthesis'
  model: string
  input: ControllerExplanationInput
  explanation: ControllerExplanationOutput
}
