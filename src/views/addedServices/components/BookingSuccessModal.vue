<template>
    <Modal v-model="modalVisible" :closable="false" :mask-closable="false" :width="460" footer-hide class-name="booking-success-modal">
        <div class="modal-content">
            <p class="modal-title">提示</p>
            <p class="modal-message">预约成功！请耐心等待工作人员进行联系。</p>
            <SvgIcon name="icon-cha" size="16" class="close-icon" color="#9499A4" @click="handleClose"></SvgIcon>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {Modal} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';

interface Props {
    visible: boolean;
}

interface Emits {
    (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const modalVisible = ref(props.visible);

watch(
    () => props.visible,
    (newVal) => {
        modalVisible.value = newVal;
    }
);

watch(modalVisible, (newVal) => {
    if (!newVal) {
        emit('close');
    }
});

const handleClose = () => {
    modalVisible.value = false;
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

:deep(.booking-success-modal) {
    .ivu-modal {
        width: vw(460) !important;
    }

    .ivu-modal-content {
        border-radius: vw(2);
        box-shadow: 0px 0px vw(6) 0px rgba(0, 0, 0, 0.1);
    }

    .ivu-modal-body {
        padding: vh(18) vw(20);
        height: vh(220);
    }

    .ivu-modal-header {
        display: none;
    }
}

.modal-content {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: $white;
}

.modal-title {
    font-family: 'PingFang SC', sans-serif;
    font-weight: 600;
    font-size: vw(14);
    line-height: vh(22);
    color: $font-dark;
    margin: 0 0 vh(48) 0;
}

.modal-message {
    font-family: 'PingFang SC', sans-serif;
    font-weight: 400;
    font-size: vw(14);
    line-height: vh(20);
    color: $font-dark;
    margin-bottom: vh(53);
    text-align: justify;
}

.close-icon {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
}
</style>
