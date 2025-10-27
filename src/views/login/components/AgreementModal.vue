<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container" @click.stop>
      <!-- 标题栏 -->
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
      </div>
      <svg-icon name="icon-cha" size="20" color="#9499A4" @click="handleClose" class="cha pointer"/>

      <!-- 内容区域 -->
      <div class="modal-content mt-40">
          {{ content }}
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, watch, ref} from 'vue';
import SvgIcon from '@/components/svgIcon/index.vue'

// 定义组件属性
const props = defineProps<{
  visible: boolean;  // 显示
  title: string; // 标题
  agreementType:string // 类型
}>();

// 协议内容
const content = ref<string>('')

// 定义组件事件
const emit = defineEmits<{
  close: [];
}>();

watch(()=>props.visible,(newVal:boolean)=>{
  if (newVal){
    // 调用接口

  }
})

// 处理关闭弹窗
const handleClose = () => {
  emit('close');
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
  background: $white;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.10) inset;
  padding: vw(40) vw(40) vh(76);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  display: flex;
  flex-direction: column;
  .cha{
    position: absolute;
    right: vw(20);
    top: vh(20);
  }
}

/* 标题栏 */
.modal-header {
  display: flex;
  justify-content: space-between;
}

.modal-title {
  color:$font-dark;
  font-size: vw(28);
  font-style: normal;
  font-weight: 400;
  line-height: vw(28);
  font-family: 'YouSheBiaoTiHei',serif;
}

/* 内容区域 */
.modal-content {
  flex: 1;
  color: $font-dark;
  font-size: vw(16);
  font-style: normal;
  font-weight: 500;
  line-height: vw(22);
  word-break: break-all;

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
}
</style>
