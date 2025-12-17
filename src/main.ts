import {createApp} from 'vue';
import App from './App.vue';
import ViewUIPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import router from './router';
import 'virtual:svg-icons-register';
import HttpClient from '@/api/HttpClient.ts';
import directive from './directive';
import '@/assets/styles/index.scss';
import SvgIcon from '@/components/svgIcon/index.vue';
import VuePdf from 'vue3-pdfjs';

const app = createApp(App);
app.use(router).mount('#app');
app.use(ViewUIPlus);
app.use(HttpClient.create());
app.use(VuePdf);

app.component('SvgIcon', SvgIcon);

Object.keys(directive).forEach((key) => {
    app.directive(key, (directive as Record<string, any>)[key]);
});
