<template>
  <main class="page-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">CloseGuardian</p>
        <h1>Finance close command center</h1>
        <p class="subhead">
          Revenue close assurance for {{ dashboard?.scenario.closePeriod ?? 'the current period' }}.
        </p>
      </div>

      <button type="button" class="refresh-button" :disabled="pending" @click="refreshAll">
        Refresh
      </button>
    </header>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

    <div v-if="dashboard && taskDetail" class="content-grid">
      <ReadinessSummary
        class="full-span"
        :summary="dashboard.summary"
        :primary-task="dashboard.primaryTask"
        :risk-assessment="dashboard.riskAssessment"
      />

      <ExplanationPanel
        class="full-span"
        :explanation="controllerExplanation"
        :loading="explanationPending"
        :status="explanationStatus"
        :message="explanationMessage"
        @refresh="refreshControllerExplanation()"
      />

      <section class="panel recommended-actions">
        <div class="panel-heading">
          <p class="eyebrow">Recommended actions</p>
          <h2>Deterministic next steps</h2>
        </div>
        <ul>
          <li
            v-for="action in recommendations?.recommendedActions ?? dashboard.recommendedActions"
            :key="action.id"
          >
            <div>
              <strong>{{ action.title }}</strong>
              <span>{{ action.summary }}</span>
            </div>
            <StatusBadge :value="action.executionMode" />
          </li>
        </ul>
      </section>

      <section class="panel agent-panel">
        <div class="panel-heading">
          <p class="eyebrow">Agent activity</p>
          <h2>Orchestration summary</h2>
        </div>
        <article v-for="run in dashboard.agentRuns" :key="run.id">
          <StatusBadge :value="run.status" />
          <strong>{{ getPersona(run.role)?.displayName ?? run.role.replaceAll('_', ' ') }}</strong>
          <p>{{ getPersona(run.role)?.purpose ?? run.summary }}</p>
          <small v-if="getPersona(run.role)">
            Guardrail: {{ getPersona(run.role)?.controlledFieldsNotDecided.slice(0, 2).join(', ') }}
          </small>
        </article>
      </section>

      <TaskDetailPanel class="wide-span" :detail="taskDetail" />

      <ApprovalQueue
        v-for="approval in approvals?.approvalRequests ?? dashboard.approvalRequests"
        :key="approval.id"
        :approval="approval"
        :actions="recommendations?.recommendedActions ?? dashboard.recommendedActions"
        :disabled="pending || approval.status !== 'pending'"
        @decide="decideApproval"
      />

      <AuditActivity
        :items="(audit?.auditEvents ?? dashboard.auditEvents).slice(0, 6)"
        eyebrow="Audit trail"
        title="Decision history"
      />
    </div>

    <section v-else class="loading-panel">
      Loading close command center...
    </section>
  </main>
</template>

<script setup lang="ts">
import type { AgentRole } from '../../shared/domain'

const {
  dashboard,
  taskDetail,
  recommendations,
  approvals,
  audit,
  agentPersonas,
  controllerExplanation,
  explanationPending,
  explanationStatus,
  explanationMessage,
  pending,
  errorMessage,
  refreshAll,
  decideApproval,
  refreshControllerExplanation,
} = useCloseGuardianApi()

await refreshAll()
await refreshControllerExplanation()

function getPersona(role: AgentRole) {
  return agentPersonas.value?.personas.find((persona) => persona.id === role)
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: #eef3f7;
  color: #0f172a;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  padding: 28px;
}

.topbar {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto 18px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.1;
}

.subhead {
  margin: 8px 0 0;
  color: #475569;
  font-size: 15px;
}

.refresh-button {
  min-width: 96px;
  min-height: 40px;
  border: 1px solid #0f172a;
  border-radius: 6px;
  background: #0f172a;
  color: #ffffff;
  cursor: pointer;
  font-weight: 800;
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 16px;
  max-width: 1280px;
  margin: 0 auto;
}

.full-span {
  grid-column: 1 / -1;
}

.wide-span {
  grid-row: span 2;
}

.panel,
.loading-panel,
.error-banner {
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  background: #ffffff;
}

.panel,
.loading-panel {
  padding: 18px;
}

.error-banner {
  max-width: 1280px;
  margin: 0 auto 16px;
  border-color: #fecaca;
  background: #fff1f2;
  color: #be123c;
  padding: 12px 14px;
  font-weight: 700;
}

.panel-heading {
  margin-bottom: 14px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 20px;
}

.recommended-actions ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recommended-actions li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.recommended-actions strong,
.agent-panel strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
}

.recommended-actions span,
.agent-panel p,
.agent-panel small {
  display: block;
  margin-top: 4px;
  color: #475569;
  font-size: 13px;
  line-height: 1.45;
}

.agent-panel article {
  display: grid;
  gap: 8px;
}

.agent-panel strong {
  text-transform: capitalize;
}

.agent-panel small {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.loading-panel {
  max-width: 1280px;
  margin: 0 auto;
  color: #475569;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .wide-span {
    grid-row: auto;
  }
}

@media (max-width: 720px) {
  .page-shell {
    padding: 18px;
  }

  .topbar,
  .recommended-actions li {
    flex-direction: column;
  }

  h1 {
    font-size: 28px;
  }
}
</style>
