<script lang="ts" setup>
import {reactive, ref} from 'vue';
import PositionDetail from "@/views/position/components/PositionDetail.vue";
import SvgIcon from "@/components/svgIcon/index.vue";
import Pagination from "@/components/pagination/index.vue";
import bossIcon from '@/assets/images/boss.png'
import zhilianIcon from '@/assets/images/zhilian.png'
import guopinIcon from '@/assets/images/guopin.png'
import CreateTaskModal from "@/views/position/components/CreateTaskModal.vue";
import {useCompRef} from "@/hooks/useComponent";
import PromptDialog from "@/components/promptDialog/index.vue";
import {Modal} from "view-ui-plus";

// 创建任务弹框实例
const createTaskModalRef = useCompRef(CreateTaskModal)
// 二次确认弹框
const promptDialogRef = useCompRef(PromptDialog)
const searchData = reactive({
    channel: '0',
    sort: '1',
    type: undefined
})
const channelList = [
    {
        label: '全部渠道',
        value: '0'
    },
    {
        label: 'BOSS直聘',
        value: '1'
    },
    {
        label: '智联招聘',
        value: '2'
    },
    {
        label: '国聘网',
        value: '3'
    },
]

const sortList = [
    {
        label: '按推荐时间排序',
        value: '1'
    },
    {
        label: '按匹配度排序',
        value: '2'
    },
]

const taskStatus = ref(true)
const selectedId = ref(1)
const currentTaskId = ref<string>('1')
const showTaskDropdown = ref(false)
const emptyModalVisible = ref(true)

const taskList = ref([
    {id: '1', name: 'Java开发工程师', location: '北京', experience: '3-5年'},
    {id: '2', name: '产品经理', location: '北京', experience: '3-5年'},
    {id: '3', name: 'Java开发工程师', location: '北京', experience: '3-5年'},
    {id: '4', name: 'Java开发工程师', location: '北京', experience: '3-5年'},
])

const positionList = ref([
    {
        id: 1,
        name: 'Java开发工程师',
        match: 95,
        salary: '15-25K',
        tags: ['五险一金', '带薪年假', '节日福利'],
        location: '大连市·甘井子区',
        company: '北京高徒云集教育科技有限公司',
        publishTime: '2025.10.20 12:20',
        channel: 'BOSS直聘',
    },
    {
        id: 2,
        name: 'Java高级开发工程师',
        match: 88,
        salary: '20-35K',
        tags: ['五险一金', '股票期权', '弹性工作'],
        location: '上海市·浦东新区',
        company: '上海某某互联网公司',
        publishTime: '2025.10.19 15:30',
        channel: '智联招聘',
    },
    {
        id: 3,
        name: 'Python后端开发工程师',
        match: 92,
        salary: '18-30K',
        tags: ['本科', '3-5年', '弹性工作'],
        location: '深圳市·南山区',
        company: '深圳腾讯计算机系统有限公司',
        publishTime: '2025.10.20 10:15',
        channel: 'BOSS直聘',
    },
    {
        id: 4,
        name: '前端开发工程师',
        match: 85,
        salary: '12-20K',
        tags: ['五险一金', '周末双休', '年终奖'],
        location: '杭州市·西湖区',
        company: '杭州阿里巴巴网络技术有限公司',
        publishTime: '2025.10.19 18:45',
        channel: '智联招聘',
    },
    {
        id: 5,
        name: 'Go语言开发工程师',
        match: 90,
        salary: '25-40K',
        tags: ['股票期权', '弹性工作', '带薪年假'],
        location: '北京市·朝阳区',
        company: '北京字节跳动科技有限公司',
        publishTime: '2025.10.20 09:30',
        channel: '国聘网',
    },
    {
        id: 6,
        name: 'Android开发工程师',
        match: 83,
        salary: '16-28K',
        tags: ['五险一金', '补充医疗', '健身房'],
        location: '成都市·高新区',
        company: '成都某科技有限公司',
        publishTime: '2025.10.18 16:20',
        channel: 'BOSS直聘',
    },
    {
        id: 7,
        name: 'iOS开发工程师',
        match: 87,
        salary: '18-32K',
        tags: ['本科', '5-10年', '项目奖金'],
        location: '广州市·天河区',
        company: '广州网易计算机系统有限公司',
        publishTime: '2025.10.19 14:10',
        channel: '智联招聘',
    },
    {
        id: 8,
        name: '数据库管理员DBA',
        match: 78,
        salary: '20-35K',
        tags: ['五险一金', '年度旅游', '节日福利'],
        location: '武汉市·光谷区',
        company: '武汉某软件有限公司',
        publishTime: '2025.10.17 11:30',
        channel: '国聘网',
    },
])

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 80,
})
// 渠道登录弹窗
const showChannelModal = ref(false)
// 要删除的任务id
const deleteTaskId = ref<string>()

const handlePageChange = (page: number) => {
    pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.current = 1
}


const channels = [
    {
        name: 'BOSS直聘',
        icon: bossIcon,
        isLogin: true
    },
    {
        name: '智联招聘',
        icon: zhilianIcon,
        isLogin: true
    },
    {
        name: '国聘网',
        icon: guopinIcon,
        isLogin: false
    }
]

const handleChannelLogin = () => {
    showChannelModal.value = true
}

const handleOpenCreateModal = () => {
    console.log(createTaskModalRef, 'createTaskModalRef')
    createTaskModalRef.value?.open()
}

const handleLogin = (channel: any) => {
    if (!channel.isLogin) {
        console.log('登录', channel.name)
    }
}

const handleTaskSwitch = () => {
    showTaskDropdown.value = !showTaskDropdown.value
}

const handleTaskDblClick = () => {
    showTaskDropdown.value = false
}

const handleSelectTask = (taskId: string) => {
    currentTaskId.value = taskId
    showTaskDropdown.value = false
}

const handleDeleteClick = (taskId: string) => {
    deleteTaskId.value = taskId
    promptDialogRef.value?.open()
}

const handleDeleteTask = (id?: string) => {
    if (id) {
        taskList.value = taskList.value.filter(t => t.id !== id)
    }
}
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
                    <CheckboxGroup v-model="searchData.type" class="filter-checkbox">
                        <Checkbox label="1">只看感兴趣</Checkbox>
                    </CheckboxGroup>
                    <Select v-model="searchData.channel" class="filter-select" placeholder="全部渠道"
                            placement="bottom-end">
                        <Option v-for="item in channelList" :key="item.value" :label="item.label" :value="item.value"/>
                    </Select>
                    <Select v-model="searchData.sort" class="filter-select" placeholder="按推荐时间排序"
                            placement="bottom-end">
                        <Option v-for="item in sortList" :key="item.value" :label="item.label" :value="item.value"/>
                    </Select>
                </div>
            </div>

            <div class="task-card">
                <div class="task-header align-between">
                    <div class="task-left">
                        <span class="task-title">Java开发工程师</span>
                        <div :class="{ 'is-active': taskStatus }" class="task-switch" @click="taskStatus = !taskStatus">
                            <div class="switch-dot"></div>
                            <span class="switch-text">{{ taskStatus ? '任务进行中' : '任务已关闭' }}</span>
                        </div>
                    </div>
                    <div class="task-right">
                        <Tooltip v-for="item in channels" :key="item.name" :content="item.name" placement="bottom"
                                 theme="dark" transfer>
                            <div class="channel-icon">
                                <img :alt="item.name" :src="item.icon"/>
                                <div class="icon-mask"></div>
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
                                    <div v-for="task in taskList" :key="task.id"
                                         :class="{ 'is-active': task.id === currentTaskId }"
                                         class="task-item"
                                         @click="handleSelectTask(task.id)">
                                        <div v-if="task.id === currentTaskId" class="task-dot"></div>
                                        <div class="task-info">
                                            <div class="task-name">{{ task.name }}</div>
                                            <div class="task-meta">{{ task.location }} ｜ {{ task.experience }}</div>
                                        </div>
                                        <SvgIcon class="delete-icon" name="icon-shanchu-xian" size="12"
                                                 @click.stop="handleDeleteClick(task.id)"/>
                                    </div>
                                </div>
                            </DropdownMenu>
                        </template>
                    </Dropdown>
                    <div class="action-item" @click="handleOpenCreateModal">
                        <SvgIcon name="icon-xinzeng" size="12"/>
                        <span>新增任务</span>
                    </div>
                    <div class="action-item" @click="handleChannelLogin">
                        <SvgIcon name="icon-user" size="12"/>
                        <span>渠道登录</span>
                    </div>
                </div>
            </div>

            <div v-if="positionList.length > 0" class="position-list">
                <div v-for="(item) in positionList" :key="item.id"
                     :class="{ 'is-active': selectedId === item.id }" class="position-item"
                     @click="selectedId = item.id">
                    <div class="item-top">
                        <div class="top-left">
                            <span class="item-title">{{ item.name }}</span>
                            <div class="match-badge">
                                <SvgIcon color="#FC8919" name="icon-pipei" size="14"/>
                                <span>{{ item.match }}%</span>
                            </div>
                        </div>
                        <span class="item-salary">{{ item.salary }}</span>
                    </div>
                    <div class="item-middle">
                        <div class="item-tags">
                            <span v-for="(tag, idx) in item.tags" :key="idx" class="tag-item">{{ tag }}</span>
                        </div>
                        <span class="item-time">{{ item.publishTime }} <span class="separator">｜</span>{{
                                item.channel
                            }}</span>
                    </div>
                    <div class="item-bottom">
                        <span class="company-info">{{ item.location }} <span class="separator">｜</span>{{
                                item.company
                            }}</span>
                        <div class="item-action pointer">
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
            <PositionDetail/>
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
                    <div v-for="(channel, index) in channels" :key="index" class="channel-card"
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
        <CreateTaskModal ref="createTaskModalRef"/>

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
                align-items: end;
                height: vh(32);

                .ivu-checkbox-wrapper {
                    margin-right: 0;
                    display: flex;
                    align-items: center;

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

                        .tag-item {
                            padding: vw(5);
                            background: #F6F8FA;
                            font-size: vw(12);
                            color: $font-dark;
                            line-height: vw(12);
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
