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
        ></Input>

        <div class="ai-content">
          <div class="ai-content-think mt-20">
            <div class="think-title">
              <img src="@/assets/images/deep-logo.gif" class="think-title-icon"/>
              <div class="think-text">深度思考中...</div>
            </div>

            <div class="think-content">{{ thinkContent }}</div>
          </div>
        </div>
      </div>

      <div class="optimize-footer">
        <!--        <div>-->
        <!--          <Button class="mr-10 cancel btn" @click="handleCancel">取消</Button>-->
        <!--          <Button type="primary" class="submit btn">确定</Button>-->
        <!--        </div>-->

        <button @click="handleSubmit" v-if="state === '1'" class="start-btn pointer">
          <SvgIcon name="icon-ai-xing" size="14" class="icon-ai" color="#fff"></SvgIcon>
          开始生成
        </button>
      </div>
    </div>
  </Modal>

</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Button, Input, Message, Modal} from "view-ui-plus";
import SvgIcon from "@/components/svgIcon/index.vue";
import {aiOptimize, enumEcho} from "@/enums/enumDict.ts";
import {message} from "@/utiles/Message.ts";

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

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 额外要求
const requirement = ref<string>('');
// 当前流程状态 1-生成之前 2-深度思考 3-生成中 4-生成结束
const state = ref<string>('1');
// 深度思考内容
const thinkContent = ref<string>('');

const handleCancel = () => {
  emit('update:modelValue', false)
  requirement.value = ''
}

// 开始ai 生成
const handleSubmit = () => {
  if (requirement.value.length < 20) return message.error(Message, '请至少填写20个字！')
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
        height: calc(100% - 110px);
        overflow: auto;

        &::-webkit-scrollbar {
          display: none;
        }

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

          .think-content {
            margin-top: 13px;
            padding: 10px 15px;
            border-radius: 2px;
            border: 1px solid #C4A2FC;
            background: linear-gradient(92deg, rgba(196, 162, 252, 0.10) 3.76%, rgba(136, 233, 255, 0.10) 95.27%);
            min-height: 50px;
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
    }
  }

}
</style>
