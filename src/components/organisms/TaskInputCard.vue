<script setup lang="ts">
import BaseTextarea from '@/components/atoms/BaseTextarea.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

interface Props {
  modelValue: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  'update:modelValue': [val: string];
  execute: [];
}>();

const updateValue = (val: string) => {
  emit('update:modelValue', val);
};

const onExecute = () => {
  emit('execute');
};
</script>

<template>
  <section class="card">
    <div class="card-inner">
      <div class="mb-3 text-sm font-medium text-slate-800 dark:text-slate-100">
        Task Description
      </div>
      <BaseTextarea
        :model-value="modelValue"
        :rows="7"
        placeholder="Enter your task here..., 'Write a blog post about AI' or 'Create a React component for a login form'"
        @update:model-value="updateValue"
      />
      <div class="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <p>Tasks are queued and processed automatically.</p>
        <BaseButton
          variant="primary"
          icon-left="send"
          :loading="loading"
          :disabled="!modelValue.trim()"
          @click="onExecute"
        >
          Execute Task
        </BaseButton>
      </div>
    </div>
  </section>
</template>
