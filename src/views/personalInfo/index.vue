<!--个人中心-->
<template>
  <div class="personal-info">
    <PersonalInfoTabs v-model="currentTab"/>
    <div class="personal-content">
      <PersonalInfoBasic v-if="currentTab === 'basic'"/>
      <PersonalInfoResume v-if="currentTab === 'resume'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import PersonalInfoTabs from './components/PersonalInfoTabs.vue';
import PersonalInfoBasic from './components/basic/PersonalInfoBasic.vue';
import PersonalInfoResume from "@/views/personalInfo/components/resume/PersonalInfoResume.vue";

const currentTab = ref<string>('basic'); // 默认激活"基础设置"
</script>


<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

</style>
