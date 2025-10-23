<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import {ref} from "vue";

const appWindow = ref() ;
try {
  appWindow.value = getCurrentWindow();
} catch (error) {
  console.info('=====',error);
}
</script>

<template>
  <div class="titlebar">
    <div data-tauri-drag-region></div>
    <div class="controls">
      <button id="titlebar-minimize" title="minimize" @click="appWindow.minimize()">
        <!-- https://api.iconify.design/mdi:window-minimize.svg -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M19 13H5v-2h14z" />
        </svg>
      </button>
      <button id="titlebar-maximize" title="maximize" @click="appWindow.toggleMaximize()">
        <!-- https://api.iconify.design/mdi:window-maximize.svg -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M4 4h16v16H4zm2 4v10h12V8z" />
        </svg>
      </button>
      <button id="titlebar-close" title="close" @click="appWindow.close()">
        <!-- https://api.iconify.design/mdi:close.svg -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.titlebar {
  height: 34px;
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
.titlebar > .controls {
  display: flex;
}
.titlebar button {
  appearance: none;
  padding: 0;
  margin: 0;
  border: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  background-color: transparent;
}
.titlebar button:hover {
  background: #5bbec3;
}
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
</style>
