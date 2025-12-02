<template>
    <div class="general-settings">
        <h1 class="title">通用设置</h1>
        <p class="description">清理缓存，可节省空间</p>
        <p class="action-link" @click="handleCalculate">开始计算</p>
        <div class="divider"></div>
        <p class="action-link" @click="handleLogout">注销账号</p>
        
        <LogoutModal v-model="showLogoutModal" @confirm="confirmLogout" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LogoutModal from '../LogoutModal.vue';

const showLogoutModal = ref(false);

/**
 * 开始计算缓存
 */
const handleCalculate = () => {
    console.log('开始计算缓存');
};

/**
 * 注销账号
 */
const handleLogout = () => {
    showLogoutModal.value = true;
};

/**
 * 确认注销
 */
const confirmLogout = () => {
    console.log('确认注销账号');
    // TODO: 实现注销逻辑
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.general-settings {
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
    margin: 0 0 vh(28) 0;
    font-weight: normal;
}

.description {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(16);
    color: $font-dark;
    margin: 0 0 vh(36) 0;
    font-weight: 500;
}

.action-link {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(16);
    color: $theme-color;
    margin: 0;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
}

.divider {
    height: 1px;
    background: $border-default;
    margin: vh(56) 0 vh(40) 0;
}
</style>
