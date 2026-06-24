<template>
  <section class="readiness">
    <div>
      <p class="eyebrow">Close readiness</p>
      <h2>{{ summary.readinessStatus.replaceAll('_', ' ') }}</h2>
      <p class="summary-copy">
        {{ primaryTask.businessImpact.summary }}
      </p>
    </div>

    <div class="readiness-score" aria-label="Risk score">
      <span>{{ riskAssessment.score }}</span>
      <small>risk score</small>
    </div>

    <div class="metric-grid">
      <div class="metric">
        <span>{{ formatCurrency(summary.revenueAtRiskUsd) }}</span>
        <small>revenue at risk</small>
      </div>
      <div class="metric">
        <span>{{ summary.pendingApprovalCount }}</span>
        <small>pending approval</small>
      </div>
      <div class="metric">
        <span>{{ summary.evidenceItemCount }}</span>
        <small>evidence records</small>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CloseTask, RiskAssessment } from '../../shared/domain'
import type { DashboardResponse } from '../../shared/contracts'

defineProps<{
  summary: DashboardResponse['summary']
  primaryTask: CloseTask
  riskAssessment: RiskAssessment
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
.readiness {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px;
  gap: 20px;
  align-items: stretch;
  border: 1px solid #d9e2ec;
  border-left: 5px solid #be123c;
  border-radius: 8px;
  background: #ffffff;
  padding: 22px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.1;
  text-transform: capitalize;
}

.summary-copy {
  max-width: 760px;
  margin: 12px 0 0;
  color: #475569;
  font-size: 15px;
  line-height: 1.5;
}

.readiness-score {
  display: grid;
  place-items: center;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
}

.readiness-score span {
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
}

.readiness-score small,
.metric small {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.metric-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px;
}

.metric span {
  display: block;
  margin-bottom: 4px;
  color: #0f172a;
  font-size: 20px;
  font-weight: 800;
}

@media (max-width: 760px) {
  .readiness,
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .readiness-score {
    min-height: 116px;
  }
}
</style>
