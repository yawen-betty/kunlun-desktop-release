<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 标题栏 -->
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="handleClose">✕</button>
      </div>

      <!-- 内容区域 -->
      <div class="modal-content">
        <div class="agreement-scroll-wrapper">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits} from 'vue';

// 定义组件属性
const props = defineProps<{
  visible: boolean;
  title: string;
}>();

// 定义组件事件
const emit = defineEmits<{
  close: [];
}>();

// 处理关闭弹窗
const handleClose = () => {
  emit('close');
};

// 处理点击遮罩层
const handleOverlayClick = () => {
  handleClose();
};
</script>

<style scoped lang="scss">
/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* 弹窗容器 */
.modal-container {
  width: vw(1200);
  height: vh(800);
  border-radius: vw(2);
  background: $width;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.10) inset;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  padding: vw(40) vw(40) vh(76);
}

/* 标题栏 */
.modal-header {
  display: flex;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #515A6D;
  margin: 0;
}

/* 关闭按钮 */
.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9499A4;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #F6F8FA;
    color: #515A6D;
  }
}

/* 内容区域 */
.modal-content {
  flex: 1;
  overflow: hidden;
}

/* 滚动容器 */
.agreement-scroll-wrapper {
  height: 100%;
  padding: 30px;
  overflow-y: auto;
  line-height: 1.8;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #515A6D;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #F6F8FA;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E1E6EC;
    border-radius: 4px;
    transition: background 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #CBD0D8;
  }

  /* 协议内容样式 */
  h2 {
    font-size: 18px;
    font-weight: 500;
    margin: 20px 0 15px 0;
    color: #515A6D;
  }

  h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 18px 0 12px 0;
    color: #515A6D;
  }

  p {
    margin: 10px 0;
    text-align: justify;
  }

  ul {
    margin: 10px 0 10px 20px;
  }

  li {
    margin: 8px 0;
  }
}

/* 底部操作区 */
.modal-footer {
  display: flex;
  justify-content: center;
  padding: 20px 30px;
  border-top: 1px solid #E8EAEC;
  background-color: #FFFFFF;
}

/* 底部按钮 */
.modal-button {
  padding: 10px 40px;
  background-color: #FFFFFF;
  border: 1px solid #E1E6EC;
  border-radius: 4px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  color: #515A6D;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #F6F8FA;
    border-color: #CBD0D8;
  }

  &:active {
    background-color: #E8EAEC;
  }
}
</style>
