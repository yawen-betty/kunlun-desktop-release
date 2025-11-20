<script lang="ts" setup>
import CreateTask from "@/views/position/components/CreateTask.vue";
import PositionPanel from "@/views/position/components/PositionPanel.vue";
</script>

<template>
    <div class="position-cont">
        <!--        <CreateTask/>-->
        <PositionPanel/>
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
