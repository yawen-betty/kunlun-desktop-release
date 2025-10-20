<script setup lang="ts">
import { auth } from '@/utiles/tauriCommonds.ts';
import {onMounted, ref} from "vue";
import {FormItem, Input} from "view-ui-plus";

const token = ref('');

const save = async () => {
  await auth.saveToken('testToken1234');
}
const get = async () => {
  console.info('///////////////',await auth.getToken())
  token.value = await auth.getToken() as string;
}
onMounted(async () => {
  // await keyboard.listenSaveShortcut();
})
</script>

<template>
  <div class="resume">
<!--    <div @click="save">保存</div>-->
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
