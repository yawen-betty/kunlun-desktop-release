<template>
    <div class="write-resume">
        <!-- 主内容区 -->
        <div :class="['write-content', { 'manual-mode': currentMode === 'manual' }]">
            <!-- 左侧区域 -->
            <div class="left-section">
                <!-- 左侧顶部 -->
                <div class="left-header align-between mb-10">
                    <div style="display: flex;align-items: end;">
                        <div class="title-section flex-column">
                            <SvgIcon class="ai-icon" color="#FC8719" name="icon-AI" size="30"/>
                            <p class="title">简历制作</p>
                        </div>
                        <div v-if="currentMode === 'manual'" class="resume-name flex-column pointer ml-20">
                            <span>{{ resumeName }}</span>
                            <SvgIcon class="pointer" color="#9499A4" name="icon-bianji-xian" size="14"
                                     @click="showRenameModal = true"/>
                        </div>
                    </div>
                    <div v-if="currentMode === 'ai'" class="resume-name flex-column pointer">
                        <span>{{ resumeName }}</span>
                        <SvgIcon class="pointer" color="#9499A4" name="icon-bianji-xian" size="14"
                                 @click="showRenameModal = true"/>
                    </div>
                    <div v-if="currentMode === 'manual'" class="score-wrapper flex flex-column">
                        <div class="score-text ">当前简历分数：{{ resumeScore }}</div>
                        <Poptip v-if="scoreProblems.length" class="questions-pop flex-column ml-10 mr-20"
                                placement="bottom" trigger="hover">
                            <SvgIcon class="tip" color="#FC8919" name="icon-tishi" size="14"/>
                            <template #content>
                                <ul class="problem-list">
                                    <li v-for="(problem, index) in scoreProblems" :key="index">
                                        <span class="problem-text">{{
                                                problem.isEnquiry ? '[已问询] ' : ''
                                            }}{{ problem.problem }}</span>
                                    </li>
                                </ul>
                            </template>
                        </Poptip>
                        <Loading v-if="scoreLoading"/>
                    </div>
                </div>
                <!-- 简历预览区 -->
                <ResumePreview
                    v-if="isShowTmp"
                    ref="previewRef"
                    :is-generating="isGenerating"
                    :mode="currentMode"
                    :resume-data="resumeData"
                    @update-modules="handleUpdateModules"
                    @data-change="handleDataChange"
                    @save-resume="(isShowAnimate) => saveResume(isShowAnimate)"
                />
            </div>

            <!-- 右侧区域 -->
            <div class="right-section ml-40">
                <!-- 右侧顶部 -->
                <div class="right-header align-between ">
                    <div v-if="showScoreAndMode && currentMode === 'ai'" class="score-wrapper flex flex-column">
                        <div class="score-text mr-10">当前简历分数：{{ resumeScore }}</div>
                        <Poptip v-if="scoreProblems.length" class="questions-pop flex-column mr-20" placement="bottom"
                                trigger="hover">
                            <SvgIcon class="tip" color="#FC8919" name="icon-tishi" size="14"/>
                            <template #content>
                                <ul class="problem-list">
                                    <li v-for="(problem, index) in scoreProblems" :key="index">
                                        <span class="problem-text">{{ problem.isEnquiry ? '[已问询] ' : '' }}{{
                                                problem.problem
                                            }}</span>
                                    </li>
                                </ul>
                            </template>
                        </Poptip>
                        <Loading v-if="scoreLoading"/>
                    </div>
                    <div v-else></div>
                    <div class="right-actions flex-column">
                        <!-- 保存成功状态 -->
                        <div v-if="showSaveSuccess" class="save-success-status flex-column mr-5">
                            <div ref="lottieContainer" class="lottie-icon flex"></div>
                            <span class="success-text">保存成功</span>
                        </div>
                        <Button v-if="isShowToggleBtn" class="mode-btn" type="primary" @click="handleDiagnosis">
                            <SvgIcon class="mr-5" color="#FFFFFF" name="icon-zhenduan" size="10"/>
                            <span>简历诊断</span>
                        </Button>
                        <Button v-if="isShowToggleBtn" class="mode-btn" type="primary" @click="handleToggleMode">
                            <SvgIcon class="mr-5" color="#FFFFFF" name="icon-qiehuan" size="10"/>
                            <span>{{ currentMode === 'ai' ? '人工' : 'AI' }}撰写</span>
                        </Button>
                        <Dropdown placement="bottom-end" trigger="click">
                            <div class="more-btn flex-center">
                                <SvgIcon class="mr-5" color="#FFFFFF" name="icon-gengduo" size="10"/>
                                <span>更多</span>
                            </div>
                            <template #list>
                                <DropdownMenu class="more-dropdown-menu">
                                    <DropdownItem v-if="isShowToggleBtn" @click="handleSave">
                                        <div class="dropdown-item-content flex-column">
                                            <SvgIcon name="icon-baocun" size="12"/>
                                            <span>保存(ctrl+s)</span>
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem v-if="isShowToggleBtn" @click="handleDownload">
                                        <div class="dropdown-item-content flex-column">
                                            <SvgIcon name="icon-xiazai" size="12"/>
                                            <span>下载</span>
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem @click="handleExit">
                                        <div class="dropdown-item-content flex-column">
                                            <SvgIcon name="icon-tuichu-mian" size="12"/>
                                            <span>退出</span>
                                        </div>
                                    </DropdownItem>
                                </DropdownMenu>
                            </template>
                        </Dropdown>
                    </div>
                </div>
                <!-- 聊天区 -->
                <Transition name="slide-right">
                    <ResumeChat v-if="currentMode === 'ai' && isShowChat" ref="resumeChatRef" :changeMode="changeMode"
                                :hasAttachment="uploadedFile" :over="over" :resumeUuid="resumeId"
                                :streamWrite="handleWriteStream" :updateCache="updateCache" @exit="handleResumeDeleted"
                                @listFinish="listFinish" @sendDiagnose="sendDiagnose" @sendTemplate="sendTemplate"/>
                </Transition>
            </div>
        </div>

        <!-- 下载弹窗 -->
        <DownloadModal
            v-model="showDownloadModal"
            :resume-data="resumeData"
        />

        <!-- 重命名弹框 -->
        <Modal
            v-model="showRenameModal"
            :closable="true"
            :footer-hide="true"
            :mask-closable="false"
            class-name="custom-module-modal"
            @on-cancel="showRenameModal = false">
            <div class="custom-modal-content">
                <div class="modal-header">
                    <span class="modal-title">重命名简历</span>
                </div>
                <Form ref="formRef" :model="formData" :rules="rules">
                    <FormItem prop="resumeName">
                        <div class="input-wrapper">
                            <Input
                                v-model="formData.resumeName"
                                :maxlength="20"
                                placeholder="请输入"
                                show-word-limit
                            />
                        </div>
                    </FormItem>
                </Form>
                <div class="modal-footer">
                    <button class="btn-cancel" @click="showRenameModal = false">取消</button>
                    <button class="btn-confirm" @click="handleConfirm">确定</button>
                </div>
            </div>
        </Modal>

        <ModelUsageExhaustedModal v-model="usageExhaustedModalVisible"/>

        <!-- 模式切换确认弹框 -->
        <PromptDialog
            ref="promptDialogRef"
            :confirm="confirmModeSwitch"
            content="点击则视为结束AI撰写模式，确认是否切换？"
        />

        <!-- ai诊断  -->
        <ResumeAiDiagnosis ref="aiDiagnosisRef" @submit="getDiagnosisRes"/>
    </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, reactive, ref, watch} from 'vue';
import lottie from 'lottie-web';
import successAnimation from '@/assets/json/对号.json';
import {debounce} from '@/utiles/debounce';
import {
    Button,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Form,
    FormItem,
    Input,
    Message,
    Modal,
    Poptip
} from 'view-ui-plus';
import ResumePreview from './ResumePreview.vue';
import ResumeChat from './ResumeChat.vue';
import DownloadModal from './DownloadModal.vue';
import SvgIcon from "@/components/svgIcon/index.vue";
import {useCompRef} from "@/hooks/useComponent";
import {ResumeService} from "@/service/ResumeService";
import {GetResumeDetailInDto} from "@/api/resume/dto/GetResumeDetail";
import {SaveResumeInDto} from "@/api/resume/dto/SaveResume";
import {RenameResumeInDto} from "@/api/resume/dto/RenameResume";
import Loading from '@/components/loading/index.vue'
import ModelUsageExhaustedModal from "@/views/resume/components/ModelUsageExhaustedModal.vue";
import {QuestionBean} from "@/api/ai/dto/bean/QuestionBean.ts";
import {StreamItem} from "@/views/resume/components/ResumePreview.vue";
import PromptDialog from '@/components/promptDialog/index.vue'
import {message} from "@/utiles/Message.ts";
import ResumeAiDiagnosis from "@/views/resume/components/ResumeAiDiagnosis.vue";
import {UserInfo} from "@/utiles/userInfo.ts";

const props = defineProps<{
    resumeId: string;
    resumeName?: string;
    uploadedFile?: File | null;
    initialMode?: 'ai' | 'manual';
}>();

const emit = defineEmits<{
    'back-to-make': [];
    'resume-deleted': [];
}>();

const resumeData = ref<any>({modules: []});
const previewRef = useCompRef(ResumePreview);
const resumeChatRef = useCompRef(ResumeChat)
const promptDialogRef = useCompRef(PromptDialog)
const aiDiagnosisRef = useCompRef(ResumeAiDiagnosis)
// 左侧简历的loading状态
const isGenerating = ref(true);
// 重命名弹框 visible
const showRenameModal = ref(false);
const resumeName = ref('');
// 是否显示分数
const showScoreAndMode = ref(false);
// 当前模式
const currentMode = ref<'ai' | 'manual'>(props.initialMode || 'ai');
// 简历分数
const resumeScore = ref<number>();
// 待优化问题列表
const scoreProblems = ref<QuestionBean[]>([]);
const resumeService = new ResumeService();
// 保存成功状态
const showSaveSuccess = ref(false);
const lottieContainer = ref<HTMLElement>();
let lottieInstance: any = null;
let hideTimer: number | null = null;
const showDownloadModal = ref(false);
// 显示score分数
const scoreLoading = ref(false)
// 模型次数用完弹窗
const usageExhaustedModalVisible = ref(false)
// 控制是否显示右侧聊天区
const isShowChat = ref(true)
const isShowTmp = ref(true)
// 重命名弹框表单数据
const formData = reactive({
    resumeName: ''
})
// 是否开启自动保存
const autoSave = ref(!props.uploadedFile);
const formRef = ref<any>()
const rules = computed(() => ({
    resumeName: [
        {
            required: true,
            message: '请输入简历名称',
            trigger: 'blur'
        },
        {
            validator: (rule: any, value: string, callback: any) => {
                if (!value || !value.trim()) {
                    callback(new Error('不能为空'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
}));
// 是否显示切换人工按钮
const isShowToggleBtn = ref(false);

// 监听弹框打开，初始化临时名称
watch(showRenameModal, (val) => {
    if (val) formData.resumeName = resumeName.value;
});

watch(
    () => props.initialMode,
    (val) => {
        if (val === 'manual') {
            currentMode.value = val;
            isShowToggleBtn.value = true
            isGenerating.value = false
        }
    }
)

onMounted(async () => {
    if (!props.resumeId) {
        message.error(Message, '简历ID不存在');
        return;
    }
    // 从简历制作页面进入
    if (props.resumeName) {
        resumeName.value = props.resumeName;
    } else {
        // 从个人中心简历中点击进入
        await fetchResumeDetail(props.resumeId);
    }
    startAutoSave();
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    stopAutoSave();
    window.removeEventListener('keydown', handleKeyDown);
});

const handleResumeDeleted = () => {
    emit('resume-deleted')
}

const handleWriteStream = async (items: StreamItem[], speed?: number) => {
    console.log(items, speed, 'speed')
    await previewRef.value?.streamWrite(items, speed);
    isShowToggleBtn.value = true
}

/**
 * 检查模板是否有变化
 */
const checkChanges = () => {
    if (!UserInfo.info.resumeMap[props.resumeId]) return true
    return UserInfo.info.resumeMap[props.resumeId].template !== JSON.stringify(resumeData.value.modules)
}

const handleDiagnosis = () => {
    const isChanged = checkChanges();
    if (currentMode.value === 'manual') {
        // 人工模式，检查是否有变化
        if (isChanged) {
            aiDiagnosisRef.value?.open(props.resumeId)
        } else {
            message.warning(Message, '简历未变更，无需诊断！')
        }
    } else {
        // ai模式
        if (resumeChatRef.value?.isWorking) return message.warning(Message, 'Ai正在工作，请稍后再试！')
        if (isChanged) {
            resumeChatRef.value?.diagnoseResume()
        } else {
            message.warning(Message, '简历未变更，无需诊断！')
        }
    }
}

// 手动诊断完成后，更新并缓存分数和问题
const getDiagnosisRes = (res: string) => {
    sendDiagnose(res)
    updateCache(res)
}

/**
 * 更新缓存
 * @param trick 诊断接口返回值
 */
const updateCache = (trick: string) => {
    UserInfo.info.resumeMap[props.resumeId] = {
        trick,
        template: JSON.stringify(resumeData.value.modules)
    }
}

/**
 * 结束AI撰写，
 */
const changeMode = () => {
    currentMode.value = 'manual';
}

/**
 * ai次数用完，切换成人工模式，打开弹窗
 */
const over = (isOpenModal: boolean = true) => {
    currentMode.value = 'manual';
    isOpenModal && (usageExhaustedModalVisible.value = true)
    isGenerating.value = false
    isShowToggleBtn.value = true
}

/**
 * 更新简历分数
 * @param params
 */
const sendDiagnose = (params: string) => {
    try {
        const paramsObj = JSON.parse(params) as { score: number; issues: QuestionBean[] };
        scoreLoading.value = true;
        setTimeout(() => {
            scoreLoading.value = false;
        }, 2000)
        showScoreAndMode.value = true
        resumeScore.value = paramsObj.score;
        scoreProblems.value = [...paramsObj.issues]
    } catch (e) {
        console.log('简历分数更新失败')
    }
}

/**
 * 获取简历详情
 * @param resumeId
 */
const fetchResumeDetail = async (resumeId: string) => {
    try {
        const params = new GetResumeDetailInDto();
        params.resumeId = resumeId;

        const result = await resumeService.getResumeDetail(params);
        if (result.code === 200 && result.data) {
            resumeData.value = result.data;
            resumeName.value = result.data.name || '我的简历-未命名1';
            resumeScore.value = result.data.score!;
            console.log(resumeScore.value, '分数')
        } else {
            message.error(Message, result.msg || '获取简历详情失败');
        }
    } catch (error) {
        message.error(Message, '获取简历详情失败');
        console.error(error);
    } finally {
    }
};

let autoSaveTimer: number | null = null;

// 自动保存
const startAutoSave = () => {
    autoSaveTimer = window.setInterval(() => {
        if (autoSave.value) saveResume();
    }, 120000);
};

const stopAutoSave = () => {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
};

// 快捷键保存
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
    }
};

// 确认重命名
const handleConfirm = async () => {
    formRef.value.validate(async (valid: boolean) => {
        if (!valid) {
            message.warning(Message, '请完善必填项！');
            return;
        }
        const params = new RenameResumeInDto();
        params.resumeId = props.resumeId || '';
        params.name = formData.resumeName;

        await resumeService.renameResume(params);
        resumeName.value = formData.resumeName;
        showRenameModal.value = false;
        message.success(Message, '重命名成功');
        fetchResumeDetail(props.resumeId)

    });
};

// 保存操作
const saveResume = async (isShowAnimate: boolean = true) => {
    const params = new SaveResumeInDto();
    params.resumeId = props.resumeId;
    params.modules = resumeData.value.modules;

    await resumeService.saveResume(params);
    isShowAnimate && showSaveSuccessAnimation();
};

const showSaveSuccessAnimation = async () => {
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }

    if (lottieInstance) {
        lottieInstance.destroy();
        lottieInstance = null;
    }

    showSaveSuccess.value = true;
    await nextTick();

    if (lottieContainer.value) {
        lottieContainer.value.innerHTML = '';
        lottieInstance = lottie.loadAnimation({
            container: lottieContainer.value,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: successAnimation
        });

        lottieInstance.addEventListener('complete', () => {
            hideTimer = window.setTimeout(() => {
                showSaveSuccess.value = false;
                if (lottieInstance) {
                    lottieInstance.destroy();
                    lottieInstance = null;
                }
                hideTimer = null;
            }, 1000);
        });
    }
};

const isEditing = computed(() => {
    const preview = previewRef.value;
    if (!preview) return false;
    return preview.isEditingBasicInfo || !!preview.editingEntryUuid || !!preview.editingModuleUuid;
});

// 手动保存
const handleSave = debounce(async () => {
    if (isEditing.value) {
        message.warning(Message, '当前处于编辑中,请保存后再操作!');
        return;
    }
    await saveResume();
}, 300);

const handleDownload = debounce(() => {
    if (isEditing.value) {
        message.warning(Message, '当前处于编辑中,请保存后再操作!');
        return;
    }
    showDownloadModal.value = true;
}, 300);

const handleExit = debounce(async () => {
    if (isEditing.value) {
        message.warning(Message, '当前处于编辑中,请保存后再操作!');
        return;
    }
    if (!isGenerating.value) {
        await saveResume()
    }
    emit('back-to-make');
}, 300);

const handleToggleMode = debounce(() => {
    if (previewRef.value?.isStreaming) {
        message.warning(Message, 'AI正在撰写中，请稍后！');
        return;
    }
    if (currentMode.value === 'ai') {
        promptDialogRef.value?.open();
    } else {
        resetEditingState();
        currentMode.value = 'ai';
        showScoreAndMode.value = true
        isShowChat.value = true
    }
}, 300);

const resetEditingState = () => {
    if (previewRef.value) {
        previewRef.value.isEditingBasicInfo = false;
        previewRef.value.editingEntryUuid = '';
        previewRef.value.editingModuleUuid = '';
    }
};

/**
 * 人工切换ai的回调
 */
const listFinish = () => {
    // 对比简历模板是否有变化
    const isChanged = checkChanges()
    if (isChanged) {
        resumeChatRef.value?.diagnoseResume()
    } else {
        resumeChatRef.value?.sendLastDiagnose(scoreProblems.value)
    }
}

// 第一步传递的模板数据
const sendTemplate = (templateData: string, type: string) => {
    if (templateData) resumeData.value = JSON.parse(templateData)
    // 如果没有简历附件，就展示更多的按钮
    if (!props.uploadedFile) {
        isShowToggleBtn.value = true
        isGenerating.value = false;
    }
    if (type === 'attachmentStream') {
        isGenerating.value = false;
        // 开启自动保存
        autoSave.value = true
    }
}

// 确认切换模式
const confirmModeSwitch = () => {
    currentMode.value = 'manual';
};

// 数据变更处理
const handleDataChange = (updatedData: any) => {
    resumeData.value = updatedData;
};

// 更新模块顺序
const handleUpdateModules = async () => {
    if (!resumeData.value?.uuid) return;
    await fetchResumeDetail(resumeData.value.uuid);
};

/**
 * 切换新的简历ID进入并且当前组件存在不会走 onMounted 时（keepAlive）
 */
const reset = () => {
    fetchResumeDetail(props.resumeId);
    isShowChat.value = false;
    isShowTmp.value = false;
    currentMode.value = 'manual'
    nextTick(() => {
        isShowTmp.value = true
    })
}

defineExpose({reset})
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.write-resume {
    width: 100%;
    height: 100%;
    background-color: $bg-gray;
}

.write-content {
    display: flex;
    flex: 1;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.left-section {
    width: vw(1000);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;

    .manual-mode & {
        transform: translateX(vw(260));
    }
}

.left-header {
    padding-top: vh(12);
    align-items: end;
}

.right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

// 聊天区滑动动画
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-right-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.slide-right-enter-to {
    transform: translateX(0);
    opacity: 1;
}

.slide-right-leave-from {
    transform: translateX(0);
    opacity: 1;
}

.slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.title-section {
    color: $font-dark;
    font-family: 'YouSheBiaoTiHei';
    font-size: vw(28);
    font-style: normal;
    line-height: normal; /* 131.579% */

    .ai-icon {
        margin-right: vw(3);
    }

    svg {
        width: vw(40) !important;
        height: vh(30) !important;
    }
}


.resume-name {
    gap: vw(10);
    cursor: pointer;

    span {
        font-family: 'PingFangSCBold', sans-serif;
        font-weight: 600;
        font-size: vw(16);
        color: $font-middle;
    }

    .pointer {
        width: vw(14) !important;
        height: vw(14) !important;
    }
}

.right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &.hidden {
        opacity: 0;
        transform: translateX(100%);
        pointer-events: none;
    }
}

.right-header {
    align-items: end;
    padding-top: vh(18);
    margin-bottom: vh(11);
}

.score-wrapper {
    height: vh(24);
}

.score-text {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.questions-pop {
    height: 100%;

    .tip {
        width: vw(14) !important;
        height: vw(14) !important;
        min-width: 12px !important;
        min-height: 12px !important;
    }
}

:deep(.ivu-poptip) {
    position: relative;

    .ivu-poptip-rel {
        display: flex;
    }

    .ivu-poptip-popper {
        top: vh(20) !important;

        .ivu-poptip-arrow {
            border-bottom-color: rgba(70, 76, 91, 0.9);

            &::after {
                border-bottom-color: rgba(70, 76, 91, 0.9);
            }
        }

        .ivu-poptip-inner {
            background-color: rgba(70, 76, 91, 0.9);
            border-radius: vw(4);
        }

        .ivu-poptip-body {
            width: vw(500) !important;
            padding: vh(10) vw(14);
            overflow: visible;
        }

        .ivu-poptip-inner {
            overflow: visible;
        }

        .ivu-poptip-body-content {
            &::-webkit-scrollbar {
                display: none;
            }

            .problem-list {
                margin: 0;
                max-height: vh(140);
                padding-left: vw(21);

                li {
                    font-family: 'PingFangSCBold', sans-serif;
                    font-size: vw(14);
                    line-height: vh(20);
                    color: $white;
                    margin-bottom: 0;
                    display: list-item;
                    list-style: disc;
                    list-style-position: outside;

                    .problem-text {
                        display: block;
                        width: 100%;
                        white-space: break-spaces;
                    }
                }
            }
        }
    }
}

.right-actions {
    gap: vw(10);
}

.mode-btn {
    padding: vh(10) vw(20);
    height: vh(32);
    border-radius: vw(2);
    background: $theme-color;
    border: none;
    outline: none;
    box-shadow: none;

    :deep(> span) {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: vw(6);
        font-family: 'PingFangSCBold', sans-serif;

        span {
            font-weight: 600;
            font-size: vw(12);
            line-height: vh(12);
            color: $white;
        }
    }
}

.more-btn {
    gap: vw(6);
    width: vw(80);
    height: vh(32);
    background: linear-gradient(90deg, $theme-color 0%, $theme-color 100%);
    border: none;
    border-radius: vw(2);
    cursor: pointer;

    span {
        font-family: 'PingFangSCBold', sans-serif;
        font-weight: 600;
        font-size: vw(12);
        line-height: vh(12);
        color: $white;
    }
}

.more-dropdown-menu {
    width: vw(180);
}

.dropdown-item-content {
    gap: vw(10);
    color: $font-dark;
    font-size: vw(14);
}

.save-success-status {
    gap: vw(10);

    .lottie-icon {
        width: vw(15);
        height: vw(15);
    }

    .success-text {
        font-family: 'PingFangSCBold', sans-serif;
        font-weight: 600;
        font-size: vw(16);
        line-height: vh(16);
        color: $font-light;
        white-space: nowrap;
    }
}
</style>
