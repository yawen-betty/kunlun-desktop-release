<template>
    <div class="resume-chat-wrapper">
        <div class="resume-chat p20">
            <!-- 聊天内容待实现 -->
            <div ref="chattingRecordsRef" class="chatting-records" @scroll="handleScroll">
                <div v-if="loading && pageNum > 1" class="loading-more">
                    <span>加载中...</span>
                </div>

                <template v-for="(info, index) in chatList" :key="index">
                    <div v-if="info.role === 'user'" class="my-chat_box mb-20">
                        <div class="my-chat">{{ info.content }}</div>
                    </div>

                    <div v-else>
                        <div class="ai-chat-box mb-20">
                            <div class="ai-chat">
                                <div class="ai-chat-text" v-if="!info.content?.includes('当前简历评分')">{{ info.content }}</div>
                                <div :class="['ai-chat-score', info.isExpandChat && 'ai-chat-score-expand']" v-else>
                                    <div class="ai-chat-score_content">{{ info.content }}</div>
                                    <div class="ai-chat-score-open pointer" v-if="!info.isExpandChat" @click="info.isExpandChat = !info.isExpandChat">
                                        查看当前问题
                                    </div>
                                    <div class="ai-chat-score-close pointer" v-else @click="info.isExpandChat = !info.isExpandChat">收起</div>
                                </div>

                                <div v-if="['1', '2', '3'].includes(info.thinkingStatus || '0') && !info.isExpand" class="is-think mt-10">
                                    <div :class="['think-text', 'mr-5', info.thinkingStatus === '3' && 'think-reload']">
                                        {{ thinkingText[info.thinkingStatus!] }}

                                        <div class="reload ml-10 pointer" @click="handleReload">
                                            <SvgIcon color="#EC6B62" name="icon-shuaxin" size="12"></SvgIcon>
                                            <div class="reload-text">重试</div>
                                        </div>
                                    </div>
                                    <!-- <SvgIcon class="pointer" color="#9499A4" name="icon-zhankai" size="12" @click="info.isExpand = true"></SvgIcon>-->
                                </div>
                            </div>
                        </div>

                        <div v-if="info.isExpand" class="deep-thinking mt-10 mb-20">
                            <!-- <SvgIcon class="pointer icon" color="#9499A4" name="icon-shouqi" size="12" @click="info.isExpand = false"></SvgIcon>-->

                            <div v-if="info.thinkingStatus === '2'" class="deep-thinking-title">
                                <img class="deep-log" src="@/assets/images/deep-logo.gif" />
                                <div class="deep-thinking-title-text">深度思考中</div>
                            </div>

                            <div v-else-if="info.thinkingStatus === '1'" class="deep-thinking-finish">
                                <div class="deep-thinking-finish-text">已完成思考</div>
                                <div v-if="info.loadingContentStart" class="deep-thinking-finish-loading">
                                    请稍后，内容正在收集中
                                    <span class="loading-dots">
                                        <span>.</span>
                                        <span>.</span>
                                        <span>.</span>
                                    </span>
                                </div>
                            </div>
                            <div v-if="info.thinking" class="deep-thinking-content">
                                {{ info.thinking }}
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <div :class="['send-message', disabled && 'send-message_disabled']">
                <Input
                    v-model="sendContent"
                    :autosize="{minRows: 2, maxRows: 5}"
                    :disabled="disabled"
                    :maxlength="2000"
                    :rows="2"
                    placeholder="请输入"
                    type="textarea"
                    @keydown="handleKeyDown"
                ></Input>
                <button :disabled="disabled || !sendContent" class="save-btn" @click="handleSendMessage">
                    <SvgIcon :color="disabled || !sendContent ? '#C5C8CE' : '#fff'" name="icon-fasong" size="10" />
                    发送
                </button>
            </div>
        </div>

        <Modal v-model="diagnoseModal" :closable="false" :footer-hide="true" :mask-closable="false" class-name="delete-confirm-modal question-modal">
            <div class="delete-modal-content">
                <div class="modal-header">
                    <span class="modal-title">提示</span>
                </div>
                <div class="modal-body">
                    <p>{{ diagnoseContent }}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" @click="handleOver">结束AI撰写</button>
                    <button class="btn-confirm" @click="continueOptimize">继续优化</button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script lang="ts" setup>
// 聊天组件逻辑待实现
import {Input, Message, Modal} from 'view-ui-plus';
import {onActivated, onBeforeUnmount, onDeactivated, onMounted, ref} from 'vue';
import SvgIcon from '@/components/svgIcon/index.vue';
import {QueryConversationInDto} from '@/api/ai/dto/QueryConversation.ts';
import {AiService} from '@/service/AiService.ts';
import {GenerateTemplateInDto} from '@/api/ai/dto/GenerateTemplate.ts';
import {DiagnoseInDto} from '@/api/ai/dto/Diagnose.ts';
import {extractDataContent} from '@/utiles/processing.ts';
import {message} from '@/utiles/Message.ts';
import {getRandomAiMessage} from '@/utiles/aiMessages.ts';
import {AiMessageBean} from '@/api/ai/dto/bean/AiMessageBean.ts';
import {QuestionBean} from '@/api/ai/dto/bean/QuestionBean.ts';
import {WriteInDto} from '@/api/ai/dto/Write.ts';
import {scrollToBottom} from '@/utiles/domUtils.ts';
import {AiConversationOutDto} from '@/api/ai/dto/bean/AiConversationOutDto.ts';
import {AiErrorHandler} from '@/utiles/aiErrorHandler.ts';
import {UserInfo} from '@/utiles/userInfo.ts';
import {hideLoading} from '@/utiles/loading.ts';

type TextType = {
    [key: string]: string;
};

class CustomMessagesBean extends AiConversationOutDto {
    // 是否展开收起深度思考
    isExpand?: boolean = false;

    // 是否展示正在思考完成，等待中
    loadingContentStart?: boolean = false;

    // 聊天内容是否展开
    isExpandChat?: boolean = false;
}

const aiService = new AiService();

const props = defineProps<{
    resumeUuid: string; // 简历id
    hasAttachment?: File | null; // 简历附件
    streamWrite: Function; // 流式回填
    over: (isOpenModal: boolean) => void; // 结束ai 撰写（ai次数用完调用的）
    changeMode: () => void; // ai 结束调用
    updateCache: (s: string) => void; // 最后一次诊断保存
}>();

const emits = defineEmits<{
    sendTemplate: [template: string, type: string];
    sendDiagnose: [diagnose: string];
    listFinish: [];
    exit: [];
}>();

const thinkingText: TextType = {
    '1': '已完成思考',
    '2': '深度思考中',
    '3': '生成失败'
};
// 输入内容
const sendContent = ref<string>('');
// 是否禁用输入框
const disabled = ref<boolean>(true);
// 聊天列表
const chatList = ref<CustomMessagesBean[]>([]);
// 诊断问题列表
const diagnoseList = ref<QuestionBean[]>([]);
// 诊断问题内容
const diagnoseContent = ref<string>('');
// 诊断弹窗
const diagnoseModal = ref<boolean>(false);
// 聊天记录容器引用
const chattingRecordsRef = ref<HTMLElement>();
// 是否追问
const isFollowUp = ref<boolean>(false);
// 滚动位置缓存
const scrollTop = ref(0);

// 分页信息
const pageNum = ref<number>(1);
const pageSize = ref<number>(20);
// 是否还有更多数据
const hasMore = ref<boolean>(true);
// 是否正在加载
const loading = ref<boolean>(false);
// 用户是否在底部（用于判断是否需要自动滚动）
const isUserAtBottom = ref<boolean>(true);
// ai 是否正在工作
const isWorking = ref<boolean>(false);
// 诊断的话术
const diagnoseStr = ref<string>('');
// 需要重试的诊断流程 3-诊断 4-撰写
const reloadFlow = ref<string>('');

// 根据错误码显示提示信息
const showErrorMessage = (code: number) => {
    hideLoading();
    if (code === 526) {
        emits('exit');
    } else {
        AiErrorHandler.handleError(code, props.over);
    }
};

// 重试
const handleReload = () => {
    chatList.value.pop();
    if (reloadFlow.value === '3') {
        diagnoseResume();
    } else {
        write();
    }
};

// 结束ai 对话
const handleOver = () => {
    diagnoseModal.value = false;

    chatList.value.push({
        role: 'user',
        content: '结束对话',
        isExpand: false
    });

    setTimeout(() => {
        props.changeMode();
    }, 1000);
};

// 查询当前聊天记录
const queryChatList = async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    const data: QueryConversationInDto = {
        resumeUuid: props.resumeUuid,
        pageInfo: {
            pageNum: pageNum.value,
            pageSize: pageSize.value
        }
    };

    try {
        const res = await aiService.queryConversation(data);
        const newData = res.data.list || [];

        if (pageNum.value === 1) {
            chatList.value = newData.reverse();

            scrollToBottom('chatting-records');
        } else {
            chatList.value = [...newData.reverse(), ...chatList.value];
        }

        // 检查是否还有更多数据
        hasMore.value = newData.length === pageSize.value;

        if (chatList.value?.length > 0 && pageNum.value === 1) {
            emits('listFinish');
        }
        if (chatList.value?.length === 0) {
            const content: string = '请帮我制作一份求职简历！';
            chatList.value.push({
                role: 'user',
                content,
                isExpand: true
            });

            // ai回复 （生成模板）
            const msg: string = '正在帮您生成简历模板，请稍后！';
            chatList.value.push({
                role: 'assistant',
                content: msg,
                thinkingStatus: '2',
                isExpand: true,
                thinking: ''
            });
            generateTemplate(msg, content);
        }
    } finally {
        loading.value = false;
    }
};

// 继续优化
const continueOptimize = () => {
    diagnoseModal.value = false;
    askQuestion();
};

// 生成模板
const generateTemplate = (msg: string, content: string) => {
    isWorking.value = true;

    const messages: AiMessageBean[] = [
        {
            role: 'user',
            content: content
        },
        {
            role: 'assistant',
            content: msg
        }
    ];

    const params: GenerateTemplateInDto = {
        resumeId: props.resumeUuid,
        hasAttachment: props.hasAttachment ? '1' : '0',
        messages
    };

    aiService.generateTemplateStream(
        params,
        (data) => {
            const lastData = chatList.value[chatList.value.length - 1];
            console.log(data);

            if (data.includes('event:thinking')) {
                const str: string = extractDataContent(data, 'event:thinking');
                lastData.thinking += str;
                scrollThinkingToBottom();
            } else if (data.includes('event:loadingContentStart')) {
                lastData.thinkingStatus = '1';
                lastData.loadingContentStart = true;
            } else if (data.includes('event:loadingContentEnd')) {
                chatList.value.forEach((item) => (item.loadingContentStart = false));
            } else if (data.includes('event:error')) {
                const str: string = extractDataContent(data, 'event:error');
                showErrorMessage(JSON.parse(str).status);
            } else {
                const str: string = extractDataContent(data, 'event:content');
                emits('sendTemplate', str, 'template');
                setThinkState();
                // 完成处理 查询是否存在附件，解析附件 || 分析简历
                if (props.hasAttachment) {
                    // 解析模板
                    const msg: string = '正在解析附件内容，请稍后！';

                    chatList.value.push({
                        role: 'assistant',
                        content: msg,
                        thinkingStatus: '2',
                        isExpand: true,
                        thinking: ''
                    });

                    parseAttachment(msg);
                } else {
                    diagnoseResume();
                }
            }
            smartScrollToBottom();
        },
        (error) => {
            showErrorMessage(error.status);
        },
        () => {
            isWorking.value = false;
        }
    );
};

// 解析简历附件
const parseAttachment = (msg: string) => {
    isWorking.value = true;
    const params = {
        resumeId: props.resumeUuid,
        messages: JSON.stringify([
            {
                role: 'assistant',
                content: msg
            }
        ])
    };

    aiService.parseAttachmentStream(
        params,
        props.hasAttachment!,
        (data) => {
            const lastData = chatList.value[chatList.value.length - 1];
            console.log(data);

            if (data.includes('event:thinking')) {
                const str: string = extractDataContent(data, 'event:thinking');
                lastData.thinking += str;
                scrollThinkingToBottom();
            } else if (data.includes('event:loadingContentStart')) {
                lastData.thinkingStatus = '1';
                lastData.loadingContentStart = true;
            } else if (data.includes('event:loadingContentEnd')) {
                chatList.value.forEach((item) => (item.loadingContentStart = false));
            } else if (data.includes('event:error')) {
                const str: string = extractDataContent(data, 'event:error');
                showErrorMessage(JSON.parse(str).status);
                emits('sendTemplate', '', 'attachmentStream');
            } else {
                const str: string = extractDataContent(data, 'event:content');
                emits('sendTemplate', str, 'attachmentStream');
            }
            smartScrollToBottom();
        },
        (error) => {
            showErrorMessage(error.status);
            emits('sendTemplate', '', 'attachmentStream');
        },
        () => {
            isWorking.value = false;
            setThinkState();
            diagnoseResume();
        }
    );
};

/**
 * @description 诊断简历
 * @param message ai 消息
 * @param reply 是否需要用户回复
 */
const diagnoseResume = (message?: string, reply?: boolean) => {
    isWorking.value = true;

    // 解析模板
    const msg: string = message || '接下来我会对简历进行诊断并询问一些问题。';

    chatList.value.push({
        role: 'assistant',
        content: msg,
        thinkingStatus: '2',
        isExpand: true,
        thinking: ''
    });

    const messages: AiMessageBean[] = [
        {
            role: 'assistant',
            content: msg
        }
    ];

    const params: DiagnoseInDto = {
        resumeId: props.resumeUuid,
        messages
    };

    aiService.diagnoseStream(
        params,
        (data) => {
            let lastData = chatList.value[chatList.value.length - 1];

            console.log(data);
            if (data.includes('event:thinking')) {
                const str: string = extractDataContent(data, 'event:thinking');
                chatList.value[chatList.value.length - 1].thinking += str;
                scrollToBottom('deep-thinking-content');
            } else if (data.includes('event:loadingContentStart')) {
                lastData = chatList.value[chatList.value.length - 1];
                lastData.thinkingStatus = '1';
                lastData.loadingContentStart = true;
            } else if (data.includes('event:loadingContentEnd')) {
                chatList.value.forEach((item) => (item.loadingContentStart = false));
            } else if (data.includes('event:error')) {
                const str: string = extractDataContent(data, 'event:error');
                showErrorMessage(JSON.parse(str).status);

                if (JSON.parse(str).status === 522) {
                    setThinkState();
                    lastData.thinkingStatus = '3';
                    reloadFlow.value = '3';
                }
            } else {
                setThinkState();
                const str: string = extractDataContent(data, 'event:content');
                chatList.value.push({
                    role: 'assistant',
                    content: JSON.parse(str).diagnosisResultMessage,
                    isExpand: false,
                    thinking: ''
                });

                const diagnoseData = JSON.parse(str);

                diagnoseData.issues = diagnoseData.issues.map((item: any) => ({...item, isEnquiry: false}));
                diagnoseList.value = diagnoseData.issues;

                diagnoseStr.value = JSON.stringify(diagnoseData);

                if (reply) {
                    diagnoseContent.value = JSON.parse(str).diagnosisResultMessage;
                    diagnoseModal.value = true;
                } else {
                    emits('sendDiagnose', str);
                    askQuestion();
                }
                props.updateCache(str);
            }
            smartScrollToBottom();
        },
        (error) => {
            showErrorMessage(error.status);
        },
        () => {
            isWorking.value = false;
        }
    );
};

// 发送上次诊断的消息
const sendLastDiagnose = (issues: QuestionBean[]) => {
    diagnoseList.value = issues;
    if (diagnoseList.value[0].isEnquiry) {
        diagnoseList.value.shift();
        return sendLastDiagnose(diagnoseList.value);
    }

    askQuestion();
};

// 提出问题 (每次取第一个问题)
const askQuestion = () => {
    if (diagnoseList.value.length > 0) {
        const question = diagnoseList.value[0].question;
        chatList.value.push({
            role: 'assistant',
            content: question,
            isExpand: false,
            thinking: ''
        });

        disabled.value = false;
    } else {
        // 再次诊断
        diagnoseResume('我将继续对简历进行诊断。', true);
    }
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
};

// 发送消息
const handleSendMessage = () => {
    if (!sendContent.value) return message.error(Message, '请输入内容后发送');

    chatList.value.push({
        role: 'user',
        content: sendContent.value,
        isExpand: false,
        thinkingStatus: '0',
        thinking: ''
    });
    sendContent.value = '';
    disabled.value = true;
    scrollToBottom('chatting-records');

    write();
};

// 撰写
const write = () => {
    // 获取随机话术
    isWorking.value = true;
    const message = getRandomAiMessage();
    chatList.value.push({
        role: 'assistant',
        content: message,
        isExpand: true,
        thinkingStatus: '2',
        thinking: ''
    });

    // 获取最后三条数据转换为AiMessageBean格式
    const messages: AiMessageBean[] = chatList.value.slice(-3).map((item) => ({
        role: item.role!,
        content: item.content!
    }));

    const params: WriteInDto = {
        resumeId: props.resumeUuid,
        questionUuid: diagnoseList.value[0].questionUuid,
        isFollowUp: isFollowUp.value,
        messages
    };

    aiService.writeStream(
        params,
        async (data) => {
            const lastData = chatList.value[chatList.value.length - 1];

            if (data.includes('event:thinking')) {
                const str: string = extractDataContent(data, 'event:thinking');
                lastData.thinking += str;
                scrollToBottom('deep-thinking-content');
            } else if (data.includes('event:loadingContentStart')) {
                lastData.thinkingStatus = '1';
                lastData.loadingContentStart = true;
            } else if (data.includes('event:loadingContentEnd')) {
                chatList.value.forEach((item) => (item.loadingContentStart = false));
            } else if (data.includes('event:error')) {
                const str: string = extractDataContent(data, 'event:error');
                showErrorMessage(JSON.parse(str).status);
                if (JSON.parse(str).status === 522) {
                    setThinkState();
                    lastData.thinkingStatus = '3';
                    reloadFlow.value = '4';
                }
            } else {
                setThinkState();
                const str: string = extractDataContent(data, 'event:content');
                const response = JSON.parse(str);
                // 更新诊断问题数据（已问询）
                const diagnoseData = JSON.parse(diagnoseStr.value);

                const index: number = diagnoseData.issues.findIndex((info: QuestionBean) => info.questionUuid === diagnoseList.value[0].questionUuid);
                diagnoseData.issues[index].isEnquiry = true;

                isFollowUp.value = response.isFollowUp;
                if (response.completed) {
                    await props.streamWrite(response.fieldDataList);
                    diagnoseList.value.shift();
                    askQuestion();
                } else if (!response.completed && response.isFollowUp) {
                    chatList.value.push({
                        role: 'assistant',
                        content: response.followUpQuestion,
                        isExpand: false,
                        thinking: ''
                    });
                    if (!response.fieldDataList) {
                        diagnoseData.issues[index].isEnquiry = false;
                    }

                    if (response.fieldDataList) {
                        await props.streamWrite(response.fieldDataList);
                    }
                    disabled.value = false;
                }

                emits('sendDiagnose', JSON.stringify(diagnoseData));
                // props.updateCache(JSON.stringify(diagnoseData))
            }
            smartScrollToBottom();
        },
        (error) => {
            showErrorMessage(error.status);
        },
        () => {
            isWorking.value = false;
        }
    );
};

// 关闭深度思考
const setThinkState = () => {
    const lastData = chatList.value[chatList.value.length - 1];

    lastData.isExpand = false;
};

// 处理滚动事件
const handleScroll = () => {
    const scrollElement = chattingRecordsRef.value;
    if (!scrollElement) return;

    // 检查用户是否在底部（距离底部50px内认为是底部）
    const {scrollTop, scrollHeight, clientHeight} = scrollElement;
    isUserAtBottom.value = scrollTop + clientHeight >= scrollHeight - 50;

    // 当滚动到顶部附近时加载更多
    if (!loading.value && hasMore.value && scrollTop <= 50) {
        pageNum.value++;
        queryChatList();
    }
};

// 智能滚动到底部（只有用户在底部时才滚动）
const smartScrollToBottom = () => {
    if (isUserAtBottom.value) {
        scrollToBottom('chatting-records');
    }
};

// 深度思考内容滚动（始终滚动到底部）
const scrollThinkingToBottom = () => {
    scrollToBottom('deep-thinking-content');
};

const saveScrollPosition = () => {
    if (chattingRecordsRef.value) {
        scrollTop.value = chattingRecordsRef.value.scrollTop;
    }
};

onMounted(() => {
    queryChatList();
    if (chattingRecordsRef.value) {
        chattingRecordsRef.value.addEventListener('scroll', saveScrollPosition);
    }

    diagnoseStr.value = UserInfo.info.resumeMap?.[props.resumeUuid]?.trick;
});

onActivated(() => {
    if (chattingRecordsRef.value && scrollTop.value > 0) {
        chattingRecordsRef.value.scrollTop = scrollTop.value;
    }
});

onBeforeUnmount(() => {
    if (chattingRecordsRef.value) {
        chattingRecordsRef.value.removeEventListener('scroll', saveScrollPosition);
    }
});

defineExpose({
    diagnoseResume,
    sendLastDiagnose,
    isWorking
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.resume-chat {
    width: 100%;
    height: vh(940);
    background: $white;
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;

    .chatting-records {
        flex: 1;
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 0;
        }

        .loading-more {
            text-align: center;
            padding: vh(10) 0;
            color: $font-middle;
            font-size: vw(12);
        }

        .my-chat_box {
            display: flex;
            justify-content: flex-end;

            .my-chat {
                border-radius: vw(2);
                background: #f6f8fa;
                padding: vh(13) vw(15);
                color: $font-dark;
                font-size: vw(14);
                font-style: normal;
                font-weight: 400;
                line-height: vw(20);
                word-break: break-all;
                white-space: pre-wrap;
            }
        }

        .ai-chat-box {
            display: flex;
            justify-content: flex-start;

            .ai-chat {
                .ai-chat-text {
                    border-radius: vw(2);
                    padding: vh(13) vw(15);
                    border: 1px solid $border-default;
                    color: $font-dark;
                    font-size: vw(14);
                    font-style: normal;
                    font-weight: 400;
                    line-height: vw(20);
                    word-break: break-all;
                    white-space: pre-wrap;
                }

                .ai-chat-score {
                    display: flex;
                    justify-content: space-between;
                    gap: vw(57);
                    padding: vh(10) vw(15);
                    height: vh(40);
                    border-radius: vw(2);
                    border: vw(1) solid $border-default;
                    background: $white;

                    .ai-chat-score_content {
                        color: $font-dark;
                        font-size: vw(14);
                        font-style: normal;
                        font-weight: 400;
                        line-height: vw(20);
                        word-break: break-all;
                        white-space: pre-wrap;
                        width: vw(130);
                        height: vh(20);
                        overflow: hidden;
                    }

                    .ai-chat-score-open,
                    .ai-chat-score-close {
                        color: $theme-color;
                        font-size: vw(14);
                        font-style: normal;
                        font-weight: 400;
                        line-height: vw(20);
                    }

                    &.ai-chat-score-expand {
                        display: flex;
                        flex-direction: column;
                        gap: vh(10);
                        height: auto;
                        .ai-chat-score_content {
                            width: 100%;
                            height: auto;
                        }
                    }
                }
            }

            .is-think {
                display: flex;
                align-items: center;
                justify-content: flex-end;

                .think-text {
                    color: $font-middle;
                    font-size: vw(12);
                    font-style: normal;
                    font-weight: 400;
                    line-height: vw(12);
                    display: flex;

                    &.think-reload {
                        color: #df6f6b;
                        font-size: vw(12);
                        font-style: normal;
                        font-weight: 400;
                        line-height: vw(12);
                    }

                    .reload {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: vw(5);
                        .reload-text {
                            color: #df6f6b;
                            font-size: vw(12);
                            font-style: normal;
                            font-weight: 400;
                            line-height: vw(12);
                        }
                    }
                }
            }
        }

        .deep-thinking {
            width: 100%;
            padding: vh(10) vw(15);
            border-radius: vw(2);
            border: 1px solid #aebcfd;
            background: linear-gradient(92deg, rgba(196, 162, 252, 0.1) 3.76%, rgba(136, 233, 255, 0.1) 95.27%);
            position: relative;

            .icon {
                position: absolute;
                right: vw(10);
                top: vw(10);
            }

            .deep-thinking-title {
                display: flex;
                align-items: center;
                justify-content: flex-start;

                .deep-log {
                    width: vw(22);
                    height: vw(20);
                    margin-right: vw(6);
                }

                .deep-thinking-title-text {
                    color: $font-dark;
                    font-size: vw(14);
                    font-style: normal;
                    font-weight: 400;
                    line-height: vw(20);
                }
            }

            .deep-thinking-finish {
                display: flex;
                gap: vw(20);

                .deep-thinking-finish-text {
                    color: $font-dark;
                    font-size: vw(14);
                    font-style: normal;
                    font-weight: 400;
                    line-height: vw(20);
                }

                .deep-thinking-finish-loading {
                    color: #c4a2fc;
                    font-size: vw(14);
                    font-style: normal;
                    font-weight: 400;
                    line-height: vw(20);
                }
            }

            .deep-thinking-content {
                color: $font-middle;
                font-size: vw(14);
                font-style: normal;
                font-weight: 400;
                line-height: vw(20);
                max-height: vh(350);
                overflow-y: auto;
                word-break: break-all;
                white-space: pre-wrap;
                margin-top: vh(24);

                &::-webkit-scrollbar {
                    display: none;
                }
            }
        }

        .deep-thinking-finish {
            .loading-dots {
                span {
                    opacity: 0;
                    animation: loading 2s infinite;

                    &:nth-child(1) {
                        animation-delay: 0s;
                    }

                    &:nth-child(2) {
                        animation-delay: 0.3s;
                    }

                    &:nth-child(3) {
                        animation-delay: 0.6s;
                    }
                }
            }
        }
    }

    .send-message {
        width: 100%;
        flex-shrink: 0;
        border-radius: vw(2);
        border: 1px solid $border-default;
        padding: vh(10) vw(15);
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-direction: column;
        background: $white;
        gap: vh(12);

        :deep(.ivu-input) {
            padding: 0;
            resize: none;
            background: $white;

            &::-webkit-scrollbar {
                width: vw(6);
                height: vh(6);
                box-shadow: 0 0 vw(5) #e7eaea;
            }

            &::-webkit-scrollbar-thumb {
                background-color: #c1c1c0;
                border-radius: vw(3);
            }

            &::-webkit-scrollbar-track {
                border-radius: vw(3);
            }
        }

        &.send-message_disabled {
            background: $form-bg-disabled;
            :deep(.ivu-input) {
                background: $form-bg-disabled;
            }
        }

        .save-btn {
            width: vw(60);
            height: vh(28);
            padding: 0;
            gap: vw(6);
            display: flex;
            justify-content: center;
            align-items: center;
            border: 0;
            font-style: normal;
            font-weight: 500;
            line-height: vw(12);
            box-shadow: none;
            background: linear-gradient(0deg, #fc8719 0%, #fc8719 100%), #e8eaec;
            color: $white;
            font-size: vw(12);
            cursor: pointer;
            border-radius: vw(2);

            &:disabled {
                background: #eaecee;
                color: #c5c8ce;
                cursor: no-drop;
            }
        }
    }
}

@keyframes loading {
    0% {
        opacity: 0;
    }
    15% {
        opacity: 1;
    }
    45% {
        opacity: 1;
    }
    60%,
    100% {
        opacity: 0;
    }
}
</style>

<style lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.question-modal {
    .modal-body {
        min-height: vh(126);
        height: auto;
    }
}
</style>
