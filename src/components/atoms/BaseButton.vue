<script setup lang="ts">
import Icon from './Icon.vue';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

interface Props {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  iconLeft?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  iconLeft: null
});

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-pa-blue text-white hover:bg-blue-600 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500',
  secondary:
    'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm'
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pa-blue focus-visible:ring-offset-pa-bg',
      variantClasses[variant],
      sizeClasses[size]
    ]"
  >
    <Icon v-if="loading" name="spinner" class="mr-2" />
    <Icon v-else-if="iconLeft" :name="iconLeft as any" class="mr-2" />
    <span>
      <slot />
    </span>
  </button>
</template>
