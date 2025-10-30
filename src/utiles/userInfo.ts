import {reactive} from "vue";
import {auth} from "@/utiles/tauriCommonds.ts";
import {useRouter} from "vue-router";

export class UserInfo {

    static info = reactive({
        token: '', // token
        userName: '聘小方聘小方', // 用户名
        userId: '', // 用户ID
        avatar: 'https://ww2.sinaimg.cn/mw690/007ut4Uhly1hx4v375r00j30u017cdla.jpg',  // 头像
    });

    static async logout() {
        UserInfo.info.token = '';
        UserInfo.info.userName = '';
        UserInfo.info.userId = '';
        UserInfo.info.avatar = '';
        await auth.saveToken('');
        await useRouter().replace('/login');
    }
}
