import {reactive} from 'vue';
import {auth} from '@/utiles/tauriCommonds.ts';
import router from '@/router/index.ts';
import {ModelAccountBean} from '@/api/user/dto/bean/ModelAccountBean.ts';
import {robotManager} from "@/robot/service";

type TResumeMap = Record<string, { trick: string; template: string }>;

export class UserInfo {
    static info = reactive({
        token: '', // token
        userName: '', // 用户名
        userId: '', // 用户ID
        avatar: '', // 头像,
        runningResumeId: '', // 正在制作的简历ID
        resumeMap: {} as TResumeMap, // { 'resumeId' : { trick: '话术', 'template': '模板' } }
        modelList: [] as ModelAccountBean[], // 模型列表
        isRunningTask: false, // 是否执行任务中
        matchAnalysisPrompt: '' // 匹配分析提示词
    });

    static async logout() {
        robotManager.cleanup()
        UserInfo.info.token = '';
        UserInfo.info.userName = '';
        UserInfo.info.userId = '';
        UserInfo.info.avatar = '';
        UserInfo.info.runningResumeId = '';
        UserInfo.info.resumeMap = {};
        UserInfo.info.modelList = [];
        UserInfo.info.isRunningTask = false;
        UserInfo.info.matchAnalysisPrompt = '';
        await auth.saveToken('');
        await router.replace('/login');
    }
}
