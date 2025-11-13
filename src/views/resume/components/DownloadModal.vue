<template>
    <Modal
        v-model="visible"
        :closable="false"
        :footer-hide="true"
        :mask-closable="false"
        :width="1200"
        class-name="download-modal"
    >
        <div class="download-modal-content">
            <!-- 标题栏 -->
            <div class="modal-header flex-column align-between">
                <span class="modal-title">下载</span>
                <SvgIcon class="close-icon pointer" color="#9499A4" name="icon-cha" size="20" @click="handleClose"/>
            </div>

            <!-- 主体内容 -->
            <div class="modal-body">
                <!-- 左侧预览区 -->
                <div class="preview-section">
                    <SimpleResumePreview v-if="selectedStyle === 'simple'" :resume-data="resumeData"
                                         :watermark="showWatermark ? watermarkContent : ''"/>
                    <BusinessResumePreview v-else :resume-data="resumeData"
                                           :watermark="showWatermark ? watermarkContent : ''"/>
                </div>

                <!-- 右侧配置区 -->
                <div class="config-section">
                    <!-- 简历风格 -->
                    <div class="config-group mb-40">
                        <div class="group-label">简历风格</div>
                        <div class="option-buttons">
                            <div
                                :class="['option-btn', { active: selectedStyle === 'simple' }]"
                                @click="selectedStyle = 'simple'"
                            >
                                简约风
                            </div>
                            <div
                                :class="['option-btn', { active: selectedStyle === 'business' }]"
                                @click="selectedStyle = 'business'"
                            >
                                商务风
                            </div>
                        </div>
                    </div>

                    <!-- 下载格式 -->
                    <div class="config-group mb-40">
                        <div class="group-label">下载格式</div>
                        <div class="option-buttons">
                            <div
                                :class="['option-btn', { active: selectedFormat === 'pdf' }]"
                                @click="selectedFormat = 'pdf'"
                            >
                                PDF
                            </div>
                            <div
                                :class="['option-btn', { active: selectedFormat === 'jpg' }]"
                                @click="selectedFormat = 'jpg'"
                            >
                                JPG
                            </div>
                        </div>
                    </div>

                    <!-- 水印内容 -->
                    <div class="config-group">
                        <div class="group-label">水印内容</div>
                        <Input v-model="watermarkContent" class="watermark-input" placeholder="请输入水印内容"
                               @on-blur="handleWatermarkBlur"/>
                    </div>

                    <!-- 下载按钮 -->
                    <div class="download-btn-wrapper">
                        <Button class="download-btn" type="primary" @click="handleDownload">
                            <SvgIcon class="mr-5" color="#FFFFFF" name="icon-xiazai" size="12"/>
                            <span>下载至本地</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {Button, Input, Modal} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import SimpleResumePreview from './SimpleResumePreview.vue';
import BusinessResumePreview from './BusinessResumePreview.vue';
import type {GetResumeDetailOutDto} from '@/api/resume/dto/GetResumeDetail';
import {download} from "@/utiles/download.ts";

const props = defineProps<{
    modelValue: boolean;
    resumeData: GetResumeDetailOutDto;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'download': [config: { style: string; format: string; watermark: string }];
}>();

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const selectedStyle = ref<'simple' | 'business'>('simple');
const selectedFormat = ref<'pdf' | 'jpg'>('pdf');
const watermarkContent = ref('');
const showWatermark = ref(false);

const handleClose = () => {
    visible.value = false;
    watermarkContent.value = '';
    showWatermark.value = false;
};

const handleWatermarkBlur = () => {
    showWatermark.value = !!watermarkContent.value.trim();
};

const handleDownload = () => {
    download('.preview-section .content-wrapper', selectedFormat.value, props.resumeData.name || '未命名')
};
</script>

<style lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.download-modal {
    .ivu-modal {
        width: vw(1200) !important;
        height: vh(1000);

        .ivu-modal-body {
            padding: 0;
        }
    }
}
</style>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

:deep(.ivu-modal-content) {
    border-radius: vw(4);
}

.download-modal-content {
    width: 100%;
    height: vh(1000);
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: vh(20) vw(20);
    border-bottom: 1px solid $border-default;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.10);
}

.modal-title {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(24);
    line-height: vh(24);
    color: $font-dark;
}

.close-icon {
    width: vw(20) !important;
    height: vw(20) !important;
}

.modal-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.preview-section {
    width: vw(680);
    height: 100%;
    border-right: 1px solid $border-default;
    box-shadow: 0 0 4.08px 0 rgba(0, 0, 0, 0.10);
    overflow: auto;

    &::-webkit-scrollbar {
        display: none;
    }
}

.config-section {
    flex: 1;
    padding: vh(40) vw(40) vh(20) vw(40);
    display: flex;
    flex-direction: column;
}

.group-label {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    line-height: vh(16);
    color: #9499A4;
    margin-bottom: vh(12);
}

.option-buttons {
    display: flex;
    gap: vw(20);
}

.option-btn {
    width: vw(190);
    height: vh(40);
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-gray;
    border-radius: vw(2);
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    color: $font-dark;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        border-color: $theme-color;
    }

    &.active {
        background: $theme-color;
        color: $white;
    }
}

.watermark-input {
    width: vw(400);
    height: vh(40);

    :deep(.ivu-input) {
        height: 100%;
        font-family: 'PingFangSCBold', sans-serif;
        font-size: vw(16);
        color: $font-dark;
        border-radius: vw(2);
    }
}

.download-btn-wrapper {
    margin-top: auto;
    display: flex;
    justify-content: center;
}

.download-btn {
    width: vw(118);
    height: vh(32);
    background: $theme-color;
    border: none;
    border-radius: vw(2);
    box-shadow: none;

    :deep(> span) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: vw(6);

        span {
            font-family: 'PingFangSCBold', sans-serif;
            font-weight: 600;
            font-size: vw(12);
            line-height: vh(12);
            color: $white;
        }
    }
}
</style>
