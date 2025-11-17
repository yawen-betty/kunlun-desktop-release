<template>
  <div class="basic">
    <PersonalInfoSidebar
      v-model="currentMenu"
    />

    <div class="basic-content">

      <PersonalInfoForm v-if="currentMenu === 'personal'"/>

      <PersonalInfoExhaustedModal v-else-if="currentMenu === 'model'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import PersonalInfoSidebar from '@/views/personalInfo/components/PersonalInfoSidebar.vue';
import PersonalInfoForm from "@/views/personalInfo/components/basic/PersonalInfoForm.vue";
import PersonalInfoExhaustedModal from "@/views/personalInfo/components/basic/PersonalInfoExhaustedModal.vue";

const currentMenu = ref<string>('personal');

</script>

<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

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
