<script setup lang="ts">
import { ref } from 'vue';
import { performUpdate } from '@/updater';
import SvgIcon from "@/components/svgIcon/index.vue";
import {Button, Modal} from "view-ui-plus";

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
    :footer-hide="true"
    class-name="delete-confirm-modal"
  >
    <div class="delete-modal-content">
      <div class="modal-header">
        <span class="modal-title">发现新版本</span>
      </div>
      <div class="modal-body">
        <p>当前版本: {{ currentVersion }}</p>
        <div class="mb-10"></div>
        <p>最新版本: {{ newVersion }}</p>
        <div class="mb-10"></div>
        <p v-if="forceUpdate" class="force-tip">检测到重要更新，必须升级后才能继续使用</p>

        <div v-if="downloading" class="progress-box">
          <Progress :percent="progress" status="active" />
          <p>正在下载更新... {{ progress.toFixed(1) }}%</p>
        </div>
      </div>
      <div class="modal-footer mb-5">
        <button v-if="!forceUpdate && !downloading" class="btn-cancel" @click="visible = false">
          稍后更新
        </button>
        <button
          class="btn-confirm"
          :loading="downloading"
          @click="handleUpdate"
        >
          {{ downloading ? '更新中...' : '立即更新' }}
        </button>
      </div>
    </div>
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
