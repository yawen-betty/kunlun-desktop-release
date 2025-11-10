<script lang="ts" setup>
import {ref} from 'vue';
import MakePanel from './components/MakePanel.vue'
import WriteResume from "@/views/resume/components/WriteResume.vue";

const showMakePanel = ref(false);
const resumeId = ref('5f0879f1448148f9a1233d46af578d6d');
const resumeName = ref('');
const uploadedFile = ref<File | null>(null);

const handleResumeCreated = (data: { resumeId: string; resumeName: string; uploadedFile: File | null }) => {
    resumeId.value = data.resumeId;
    resumeName.value = data.resumeName;
    uploadedFile.value = data.uploadedFile;
    showMakePanel.value = false;
};
</script>

<template>
    <div class="resume-cont">
        <MakePanel v-if="showMakePanel" @resume-created="handleResumeCreated"/>
        <WriteResume v-else :resume-id="resumeId" :resume-name="resumeName" :uploaded-file="uploadedFile"/>
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
    padding: vw(10);
    padding-bottom: 0;
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
