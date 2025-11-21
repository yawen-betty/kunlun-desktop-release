<!--选择地址-->
<template>
    <Poptip
        v-model="isDropDown"
        :disabled="props.disabled"
        class="address-custom_box"
        placement="bottom"
    >
        <div v-if="hasDefaultSlot">
            <slot/>
        </div>
        <div v-else
             :class="['custom-input' ,'pointer', 'p10', !isEmpty && 'custom-input-hover', isDropDown && 'custom-input-drop_down' , props.multiple && 'custom-input_multiple',props.disabled && 'custom-input_disabled','search-filter-option']"
        >
            <div class="custom-content">
                <div v-if="isEmpty" class="custom-placeholder ellipsis">
                    {{ props.placeholder }}
                </div>
                <template v-else>
                    <div v-if="!props.multiple" class="select-content ellipsis">
                        {{ props.modelValue[0]?.name }}
                    </div>
                    <div v-else class="tag-box">
            <span v-for="(info,index) in props.modelValue as  AreaInfoBean[]" :key="info.id"
                  class="tag p5">
                <span class="tag-text ellipsis mr-5">
                    info.name
                </span>
                <svg-icon class="icon-cha pointer" color="#9499A5" name="icon-cha" size="8"
                          @click.stop="clearSelect(index)"/>
            </span>
                    </div>
                </template>
            </div>
            <svg-icon :style="{display:props.disabled && 'block'}" class="icon-svg icon-arrow" color="#9499A5"
                      name="icon-jiantou-xia"
                      size="6" @click.stop="toggleDrop()"/>

            <svg-icon v-if="!isEmpty && !props.disabled" class="icon-svg icon-close" color="#9499A5" name="icon-cha"
                      size="10"
                      @click.stop="clearSelect(-1)"
            />
        </div>
        <template #content>
            <div class="custom-address-content">
                <AddressSearch :disabled="disabled" :isDropDown="isDropDown" :maxLevel="maxLevel"
                               @onClose="handleClose"/>

                <div class="address-cascade-container">
                    <AddressCascade
                        :isPopTipVisible="isDropDown"
                        :max="max"
                        :modelValue="modelValue"
                        :multiple="multiple"
                        :optionsList="cityTree"
                        :originalCityTree="cityTree"
                    />
                </div>
            </div>
        </template>
    </Poptip>
</template>

<script lang="ts" name="AddressSelect" setup>
import {computed, nextTick, onMounted, PropType, provide, ref, useSlots, watch} from 'vue';
import AddressSearch from '@/components/addressSelect/components/addressSearch.vue';
import AddressCascade from '@/components/addressSelect/components/addressCascade.vue';

import {AddressService} from "@/service/AddressService.ts";
import {QueryAreaInDto} from "@/api/address/dto/QueryArea.ts";
import {AreaInfoBean} from "@/api/user/dto/bean/AreaInfoBean.ts";

const slots = useSlots();

// 判断默认插槽是否有内容
const hasDefaultSlot = !!slots.default;

const props = defineProps({
    // 选中值
    modelValue: {
        type: [Array] as PropType<AreaInfoBean[]>,
        required: true,
        default: null
    },
    // 是否多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 占位符
    placeholder: {
        type: String,
        default: '请选择'
    },
    // 禁用
    disabled: {
        type: Boolean,
        default: false
    },
    // 选择的最大数量，因为是单选默认先给1吧
    max: {
        type: Number,
        default: 1
    },
    // 查询最大层级
    maxLevel: {
        type: Number,
        default: 2
    },
    // 是否需要热门城市
    isHotCity: {
        type: Boolean,
        default: false
    }
});

// 输出方法
const emits = defineEmits(['update:modelValue', 'change']);
// 下拉框展开状态
const isDropDown = ref<boolean>(false);
// 当前选中的值
const selectVal = ref<AreaInfoBean[]>([]);
// 国内全量数据
const cityTree = ref<AreaInfoBean[]>([]);

const addressService = new AddressService();

watch(() => isDropDown.value,
    (newVal: boolean) => {
        if (newVal) {
            selectVal.value = props.modelValue as any;
        }
    });

// 判断当前的值是否为空
const isEmpty = computed(() => {
    return props.modelValue.length === 0;
});

// 选择
const select = (val: AreaInfoBean) => {
    if (props.multiple) {
        const index: number = selectVal.value.findIndex(info => info.id === val.id);

        if (index > -1) {
            selectVal.value.splice(index, 1);
        } else {
            selectVal.value.push(val);
        }
        emits('update:modelValue', selectVal.value);
        emits('change', selectVal.value);
    } else {
        selectVal.value = [val];
        emits('update:modelValue', selectVal.value);
        emits('change', val);
        nextTick(() => {
            isDropDown.value = false;
        });
    }
};
// 清除选中
const clearSelect = (index: number) => {
    if (index > -1) {
        selectVal.value.splice(index, 1);
        emits('update:modelValue', selectVal.value);
        emits('change', selectVal.value);
    } else {
        selectVal.value = [];
        emits('update:modelValue', []);
        emits('change', []);
    }
};

//关闭
const handleClose = () => {
    isDropDown.value = false;
}

// 显示或隐藏下拉
const toggleDrop = () => {
    if (props.disabled) return;
    isDropDown.value = !isDropDown.value;
};


// 查询国内数据
const getArea = () => {
    const data: QueryAreaInDto = {
        rangeType: '1',
        maxLevel: props.maxLevel
    }

    addressService.queryArea(data).then(res => {
        if (res.code === 200) {
            if (props.isHotCity) {
                cityTree.value = [...res.data.areaList];
            } else {
                cityTree.value = res.data.areaList.filter((item: AreaInfoBean) => {
                    if (item.id === '110000' || item.id === '120000' || item.id === '310000' || item.id === '500000') {
                        item.children = item.children!.filter((child: AreaInfoBean) => child.name !== '全部');
                    }

                    return item.name !== '热门';
                });
            }
        }
    });
};

provide('emitUpdate', select);
provide('deleteItem', clearSelect);

onMounted(() => {
    getArea();
});

</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.search-filter .icon-close {
    width: 0 !important;;
    height: 0 !important;
}

.ivu-form-item-error {
    .custom-input {
        border-color: $remind-red !important;
    }
}

.address-custom_box {
    width: 100%;
    position: relative;

    :deep(.ivu-poptip-rel) {
        width: 100%;
    }

    :deep(.ivu-poptip-arrow) {
        display: none;
    }

    :deep(.ivu-poptip-popper) {
        width: vw(542);
        padding-top: vh(3);
        min-width: vw(300);
    }

    :deep(.ivu-poptip-body) {
        padding: 0;
    }

    .custom-input {
        width: 100%;
        border-radius: vw(2);
        background: $white;
        display: flex;
        align-items: center;
        min-height: vh(32);
        padding: 0 vw(20);
        background: $bg-gray;
        height: vh(40);

        &.custom-input_multiple {
            padding: vh(5) vw(20);
        }

        .icon-arrow {
            transition: all .2s linear;
            transform-origin: center;
        }

        &.custom-input-drop_down {
            border-color: $theme-color;

            .icon-arrow {
                margin-top: vh(-4);
                transform: rotate(180deg);
            }
        }

        .custom-content {
            width: 100%;
            line-height: 1;

            .custom-placeholder {
                color: $placeholder-color;
                font-size: vw(14);
                font-style: normal;
                font-weight: 400;
                line-height: vh(14);
            }

            .select-content {
                color: $font-dark;
                font-size: vw(14);
                font-style: normal;
                font-weight: 400;
                height: vh(40);
                line-height: vh(40);
            }

            .tag-box {
                display: flex;
                gap: vw(5);
                flex-wrap: wrap;

                .tag {
                    background: $tag-bg;
                    display: inline-block;
                    vertical-align: top;
                    max-width: vw(280);

                    .tag-text {
                        max-width: vw(255);
                        display: inline-block;
                        color: $font-dark;
                        font-size: vw(12);
                        font-style: normal;
                        font-weight: 400;
                        line-height: vh(12);
                        vertical-align: bottom;
                    }

                }
            }

        }

        .icon-svg {
            position: absolute;
            top: 50%;
            right: vw(10);
            transform: translateY(-50%);
            z-index: 10;
            display: block;
        }

        .icon-svg.icon-close {
            z-index: 20;
            display: none;
        }

        &.custom-input-hover:hover {
            .icon-svg {
                display: none;
            }

            .icon-svg.icon-close {
                display: block;
            }
        }

        &.custom-input_disabled {
            border: 1px solid $border-default;
            background: $form-bg-disabled;
        }
    }
}

</style>

