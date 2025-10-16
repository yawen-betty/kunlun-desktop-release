import { createApp } from "vue";
import App from "./App.vue";
import ViewUIPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import '@/assets/styles/index.scss';
import router from './router';
import 'virtual:svg-icons-register';
import HttpClient from "@/api/HttpClient.ts";
import directive from './directive';

const app = createApp(App);
app.use(router).mount('#app');
app.use(ViewUIPlus);
app.use(HttpClient.create())

Object.keys(directive).forEach(key => {
  app.directive(key, (directive as Record<string, any>)[key]);
});
