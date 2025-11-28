<script lang="ts" setup>
import {Modal} from "view-ui-plus";
import {ref} from "vue";

type TProps = {
    // 需要删除的id
    id?: string;
    // 内容
    content: string;
    // 确定函数
    confirm: (id?: string) => void;
}

const props = defineProps<TProps>()
const showModeConfirmModal = ref(false)

const confirmModeSwitch = () => {
    props.confirm(props.id);
    showModeConfirmModal.value = false;
}

const open = () => {
    showModeConfirmModal.value = true;
}

defineExpose({
    open
})
</script>

<template>
    <Modal
        v-model="showModeConfirmModal"
        :closable="true"
        :footer-hide="true"
        :mask-closable="false"
        class-name="delete-confirm-modal"
    >
        <div class="delete-modal-content">
            <div class="modal-header">
                <span class="modal-title">提示</span>
            </div>
            <div class="modal-body">
                <p>{{ content }}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" @click="showModeConfirmModal = false">取消</button>
                <button class="btn-confirm" @click="confirmModeSwitch">确定</button>
            </div>
        </div>
    </Modal>
</template>

<style lang="scss" scoped>
</style>
