<!--基本信息表单内容组件-->
<template>
  <div class="form-row">
    <FormItem label="姓名" prop="name">
      <Input v-model="formData.name" placeholder="请输入" :maxlength="10" clearable></Input>
    </FormItem>
    <FormItem label="性别" prop="gender">
      <RadioGroup v-model="formData.gender" class="custom-radio">
        <Radio :label="info.key" v-for="info in sex" :key="info.key">{{ info.value }}</Radio>
      </RadioGroup>
    </FormItem>
  </div>

  <div class="form-row">
    <FormItem label="出生年月" prop="birthDate" class="custom-date_picker">
      <DatePicker type="month" placeholder="请选择" v-model="formData.birthDate" :start-date="defaultDate"/>
    </FormItem>
    <FormItem label="居住城市" prop="areaInfoBeanList">
      <AddressSelect v-model="formData.areaInfoBeanList" @change="handleChange"/>
    </FormItem>
  </div>

  <div class="form-row">
    <FormItem label="手机号码" prop="mobile">
      <Input v-model="formData.mobile" placeholder="请输入" clearable @input="handleMobileInput"
             :maxlength="11"></Input>
    </FormItem>
    <FormItem label="个人邮箱" prop="email">
      <Input v-model="formData.email" placeholder="请输入" :maxlength="30" clearable @input="handleEmailInput"></Input>
    </FormItem>
  </div>
</template>

<script setup lang="ts">
import {FormItem, Input, Radio, RadioGroup, DatePicker} from 'view-ui-plus';
import {InitProfileInDto} from '@/api/user/dto/InitProfile.ts';
import {sex} from "@/enums/enumDict.ts";
import AddressSelect from '@/components/addressSelect/index.vue';
import {ref} from 'vue';

interface Props {
  formData: InitProfileInDto;
  formValidateRef: any
}

const props = defineProps<Props>();

// 默认展示1996年
const defaultDate = ref(new Date('1996-01-01'));

// 手机号输入限制（只允许数字）
const handleMobileInput = (e: any) => {
  const value: string = e.target.value
  const numericValue = value.replace(/\D/g, '');
  if (numericValue !== value) {
    props.formData.mobile = numericValue;
  }
};

// 邮箱输入限制（不允许中文和空格）
const handleEmailInput = (e: any) => {
  const value: string = e.target.value
  const filteredValue = value.replace(/[\u4e00-\u9fa5\s]/g, '');
  if (filteredValue !== value) {
    props.formData.email = filteredValue;
  }
};

// 触发校验
const handleChange = () => {
  props.formValidateRef.validateField('areaInfoBeanList')
}

</script>

<style scoped lang="scss">
.form-row {
  display: flex;

  :deep(.ivu-form-item) {
    width: vw(400);
  }

  & > div:nth-of-type(1) {
    margin-right: vw(143)
  }
}
</style>
