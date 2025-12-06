<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import Icon from '@/components/atoms/Icon.vue';
import ToggleSwitch from '@/components/atoms/ToggleSwitch.vue';
import { useTheme } from '@/composables/useTheme';

const route = useRoute();
const { theme, toggleTheme } = useTheme();

const navItems = [
  {
    name: 'Execute Task',
    to: { name: 'execute' as const },
    icon: 'play'
  },
  {
    name: 'Task History',
    to: { name: 'history' as const },
    icon: 'history'
  },
  {
    name: 'System Monitor',
    to: { name: 'monitor' as const },
    icon: 'monitor'
  }
] as const;

const isActive = (name: string) => route.name === name;

const themeLabel = computed(() => (theme.value === 'light' ? 'Light mode' : 'Dark mode'));
</script>

<template>
  <aside
    class="flex w-full flex-shrink-0 flex-col border-b border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:h-screen md:w-64 md:border-b-0 md:border-r md:px-6 md:py-6"
  >
    <div>
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Peer Agent
        </h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Task Routing System
        </p>
      </div>

      <nav class="space-y-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="block"
        >
          <div
            :class="[
              'flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.to.name) ?
                'bg-pa-blue text-white shadow-sm' :
                'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
          >
            <Icon :name="item.icon as any" :size="18" />
            <span>{{ item.name }}</span>
          </div>
        </RouterLink>
      </nav>
    </div>

    <div class="mt-auto space-y-4 pt-6">
      <div class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        <span class="inline-flex items-center gap-1">
          <Icon :name="theme === 'light' ? 'sun' : 'moon'" :size="14" />
          {{ themeLabel }}
        </span>
        <ToggleSwitch :model-value="theme === 'dark'" @update:model-value="toggleTheme" />
      </div>

      <div class="border-t border-slate-200 pt-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        v1.0.0
      </div>
    </div>
  </aside>
</template>
