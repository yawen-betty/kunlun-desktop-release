<template>
  <Modal
    v-model="visible"
    :mask-closable="false"
    :closable="false"
    footer-hide
    class="model-usage-modal"
  >
    <div class="modal-content">
      <Icon type="md-close" class="close-icon" @click="handleClose" />

      <h3 class="modal-title mb-40">免费模型次数已用完</h3>

      <p class="description mb-20">您可以注册、配置自己的模型账号，免费使用AI撰写功能！</p>

      <div class="tutorial-link mb-40" @click="handleShowTutorial">
        <Icon type="md-help-circle" />
        <span>如何注册智谱账号</span>
      </div>

      <Form ref="formRef" :model="formData" :rules="rules" class="config-form mb-60" label-position="top">
        <FormItem label="模型" prop="model" class="model-item">
          <RadioGroup v-model="formData.model" class="model-radio-group">
            <Radio label="zhipu">智谱</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem label="API Key" prop="apiKey" class="api-key-item">
          <Input
            v-model="formData.apiKey"
            type="password"
            password
            placeholder="请输入"
            class="api-key-input"
          >
          </Input>
        </FormItem>
      </Form>

      <Button
        @click="handleSave"
        class="save-btn"
      >
        <SvgIcon name="icon-baocun" size="12"/>
        <span>保存</span>
      </Button>

      <img src="../../../assets/images/ai.png" class="decoration-img" alt="" />
    </div>
  </Modal>

  <Modal
    v-model="tutorialVisible"
    :mask-closable="false"
    :closable="false"
    footer-hide
    class="tutorial-modal"
  >
    <div class="tutorial-content">
      <Icon type="md-close" class="tutorial-close-icon" @click="handleCloseTutorial" />
      <h3 class="tutorial-title mb-20">如何注册智谱账号</h3>
      <div class="tutorial-html pt-20" v-html="tutorialContent"></div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { Modal, Form, FormItem, Input, RadioGroup, Radio, Button, Icon, Message } from 'view-ui-plus';
import SvgIcon from "@/components/svgIcon/index.vue";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;

  (e: 'save', data: { model: string; apiKey: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const tutorialVisible = ref(false);
const showApiKey = ref(false);
const formRef = ref<any>(null);

const tutorialContent = '<h3>我是标题</h3><p>第二步：我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程</p><p>第三步：我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程</p><p>第四步：我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程我是教程</p>';

const formData = reactive({
  model: 'zhipu',
  apiKey: '',
});

const rules = {
  apiKey: [
    { required: true, message: '请输入API Key', trigger: 'blur' },
  ],
};

const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value;
};

const handleClose = () => {
  visible.value = false;
};

const handleShowTutorial = () => {
  tutorialVisible.value = true;
};

const handleCloseTutorial = () => {
  tutorialVisible.value = false;
};

const handleSave = async () => {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    emit('save', {
      model: formData.model,
      apiKey: formData.apiKey,
    });

    Message.success('配置保存成功');
    visible.value = false;
  } catch (error) {
    Message.error('保存失败，请稍后重试');
  }
};
</script>

<style lang="scss">
.model-usage-modal{
    width:vw(900) !important;
}

.tutorial-modal{
    width:vw(1200) !important;

    .ivu-modal-body{
        padding-bottom: vh(40);
    }
}
</style>

<style scoped lang="scss">
.model-usage-modal {
  :deep(.ivu-modal) {
    top: 50%;
    transform: translateY(-50%);
  }

  :deep(.ivu-modal-content) {
    border-radius: vw(2);
  }

  :deep(.ivu-modal-body) {
    padding: 0;
  }

  :deep(.ivu-modal-footer) {
    display: none;
  }
}

.modal-content {
  width: 100%;
  min-height: vh(510);
  background-color: $white;
  padding: vh(15) 0 0;
}

.close-icon {
  position: absolute;
  right: vw(20);
  top: vh(18);
  font-size: vw(20);
  cursor: pointer;
  color: $font-middle;

  &:hover {
    color: $font-dark;
  }
}

.modal-title {
  font-family: 'YouSheBiaoTiHei', 'PingFang SC', sans-serif;
  font-size: vw(28);
  line-height: 1;
  color: $font-dark;
  font-weight: 400;
}

.description {
  font-size: vw(16);
  font-weight: 600;
  line-height: 1;
  color: $font-dark;
}

.tutorial-link {
  display: flex;
  align-items: center;
  gap: vw(10);
  color: $theme-color;
  font-size: vw(16);
  font-weight: 600;
  cursor: pointer;

  .ivu-icon {
    font-size: vw(18);
  }

  &:hover {
    opacity: 0.8;
  }
}

.config-form {
  :deep(.ivu-form-item) {
    margin-bottom: vh(40);
  }

  :deep(.ivu-form-item-label) {
    font-size: vw(16);
    font-weight: 600;
    line-height: 1;
    color: $font-middle;
    padding-bottom: vh(10);
  }

  .model-item {
    :deep(.ivu-form-item-content) {
      line-height: vh(40);
    }
  }

  .model-radio-group {
    :deep(.ivu-radio-wrapper) {
      width: vw(190);
      height: vh(40);
      background-color: $bg-gray;
      border-radius: vw(2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: vw(16);
      font-weight: 600;
      color: $font-dark;
      margin-right: 0;
      padding: 0;
      line-height: 1;

      &.ivu-radio-wrapper-checked {
        background-color: $theme-color;
        color: $white;
      }
    }

    :deep(.ivu-radio) {
      display: none;
    }
  }

  .api-key-item {
    width: vw(400);

    :deep(.ivu-form-item-label::after) {
      content: '*';
      color: $remind-error;
      margin-left: vw(4);
    }
  }
}

.save-btn {
  width: vw(82);
  height: vh(32);
  background-color: $theme-color;
  border: none;
  border-radius: vw(2);
  cursor: pointer;
  padding: 0;

  &:hover {
    background-color: $theme-color;
    opacity: 0.9;
  }

  :deep(> span){
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: normal;
    height: 100%;
    gap: vw(6);
    color: $white;
    font-size: vw(12);
    font-weight: 600;

    svg{
      margin-top: 1px;
    }
    .save-icon {
      width: vw(12);
      height: vw(12);
      display: block;
    }
  }
}

.decoration-img {
  position: absolute;
  left: vw(534);
  top: vh(295);
  width: vw(287);
  height: vh(235);
  pointer-events: none;
}

.tutorial-modal {
  :deep(.ivu-modal) {
    top: 50%;
    transform: translateY(-50%);
  }

  :deep(.ivu-modal-content) {
    border-radius: vw(2);
  }

  :deep(.ivu-modal-body) {
    padding: 0;
  }

    :deep(.ivu-modal-footer) {
        display: none;
    }
}

.tutorial-content {
  width: 100%;
  min-height: vh(600);
  background-color: $white;
    padding: vh(15) 0 0;
}

.tutorial-close-icon {
  position: absolute;
  right: vw(20);
  top: vh(18);
  font-size: vw(20);
  cursor: pointer;
  color: $font-middle;

  &:hover {
    color: $font-dark;
  }
}

.tutorial-title {
  font-family: 'YouSheBiaoTiHei', 'PingFang SC', sans-serif;
  font-size: vw(28);
  line-height: vh(28);
  color: $font-dark;
  font-weight: 400;
}

.tutorial-html {
  color: $font-dark;
  font-size: vw(16);
  font-weight: 600;
  line-height: vh(22);
  width: vw(1120);
  height: vh(672);
  overflow-y: auto;

  :deep(h3) {
    font-size: vw(20);
    line-height: vh(22);
    margin-bottom: vh(16);
    color: $font-dark;
  }

  :deep(p) {
    font-size: vw(16);
    line-height: vh(22);
    margin-bottom: vh(22);
    color: $font-dark;
  }

  :deep(a) {
    color: $theme-color;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(strong) {
    font-weight: 600;
    color: $font-dark;
  }
}
</style>
