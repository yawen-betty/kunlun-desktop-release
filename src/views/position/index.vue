<script lang="ts" setup>
import {ref, onMounted} from 'vue'
import CreateTask from "@/views/position/components/CreateTask.vue";
import PositionPanel from "@/views/position/components/PositionPanel.vue";
import {JobService} from "@/service/JobService";
import {GetDefaultJobTaskInDto} from "@/api/job/dto/GetDefaultJobTask";

const hasTask = ref(false)
const jobService = new JobService()

const checkDefaultTask = async () => {
    try {
        const params = new GetDefaultJobTaskInDto()
        const result = await jobService.getDefaultJobTask(params)
        hasTask.value = result.code === 200 && !!result.data?.uuid
    } catch (error) {
        hasTask.value = false
    }
}

onMounted(() => {
    checkDefaultTask()
})
</script>

<template>
    <div class="position-cont">
        <CreateTask v-if="!hasTask"/>
        <PositionPanel v-else/>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.position-cont {
    height: 100%;
    padding: vh(40);
}
</style>
