import type {
  ApprovalDecision,
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalsResponse,
  AuditResponse,
  DashboardResponse,
  RecommendationsResponse,
  TaskDetailResponse,
  TasksResponse,
} from '../../shared/contracts'

export function useCloseGuardianApi() {
  const dashboard = useState<DashboardResponse | null>('closeguardian-dashboard', () => null)
  const tasks = useState<TasksResponse | null>('closeguardian-tasks', () => null)
  const taskDetail = useState<TaskDetailResponse | null>('closeguardian-task-detail', () => null)
  const recommendations = useState<RecommendationsResponse | null>(
    'closeguardian-recommendations',
    () => null,
  )
  const approvals = useState<ApprovalsResponse | null>('closeguardian-approvals', () => null)
  const audit = useState<AuditResponse | null>('closeguardian-audit', () => null)
  const pending = useState<boolean>('closeguardian-pending', () => false)
  const errorMessage = useState<string | null>('closeguardian-error', () => null)

  async function refreshAll() {
    pending.value = true
    errorMessage.value = null

    try {
      const [
        dashboardResponse,
        tasksResponse,
        recommendationsResponse,
        approvalsResponse,
        auditResponse,
      ] = await Promise.all([
        $fetch<DashboardResponse>('/api/dashboard'),
        $fetch<TasksResponse>('/api/tasks'),
        $fetch<RecommendationsResponse>('/api/recommendations'),
        $fetch<ApprovalsResponse>('/api/approvals'),
        $fetch<AuditResponse>('/api/audit'),
      ])

      dashboard.value = dashboardResponse
      tasks.value = tasksResponse
      recommendations.value = recommendationsResponse
      approvals.value = approvalsResponse
      audit.value = auditResponse
      taskDetail.value = await $fetch<TaskDetailResponse>(
        `/api/tasks/${dashboardResponse.primaryTask.id}`,
      )
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Unable to load CloseGuardian data.'
    } finally {
      pending.value = false
    }
  }

  async function decideApproval(
    approvalRequestId: string,
    decision: ApprovalDecision,
  ): Promise<ApprovalDecisionResponse | undefined> {
    pending.value = true
    errorMessage.value = null

    try {
      const body: ApprovalDecisionRequest = {
        decision,
        decidedBy: 'Daniel Ortiz',
        notes:
          decision === 'approve'
            ? 'Approved for controlled rerun after dependency mitigation.'
            : 'Rejected pending additional controller review.',
      }
      const response = await $fetch<ApprovalDecisionResponse>(
        `/api/approvals/${approvalRequestId}/decision`,
        {
          method: 'POST',
          body,
        },
      )
      await refreshAll()

      return response
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Unable to record approval decision.'

      return undefined
    } finally {
      pending.value = false
    }
  }

  return {
    dashboard,
    tasks,
    taskDetail,
    recommendations,
    approvals,
    audit,
    pending,
    errorMessage,
    refreshAll,
    decideApproval,
  }
}
