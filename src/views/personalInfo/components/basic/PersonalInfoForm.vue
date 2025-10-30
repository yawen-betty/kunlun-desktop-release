<template>
  <div class="personal-info-form">
    <h1 class="form-title">个人信息</h1>

    <Form ref="formRef" :model="formValidate" :rules="ruleValidate" class="form-validate">
      <!-- 头像上传 -->
      <div class="form-section">
        <div class="form-label">头像</div>
        <div class="avatar-upload">
          <Upload
            :show-upload-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            action="/api/upload"
          >
            <div class="avatar-container">
              <div class="avatar-circle">
                <span class="avatar-text">小方</span>
              </div>
            </div>
          </Upload>
        </div>
      </div>

      <InitProfileForm :form-data="formValidate"/>

      <!-- 保存按钮 -->
      <div class="form-actions">
        <Button type="primary" @click="handleSave" class="save-btn">
          <SvgIcon name="icon-baocun" size="12" color="#fff"/>
          保存
        </Button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {Form, FormInstance} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import InitProfileForm from "@/components/initProfileForm/index.vue";
import {validateEmail, validateMobile} from "@/utiles/validators.ts";
import {InitProfileInDto} from "@/api/user/dto/InitProfile.ts";

const formRef = ref<FormInstance>();

// 表单
const formValidate = reactive<InitProfileInDto>(new InitProfileInDto());

// 校验
const ruleValidate = {
  name: [
    {required: true, message: '请输入姓名', trigger: 'blur'}
  ],
  gender: [
    {required: true, message: '请选择性别', trigger: 'change'},
  ],
  birthDate: [
    {required: true, message: '请选择出生年月', trigger: 'change'},
  ],
  city: [
    {required: true, message: '请选择居住城市', trigger: 'change', type: 'array'},
  ],
  mobile: [
    {required: true, message: '请输入手机号码', trigger: 'blur'},
    {validator: validateMobile, trigger: 'blur'},
  ],
  email: [
    {required: true, message: '请输入个人邮箱', trigger: 'blur'},
    {validator: validateEmail, trigger: 'blur'},
  ],
}

const handleAvatarSuccess = (response: any) => {
  // 处理头像上传成功
  console.log('头像上传成功', response);
};

const beforeAvatarUpload = (file: File) => {
  // 头像上传前验证
  const isImage = file.type.indexOf('image/') === 0;
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    console.error('请上传图片格式文件');
    return false;
  }
  if (!isLt2M) {
    console.error('图片大小不能超过2MB');
    return false;
  }
  return true;
};

const handleSave = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      console.log('表单数据', formData);
      // 提交表单数据
    }
  });
};
</script>

<style scoped lang="scss">
.personal-info-form {
  width: vw(1279);
  height: vh(940);
  background: $white;
  border-radius: vw(2);
  box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);
  padding: vh(40);

  .form-title {
    font-size: vw(28);
    color: $font-dark;
    font-weight: 400;
    margin-bottom: vh(68);
  }

  .form-section {
    margin-bottom: vh(40);
  }


  .avatar-upload {
    .avatar-container {
      cursor: pointer;
    }

    .avatar-circle {
      width: vw(80);
      height: vw(80);
      border-radius: 50%;
      background: linear-gradient(90deg, $theme-color 0%, $theme-color 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      .avatar-text {
        color: white;
        font-size: vw(30);
        font-weight: 500;
      }
    }
  }

  .form-actions {
    margin-top: vh(40);

    .save-btn {
      width: vw(82);
      height: vh(32);
      background: $theme-color;
      border: none;
      border-radius: vw(2);
      padding: vh(10) vw(20);
      font-size: vw(12);
      font-weight: 500;
    }

    :deep(.ivu-btn span) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      gap: vw(6);
    }
  }
}
</style>
