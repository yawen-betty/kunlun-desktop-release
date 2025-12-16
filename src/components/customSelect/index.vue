<script lang="ts" setup>
import {Option, Select} from "view-ui-plus";
import Ellipsis from '@/components/ellipsis/index.vue'

interface OptionItem {
    label: string
    value: any

    [key: string]: any
}

interface Props {
    modelValue?: any
    optionList: OptionItem[]
    placeholder?: string
    clearable?: boolean
    disabled?: boolean
    size?: 'large' | 'small' | 'default'
    multiple?: boolean
    filterable?: boolean

    [key: string]: any
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '请选择',
    clearable: true
})

const emit = defineEmits<{
    'update:modelValue': [value: any]
    'on-change': [value: any]
}>()

const handleChange = (value: any) => {
    emit('update:modelValue', value)
    emit('on-change', value)
}
</script>

<template>
    <Select
        :clearable="props.clearable"
        :disabled="props.disabled"
        :filterable="props.filterable"
        :model-value="props.modelValue"
        :multiple="props.multiple"
        :placeholder="props.placeholder"
        :size="props.size"
        class="custom-select"
        v-bind="$attrs"
        @on-change="handleChange"
    >
        <Option
            v-for="item in props.optionList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        >
            <Ellipsis :content="item.label"/>
        </Option>
    </Select>
</template>

<style lang="scss" scoped>

</style>
