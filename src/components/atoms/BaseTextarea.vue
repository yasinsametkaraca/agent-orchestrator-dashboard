<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 6
});
const emit = defineEmits<{
  'update:modelValue': [val: string];
}>();

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <textarea
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    @input="onInput"
    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-pa-blue focus:outline-none focus:ring-2 focus:ring-pa-blue/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
  />
</template>
