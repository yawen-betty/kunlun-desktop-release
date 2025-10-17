import {reactive} from "vue";

export class SystemInfo {
    static info = reactive({
        loginTitle:'', // 登录页标题
        loginBg:'', // 登录页背景图
    });
}
