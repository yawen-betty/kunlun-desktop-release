<template>
    <div class="write-resume">
        <!-- 主内容区 -->
        <div :class="['content', { 'manual-mode': currentMode === 'manual' }]">
            <!-- 左侧区域 -->
            <div class="left-section">
                <!-- 左侧顶部 -->
                <div class="left-header mb-20">
                    <div class="title-section">
                        <SvgIcon class="ai-icon" name="icon-AI" size="30"/>
                        <p class="title">简历制作</p>
                    </div>
                    <div class="resume-name">
                        <span>{{ resumeName }}</span>
                        <SvgIcon class="pointer" color="#9499A4" name="icon-bianji-xian" size="14"
                                 @click="showRenameModal = true"/>
                    </div>
                </div>
                <!-- 简历预览区 -->
                <ResumePreview
                    ref="previewRef"
                    :is-generating="isGenerating"
                    :mode="currentMode"
                    :resume-data="resumeData"
                    @manual-add="handleManualAdd"
                    @module-manage="handleModuleManage"
                    @section-manage="handleSectionManage"
                    @section-edit="handleSectionEdit"
                    @add-entry="handleAddEntry"
                    @update-modules="handleUpdateModules"
                    @data-change="handleDataChange"
                />
            </div>

            <!-- 右侧区域 -->
            <div class="right-section ml-40">
                <!-- 右侧顶部 -->
                <div class="right-header mb-20">
                    <div v-if="showScoreAndMode && currentMode === 'ai'" class="score-wrapper flex flex-column">
                        <div class="score-text">当前简历分数：{{ resumeScore }}</div>
                        <Poptip class="questions-pop" placement="bottom" trigger="hover">
                            <SvgIcon class="tip" color="#FC8919" name="icon-tishi"/>
                            <template #content>
                                <ul class="problem-list">
                                    <li v-for="(problem, index) in scoreProblems" :key="index">
                                        <span :title="problem.length > 20 ? problem : ''"
                                              class="problem-text">{{ problem }}</span>
                                    </li>
                                </ul>
                            </template>
                        </Poptip>
                    </div>
                    <div v-else></div>
                    <div class="right-actions">
                        <Button v-if="showScoreAndMode" class="mode-btn" type="primary" @click="toggleMode">
                            <SvgIcon class="mr-5" color="#FFFFFF" name="icon-qiehuan" size="10"/>
                            <span>{{ currentMode === 'ai' ? '人工' : 'AI' }}撰写</span>
                        </Button>
                        <Dropdown placement="bottom-end" trigger="click">
                            <div class="more-btn">
                                <SvgIcon class="mr-5" color="#FFFFFF" name="icon-gengduo" size="10"/>
                                <span>更多</span>
                            </div>
                            <template #list>
                                <DropdownMenu class="more-dropdown-menu">
                                    <DropdownItem @click="handleSave">
                                        <div class="dropdown-item-content">
                                            <SvgIcon name="icon-baocun" size="12"/>
                                            <span>保存(ctrl+s)</span>
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem @click="handleDownload">
                                        <div class="dropdown-item-content">
                                            <SvgIcon name="icon-xiazai" size="12"/>
                                            <span>下载</span>
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem @click="handleExit">
                                        <div class="dropdown-item-content">
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
                    <ResumeChat v-if="currentMode === 'ai'"/>
                </Transition>
            </div>
        </div>

        <!-- 模式切换确认弹框 -->
        <Modal
            v-model="showModeConfirmModal"
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
                    <p>点击则视为结束AI撰写模式，确认是否切换？</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" @click="showModeConfirmModal = false">取消</button>
                    <button class="btn-confirm" @click="confirmModeSwitch">确定</button>
                </div>
            </div>
        </Modal>

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
    </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, reactive, ref, watch} from 'vue';
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
import SvgIcon from "@/components/svgIcon/index.vue";
import {useCompRef} from "@/hooks/useComponent";
import {ResumeService} from "@/service/ResumeService";
import {GetResumeDetailInDto} from "@/api/resume/dto/GetResumeDetail";
import {SaveResumeInDto} from "@/api/resume/dto/SaveResume";

const props = defineProps<{
    resumeId?: string;
    resumeName?: string;
    uploadedFile?: File | null;
}>();

const resumeData = ref<any>({modules: []});

const previewRef = useCompRef(ResumePreview);
const isGenerating = ref(false);

// 重命名弹框 visible
const showRenameModal = ref(false);
const showModeConfirmModal = ref(false);
const resumeName = ref('我的简历-未命名1');
const showScoreAndMode = ref(false);
const currentMode = ref<'ai' | 'manual'>('ai');
const resumeScore = ref(15);
const scoreProblems = ref<string[]>([
    '问题一问题一问题一问题一问题一问题一问题一问题一问题一问题一问题一',
    '问题二',
    '问题三',
    '问题四',
    '问题五',
    '问题六',
    '问题七'
]);
const resumeService = new ResumeService();

const isProblemOverflow = (text: string) => {
    return text.length > 20;
};
const formData = reactive({
    resumeName: ''
})
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
// 监听弹框打开，初始化临时名称
watch(showRenameModal, (val) => {
    if (val) formData.resumeName = resumeName.value;
});

const fetchResumeDetail = async (resumeId: string) => {
    isGenerating.value = true;
    try {
        const resumeService = ResumeService.getInstance();
        const params = new GetResumeDetailInDto();
        params.resumeId = resumeId;

        const result = await resumeService.getResumeDetail(params);
        if (result.code === 200 && result.data) {
            resumeData.value = result.data;
            resumeName.value = result.data.name || '我的简历-未命名1';
            toggleScoreDisplay(true);
        } else {
            Message.error(result.msg || '获取简历详情失败');
        }
    } catch (error) {
        Message.error('获取简历详情失败');
        console.error(error);
    } finally {
        isGenerating.value = false;
    }
};

onMounted(async () => {
    const id = props.resumeId || '34470ebfe1694816ad5e2efe27ae3504';
    if (!id) {
        Message.error('简历ID不存在');
        return;
    }
    if (props.resumeName) {
        resumeName.value = props.resumeName;
    }
    await fetchResumeDetail(id);
});


// 确认重命名
const handleConfirm = () => {
    formRef.value.validate((valid: boolean) => {
        if (!valid) {
            Message.warning('请完善必填项！');
            return;
        }
        resumeName.value = formData.resumeName;
        showRenameModal.value = false;
    });
};

// 更多菜单操作
const handleSave = async () => {
    try {
        const params = new SaveResumeInDto();
        params.resumeId = resumeData.value.uuid || '';
        params.modules = resumeData.value.modules;

        await resumeService.saveResume(params);
        Message.success('保存成功');
    } catch (error) {
        Message.error('保存失败');
        console.error(error);
    }
};

const handleDownload = () => {
    console.log('下载');
    Message.info('开始下载');
};

const handleExit = () => {
    console.log('退出');
};

const toggleMode = debounce(() => {
    if (previewRef.value?.isStreaming) {
        Message.warning('AI正在撰写中，请稍后！');
        return;
    }
    if (currentMode.value === 'ai') {
        showModeConfirmModal.value = true;
    } else {
        currentMode.value = 'ai';
    }
}, 300);

// 确认切换模式
const confirmModeSwitch = () => {
    currentMode.value = 'manual';
    showModeConfirmModal.value = false;
};

// 控制分数和模式显示
const toggleScoreDisplay = (show: boolean) => {
    showScoreAndMode.value = show;
};

// 手动添加处理
const handleManualAdd = () => {
    console.log('点击了手动添加');
    Message.info('手动添加功能待实现');
};

// 模块管理
const handleModuleManage = () => {
    console.log('点击了模块管理');
    Message.info('模块管理功能待实现');
};

// 模块管理按钮
const handleSectionManage = (uuid: string) => {
    console.log('点击了模块管理按钮', uuid);
    Message.info('模块管理功能待实现');
};

// 模块编辑按钮
const handleSectionEdit = (uuid: string) => {
    console.log('点击了模块编辑按钮', uuid);
    Message.info('模块编辑功能待实现');
};

// 增加新的经历
const handleAddEntry = (moduleKey: string) => {
    console.log('点击了增加新的经历', moduleKey);
    Message.info('增加新的经历功能待实现');
};

// 数据变更处理
const handleDataChange = (updatedData: any) => {
    resumeData.value = updatedData;
    console.log('简历数据已更新', resumeData.value);
    // 这里可以添加其他逻辑，例如：标记为未保存状态
};

// 更新模块顺序
const handleUpdateModules = async () => {
    if (!resumeData.value?.uuid) return;
    await fetchResumeDetail(resumeData.value.uuid);
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.write-resume {
    width: 100%;
    height: 100%;
    background-color: $bg-gray;
}

.content {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: 100%;
    position: relative;
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
    display: flex;
    align-items: end;
    justify-content: space-between;
    padding-top: vh(11);
}

.right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
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
    display: flex;
    align-items: center;
    gap: vw(4);

    :deep(.ai-icon) {
        width: vw(40) !important;
        height: vh(30) !important;
        margin-top: -1px;

        > use {
            fill: $theme-color;
        }
    }

    .title {
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-size: vw(28);
        line-height: vh(28);
        font-weight: 400;
        color: $font-dark;
        margin: 0;
    }
}


.resume-name {
    display: flex;
    align-items: center;
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
    display: flex;
    justify-content: space-between;
    align-items: end;
    padding-top: vh(8);
}

.score-wrapper {
    height: vh(27);
    gap: vw(5);
}

.score-text {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    line-height: vh(16);
    background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.questions-pop {
    height: vw(14);


    .tip {
        width: vw(14) !important;
        height: vw(14) !important;
    }
}

:deep(.ivu-poptip) {
    position: relative;

    .ivu-poptip-rel {
        display: flex;
    }

    .ivu-poptip-popper {
        top: vh(14) !important;

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
            width: vw(280) !important;
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
                height: vh(140);
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
    display: flex;
    align-items: center;
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
    display: flex;
    justify-content: center;
    align-items: center;
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
    display: flex;
    align-items: center;
    gap: 10px;
    color: $font-dark;
    font-size: vw(14);
}
</style>
