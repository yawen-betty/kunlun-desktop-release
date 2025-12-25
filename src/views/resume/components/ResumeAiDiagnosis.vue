<template>
    <Modal
        v-model="visible"
        :closable="false"
        :mask-closable="false"
        class="resume-ai-optimize"
        footer-hide
    >
        <div class="optimize-body">
            <div class="optimize-header">
                <div class="optimize-title">
                    <SvgIcon class="icon-ai mr-5" color="515A6D" name="icon-ai-xing" size="16"></SvgIcon>
                    简历诊断
                </div>
                <SvgIcon v-if="!isRequesting" class="cha pointer" color="#9499A4" name="icon-cha" size="20"
                         @click="handleCancel"></SvgIcon>
            </div>
            <div class="optimize-content">
                <div class="ai-content">
                    <div v-if="!isFailed" class="ai-content-think mt-20">
                        <div v-if="['2','3'].includes(state)" class="think-title">
                            <img class="think-title-icon" src="@/assets/images/deep-logo.gif"/>
                            <div class="think-text">{{ state === '2' ? '深度思考中...' : '生成中...' }}</div>
                        </div>
                        <div v-else-if="state === '4'" class="hint">内容由AI生成，仅供参考</div>

                        <div v-if="state === '2'" class="think-content">{{ thinkContent }}</div>
                        <div v-if="['3','4'].includes(state)" class="content">{{ content }}</div>
                    </div>
                    <div v-else class="error-con flex-center">诊断失败，请稍后重试</div>
                </div>
            </div>
        </div>
    </Modal>

</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {Modal} from "view-ui-plus";
import SvgIcon from "@/components/svgIcon/index.vue";
import {extractDataContent} from "@/utiles/processing.ts";
import {AiService} from "@/service/AiService.ts";
import {scrollToBottom} from "@/utiles/domUtils.ts";
import {AiErrorHandler} from "@/utiles/aiErrorHandler.ts";
import {AiMessageBean} from "@/api/ai/dto/bean/AiMessageBean.ts";
import {DiagnoseInDto} from "@/api/ai/dto/Diagnose.ts";
import {hideLoading, showLoading} from "@/utiles/loading.ts";

interface Emits {
    (e: 'submit', value: string): void
}

const aiService = new AiService();

const emit = defineEmits<Emits>()

const visible = ref<boolean>(false);
// 额外要求
const requirement = ref<string>('');
// 当前流程状态 1-生成之前 2-深度思考 3-生成中 4-生成结束
const state = ref<string>('1');
// 深度思考内容
const thinkContent = ref<string>('');
// 生成内容
const content = ref<string>('');
// 是否正在请求中
const isRequesting = ref<boolean>(false);
// 是否诊断失败
const isFailed = ref(false)

const handleCancel = () => {
    visible.value = false
    thinkContent.value = '';
    content.value = '';
    requirement.value = '';
    state.value = '1'
    isRequesting.value = false
    isFailed.value = false
}

// 根据错误码显示提示信息
const showErrorMessage = (code: number) => {
    hideLoading();
    AiErrorHandler.handleError(code);
};

const open = (resumeId: string) => {
    visible.value = true;
    // 解析模板
    const msg: string = '接下来我会对简历进行诊断并询问一些问题。'

    const messages: AiMessageBean[] = [
        {
            role: 'assistant',
            content: msg
        }
    ]

    const params: DiagnoseInDto = {
        resumeId,
        messages
    }
    isRequesting.value = true
    showLoading()
    aiService.diagnoseStream(
        params,
        (data) => {
            hideLoading()
            console.log(data, 'data')
            if (data.includes('event:thinking')) {
                state.value = '2'
                const str: string = extractDataContent(data, 'event:thinking')
                if (str) {
                    thinkContent.value += str;
                    scrollToBottom('think-content');
                }
            } else if (data.includes('event:error')) {
                const str: string = extractDataContent(data, 'event:error');
                showErrorMessage(JSON.parse(str).status);
                isFailed.value = true
            } else {
                state.value = '3'
                const str: string = extractDataContent(data, 'event:content')

                if (str) {
                    content.value = JSON.parse(str).diagnosisResultMessage
                    emit('submit', str)
                }
            }
        },
        (error: any) => {
            AiErrorHandler.handleError(error.status);
            visible.value = false
            hideLoading();
            isFailed.value = true
        },
        () => {
            state.value = '4'
            isRequesting.value = false
        }
    );
}

defineExpose({open})

</script>

<style lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-ai-optimize {
    width: vw(900) !important;

    .ivu-modal-body {
        padding: vw(20) !important;
        border-radius: vw(2);
        height: vh(600);
    }

    .optimize-body {
        display: flex;
        flex-direction: column;
        height: 100%;

        .optimize-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .optimize-title {
                display: flex;
                justify-content: center;
                align-items: center;
                color: $font-dark;
                font-size: vw(14);
                font-style: normal;
                font-weight: 600;
                line-height: vw(22);
            }
        }

        .optimize-content {
            flex: 1;
            margin-top: vw(17);
            display: flex;
            flex-direction: column;

            .ai-content {
                flex: 1;

                .ai-content-think {
                    .think-title {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        gap: vw(5);

                        .think-title-icon {
                            width: vw(28);
                            height: vw(28);
                        }

                        .think-text {
                            font-size: vw(16);
                            font-style: normal;
                            font-weight: 600;
                            line-height: vw(20);
                            background: linear-gradient(92deg, #C4A2FC 28.4%, #88E9FF 95.27%);
                            background-clip: text;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                    }

                    .hint {
                        color: $font-light;
                        font-size: vw(14);
                        font-style: normal;
                        font-weight: 400;
                        line-height: vw(22);
                    }

                    .think-content {
                        overflow-y: auto;
                        margin-top: vh(13);
                        padding: vh(10) vw(15);
                        border-radius: vw(2);
                        border: 1px solid #C4A2FC;
                        background: linear-gradient(92deg, rgba(196, 162, 252, 0.10) 3.76%, rgba(136, 233, 255, 0.10) 95.27%);
                        max-height: vh(360);
                        word-break: break-all;
                        white-space: pre-wrap;

                        &::-webkit-scrollbar {
                            display: none;
                        }
                    }

                    .content {
                        height: vh(330);
                        word-break: break-all;
                        white-space: pre-wrap;
                        overflow-y: auto;
                        margin-top: vh(13);

                        &::-webkit-scrollbar {
                            display: none;
                        }
                    }
                }

                .error-con {
                    height: 100%;
                }
            }
        }
    }
}
</style>
