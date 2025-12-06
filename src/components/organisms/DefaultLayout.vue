<script setup lang="ts">
import { onMounted } from 'vue';
import SidebarNav from '@/components/molecules/SidebarNav.vue';
import ToastContainer from '@/components/organisms/ToastContainer.vue';
import { RouterView } from 'vue-router';
import { isLocalEnv } from '@/config/env';

const debugLayout = (context: string): void => {
  if (!isLocalEnv || typeof window === 'undefined') return;
  console.debug('[DefaultLayout]', context, {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  });
};

onMounted(() => {
  debugLayout('mounted');
});
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-pa-bg dark:bg-slate-900 md:h-screen md:flex-row md:overflow-hidden"
  >
    <SidebarNav />
    <main
      class="flex-1 overflow-y-visible px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10 md:overflow-y-auto"
    >
      <ToastContainer />
      <RouterView />
    </main>
  </div>
</template>
