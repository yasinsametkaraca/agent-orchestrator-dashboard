<script setup lang="ts">
import Icon from '@/components/atoms/Icon.vue';

interface Props {
  title: string;
  value: string;
  helper?: string;
  icon: 'clock' | 'check' | 'chart' | 'history';
}

defineProps<Props>();
</script>

<template>
  <div class="card h-full">
    <div class="card-inner flex flex-col gap-3">
      <div
        class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-pa-blue dark:from-blue-900/40 dark:to-blue-800/40"
      >
        <Icon :name="icon" />
      </div>
      <div class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {{ title }}
      </div>
      <div class="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        {{ value }}
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400">
        {{ helper }}
      </div>
    </div>
  </div>
</template>
