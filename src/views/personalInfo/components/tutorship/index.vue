<script lang="ts" setup>
import {ref, reactive} from 'vue'
import SvgIcon from '@/components/svgIcon/index.vue'
import Pagination from '@/components/pagination/index.vue'

interface TutorshipRecord {
    id: string
    time: string
    title: string
    resumeInfo: string
}

const selectedId = ref('1')

const recordList = ref<TutorshipRecord[]>([
    {
        id: '1',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '2',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '3',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '4',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '1',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '2',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '3',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '4',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '1',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '2',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '3',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },
    {
        id: '4',
        time: '2025.10.20 12:20',
        title: 'AI面试辅导',
        resumeInfo: '我的简历-Java开发工程师'
    },

])

const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 100
})

const handleSelectRecord = (id: string) => {
    selectedId.value = id
}

const handlePageChange = (page: number) => {
    pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.current = 1
}

const handleDelete = (id: string) => {
    console.log('删除记录:', id)
}

const handleDownload = (id: string) => {
    console.log('下载记录:', id)
}
</script>

<template>
    <div class="tutorship-page">
        <div class="page-left">
            <div class="record-list">
                <div
                    v-for="item in recordList"
                    :key="item.id"
                    :class="{ 'is-active': selectedId === item.id }"
                    class="record-item"
                    @click="handleSelectRecord(item.id)"
                >
                    <div class="item-content">
                        <div class="item-title">
                            <span class="time">{{ item.time }}</span>-{{ item.title }}
                        </div>
                        <div class="item-subtitle">{{ item.resumeInfo }}</div>
                    </div>
                    <Poptip placement="bottom-end" @click.stop>
                        <div class="more-icon">
                            <SvgIcon color="#9499A4" name="icon-gengduo" size="18"/>
                        </div>
                        <template #content>
                            <div class="action-list">
                                <div class="action-item" @click="handleDownload(item.id)">
                                    <SvgIcon class="mr-10" color="#515A6D" name="icon-xiazai" size="12"/>
                                    <span class="download">下载</span>
                                </div>
                                <div class="action-item delete" @click="handleDelete(item.id)">
                                    <SvgIcon class="mr-10" color="#EC6B62" name="icon-lajitong-mian" size="12"/>
                                    <span>删除</span>
                                </div>
                            </div>
                        </template>
                    </Poptip>
                </div>
            </div>
            <Pagination
                v-model:current="pagination.current"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                @on-change="handlePageChange"
                @on-page-size-change="handlePageSizeChange"
            />
        </div>
        <div class="page-right">
            <!-- 右侧详情区域 -->
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.tutorship-page {
    width: 100%;
    height: vh(1012);
    padding: vw(40);
    display: flex;
    column-gap: vw(40);
    box-sizing: border-box;

    .page-left {
        width: vw(1000);
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: vw(5) vw(5) 0 vw(5);

        .record-list {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overflow-x: visible;
            display: flex;
            flex-direction: column;
            row-gap: vh(20);
            padding: vw(5) vw(15);
            margin: vw(-5) vw(-15);

            &::-webkit-scrollbar {
                display: none;
            }

            .record-item {
                width: 100%;
                height: vh(100);
                background: $white;
                border-radius: vw(2);
                box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
                padding: vh(26) vw(20);
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                flex-shrink: 0;
                transition: box-shadow 0.2s;

                &.is-active {
                    box-shadow: 0 0 vw(10) 0 rgba(252, 135, 25, 0.2);
                }


                .item-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    row-gap: vh(14);

                    .item-title {
                        font-family: 'PingFang SC', sans-serif;
                        font-size: vw(20);
                        font-weight: 500;
                        line-height: vw(20);
                        color: $font-dark;

                        .time {
                            font-weight: 500;
                        }
                    }

                    .item-subtitle {
                        font-family: 'PingFang SC', sans-serif;
                        font-size: vw(14);
                        font-weight: 400;
                        line-height: vw(14);
                        color: $font-dark;
                    }
                }

                .more-icon {
                    width: vw(18);
                    height: vw(18);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;

                    &:hover {
                        :deep(use) {
                            fill: $theme-color;
                        }
                    }
                }
            }
        }
    }

    .page-right {
        flex: 1;
        background: $white;
        border-radius: vw(2);
        box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
    }
}

:deep(.ivu-poptip-body) {
    padding: vw(10);
}

.action-list {
    width: vw(180);

    .action-item {
        width: 100%;
        height: vh(32);
        padding: 0 vw(10);
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: padding-left 0.2s ease-in-out;

        span {
            font-size: vw(14);
            font-weight: 400;
            line-height: vw(14);

            &.download {
                color: $font-dark;
            }
        }

        &.delete span {
            color: #EC6B62;
        }

        &:hover {
            background: $hover-color;
            padding-left: vw(26);
        }
    }
}
</style>
