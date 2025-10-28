<!-- 搜索输入框 -->
<script setup lang="ts" name="SearchBox">
const props = defineProps({
  routes: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['update:modelValue', 'onChange']);
const change = (e: any) => {
  emits('update:modelValue', e.target.value);
  emits('onChange', e);
};

</script>

<template>
  <div class="search-input">
    <Input v-bind="$attrs" @on-change="change">
    </Input>
    <SvgIcon name="icon-sousuo" size="12"/>
  </div>
</template>

<style scoped lang="scss">
.search-input {
  position: relative;

  :deep(.ivu-input) {
    padding-right: vw(22);
  }

  .svg-icon {
    position: absolute;
    right: vw(10);
    top: vh(11);
    display: block;
  }

  :deep(.ivu-icon-ios-close-circle) {
    background-color: $white;
    width: vh(12);
    height: vh(30);
    background-size: vw(10) vw(10);
    background-position: right center;
    top: vh(1)
  }
}
</style>
