<script setup lang="ts">
import { auth } from '@/utiles/tauriCommonds.ts';
import {onMounted, ref} from "vue";

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
  <div>
<!--    <div @click="save">保存</div>-->
    <div style="margin-top: 50px" @click="get">获取</div>
    <div>{{token}}</div>
  </div>
</template>

<style scoped lang="scss">

</style>
