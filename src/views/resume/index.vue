<script setup lang="ts">
import MakePanel from './components/MakePanel.vue'
import ModelUsageExhaustedModal from './components/ModelUsageExhaustedModal.vue'
import {ref} from "vue";

const visible = ref(true)

// const rightList = ref([
//     { id: '1', name: '教育经历' },
//     { id: '2', name: '工作经历' },
//     { id: '3', name: '专业技能' },
//     { id: '4', name: '奖项证书' },
//     { id: '5', name: '自我评价' },
//     { id: '6', name: '项目经历' },
//     { id: '7', name: '培训情况' },
//     { id: '8', name: '语言能力' },
//     { id: '9', name: '专利/学术成果' },
//     { id: '10', name: '兴趣爱好' },
//     { id: '12', name: '实习经历' }
// ])
// const appliedModules = ref<any[]>([])
// const disabledDragIds = ['1', '2', '3']
// const handleModulesApply = (modules: any[]) => {
//     appliedModules.value = [...modules]
//     console.log(appliedModules.value, 'appliedModules.value');
// }


</script>

<template>
    <div class="resume-cont">
        <MakePanel />

        <ModelUsageExhaustedModal v-model="visible"/>
    </div>
</template>

<style scoped lang="scss">
.resume-cont {
    height: 100%;
    padding: vh(40);
}
</style>
