<template>
  <div class="modal-content">
    <h3 class="modal-title mb-40">模型账号</h3>

    <p class="description mb-20"> 配置模型账号后，您可以无限制使用AI相关功能，包含：</p>

    <ul class="description-list mb-40">
      <li>· 简历AI撰写、润色、扩展、简化、总结</li>
      <li>· 职位AI匹配、分析</li>
      <li>· 面试AI辅导、模拟面试</li>
    </ul>

    <div class="tutorial-link mb-40">
      <Icon type="md-help-circle"/>
      <span @click="handleTutorial(true)">如何注册智谱账号</span>
    </div>

    <Form ref="formRef" :model="formData" :rules="rules" class="config-form mb-60" label-position="top">
      <FormItem label="模型" prop="model" class="model-item">
        <RadioGroup v-model="formData.modelType" class="model-radio-group">
          <Radio :label="info.key" v-for="info in aiModal" :key="info.key">{{ info.value }}</Radio>
        </RadioGroup>
      </FormItem>

      <FormItem label="API Key" prop="apiKey" class="api-key-item">
        <Input
          v-model="formData.apiKey"
          type="password"
          password
          placeholder="请输入"
          class="api-key-input"
        ></Input>
      </FormItem>
    </Form>

    <Button type="primary" @click="handleSave" class="save-btn" :disabled="!formData.apiKey">
      <SvgIcon name="icon-baocun" size="12" color="#fff"/>
      保存
    </Button>

    <img src="@/assets/images/ai.png" class="decoration-img" alt=""/>
  </div>

  <Modal
    v-model="tutorialVisible"
    :mask-closable="false"
    :closable="false"
    footer-hide
    class="tutorial-modal"
  >
    <div class="tutorial-content">
      <Icon type="md-close" class="tutorial-close-icon" @click="handleTutorial(false)"/>
      <h3 class="tutorial-title mb-20">如何注册智谱账号</h3>
      <div class="tutorial-html pt-20" v-html="tutorialContent"></div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue';
import {Form, FormItem, Input, RadioGroup, Radio, Button, Icon, Message, Modal} from 'view-ui-plus';
import SvgIcon from "@/components/svgIcon/index.vue";
import {UserService} from "@/service/UserService.ts";
import {message} from "@/utiles/Message.ts";
import {SaveModelAccountInDto} from "@/api/user/dto/SaveModelAccount.ts";
import {aiModal} from "@/enums/enumDict.ts";
import {AdminService} from "@/service/AdminService.ts";
import {GetAiRegisterGuideInDto} from "@/api/admin/dto/GetAiRegisterGuide.ts";
import {GetModelAccountInDto} from "@/api/user/dto/GetModelAccount.ts";

const formRef = ref<any>(null);

const userService = new UserService();
const adminService = new AdminService()

// form
const formData = reactive<SaveModelAccountInDto>(new SaveModelAccountInDto());

// 校验
const rules = {
  apiKey: [
    {required: true, message: '请输入API Key', trigger: 'blur'},
  ],
};

// 弹窗状态
const tutorialVisible = ref<boolean>(false);
// html 内容
const tutorialContent = ref<string>('')

// 弹窗状态切换
const handleTutorial = (state: boolean) => {
  tutorialVisible.value = state
}


// 保存模型key
const handleSave = async () => {
  const valid = await formRef.value?.validate();

  if (valid) {
    userService.saveModelAccount(formData).then(res => {
      if (res.code === 200) {
        message.success(Message, '配置保存成功！')
      }
    })
  } else {
    message.error(Message, '请完善必填项！')
  }
};


// 获取app key
const getAppKey = () => {
  const data: GetModelAccountInDto = {
    modelType: '1'
  }

  userService.getModelAccount(data).then(res => {
    if (res.code === 200) {
      Object.assign(formData, res.data)
    }
  })
}

// 获取简介
const getAiRegisterGuide = () => {
  const data: GetAiRegisterGuideInDto = {
    modelType: '1'
  }
  adminService.getAiRegisterGuide(data).then(res => {
    if (res.code === 200) {
      tutorialContent.value = res.data.content
    }
  })
}

onMounted(() => {
  getAppKey();
  getAiRegisterGuide();
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.modal-content {
  width: 100%;
  height: 100%;
  padding: vh(40) vw(80) vh(110) vw(40);
  position: relative;

  .modal-title {
    font-family: 'YouSheBiaoTiHei', 'PingFang SC', sans-serif;
    font-size: vw(28);
    line-height: 1;
    color: $font-dark;
    font-weight: 400;
  }

  .description {
    font-size: vw(16);
    color: $font-dark;
    font-weight: 500;
    line-height: vw(22);
  }

  .description-list {
    li {
      font-size: vw(16);
      color: $font-dark;
      font-weight: 500;
      line-height: vw(22);
    }
  }
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

    .api-key-input {
      :deep(.ivu-input) {
        height: vh(40);
        background-color: $bg-gray;
        border: none;
        border-radius: vw(2);
        padding: 0 vw(20);
        font-size: vw(16);
        color: $font-dark;

        &::placeholder {
          color: $placeholder-color;
          font-family: "PingFangSCBold", serif;
          font-size: vw(16);
          font-weight: 600;
          line-height: 1.5; /* 100% */
        }

        &:focus {
          box-shadow: none;
          background-color: $bg-gray;
        }
      }
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

  &:disabled {
    background-color: #EAECEE;
    color: #B0B7C6;
    cursor: not-allowed;

    &:hover {
      opacity: 1;
    }
  }

  :deep(> span) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: vw(6);
    color: $white;
    font-size: vw(12);
    font-weight: 600;

    .save-icon {
      width: vw(12);
      height: vw(12);
      display: block;
    }
  }
}

.decoration-img {
  position: absolute;
  right: vw(80);
  bottom: vh(110);
  width: vw(600);
  height: vh(492);
  aspect-ratio: 50/41;
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
