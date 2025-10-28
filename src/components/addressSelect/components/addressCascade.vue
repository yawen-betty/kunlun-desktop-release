<template>
  <!-- 根容器，如果没有选项且不是递归进入则不渲染 -->
  <div v-if="optionsList.length" :class="['address-cascade-wrapper', {'address-cascade-recursion': recursion}]">
    <!-- 当前层级的列表 -->
    <ul class="address-cascade-list">
      <li
        v-for="item in cityTree"
        :key="item.id"
        @click="handleClickItem(item)"
        :class="[
                    'address-cascade-item',
                    {'cascade-children-highlight': isItemHighlighted(item)},
                    {'last-animation': !item?.children?.length && item.level === 3}
                ]"
      >
        <!-- 显示名称，高亮选中项 -->
        <span :class="{'address-cascade-highlight': item.id === highlightingId && item.children?.length}">
            {{ item.name }}
        </span>
        <!-- 如果有子节点-->
        <i v-if="item.children?.length"
           class="el-icon-arrow-right"></i>
      </li>
    </ul>

    <!-- 递归渲染下级列表 -->
    <AddressCascade
      v-if="cascadeLower?.length && !isLastLevel(cascadeLower)"
      :modelValue="modelValue"
      :optionsList="cascadeLower"
      :originalCityTree="originalCityTree"
      :max="max"
      :multiple="multiple"
      :recursion="true"
      :getOverseasAreaList="getOverseasAreaList"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, inject, nextTick, ref, watch} from 'vue';
import {Message} from 'view-ui-plus';
import {AreaInfoBean} from '@/api/system/dto/bean/AreaInfoBean';

interface Props {
  // 当前选中的值数组
  modelValue: AreaInfoBean[]
  // 当前层级的选项列表
  optionsList: AreaInfoBean[]
  // 是否多选
  multiple?: boolean
  // 最大可选数量
  max?: number
  // 是否为递归进入
  recursion?: boolean
  isPopTipVisible?: boolean
  originalCityTree?: AreaInfoBean[]
}

class AreaInfoBeanAdd extends AreaInfoBean {
  highlightingId?: string = '';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  optionsList: () => [],
  multiple: false,
  max: 1,
  recursion: false,
  isPopTipVisible: false,
  originalCityTree: () => [],
});

const emitUpdate = inject<(item: AreaInfoBean) => void>('emitUpdate');
const deleteItem = inject<(index: number) => void>('deleteItem');

const emit = defineEmits<{
  'update:modelValue': [value: AreaInfoBean[]]
}>();

// 响应式数据
const cascadeLower = ref<AreaInfoBean[]>([]);
const highlightingId = ref<string>('');

// 计算属性
const cityTree = computed(() => {
  return props.optionsList;
});

// 方法
const isLastLevel = (list: AreaInfoBean[]) => {
  return list.length === 1 && (list[0].level === 3 || list[0].name === '全部') && props.recursion;
};

const isItemHighlighted = (item: AreaInfoBean) => {
  const selectedIds = props.modelValue.map((i) => i.id);

  return selectedIds.includes(item.id) && item.level === 3;
};

// 当前选中
const handleSelectItem = (item: AreaInfoBean) => {
  emitUpdate!(item);
};

const handleRecursion = (list: AreaInfoBean[], pid: string): AreaInfoBean | null => {
  let result: AreaInfoBean | null = null;

  for (let i = 0; i < list.length; i++) {
    const target = list[i];

    if (target.id === pid) {
      result = target;
    } else if (target.children?.length) {
      const r = handleRecursion(target.children, pid);

      if (r) result = r;
    }
  }

  return result;
};

const handleFinalSelect = (AreaInfoBean: AreaInfoBean) => {
  const index = props.modelValue.findIndex((i) => i.id === AreaInfoBean.id);

  highlightingId.value = '';

  if (index !== -1) {
    deleteItem!(index);
  } else {
    if (AreaInfoBean.name === '全部') {
      const parentItem = handleRecursion(props.originalCityTree, AreaInfoBean.pid!);

      if (parentItem) {
        AreaInfoBean.name = parentItem.name;
      }
    }
    if (props.multiple) {
      if (props.modelValue.length < props.max) {
        const newValue = [...props.modelValue, AreaInfoBean];

        emit('update:modelValue', newValue);
      } else {
        Message.error(`最多选择${props.max}个！`);
      }
    } else {
      handleSelectItem(AreaInfoBean);
    }
  }
};

const handleClickItem = async (AreaInfoBean: AreaInfoBeanAdd) => {
  // 公共：设置高亮 id
  if (AreaInfoBean.id) highlightingId.value = AreaInfoBean.id;

  // 国内逻辑
  if (AreaInfoBean.children) cascadeLower.value = AreaInfoBean.children;

  if (!AreaInfoBean.children?.length) {
    handleFinalSelect(AreaInfoBean);
  }

};

// 监听器
watch(() => props.isPopTipVisible, (newValue) => {
  if (!newValue) {
    cascadeLower.value = props.optionsList?.[0]?.children || [];
    highlightingId.value = props.optionsList?.[0]?.id || '';
  }
});

watch(() => props.optionsList, async (newValue) => {
  // 国内逻辑：取第一个选项的 children
  nextTick(() => {
    cascadeLower.value = props.optionsList?.[0]?.children || [];
    highlightingId.value = props.optionsList?.[0]?.id || '';
  });

}, {immediate: true, deep: true});
</script>

<style lang="scss" scoped>
.address-cascade-wrapper {
  display: flex;
  flex: 1;
  height: vh(296);

  .address-cascade-list {
    display: flex;
    flex-direction: column;
    row-gap: vw(4);
    flex: 1;
    height: calc(100% - 30px);
    padding: 0 vw(10);
    margin: vh(15) 0;
    list-style: none;
    overflow-y: auto;

    .address-cascade-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left: vw(10);
      line-height: vw(26);
      cursor: pointer;

      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .address-cascade-highlight {
        color: #5999ff;
      }

      &:hover {
        background: #eef5ff;
      }

      &.last-animation:hover {
        animation: move-title 0.2s ease both;
      }
    }

    .cascade-children-highlight {
      justify-content: flex-start;
      background: #5999ff !important;
      color: $white !important;

      &::before {
        content: '';
        width: vw(6);
        height: vw(6);
        background-color: $white;
        border-radius: 50%;
        margin-right: vw(10);
      }

      &:hover {
        animation: none !important;
      }
    }
  }
}

.address-cascade-recursion {
  display: contents;
}

@keyframes move-title {
  from {
    padding-left: vw(10);
  }
  to {
    padding-left: vw(25);
  }
}
</style>
