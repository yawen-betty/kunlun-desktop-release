<script setup lang="ts">
import {ref} from 'vue';
import {performUpdate} from '@/updater';
import {Button, Modal, Progress, Image} from 'view-ui-plus';
import updateVersionImg from '@/assets/images/update-version.png';
import {AuthService} from '@/service/AuthService.ts';
import {UserInfo} from '@/utiles/userInfo.ts';

const authService = new AuthService();
const visible = ref(false);
const forceUpdate = ref(false);
const currentVersion = ref('');
const newVersion = ref('');
const downloading = ref(false);
const progress = ref(0);
const versionUpdateDetails = ref('');
let updateInstance: any = null;

// 显示更新弹窗
const show = (data: any) => {
    console.log('%c 🇲🇪: show -> data ', 'font-size:16px;background-color:#2577df;color:white;', data);
    visible.value = true;
    forceUpdate.value = data.forceUpdate;
    currentVersion.value = data.currentVersion;
    newVersion.value = data.newVersion;
    versionUpdateDetails.value = data.versionUpdateDetails || '';
    updateInstance = data.update;
};

// 执行更新
const handleUpdate = async () => {
    if (!updateInstance) return;

    downloading.value = true;
    try {
        await performUpdate(updateInstance, (p) => {
            progress.value = p;
        });
    } catch (error) {
        downloading.value = false;
        alert('更新失败，请稍后重试');
    }
};

const handleSubmitLogout = () => {
    authService.logout().then(() => {
        UserInfo.logout();
        visible.value = false;
    });
};

defineExpose({show});
</script>

<template>
    <Modal v-model="visible" :closable="false" :mask-closable="false" :footer-hide="true" class-name="update-dialog-modal">
        <div class="update-dialog-container">
            <div class="update-dialog-content">
                <div class="content-left">
                    <h1 class="dialog-title">发现新版本</h1>
                    <p class="version-text">版本号：{{ newVersion }}</p>
                    <div class="update-details">
                        <!-- <p v-if="forceUpdate" class="force-tip">检测到重要更新，必须升级后才能继续使用</p> -->
                        <!-- <p v-else v-html="versionUpdateDetails"></p> -->
                        <p v-html="versionUpdateDetails"></p>
                    </div>
                    <!-- <div v-if="downloading" class="progress-box">
                        <Progress :percent="progress" status="active" />
                        <p class="progress-text">正在下载更新... {{ progress.toFixed(1) }}%</p>
                    </div> -->
                </div>
                <div class="content-right">
                    <Image :src="updateVersionImg" alt="更新插图" class="update-illustration" fit="contain" />
                </div>
            </div>
            <div class="button-group">
                <Button v-if="UserInfo.info.token" ghost @click="handleSubmitLogout" class="btn-cancel">退出登录</Button>
                <Button type="primary" :loading="downloading" @click="handleUpdate" class="btn-confirm">
                    {{ downloading ? '更新中...' : '立即更新' }}
                </Button>
            </div>
        </div>
    </Modal>
</template>

<style scoped lang="scss">
// 样式已移至 @/assets/styles/modal.scss
</style>
