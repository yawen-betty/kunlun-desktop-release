<template>
  <div class="resume-chat-wrapper">
    <div class="resume-chat p20">
      <!-- 聊天内容待实现 -->
      <div class="chatting-records" @scroll="handleScroll" ref="chattingRecordsRef">
        <div v-if="loading && pageNum > 1" class="loading-more">
          <span>加载中...</span>
        </div>

        <template v-for="(info,index) in chatList" :key="index">
          <div class="my-chat_box mb-20" v-if="info.role === 'user'">
            <div class="my-chat">{{ info.content }}</div>
          </div>

          <div v-else>
            <div class="ai-chat-box mb-20">
              <div class="ai-chat">
                <div class="ai-chat-text">{{ info.content }}</div>
                <div class="is-think mt-10" v-if="['1','2'].includes(info.thinkingStatus || '0')">
                  <div class="think-text mr-5">{{ thinkingText[info.thinkingStatus!] }}</div>
                  <SvgIcon name="icon-zhankai" color="#9499A4" size="12" class="pointer"
                           @click="info.isExpand = true"></SvgIcon>
                </div>
              </div>
            </div>

            <div class="deep-thinking mt-10 mb-20" v-if="info.isExpand">
              <SvgIcon name="icon-shouqi" color="#9499A4" size="12" class="pointer icon"
                       @click="info.isExpand = false"></SvgIcon>

              <div class="deep-thinking-title">
                <img src="@/assets/images/deep-logo.gif" class="deep-log"/>
                <div class="deep-thinking-title-text">深度思考</div>
              </div>
              <div class="deep-thinking-content">
                {{ info.thinking }}
              </div>
            </div>
          </div>

        </template>
      </div>

      <div class="send-message">
        <Input
          v-model="sendContent"
          type="textarea"
          :maxlength="2000"
          :rows="2"
          :autosize="{ minRows: 2, maxRows: 5 }"
          placeholder="请输入"
          :disabled="disabled"
          @on-enter="handleSendMessage"
        ></Input>
        <button class="save-btn" :disabled="disabled || !sendContent" @click="handleSendMessage">
          <SvgIcon name="icon-fasong" size="10" :color="disabled || !sendContent ? '#C5C8CE' : '#fff'"/>
          完成
        </button>
      </div>
    </div>

    <Modal
      v-model="diagnoseModal"
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
          <p>{{ diagnoseContent }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="handleOver">结束AI撰写</button>
          <button class="btn-confirm" @click="askQuestion">继续优化</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
// 聊天组件逻辑待实现
import {Input, Message, Modal} from "view-ui-plus";
import {nextTick, onActivated, onMounted, ref, watch} from "vue";
import SvgIcon from "@/components/svgIcon/index.vue";
import {MessagesBean} from "@/api/ai/dto/bean/MessagesBean.ts";
import {QueryConversationInDto} from "@/api/ai/dto/QueryConversation.ts";
import {AiService} from "@/service/AiService.ts";
import {GenerateTemplateInDto} from "@/api/ai/dto/GenerateTemplate.ts";
import {DiagnoseInDto} from "@/api/ai/dto/Diagnose.ts";
import {extractDataContent} from "@/utiles/processing.ts";
import {message} from "@/utiles/Message.ts";
import {getRandomAiMessage} from "@/utiles/aiMessages.ts";
import {AiMessageBean} from "@/api/ai/dto/bean/AiMessageBean.ts";
import {QuestionBean} from "@/api/ai/dto/bean/QuestionBean.ts";
import {WriteInDto} from "@/api/ai/dto/Write.ts";
import {scrollToBottom} from "@/utiles/domUtils.ts";
import {AiConversationOutDto} from "@/api/ai/dto/bean/AiConversationOutDto.ts";

type TextType = {
  [key: string]: string;
};

class CustomMessagesBean extends AiConversationOutDto {
  // 是否展开收起深度思考
  isExpand?: boolean = false;
}

const aiService = new AiService();

const props = defineProps<{
  resumeUuid: string;   // 简历id
  hasAttachment?: File | null; // 简历附件
  streamWrite: Function, // 流式回填
  over: Function // 结束ai 撰写（ai次数用完调用的）
  changeMode: Function // ai 结束调用

}>();

const emits = defineEmits<{
  sendTemplate: [template: string]
  sendDiagnose: [diagnose: string]
}>()

const thinkingText: TextType = {
  '1': '已完成思考',
  '2': '深度思考中',
};
// 输入内容
const sendContent = ref<string>('');
// 是否禁用输入框
const disabled = ref<boolean>(false);
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

// 分页信息
const pageNum = ref<number>(1);
const pageSize = ref<number>(20);
// 是否还有更多数据
const hasMore = ref<boolean>(true);
// 是否正在加载
const loading = ref<boolean>(false);

// 监听chatList变化，自动滚动到底部
watch(chatList, () => {
  scrollToBottom('chatting-records');
}, {deep: true});

// 根据错误码显示提示信息
const showErrorMessage = (code: number) => {
  const errorMessages: { [key: number]: string } = {
    525: '免费模型次数已用完，自动切换为人工撰写模式！',
    520: '简历模版生成失败，自动切换为人工撰写模式！',
    521: '简历解析失败！',
    522: '简历诊断失败！',
    523: '简历撰写失败！'
  };

  const errorMsg = errorMessages[code];
  if (errorMsg) {
    message.error(Message, errorMsg);
  }

  if ([525, 520].includes(code) && props.over) props.over();
};

// 结束ai 对话
const handleOver = () => {
  chatList.value.push({
    role: 'assistant',
    content: '结束对话',
    isExpand: false,
  });

  nextTick(() => {

  })
  props.changeMode()
}

// 查询当前聊天记录
const queryChatList = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  const data: QueryConversationInDto = {
    resumeUuid: props.resumeUuid,
    pageInfo: {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    },
  }

  try {
    const res = await aiService.queryConversation(data);
    const newData = res.data.list || [];

    if (pageNum.value === 1) {
      chatList.value = newData;
    } else {
      // 保存当前滚动位置
      const scrollElement = chattingRecordsRef.value;
      const oldScrollHeight = scrollElement?.scrollHeight || 0;

      chatList.value = [...newData, ...chatList.value];

      // 恢复滚动位置
      await nextTick();
      if (scrollElement) {
        const newScrollHeight = scrollElement.scrollHeight;
        scrollElement.scrollTop = newScrollHeight - oldScrollHeight;
      }
    }

    // 检查是否还有更多数据
    hasMore.value = newData.length === pageSize.value;

    if (chatList.value?.length === 0) {
      const content: string = '请帮我制作一份求职简历！'
      chatList.value.push({
        role: 'user',
        content,
        isExpand: true,
      })

      // ai回复 （生成模板）
      const msg: string = '正在帮您生成简历模板，请稍后！'
      chatList.value.push({
        role: 'assistant',
        content: msg,
        thinkingStatus: '2',
        isExpand: true,
        thinking: ''
      });
      generateTemplate(msg, content)
    } else if (pageNum.value === 1) {
      scrollToBottom('chatting-records');
    }
  } finally {
    loading.value = false;
  }
}

// 生成模板
const generateTemplate = (msg: string, content: string) => {

  const messages: AiMessageBean[] = [
    {
      role: 'user',
      content: content
    }, {
      role: 'assistant',
      content: msg
    }
  ]

  const params: GenerateTemplateInDto = {
    resumeId: props.resumeUuid,
    hasAttachment: props.hasAttachment ? '1' : '0',
    messages
  }

  aiService.generateTemplateStream(
    params,
    (data) => {
      if (data.includes('event:thinking')) {

        const str: string = extractDataContent(data, 'event:thinking')
        chatList.value[chatList.value.length - 1].thinking += str
        scrollToBottom('deep-thinking-content');
      } else {
        const str: string = extractDataContent(data, 'event:content')
        emits('sendTemplate', str);
      }
      // 更新UI显示流式数据
    },
    (error) => {
      showErrorMessage(error.status)
    },
    () => {
      setThinkState();
      // 完成处理 查询是否存在附件，解析附件 || 分析简历
      if (props.hasAttachment) {
        // 解析模板
        const msg: string = '正在解析附件内容，请稍后！'

        chatList.value.push({
          role: 'assistant',
          content: msg,
          thinkingStatus: '2',
          isExpand: true,
          thinking: ''
        });

        parseAttachment(msg);
      } else {
        diagnoseResume()
      }
    }
  );
}

// 解析简历附件
const parseAttachment = (msg: string) => {
  const params = {
    resumeId: props.resumeUuid,
    messages: [
      {
        role: 'assistant',
        content: msg
      }
    ]
  }

  aiService.parseAttachmentStream(
    params,
    props.hasAttachment!,
    (data) => {

      if (data.includes('event:thinking')) {

        const str: string = extractDataContent(data, 'event:thinking')
        chatList.value[chatList.value.length - 1].thinking += str
        scrollToBottom('deep-thinking-content');
      } else {
        const str: string = extractDataContent(data, 'event:content')

        emits('sendTemplate', str);
      }
    },
    (error) => {
      showErrorMessage(error.status)
    },
    () => {
      setThinkState();
      diagnoseResume();
    }
  );
}

/**
 * @description 诊断简历
 * @param message ai 消息
 * @param reply 是否需要用户回复
 */
const diagnoseResume = (message?: string, reply?: boolean) => {
  // 解析模板
  const msg: string = message || '接下来我会对简历进行诊断并询问一些问题。'

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
  ]

  const params: DiagnoseInDto = {
    resumeId: props.resumeUuid,
    messages
  }

  aiService.diagnoseStream(
    params,
    (data) => {

      if (data.includes('event:thinking')) {

        const str: string = extractDataContent(data, 'event:thinking')
        chatList.value[chatList.value.length - 1].thinking += str
        scrollToBottom('deep-thinking-content');
      } else {
        const str: string = extractDataContent(data, 'event:content')

        chatList.value.push({
          role: 'assistant',
          content: JSON.parse(str).diagnosisResultMessage,
          isExpand: false,
          thinking: ''
        });

        if (reply) {
          diagnoseContent.value = JSON.parse(str).diagnosisResultMessage;
          diagnoseModal.value = true;
        } else {
          emits('sendDiagnose', str);
          diagnoseList.value = JSON.parse(str).issues;
          askQuestion();
        }
      }
    },
    (error) => {
      showErrorMessage(error.status)
    },
    () => {
      console.log('我真的诊断完了吗')
      setThinkState();
    }
  );
}

// 提出问题 (每次取第一个问题)
const askQuestion = () => {
  console.log(diagnoseList.value, 'diagnoseList.value')
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
    diagnoseResume('我将继续对简历进行诊断。', true)
  }
}

// 发送消息
const handleSendMessage = () => {

  if (!sendContent.value) return message.error(Message, '请输入内容后发送')

  chatList.value.push({
    role: 'user',
    content: sendContent.value,
    isExpand: false,
    thinkingStatus: '0',
    thinking: ''
  });
  sendContent.value = '';
  disabled.value = true;

  write();
}

// 撰写
const write = () => {
  // 获取随机话术
  const message = getRandomAiMessage();
  chatList.value.push({
    role: 'assistant',
    content: message,
    isExpand: true,
    thinkingStatus: '2',
    thinking: ''
  });

  // 获取最后三条数据转换为AiMessageBean格式
  const messages: AiMessageBean[] = chatList.value.slice(-3).map(item => ({
    role: item.role!,
    content: item.content!
  }));

  const params: WriteInDto = {
    resumeId: props.resumeUuid,
    questionUuid: diagnoseList.value[0].questionUuid,
    isFollowUp: isFollowUp.value,
    messages
  }

  aiService.writeStream(
    params,
    async (data) => {

      if (data.includes('event:thinking')) {

        const str: string = extractDataContent(data, 'event:thinking')
        chatList.value[chatList.value.length - 1].thinking += str
        scrollToBottom('deep-thinking-content');
      } else {
        setThinkState();
        const str: string = extractDataContent(data, 'event:content')

        const response = JSON.parse(str);

        console.log(response, '撰写')

        isFollowUp.value = response.isFollowUp
        // 是否追问
        if (response.completed) {
          if (props.streamWrite) await props.streamWrite(response.fieldDataList);
          diagnoseList.value.shift();
          askQuestion();
        } else {
          chatList.value.push({
            role: 'assistant',
            content: response.followUpQuestion,
            isExpand: false,
            thinking: ''
          });

          disabled.value = false;
        }
      }
    },
    (error) => {
      showErrorMessage(error.status)
    },
    () => {

    }
  )
}

// 关闭深度思考
const setThinkState = () => {
  const lastData = chatList.value[chatList.value.length - 1]

  lastData.thinkingStatus = '1';
  lastData.isExpand = false;


  console.log(chatList.value, 'chatList.valuechatList.value')
}

// 处理滚动事件
const handleScroll = () => {
  const scrollElement = chattingRecordsRef.value;
  if (!scrollElement || loading.value || !hasMore.value) return;

  // 当滚动到顶部附近时加载更多
  if (scrollElement.scrollTop <= 50) {
    pageNum.value++;
    queryChatList();
  }
};

onMounted(() => {
  queryChatList();
})

defineExpose({
  diagnoseResume
})
</script>

<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

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
        background: #F6F8FA;
        padding: vh(13) vw(15);
        color: $font-dark;
        font-size: vw(14);
        font-style: normal;
        font-weight: 400;
        line-height: vw(14);
        word-break: break-all;
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
          line-height: vw(14);
          word-break: break-all;
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
        }
      }

    }

    .deep-thinking {
      width: 100%;
      padding: vh(10) vw(15);
      border-radius: vw(2);
      border: 1px solid #AEBCFD;
      background: linear-gradient(92deg, rgba(196, 162, 252, 0.10) 3.76%, rgba(136, 233, 255, 0.10) 95.27%);
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

      .deep-thinking-content {
        color: $font-middle;
        font-size: vw(14);
        font-style: normal;
        font-weight: 400;
        line-height: vw(20);
        max-height: vh(350);
        overflow-y: auto;
        word-break: break-all;
        margin-top: vh(24);

        &::-webkit-scrollbar {
          display: none;
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
    background: $form-bg-disabled;
    gap: vh(12);

    :deep(.ivu-input) {
      padding: 0;
      resize: none;

      &::-webkit-scrollbar {
        display: none;
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
      background: linear-gradient(0deg, #FC8719 0%, #FC8719 100%), #E8EAEC;
      color: $white;
      font-size: vw(12);
      cursor: pointer;
      border-radius: vw(2);

      &:disabled {
        background: #EAECEE;
        color: #C5C8CE;
        cursor: no-drop;
      }
    }
  }
}
</style>
