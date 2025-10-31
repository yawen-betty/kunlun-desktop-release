<!--基本信息收集-->
<template>
  <div class="init-profile-container">
    <div class="left-section">
      <div class="main-slogan">{{ SystemInfo.info.loginTitle }}</div>
      <Image :src="SystemInfo.info.loginBg" class="section-bg"/>
    </div>

    <div class="right-section">
      <h3 class="form-title">Hello！请完善您的基本信息</h3>

      <Form ref="formValidateRef" :model="formValidate" :rules="ruleValidate" class="form-validate">
        <InitProfileForm :form-data="formValidate" :formValidateRef="formValidateRef"/>
      </Form>


      <div class="form-submit">
        <Button type="primary" @click="handleSubmit" class="submit_btn">
          <SvgIcon name="icon-fuhe" class="submit-icon" size="10"/>
          <span>完成</span>
        </Button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {Image, Form, Button, Message} from 'view-ui-plus';
import {InitProfileInDto} from '@/api/user/dto/InitProfile.ts';
import {UserService} from '@/service/UserService.ts';
import {useRouter} from 'vue-router';
import {SystemInfo} from "@/utiles/systemInfo.ts";
import InitProfileForm from '@/components/initProfileForm/index.vue'
import SvgIcon from "@/components/svgIcon/index.vue";
import {validateMobile, validateEmail} from '@/utiles/validators.ts';
import {message} from "@/utiles/Message.ts";

const router = useRouter();
const userService = new UserService();

const formValidateRef = ref<any>(null);
// 表单数据
const formValidate = reactive<InitProfileInDto>(new InitProfileInDto());

// 校验
const ruleValidate = {
  name: [
    {required: true, message: '请输入姓名', trigger: 'blur'}
  ],
  gender: [
    {required: true, message: '请选择性别', trigger: 'change', type: 'number'},
  ],
  birthDate: [
    {required: true, message: '请选择出生年月', trigger: 'change', type: 'date',},
  ],
  areaInfoBeanList: [
    {required: true, message: '请选择居住城市', trigger: 'change', type: 'array', mix: 1},
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

// 提交表单
const handleSubmit = async () => {
  formValidateRef.value.validate((valid: boolean) => {
    if (valid) {
      const data: InitProfileInDto = {
        ...formValidate,
        birthDate: new Date(formValidate.birthDate).getTime()
      }

      userService.initProfile(data).then(() => {
        router.push('/resume');
      })
    } else {
      message.error(Message, '请完善必填项！')
    }

  })
};
</script>

<style scoped lang="scss">
.init-profile-container {
  width: 100vw;
  height: 100vh;
  background-color: $white;
  display: flex;

  .left-section {
    width: vw(600);
    background: linear-gradient(163deg, #FFB32C 0%, #FC8919 100%);
    padding: vh(147) vw(29) 0 vw(27);

    .main-slogan {
      color: $white;
      font-family: 'YouSheBiaoTiHei', serif;
      font-size: vw(60);
      font-style: normal;
      font-weight: 400;
      line-height: vw(50);
      padding-left: vw(89);
    }

    .section-bg {
      margin-top: vh(121);
      width: vw(544);
      height: vw(544);
    }
  }
}

.right-section {
  flex: 1;
  padding: vh(200) vw(197) vh(290) vw(180);

  .form-title {
    color: $font-dark;
    font-size: vw(28);
    font-weight: bold;
    line-height: vw(28);
  }

  .form-validate {
    margin-top: vh(100);
  }

  .form-submit {
    margin-top: vh(120);
    display: flex;
    justify-content: flex-end;


    .submit_btn {
      width: vw(80);
      height: vh(32);
      padding: 0 vw(20);
      border-radius: vw(2);
      background: linear-gradient(0deg, #FC8719 0%, #FC8719 100%), #E8EAEC;
      outline: none;
      border: 0;
      box-shadow: none;
      display: flex;
      justify-content: center;

      span {
        color: $white;
        font-size: vw(12);
        font-style: normal;
        font-weight: 600;
      }
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
