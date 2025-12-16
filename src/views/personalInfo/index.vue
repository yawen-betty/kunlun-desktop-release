<!--个人中心-->
<template>
    <div class="personal-info">
        <PersonalInfoTabs v-model="currentTab"/>
        <div class="personal-content">
            <component :is="currentComponent"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref, computed, defineAsyncComponent} from 'vue';
import PersonalInfoTabs from './components/PersonalInfoTabs.vue';

const currentTab = ref<string>('resume'); // 默认激活"我的简历"

// 异步组件映射
const componentMap = {
    // 基础设置
    basic: defineAsyncComponent(() => import('./components/basic/PersonalInfoBasic.vue')),
    // 我的简历
    resume: defineAsyncComponent(() => import('./components/resume/PersonalInfoResume.vue')),
    // 辅导记录
    tutorship: defineAsyncComponent(() => import('./components/tutorship/index.vue')),
    // 面试记录
    interview: defineAsyncComponent(() => import('./components/interview/index.vue'))
};

// 动态组件
const currentComponent = computed(() => {
    return componentMap[currentTab.value as keyof typeof componentMap];
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.personal-info {
    display: flex;
    flex-direction: column;
    height: 100%;

    .personal-content {
        flex: 1;
    }
}
</style>
