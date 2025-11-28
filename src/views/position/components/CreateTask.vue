<!-- 精选职位 制作页面 -->
<script lang="ts" setup>
import {computed, onActivated, onDeactivated, onMounted, onUnmounted, reactive, ref} from 'vue'
import {Button, Form, FormItem, Input, Message, Modal, Radio, RadioGroup, Upload, Select, Option} from "view-ui-plus";
import SvgIcon from "@/components/svgIcon/index.vue";
import {ResumeService} from "@/service/ResumeService";
import {JobService} from "@/service/JobService";
import {debounce} from "@/utiles/debounce";
import {useRouter} from "vue-router";
import Ellipsis from '@/components/ellipsis/index.vue'
import AddressSelect from "@/components/addressSelect/index.vue";
import {CreateJobTaskInDto} from "@/api/job/dto/CreateJobTask.ts";
import {GetMyResumeListInDto} from "@/api/resume/dto/GetMyResumeList.ts";
import {MyResumeBean} from "@/api/resume/dto/bean/MyResumeBean.ts";
import CustomSelect from '@/components/customSelect/index.vue'
import {message} from "@/utiles/Message.ts";
import {workExperienceList} from "@/enums/enumDict.ts";

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
    '发布求职任务，节省80%找岗时间，AI直送适配好岗',
    '求职不用扒平台！发个任务躺平等',
    'AI精准匹配，不做无效推荐',
    '匹配有分析，选岗有依据',
    '筛职位的麻烦留给AI，等offer的期待留给自己'
]

const placeholderIdx = ref<number>(0)
const placeholderTimer = ref<number | null>(null)
const isComposing = ref(false)
const formRef = ref();
const formRules = {
    jobTitle: [{required: true, message: '请输入求职岗位！', trigger: 'submit'}],
    cityInfos: [{type: 'array', min: 1, required: true, message: '请选择期望城市！', trigger: 'submit'}],
    experience: [{required: true, message: '请选择工作经验！', trigger: 'submit'}],
    resumeUuid: [{required: true, message: '请选择简历！', trigger: 'submit'}]
}
const formData = reactive<CreateJobTaskInDto>(new CreateJobTaskInDto())
const resumeList = ref<MyResumeBean[]>([])
const resumeService = new ResumeService()
const jobService = new JobService()

const emit = defineEmits<{
    'task-created': []
}>();

const submit = debounce(async () => {
    const errors = []
    if (!formData.jobTitle?.trim()) errors.push('求职岗位')
    if (!formData.cityInfos?.length) errors.push('期望城市')
    if (!formData.experience) errors.push('工作经验')
    if (!formData.resumeUuid) errors.push('简历')

    if (errors.length > 0) {
        return message.error(Message, `请完善${errors.join('、') + '！'}`)
    }

    try {
        formData.publish = true
        formData.isDefault = true
        const result = await jobService.createJobTask(formData)
        if (result.code === 200) {
            emit('task-created')
        }
    } catch (error) {
        console.error('发布求职任务失败:', error)
    }
}, 300)

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
    if (!formData.jobTitle) {
        startPlaceholderRotation();
    }
}

const handleInputChange = () => {
    if (isComposing.value) return;

    if (formData.jobTitle) {
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

onMounted(async () => {
    startPlaceholderRotation()
    await loadResumeList()
})

const loadResumeList = async () => {
    try {
        const params = new GetMyResumeListInDto()
        const result = await resumeService.getMyResumeList(params)
        if (result.code === 200 && result.data?.resumes) {
            resumeList.value = result.data.resumes
        }
    } catch (error) {
        console.error('获取简历列表失败:', error)
    }
}

onUnmounted(() => {
    stopPlaceholderRotation()
})
</script>

<template>
    <div class="resume-prod-cont">
        <div class="prod-left">
            <div class="title flex-column">
                <SvgIcon class="ai-icon" color="#FC8719" name="icon-AI" size="40"/>
                <span>发布求职任务</span>
            </div>
            <Form ref="formRef" :model="formData" :rules="formRules" class="custom-form">
                <FormItem prop="jobTitle">
                    <Input v-model="formData.jobTitle" :max-length="20"
                           :placeholder="placeholderList[placeholderIdx]"
                           class="job-name"
                           @compositionend="handleCompositionEnd"
                           @compositionstart="handleCompositionStart"
                           @on-change="handleInputChange"/>
                </FormItem>
                <FormItem prop="cityInfos">
                    <AddressSelect v-model="formData.cityInfos" is-hot-city placeholder="请选择期望城市"/>
                </FormItem>
                <FormItem prop="experience">
                    <Select v-model="formData.experience" class="custom-select" clearable
                            placeholder="请选择工作经验">
                        <Option v-for="item in workExperienceList" :key="item.value" :label="item.key"
                                :value="item.value"/>
                    </Select>
                </FormItem>
                <FormItem prop="resumeUuid">
                    <CustomSelect v-model="formData.resumeUuid"
                                  :option-list="resumeList.map(item => ({label: item.name, value: item.uuid}))"/>
                </FormItem>
            </Form>
            <div class="submit-btn" @click="submit">
                <SvgIcon class="mr-5" name="icon-huojian" size="10"/>
                立即发布
            </div>
        </div>
        <div class="prod-right">
            <div class="big-title mb-55">
                <p>不用全网扒职位！</p>
                <p class="plus">AI替你“筛好岗”！</p>
            </div>
            <div class="info">
                <ul class="info-ul">
                    <li v-for="item in infoList" :key="item"><span class="mr-5">·</span>{{ item }}</li>
                </ul>
                <img alt="" src="../../../assets/images/position.png">
            </div>
        </div>
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
        padding: vh(122) vw(84) vh(86) vw(75);

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
                    white-space: nowrap;
                }
            }

            img {
                width: vw(459);
                height: vh(375);
            }
        }
    }
}
</style>
