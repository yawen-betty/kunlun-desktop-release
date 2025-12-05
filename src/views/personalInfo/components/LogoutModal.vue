<template>
    <Modal v-model="visible" :mask-closable="false" :closable="false" :footer-hide="true" :width="900" class-name="account-logout-modal">
        <div class="logout-modal-content">
            <div class="close-icon" @click="handleClose">
                <Icon type="md-close" :size="20" />
            </div>

            <h1 class="modal-title">注销须知</h1>

            <div class="modal-text">
                <p>注销前请知悉</p>
                <p>· 在您注销账号之前，请仔细阅读以下重要信息：</p>
                <p>&nbsp;</p>
                <p>注销的后果</p>
                <p>· 您的账号将被永久删除，无法恢复</p>
                <p>· 您的所有个人数据将被清除，包括简历信息、面试记录等...</p>
                <p>· 您将无法使用本应用提供的所有服务</p>
                <p>&nbsp;</p>
                <p>数据处理</p>
                <p>· 注销账号后删除个人信息，法律法规要求保留的信息除外</p>
                <p>&nbsp;</p>
                <p>重新注册</p>
                <p>· 注销后，您可以使用同一微信重新注册，但将获得一个全新的账号，无法恢复之前的数据。</p>
            </div>

            <div class="modal-actions">
                <Button type="primary" class="confirm-btn" @click="handleConfirm">确认注销</Button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {AuthService} from '@/service/AuthService';
import {UserService} from '@/service/UserService.ts';
import {UserInfo} from '@/utiles/userInfo';

const userService = new UserService();

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'confirm'): void;
}>();

const visible = ref(props.modelValue);
const authService = AuthService.getInstance();

watch(
    () => props.modelValue,
    (val) => {
        visible.value = val;
    }
);

watch(visible, (val) => {
    emit('update:modelValue', val);
});

/**
 * 关闭弹窗
 */
const handleClose = () => {
    visible.value = false;
};

/**
 * 确认注销
 */
const handleConfirm = async () => {
    // 注销账号
    await userService.deactivate({});
    // 推出登录
    await authService.logout();
    UserInfo.logout();
};
</script>

<style lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.account-logout-modal {
    .ivu-modal {
        width: vw(900) !important;
    }

    .ivu-modal-content {
        border-radius: vw(2);
        box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);
    }

    .ivu-modal-body {
        padding: vh(40) vw(40) vh(128) vw(40);
    }
}
</style>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.logout-modal-content {
    position: relative;
    height: vh(432);
    background: $white;
    box-sizing: border-box;
}

.close-icon {
    position: absolute;
    top: 0;
    right: vw(18);
    width: vw(16);
    height: vh(16);
    cursor: pointer;
    color: $font-middle;

    &:hover {
        opacity: 0.8;
    }
}

.modal-title {
    font-family: 'YouSheBiaoTiHei', sans-serif;
    font-size: vw(28);
    line-height: vh(28);
    color: $font-dark;
    margin: 0 0 vh(40) 0;
    font-weight: normal;
}

.modal-text {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(20);
    color: $font-dark;
    font-weight: 600;
    margin-bottom: vh(72);

    p {
        margin: 0;
    }
}

.modal-actions {
    display: flex;
    gap: vw(6);
}

.save-btn {
    display: flex;
    align-items: center;
    gap: vw(6);
    padding: vh(10) vw(20);
    font-size: vw(12);
    line-height: vh(12);
    border-radius: vw(2);
    background: #eaecee;
    color: $font-light;
    border: none;

    &:hover {
        background: #eaecee;
        color: $font-light;
    }
}

.confirm-btn {
    padding: vh(10) vw(20);
    font-size: vw(12);
    line-height: vh(12);
    border-radius: vw(2);
    background: $theme-color;
    color: $white;
    border: none;
    font-weight: 600;

    &:hover {
        background: $theme-color;
        opacity: 0.9;
    }
}
</style>
