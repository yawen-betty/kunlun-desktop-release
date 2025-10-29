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
      <DatePicker type="month" placeholder="请选择" v-model="formData.birthDate"/>
    </FormItem>
    <FormItem label="居住城市" prop="city">
      <AddressSelect v-model="formData.city"/>
    </FormItem>
  </div>

  <div class="form-row">
    <FormItem label="手机号码" prop="mobile">
      <Input v-model="formData.mobile" placeholder="请输入" clearable type="tel"></Input>
    </FormItem>
    <FormItem label="个人邮箱" prop="email">
      <Input v-model="formData.email" placeholder="请输入" :maxlength="30" clearable type="email"></Input>
    </FormItem>
  </div>
</template>

<script setup lang="ts">
import {FormItem, Input, Radio, RadioGroup, DatePicker} from 'view-ui-plus';
import {InitProfileInDto} from '@/api/user/dto/InitProfile.ts';
import {sex} from "@/enums/enumDict.ts";
import AddressSelect from '@/components/addressSelect/index.vue';

interface Props {
  formData: InitProfileInDto;
}

defineProps<Props>();


</script>

<style scoped lang="scss">
.form-row {
  display: flex;
  justify-content: space-between;

  :deep(.ivu-form-item) {
    width: vw(400);
  }
}
</style>
