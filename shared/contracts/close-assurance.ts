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

export interface CloseGuardianSeedData {
  scenarioId: string
  title: string
  closePeriod: string
  generatedAt: string
  tasks: CloseTask[]
  scheduledJobs: ScheduledJob[]
  serviceDependencies: ServiceDependency[]
  incidents: Incident[]
  metadataIssues: MetadataIssue[]
  evidenceItems: EvidenceItem[]
  riskAssessments: RiskAssessment[]
  recommendedActions: RecommendedAction[]
  approvalRequests: ApprovalRequest[]
  agentRuns: AgentRun[]
  auditEvents: AuditEvent[]
}

export interface DeterministicAssessmentBundle {
  riskAssessment: RiskAssessment
  recommendedActions: RecommendedAction[]
  approvalRequests: ApprovalRequest[]
  auditEvents: AuditEvent[]
}

export interface OpenAiEnrichmentInput {
  closeTask: CloseTask
  riskAssessment: RiskAssessment
  recommendedActions: RecommendedAction[]
  evidenceItems: EvidenceItem[]
  incidents: Incident[]
  metadataIssues: MetadataIssue[]
}

export interface OpenAiEnrichment {
  riskAssessmentId: string
  recommendedActionIds: string[]
  generatedAt: string
  generatedBy: 'server_openai_synthesis'
  closeRiskSummary: string
  likelyRootCause: string
  evidenceSynthesis: string
  nextBestActionDraft: string
  controllerUpdateDraft: string
  limitations: string[]
}
