<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">Controller review</p>
        <h2>Approval queue</h2>
      </div>
      <StatusBadge :value="approval.status" />
    </header>

    <div class="approval-body">
      <div>
        <small>Remediation</small>
        <h3>{{ action?.title ?? approval.recommendedActionId }}</h3>
        <p>{{ action?.summary ?? approval.reason }}</p>
      </div>

      <dl>
        <div>
          <dt>Approver</dt>
          <dd>{{ approval.approver }}</dd>
        </div>
        <div>
          <dt>Risk</dt>
          <dd><StatusBadge :value="approval.riskLevel" /></dd>
        </div>
        <div>
          <dt>Requested</dt>
          <dd>{{ formatDate(approval.requestedAt) }}</dd>
        </div>
        <div>
          <dt>Decision</dt>
          <dd>{{ approval.decisionNotes ?? 'Awaiting controller decision' }}</dd>
        </div>
      </dl>
    </div>

    <div class="approval-actions">
      <button
        type="button"
        class="button button--primary"
        :disabled="disabled"
        @click="$emit('decide', approval.id, 'approve')"
      >
        Approve rerun
      </button>
      <button
        type="button"
        class="button"
        :disabled="disabled"
        @click="$emit('decide', approval.id, 'reject')"
      >
        Reject
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ApprovalDecision } from '../../shared/contracts'
import type { ApprovalRequest, RecommendedAction } from '../../shared/domain'

const props = defineProps<{
  approval: ApprovalRequest
  actions: RecommendedAction[]
  disabled?: boolean
}>()

defineEmits<{
  decide: [approvalRequestId: string, decision: ApprovalDecision]
}>()

const action = computed(() =>
  props.actions.find((candidate) => candidate.id === props.approval.recommendedActionId),
)

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>

<style scoped>
.panel {
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.panel-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h2,
h3,
p {
  margin-top: 0;
}

h2 {
  margin-bottom: 0;
  color: #0f172a;
  font-size: 20px;
}

h3 {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 16px;
}

p {
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

.approval-body {
  display: grid;
  gap: 14px;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

dl div {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 10px;
}

small,
dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

dd {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 14px;
}

.approval-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.button {
  min-height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  font-weight: 800;
  padding: 0 14px;
}

.button--primary {
  border-color: #0f766e;
  background: #0f766e;
  color: #ffffff;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 640px) {
  dl {
    grid-template-columns: 1fr;
  }
}
</style>
