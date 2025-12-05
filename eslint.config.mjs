import { globalIgnores } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

// Flat config for ESLint v9+
// - Vue 3 + TypeScript via @vue/eslint-config-typescript
// - Prettier integration via @vue/eslint-config-prettier/skip-formatting
// - Global ignores for build artifacts and coverage
export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  // Ignore build output and coverage
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  // Vue core rules (composition API / SFC awareness)
  pluginVue.configs['flat/essential'],

  // TypeScript-aware rules
  vueTsConfigs.recommended,

  // Defer formatting concerns to Prettier
  skipFormatting,

  // Project-specific overrides
  {
    rules: {
      // Single-file components such as "App.vue", "SidebarNav.vue" etc.
      'vue/multi-word-component-names': 'off',

      // This project deliberately uses console.debug / console.error guarded by isLocalEnv.
      // We disable no-console so that --max-warnings=0 does not fail on local debug statements.
      'no-console': 'off',

      // Allow explicit any for now; you can tighten this later when codebase is fully cleaned.
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
);
