<template>
    <div class="basic">
        <PersonalInfoSidebar v-model="currentMenu" />

        <div class="basic-content">
            <!-- 个人信息表单 -->
            <component :is="currentComponent" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, defineAsyncComponent} from 'vue';
import PersonalInfoSidebar from '@/views/personalInfo/components/PersonalInfoSidebar.vue';

const currentMenu = ref<string>('personal');

const componentMap = {
    // 个人信息表单
    personal: defineAsyncComponent(() => import('@/views/personalInfo/components/basic/PersonalInfoForm.vue')),
    // 模型信息弹窗
    model: defineAsyncComponent(() => import('@/views/personalInfo/components/basic/PersonalInfoExhaustedModal.vue')),
    // 版本更新
    version: defineAsyncComponent(() => import('@/views/personalInfo/components/basic/PersonalInfoVersionUpdate.vue')),
    // 问题反馈
    feedback: defineAsyncComponent(() => import('@/views/personalInfo/components/basic/PersonalInfoFeedback.vue')),
    // 帮助中心
    help: defineAsyncComponent(() => import('@/views/personalInfo/components/basic/PersonalInfoHelpCenter.vue')),
    // 关于我们
    about: defineAsyncComponent(() => import('@/views/personalInfo/components/basic/PersonalInfoAboutUs.vue')),
    // 通用设置
    settings: defineAsyncComponent(() => import('@/views/personalInfo/components/basic/PersonalInfoGeneralSettings.vue'))
};

const currentComponent = computed(() => componentMap[currentMenu.value as keyof typeof componentMap]);
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.basic {
    padding: vh(40) vw(40) vw(30) vw(40);
    display: flex;
    gap: vw(40);

    .basic-content {
        width: vw(1279);
        height: vh(940);
        border-radius: vw(2);
        background: $white;
    }
}
</style>
