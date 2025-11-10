<template>
  <div class="resume-chat p20">
    <!-- 聊天内容待实现 -->
    <div class="chatting-records">

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

          <div class="deep-thinking mt-10" v-if="info.isExpand">
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
      <Input v-model="sendContent" placeholder="请输入" :disabled="disabled" @on-enter="handleSendMessage"></Input>
      <Button class="save-btn" :disabled="disabled" @click="handleSendMessage">
        <SvgIcon name="icon-fasong" size="10" color="#C5C8CE"/>
        完成
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 聊天组件逻辑待实现
import {Input} from "view-ui-plus";
import {onMounted, ref} from "vue";
import SvgIcon from "@/components/svgIcon/index.vue";
import {MessagesBean} from "@/api/ai/dto/bean/MessagesBean.ts";
import {QueryConversationInDto} from "@/api/ai/dto/QueryConversation.ts";
import {AiService} from "@/service/AiService.ts";
import {SaveConversationInDto} from "@/api/ai/dto/SaveConversation.ts";
import {GenerateTemplateInDto} from "@/api/ai/dto/GenerateTemplate.ts";
import {useCommon} from "@/utiles/useCommon.ts";
import {AiPaths} from "@/api/ai/AiPaths.ts";

type TextType = {
  [key: string]: string;
};

class CustomMessagesBean extends MessagesBean {
  // 是否展开收起深度思考
  isExpand?: boolean = true;
}

const aiService = new AiService();

const props = defineProps<{
  resumeUuid: string;   // 简历id
  hasAttachment?: File | null; // 简历附件
}>();

const {http} = useCommon();

const thinkingText: TextType = {
  '1': '已完成思考',
  '2': '深度思考中',
};
// 输入内容
const sendContent = ref<string>('');
// 是否禁用输入框
const disabled = ref<boolean>(true);
// 聊天列表
const chatList = ref<CustomMessagesBean[]>([]);
// 当前流程
const currentFlow = ref<string>('1');


// 分页信息
const pageNum = ref<number>(1);
const pageSize = ref<number>(20);

// 发送消息
const handleSendMessage = () => {
  console.log(sendContent.value);
}

// 查询当前聊天记录
const queryChatList = () => {
  const data: QueryConversationInDto = {
    resumeUuid: props.resumeUuid,
    skip: pageNum.value,
    limit: pageSize.value
  }

  aiService.queryConversation(data).then((res) => {
    chatList.value = res.data.messages!;
    if (res.data.messages?.length === 0) {
      const content: string = '请帮我制作一份求职简历！'
      chatList.value.push({
        role: 'user',
        content,
      })
      saveConversation('1', 'user', content)

      // ai回复 （生成模板）
      setTimeout(() => {
        const msg: string = '正在帮您生成简历模板，请稍后！'
        chatList.value.push({
          role: 'assistant',
          content: msg,
          thinkingStatus: '2',
          isExpand: true
        });
        generateTemplate(msg)
      }, 500)
    }
  })
}

// 保存聊天记录
const saveConversation = (type: string, role: string, content: string) => {
  const data: SaveConversationInDto = {
    resumeUuid: props.resumeUuid,
    type,
    role,
    content
  }
  aiService.saveConversation(data)
}

// 生成模板
const generateTemplate = (msg: string) => {
  const data: GenerateTemplateInDto = {
    resumeId: props.resumeUuid,
    hasAttachment: props.hasAttachment ? '1' : '0',
    assistantMessage: msg
  }

  http.sseRequest(
    AiPaths.generateTemplate,
    data,
    // onMessage
    (data) => {
      console.log('收到消息:', data);
      // 处理流式数据
    },
    // onError
    (error) => {
      console.error('SSE 错误:', error);
    },
    // onComplete
    () => {
      console.log('SSE 完成');
    }
  );
}

onMounted(() => {
  queryChatList();
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


  .chatting-records {
    height: vh(800);
    overflow-y: auto;

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
      border: 1px solid #C4A2FC;
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
      }
    }
  }

  .send-message {
    width: 100%;
    height: vh(100);
    flex-shrink: 0;
    border-radius: vw(2);
    border: 1px solid $border-default;
    padding: 0 vh(10) vh(15);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-direction: column;
    background: $form-bg-disabled;

    :deep(.ivu-input) {
      padding: 0;
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
      background: #EAECEE;
      color: #C5C8CE;
      font-size: vw(12);
      font-style: normal;
      font-weight: 500;
      line-height: vw(12);
      box-shadow: none;
    }
  }
}
</style>
