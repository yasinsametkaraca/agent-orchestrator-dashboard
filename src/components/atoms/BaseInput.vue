<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [val: string];
}>();

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <input
    :value="modelValue"
    :placeholder="placeholder"
    @input="onInput"
    class="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-pa-blue focus:outline-none focus:ring-2 focus:ring-pa-blue/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
  />
</template>
