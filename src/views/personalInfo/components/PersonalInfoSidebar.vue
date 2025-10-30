<template>
  <div class="personal-info-sidebar">
    <Menu :active-name="modelValue" @on-select="handleSelect">
      <MenuItem v-for="item in menuItems" :key="item.name" :name="item.name">
        <span class="menu-text">{{ item.label }}</span>
      </MenuItem>
    </Menu>

    <div class="logout-btn" @click="handleLogout">
      <SvgIcon name="icon-tuichu-mian" size="14" color="#B0B7C7"/>
      <span class="logout-text">退出登录</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/svgIcon/index.vue';

interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const menuItems = [
  {name: 'personal', label: '个人信息'},
  {name: 'model', label: '模型账号'},
  {name: 'cache', label: '清理缓存'},
  {name: 'version', label: '版本更新'},
  {name: 'feedback', label: '问题反馈'},
  {name: 'help', label: '帮助中心'},
  {name: 'about', label: '关于我们'},
  {name: 'settings', label: '通用设置'}
];

const handleSelect = (name: string) => {
  emit('update:modelValue', name);
};

const handleLogout = () => {
};
</script>

<style scoped lang="scss">
.personal-info-sidebar {
  width: vw(360);
  height: vh(570);
  background: $white;
  border-radius: vw(2);
  position: relative;

  :deep(.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu):after) {
    background-color: $white;
  }

  :deep(.ivu-menu-vertical.ivu-menu-light:after) {
    width: 0;
    height: 0;
  }

  :deep(.ivu-menu) {
    background: transparent;
    border: none;
    padding: vw(20);
    margin: 0;
    width: 100% !important;

    .ivu-menu-item {
      height: vh(50);
      line-height: vh(50);
      padding: 0 vw(20);
      margin-bottom: 0;
      border-radius: vw(2);
      position: relative;
      transition: padding-left 0.2s ease-in-out;

      &:hover {
        padding-left: vw(36);
        background: linear-gradient(0deg, #FFF8F2 0%, #FFF8F2 100%), #E8EAEC;
      }

      &:before {
        content: '';
        position: absolute;
        left: vw(20);
        top: 50%;
        transform: translateY(-50%);
        width: vw(6);
        height: vw(6);
        border-radius: 50%;
        background: transparent;
      }

      .menu-text {
        color: $font-dark;
        font-size: vw(16);
        font-weight: 500;
        margin-left: vw(20);
        line-height: vw(20);
      }

      &.ivu-menu-item-active {
        background: linear-gradient(90deg, $hover-color 0%, $hover-color 100%);

        &:before {
          background: $theme-color;
        }

        .menu-text {
          color: $theme-color;
        }
      }

      &:hover:not(.ivu-menu-item-active) {
        background: rgba(0, 0, 0, 0.02);
      }
    }
  }

  .logout-btn {
    position: absolute;
    bottom: vh(20);
    left: 50%;
    transform: translateX(-50%);
    width: vw(320);
    height: vh(40);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: vw(10);
    border: 1px solid $border-default;
    border-radius: vw(2);
    cursor: pointer;
    transition: all 0.2s;

    .logout-text {
      color: $font-light;
      font-size: vw(14);
      font-weight: 500;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }
  }
}
</style>
