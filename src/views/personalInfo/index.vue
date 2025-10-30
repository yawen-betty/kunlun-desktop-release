<!--个人中心-->
<template>
  <div class="personal-info">
    <PersonalInfoTabs v-model="currentTab"/>
    <div class="personal-content">
      <PersonalInfoBasic v-if="currentTab === 'basic'" @logout="handleLogout"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import PersonalInfoTabs from './components/PersonalInfoTabs.vue';
import PersonalInfoBasic from './components/basic/PersonalInfoBasic.vue';

const currentTab = ref<string>('basic'); // 默认激活"基础设置"

const handleLogout = () => {
  // 处理退出登录逻辑
};
</script>


<style scoped lang="scss">
.personal-content {
  padding: vh(40) vw(40) vw(30) vw(40);


}
</style>
