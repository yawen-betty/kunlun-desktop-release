<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { checkForUpdates } from '@/updater';
import UpdateDialog from '@/components/updateDialog/index.vue';
import {Config} from "@/Config.ts";

const updateDialogRef = ref();
const currentVersion = Config.version; // 从 package.json 或 tauri.conf.json 读取

// 应用启动时自动检查更新
onMounted(async () => {
  try {

    const result = await checkForUpdates(currentVersion, false);

    if (result) {
      updateDialogRef.value?.show({
        ...result,
        currentVersion
      });
    }
  } catch (e) {
    console.info('=====检测更新失败====',e)
  }
});

// 手动检查更新（绑定到菜单或按钮）
const manualCheckUpdate = async () => {
  const result = await checkForUpdates(currentVersion, true);

  if (result) {
    updateDialogRef.value?.show({
      ...result,
      currentVersion
    });
  }
}
</script>

<template>
  <main class="container">
    <router-view/>
  </main>
  <UpdateDialog ref="updateDialogRef" />
</template>
<style lang="scss">
@use "@/assets/styles/variable.scss";
.container {
  height: 100vh;
  margin: 0;
  padding: 0;
  background: variable.$bg-gray;
}
</style>
