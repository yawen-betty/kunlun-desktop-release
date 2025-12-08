<script lang="ts" setup>
import {reactive, ref, onMounted, computed} from 'vue';
import PositionDetail from "@/views/position/components/PositionDetail.vue";
import {useCompRef} from "@/hooks/useComponent";
import SvgIcon from "@/components/svgIcon/index.vue";
import Pagination from "@/components/pagination/index.vue";
import bossIcon from '@/assets/images/boss.png'
import zhilianIcon from '@/assets/images/zhilian.png'
import guopinIcon from '@/assets/images/guopin.png'
import CreateTaskModal from "@/views/position/components/CreateTaskModal.vue";
import PromptDialog from "@/components/promptDialog/index.vue";
import {Message, Modal} from "view-ui-plus";
import {JobService} from "@/service/JobService";
import {ResumeService} from "@/service/ResumeService";
import {GetJobTaskInDto, GetJobTaskOutDto} from "@/api/job/dto/GetJobTask";
import {GetOtherJobTasksOutDto} from "@/api/job/dto/GetOtherJobTasks";
import {ActivateJobTaskInDto} from "@/api/job/dto/ActivateJobTask";
import {channelList, workExperienceList, enumEcho} from "@/enums/enumDict.ts";
import {QueryMatchedPositionsInDto} from "@/api/job/dto/QueryMatchedPositions.ts";
import {CheckNewPositionsInDto} from "@/api/job/dto/CheckNewPositions.ts";
import {message} from "@/utiles/Message.ts";
import {executeLogin} from '@/robot/channelLogin/login.ts';
import {channelAuth} from '@/robot/channelLogin/authManage.ts';
import {onBeforeUnmount} from 'vue';
import {MatchedPositionBean} from "@/api/job/dto/bean/MatchedPositionBean.ts";
import {openWeb} from "@/utiles/openWeb.ts";
import {parseDate} from "@/utiles/DateUtils.ts";
import {robotManager} from "@/robot/service";
import {UserInfo} from "@/utiles/userInfo.ts";
import {debounce} from "@/utiles/debounce.ts";
import mitt from "mitt";
import emitter from "@/utiles/eventBus.ts";

// 创建任务弹框实例
const createTaskModalRef = useCompRef(CreateTaskModal)
// 职位详情组件实例
const positionDetailRef = useCompRef(PositionDetail)
// 二次确认弹框
const promptDialogRef = useCompRef(PromptDialog)
const jobService = new JobService()
const resumeService = new ResumeService()
const searchData = reactive<QueryMatchedPositionsInDto>({
    ...new QueryMatchedPositionsInDto(),
    sortBy: 'recommendedAt',
    sourceChannel: -1
})

const emit = defineEmits<{
    'all-tasks-deleted': []
}>()

const allList = [
    {
        value: -1,
        key: '全部渠道'
    },
    ...channelList
]
const sortList = [
    {
        label: '按推荐时间排序',
        value: 'recommendedAt'
    },
    {
        label: '按匹配度排序',
        value: 'matchScore'
    },
]

const selectedId = ref('')

const handleSelectPosition = (id: string) => {
    selectedId.value = id
    if (positionDetailRef.value) {
        positionDetailRef.value.activeTab = 'analysis'
    }
}
const showTaskDropdown = ref(false)
const emptyModalVisible = ref(false)
const currentTask = ref<GetJobTaskOutDto>()

const currentTaskId = computed(() => currentTask.value?.uuid || '')
const taskStatus = computed(() => currentTask.value?.status === 0)

const taskList = ref<GetOtherJobTasksOutDto[]>([])

const positionList = ref<MatchedPositionBean[]>([])

const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
})
// 渠道登录弹窗
const showChannelModal = ref(false)
// 要删除的任务id
const deleteTaskId = ref<string>()
// 渠道登录提示显示状态
const showChannelTip = ref(false)
// 是否有新职位
const hasNewPositions = ref(false)
// 第一页第一条数据的推荐时间
const firstPositionTime = ref<number>(0)
// 简历文本
const resumeText = ref<string>('')


const resetFilters = () => {
    pagination.current = 1
    pagination.pageSize = 20
    searchData.isInterested = 0
    searchData.sourceChannel = -1
    searchData.sortBy = 'recommendedAt'
}

const handlePageChange = async (page: number) => {
    pagination.current = page
    await loadPositions()
}

const handlePageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.current = 1
    await loadPositions()
}

const channels = ref([
    {
        name: 'BOSS直聘',
        value: 'boss',
        icon: bossIcon,
        isLogin: true
    },
    {
        name: '智联招聘',
        value: 'zhilian',
        icon: zhilianIcon,
        isLogin: true
    },
    {
        name: '国聘网',
        value: 'guopin',
        icon: guopinIcon,
        isLogin: false
    }
])

const handleChannelLogin = () => {
    showChannelModal.value = true
}

const handleOpenCreateModal = () => {
    createTaskModalRef.value?.open()
}

const handleLogin = debounce(async (channel: any) => {
    if (!channel.isLogin) {
        try {
            const loginResult = await executeLogin(channel.value)
            if (loginResult.success) {
                channel.isLogin = true
                message.success(Message, '登录成功！')
                showChannelModal.value = false

                // 登录成功后，如果任务在进行中，重启爬取
                if (currentTask.value?.status === 0 && currentTask.value.uuid) {
                    await robotManager.cleanup()
                    UserInfo.info.isRunningTask = false
                    await robotManager.crawlPosition({
                        jobTitle: currentTask.value.jobTitle,
                        cityInfos: currentTask.value.cityName,
                        experience: enumEcho(currentTask.value.experience, workExperienceList, 'value', 'key')
                    }, currentTask.value.uuid, resumeText.value, UserInfo.info.matchAnalysisPrompt)
                    UserInfo.info.isRunningTask = true
                }
            } else {
                message.error(Message, `登录失败: ${loginResult.error}`)
            }
        } catch (error) {
            console.error('登录异常:', error)
            message.error(Message, '登录异常，请重试')
        }
    }
}, 300)

const handleTaskSwitch = () => {
    if (taskList.value.length)
        showTaskDropdown.value = !showTaskDropdown.value
}

const handleToggleTaskStatus = debounce(async () => {
    if (!currentTask.value?.uuid) return
    try {
        const params = new ActivateJobTaskInDto()
        params.uuid = currentTask.value.uuid
        params.status = taskStatus.value ? 1 : 0
        const result = await jobService.activateJobTask(params)
        if (result.code === 200) {
            const taskParams = new GetJobTaskInDto()
            const taskResult = await jobService.getJobTask(taskParams)
            if (taskResult.code === 200 && taskResult.data) {
                currentTask.value = taskResult.data
                if (taskResult.data.status === 0) {
                    const allCookies = await channelAuth.getAllCookies()
                    channels.value.forEach(channel => {
                        channel.isLogin = !!allCookies[channel.value]
                    })
                    showChannelTip.value = channels.value.every(channel => !channel.isLogin)

                    // 如果有登录的渠道，直接开始爬取
                    const hasLoggedIn = channels.value.some(channel => channel.isLogin)
                    if (hasLoggedIn && taskResult.data.uuid) {
                        await robotManager.crawlPosition({
                            jobTitle: taskResult.data.jobTitle,
                            cityInfos: taskResult.data.cityName,
                            experience: enumEcho(taskResult.data.experience, workExperienceList, 'value', 'key')
                        }, taskResult.data.uuid, resumeText.value, UserInfo.info.matchAnalysisPrompt)
                        UserInfo.info.isRunningTask = true
                    }
                    message.success(Message, '任务已开启，请至少登录一个招聘渠道！')
                } else {
                    // 关闭状态，停止爬取
                    await robotManager.cleanup()
                    UserInfo.info.isRunningTask = false
                    message.success(Message, '任务已关闭，将不再推送精选职位！')
                }
            }
        } else if (result.code === 2601) { // 满额
            UserInfo.info.isRunningTask = false
            message.info(Message, '今日推荐次数已用完，请明日再来！')
        } else if (result.code === 2306) { // 简历id不存在
            message.error(Message, '求职简历不存在，任务开启失败!')
        }
    } catch (error) {
        console.error('切换任务状态失败:', error)
    }
}, 300)

const handleSelectTask = debounce(async (taskId: string) => {
    showTaskDropdown.value = false
    if (taskId === currentTaskId.value) {
        return
    }

    try {
        const result = await jobService.switchJobTask(taskId)
        if (result.code === 200) {
            resetFilters()
            await loadCurrentTask()
            await new Promise(resolve => setTimeout(resolve, 1000))
            await loadOtherTasks()
        }
    } catch (error) {
        console.error('切换任务失败:', error)
    }
}, 300)

const handleDeleteClick = (taskId: string) => {
    deleteTaskId.value = taskId
    promptDialogRef.value?.open()
}

const handleDeleteTask = async (uuid?: string) => {
    if (!uuid) return
    try {
        const result = await jobService.deleteJobTask(uuid)
        if (result.code === 200) {
            const isCurrentTask = uuid === currentTaskId.value
            taskList.value = taskList.value.filter(t => t.uuid !== uuid)
            message.success(Message, '删除成功！')

            // 如果列表为空，通知父组件切换到CreateTask
            if (taskList.value.length === 0) {
                emit('all-tasks-deleted')
            } else if (isCurrentTask) {
                // 如果删除的是当前任务但还有其他任务，切换到最近创建的任务（列表最后一个）
                const nextTask = taskList.value[taskList.value.length - 1]
                if (nextTask) {
                    await jobService.switchJobTask(nextTask.uuid)
                    resetFilters()
                    await loadCurrentTask()
                    await loadOtherTasks()
                }
            }
        }
    } catch (error) {
        console.error('删除任务失败:', error)
    }
}

const loadCurrentTask = async () => {
    try {
        const params = new GetJobTaskInDto()
        const result = await jobService.getJobTask(params)
        if (result.code === 200 && result.data) {
            currentTask.value = result.data
            searchData.taskUuid = result.data.uuid
            // 调用获取简历文本接口
            if (result.data.resumeUuid) {
                const res = await resumeService.getResumeText(result.data.resumeUuid)
                resumeText.value = res.data as string;
                if (result.data.status === 0) {
                    const allCookies = await channelAuth.getAllCookies()
                    channels.value.forEach(channel => {
                        channel.isLogin = !!allCookies[channel.value]
                    })
                    showChannelTip.value = channels.value.every(channel => !channel.isLogin)

                    // 如果有登录的渠道，直接开始爬取
                    const hasLoggedIn = channels.value.some(channel => channel.isLogin)
                    // 每次切换之后 都要先关闭之前的机器人，重新启动
                    if (hasLoggedIn && result.data.uuid) {
                        console.log(UserInfo.info.matchAnalysisPrompt, 'prompt')
                        await robotManager.cleanup()
                        await robotManager.crawlPosition({
                            jobTitle: result.data.jobTitle,
                            cityInfos: result.data.cityName,
                            experience: enumEcho(result.data.experience, workExperienceList, 'value', 'key')
                        }, result.data.uuid, resumeText.value, UserInfo.info.matchAnalysisPrompt)
                        UserInfo.info.isRunningTask = true
                    }
                }
            }

            await loadPositions()
        } else if (result.code === 2306) { // 简历id不存在
            message.error(Message, '求职简历不存在，任务开启失败!')
        }
    } catch (error) {
        console.error('获取任务失败:', error)
    }
}

const loadPositions = async () => {
    try {
        const params = {...searchData}
        if (params.sourceChannel === -1) {
            delete params.sourceChannel
        }
        const result = await jobService.queryMatchedPositions(params)
        if (result.code === 200 && result.data) {
            positionList.value = result.data.list
            pagination.total = result.data.total

            // 如果有数据，自动选中第一条
            if (result.data.list.length > 0) {
                const firstItem = result.data.list[0]
                selectedId.value = firstItem.positionUuid

                // 如果是第一页，记录第一条的推荐时间
                if (pagination.current === 1 && firstItem.recommendedAt) {
                    firstPositionTime.value = firstItem.recommendedAt
                }
            }
        }
    } catch (error) {
        console.error('获取职位列表失败:', error)
    }
}

const loadOtherTasks = async () => {
    try {
        if (!currentTask.value?.uuid) return
        const result = await jobService.getOtherJobTasks(currentTask.value.uuid)
        if (result.code === 200 && result.data) {
            taskList.value = result.data
            taskList.value.unshift(currentTask.value)
        }
    } catch (error) {
        console.error('获取其他任务失败:', error)
    }
}

const handleTaskUpdated = async () => {
    resetFilters()
    await loadCurrentTask()
    await loadOtherTasks()
}

const handleRefresh = async () => {
    hasNewPositions.value = false
    resetFilters()
    await loadPositions()
}

const openBaidu = async (url: string) => {
    if (url) {
        await openWeb(url);
    }
}

// 计算可显示的标签
const getVisibleTags = (item: MatchedPositionBean) => {
    const tags: string[] = []
    if (item.educational) tags.push(item.educational)
    if (item.workExperience) tags.push(item.workExperience)
    if (item.labels) tags.push(...item.labels)

    // 根据标签内容长度动态估算，时间信息占约25%宽度，每个标签平均占8%宽度
    const timeWidthPercent = 25
    const avgTagWidthPercent = 8
    const availablePercent = 100 - timeWidthPercent
    const maxTags = Math.floor(availablePercent / avgTagWidthPercent)

    return tags.slice(0, Math.max(1, maxTags))
}

/**
 * 显示有新职位
 */
const handleUpdateNewPosition = () => {
    hasNewPositions.value = true;
}

/**
 * 今日推荐次数用完，进行中 改为 已关闭
 */
const handleExhaustedOfAttempts = async () => {
    await robotManager.cleanup()
    UserInfo.info.isRunningTask = false
    message.info(Message, '今日推荐次数已用完，请明日再来！')

    const params = new ActivateJobTaskInDto()
    params.uuid = currentTask.value?.uuid!
    params.status = 1
    await jobService.activateJobTask(params)
    loadCurrentTask()
}

onMounted(async () => {
    loadCurrentTask()
    loadOtherTasks()
    console.log('11111111111111111111111111')
    emitter.on('updateNewPosition', handleUpdateNewPosition)
    emitter.on('exhaustedOfAttempts', handleExhaustedOfAttempts)
})

onBeforeUnmount(() => {
    emitter.off('updateNewPosition', handleUpdateNewPosition)
    emitter.off('exhaustedOfAttempts', handleExhaustedOfAttempts)

})
</script>

<template>
    <div class="pos-panel align-between">
        <div class="panel-left">
            <div class="title-row align-between">
                <div class="title-left flex-column">
                    <SvgIcon class="ai-icon" color="#FC8719" name="icon-AI" size="40"/>
                    <span>精选职位</span>
                </div>
                <div class="title-right">
                    <Checkbox v-model="searchData.isInterested" :false-value="0" :true-value="1" class="filter-checkbox"
                              @on-change="loadPositions">
                        只看感兴趣
                    </Checkbox>
                    <Select v-model="searchData.sourceChannel" class="filter-select" placeholder="全部渠道"
                            placement="bottom-end" @on-change="loadPositions">
                        <Option v-for="item in allList" :key="item.value" :label="item.key" :value="item.value"/>
                    </Select>
                    <Select v-model="searchData.sortBy" class="filter-select" placeholder="按推荐时间排序"
                            placement="bottom-end" @on-change="loadPositions">
                        <Option v-for="item in sortList" :key="item.value" :label="item.label" :value="item.value"/>
                    </Select>
                </div>
            </div>

            <div class="task-card">
                <div class="task-header align-between">
                    <div class="task-left">
                        <span class="task-title">{{ currentTask?.jobTitle }}</span>
                        <div :class="{ 'is-active': taskStatus }" class="task-switch mr-20"
                             @click="handleToggleTaskStatus">
                            <div class="switch-dot"></div>
                            <span class="switch-text">{{ taskStatus ? '任务进行中' : '任务已关闭' }}</span>
                        </div>
                        <div v-if="hasNewPositions" class="new-pos-tip">
                            <div class="new-pos-text mr-20">有新职位</div>
                            <div class="refresh-con" @click="handleRefresh">
                                <SvgIcon class="mr-5" color="#9499A5" name="icon-shuaxin" size="12"/>
                                刷新
                            </div>
                        </div>
                    </div>
                    <div class="task-right">
                        <Tooltip v-for="item in channels" :key="item.value" :content="item.name" placement="bottom"
                                 theme="dark" transfer>
                            <div class="channel-icon">
                                <img :alt="item.name" :src="item.icon"/>
                                <div v-if="!item.isLogin" class="icon-mask"></div>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <div class="task-actions">
                    <Dropdown :visible="showTaskDropdown" class="task-dropdown" placement="bottom-start"
                              trigger="custom">
                        <div class="action-item" @click="handleTaskSwitch">
                            <SvgIcon name="icon-qiehuan" size="12"/>
                            <span>切换任务</span>
                        </div>
                        <template #list>
                            <DropdownMenu class="task-dropdown-menu">
                                <div class="task-list">
                                    <div v-for="task in taskList" :key="task.uuid"
                                         :class="{ 'is-active': task.uuid === currentTaskId }"
                                         class="task-item"
                                         @click="handleSelectTask(task.uuid)">
                                        <div v-if="task.uuid === currentTaskId" class="task-dot"></div>
                                        <div class="task-info">
                                            <div class="task-name">{{ task.jobTitle }}</div>
                                            <div class="task-meta">{{ task.cityName }} ｜
                                                {{ enumEcho(task.experience, workExperienceList, 'value', 'key') }}
                                            </div>
                                        </div>
                                        <SvgIcon class="delete-icon" name="icon-shanchu-xian" size="12"
                                                 @click.stop="handleDeleteClick(task.uuid)"/>
                                    </div>
                                </div>
                            </DropdownMenu>
                        </template>
                    </Dropdown>
                    <div class="action-item" @click="handleOpenCreateModal">
                        <SvgIcon name="icon-xinzeng" size="12"/>
                        <span>新增任务</span>
                    </div>
                    <div class="action-item-wrapper">
                        <div class="action-item" @click="handleChannelLogin">
                            <SvgIcon name="icon-user" size="12"/>
                            <span>渠道登录</span>
                        </div>
                        <div v-if="showChannelTip" class="channel-tip">
                            <div class="tip-arrow"></div>
                            <div class="tip-content">
                                <span>至少登录一个招聘渠道</span>
                                <SvgIcon class="tip-close" name="icon-cha" size="10" @click="showChannelTip = false"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="positionList.length > 0" class="position-list">
                <div v-for="(item) in positionList" :key="item.positionUuid"
                     :class="{ 'is-active': selectedId === item.positionUuid }" class="position-item"
                     @click="handleSelectPosition(item.positionUuid)">
                    <div class="item-top">
                        <div class="top-left">
                            <span class="item-title">{{ item.title }}</span>
                            <div class="match-badge">
                                <SvgIcon color="#FC8919" name="icon-pipei" size="14"/>
                                <span>{{ item.matchScore }}%</span>
                            </div>
                        </div>
                        <span class="item-salary">{{
                                [item.salary, item.salaryNumber].filter(Boolean).join('·')
                            }}</span>
                    </div>
                    <div class="item-middle">
                        <div class="item-tags">
                            <span v-for="(tag, idx) in getVisibleTags(item)" :key="idx" class="tag-item">{{
                                    tag
                                }}</span>
                        </div>
                        <span class="item-time">{{ parseDate(item.recommendedAt, '{y}-{m}-{d} {h}:{i}') }} <span
                            class="separator">｜</span>{{
                                enumEcho(item.sourceChannel, channelList, 'value', 'key')
                            }}</span>
                    </div>
                    <div class="item-bottom">
                        <span class="company-info">{{ item.areaName }} <span class="separator">｜</span>{{
                                item.companyName
                            }}</span>
                        <div class="item-action pointer" @click="openBaidu(item.jobDetailUrl)">
                            <SvgIcon color="#9499A4" name="icon-send" size="14"/>
                            <span>去投递</span>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination
                v-if="positionList.length > 0"
                v-model:current="pagination.current"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                @on-change="handlePageChange"
                @on-page-size-change="handlePageSizeChange"
            />

            <div v-else class="empty-state">
                <img alt="暂无数据" class="empty-img" src="@/assets/images/no-data.png"/>
                <p class="empty-text">暂无数据</p>
            </div>
        </div>

        <div class="panel-right">
            <PositionDetail :id="selectedId" ref="positionDetailRef"/>
        </div>

        <Modal v-model="showChannelModal" :closable="false" :footer-hide="true" :mask-closable="false"
               class-name="channel-modal">
            <div class="modal-header">
                <span class="modal-title">渠道登录</span>
                <SvgIcon class="close-icon pointer" name="icon-cha" size="16" @click="showChannelModal = false"/>
            </div>
            <div class="modal-content">
                <div class="modal-desc">
                    <p>至少登录一个渠道，求职任务才能正常进行。</p>
                    <p>渠道处于“登录状态”并且“任务已开启”，系统将自动为您匹配合适岗位。</p>
                </div>
                <div class="channel-list">
                    <div v-for="channel in channels" :key="channel.value" class="channel-card"
                         @click="handleLogin(channel)">
                        <div class="channel-icon-wrapper mb-25">
                            <img :alt="channel.name" :src="channel.icon" class="channel-img"/>
                            <div v-if="!channel.isLogin" class="icon-mask"></div>
                        </div>
                        <div class="channel-name mb-40">{{ channel.name }}</div>
                        <div :class="{ 'is-login': channel.isLogin }" class="channel-status">
                            {{ channel.isLogin ? '已登录' : '立即登录' }}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

        <!-- 次数用完提示 -->
        <Modal
            v-model="emptyModalVisible"
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
                    <p>今日推荐次数已用完，请明日再来！</p>
                </div>
                <div class="modal-footer">
                    <button style="visibility: hidden">取消</button>
                    <button style="visibility: hidden">确定</button>
                </div>
            </div>
        </Modal>

        <!-- 创建新任务 -->
        <CreateTaskModal ref="createTaskModalRef" @task-updated="handleTaskUpdated" @task-saved="loadOtherTasks"/>

        <!-- 删除任务确认弹框 -->
        <PromptDialog
            :id="deleteTaskId"
            ref="promptDialogRef"
            :confirm="handleDeleteTask"
            content="该任务下的精选职位也将一并删除，不可恢复；确认是否删除此任务？"
        />
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.pos-panel {
    width: 100%;
    height: 100%;
    column-gap: vw(40);
    padding-top: vh(12);

    .panel-left {
        width: vw(1000);
        height: 100%;
        display: flex;
        flex-direction: column;

        .title-row {
            width: 100%;
            align-items: end;
            margin-bottom: vh(10);

            .title-left {
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

            .title-right {
                display: flex;
                align-items: end;
                column-gap: vw(40);
            }

            :deep(.filter-checkbox) {
                display: flex;
                align-items: center;
                margin-right: 0;

                .ivu-checkbox {
                    width: vw(14) !important;
                    height: vw(14) !important;
                    min-width: 12px;
                    min-height: 12px;
                }

                .ivu-checkbox-inner {
                    width: 100%;
                    height: 100%;
                    min-width: 12px;
                    min-height: 12px;
                    border-color: #B0B7C6 !important;
                    padding: 0;
                }

                .ivu-checkbox-label-text {
                    font-weight: 600;
                    font-size: vw(16);
                    color: $font-middle;
                }
            }

            .filter-select {
                width: fit-content;
                height: vh(32);
                flex-shrink: 0;

                &.ivu-select-visible {
                    :deep(.ivu-icon) {
                        transform: rotate(180deg) !important;
                    }
                }

                :deep(.ivu-select-selection) {
                    display: flex;
                    align-items: end;
                    height: 100%;
                    padding: 0;
                    font-size: vw(16);
                    color: $font-middle;
                    background: transparent;
                    border: none;

                    > div {
                        display: flex;
                        align-items: center;

                        .ivu-select-selected-value {
                            flex-shrink: 0;
                            height: fit-content;
                            line-height: 1.5;
                            color: #9499A4;
                            font-size: vw(16);
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            padding-right: vw(10);
                            padding-left: 0;
                        }

                        .ivu-icon {
                            position: unset;
                            transform: translateY(0);
                        }
                    }
                }

                :deep(.ivu-select-dropdown) {
                    width: vw(180);

                    .ivu-select-item {
                        &:hover {
                            padding-left: vw(26);
                        }
                    }
                }
            }
        }

        .task-card {
            width: 100%;
            height: vh(104);
            background: $white;
            border-radius: vw(2);
            box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
            padding: vh(22) vw(20) vh(24) vw(20);
            flex-shrink: 0;
            margin-bottom: vh(10);

            .task-header {
                position: relative;
                width: 100%;
                align-items: center;
                margin-bottom: vh(22);

                .task-left {
                    height: vh(24);
                    display: flex;
                    align-items: center;
                    column-gap: vw(20);

                    .task-title {
                        height: 100%;
                        font-family: 'PingFang SC', sans-serif;
                        font-size: vw(24);
                        font-weight: 600;
                        line-height: vh(24);
                        color: $theme-color;
                    }

                    .task-switch {
                        position: relative;
                        width: vw(96);
                        height: 100%;
                        border-radius: vw(14);
                        border: 1px solid $border-default;
                        background: $white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: border-color 0.2s ease;

                        &.is-active {
                            border-color: $theme-color;

                            .switch-dot {
                                background: $theme-color;
                            }

                            .switch-text {
                                color: $theme-color;
                            }
                        }

                        .switch-dot {
                            position: absolute;
                            width: vw(18);
                            height: vw(18);
                            border-radius: vw(12);
                            background: $border-default;
                            left: vw(3);
                            transition: background 0.2s ease;
                        }

                        .switch-text {
                            padding-left: vw(20);
                            font-family: 'PingFang SC', sans-serif;
                            font-size: vw(12);
                            line-height: vw(12);
                            color: $font-middle;
                            transition: color 0.2s ease;
                        }
                    }

                    .new-pos-tip {
                        display: flex;
                        align-items: center;
                        column-gap: vw(10);

                        .new-pos-text {
                            position: relative;
                            padding-left: vw(18);
                            font-family: 'PingFang SC', sans-serif;
                            font-size: vw(14);
                            font-weight: 500;
                            line-height: vw(14);
                            color: $remind-red;

                            &::before {
                                content: '';
                                position: absolute;
                                left: 0;
                                top: 50%;
                                transform: translateY(-50%);
                                width: vw(8);
                                height: vw(8);
                                background: $remind-red;
                                border-radius: 50%;
                            }
                        }

                        .refresh-con {
                            display: flex;
                            align-items: center;
                            column-gap: vw(6);
                            font-family: 'PingFang SC', sans-serif;
                            font-size: vw(14);
                            line-height: vw(12);
                            color: $font-middle;
                            cursor: pointer;

                            &:hover {
                                color: $theme-color;

                                :deep(use) {
                                    fill: $theme-color;
                                }
                            }
                        }
                    }
                }

                .task-right {
                    position: absolute;
                    right: vw(-20);
                    top: vh(-10);
                    width: vw(170);
                    height: vh(50);
                    background: $hover-color;
                    border-radius: vw(10) 0 0 vw(10);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: vw(20);

                    :deep(.ivu-tooltip) {
                        width: vw(30);
                        height: vw(30);

                        .ivu-tooltip-popper[x-placement^="top"] {
                            .ivu-tooltip-content {
                                .ivu-tooltip-arrow {
                                    border-top-color: rgba(70, 76, 91, 0.9);
                                }

                                .ivu-tooltip-inner {
                                    background: rgba(70, 76, 91, 0.9);
                                    border-radius: vw(4);
                                    padding: vh(8) vw(10);
                                    font-family: 'PingFang SC', sans-serif;
                                    font-size: vw(14);
                                    font-weight: 500;
                                    color: $white;
                                }
                            }
                        }
                    }

                    .channel-icon {
                        position: relative;
                        width: vw(30);
                        height: vw(30);
                        border-radius: vw(6);
                        box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        cursor: pointer;

                        img {
                            width: 100%;
                            height: 100%;
                            border-radius: vw(6);
                            image-rendering: -webkit-optimize-contrast;
                            image-rendering: crisp-edges;
                        }

                        .icon-mask {
                            position: absolute;
                            inset: 0;
                            background: rgba(0, 0, 0, 0.5);
                            border-radius: vw(6);
                        }
                    }
                }
            }

            .task-actions {
                display: flex;
                align-items: center;
                column-gap: vw(20);

                .action-item-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }


                .action-item {
                    display: flex;
                    align-items: center;
                    column-gap: vw(6);
                    cursor: pointer;

                    span {
                        font-family: 'PingFang SC', sans-serif;
                        font-size: vw(14);
                        font-weight: 600;
                        line-height: vw(14);
                        color: $font-middle;
                    }

                    &:hover {
                        span {
                            color: $theme-color;
                        }

                        :deep(use) {
                            fill: $theme-color;
                        }
                    }
                }
            }
        }

        .position-list {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            row-gap: vh(10);
            padding: 0 vw(10);
            margin: 0 vw(-10);

            &::-webkit-scrollbar {
                display: none;
            }

            -ms-overflow-style: none;
            scrollbar-width: none;

            .position-item {
                width: 100%;
                background: $white;
                border-radius: vw(2);
                box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
                padding: vw(20);
                display: flex;
                flex-direction: column;
                row-gap: vh(12);
                position: relative;
                flex-shrink: 0;
                cursor: pointer;

                &.is-active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: vw(4);
                    height: 100%;
                    background: $theme-color;
                    border-radius: vw(2) 0 0 vw(2);
                }

                .item-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .top-left {
                        display: flex;
                        align-items: center;
                        column-gap: vw(10);

                        .item-title {
                            font-size: vw(20);
                            font-weight: 500;
                            color: $font-dark;
                            line-height: vw(20);
                        }

                        .match-badge {
                            display: flex;
                            align-items: center;
                            column-gap: vw(4);

                            svg {
                                width: vw(14) !important;
                                height: vw(14) !important;
                            }

                            span {
                                font-size: vw(14);
                                font-weight: 500;
                                background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                                line-height: vw(14);
                            }
                        }
                    }

                    .item-salary {
                        font-size: vw(20);
                        font-weight: 500;
                        color: $font-dark;
                        line-height: vw(20);
                    }
                }

                .item-middle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .item-tags {
                        display: flex;
                        align-items: center;
                        column-gap: vw(10);
                        flex-wrap: nowrap;

                        .tag-item {
                            padding: vw(5);
                            background: #F6F8FA;
                            font-size: vw(12);
                            color: $font-dark;
                            line-height: vw(12);
                            white-space: nowrap;
                        }
                    }

                    .item-time {
                        font-size: vw(14);
                        color: $font-middle;
                        line-height: vw(14);
                        display: inline-flex;
                        align-items: center;

                        .separator {
                            color: #B0B7C6;
                            display: inline-flex;
                            align-items: center;
                        }
                    }
                }

                .item-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .company-info {
                        font-size: vw(14);
                        color: $font-dark;
                        line-height: vw(14);
                        display: inline-flex;
                        align-items: center;

                        .separator {
                            color: #B0B7C6;
                            display: inline-flex;
                            align-items: center;
                        }
                    }

                    .item-action {
                        display: flex;
                        align-items: center;
                        column-gap: vw(6);

                        span {
                            font-size: vw(14);
                            color: $font-dark;
                            line-height: vw(14);
                        }

                        svg {
                            width: vw(14) !important;
                            height: vw(14) !important;
                        }

                        &:hover {
                            span {
                                color: $theme-color;
                            }

                            :deep(use) {
                                fill: $theme-color;
                            }
                        }
                    }
                }
            }
        }

        .empty-state {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .empty-img {
                width: vw(120);
                height: vh(128);
            }

            .empty-text {
                font-family: 'PingFang SC', sans-serif;
                font-size: vw(18);
                line-height: vw(24);
                color: $font-middle;
            }
        }
    }

    .panel-right {
        margin-top: vh(48);
        flex: 1;
        background: $white;
        border-radius: vw(2);
        box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.10);
    }
}

.channel-tip {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;

    .tip-arrow {
        width: 0;
        height: 0;
        border-top: vw(5) solid transparent;
        border-bottom: vw(5) solid transparent;
        border-right: vw(6) solid rgba(70, 76, 91, 0.9);
    }

    .tip-content {
        background: rgba(70, 76, 91, 0.9);
        border-radius: vw(4);
        padding: vh(8) vw(10);
        display: flex;
        align-items: center;
        column-gap: vw(10);

        span {
            font-family: 'PingFang SC', sans-serif;
            font-size: vw(14);
            font-weight: 500;
            line-height: vw(14);
            color: $white;
            white-space: nowrap;
        }

        .tip-close {
            cursor: pointer;
            flex-shrink: 0;

            :deep(use) {
                fill: $white;
            }

            &:hover {
                opacity: 0.8;
            }
        }
    }
}

:deep(.ivu-select-dropdown) {
    width: vw(300);
    max-height: vh(196);
    margin: vh(3) 0 0 0;
    padding: vw(10);
    box-shadow: 0 vw(2) vw(8) 0 rgba(0, 0, 0, 0.15);
    border-radius: vw(4);

    .task-dropdown-menu {
        padding: 0;

        .task-list {
            max-height: vh(176);
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: vh(4);

            &::-webkit-scrollbar {
                display: none;
            }

            .task-item {
                position: relative;
                height: vh(45);
                padding: vh(6) vw(10);
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                background: $white;
                transition: all 0.2s;

                &.is-active {
                    background: $theme-color;
                    padding-left: vw(26);

                    .task-dot {
                        display: block;
                    }

                    .task-info {
                        .task-name,
                        .task-meta {
                            color: $white;
                        }
                    }

                    .delete-icon use {
                        fill: $white;
                    }
                }

                &:hover:not(.is-active) {
                    background: $hover-color;
                    padding-left: vw(26);

                    .delete-icon use {
                        fill: $theme-color;
                    }
                }

                .task-dot {
                    display: none;
                    position: absolute;
                    left: vw(10);
                    width: vw(6);
                    height: vw(6);
                    border-radius: 50%;
                    background: $white;
                }

                .task-info {
                    flex: 1;

                    .task-name {
                        font-family: 'PingFang SC', sans-serif;
                        font-size: vw(14);
                        line-height: vh(14);
                        color: $font-dark;
                        margin-bottom: vh(7);
                    }

                    .task-meta {
                        font-family: 'PingFang SC', sans-serif;
                        font-size: vw(12);
                        line-height: vh(12);
                        color: $font-dark;
                    }
                }

                .delete-icon {
                    flex-shrink: 0;
                    cursor: pointer;

                    use {
                        fill: $icon-gray;
                    }
                }
            }
        }
    }
}
</style>
