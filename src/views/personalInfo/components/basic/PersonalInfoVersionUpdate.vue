<template>
    <div class="version-update">
        <h1 class="title">版本更新</h1>
        <div class="version-info">
            <span class="current-version">当前版本：{{ currentVersion }}</span>
            <span class="new-version" v-if="!!newVersion || (newVersion && currentVersion !== newVersion)">
                发现新版本！
                <span class="update-link" @click="handleUpdate">立即更新</span>
            </span>
        </div>
        <p class="update-time">更新时间：{{ versionData?.releaseTime }}</p>
        <p class="update-title">更新详情：</p>
        <div class="update-details">
            <p v-html="versionData?.content"></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {AdminService} from '@/service/AdminService';
import {GetVersionInfoInDto, GetVersionInfoOutDto} from '@/api/admin/dto/GetVersionInfo';
import {Config} from '@/Config';
import {checkForUpdates, performUpdate} from '@/updater';

/**
 * 版本信息请求 DTO
 */
const versionInformation = new GetVersionInfoInDto();

/**
 * 管理服务实例
 */
const adminService = new AdminService();

/**
 * 当前应用版本号
 */
const currentVersion = Config.version;

/**
 * 版本详情数据
 */
const versionData = ref<GetVersionInfoOutDto>(new GetVersionInfoOutDto());

/**
 * 最新版本号
 */
const newVersion = ref('');

/**
 * 更新进度（0-100）
 */
const progress = ref(0);

/**
 * 组件挂载时初始化
 * 检查更新并获取版本信息
 */
onMounted(async () => {
    const result = await checkForUpdates(currentVersion, true);
    console.log('%c 🕋: result ', 'font-size:16px;background-color:#b45944;color:white;', result);
    newVersion.value = result?.newVersion || '';
    try {
        const res = await adminService.getVersionInfo({});
        if (res.code === 200) {
            versionData.value = res.data;
        }
    } catch (error) {
        console.error('获取版本信息失败:', error);
    }
});

/**
 * 处理版本更新
 * 检查更新并执行下载安装流程
 */
const handleUpdate = async () => {
    const result = await checkForUpdates(currentVersion, true);
    console.log('%c 🐖: handleUpdate -> result ', 'font-size:16px;background-color:#ad0c1d;color:white;', result);
    const updateInstance = result?.update;
    if (!updateInstance) return;

    try {
        await performUpdate(updateInstance, (p) => {
            progress.value = p;
        });
    } catch (error) {
        console.log('%c 🛴: handleUpdate -> error ', 'font-size:16px;background-color:#a06cf8;color:white;', error);
        alert('更新失败，请稍后重试');
    }
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.version-update {
    width: vw(1279);
    height: vh(940);
    background: $white;
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);
    padding: vh(40) vw(40);
}

.title {
    font-family: 'YouSheBiaoTiHei', sans-serif;
    font-size: vw(28);
    line-height: vh(28);
    color: $font-dark;
    margin: 0 0 vh(40) 0;
    font-weight: normal;
}

.version-info {
    display: flex;
    gap: vw(20);
    margin-bottom: vh(10);
}

.current-version {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    font-weight: 500;
}

.new-version {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $theme-color;
    font-weight: 500;
}

.update-link {
    text-decoration: underline;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
}

.update-time {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    margin: 0 0 vh(10) 0;
    font-weight: 500;
}

.update-title {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    margin: 0 0 vh(20) 0;
    font-weight: 500;
}

.update-details {
    width: vw(1199);
    height: vh(676);
    background: $bg-gray;
    border-radius: vw(2);
    padding: vh(20) vw(20);
    position: relative;
    overflow: auto;
}

.update-content {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;

    p {
        margin: 0 0 vh(10) 0;
    }

    ul {
        margin: 0;
        padding-left: vw(24);
        list-style: disc;

        li {
            margin-bottom: vh(5);

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}

.placeholder {
    width: vw(692);
    height: vh(180);
    background: #ffe7e7;
    margin-top: vh(20);
}
</style>
