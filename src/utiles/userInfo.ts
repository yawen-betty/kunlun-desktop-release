import {reactive} from "vue";
import {auth} from "@/utiles/tauriCommonds.ts";
import router from "@/router/index.ts";

type TResumeMap = Record<string, { trick: string; template: string; }>

export class UserInfo {

    static info = reactive({
        token: '', // token
        userName: '', // 用户名
        userId: '', // 用户ID
        avatar: '',  // 头像,
        runningResumeId: '', // 正在制作的简历ID
        resumeMap: {} as TResumeMap, // { 'resumeId' : { trick: '话术', 'template': '模板' } }
    });

    static async logout() {
        UserInfo.info.token = '';
        UserInfo.info.userName = '';
        UserInfo.info.userId = '';
        UserInfo.info.avatar = '';
        UserInfo.info.runningResumeId = '';
        await auth.saveToken('');
        await router.replace('/login');
    }
}
