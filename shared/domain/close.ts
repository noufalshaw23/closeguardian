export type ISODateString = string
export type ISODateTimeString = string

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type BlockerSeverity = 'none' | 'watch' | 'material' | 'close_blocking'
export type ReadinessStatus = 'ready' | 'at_risk' | 'blocked' | 'not_ready'

export type CloseTaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'pending_approval'
  | 'complete'

export type ScheduledJobStatus =
  | 'scheduled'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'skipped'
  | 'blocked'

export type ServiceDependencyStatus = 'healthy' | 'degraded' | 'down' | 'unknown'
export type IncidentStatus = 'open' | 'mitigated' | 'resolved'
export type MetadataIssueStatus = 'open' | 'in_review' | 'approved' | 'resolved' | 'rejected'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type EvidenceSource = 'seeded' | 'upload' | 'connector'

export type EvidenceKind =
  | 'run_log'
  | 'incident_report'
  | 'metadata_exception'
  | 'approval_policy'
  | 'screenshot'
  | 'spreadsheet'
  | 'note'

export type AgentRole =
  | 'close_orchestrator'
  | 'retry_safety_agent'
  | 'metadata_governance_agent'
  | 'recurrence_intelligence_agent'
  | 'controller_copilot'

export type AgentRunStatus = 'queued' | 'running' | 'completed' | 'failed'

export type RecommendedActionType =
  | 'notify_owner'
  | 'attach_evidence'
  | 'recommend_plan'
  | 'rerun_job'
  | 'fix_metadata_mapping'
  | 'accept_risk'
  | 'reopen_task'
  | 'override_readiness'

export type ActionExecutionMode = 'automatic' | 'approval_required' | 'blocked'

export type RecommendedActionStatus =
  | 'recommended'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'cancelled'

export type AuditActorType = 'system' | 'service' | 'agent' | 'human'

export type AuditEventType =
  | 'source_record_loaded'
  | 'risk_assessed'
  | 'action_recommended'
  | 'approval_requested'
  | 'approval_decided'
  | 'evidence_attached'
  | 'agent_run_completed'

export interface BusinessImpact {
  summary: string
  revenueAtRiskUsd?: number
  closeMilestone?: string
  customerImpact?: string
  reportingImpact?: string
}

export interface CloseTask {
  id: string
  closePeriod: string
  title: string
  area: string
  owner: string
  approver?: string
  dueAt: ISODateTimeString
  status: CloseTaskStatus
  riskLevel: RiskLevel
  sourceSystem: string
  dependencyIds: string[]
  scheduledJobIds: string[]
  metadataIssueIds: string[]
  evidenceIds: string[]
  approvalRequestIds: string[]
  businessImpact: BusinessImpact
  blockerReason?: string
  updatedAt: ISODateTimeString
}

export interface ScheduledJob {
  id: string
  closeTaskId: string
  name: string
  sourceSystem: string
  schedule: string
  status: ScheduledJobStatus
  criticality: 'low' | 'medium' | 'high' | 'close_critical'
  lastRunAt: ISODateTimeString
  nextRunAt?: ISODateTimeString
  failureStartedAt?: ISODateTimeString
  failureCode?: string
  failureMessage?: string
  dependencyIds: string[]
  evidenceIds: string[]
  retryPolicy: {
    maxAttempts: number
    attemptsUsed: number
    requiresApprovalAfterFailure: boolean
    safeRetryConditions: string[]
  }
  businessImpact: BusinessImpact
}

export interface ServiceDependency {
  id: string
  name: string
  type: 'erp' | 'warehouse' | 'scheduler' | 'approval_system' | 'metadata_service' | 'other'
  ownerTeam: string
  status: ServiceDependencyStatus
  statusUpdatedAt: ISODateTimeString
  impactSummary: string
  transientIssue: boolean
  linkedIncidentIds: string[]
}

export interface Incident {
  id: string
  title: string
  status: IncidentStatus
  severity: RiskLevel
  startedAt: ISODateTimeString
  resolvedAt?: ISODateTimeString
  serviceDependencyId?: string
  scheduledJobId?: string
  summary: string
  rootCauseCategory:
    | 'transient_infrastructure'
    | 'metadata_quality'
    | 'upstream_delay'
    | 'configuration'
    | 'unknown'
  remediationSummary: string
  relatedEvidenceIds: string[]
}

export interface MetadataIssue {
  id: string
  closeTaskId: string
  sourceSystem: string
  productCode: string
  productName: string
  issueType:
    | 'missing_revenue_mapping'
    | 'invalid_account_mapping'
    | 'missing_entity_mapping'
    | 'stale_dimension'
  status: MetadataIssueStatus
  severity: RiskLevel
  detectedAt: ISODateTimeString
  owner: string
  expectedMapping: string
  currentMapping?: string
  blockerReason: string
  evidenceIds: string[]
  businessImpact: BusinessImpact
}

export interface ApprovalRequest {
  id: string
  closeTaskId: string
  recommendedActionId: string
  requestedBy: string
  approver: string
  status: ApprovalStatus
  requestedAt: ISODateTimeString
  decidedAt?: ISODateTimeString
  decisionNotes?: string
  reason: string
  riskLevel: RiskLevel
  evidenceIds: string[]
}

export interface EvidenceItem {
  id: string
  title: string
  kind: EvidenceKind
  source: EvidenceSource
  uri: string
  mimeType: string
  createdAt: ISODateTimeString
  owner: string
  summary: string
  contentPreview?: string
  tags: string[]
  relatedEntityIds: string[]
  image?: {
    altText: string
    width: number
    height: number
  }
}

export interface RiskSignal {
  code: string
  label: string
  severity: RiskLevel
  observedAt: ISODateTimeString
  sourceEntityType:
    | 'close_task'
    | 'scheduled_job'
    | 'service_dependency'
    | 'incident'
    | 'metadata_issue'
    | 'approval_request'
    | 'evidence_item'
  sourceEntityId: string
  explanation: string
}

export interface RerunSafetyAssessment {
  status: 'safe' | 'requires_approval' | 'unsafe' | 'not_applicable'
  reasonCodes: string[]
  explanation: string
}

export interface RiskAssessment {
  id: string
  closeTaskId: string
  assessedAt: ISODateTimeString
  createdBy: 'deterministic_risk_service'
  level: RiskLevel
  score: number
  readinessStatus: ReadinessStatus
  blockerSeverity: BlockerSeverity
  approvalRequired: boolean
  escalationRequired: boolean
  rerunSafety: RerunSafetyAssessment
  signals: RiskSignal[]
  deterministicRationale: string[]
  recommendedActionIds: string[]
}

export interface RecommendedAction {
  id: string
  closeTaskId: string
  type: RecommendedActionType
  title: string
  summary: string
  createdAt: ISODateTimeString
  createdBy: 'deterministic_risk_service' | 'deterministic_readiness_service'
  status: RecommendedActionStatus
  executionMode: ActionExecutionMode
  approvalRequired: boolean
  approvalRequestId?: string
  targetEntityType:
    | 'close_task'
    | 'scheduled_job'
    | 'service_dependency'
    | 'metadata_issue'
    | 'approval_request'
  targetEntityId: string
  evidenceIds: string[]
  reasonCodes: string[]
}

export interface AgentRun {
  id: string
  role: AgentRole
  status: AgentRunStatus
  startedAt: ISODateTimeString
  completedAt?: ISODateTimeString
  inputEntityIds: string[]
  outputEntityIds: string[]
  summary: string
  riskAssessmentId?: string
  recommendedActionIds: string[]
}

export interface AuditEvent {
  id: string
  type: AuditEventType
  actorType: AuditActorType
  actorId: string
  subjectType:
    | 'close_task'
    | 'scheduled_job'
    | 'service_dependency'
    | 'incident'
    | 'metadata_issue'
    | 'approval_request'
    | 'evidence_item'
    | 'risk_assessment'
    | 'recommended_action'
    | 'agent_run'
  subjectId: string
  summary: string
  occurredAt: ISODateTimeString
  evidenceIds: string[]
  metadata?: Record<string, string | number | boolean>
}
