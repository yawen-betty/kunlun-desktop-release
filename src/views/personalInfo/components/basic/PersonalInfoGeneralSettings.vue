<template>
    <div class="general-settings">
        <h1 class="title">通用设置</h1>
        <p class="description">清理缓存，可节省空间</p>
        <p class="description" v-if="cacheSize !== null">缓存</p>
        <div class="cache-info">
            <p class="cache" v-if="cacheSize !== null">{{ formattedCacheSize }}</p>
            <p class="action-link" @click="cacheSize === null ? getCacheSize() : clearCache()">{{ cacheSize === null ? '开始计算' : '清理' }}</p>
        </div>
        <div class="divider"></div>
        <p class="action-link" @click="handleLogout">注销账号</p>

        <LogoutModal v-model="showLogoutModal" @confirm="confirmLogout" />
    </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {invoke} from '@tauri-apps/api/core';
import {UserInfo} from '@/utiles/userInfo.ts';
import {Message} from 'view-ui-plus';
import {withLoading} from '@/utiles/loading';

import LogoutModal from '../LogoutModal.vue';

const showLogoutModal = ref(false);
const cacheSize = ref<number | null>(null);

const formattedCacheSize = computed(() => {
    if (cacheSize.value === null) return '-';
    const bytes = cacheSize.value;
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
});

const getCacheSize = async () => {
    const cacheInfo: {[key: string]: number} = await invoke('get_cache_size');
    console.log('%c 🍍: getCacheSize -> cacheInfo ', 'font-size:16px;background-color:#d20f90;color:white;', cacheInfo);
    cacheSize.value = cacheInfo.total_size;
};

const clearCache = async () => {
    if (UserInfo.info.isRunningTask) {
        Message.error('求职任务正在进行中，清理缓存会影响任务正常运作，请稍后再试！');
        return;
    }
    await withLoading(async () => {
        const result = await invoke('clear_cache');
        console.info('//////////34343434', JSON.stringify(result));
        cacheSize.value = null;
    });
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
    margin: 0 0 vh(20) 0;
    font-weight: 500;
}

.cache-info {
    display: flex;
    align-items: flex-end;
    .cache {
        color: $font-dark;
        font-size: vw(32);
        font-family: PingFang SC;
        font-weight: 600;
        line-height: vh(32);
        word-wrap: break-word;
        margin-right: vw(20);
    }
}

.action-link {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(16);
    color: $theme-color;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
}

.divider {
    height: 1px;
    background: $border-default;
    margin: vh(40) 0 vh(40) 0;
}
</style>
