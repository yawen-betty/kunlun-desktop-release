<script lang="ts" setup>
import {Form, FormItem, Input} from "view-ui-plus";
import SvgIcon from "@/components/svgIcon/index.vue";
import AddressSelect from "@/components/addressSelect/index.vue";
import {reactive, ref} from "vue";

const showAddTaskModal = ref(false)
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

const workExperienceList = [
    {
        label: '在校/应届生',
        value: '0'
    },
    {
        label: '1年以下',
        value: '1'
    },
    {
        label: '1-3年',
        value: '2'
    },
    {
        label: '3-5年',
        value: '3'
    },
    {
        label: '5-10年',
        value: '4'
    },
    {
        label: '10年以上',
        value: '5'
    }
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
    areaInfoBeanList: [],
    workExperience: '',
})
const resumeList = ref([])

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

const open = () => {
    showAddTaskModal.value = true;
    startPlaceholderRotation()
}

const close = () => {
    showAddTaskModal.value = false
    stopPlaceholderRotation()
}

defineExpose({
    open
})
</script>

<template>
    <Modal v-model="showAddTaskModal" :closable="false" :footer-hide="true" :mask-closable="false"
           class-name="task-modal">
        <div class="modal-header">
            <span class="modal-title">新增求职任务</span>
            <SvgIcon class="close-icon pointer" name="icon-cha" size="16" @click="close"/>
        </div>
        <div class="modal-content">
            <div class="content-left">
                <Form ref="formRef" :model="formData" :rules="formRules" class="custom-form">
                    <FormItem prop="jobPosition">
                        <Input v-model="formData.jobPosition" :max-length="20"
                               :placeholder="placeholderList[placeholderIdx]"
                               class="job-name"
                               @compositionend="handleCompositionEnd"
                               @compositionstart="handleCompositionStart"
                               @on-change="handleInputChange"/>
                    </FormItem>
                    <FormItem prop="areaInfoBeanList">
                        <AddressSelect v-model="formData.areaInfoBeanList" is-hot-city/>
                    </FormItem>
                    <FormItem prop="workExperience">
                        <Select v-model="formData.workExperience" class="custom-select" clearable
                                placeholder="请选择工作经验">
                            <Option v-for="item in workExperienceList" :key="item.value" :label="item.label"
                                    :value="item.value"/>
                        </Select>
                    </FormItem>
                    <FormItem prop="areaInfoBeanList">
                        <Select class="custom-select" clearable placeholder="请选择简历">
                            <Option v-for="item in resumeList"/>
                        </Select>
                    </FormItem>
                </Form>
                <div class="btn-box mt-50">
                    <div class="submit-btn mr-20">
                        <SvgIcon class="mr-5" color="#fff" name="icon-baocun" size="12"/>
                        保存
                    </div>
                    <div class="submit-btn">
                        <SvgIcon class="mr-5" color="#fff" name="icon-duihao-main" size="12"/>
                        保存并应用
                    </div>
                </div>
            </div>
            <div class="content-right">
                <img alt="" src="@/assets/images/position.png">
            </div>
        </div>
    </Modal>
</template>

<style lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.task-modal {
    .ivu-modal {
        width: vw(900) !important;
    }

    .ivu-modal-content {
        border-radius: vw(2);
        box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
    }

    .ivu-modal-body {
        padding: 0;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: vh(40) vw(40) 0 vw(40);

        .modal-title {
            font-family: 'YouSheBiaoTiHei';
            font-size: vw(28);
            color: $font-dark;
            line-height: vh(28);
        }

        .close-icon {
            position: absolute;
            top: vh(18);
            right: vw(20);

            svg {
                width: vw(16) !important;
                height: vw(16) !important;
            }
        }
    }

    .modal-content {
        padding: vw(40);
        display: flex;
        align-items: end;
        column-gap: vw(70);

        .content-left {
            margin-bottom: vh(110);
        }

        .content-right {
            margin-bottom: vh(60);

            img {
                width: vw(290);
                height: vh(266);
            }
        }
    }
}
</style>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.custom-form {
    width: vw(400);

    .ivu-form-item {
        margin-bottom: vh(20);
    }

    :deep(.job-name) {
        .ivu-input {
            height: vh(50);
            background-color: $white;
            border: vw(1) solid $theme-color !important;
            font-size: vw(18);

            &::placeholder {
                font-weight: 600;
            }
        }
    }

    :deep(.custom-input) {
        height: vh(50);
        border: vw(1) solid $theme-color !important;
        background: $white !important;

        .select-content {
            height: 100%;
            line-height: vh(48);
            font-size: vw(18);
        }

        .custom-content {
            height: 100%;

            .custom-placeholder {
                font-size: vw(18);
                font-weight: 600;
                height: 100%;
                line-height: vh(48);
            }
        }
    }

    :deep(.ivu-select) {
        .ivu-select-selection {
            height: vh(50);
            border-radius: vw(2);
            border: vw(1) solid $theme-color !important;
            background: $white !important;
            padding: 0 !important;

            .ivu-select-placeholder {
                color: $placeholder-color;
                font-size: vw(18);
                line-height: vh(50);
                height: 100%;
                font-weight: 600;
            }

            .ivu-select-selected-value {
                font-size: vw(18);
                line-height: vh(50);
                height: 100%;
            }
        }
    }

    :deep(.ivu-select-dropdown) {
        border-radius: vw(2);
        box-shadow: 0 vw(2) vw(8) rgba(0, 0, 0, 0.15);
        padding: vh(10);

        .ivu-select-dropdown-list {
            display: flex;
            flex-direction: column;
            gap: vw(10);

            &::-webkit-scrollbar {
                display: none;
            }
        }

        .ivu-select-item {
            height: vh(32);
            display: flex;
            align-items: center;
            flex-shrink: 0;
            margin: 0;
            padding: 0 vw(10);
            font-size: vw(14);
            color: $font-dark;

            &:hover {
                background: $hover-color;
                padding-left: vw(26);
            }

            &.ivu-select-item-selected {
                background: $theme-color;
                color: $white;
                font-weight: normal;
                padding-left: vw(10) !important;

                &::before {
                    position: unset;
                    content: '';
                    display: block;
                    width: vw(6);
                    height: vw(6);
                    border-radius: 50%;
                    background: $white;
                    margin-right: vw(10);
                }
            }
        }
    }
}

.submit-btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
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
</style>
