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
            <div class="drawer-header flex-column align-between">
                <span class="drawer-title">下载</span>
                <SvgIcon class="close-icon pointer" color="#9499A4" name="icon-cha" size="20" @click="handleClose"/>
            </div>

            <!-- 主体内容 -->
            <div class="drawer-body">
                <!-- 左侧缩略图区 -->
                <div class="resume-list">
                    <div class="resume-item pointer active">
                        <img src="@/assets/images/ai.png">
                        <div class="use-tag">使用中</div>
                    </div>
                    <p class="resume-name">模板名称</p>
                    <div class="resume-item">
                        <img src="@/assets/images/ai.png">
                    </div>
                    <p class="resume-name">模板名称</p>
                </div>

                <!-- 右侧 -->
                <div class="config-section">
                    <!-- 预览区 -->
                    <div class="preview-section">

                    </div>
                    <div class="config-content">
                        <!-- 水印内容 -->
                        <Input v-model="watermarkContent" class="watermark-input" placeholder="请输入水印内容"
                               @on-blur="handleWatermarkBlur"/>
                        <!-- 下载格式 -->
                        <RadioGroup v-model="selectedFormat" class="download-format">
                            <Radio label="pdf">PDF</Radio>
                            <Radio label="jpg">JPG</Radio>
                        </RadioGroup>
                        <!-- 下载按钮 -->
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
import {computed, ref, watch} from 'vue';
import {Button, Input, Modal} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import type {GetResumeDetailOutDto} from '@/api/resume/dto/GetResumeDetail';
import {download} from "@/utiles/download.ts";
import {downloadImage, downloadPdf} from "@/utiles/downloadFile.ts";

const props = defineProps<{
    modelValue: boolean;
    resumeData: GetResumeDetailOutDto;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
}>();

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const selectedStyle = ref<'simple' | 'business'>('simple');
const selectedFormat = ref<'pdf' | 'jpg'>('pdf');
const watermarkContent = ref('');
const showWatermark = ref(false);

const resetData = () => {
    selectedStyle.value = 'simple';
    selectedFormat.value = 'pdf';
    watermarkContent.value = '';
    showWatermark.value = false;
};

const handleClose = () => {
    visible.value = false;
};

watch(visible, (newVal) => {
    if (!newVal) {
        resetData();
    }
});

const handleWatermarkBlur = () => {
    showWatermark.value = !!watermarkContent.value.trim();
};

const handleDownload = () => {
    // downloadPdf('https://hr-ai.dev.lingxizhifu.cn/assets/kunlun/resume/templates/images/resume-template1_thumb.png')
    downloadImage('https://hr-ai.dev.lingxizhifu.cn//assets/kunlun/personal-image/c2d111d0-157e-46c8-a7a7-51b3ba2ab3a6.jpg')
    // download('.resume-list .content-wrapper', selectedFormat.value, props.resumeData.name || '未命名')
};
</script>

<style lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.download-modal {
    .ivu-modal {
        width: vw(1121) !important;
        height: vh(1000);

        .ivu-modal-content {
            height: 100%;
        }

        .ivu-modal-body {
            padding: 0;
            height: 100%;
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
    height: 100%;
    display: flex;
    flex-direction: column;
}

.drawer-header {
    padding: vh(20) vw(20);
    border-bottom: 1px solid $border-default;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.10);
}

.drawer-title {
    font-family: sans-serif;
    font-weight: 600;
    font-size: vw(24);
    line-height: vh(24);
    color: $font-dark;
}

.close-icon {
    width: vw(20) !important;
    height: vw(20) !important;
}

.drawer-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.resume-list {
    width: vw(441);
    height: 100%;
    padding: vw(40);
    border-right: 1px solid $border-default;
    box-shadow: 0 0 4.08px 0 rgba(0, 0, 0, 0.10);
    overflow: auto;

    &::-webkit-scrollbar {
        display: none;
    }

    .resume-item {
        position: relative;
        height: vh(509);
        border-radius: vw(6);
        border: 1px solid #E1E6EC;
        box-shadow: 0 0 vw(10) 0 rgba(0, 0, 0, 0.10);

        &.active {
            border-color: #FC8719;
            border-width: vw(3);
        }

        img {
            width: 100%;
            height: 100%;
        }

        .use-tag {
            position: absolute;
            right: vw(-3);
            bottom: vh(-3);
            z-index: 1;
            width: vw(64);
            height: vh(24);
            border-radius: vw(4) 0;
            background: #FC8719;
            color: #FFF;
            text-align: center;
            font-size: vw(14);
            line-height: vh(24);
            font-weight: 600;
        }
    }

    .resume-name {
        margin-top: vh(20);
        margin-bottom: vh(24);
        color: #000;
        text-align: center;
        font-size: vw(16);
        font-weight: 600;
    }
}

.config-section {
    flex: 1;
    display: flex;
    flex-direction: column;

    .preview-section {
        flex: 1;
    }

    .config-content {
        height: vh(100);
        padding: vh(30) vw(20);
        border-top: 1px solid $border-default;
        display: flex;

        .download-format {
            margin-left: vw(59);
            margin-right: vw(26);
            line-height: vh(40);

            label:last-child {
                margin-right: 0;
            }
        }
    }
}

.watermark-input {
    width: vw(300);
    height: vh(40);

    :deep(.ivu-input) {
        height: 100%;
        font-family: sans-serif;
        font-size: vw(16);
        color: $font-dark;
        border-radius: vw(2);
    }
}

.download-btn {
    width: vw(118);
    height: vh(40);
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
            font-family: sans-serif;
            font-weight: 600;
            font-size: vw(12);
            line-height: vh(12);
            color: $white;
        }
    }
}
</style>
