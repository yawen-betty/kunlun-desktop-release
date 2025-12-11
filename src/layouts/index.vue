<script lang="ts" setup>
import Top from '@/layouts/components/header.vue';
import LeftMenu from '@/layouts/components/sidebar.vue';
import {onMounted, ref} from 'vue';
import {logger} from "@/utiles/logger.ts";

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

const isOnLine = ref(true);
onMounted(() => {
    listenerResize();
    window.addEventListener('resize', () => {
        listenerResize();
    });

    window.addEventListener('online', () => {
        logger.info('网络已连接');
        isOnLine.value = true;
    });

    window.addEventListener('offline', () => {
        logger.info('网络已断开');
        isOnLine.value = false;
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
                <div v-if="!isOnLine" class="offline-indicator">
                  <img class="no-data_icon" src="@/assets/images/offline.png" />
                  网络已断开
                </div>
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
        position: relative;
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

.offline-indicator{
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 9999999999;
  display: flex;
  padding-right: vw(100);
  align-items: center;
  justify-content: center;
  background: $bg-gray;
  font-size: vw(24);
  color: $font-middle;

  img{
    width: vw(80);
    margin-right: vw(40);
  }
}
</style>
