<script setup lang="ts">
import type { TaskStatus } from '@/types/domain';
import Icon from '@/components/atoms/Icon.vue';

interface Props {
  status: TaskStatus;
}

const props = defineProps<Props>();

const steps = [
  { id: 'queued', label: 'Queued' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' }
] as const;

type StepId = (typeof steps)[number]['id'];

// "İlerleme index’i" mantığı:
// queued      -> 0
// processing  -> 1
// failed      -> 2  (completed aşamasına gelmiş ama hata almış)
// completed   -> 3  (tüm adımlar tamam)
const progressIndexByStatus: Record<TaskStatus, number> = {
  queued: 0,
  processing: 1,
  failed: 2,
  completed: 3
};

const stepIndexById: Record<StepId, number> = {
  queued: 0,
  processing: 1,
  completed: 2
};

const getStepState = (stepId: StepId, status: TaskStatus) => {
  const progressIndex = progressIndexByStatus[status];
  const stepIndex = stepIndexById[stepId];

  // "failed" durumunda son adımı aktif (kırmızı X) göstermek istiyoruz.
  if (status === 'failed' && stepId === 'completed') {
    return 'active' as const;
  }

  if (progressIndex > stepIndex) return 'done' as const;
  if (progressIndex === stepIndex) return 'active' as const;
  return 'pending' as const;
};

</script>

<template>
  <div class="mt-4 flex items-center justify-between gap-4">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      class="flex flex-1 items-center gap-3"
    >
      <div class="flex items-center gap-3">
        <div
          :class="[
            'flex h-8 w-8 items-center justify-center rounded-full border-2',
            (() => {
              const state = getStepState(step.id, status);
              if (state === 'done') {
                return 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30';
              }
              if (state === 'active') {
                if (status === 'failed' && step.id === 'completed') {
                  return 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/30';
                }
                return 'border-pa-blue bg-blue-50 text-pa-blue dark:bg-blue-900/30';
              }
              return 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500';
            })()
          ]"
        >
          <Icon
            v-if="getStepState(step.id, status) === 'done'"
            name="check"
            :size="16"
          />
          <Icon
            v-else-if="getStepState(step.id, status) === 'active'"
            :name="status === 'failed' && step.id === 'completed' ? 'close' : 'spinner'"
            :size="16"
          />
          <Icon v-else name="circle" :size="14" />
        </div>
        <div class="text-sm">
          <div class="font-medium text-slate-900 dark:text-slate-100">
            {{ step.label }}
          </div>
        </div>
      </div>

      <div v-if="index < steps.length - 1" class="flex-1">
        <div
          :class="[
            'h-px w-full',
            getStepState(steps[index + 1].id, status) === 'done' ||
            getStepState(steps[index].id, status) === 'done'
              ? 'bg-emerald-400'
              : getStepState(steps[index].id, status) === 'active'
                ? 'bg-pa-blue'
                : 'bg-slate-200 dark:bg-slate-700'
          ]"
        />
      </div>
    </div>
  </div>
</template>
