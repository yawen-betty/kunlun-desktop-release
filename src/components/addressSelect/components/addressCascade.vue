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
                    {'cascade-item-selected': isItemSelected(item)},
                    {'cascade-item-has-selected-children': hasSelectedChildren(item)},
                    {'last-animation': !item?.children?.length && item.level === 3}
                ]"
            >
                <!-- 显示名称，高亮选中项 -->
                <span
                    :class="{
                        'address-cascade-highlight': item.id === highlightingId && item.children?.length,
                        'address-cascade-selected': isItemSelected(item)
                    }"
                >
                    {{ item.name }}
                </span>
                <!-- 如果有子节点-->
                <i v-if="item.children?.length" class="el-icon-arrow-right"></i>
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
        />
    </div>
</template>

<script setup lang="ts">
import {computed, inject, nextTick, ref, watch} from 'vue';
import {Message} from 'view-ui-plus';
import {AreaInfoBean} from '@/api/user/dto/bean/AreaInfoBean.ts';

interface Props {
    // 当前选中的值数组
    modelValue: AreaInfoBean[];
    // 当前层级的选项列表
    optionsList: AreaInfoBean[];
    // 是否多选
    multiple?: boolean;
    // 最大可选数量
    max?: number;
    // 是否为递归进入
    recursion?: boolean;
    isPopTipVisible?: boolean;
    originalCityTree?: AreaInfoBean[];
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
    originalCityTree: () => []
});

const emitUpdate = inject<(item: AreaInfoBean) => void>('emitUpdate');
const deleteItem = inject<(index: number) => void>('deleteItem');

const emit = defineEmits<{
    'update:modelValue': [value: AreaInfoBean[]];
}>();

// 响应式数据
const cascadeLower = ref<AreaInfoBean[]>([]);
const highlightingId = ref<string>('');

// 计算属性
const cityTree = computed(() => {
    return props.optionsList;
});

// 检查当前项是否被选中（用于回显）
const isItemSelected = (item: AreaInfoBean) => {
    return props.modelValue.some((selected) => selected.id === item.id);
};

// 检查当前项的子项是否有被选中的（用于父级高亮）
const hasSelectedChildren = (item: AreaInfoBean): boolean => {
    if (!item.children?.length) return false;

    // 递归检查所有子项
    const checkChildren = (children: AreaInfoBean[]): boolean => {
        return children.some((child) => {
            if (props.modelValue.some((selected) => selected.id === child.id)) {
                return true;
            }
            if (child.children?.length) {
                return checkChildren(child.children);
            }
            return false;
        });
    };

    return checkChildren(item.children);
};

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

// 根据已选中的值初始化展开状态
const initializeExpandedState = () => {
    if (props.modelValue.length > 0 && !props.recursion) {
        const firstSelected = props.modelValue[0];
        // 查找选中项的路径并展开
        const findAndExpandPath = (items: AreaInfoBean[], targetId: string): boolean => {
            for (const item of items) {
                if (item.id === targetId) {
                    highlightingId.value = item.pid || '';
                    return true;
                }
                if (item.children?.length) {
                    if (findAndExpandPath(item.children, targetId)) {
                        cascadeLower.value = item.children;
                        highlightingId.value = item.id;
                        return true;
                    }
                }
            }
            return false;
        };

        findAndExpandPath(props.originalCityTree, firstSelected.id);
    }
};

// 监听器
watch(
    () => props.isPopTipVisible,
    (newValue) => {
        if (!newValue) {
            cascadeLower.value = props.optionsList?.[0]?.children || [];
            highlightingId.value = props.optionsList?.[0]?.id || '';
        } else {
            // 弹窗打开时初始化展开状态
            nextTick(() => {
                initializeExpandedState();
            });
        }
    }
);

watch(
    () => props.optionsList,
    async (newValue) => {
        // 国内逻辑：取第一个选项的 children
        nextTick(() => {
            if (props.modelValue.length === 0 || props.recursion) {
                cascadeLower.value = props.optionsList?.[0]?.children || [];
                highlightingId.value = props.optionsList?.[0]?.id || '';
            } else {
                initializeExpandedState();
            }
        });
    },
    {immediate: true, deep: true}
);
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;
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
            font-size: vw(14);
            transition: padding-left 0.2s ease-in-out;

            span {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .address-cascade-highlight {
                color: $theme-color;
            }

            &:hover {
                background: $hover-color;
                padding-left: vw(26);
            }

            &.last-animation:hover {
                animation: move-title 0.2s ease both;
            }
        }

        .cascade-children-highlight {
            justify-content: flex-start;
            background: $theme-color !important;
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

        // 选中状态样式
        .cascade-item-selected {
            background: rgba($theme-color, 0.1);
            color: $theme-color;
            font-weight: 600;
        }

        // 有选中子项的父项样式
        .cascade-item-has-selected-children {
            color: $theme-color;
            font-weight: 500;
        }

        .address-cascade-selected {
            background: $theme-color !important;
            color: $white;
            font-weight: 600;
            padding-left: vw(26);
            position: relative;
            width: 100%;

            &::before {
                content: '';
                width: vw(6);
                height: vw(6);
                position: absolute;
                left: vw(10);
                top: vh(10);
                z-index: 9;
                background: $white;
                border-radius: 50%;
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
