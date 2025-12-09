<script lang="ts" setup>
import Top from '@/layouts/components/header.vue';
import LeftMenu from '@/layouts/components/sidebar.vue';
import {onMounted, ref} from 'vue';

/**
 * 监听窗口大小,调整尺寸 开始
 */
const minSize = ref(false);
const cachePages = ['Resume', 'Position', 'Interview'];
const listenerResize = () => {
    minSize.value = window.innerWidth < 1500;
};
/**
 * 监听窗口大小,调整尺寸 结束
 */

onMounted(() => {
    listenerResize();
    window.addEventListener('resize', () => {
        listenerResize();
    });
});
</script>

<template>
    <Layout class="layout">
        <Top></Top>
        <Layout class="layout">
            <LeftMenu :minSize="minSize"></LeftMenu>
            <Content class="content">
                <router-view v-slot="{Component}">
                    <keep-alive :include="cachePages">
                        <component :is="Component"/>
                    </keep-alive>
                </router-view>
            </Content>
        </Layout>
    </Layout>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.layout {
    height: 100vh;
    flex-direction: row;

    .content {
        height: 100vh;
    }

    .sidebar {
        width: auto !important;
        min-width: 50px !important;
        max-width: 160px !important;
        background: transparent;
    }

    .minibar {
        width: 74px !important;
    }

    .content {
    }
}
</style>
