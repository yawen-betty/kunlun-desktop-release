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
                <SvgIcon class="cha pointer" color="#9499A4" name="icon-cha" size="20" @click="handleCancel"></SvgIcon>
            </div>
            <div class="optimize-content">
                <div class="ai-content">
                    <div class="ai-content-think mt-20">
                        <div v-if="['2','3'].includes(state)" class="think-title">
                            <img class="think-title-icon" src="@/assets/images/deep-logo.gif"/>
                            <div class="think-text">{{ state === '2' ? '深度思考中...' : '生成中...' }}</div>
                        </div>

                        <div v-else-if="state === '4'" class="hint">内容由AI生成，仅供参考</div>

                        <div v-if="state === '2'" class="think-content">{{ thinkContent }}</div>
                        <div v-if="['3','4'].includes(state)" class="content">{{ content }}</div>
                    </div>
                </div>
            </div>
        </div>
    </Modal>

</template>

<script lang="ts" setup>
import {nextTick, ref} from 'vue'
import {Button, Input, Message, Modal} from "view-ui-plus";
import SvgIcon from "@/components/svgIcon/index.vue";
import {aiOptimize, enumEcho} from "@/enums/enumDict.ts";
import {message} from "@/utiles/Message.ts";
import {PolishInDto} from "@/api/ai/dto/Polish.ts";
import {extractDataContent} from "@/utiles/processing.ts";
import {AiService} from "@/service/AiService.ts";
import {scrollToBottom} from "@/utiles/domUtils.ts";
import {AiErrorHandler} from "@/utiles/aiErrorHandler.ts";
import {AiMessageBean} from "@/api/ai/dto/bean/AiMessageBean.ts";
import {DiagnoseInDto} from "@/api/ai/dto/Diagnose.ts";

interface Props {
    visible: boolean; //弹窗状态
    resumeId: string; // 简历id
    text: string; //需要优化的原文
    fieldName: string, // 需要优化的字段名'']
    maxLength: number, // 最大优化长度'']
    mode: string, //  优化模式（1-润色 2-扩展 3-简化 4-总结）'']
}

interface Emits {
    (e: 'submit', value: string): void
}

const aiService = new AiService();

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref<boolean>(true);
// 额外要求
const requirement = ref<string>('');
// 当前流程状态 1-生成之前 2-深度思考 3-生成中 4-生成结束
const state = ref<string>('1');
// 深度思考内容
const thinkContent = ref<string>('');
// 生成内容
const content = ref<string>('');


const handleCancel = () => {
    visible.value = false
    thinkContent.value = '';
    content.value = '';
    requirement.value = '';
    state.value = '1'
}

// 开始ai 生成
const handleSubmit = () => {
    if (requirement.value.length > 0 && requirement.value.length < 20) return message.warning(Message, '请至少填写20个字！');

    thinkContent.value = '';
    content.value = '';
    state.value = '1'

    const params: PolishInDto = {
        resumeId: props.resumeId,
        fieldName: props.fieldName,
        maxLength: props.maxLength,
        mode: props.mode,
        text: props.text,
        requirement: requirement.value
    }

    aiService.polishStream(
        params,
        (data: string) => {
            if (data.includes('event:thinking')) {
                state.value = '2'
                const str: string = extractDataContent(data, 'event:thinking')
                if (str) {
                    thinkContent.value += str;
                    scrollToBottom('think-content');
                }
            } else {
                state.value = '3'
                const str: string = extractDataContent(data, 'event:content')

                if (str) {
                    content.value += str;
                }
            }
        },
        (error: any) => {
            AiErrorHandler.handleError(error.status);
        },
        () => {
            state.value = '4'
        }
    )
}

// 抛出数据
const handleEmitData = () => {
    emit('submit', content.value);
    handleCancel();
}

const open = (resumeId: string) => {
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

    aiService.diagnoseStream(
        params,
        (data) => {
            const lastData = chatList.value[chatList.value.length - 1]

            if (data.includes('event:thinking')) {
                const str: string = extractDataContent(data, 'event:thinking')
                lastData.thinking += str
                scrollToBottom('deep-thinking-content');
            } else if (data.includes('event:loadingContentStart')) {
                lastData.thinkingStatus = '1';
                lastData.loadingContentStart = true;
            } else if (data.includes('event:loadingContentEnd')) {
                lastData.loadingContentStart = false;
            } else {
                setThinkState();
                const str: string = extractDataContent(data, 'event:content')

                diagnoseList.value = JSON.parse(str).issues;

                if (reply) {
                    diagnoseContent.value = JSON.parse(str).diagnosisResultMessage;
                    diagnoseModal.value = true;
                } else {
                    askQuestion();
                }
            }
            smartScrollToBottom();
        },
        (error) => {
            showErrorMessage(error.status)
        },
        () => {
            console.log('我真的诊断完了吗')
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
            }
        }
    }
}
</style>
