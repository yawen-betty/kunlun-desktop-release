<template>
  <div class="personal-info-tabs">
    <Tabs :model-value="modelValue" @on-click="handleTabClick">
      <TabPane label="我的简历" name="resume"></TabPane>
      <TabPane label="面试记录" name="interview"></TabPane>
      <TabPane label="基础设置" name="basic"></TabPane>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleTabClick = (name: string) => {
  emit('update:modelValue', name);
};
</script>

<style scoped lang="scss">
.personal-info-tabs {
  border-bottom: 1px solid $border-default;

  :deep(.ivu-tabs-ink-bar) {
    height: 0;
  }

  :deep(.ivu-tabs) {
    padding: 0 vw(40);

    .ivu-tabs-bar {
      margin-bottom: 0;
      border: 0;
    }

    .ivu-tabs-nav {
      .ivu-tabs-tab {
        color: $font-middle;
        font-size: vw(14);
        font-weight: 500;
        padding: vh(34) 0 vh(22);
        margin-right: vw(40);

        &:first-child {
          margin-left: 0;
        }

        &.ivu-tabs-tab-active {
          color: $font-dark;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
