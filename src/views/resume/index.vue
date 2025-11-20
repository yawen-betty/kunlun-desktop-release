<script lang="ts">
export default {
    name: 'Resume'
}
</script>

<script lang="ts" setup>
import {nextTick, onActivated, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import MakePanel from './components/MakePanel.vue'
import WriteResume from "@/views/resume/components/WriteResume.vue";
import {UserInfo} from "@/utiles/userInfo.ts";
import {useCompRef} from "@/hooks/useComponent";

const route = useRoute();
const router = useRouter();
const showMakePanel = ref(true);
// const resumeId = ref('4f11769e52304077bea5de854ecc4305');
const resumeId = ref('');
const resumeName = ref('');
const uploadedFile = ref<File | null>(null);
const initialMode = ref<'ai' | 'manual'>('ai');
// 组件实例
const writeResumeRef = useCompRef(WriteResume)

const handleResumeCreated = (data: { resumeId: string; resumeName: string; uploadedFile: File | null }) => {
    resumeId.value = data.resumeId;
    UserInfo.info.runningResumeId = resumeId.value
    resumeName.value = data.resumeName;
    uploadedFile.value = data.uploadedFile;
    showMakePanel.value = false;
};

const exit = () => {
    showMakePanel.value = true;
    resumeName.value = '';
    resumeId.value = '';
    UserInfo.info.runningResumeId = '';
    uploadedFile.value = null;
    initialMode.value = 'ai';

    if (route.query.resumeId) {
        router.replace({query: {...route.query, resumeId: undefined}});
    }
};

onActivated(() => {
    const routeResumeId = route.query.resumeId as string;
    // 如果id和runningResumeId一致，则不进行任何操作，
    // 如果不一致，则进行人工模式的展示
    if (routeResumeId && routeResumeId !== UserInfo.info.runningResumeId) {
        resumeId.value = routeResumeId;
        if (showMakePanel.value) {
            showMakePanel.value = false;
            nextTick(() => {
                // 这里做
                initialMode.value = 'manual';
            })
        } else {
            writeResumeRef.value?.reset();
        }
        UserInfo.info.runningResumeId = resumeId.value

    }
});

</script>

<template>
    <div class="resume-cont">
        <MakePanel v-if="showMakePanel" @resume-created="handleResumeCreated"/>
        <WriteResume v-else ref="writeResumeRef" :initial-mode="initialMode" :resume-id="resumeId"
                     :resume-name="resumeName"
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
</style>
