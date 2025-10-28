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

        <div class="form-row">
          <FormItem label="姓名" prop="name">
            <Input v-model="formValidate.name" placeholder="请输入" :maxlength="10" clearable></Input>
          </FormItem>
          <FormItem label="性别" prop="gender">
            <RadioGroup v-model="formValidate.gender" class="custom-radio">
              <Radio :label="info.key" v-for="info in sex" :key="info.key">{{ info.value }}</Radio>
            </RadioGroup>
          </FormItem>
        </div>

        <div class="form-row">
          <FormItem label="出生年月" prop="birthDate" class="custom-date_picker">
            <DatePicker type="month" placeholder="请选择" v-model="formValidate.birthDate"/>
          </FormItem>
          <FormItem label="居住城市" prop="city">
            <AddressSelect
              v-model="formValidate.city"
            />
          </FormItem>
        </div>
        <div class="form-row">
          <FormItem label="手机号码" prop="mobile">
            <Input v-model="formValidate.mobile" placeholder="请输入" clearable></Input>
          </FormItem>

          <FormItem label="个人邮箱" prop="email">
            <Input v-model="formValidate.email" placeholder="请输入" :maxlength="30" clearable></Input>
          </FormItem>

        </div>
      </Form>
    </div>
  </div>

</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import {Image, Input, Radio, RadioGroup} from 'view-ui-plus';
import {InitProfileInDto} from '@/api/user/dto/InitProfile.ts';
import {UserService} from '@/service/UserService.ts';
import {useRouter} from 'vue-router';
import {SystemInfo} from "@/utiles/systemInfo.ts";
import {sex} from "@/enums/enumDict.ts";
import AddressSelect from '@/components/addressSelect/index.vue'

const router = useRouter();
const userService = UserService.getInstance();

const formValidateRef = ref(null);
// 表单数据
const formValidate = reactive<InitProfileInDto>(new InitProfileInDto());

// 校验
const ruleValidate = {}

// 提交表单
const handleSubmit = async () => {

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

    .form-row {
      display: flex;
      justify-content: space-between;

      :deep(.ivu-form-item) {
        width: vw(400);
      }
    }
  }

}


</style>
