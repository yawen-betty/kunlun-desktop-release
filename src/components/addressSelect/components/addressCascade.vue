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
                <span v-if="currentCountry.id === '1'"
                      :class="{'address-cascade-highlight': item.id === highlightingId && item.children?.length}">
                    {{ item.name }}
                </span>
                <span v-else :class="{'address-cascade-highlight': item.id === highlightingId && item.level !== 3}">
                    <div v-if="item.name === '全部'">
                        <span>{{ item.name }}</span>
                    </div>
                    <div v-else>
                        <div>{{ item.zhCn }}</div>
                        <div>{{ item.name ?? item.statesName }}</div>
                    </div>
                </span>

                <!-- 如果有子节点或海外二级显示箭头 -->
                <i v-if="item.children?.length || (item.level === 2 && currentCountry.id !== '1')"
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
            :currentCountry="currentCountry"
            :getOverseasAreaList="getOverseasAreaList"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, inject, nextTick }from 'vue';
import { Message }from 'view-ui-plus';
import { QueryCountryListOutDto }from '@/api/system/dto/QueryCountryList';
import { AreaInfoBean }from '@/api/system/dto/bean/AreaInfoBean';

interface Props {
    // 当前选中的值数组
    modelValue: AreaInfoBean[]
    // 当前层级的选项列表
    optionsList: AreaInfoBean[]
    // 是否多选
    multiple?: boolean
    // 最大可选数量
    max?: number
    // 当前国家信息
    currentCountry?: QueryCountryListOutDto
    // 是否为递归进入
    recursion?: boolean
    // 海外获取下级接口
    getOverseasAreaList?: (countryId: string, search: string, highlightingId: string, type: string) => Promise<AreaInfoBean[]>
    isPopTipVisible?: boolean
    originalCityTree?: AreaInfoBean[]
    originalOverseaTree?: AreaInfoBean[]
}

class AreaInfoBeanAdd extends AreaInfoBean {
    highlightingId?: string = '';
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    optionsList: () => [],
    multiple: false,
    max: 1,
    currentCountry: () => ({ id: '1', zhCn: '中国', name: 'China' }),
    recursion: false,
    getOverseasAreaList: async () => [],
    isPopTipVisible: false,
    originalCityTree: () => [],
    originalOverseaTree: () => []
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

    if (props.currentCountry.id === '1') {
        return selectedIds.includes(item.id) && !item.children?.length;
    }else {
        return selectedIds.includes(item.id) && item.level === 3;
    }
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
        }else if (target.children?.length) {
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
    }else {
        if (AreaInfoBean.name === '全部') {
            if (props.currentCountry.id === '1') {
                const parentItem = handleRecursion(props.originalCityTree, AreaInfoBean.pid!);

                if (parentItem) {
                    AreaInfoBean.name = parentItem.name;
                }
            }
        }
        if (props.multiple) {
            if (props.modelValue.length < props.max) {
                const newValue = [...props.modelValue, AreaInfoBean];

                emit('update:modelValue', newValue);
            }else {
                Message.error(`最多选择${props.max}个！`);
            }
        }else {
            handleSelectItem(AreaInfoBean);
        }
    }
};

const loadOverseasSubordinate = async () => {
    if (props.optionsList?.[0]?.level === 3)return;

    highlightingId.value = props.optionsList?.[0]?.id || '';
    const result = await props.getOverseasAreaList!(props.currentCountry.id, '', highlightingId.value, '1');

    if (result.length) {
        cascadeLower.value = result;
        if (cascadeLower.value[0].name === '全部') {
            cascadeLower.value[0].zhCn = props.optionsList[0].zhCn;
            cascadeLower.value[0].enUs = props.optionsList[0].name;
        }
    }else {
        cascadeLower.value = [
            {
                id: highlightingId.value,
                name: '全部',
                zhCn: props.optionsList?.[0]?.zhCn,
                enUs: props.optionsList?.[0]?.name,
                level: 3,
                statesName: '',
                statesZhCh: ''
            }
        ];
    }
};

const handleClickItem = async (AreaInfoBean: AreaInfoBeanAdd) => {
    // 公共：设置高亮 id
    if (AreaInfoBean.id) highlightingId.value = AreaInfoBean.id;

    if (props.currentCountry.id === '1') {
        // 国内逻辑
        if (AreaInfoBean.children) cascadeLower.value = AreaInfoBean.children;

        if (!AreaInfoBean.children?.length) {
            handleFinalSelect(AreaInfoBean);
        }
    }else {
        // 海外逻辑
        if (AreaInfoBean.level === 3) {
            handleFinalSelect(AreaInfoBean);
        }else if (props.optionsList?.[0]?.level !== 3) {
            // 加载海外下级列表
            const result = await props.getOverseasAreaList!(props.currentCountry.id, '', highlightingId.value, '1');

            console.log('%c 🇨🇵: handleClickItem -> result.length ', 'font-size:16px;background-color:#6ab45b;color:white;', result.length);
            if (result.length) {
                cascadeLower.value = result;
                if (cascadeLower.value[0].name === '全部') {
                    cascadeLower.value[0].zhCn = AreaInfoBean.zhCn;
                    cascadeLower.value[0].enUs = AreaInfoBean.name;
                }
            }else {
                cascadeLower.value = [
                    {
                        id: AreaInfoBean.highlightingId || AreaInfoBean.id,
                        name: '全部',
                        zhCn: AreaInfoBean.zhCn,
                        enUs: AreaInfoBean.name,
                        level: 3,
                        stateId: '',
                        statesName: '',
                        statesZhCh: ''
                    }
                ] as any;
            }
        }
    }
};

// 监听器
watch(() => props.isPopTipVisible, (newValue) => {
    if (!newValue) {
        cascadeLower.value = props.optionsList?.[0]?.children || [];
        highlightingId.value = props.optionsList?.[0]?.id || '';
    }
});

watch(() => props.currentCountry.id, () => {
    cascadeLower.value = [];
});

watch(() => props.optionsList, async (newValue) => {
    if (props.currentCountry.id === '1') {
        // 国内逻辑：取第一个选项的 children
        nextTick(() => {
            cascadeLower.value = props.optionsList?.[0]?.children || [];
            highlightingId.value = props.optionsList?.[0]?.id || '';
        });
    }else {
        // 海外逻辑：异步加载下级列表
        if (!isLastLevel(cascadeLower.value)) {
            newValue.length >= 1 && (await loadOverseasSubordinate());
        }
    }
}, { immediate: true, deep: true });
</script>

<style lang="scss" scoped>
.address-cascade-wrapper {
    display: flex;
    flex: 1;
    height: 296px;

    .address-cascade-list {
        display: flex;
        flex-direction: column;
        row-gap: 4px;
        flex: 1;
        height: calc(100% - 30px);
        padding: 0 15px;
        margin: 15px 0;
        list-style: none;
        overflow-y: auto;

        .address-cascade-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 10px;
            line-height: 26px; /* 文字垂直居中 */
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
            color: #fff !important;

            &::before {
                content: '';
                width: 6px;
                height: 6px;
                background-color: #fff;
                border-radius: 50%;
                margin-right: 10px;
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
        padding-left: 10px;
    }
    to {
        padding-left: 25px;
    }
}
</style>
