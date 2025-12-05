<script setup lang="ts">
interface Props {
  label: string;
  kind?: 'content-agent' | 'code-agent' | 'neutral';
}

const props = withDefaults(defineProps<Props>(), {
  kind: 'neutral'
});

const classMap: Record<string, string> = {
  'content-agent':
    'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/60',
  'code-agent':
    'bg-cyan-50 text-cyan-700 border border-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700/60',
  neutral:
    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
      classMap[kind]
    ]"
  >
    {{ label }}
  </span>
</template>
