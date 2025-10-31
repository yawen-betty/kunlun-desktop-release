<script setup lang="ts">
import { ref } from 'vue';
import { performUpdate } from '@/updater';

const visible = ref(false);
const forceUpdate = ref(false);
const currentVersion = ref('');
const newVersion = ref('');
const downloading = ref(false);
const progress = ref(0);
let updateInstance: any = null;

// 显示更新弹窗
const show = (data: any) => {
  visible.value = true;
  forceUpdate.value = data.forceUpdate;
  currentVersion.value = data.currentVersion;
  newVersion.value = data.newVersion;
  updateInstance = data.update;
}

// 执行更新
const handleUpdate = async () => {
  if (!updateInstance) return;

  downloading.value = true;
  try {
    await performUpdate(updateInstance, (p) => {
      progress.value = p;
    });
  } catch (error) {
    downloading.value = false;
    alert('更新失败，请稍后重试');
  }
}

defineExpose({ show });
</script>

<template>
  <Modal
    v-model="visible"
    :closable="!forceUpdate"
    :mask-closable="false"
    :title="forceUpdate ? '发现新版本（必须更新）' : '发现新版本'"
    width="500"
  >
    <div class="update-content">
      <p>当前版本: {{ currentVersion }}</p>
      <p>最新版本: {{ newVersion }}</p>
      <p v-if="forceUpdate" class="force-tip">检测到重要更新，必须升级后才能继续使用</p>

      <div v-if="downloading" class="progress-box">
        <Progress :percent="progress" status="active" />
        <p>正在下载更新... {{ progress.toFixed(1) }}%</p>
      </div>
    </div>

    <template #footer>
      <Button v-if="!forceUpdate && !downloading" @click="visible = false">
        稍后更新
      </Button>
      <Button
        type="primary"
        :loading="downloading"
        @click="handleUpdate"
      >
        {{ downloading ? '更新中...' : '立即更新' }}
      </Button>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;
.update-content {
  padding: 20px 0;

  p {
    margin-bottom: 10px;
    font-size: 14px;
  }

  .force-tip {
    color: #ff4d4f;
    font-weight: bold;
    margin-top: 15px;
  }

  .progress-box {
    margin-top: 20px;

    p {
      text-align: center;
      margin-top: 10px;
      color: #666;
    }
  }
}
</style>
