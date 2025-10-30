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
        <iframe :src="agreementFileUrl" class="agreement-iframe" scrolling="no" frameborder="0"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, defineProps, ref, watch} from 'vue';
import SvgIcon from '@/components/svgIcon/index.vue'
import {AdminService} from "@/service/AdminService.ts";
import {GetAgreementInDto} from "@/api/admin/dto/GetAgreement.ts";

// 定义组件属性
const props = defineProps<{
  visible: boolean;  // 显示
  title: string; // 标题
  agreementType: number // 类型
}>();

const emit = defineEmits(['update:visible']);

// 协议地址
const agreementFileUrl = ref<string>('')

watch(() => props.visible, (newVal: boolean) => {
  if (newVal) {
    getAgreement();
  }
})

// 获取协议
const getAgreement = () => {
  const params: GetAgreementInDto = {
    type: props.agreementType
  }

  AdminService.getInstance().getAgreements(params).then(res => {
    if (res.code === 200) {
      // 添加参数隐藏PDF工具栏
      agreementFileUrl.value = res.data.agreementFileUrl + '#toolbar=0&navpanes=0&scrollbar=0'
    }
  })
}

// 处理关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
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
  padding: vw(40) vw(40) vh(76);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;

  .cha {
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
  color: $font-dark;
  font-size: vw(28);
  font-style: normal;
  font-weight: 400;
  line-height: vw(28);
  font-family: 'YouSheBiaoTiHei', serif;
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
  position: relative;
  overflow: hidden;
  border-radius: vw(2);

  .agreement-iframe {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    border-radius: vw(2);
    overflow: hidden;
    scrolling: no;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* 隐藏Firefox滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
