<script setup lang="ts">
import SidebarNav from '@/components/molecules/SidebarNav.vue';
import ToastContainer from '@/components/organisms/ToastContainer.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="flex h-screen bg-pa-bg dark:bg-slate-900 overflow-hidden">
    <SidebarNav />
    <main class="flex-1 overflow-y-auto px-8 py-8 md:px-10 md:py-10">
      <ToastContainer />
      <RouterView />
    </main>
  </div>
</template>
