<script setup lang="ts">
import {onMounted, ref, provide} from 'vue';
import {checkForUpdates} from '@/updater';
import UpdateDialog from '@/components/updateDialog/index.vue';
import {Config} from '@/Config.ts';
import {GetProfileInDto} from '@/api/user/dto/GetProfile.ts';
import {UserInfo} from '@/utiles/userInfo.ts';
import {UserService} from '@/service/UserService.ts';
import {auth} from '@/utiles/tauriCommonds.ts';
import {useRouter} from 'vue-router';
import {GetConfigInDto} from '@/api/admin/dto/GetConfig.ts';
import {SystemInfo} from '@/utiles/systemInfo.ts';
import {AdminService} from '@/service/AdminService.ts';
import {platform} from '@tauri-apps/plugin-os';
import {GetReleaseVersionInfoInDto} from '@/api/admin/dto/GetReleaseVersionInfo';

const adminService = new AdminService();
const userService = new UserService();
const updateDialogRef = ref();
const currentVersion = Config.version; // 从 package.json 或 tauri.conf.json 读取

const router = useRouter();

// 提供给子组件的配置状态

const showVersionUpdate = ref(false);
const versionUpdateDetails = ref('');
provide('showVersionUpdate', showVersionUpdate);

// 启动获取最新版本信息
const theCheckForUpdates = async () => {
    const res = await adminService.getReleaseVersionInfo({});
    // 检查是否有新版本
    showVersionUpdate.value = res.data.isLatestVersion === '0';
    versionUpdateDetails.value = res.data.content || '';
};

// 应用启动时自动检查更新
onMounted(async () => {
    try {
        const result = await checkForUpdates(currentVersion, false);
        await theCheckForUpdates();
        if (result) {
            updateDialogRef.value?.show({
                ...result,
                currentVersion,
                versionUpdateDetails: versionUpdateDetails.value
            });
        }
    } catch (e) {
        console.info('=====检测更新失败====', e);
    }

    auth.getToken().then((token) => {
        if (token) {
            UserInfo.info.token = token;
            getUserInfo(userService);
        } else {
            router.push('/login');
        }
    });

    getConfigInfo();
});

// 手动检查更新（绑定到菜单或按钮）
const manualCheckUpdate = async () => {
    const result = await checkForUpdates(currentVersion, true);

    if (result) {
        updateDialogRef.value?.show({
            ...result,
            currentVersion
        });
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
