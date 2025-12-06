<script setup lang="ts">
import { computed } from 'vue';
import { isLocalEnv } from '@/config/env';

interface Props {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  change: [page: number];
}>();

const pages = computed(() => {
  const total = Math.max(0, props.totalPages);
  const result: number[] = [];
  for (let i = 1; i <= total; i += 1) {
    result.push(i);
  }
  return result;
});

const label = computed(() => {
  const total = Math.max(0, props.totalItems);
  const pagesCount = Math.max(0, props.totalPages);
  return `Total ${total} records \u2013 ${pagesCount} pages`;
});

const emitChange = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.page) return;
  if (isLocalEnv) {
    // eslint-disable-next-line no-console
    console.debug('[PaginationBar] change', {
      from: props.page,
      to: page,
      totalPages: props.totalPages
    });
  }
  emit('change', page);
};

const onPrevClick = () => {
  if (!props.hasPrevious || props.loading) return;
  emitChange(props.page - 1);
};

const onNextClick = () => {
  if (!props.hasNext || props.loading) return;
  emitChange(props.page + 1);
};

const onPageClick = (target: number) => {
  if (props.loading) return;
  emitChange(target);
};
</script>

<template>
  <div
    class="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center"
  >
    <div class="text-xs">
      {{ label }}
    </div>
    <div class="inline-flex items-center gap-1">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        :disabled="!hasPrevious || loading"
        @click="onPrevClick"
      >
        Prev
      </button>

      <button
        v-for="pageNumber in pages"
        :key="pageNumber"
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
        :class="
          pageNumber === page
            ? 'bg-pa-blue text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        "
        :disabled="loading"
        @click="onPageClick(pageNumber)"
      >
        {{ pageNumber }}
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        :disabled="!hasNext || loading"
        @click="onNextClick"
      >
        Next
      </button>
    </div>
  </div>
</template>
