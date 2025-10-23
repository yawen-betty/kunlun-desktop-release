<script setup lang="ts">
import { auth } from '@/utiles/tauriCommonds.ts';
import {onMounted, ref} from "vue";
import {useCommon} from "@/utiles/useCommon.ts";

const token = ref('');

const save = async () => {
  await auth.saveToken('asasd');
}
const getToken = async () => {
   token.value = await auth.getToken();
}
const get = async () => {
  console.info('///////////////',await auth.getToken())
  token.value = await auth.getToken() as string;
}

/**
 * http测试
 */
const {http} = useCommon();
const login = () => {
  http.request<any>({
    url: '/login',
    method: 'POST',
    prefix: ''
  }, {
    username:'admin',
    password:'123456'
  }).then(res => {
    console.info('登录成功', res);
  }).catch(err => {
    console.info('登录失败', err);
  })
}


</script>

<template>
  <div class="resume">
    <div @click="save" class="mt-50">保存</div>
    <div @click="get">获取</div> {{ token }}
    <div @click="login">denglu</div>
    <div style="margin-top: 50px" @click="get">获取</div>
    <div>{{token}}</div>

    <Form :label-width="80">
      <FormItem label="Input">
        <Input  placeholder="Enter something..."></Input>
      </FormItem>

      <FormItem label="Input">
          <Input size="small" placeholder="Enter something..."></Input>
      </FormItem>

      <FormItem label="Input">
        <RadioGroup v-model="animal"  class="custom-radio">
          <Radio label="金斑蝶"></Radio>
          <Radio label="爪哇犀牛"></Radio>
          <Radio label="印度黑羚"></Radio>
        </RadioGroup>
      </FormItem>
    </Form>
  </div>
</template>

<style scoped lang="scss">
.resume{
  background: #fff;
  height: 100%;
}

</style>
