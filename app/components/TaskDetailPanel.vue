<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">Critical blocker</p>
        <h2>{{ detail.task.title }}</h2>
      </div>
      <StatusBadge :value="detail.riskAssessment.level" />
    </header>

    <div class="task-meta">
      <div>
        <small>Owner</small>
        <strong>{{ detail.task.owner }}</strong>
      </div>
      <div>
        <small>Approver</small>
        <strong>{{ detail.task.approver }}</strong>
      </div>
      <div>
        <small>Due</small>
        <strong>{{ formatDate(detail.task.dueAt) }}</strong>
      </div>
      <div>
        <small>Readiness</small>
        <StatusBadge :value="detail.riskAssessment.readinessStatus" />
      </div>
    </div>

    <div class="blocker-grid">
      <article v-for="job in detail.scheduledJobs" :key="job.id" class="blocker-card">
        <div class="blocker-title">
          <span>Failed job</span>
          <StatusBadge :value="job.status" />
        </div>
        <h3>{{ job.name }}</h3>
        <p>{{ job.failureMessage }}</p>
        <dl>
          <div>
            <dt>Failure code</dt>
            <dd>{{ job.failureCode }}</dd>
          </div>
          <div>
            <dt>Last run</dt>
            <dd>{{ formatDate(job.lastRunAt) }}</dd>
          </div>
        </dl>
      </article>

      <article v-for="issue in detail.metadataIssues" :key="issue.id" class="blocker-card">
        <div class="blocker-title">
          <span>Metadata blocker</span>
          <StatusBadge :value="issue.status" />
        </div>
        <h3>{{ issue.productName }}</h3>
        <p>{{ issue.blockerReason }}</p>
        <dl>
          <div>
            <dt>Product code</dt>
            <dd>{{ issue.productCode }}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{{ issue.owner }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <div class="signals">
      <h3>Deterministic signals</h3>
      <ul>
        <li v-for="signal in detail.riskAssessment.signals" :key="signal.code">
          <StatusBadge :value="signal.severity" />
          <span>{{ signal.label }}</span>
        </li>
      </ul>
    </div>

    <div class="evidence">
      <h3>Evidence references</h3>
      <ul>
        <li v-for="evidence in detail.evidenceItems" :key="evidence.id">
          <span>{{ evidence.title }}</span>
          <small>{{ evidence.kind.replaceAll('_', ' ') }}</small>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TaskDetailResponse } from '../../shared/contracts'

defineProps<{
  detail: TaskDetailResponse
}>()

function formatDate(value?: string): string {
  if (!value) {
    return 'Not set'
  }

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
  padding: 20px;
}

.panel-header,
.blocker-title {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
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
  font-size: 21px;
  line-height: 1.2;
}

h3 {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 15px;
}

p {
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

.task-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0;
}

.task-meta div,
.blocker-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
}

small,
dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

strong,
dd {
  color: #0f172a;
  font-size: 14px;
}

.blocker-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.blocker-title span {
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
}

.signals,
.evidence {
  margin-top: 18px;
}

ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

li span {
  color: #334155;
  font-size: 14px;
}

@media (max-width: 920px) {
  .task-meta,
  .blocker-grid,
  dl {
    grid-template-columns: 1fr;
  }
}
</style>
