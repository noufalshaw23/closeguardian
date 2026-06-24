<template>
  <span class="status-badge" :class="toneClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: string
}>()

const label = computed(() => props.value.replaceAll('_', ' '))

const toneClass = computed(() => {
  if (['critical', 'blocked', 'close_blocking', 'failed', 'pending', 'pending_approval'].includes(props.value)) {
    return 'status-badge--critical'
  }

  if (['high', 'not_ready', 'degraded', 'requires_approval', 'approved'].includes(props.value)) {
    return 'status-badge--warning'
  }

  if (['ready', 'healthy', 'safe', 'complete', 'executed'].includes(props.value)) {
    return 'status-badge--ok'
  }

  return 'status-badge--neutral'
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-badge--critical {
  border-color: #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.status-badge--warning {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.status-badge--ok {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.status-badge--neutral {
  border-color: #d9e2ec;
  background: #f8fafc;
  color: #475569;
}
</style>
