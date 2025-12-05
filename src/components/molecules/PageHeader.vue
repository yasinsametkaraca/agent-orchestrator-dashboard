<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
}

defineProps<Props>();
</script>

<template>
  <header class="mb-8">
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">
      {{ title }}
    </h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {{ subtitle }}
    </p>
  </header>
</template>
