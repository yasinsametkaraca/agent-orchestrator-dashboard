import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@/components/organisms/DefaultLayout.vue';
import TaskExecutionPage from '@/pages/TaskExecutionPage.vue';
import TaskHistoryPage from '@/pages/TaskHistoryPage.vue';
import SystemMonitorPage from '@/pages/SystemMonitorPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'execute',
        component: TaskExecutionPage
      },
      {
        path: 'history',
        name: 'history',
        component: TaskHistoryPage
      },
      {
        path: 'monitor',
        name: 'monitor',
        component: SystemMonitorPage
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'execute' }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
