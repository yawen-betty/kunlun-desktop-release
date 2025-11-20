<script lang="ts" setup>
import {reactive, ref} from 'vue';
import PositionDetail from "@/views/position/components/PositionDetail.vue";
import SvgIcon from "@/components/svgIcon/index.vue";
import Pagination from "@/components/pagination/index.vue";
import bossIcon from '@/assets/images/boss.png'
import zhilianIcon from '@/assets/images/zhilian.png'
import guopinIcon from '@/assets/images/guopin.png'

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

const handlePageChange = (page: number) => {
    pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.current = 1
}

const showChannelModal = ref(false)

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

const handleLogin = (channel: any) => {
    if (!channel.isLogin) {
        console.log('登录', channel.name)
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
                    <div class="action-item">
                        <SvgIcon name="icon-qiehuan" size="12"/>
                        <span>切换任务</span>
                    </div>
                    <div class="action-item">
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
                <SvgIcon class="close-icon" name="icon-cha" size="16" @click="showChannelModal = false"/>
            </div>
            <div class="modal-content">
                <div class="modal-desc">
                    <p>至少登录一个渠道，求职任务才能正常进行。</p>
                    <p>渠道处于“登录状态”并且“任务已开启”，系统将自动为您匹配合适岗位。</p>
                </div>
                <div class="channel-list">
                    <div v-for="(channel, index) in channels" :key="index" class="channel-card"
                         @click="handleLogin(channel)">
                        <div class="channel-icon-wrapper">
                            <img :alt="channel.name" :src="channel.icon" class="channel-img"/>
                            <div v-if="!channel.isLogin" class="icon-mask"></div>
                        </div>
                        <div class="channel-name">{{ channel.name }}</div>
                        <div :class="{ 'is-login': channel.isLogin }" class="channel-status">
                            {{ channel.isLogin ? '已登录' : '立即登录' }}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<style lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.channel-modal {
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
            cursor: pointer;

            svg {
                width: vw(16) !important;
                height: vw(16) !important;
            }
        }
    }

    .modal-content {
        padding: vh(28) vw(40) vh(40) vw(40);

        .modal-desc {
            margin-bottom: vh(30);

            p {
                font-family: 'PingFang SC', sans-serif;
                font-size: vw(16);
                font-weight: 600;
                color: $font-dark;
                line-height: vh(20);
                margin: 0;
            }
        }

        .channel-list {
            display: flex;
            gap: vw(40);

            .channel-card {
                width: vw(200);
                height: vh(250);
                border: 1px solid $border-default;
                border-radius: vw(2);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    border-color: $theme-color;
                }

                .channel-icon-wrapper {
                    position: relative;
                    width: vw(70);
                    height: vw(70);
                    border-radius: vw(14);
                    box-shadow: 0 0 vw(14) 0 rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin-bottom: vh(25);

                    .channel-img {
                        width: 100%;
                        height: 100%;
                        border-radius: vw(14);
                    }

                    .icon-mask {
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: vw(14);
                    }
                }

                .channel-name {
                    font-family: 'PingFang SC', sans-serif;
                    font-size: vw(16);
                    font-weight: 600;
                    color: $font-dark;
                    line-height: vh(16);
                    margin-bottom: vh(28);
                }

                .channel-status {
                    font-family: 'PingFang SC', sans-serif;
                    font-size: vw(14);
                    font-weight: 600;
                    color: $theme-color;
                    line-height: vh(14);

                    &.is-login {
                        color: $font-middle;
                    }
                }
            }
        }
    }
}
</style>
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
                align-items: center;
                column-gap: vw(20);
            }

            :deep(.filter-checkbox) {
                .ivu-checkbox-wrapper {
                    display: flex;
                    align-items: center;

                    .ivu-checkbox-inner {
                        width: vw(14) !important;
                        height: vw(14) !important;
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
                    height: 100%;
                    padding: 0;
                    font-size: vw(16);
                    color: $font-middle;
                    border-color: transparent;
                    background: transparent;
                    border: none;

                    > div {
                        display: flex;
                        align-items: center;
                        height: 100%;

                        .ivu-select-selected-value {
                            flex-shrink: 0;
                            height: 100%;
                            color: #9499A4;
                            font-size: vw(16);
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            padding-right: vw(10);
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
</style>
