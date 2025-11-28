<template>
    <div class="feedback">
        <div class="feedback-header">
            <h1 class="feedback-title">问题反馈</h1>
            <span class="feedback-reply" @click="handleViewReply">查看回复</span>
        </div>

        <Form ref="formRef" :model="formData" :rules="rules" class="feedback-form" label-position="top">
            <FormItem label="标题" prop="title" class="feedback-input">
                <Input v-model="formData.title" placeholder="请输入" :maxlength="20" clearable></Input>
            </FormItem>
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
                <div class="upload-container">
                    <div class="upload-image" v-for="(item, index) in fileList" :key="index">
                        <Image :src="`${Config.baseUrl}${item}`" alt="上传图片" class="upload-img" fit="contain" />
                        <div class="remove-icon" @click="removeImage(index)">
                            <SvgIcon name="icon-cha" size="6" color="#fff" />
                        </div>
                    </div>
                    <Upload :before-upload="beforeUpload" :show-upload-list="false" class="feedback-upload" v-if="fileList.length < 3">
                        <div class="upload-trigger">
                            <SvgIcon color="#9499A4" name="icon-xinzeng" size="20" />
                        </div>
                    </Upload>
                </div>
                <div class="upload-tip">最多上传3张，支持JPG、JPEG、PNG格式</div>
            </FormItem>
            <div class="feedback-submit">
                <Button type="primary" @click="handleSubmit">
                    <SvgIcon name="icon-shangchuan" size="12" />
                    提交
                </Button>
            </div>
        </Form>

        <FeedbackReplyModal v-model="showReplyModal" />
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue';
import {Image, Message} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import FeedbackReplyModal from '../feedback/FeedbackReplyModal.vue';
import {FileService} from '@/service/FileService.ts';
import {AdminService} from '@/service/AdminService.ts';
import {AddFeedbackInDto} from '@/api/admin/dto/AddFeedback.ts';
import {GetHelpCenterInDto} from '@/api/admin/dto/GetHelpCenter.ts';
import {message} from '@/utiles/Message.ts';
import {Config} from '@/Config.ts';

// ==================== 服务实例 ====================
const formRef = ref();
const fileService = new FileService();
const adminService = new AdminService();

// ==================== 响应式数据 ====================
/** 表单数据 */
const formData = reactive({
    title: '',
    description: ''
});

/** 上传的图片列表（最多3张） */
const fileList = ref<string[]>([]);

/** 帮助中心内容 */
const helpContent = ref<string>('');

/** 是否显示回复弹窗 */
const showReplyModal = ref(false);

/** 表单验证规则 */
const rules = {
    title: [{required: true, message: '请输入问题标题', trigger: 'blur'}],
    description: [{required: true, message: '请输入问题描述', trigger: 'blur'}]
};

// ==================== 图片上传相关 ====================
/**
 * 上传文件到服务器
 * @param file - 要上传的文件
 */
const handleUploadFile = async (file: File) => {
    const res = await fileService.upload(file);
    const filePath = res.data.filePath;
    fileList.value.push(filePath);
};

/**
 * 上传前的校验
 * @param file - 要上传的文件
 * @returns false - 阻止默认上传行为
 */
const beforeUpload = (file: File) => {
    // 校验数量限制
    if (fileList.value.length >= 3) {
        Message.error('最多只能上传3张图片');
        return false;
    }

    // 校验文件类型
    const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    if (!isValidType) {
        Message.error('只支持JPG、JPEG、PNG格式');
        return false;
    }

    handleUploadFile(file);
    return false;
};

/**
 * 删除图片
 * @param index - 图片索引
 */
const removeImage = (index: number) => {
    fileList.value.splice(index, 1);
};

// ==================== 表单提交 ====================
/**
 * 提交问题反馈
 */
const handleSubmit = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (!valid) return;

        const params: AddFeedbackInDto = {
            title: formData.title,
            problem: formData.description,
            problemImages: fileList.value.length > 0 ? fileList.value : undefined
        };

        const res = await adminService.addFeedback(params);
        if (res.code === 200) {
            message.success(Message, '提交成功');
            // 清空表单
            formData.title = '';
            formData.description = '';
            fileList.value = [];
        }
    });
};

// ==================== 弹窗相关 ====================
/**
 * 打开查看回复弹窗
 */
const handleViewReply = () => {
    showReplyModal.value = true;
};

// ==================== 数据初始化 ====================
/**
 * 获取帮助中心内容
 */
const getHelpCenter = async () => {
    const res = await adminService.getHelpCenter(new GetHelpCenterInDto());
    if (res.code === 200) {
        helpContent.value = res.data.content;
    }
};

// 组件挂载时获取帮助中心内容
onMounted(() => {
    getHelpCenter();
});
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
        .feedback-input {
            width: vw(400);
        }
        .feedback-item {
            width: vw(800);
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
            margin-bottom: vh(60);

            :deep(.ivu-form-item-label) {
                font-size: vw(16);
                color: $font-middle;
                font-weight: 600;
                line-height: vh(16);
            }

            .upload-container {
                display: flex;
                gap: vw(20);
                flex-wrap: wrap;
            }

            .upload-image {
                position: relative;
                width: vw(100);
                height: vw(100);
                background: $bg-gray;
                border-radius: 0;
                overflow: visible;

                .upload-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .remove-icon {
                    position: absolute;
                    top: vw(-3);
                    right: vw(-3);
                    width: vw(12);
                    height: vw(12);
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;

                    &:hover {
                        background: rgba(0, 0, 0, 0.7);
                    }
                }
            }

            .feedback-upload {
                :deep(.ivu-upload) {
                    width: vw(100);
                    height: vw(100);
                }

                .upload-trigger {
                    width: vw(100);
                    height: vw(100);
                    background: $bg-gray;
                    border: none;
                    border-radius: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
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
