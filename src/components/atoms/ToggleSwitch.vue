<script setup lang="ts">
interface Props {
  modelValue: boolean;
  label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [val: boolean];
}>();

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
    @click="toggle"
  >
    <span v-if="label">{{ label }}</span>
    <span
      :class="[
        'relative inline-flex h-5 w-9 items-center rounded-full border border-slate-300 transition-colors dark:border-slate-600',
        modelValue ? 'bg-pa-blue border-pa-blue' : 'bg-slate-200 dark:bg-slate-700'
      ]"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          modelValue ? 'translate-x-4' : 'translate-x-1'
        ]"
      />
    </span>
  </button>
</template>
