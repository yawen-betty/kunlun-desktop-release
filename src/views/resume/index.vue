<script setup lang="ts">
import makePanel from './makePanel.vue'
import ModelUsageExhaustedModal from './ModelUsageExhaustedModal.vue'
import {ref} from "vue";

const visible = ref(true)
</script>

<template>
    <div class="resume-cont">
        <makePanel />

        <ModelUsageExhaustedModal v-model="visible"/>
    </div>
</template>

<style scoped lang="scss">
.resume-cont {
    height: 100%;
    padding: vh(40);
}
</style>
