import {reactive} from "vue";
import {auth} from "@/utiles/tauriCommonds.ts";
import router from "@/router/index.ts";

export class UserInfo {

    static info = reactive({
        token: '', // token
        userName: '', // 用户名
        userId: '', // 用户ID
        avatar: '',  // 头像
    });

    static async logout() {
        UserInfo.info.token = '';
        UserInfo.info.userName = '';
        UserInfo.info.userId = '';
        UserInfo.info.avatar = '';
        await auth.saveToken('');
        await router.replace('/login');
    }
}
