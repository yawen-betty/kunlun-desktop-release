<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import {ref} from "vue";
import SvgIcon from '@/components/svgIcon/index.vue';
import { platform } from '@tauri-apps/plugin-os';

const appWindow = ref() ;
try {
  appWindow.value = getCurrentWindow();
} catch (error) {
  console.info('=====',error);
}
const osPlatform = platform();
const isMax = ref(false);
</script>

<template>
  <div class="titlebar">
    <div data-tauri-drag-region></div>
    <div class="mac-controls" v-if="osPlatform === 'macos'">
      <div class="control-btn close-btn" @click="appWindow.close()">
        <SvgIcon name="icon-cucha" size="8"></SvgIcon>
      </div>
      <div class="control-btn min-btn" @click="appWindow.minimize()">
        <SvgIcon name="icon-zuixiaohua-mac" size="8"></SvgIcon>
      </div>
      <div class="control-btn max-btn" @click="appWindow.toggleMaximize();isMax = !isMax">
        <SvgIcon name="icon-zuidahua-mac" size="8" v-if="!isMax"></SvgIcon>
        <SvgIcon name="icon-huanyuan-mac" size="10" v-else></SvgIcon>
      </div>
    </div>
    <div class="win-controls" v-else>
      <div class="control-btn minimize" @click="appWindow.minimize()">
        <SvgIcon name="icon-zuixiaohua" size="14"></SvgIcon>
      </div>
      <div class="control-btn maximize" @click="appWindow.toggleMaximize();isMax = !isMax">
        <SvgIcon name="icon-zuidahua-windows" size="14" v-if="!isMax"></SvgIcon>
        <SvgIcon name="icon-huanyuan-windows" size="14" v-else></SvgIcon>
      </div>
      <div class="control-btn close-btn" @click="appWindow.close()">
        <SvgIcon name="icon-cha" size="14"></SvgIcon>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;
.titlebar {
  height: 28px;
  background: transparent;
  user-select: none;
  display: grid;
  grid-template-columns: auto max-content;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index:9999999999;
}
.titlebar {
  .mac-controls {
    position: absolute;
    left: 10px;
    top: 10px;
    display: flex;

    .svg-icon{
      display: none;
    }

    &:hover{
      .svg-icon{
        display: block;
      }
    }

    .control-btn{
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      margin-right: 6px;
      border-radius: 50px;
      border: 1px solid transparent;
    }

    .min-btn{
      background: #febc2f;
      border: 1px solid #e8a719;
    }

    .close-btn{
      background: #ff5f57;
      border: 1px solid #e8483f;
    }

    .max-btn{
      background: #29cc42;
      border: 1px solid #12b227;
    }
  }
  .win-controls {
    position: absolute;
    right: 16px;
    top: 6px;
    display: flex;

    .svg-icon{
      color: $font-middle;
    }

    .control-btn{
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      margin-left: 12px;

      &:hover{
        background: $hover-color;
      }
    }
  }
}

</style>
