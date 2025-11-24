<template>
    <div class="feedback">
        <div class="feedback-header">
            <h1 class="feedback-title">问题反馈</h1>
            <span class="feedback-reply" @click="handleViewReply">查看回复</span>
        </div>

        <Form ref="formRef" :model="formData" :rules="rules" class="feedback-form" label-position="top">
            <FormItem prop="description" label="问题描述" class="feedback-item">
                <Input
                    v-model="formData.description"
                    type="textarea"
                    :rows="6"
                    placeholder="描述您遇到的问题，并说明您的诉求/需要的帮助"
                    :maxlength="2000"
                    show-word-limit
                    class="feedback-textarea"
                />
            </FormItem>

            <FormItem label="问题截图" class="feedback-upload-item">
                <Upload
                    :file-list="fileList"
                    :before-upload="beforeUpload"
                    :on-success="handleUploadSuccess"
                    :on-remove="handleRemove"
                    multiple
                    accept="image/jpeg,image/jpg,image/png"
                    action=""
                    list-type="picture-card"
                    class="feedback-upload"
                >
                    <div class="upload-trigger" v-if="fileList.length < 3">
                        <SvgIcon color="#9499A4" name="icon-xinzeng" size="20" />
                    </div>
                </Upload>
                <div class="upload-tip">最多上传3张，支持JPG、JPEG、PNG格式</div>
            </FormItem>
            <div class="feedback-submit">
                <Button type="primary" @click="handleSubmit">
                    <SvgIcon name="icon-shangchuan" size="12" />
                    提交
                </Button>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {Message} from 'view-ui-plus';
// import type {FormInstance} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';

const formRef = ref();

const formData = reactive({
    description: ''
});

const fileList = ref<any[]>([]);

const rules = {
    description: [{required: true, message: '请输入问题描述', trigger: 'blur'}]
};

const vw = (px: number) => `${(px / 1920) * 100}vw`;

const beforeUpload = (file: File) => {
    if (fileList.value.length >= 3) {
        Message.error('最多只能上传3张图片');
        return false;
    }

    const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    if (!isValidType) {
        Message.error('只支持JPG、JPEG、PNG格式');
        return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        Message.error('图片大小不能超过5MB');
        return false;
    }

    return true;
};

const handleUploadSuccess = (response: any, file: any) => {
    fileList.value.push(file);
};

const handleRemove = (file: any, fileList: any[]) => {
    const index = fileList.findIndex((item) => item.uid === file.uid);
    if (index > -1) {
        fileList.splice(index, 1);
    }
};

const handleSubmit = () => {
    formRef.value?.validate((valid: boolean) => {
        if (valid) {
            console.log('提交数据:', {
                description: formData.description,
                images: fileList.value
            });
            Message.success('提交成功');
        }
    });
};

const handleViewReply = () => {
    console.log('查看回复');
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.feedback {
    padding: vh(40) vw(40) vw(30) vw(40);
    width: vw(1279);
    height: vh(940);
    background: $white;
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);

    .feedback-header {
        display: flex;
        align-items: center;
        margin-bottom: vh(40);

        .feedback-title {
            font-family: 'YouSheBiaoTiHei';
            font-size: vw(28);
            font-weight: 400;
            color: $font-dark;
            line-height: vh(28);
            margin: 0;
        }

        .feedback-reply {
            font-size: vw(16);
            color: $theme-color;
            cursor: pointer;
            margin-left: vw(20);
            line-height: vh(16);
        }
    }

    .feedback-form {
        .feedback-item {
            margin-bottom: vh(30);

            :deep(.ivu-form-item-label) {
                font-size: vw(16);
                color: $font-middle;
                font-weight: 600;
                line-height: vh(16);
            }

            :deep(.ivu-form-item-required .ivu-form-item-label:before) {
                color: $remind-error;
            }

            .feedback-textarea {
                width: vw(800);
                :deep(.ivu-input) {
                    height: vh(160);
                    background: $bg-gray;
                    border-radius: vw(2);
                    border: none;
                    padding: vh(20) vw(20);
                    font-size: vw(16);
                    color: $font-dark;
                    resize: none;

                    &::placeholder {
                        color: $placeholder-color;
                        font-weight: 600;
                    }
                }

                :deep(.ivu-input-word-count) {
                    font-size: vw(14);
                    color: $font-middle;
                    background: $bg-gray;
                    right: vw(10);
                    bottom: vh(10);
                }
            }
        }

        .feedback-upload-item {
            margin-bottom: vh(30);

            :deep(.ivu-form-item-label) {
                font-size: vw(16);
                color: $font-middle;
                font-weight: 600;
                line-height: vh(16);
            }

            .feedback-upload {
                :deep(.ivu-upload-list-picture-card) {
                    .ivu-upload-list-item {
                        width: vw(100);
                        height: vw(100);
                        border-radius: 0;
                    }
                }

                :deep(.ivu-upload-select) {
                    width: vw(100);
                    height: vw(100);
                    background: $bg-gray;
                    border: none;
                    border-radius: 0;

                    .upload-trigger {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                    }
                }
            }

            .upload-tip {
                font-size: vw(14);
                color: $font-middle;
                margin-top: vh(20);
                line-height: vh(14);
            }
        }

        .feedback-submit {
            :deep(.ivu-btn) {
                background: linear-gradient(90deg, $theme-color 0%, $theme-color 100%);
                border: none;
                border-radius: vw(2);
                padding: vh(10) vw(20);
                font-size: vw(12);
                font-weight: 500;
                color: $white;
                height: vh(32);
                box-shadow: none;
                outline: none;

                span {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: vw(8);
                    line-height: 1;
                }
            }
        }
    }
}
</style>
