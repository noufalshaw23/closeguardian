<template>
  <section class="explanation-panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">Controller explanation</p>
        <h2>Close assurance synthesis</h2>
        <p class="subcopy">Controller-ready narrative grounded in current risk, approval, evidence, and audit context.</p>
      </div>

      <button type="button" class="button" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? 'Generating' : explanation ? 'Regenerate' : 'Generate' }}
      </button>
    </header>

    <div v-if="loading" class="state state--loading">
      Generating controller-facing explanation...
    </div>

    <div v-else-if="status === 'unavailable'" class="state state--unavailable">
      <strong>Explanation unavailable</strong>
      <span>{{ message }}</span>
    </div>

    <div v-else-if="status === 'error'" class="state state--error">
      <strong>Explanation failed</strong>
      <span>{{ message }}</span>
    </div>

    <div v-else-if="explanation" class="explanation-body">
      <div class="summary-grid">
        <article>
          <small>Executive summary</small>
          <p>{{ explanation.explanation.executiveSummary }}</p>
        </article>
        <article>
          <small>Business impact</small>
          <p>{{ explanation.explanation.businessImpact }}</p>
        </article>
        <article>
          <small>Likely root cause</small>
          <p>{{ explanation.explanation.likelyRootCause }}</p>
        </article>
        <article>
          <small>Approval notes</small>
          <p>{{ explanation.explanation.approvalNotes }}</p>
        </article>
      </div>

      <details>
        <summary>Recommended action rationale</summary>
        <ul>
          <li v-for="action in explanation.explanation.recommendedActions" :key="action.actionId">
            <strong>{{ action.title }}</strong>
            <span>{{ action.controllerRationale }}</span>
          </li>
        </ul>
      </details>

      <details>
        <summary>Evidence basis and confidence</summary>
        <p class="confidence">{{ explanation.explanation.confidenceNotes }}</p>
        <ul>
          <li v-for="evidence in explanation.explanation.evidenceBasis" :key="evidence.evidenceId">
            <strong>{{ evidence.title }}</strong>
            <span>{{ evidence.relevance }}</span>
          </li>
        </ul>
      </details>

      <p class="generated">
        Generated {{ formatDate(explanation.generatedAt) }} from current close evidence.
      </p>
    </div>

    <div v-else class="state">
      Controller explanation has not been generated yet.
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ControllerExplanationResponse } from '../../shared/contracts'

defineProps<{
  explanation: ControllerExplanationResponse | null
  loading: boolean
  status: 'idle' | 'ready' | 'unavailable' | 'error'
  message: string | null
}>()

defineEmits<{
  refresh: []
}>()

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
.explanation-panel {
  border: 1px solid #cbd5e1;
  border-left: 5px solid #0f766e;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.panel-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
}

.subcopy,
.generated,
.confidence {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.button {
  min-height: 38px;
  border: 1px solid #0f766e;
  border-radius: 6px;
  background: #0f766e;
  color: #ffffff;
  cursor: pointer;
  font-weight: 800;
  padding: 0 14px;
  white-space: nowrap;
}

.button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

article,
.state,
details {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
}

small {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

p {
  margin: 6px 0 0;
  color: #334155;
  font-size: 14px;
  line-height: 1.5;
}

.state {
  color: #475569;
  font-size: 14px;
}

.state strong,
.state span {
  display: block;
}

.state span {
  margin-top: 4px;
}

.state--unavailable {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.state--error {
  border-color: #fecaca;
  background: #fff1f2;
  color: #be123c;
}

details {
  margin-top: 10px;
}

summary {
  color: #0f172a;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
}

ul {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

li {
  border-top: 1px solid #e2e8f0;
  padding-top: 8px;
}

li strong,
li span {
  display: block;
}

li strong {
  color: #0f172a;
  font-size: 14px;
}

li span {
  margin-top: 3px;
  color: #475569;
  font-size: 13px;
  line-height: 1.45;
}

.generated {
  text-align: right;
}

@media (max-width: 760px) {
  .panel-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
