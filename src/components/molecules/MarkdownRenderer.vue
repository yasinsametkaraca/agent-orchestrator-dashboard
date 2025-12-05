<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

interface Props {
  content: string;
}

const props = defineProps<Props>();

marked.setOptions({
  gfm: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

const rendered = computed(() => {
  const raw = marked.parse(props.content || '');
  return DOMPurify.sanitize(raw.toString());
});
</script>

<template>
  <div class="prose max-w-none prose-sm dark:prose-invert" v-html="rendered" />
</template>
