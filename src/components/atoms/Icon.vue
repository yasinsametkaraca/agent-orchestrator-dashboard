<script setup lang="ts">
interface Props {
  name:
    | 'play'
    | 'history'
    | 'monitor'
    | 'search'
    | 'eye'
    | 'close'
    | 'send'
    | 'check'
    | 'circle'
    | 'spinner'
    | 'sun'
    | 'moon'
    | 'clock'
    | 'chart'
    | 'info';
  size?: number;
}

const props = defineProps<Props>();

const size = props.size ?? 18;
</script>

<template>
  <svg
    v-if="name === 'play'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M8 5v14l11-7L8 5z"
      class="stroke-current"
      stroke-width="2"
      stroke-linejoin="round"
      fill="currentColor"
    />
  </svg>

  <svg
    v-else-if="name === 'history'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M4 4v6h6M12 8v5l3 3M5 13a7 7 0 1 0 2-5"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'monitor'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      stroke-width="2"
    />
    <path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'search'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" />
    <path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'eye'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
  </svg>

  <svg
    v-else-if="name === 'close'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'send'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M4 4l16 8-16 8 4-8-4-8z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
      fill="currentColor"
    />
  </svg>

  <svg
    v-else-if="name === 'check'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'circle'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" />
  </svg>

  <svg
    v-else-if="name === 'spinner'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="animate-spin flex-shrink-0"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      stroke-width="2"
      stroke-opacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'sun'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
    <path
      d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4L4.2 19.8M19.8 4.2l-1.4 1.4"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'moon'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'clock'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" />
    <path d="M12 8v4l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'chart'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <path
      d="M4 20V4M4 20h16M8 17v-5M12 17V7M16 17v-3"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
  
  <svg
    v-else-if="name === 'info'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="flex-shrink-0"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
    <path
      d="M12 16v-4M12 8h.01"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
