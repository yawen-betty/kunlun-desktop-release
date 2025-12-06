<script lang="ts" setup>
import {onMounted, ref, provide, readonly, onUnmounted} from 'vue';
import {checkForUpdates} from '@/updater';
import UpdateDialog from '@/components/updateDialog/index.vue';
import {Config} from '@/Config.ts';
import {GetProfileInDto} from '@/api/user/dto/GetProfile.ts';
import {UserInfo} from '@/utiles/userInfo.ts';
import {UserService} from '@/service/UserService.ts';
import {auth} from '@/utiles/tauriCommonds.ts';
import {useRouter} from 'vue-router';
import {GetConfigInDto} from '@/api/admin/dto/GetConfig.ts';
import {GetMatchAnalysisPromptInDto} from '@/api/admin/dto/GetMatchAnalysisPrompt.ts';
import {SystemInfo} from '@/utiles/systemInfo.ts';
import {AdminService} from '@/service/AdminService.ts';
import emitter from '@/utiles/eventBus';
import {GetVersionInfoOutDto} from './api/admin/dto/GetVersionInfo';

const adminService = new AdminService();
const userService = new UserService();
const updateDialogRef = ref();
const currentVersion = Config.version; // 从 package.json 或 tauri.conf.json 读取
// 检测最新版本
const router = useRouter();

// 提供给子组件的配置状态

const versionUpdateInfo = ref<GetVersionInfoOutDto>(new GetVersionInfoOutDto());
// provide('versionUpdateInfo', versionUpdateInfo);

// 应用启动时自动检查更新
onMounted(async () => {
    emitter.on('forcedUpdate', manualCheckUpdate);
    // manualCheckUpdate();
    getConfigInfo();
    auth.getToken().then((token) => {
        if (token) {
            UserInfo.info.token = token;
            getUserInfo(userService);
        } else {
            router.push('/login');
        }
    });
    getMatchAnalysisPrompt();
});

onUnmounted(() => {
    emitter.off('forcedUpdate', manualCheckUpdate);
});

// 启动获取最新版本信息
const theCheckForUpdates = async () => {
    const res = await adminService.getVersionInfo({});
    // 检查是否有新版本
    versionUpdateInfo.value = res.data;
};

// 检查更新
const manualCheckUpdate = async () => {
    try {
        const result = await checkForUpdates(currentVersion, false);
        console.log('%c 🐞: manualCheckUpdate -> result ', 'font-size:16px;background-color:#ac6afe;color:white;', result);
        await theCheckForUpdates();
        if (result) {
            updateDialogRef.value?.show({
                ...result,
                currentVersion,
                versionUpdateDetails: versionUpdateInfo.value.content || ''
            });
        }
    } catch (e) {
        console.info('=====检测更新失败====', e);
    }
};

// 获取用户信息
const getUserInfo = (userService: UserService) => {
    userService.getProfile(new GetProfileInDto()).then((res) => {
        if (res.code === 200) {
            if (res.data.avatarUrl) {
                UserInfo.info.avatar = Config.baseUrl + res.data.avatarUrl!;
            }
            UserInfo.info.userName = res.data.name!;
            UserInfo.info.userId = res.data.uuid!;
            if (res.data.modelAccountBeanList && res.data.modelAccountBeanList.length) UserInfo.info.modelList = res.data.modelAccountBeanList;
            if (Config.env !== 'dev') {
                if (res.data.profileCompleteFlag === '1') {
                    router.push('/resume');
                } else {
                    router.push('/initProfile');
                }
            }
        }
    });
};

// 获取系统配置
const getConfigInfo = () => {
    adminService.getConfig(new GetConfigInDto()).then((res) => {
        if (res.code === 200) {
            SystemInfo.info.loginTitle = res.data.appName;
            SystemInfo.info.loginBg = res.data.loginPageImage;
        }
    });
};

// 获取简历匹配分析提示词
const getMatchAnalysisPrompt = () => {
    adminService.getMatchAnalysisPrompt(new GetMatchAnalysisPromptInDto()).then((res) => {
        if (res.code === 200) {
            UserInfo.info.matchAnalysisPrompt = res.data.content;
        }
    });
};
</script>

<template>
    <main class="container">
        <router-view />
    </main>
    <UpdateDialog ref="updateDialogRef" />
</template>
<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.container {
    height: 100vh;
    margin: 0;
    padding: 0;
    background: $bg-gray;
}
</style>
