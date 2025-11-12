<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import MakePanel from './components/MakePanel.vue'
import WriteResume from "@/views/resume/components/WriteResume.vue";

const route = useRoute();
const showMakePanel = ref(false);
const resumeId = ref('4f11769e52304077bea5de854ecc4305');
const resumeName = ref('');
const uploadedFile = ref<File | null>(null);
const initialMode = ref<'ai' | 'manual'>('ai');

const handleResumeCreated = (data: { resumeId: string; resumeName: string; uploadedFile: File | null }) => {
    resumeId.value = data.resumeId;
    resumeName.value = data.resumeName;
    uploadedFile.value = data.uploadedFile;
    showMakePanel.value = false;
};

const exit = () => {
    showMakePanel.value = true;
    resumeName.value = '';
    resumeId.value = '';
    uploadedFile.value = null;
    initialMode.value = 'ai';
};

onMounted(() => {
    const routeResumeId = route.query.resumeId as string;
    if (routeResumeId) {
        resumeId.value = routeResumeId;
        showMakePanel.value = false;
        initialMode.value = 'manual';
    }
});

</script>

<template>
    <div class="resume-cont">
        <MakePanel v-if="showMakePanel" @resume-created="handleResumeCreated"/>
        <WriteResume v-else :initial-mode="initialMode" :resume-id="resumeId" :resume-name="resumeName"
                     :uploaded-file="uploadedFile" @back-to-make="exit"/>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-cont {
    height: 100%;
    padding: vh(40);
}

.test-drag-area {
    position: fixed;
    left: 300px;
    top: 300px;
    margin-top: 40px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;

    h3 {
        margin-bottom: 16px;
    }
}

.test-list {
    width: vw(400);
    max-height: vh(268);
    padding: vw(10) vw(10) 0;
    background: $white;
    overflow-y: auto;
    -webkit-app-region: no-drag;
}

.test-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    background: white;
    border-radius: 4px;
    cursor: move !important;
    user-select: none;
    -webkit-app-region: no-drag;

    .drag-handle {
        cursor: move !important;
        font-size: 18px;
        color: #999;
    }
}

:deep(.sortable-fallback) {
    opacity: 1 !important;
    background: white !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    border-radius: 4px !important;
}
</style>
