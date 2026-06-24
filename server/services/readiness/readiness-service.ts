import type {
  BlockerSeverity,
  CloseTask,
  EvidenceItem,
  MetadataIssue,
  ReadinessStatus,
  ScheduledJob,
  ServiceDependency,
} from '../../../shared/domain'

export interface ReadinessInput {
  task: CloseTask
  scheduledJobs: ScheduledJob[]
  serviceDependencies: ServiceDependency[]
  metadataIssues: MetadataIssue[]
  evidenceItems: EvidenceItem[]
}

export interface EvidenceReadiness {
  requiredEvidenceIds: string[]
  attachedEvidenceIds: string[]
  missingEvidenceIds: string[]
  ready: boolean
}

export interface ReadinessDecision {
  readinessStatus: ReadinessStatus
  blockerSeverity: BlockerSeverity
  evidenceReadiness: EvidenceReadiness
  rationale: string[]
}

const severityRank: Record<BlockerSeverity, number> = {
  none: 0,
  watch: 1,
  material: 2,
  close_blocking: 3,
}

export function computeEvidenceReadiness(input: ReadinessInput): EvidenceReadiness {
  const requiredEvidenceIds = unique([
    ...input.task.evidenceIds,
    ...input.scheduledJobs.flatMap((job) => job.evidenceIds),
    ...input.metadataIssues.flatMap((issue) => issue.evidenceIds),
  ])
  const availableEvidenceIds = new Set(input.evidenceItems.map((evidence) => evidence.id))
  const attachedEvidenceIds = requiredEvidenceIds.filter((evidenceId) =>
    availableEvidenceIds.has(evidenceId),
  )
  const missingEvidenceIds = requiredEvidenceIds.filter(
    (evidenceId) => !availableEvidenceIds.has(evidenceId),
  )

  return {
    requiredEvidenceIds,
    attachedEvidenceIds,
    missingEvidenceIds,
    ready: missingEvidenceIds.length === 0,
  }
}

export function computeBlockerSeverity(input: ReadinessInput): BlockerSeverity {
  const severities: BlockerSeverity[] = []

  if (input.scheduledJobs.some((job) => job.status === 'failed' && job.criticality === 'close_critical')) {
    severities.push('close_blocking')
  }

  if (
    input.metadataIssues.some(
      (issue) =>
        issue.status === 'open' &&
        (issue.severity === 'high' || issue.severity === 'critical') &&
        issue.issueType === 'missing_revenue_mapping',
    )
  ) {
    severities.push('material')
  }

  if (input.serviceDependencies.some((dependency) => dependency.status === 'down')) {
    severities.push('close_blocking')
  }

  if (input.serviceDependencies.some((dependency) => dependency.status === 'degraded')) {
    severities.push('material')
  }

  if (!computeEvidenceReadiness(input).ready) {
    severities.push('watch')
  }

  if (input.task.status === 'blocked') {
    severities.push('material')
  }

  return maxBlockerSeverity(severities)
}

export function computeReadinessStatus(input: ReadinessInput): ReadinessStatus {
  const blockerSeverity = computeBlockerSeverity(input)
  const evidenceReadiness = computeEvidenceReadiness(input)
  const hasFailedCloseCriticalJob = input.scheduledJobs.some(
    (job) => job.status === 'failed' && job.criticality === 'close_critical',
  )
  const hasOpenHighMetadataIssue = input.metadataIssues.some(
    (issue) => issue.status === 'open' && (issue.severity === 'high' || issue.severity === 'critical'),
  )

  if (blockerSeverity === 'close_blocking' || hasFailedCloseCriticalJob) {
    return 'blocked'
  }

  if (hasOpenHighMetadataIssue || blockerSeverity === 'material') {
    return 'not_ready'
  }

  if (!evidenceReadiness.ready || blockerSeverity === 'watch') {
    return 'at_risk'
  }

  return 'ready'
}

export function evaluateReadiness(input: ReadinessInput): ReadinessDecision {
  const blockerSeverity = computeBlockerSeverity(input)
  const readinessStatus = computeReadinessStatus(input)
  const evidenceReadiness = computeEvidenceReadiness(input)
  const rationale: string[] = []

  if (input.scheduledJobs.some((job) => job.status === 'failed' && job.criticality === 'close_critical')) {
    rationale.push('A close-critical scheduled job is failed.')
  }

  if (
    input.metadataIssues.some(
      (issue) => issue.status === 'open' && issue.issueType === 'missing_revenue_mapping',
    )
  ) {
    rationale.push('An open revenue metadata mapping issue is blocking certification readiness.')
  }

  if (input.serviceDependencies.some((dependency) => dependency.status === 'degraded')) {
    rationale.push('A required service dependency is degraded during the close window.')
  }

  if (!evidenceReadiness.ready) {
    rationale.push('Required evidence is not fully attached.')
  }

  if (rationale.length === 0) {
    rationale.push('No deterministic close blockers were detected.')
  }

  return {
    readinessStatus,
    blockerSeverity,
    evidenceReadiness,
    rationale,
  }
}

function maxBlockerSeverity(severities: BlockerSeverity[]): BlockerSeverity {
  return severities.reduce<BlockerSeverity>(
    (current, next) => (severityRank[next] > severityRank[current] ? next : current),
    'none',
  )
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}
