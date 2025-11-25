<!-- 简历制作默认页 | 采集求职岗位丶身份 -->
<script lang="ts" setup>
import {computed, onActivated, onDeactivated, onMounted, onUnmounted, reactive, ref} from 'vue'
import {Button, Form, FormItem, Input, Message, Modal, Radio, RadioGroup, Upload} from "view-ui-plus";
import SvgIcon from "@/components/svgIcon/index.vue";
import {ResumeService} from "@/service/ResumeService";
import {debounce} from "@/utiles/debounce";
import {useRouter} from "vue-router";
import Ellipsis from '@/components/ellipsis/index.vue'
import {message} from "@/utiles/Message.ts";

const router = useRouter();
// 输入框提示词列表
const placeholderList = [
    '人工智能',
    '产品经理',
    'Java开发工程师',
    'UI设计师',
    '销售经理',
    '运营专员',
    '语文教师',
    '信贷专员',
    '会计',
    '律师'
]

const infoList = [
    '10分钟顶3小时，AI一键出简历',
    '输入经历，帮你搞定剩下的',
    '不会夸自己？把“普通经历”写得更值钱',
    '同份经历，帮你改出“适配不同岗位”的版本',
    'AI简历定制，让Offer多来几封'
]
const placeholderIdx = ref<number>(0)
const placeholderTimer = ref<number | null>(null)
const isComposing = ref(false)
const formRef = ref();
const formRules = {
    jobPosition: [{required: true, message: '请输入求职岗位！', trigger: 'submit'}],
    identity: [{type: 'number', required: true, message: '请选择身份！', trigger: 'submit'}],
}
const formData = reactive({
    jobPosition: '',
    identity: 0
})

const uploadFile = ref<{
    name: string;
    size: string;
    uploading: boolean;
    file: File;
} | null>(null);

const fileIcon = computed(() => {
    if (!uploadFile.value) return 'icon-pdf';
    const fileName = uploadFile.value.name.toLowerCase();
    if (fileName.endsWith('.pdf')) return 'icon-pdf';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'icon-word';
    return 'icon-pdf';
});

const resumeService = new ResumeService();
const showLimitModal = ref(false);
const emit = defineEmits<{
    'resume-created': [data: { resumeId: string; resumeName: string; uploadedFile: File | null }]
}>();

const submit = debounce(async () => {
    if (!formData.jobPosition.trim()) return message.error(Message, '请输入求职岗位！')
    if (!formData.identity) return message.error(Message, '请选择身份！')

    try {
        const result = await resumeService.initResume(formData);
        console.log(result, 'result')
        if (result.code === 200 && result.data) {
            message.success(Message, '简历创建成功！');
            emit('resume-created', {
                resumeId: result.data.resumeId!,
                resumeName: result.data.resumeName!,
                uploadedFile: uploadFile.value?.file || null
            });
        } else if (result.code === 2305) {
            showLimitModal.value = true;
        } else {
            message.error(Message, result.msg || '简历创建失败！');
        }
    } catch (error) {
        message.error(Message, '简历创建失败！');
        console.error(error);
    }
}, 300)

const handleUploadChange = (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
        message.error(Message, '文件格式有误，仅支持PDF、Word格式！');
        return false;
    }

    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
        message.error(Message, '文件大小不得超过1M！');
        return false;
    }

    const sizeInKB = Math.round(file.size / 1024);
    uploadFile.value = {
        name: file.name,
        size: `${sizeInKB}KB`,
        uploading: false,
        file: file
    };

    return false;
};

const handleRemoveFile = () => {
    uploadFile.value = null;
};

const handleToDelete = () => {
    showLimitModal.value = false;
    router.push('/personalInfo')
}

const startPlaceholderRotation = () => {
    if (placeholderTimer.value) return;
    placeholderTimer.value = window.setInterval(() => {
        placeholderIdx.value++;
        if (placeholderIdx.value === placeholderList.length) {
            placeholderIdx.value = 0
        }
    }, 2000)
}

const stopPlaceholderRotation = () => {
    if (placeholderTimer.value) {
        clearInterval(placeholderTimer.value)
        placeholderTimer.value = null
    }
}

const handleCompositionStart = () => {
    isComposing.value = true;
    stopPlaceholderRotation();
}

const handleCompositionEnd = () => {
    isComposing.value = false;
    if (!formData.jobPosition) {
        startPlaceholderRotation();
    }
}

const handleInputChange = () => {
    if (isComposing.value) return;

    if (formData.jobPosition) {
        stopPlaceholderRotation();
    } else {
        startPlaceholderRotation();
    }
}

onActivated(() => {
    startPlaceholderRotation()
})

onDeactivated(() => {
    stopPlaceholderRotation()
})

onMounted(() => {
    startPlaceholderRotation()
})

onUnmounted(() => {
    stopPlaceholderRotation()
})
</script>

<template>
    <div class="resume-prod-cont">
        <div class="prod-left">
            <div class="title flex-column">
                <SvgIcon class="ai-icon" color="#FC8719" name="icon-AI" size="40"/>
                <span>简历制作</span>
            </div>
            <Form ref="formRef" :model="formData" :rules="formRules" class="custom-form">
                <FormItem prop="jobPosition">
                    <Input v-model="formData.jobPosition" :max-length="20"
                           :placeholder="placeholderList[placeholderIdx]"
                           class="job-name"
                           @compositionend="handleCompositionEnd"
                           @compositionstart="handleCompositionStart"
                           @on-change="handleInputChange"/>
                </FormItem>
                <FormItem class="custom-form-item" prop="identity">
                    <RadioGroup v-model="formData.identity" class="custom-radio">
                        <Radio :label="1">职场人</Radio>
                        <Radio :label="2">在校/应届生</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem>
                    <p class="tip">已有简历，上传后帮你润色</p>
                    <Upload :before-upload="handleUploadChange" :show-upload-list="false" accept=".pdf,.doc,.docx">
                        <Button class="upload-btn">
                            <SvgIcon class="mr-5" name="icon-daoru" size="16"/>
                            上传简历
                        </Button>
                    </Upload>
                    <div v-if="uploadFile" class="file-box mt-10 pl-20 pr-15 flex-column align-between">
                        <div class="file-name flex-column">
                            <SvgIcon :name="fileIcon" class="file-icon" size="24"/>
                            <div class="file-status ml-20">
                                <Ellipsis :content="uploadFile.name" class="name"/>
                                <!--                                <p class="mb-10 name">{{ uploadFile.name }}</p>-->
                                <p class="status mt-10">
                                    {{ uploadFile.uploading ? '上传中...' : '上传完成' }}
                                    <span class="ml-5 mr-5"></span>
                                    {{ uploadFile.size }}
                                </p>
                            </div>
                        </div>
                        <SvgIcon class="close-icon pointer" color="#FC8719" name="icon-bufuhe" size="20"
                                 @click="handleRemoveFile"/>
                    </div>
                </FormItem>
            </Form>
            <div class="submit-btn" @click="submit">
                <SvgIcon class="mr-5" name="icon-bianji" size="10"/>
                立即制作
            </div>
        </div>
        <div class="prod-right">
            <div class="big-title mb-55">
                <p>别被简历难住！</p>
                <p class="plus">AI让“写简历”变简单</p>
            </div>
            <div class="info">
                <ul class="info-ul">
                    <li v-for="item in infoList" :key="item"><span>·</span>{{ item }}</li>
                </ul>
                <img alt="" src="../../../assets/images/resume.png">
            </div>
        </div>

        <!-- 简历数量达上限弹框 -->
        <Modal
            v-model="showLimitModal"
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
                    <p>简历数量已达上限，无法继续创建！</p>
                </div>
                <div class="modal-footer mb-5">
                    <div class="btn-delete pointer" @click="handleToDelete">
                        <SvgIcon color="#fff" name="icon-lajitong-mian" size="12"/>
                        <span style="margin-top: 1px">去删除</span>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-prod-cont {
    display: flex;
    height: 100%;
    padding: vh(40) 0;
    background: $white;

    .prod-left {
        width: vw(600);
        height: 100%;
        padding: vh(138) vw(120) 0 vw(80);
        border-right: vw(2) $border-default solid;

        .title {
            margin-bottom: vh(50);
            color: $font-dark;
            font-family: 'YouSheBiaoTiHei';
            font-size: vw(38);
            font-style: normal;
            line-height: vh(50); /* 131.579% */

            .ai-icon {
                margin-right: vw(14.33);
            }

            svg {
                width: vw(61) !important;
                height: vh(45) !important;
            }
        }

        .custom-form {
            width: vw(400);

            :deep(.job-name) {
                .ivu-input {
                    height: vh(50);
                    background-color: $white;
                    border: vw(1) solid $theme-color !important;
                }
            }

            .file-box {
                height: vh(70);
                padding-top: vh(16);
                padding-bottom: vh(16);
                border-radius: vw(2);
                background: $bg-gray;
                line-height: normal;

                .file-name {
                    max-width: 75%;

                    .file-status {
                        width: 100%;
                    }

                    .name {
                        color: $font-dark;
                        font-family: Inter;
                        font-size: vw(14);
                        font-weight: 500;
                    }

                    .status {
                        display: flex;
                        align-items: center;
                        color: #B0B7C6;
                        font-family: Inter;
                        font-size: vw(12);
                        font-weight: 500;

                        span {
                            width: vw(1);
                            height: vh(12);
                            background: #B0B7C6;
                        }
                    }
                }

                .close-icon, .file-icon {
                    flex-shrink: 0;
                }
            }
        }

        :deep(.custom-radio .ivu-radio-wrapper) {
            width: vw(190);
            margin-right: vw(20);

            &:last-child {
                margin-right: 0;
            }
        }

        .tip {
            margin-bottom: vh(10);
            color: $font-dark;
            font-family: "PingFangSCBold";
            font-size: vw(14);
            line-height: vh(16); /* 114.286% */
        }

        .upload-btn {
            box-shadow: none;
            width: vw(400);
            height: vh(50);
            border-radius: vw(2);
            border: vw(1.5) dashed $border-default;
            color: #9499A4;
            font-family: "PingFangSCBold";
            font-size: vw(16);
            font-weight: 600;
            line-height: vh(16); /* 100% */

            &:hover {
                color: $theme-color;
                border-color: $theme-color;
            }

            :deep(>span) {
                display: flex;
                align-items: center;
                justify-content: center;

                svg {
                    width: vw(16) !important;
                    height: vw(16) !important;
                }
            }
        }

        .submit-btn {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: vw(104);
            height: vh(32);
            padding: vh(10) vw(20);
            border-radius: vw(2);
            background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
            color: $white;
            font-family: "PingFangSCBold";
            font-size: vw(12);
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
        }
    }

    .prod-right {
        flex: 1;
        padding: vh(122) vw(91) vh(106) vw(75);

        .big-title {
            color: $font-dark;
            font-family: 'YouSheBiaoTiHei';
            font-size: vw(36);
            line-height: vh(66); /* 183.333% */

            .plus {
                font-size: vw(56);
            }
        }

        .info {
            display: flex;
            align-items: flex-end;
            height: vh(512);

            .info-ul {
                height: 100%;

                li {
                    color: #9499A4;
                    font-family: 'YouSheBiaoTiHei';
                    font-size: vw(22);
                    line-height: vh(40); /* 181.818% */

                    span {
                        margin-right: vw(5);
                    }
                }
            }

            img {
                width: vw(459);
                height: vh(375);
            }
        }
    }
}

.modal-footer {
    justify-content: center;

    .btn-delete {
        display: flex;
        height: vh(32);
        padding: 0 vw(20);
        justify-content: center;
        align-items: center;
        gap: vw(6);
        border-radius: vw(2);
        background: linear-gradient(0deg, #FC8719 0%, #FC8719 100%);
        color: $white;
        font-family: "PingFangSCBold";
        font-size: vw(12);
        font-weight: 600;

        :deep(svg) {
            width: vw(12) !important;
            height: vw(12) !important;
            margin-top: 0.5px;
        }

        span {
            line-height: normal;
        }
    }
}
</style>
