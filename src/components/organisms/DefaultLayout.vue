<script setup lang="ts">
import SidebarNav from '@/components/molecules/SidebarNav.vue';
import ToastContainer from '@/components/organisms/ToastContainer.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="flex h-screen flex-col bg-pa-bg dark:bg-slate-900 md:flex-row">
    <SidebarNav />
    <main
      class="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10"
    >
      <ToastContainer />
      <RouterView />
    </main>
  </div>
</template>
