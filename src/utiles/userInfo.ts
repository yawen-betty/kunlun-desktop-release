import {reactive} from 'vue';
import {auth} from '@/utiles/tauriCommonds.ts';
import router from '@/router/index.ts';
import {ModelAccountBean} from '@/api/user/dto/bean/ModelAccountBean.ts';
import {robotManager} from "@/robot/service";

type TResumeMap = Record<string, { trick: string; template: string }>;

// trick结构： score： number， issues: 问题列表Array<QuestionBean>
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
        await robotManager.cleanup()
        UserInfo.info.token = '';
        UserInfo.info.userName = '';
        UserInfo.info.userId = '';
        UserInfo.info.avatar = '';
        UserInfo.info.runningResumeId = '';
        UserInfo.info.resumeMap = {};
        UserInfo.info.modelList = [];
        UserInfo.info.matchAnalysisPrompt = '';
        UserInfo.info.isRunningTask = false;
        await auth.saveToken('');
        await router.replace('/login');
    }

    /**
     * 取话术
     * @param key 简历id
     */
    static getResumeMap(key: string) {
        const resumeMap = JSON.parse(localStorage.getItem('resumeMap') || '{}') as TResumeMap;

        UserInfo.info.resumeMap = resumeMap;
        return UserInfo.info.resumeMap[UserInfo.info.userId + key];
    }

    static setResumeMap(key: string, value: { trick: string; template: string }) {
        UserInfo.info.resumeMap[UserInfo.info.userId + key] = value;
        localStorage.setItem('resumeMap', JSON.stringify(UserInfo.info.resumeMap))
    }
}
