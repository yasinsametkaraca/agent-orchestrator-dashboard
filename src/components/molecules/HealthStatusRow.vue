<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  healthy: boolean;
}

defineProps<Props>();
</script>

<template>
  <div class="flex items-start gap-3 py-2">
    <div
      :class="[
        'mt-1 flex h-6 w-6 items-center justify-center rounded-full border',
        healthy
          ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'border-rose-500 bg-rose-50 text-rose-600 dark:border-rose-600 dark:bg-rose-900/40 dark:text-rose-300'
      ]"
    >
      <span class="text-xs font-semibold">
        {{ healthy ? '✔' : '!' }}
      </span>
    </div>
    <div>
      <div class="text-sm font-medium text-slate-900 dark:text-slate-100">
        {{ title }}
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400">
        {{ description }}
      </div>
    </div>
  </div>
</template>
