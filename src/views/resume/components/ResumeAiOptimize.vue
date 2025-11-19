<template>
  <Modal
    :model-value="modelValue"
    :mask-closable="false"
    :closable="false"
    footer-hide
    class="resume-ai-optimize"
  >
    <div class="optimize-body">
      <div class="optimize-header">
        <div class="optimize-title">
          <SvgIcon name="icon-ai-xing" size="16" class="icon-ai mr-5" color="515A6D"></SvgIcon>
          {{ enumEcho(props.mode, aiOptimize) }}
        </div>
        <SvgIcon name="icon-cha" size="20" class="cha pointer" @click="handleCancel" color="#9499A4"></SvgIcon>
      </div>
      <div class="optimize-content">
        <Input
          v-model="requirement"
          type="textarea"
          :maxlength="200"
          show-word-limit
          :autosize="{ minRows: 4, maxRows: 4 }"
          placeholder="请输入你的要求（非必填）"
          :disabled="['2','3'].includes(state)"
        ></Input>

        <div class="ai-content">
          <div class="ai-content-think mt-20">
            <div class="think-title" v-if="['2','3'].includes(state)">
              <img src="@/assets/images/deep-logo.gif" class="think-title-icon"/>
              <div class="think-text">{{ state === '2' ? '深度思考中...' : '生成中...' }}</div>
            </div>

            <div v-else-if="state === '4'" class="hint">内容由AI生成，仅供参考</div>

            <div class="think-content" v-if="state === '2'">{{ thinkContent }}</div>
            <div class="content" v-if="['3','4'].includes(state)">{{ content }}</div>
          </div>
        </div>
      </div>

      <div class="optimize-footer">
        <button @click="handleSubmit" v-if="state === '1'" class="start-btn pointer">
          <SvgIcon name="icon-ai-xing" size="14" class="icon-ai" color="#fff"></SvgIcon>
          开始生成
        </button>

        <div v-if="state === '4'" class="modal-footer">
          <button class="mr-10 cancel btn" @click="handleSubmit">重新生成</button>
          <button class="submit btn" @click="handleEmitData">使用此内容</button>
        </div>
      </div>
    </div>
  </Modal>

</template>

<script setup lang="ts">
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

interface Props {
  modelValue: boolean; //弹窗状态
  resumeId: string; // 简历id
  text: string; //需要优化的原文
  fieldName: string, // 需要优化的字段名'']
  maxLength: number, // 最大优化长度'']
  mode: string, //  优化模式（1-润色 2-扩展 3-简化 4-总结）'']
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void

  (e: 'submit', value: string): void
}

const aiService = new AiService();

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 额外要求
const requirement = ref<string>('');
// 当前流程状态 1-生成之前 2-深度思考 3-生成中 4-生成结束
const state = ref<string>('1');
// 深度思考内容
const thinkContent = ref<string>('');
// 生成内容
const content = ref<string>('');


const handleCancel = () => {
  emit('update:modelValue', false);
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

      console.log(data)
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

      .ivu-input {
        height: vh(80);
        padding: vw(10);
        resize: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .ivu-input-word-count {
        background: transparent;
      }

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

    .optimize-footer {
      display: flex;
      justify-content: center;
      align-items: center;

      .start-btn {
        width: vw(106);
        height: vh(32);
        border-radius: vw(2);
        background: linear-gradient(0deg, #FC8719 0%, #FC8719 100%), #E8EAEC;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: vw(6);
        box-shadow: none;
        color: $white;
        font-size: vw(12);
        font-style: normal;
        font-weight: 600;
        line-height: vw(12);
        border: 0;
      }

      .modal-footer {
        flex: 1;
        display: flex;
        justify-content: flex-end;

        .btn {
          width: vw(100);
          height: vh(32);
          color: $white;
          font-size: vw(12);
          font-style: normal;
          font-weight: 600;
          border-radius: vw(2);
          border: 0;
          outline: none;
          box-shadow: none;
          text-align: center;
          line-height: vw(30);
          cursor: pointer;

          &.cancel {
            border: 1px solid #FC8719;
            color: #FC8719;
            background: $white;
          }

          &.submit {
            background: #FC8719;
            color: $white;
          }
        }
      }
    }
  }

}
</style>
