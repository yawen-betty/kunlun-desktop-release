<script setup lang="ts">
import {ref, getCurrentInstance, watch, nextTick, onMounted, useSlots} from 'vue';

const { proxy } = getCurrentInstance() as any;
const props = defineProps({
    content: { // 文本内容
        type: String,
        default: ''
    },
    placement: { // 气泡展示位置
        type: String,
        default: 'bottom-start'
    }
});
const box = ref();
const isTextOverflow = ref('ellipsis'); // 是否超出了展示的宽度 unShow初始这状态  ellipsis:超出状态  没有超出:normal
const checkTextOverflow = () => {
    const textElement = proxy.$refs.box;
    const realWith = proxy.$refs.realWidth;

    if ((textElement && realWith) && (realWith.clientWidth > textElement.clientWidth)) {
        isTextOverflow.value = 'ellipsis';
    }else {
        isTextOverflow.value = 'normal';
    }
};

watch(() => props.content, () => {
    nextTick(() => {
        checkTextOverflow();
    });
}, { immediate: true });

watch(() => box.value, dom => {
    if (dom) {
        nextTick(checkTextOverflow);
    }
}, {
    immediate: true,
    deep: true
});

const hasContent = ref(true);

onMounted(() => {
    hasContent.value = !!useSlots().content;
});
</script>

<template>
    <div class="ellipsis" ref="box">
        <template v-if="isTextOverflow === 'ellipsis'">
            <Tooltip ref="tooltipRef" :content="content" :placement="placement" transfer max-width="600"
                     popper-class="ellipsis-tooltip" trigger="hover">
                <div class="overflow-ellipsis">
                    <span v-if="hasContent"><slot name="content"/></span>
                    <span v-else>{{ content }}</span>
                </div>
            </Tooltip>
        </template>

        <template v-if="isTextOverflow === 'normal'">
            <span v-if="hasContent"><slot name="content"/></span>
            <span v-else>{{ content }}</span>
        </template>

        <div class="real-width" ref="realWidth">
            <div>{{ content }}</div>
        </div>
    </div>

</template>
<style scoped lang="scss">

.ellipsis {
    position: relative;
    overflow: hidden;

    .real-width {
        position: absolute;
        left: 0;
        top: 0;
        z-index: -1;
        white-space: nowrap;
        opacity: 0;
    }

    :deep(.ivu-tooltip) {
        display: block;
        width: 100%;
        height: 100%;

        .ivu-tooltip-rel {
            height: 100%;
            display: block;
        }
    }

    .overflow-ellipsis {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
<style lang="scss">
.ivu-tooltip-inner:has(.custom-tool-tip-content) {
    white-space: unset;
    word-wrap: break-word;
}
</style>
