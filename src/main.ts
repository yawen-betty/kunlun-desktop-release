import {createApp} from "vue";
import App from "./App.vue";
import ViewUIPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import router from './router';
import 'virtual:svg-icons-register';
import HttpClient from "@/api/HttpClient.ts";
import directive from './directive';
import '@/assets/styles/index.scss';
import SvgIcon from '@/components/svgIcon/index.vue';

// 导入Tauri API
import {invoke} from '@tauri-apps/api/core';

const app = createApp(App);
app.use(router).mount('#app');
app.use(ViewUIPlus);
app.use(HttpClient.create())

app.component('SvgIcon', SvgIcon)

// TODO 取已有token 的时候需要判断是否需要跳转填写个人信息页面


Object.keys(directive).forEach(key => {
    app.directive(key, (directive as Record<string, any>)[key]);
});
