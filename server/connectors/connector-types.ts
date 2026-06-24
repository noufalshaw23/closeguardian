import type {
  ApprovalRequest,
  EvidenceItem,
  Incident,
  MetadataIssue,
  ScheduledJob,
  ServiceDependency,
} from '../../shared/domain'

export type ConnectorStatus = 'available' | 'degraded' | 'unavailable'

export type ConnectorSystemType =
  | 'scheduler'
  | 'metadata'
  | 'incident'
  | 'approval'

export interface ConnectorOperation {
  id: string
  displayName: string
  description: string
  mode: 'read' | 'write'
}

export interface ConnectorHealth {
  status: ConnectorStatus
  summary: string
  checkedAt: string
}

export interface ConnectorDescriptor {
  id: string
  displayName: string
  systemType: ConnectorSystemType
  sourceSystem: string
  description: string
  status: ConnectorStatus
  operations: ConnectorOperation[]
  suppliedContext: string[]
}

export interface ConnectorCapabilitySummary {
  connector: ConnectorDescriptor
  health: ConnectorHealth
}

export interface SchedulerConnectorReadModel {
  jobs: ScheduledJob[]
  dependencies: ServiceDependency[]
  evidenceItems: EvidenceItem[]
}

export interface MetadataConnectorReadModel {
  metadataIssues: MetadataIssue[]
  evidenceItems: EvidenceItem[]
}

export interface IncidentConnectorReadModel {
  incidents: Incident[]
  dependencies: ServiceDependency[]
  evidenceItems: EvidenceItem[]
}

export interface ApprovalConnectorReadModel {
  approvalRequests: ApprovalRequest[]
  evidenceItems: EvidenceItem[]
}

export interface MockCloseGuardianConnector<TReadModel> {
  descriptor: ConnectorDescriptor
  health(): ConnectorHealth
  read(): TReadModel
}

export interface ConnectorRegistryResponse {
  connectors: ConnectorCapabilitySummary[]
}
