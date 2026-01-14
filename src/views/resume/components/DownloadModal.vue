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
                    <template v-for="key in Object.keys(templateMap)">
                        <div :class="[currentTmp?.id === templateMap[key].id && 'active']" class="resume-item pointer"
                             @click="changeTmp(templateMap[key])">
                            <img :src="Config.baseUrl + templateMap[key].thumbnail_url">
                            <div v-if="currentTmp?.id === templateMap[key].id" class="use-tag">使用中</div>
                        </div>
                        <p class="resume-name">{{ templateMap[key].name }}</p>
                    </template>
                </div>

                <!-- 右侧 -->
                <div class="config-section">
                    <!-- 预览区 -->
                    <div class="preview-section">
                        <!-- 渲染PDF的每一页 -->
                        <VuePdf
                            v-for="pageNum in numOfPages"
                            :key="`${pdfUrl}-${pageNum}`"
                            :page="pageNum"
                            :src="pdfUrl"
                            class="agreement-iframe"
                        />
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
import {downloadImage, downloadPdf} from "@/utiles/downloadFile.ts";
import {createLoadingTask, VuePdf} from "vue3-pdfjs";
import {ResumeService} from "@/service/ResumeService.ts";
import {ResumeTemplateBean} from "@/api/resume/dto/bean/ResumeTemplateBean.ts";
import {Config} from "@/Config.ts";
import {PreviewResumeInDto} from "@/api/resume/dto/PreviewResume.ts";
import {PDFDocumentProxy} from "pdfjs-dist/types/src/display/api";

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

const resumeService = new ResumeService()
// 响应式数据
const numOfPages = ref<number>(0); // PDF总页数
// 模板列表
const templateMap = ref<Record<string, ResumeTemplateBean>>({})
const currentTmp = ref<ResumeTemplateBean>();
const pdfUrl = ref<string>('')
const imgUrl = ref<string>('')
const selectedFormat = ref<'pdf' | 'jpg'>('pdf');
const watermarkContent = ref('');
const showWatermark = ref(false);

const resetData = () => {
    numOfPages.value = 0;
    templateMap.value = {};
    pdfUrl.value = '';
    imgUrl.value = '';
    currentTmp.value = undefined;
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
    } else {
        getTemplateList()
    }
});

watch(
    () => currentTmp.value,
    async (newVal) => {
        if (newVal) {
            await getResumePreview()
        }
    }
)

const getTemplateList = () => {
    resumeService.getResumeTmp()
        .then(res => {
            templateMap.value = res
            currentTmp.value = templateMap.value[Object.keys(templateMap.value)[0]]
        })
        .catch(err => {

        })
}

/**
 * 将相对URL转换为完整的代理URL
 * @param url 原始URL
 * @returns 完整的URL
 */
const toProxyUrl = (url: string): string => {
    if (!url) return '';
    return Config.baseUrl + url;
};

const getResumePreview = async () => {
    const inDto: PreviewResumeInDto = {
        resumeId: props.resumeData.uuid!,
        templateId: currentTmp.value?.id!
    }

    const res = await resumeService.previewResume(inDto)

    if (res.code === 200) {
        pdfUrl.value = toProxyUrl(res.data.pdfUrl!)
        imgUrl.value = toProxyUrl(res.data.imageUrl!)
        // 加载PDF并获取页数
        const loadingTask = createLoadingTask(pdfUrl.value);
        loadingTask.promise.then((pdf: PDFDocumentProxy) => {
            numOfPages.value = pdf.numPages;
        });
    }
}

const changeTmp = (data: ResumeTemplateBean) => {
    currentTmp.value = data;
}

const handleWatermarkBlur = () => {
    showWatermark.value = !!watermarkContent.value.trim();
};

const handleDownload = () => {
    if (selectedFormat.value === 'pdf') {
        downloadPdf(pdfUrl.value, props.resumeData.name)
    } else {
        downloadImage(imgUrl.value, props.resumeData.name)
    }
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
    visibility: hidden;

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
