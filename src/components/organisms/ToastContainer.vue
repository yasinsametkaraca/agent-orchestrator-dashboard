<script setup lang="ts">
import { useUiStore } from '@/store/useUiStore';
import Icon from '@/components/atoms/Icon.vue';

const uiStore = useUiStore();
</script>

<template>
  <div class="pointer-events-none fixed right-6 top-6 z-50 flex flex-col gap-3">
    <div
      v-for="toast in uiStore.toasts"
      :key="toast.id"
      class="pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="mt-0.5">
        <Icon
          :name="toast.type === 'error' ? 'close' : toast.type === 'success' ? 'check' : 'info'"
          :size="16"
          :class="[
            toast.type === 'error'
              ? 'text-rose-500'
              : toast.type === 'success'
                ? 'text-emerald-500'
                : 'text-slate-400'
          ]"
        />
      </div>
      <div class="flex-1 text-slate-800 dark:text-slate-100">
        {{ toast.message }}
      </div>
      <button
        type="button"
        class="mt-0.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        @click="uiStore.removeToast(toast.id)"
      >
        <Icon name="close" :size="14" />
      </button>
    </div>
  </div>
</template>
