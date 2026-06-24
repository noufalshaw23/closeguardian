<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
      </div>
    </header>

    <ol class="timeline">
      <li v-for="item in items" :key="item.id">
        <div class="marker" aria-hidden="true" />
        <div>
          <strong>{{ item.summary }}</strong>
          <span>{{ item.actorId }} · {{ formatDate(item.occurredAt) }}</span>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { AuditEvent } from '../../shared/domain'

withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    items: AuditEvent[]
  }>(),
  {
    eyebrow: 'Audit trail',
    title: 'Activity preview',
  },
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
  margin-bottom: 14px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
}

.timeline {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline li {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr);
  gap: 10px;
}

.marker {
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 50%;
  background: #0f766e;
}

strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.35;
}

span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}
</style>
