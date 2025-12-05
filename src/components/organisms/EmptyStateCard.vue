<template>
  <section class="card mt-6">
    <div class="card-inner flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div
        class="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-7 w-7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z"
            stroke="currentColor"
            stroke-width="2"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
        </svg>
      </div>
      <div class="text-sm font-semibold text-slate-900 dark:text-slate-50">
        No tasks yet
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400">
        Execute your first task to see it here
      </div>
    </div>
  </section>
</template>
