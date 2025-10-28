<script setup lang="ts">
import {nextTick, onMounted, ref, watch} from "vue";
import {UserInfo} from "@/utiles/userInfo.ts";
import Ellipsis from "@/components/ellipsis/index.vue";
import routes from '@/router/routers.ts';
import {useRoute, useRouter} from "vue-router";
import SvgIcon from '@/components/svgIcon/index.vue';
import {Col, Image} from "view-ui-plus";

/**
 * 监听窗口大小,调整尺寸 开始
 */
const minSize = ref(false);
const listenerResize = () => {
  minSize.value = window.innerWidth < 1500;
};
/**
 * 监听窗口大小,调整尺寸 结束
 */

/**
 * 处理用户名 开始
 */

// 使用正则表达式匹配中文字符
const chinesePattern = /[\u4e00-\u9fa5]/;
const hasChineseCharacters = (str: string) => {
  // 检查字符串中是否包含中文字符
  if (chinesePattern.test(str)) {
    return str && str.length && str.length >= 2 ? str.substring(str?.length - 2) : str.substring(str?.length - 1);
  }else {
    return str.substring(0, 1);
  }
};
/**
 * 处理用户名 结束
 */

const activeMenu = ref();
const route = useRoute();
const router = useRouter();
const menuRef = ref<any>(null);
const selectMenu = (path: string) => {
  router.push({
    path: path,
  });
};
watch(route, (newRoute) => {
  activeMenu.value = newRoute.path;
  nextTick(() => {
    menuRef.value.updateActiveName();
  });
});
onMounted(() => {
  listenerResize();
  window.addEventListener('resize', () => {
    listenerResize();
  });

  activeMenu.value = route.path;
});
</script>

<template>
  <div class="left-menu" :class="{ minibar: minSize}">
    <div class="user">
      <img v-if="UserInfo.info.avatar" :src="UserInfo.info.avatar" class="user-avatar mr-10"/>
      <div class="user-circle" v-else>{{hasChineseCharacters(UserInfo.info.userName)}}</div>
      <div v-if="!minSize" class="user-text">
        <Ellipsis
          :content="UserInfo.info.userName"
          placement="bottom"
        />
      </div>
    </div>
    <Menu :active-name="activeMenu" @on-select="selectMenu" ref="menuRef">
      <template v-for="item in routes" :key="item.path">
        <MenuItem :name="item.path" v-if="item.show">
          <SvgIcon :name="item.meta.icon" :size="minSize ? '20px' : '16px'"/>
          {{item.meta.title}}
        </MenuItem>
      </template>
    </Menu>
  </div>
</template>

<style scoped lang="scss">
.left-menu{
  width: 160px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid $border-default;
  box-sizing: content-box;

  .user{
    display: flex;
    align-items: center;
    padding: 60px 20px 20px;

    .user-avatar{
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }

    .user-circle{
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: $theme-color;
      margin-right: 10px;
      font-size: 12px;
      font-weight: bold;
      color: #fff;
    }

    .user-text{
      width: 80px;
      font-size: 16px;
      font-weight: bold;
      color: $font-dark;
    }
  }

  :deep(.ivu-menu){
    width: 160px !important;

    &:after{
      display: none;
    }
  }

  :deep(.ivu-menu-item){
    display: flex;
    align-items: center;
    margin: 10px;
    padding: 0 20px;
    width: 140px;
    height: 46px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: bold;
    color: $font-dark;

    &:hover{
      background: $hover-color;
    }

    .svg-icon{
      margin-right: 10px;
      color: $font-dark;
    }
  }

  .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu){
    background: $theme-color;
    color: #fff;

    .svg-icon{
      color: #fff;
    }

    &:after{
      display: none;
    }
  }
}

.minibar{
  width: 74px;

  .user{
    padding: 55px 0 15px;
    justify-content: center;

    .user-circle{
      width: 40px;
      height: 40px;
      margin-right: 0;
      font-size: 16px;
    }
  }

  :deep(.ivu-menu){
    width: 74px !important;
  }

  :deep(.ivu-menu-item){
    flex-direction: column;
    justify-content: center;
    width: 54px;
    height: 54px;
    padding: 0;
    font-size: 10px;

    .svg-icon{
      margin-right: 0;
      margin-bottom: 6px;
    }
  }
}
</style>
