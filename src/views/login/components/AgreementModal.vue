<template>
    <!-- 协议弹窗遮罩层 -->
    <div v-if="visible" class="modal-overlay">
        <!-- 弹窗主容器 -->
        <div class="modal-container" @click.stop>
            <!-- 标题栏 -->
            <div class="modal-header">
                <h3 class="modal-title">{{ title }}</h3>
            </div>

            <!-- 关闭按钮 -->
            <svg-icon class="cha pointer" color="#9499A4" name="icon-cha" size="20" @click="handleClose"/>

            <!-- PDF内容区域 -->
            <div class="modal-content mt-40">
                <!-- 渲染PDF的每一页 -->
                <VuePdf
                    v-for="pageNum in numOfPages"
                    :key="`${agreementFileUrl}-${pageNum}`"
                    :page="pageNum"
                    :src="agreementFileUrl"
                    class="agreement-iframe"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue';
import SvgIcon from '@/components/svgIcon/index.vue';
import {AdminService} from '@/service/AdminService.ts';
import {GetAgreementInDto} from '@/api/admin/dto/GetAgreement.ts';
import {Config} from '@/Config.ts';
import {createLoadingTask, VuePdf} from 'vue3-pdfjs';
import {PDFDocumentProxy} from 'pdfjs-dist/types/src/display/api';

// 组件属性定义
const props = defineProps<{
    visible: boolean; // 弹窗显示状态
    title: string; // 弹窗标题
    agreementType: number; // 协议类型（1:服务协议 2:隐私协议）
}>();

// 事件定义
const emit = defineEmits(['update:visible']);

// 服务实例
const adminService = new AdminService();

// 响应式数据
const numOfPages = ref<number>(0); // PDF总页数
const agreementFileUrl = ref<string>(''); // 协议文件URL

/**
 * 监听弹窗显示状态，当弹窗显示时加载协议内容
 */
watch(
    () => props.visible,
    async (isVisible: boolean) => {
        if (isVisible) {
            await getAgreement();
            // 加载PDF并获取页数
            const loadingTask = createLoadingTask(agreementFileUrl.value);
            loadingTask.promise.then((pdf: PDFDocumentProxy) => {
                numOfPages.value = pdf.numPages;
            });
        } else {
            agreementFileUrl.value = '';
            numOfPages.value = 0;
        }
    }
);

/**
 * 将相对URL转换为完整的代理URL
 * @param url 原始URL
 * @returns 完整的URL
 */
const toProxyUrl = (url: string): string => {
    if (!url) return '';
    return Config.baseUrl + url;
};

/**
 * 获取协议文件信息
 */
const getAgreement = async (): Promise<void> => {
    const params: GetAgreementInDto = {
        type: props.agreementType
    };

    try {
        const res = await adminService.getAgreements(params);
        if (res.code === 200) {
            agreementFileUrl.value = toProxyUrl(res.data.agreementFileUrl);
            console.log(
                '%c ⤴️: getAgreement -> agreementFileUrl.value ',
                'font-size:16px;background-color:#4c02da;color:white;',
                agreementFileUrl.value
            );
        }
    } catch (error) {
        console.error('获取协议失败:', error);
    }
};

/**
 * 关闭弹窗
 */
const handleClose = (): void => {
    emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

/* 弹窗遮罩层 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

/* 弹窗主容器 */
.modal-container {
    width: vw(1200);
    height: vh(800);
    border-radius: vw(2);
    background: $white;
    padding: vw(40) vw(40) vh(76);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;

    /* 关闭按钮定位 */
    .cha {
        position: absolute;
        right: vw(20);
        top: vh(20);
    }
}

/* 标题栏布局 */
.modal-header {
    display: flex;
    justify-content: space-between;
}

/* 弹窗标题样式 */
.modal-title {
    color: $font-dark;
    font-size: vw(28);
    font-style: normal;
    font-weight: 400;
    line-height: vw(28);
    font-family: 'YouSheBiaoTiHei', serif;
}

/* PDF内容区域 */
.modal-content {
    flex: 1;
    color: $font-dark;
    font-size: vw(16);
    font-style: normal;
    font-weight: 500;
    line-height: vw(22);
    word-break: break-all;
    position: relative;
    overflow-y: auto; /* 允许垂直滚动 */
    overflow-x: hidden;
    border-radius: vw(2);

    /* PDF页面样式 */
    .agreement-iframe {
        width: 100%;
        border: none;
        outline: none;
        border-radius: vw(2);
        display: block;
        margin-bottom: vw(10); /* 页面间距 */
    }
}
</style>
