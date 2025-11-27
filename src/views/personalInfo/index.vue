<!--个人中心-->
<template>
    <div class="personal-info">
        <PersonalInfoTabs v-model="currentTab" />
        <div class="personal-content">
            <component :is="currentComponent" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, defineAsyncComponent} from 'vue';
import PersonalInfoTabs from './components/PersonalInfoTabs.vue';

const currentTab = ref<string>('basic'); // 默认激活"基础设置"

// 异步组件映射
const componentMap = {
    // 基础设置
    basic: defineAsyncComponent(() => import('./components/basic/PersonalInfoBasic.vue')),
    // 我的简历
    resume: defineAsyncComponent(() => import('./components/resume/PersonalInfoResume.vue'))
};

// 动态组件
const currentComponent = computed(() => {
    return componentMap[currentTab.value as keyof typeof componentMap];
});
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;
</style>
