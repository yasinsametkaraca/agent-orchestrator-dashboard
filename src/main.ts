import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/tailwind.css';
import './styles/globals.css';
import { applyThemeToDocument, resolveInitialTheme } from './composables/useTheme';
import { useUiStore } from './store/useUiStore';

const initialTheme = resolveInitialTheme();
applyThemeToDocument(initialTheme);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const uiStore = useUiStore();
uiStore.setTheme(initialTheme);

app.mount('#app');
