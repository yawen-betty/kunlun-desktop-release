<script lang="ts" setup>
import {ref, reactive, onMounted, computed} from 'vue'
import SvgIcon from '@/components/svgIcon/index.vue'
import Pagination from '@/components/pagination/index.vue'
import PromptDialog from '@/components/promptDialog/index.vue'
import {TutoringService} from '@/service/TutoringService'
import {GetTutoringRecordsInDto} from '@/api/tutoring/dto/GetTutoringRecords'
import {TutoringRecordBean} from '@/api/tutoring/dto/bean/TutoringRecordBean'
import {Message} from 'view-ui-plus'
import {message} from '@/utiles/Message'
import {Config} from '@/Config'
import {invoke} from '@tauri-apps/api/core'

const tutoringService = new TutoringService()
const selectedId = ref('')
const recordList = ref<TutoringRecordBean[]>([])

const selectedRecord = computed(() => {
    return recordList.value.find(item => item.uuid === selectedId.value)
})

const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 100
})

const handleSelectRecord = (id: string) => {
    selectedId.value = id
}

const handleScroll = () => {
    document.body.click()
}

const handlePageChange = async (page: number) => {
    pagination.current = page
    const listEl = document.querySelector('.record-list')
    if (listEl) listEl.scrollTop = 0
    await loadRecords()
}

const handlePageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.current = 1
    await loadRecords()
}

const loadRecords = async () => {
    try {
        const params = new GetTutoringRecordsInDto()
        params.pageInfo.pageNum = pagination.current
        params.pageInfo.pageSize = pagination.pageSize

        const result = await tutoringService.getTutoringRecords(params)
        if (result.code === 200 && result.data) {
            recordList.value = result.data.list
            pagination.total = result.data.total

            if (recordList.value.length > 0 && !selectedId.value) {
                selectedId.value = recordList.value[0].uuid
            }
        }
    } catch (error) {
        console.error('获取辅导记录失败:', error)
    }
}

const deleteDialogRef = ref()
const currentDeleteId = ref('')

const handleDelete = (id: string) => {
    currentDeleteId.value = id
    deleteDialogRef.value?.open()
    document.body.click();
}

const confirmDelete = async () => {
    try {
        await tutoringService.deleteTutoringRecord(currentDeleteId.value)
        message.success(Message, '删除成功！')
        await loadRecords()
    } catch (error) {
        console.error('删除辅导记录失败:', error)
        message.error(Message, '删除失败，请重试')
    }
}

const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}.${month}.${day} ${hours}:${minutes}`
}

onMounted(async () => {
    await loadRecords()
})

const handleDownload = async (id: string) => {
    const fileName = `辅导记录_${formatTime(Date.now())}.pdf`

    try {
        const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{description: 'PDF', accept: {'application/pdf': ['.pdf']}}]
        })
        const result = await tutoringService.downloadTutoringPdf(id)
        if (result.code === 200 && result.data?.pdfUrl) {
            document.body.click()
            const url = Config.baseUrl + result.data.pdfUrl
            // const url = 'https://hr-ai.dev.lingxizhifu.cn/assets/kunlun/resume/81704709-badc-4502-9d51-c435db729666.pdf'
            const bytes: number[] = await invoke('download_pdf', {url})
            const uint8Array = new Uint8Array(bytes)

            const writable = await handle.createWritable()
            await writable.write(uint8Array)
            await writable.close()

            message.success(Message, '辅导记录已下载')
        }
    } catch (error) {
        if ((error as any).name !== 'AbortError') {
            console.error('下载失败:', error)
            message.error(Message, '下载失败，请重试')
        }
    }
}
</script>

<template>
    <div class="tutorship-page">
        <div class="page-left">
            <div v-if="recordList.length > 0" class="record-list" @scroll="handleScroll">
                <div
                    v-for="item in recordList"
                    :key="item.uuid"
                    :class="{ 'is-active': selectedId === item.uuid }"
                    class="record-item"
                    @click="handleSelectRecord(item.uuid)"
                >
                    <div class="item-content">
                        <div class="item-title">
                            <span class="time">{{ formatTime(item.startTime) }}</span>-AI面试辅导
                        </div>
                        <div class="item-subtitle">{{ item.resumeName }}</div>
                    </div>
                    <Poptip class="custom-poptip" placement="bottom-end" transfer>
                        <div class="more-icon">
                            <SvgIcon color="#9499A4" name="icon-gengduo" size="18"/>
                        </div>
                        <template #content>
                            <div class="action-list">
                                <div class="action-item" @click="handleDownload(item.uuid)">
                                    <SvgIcon class="mr-10" color="#515A6D" name="icon-xiazai" size="12"/>
                                    <span class="download">下载</span>
                                </div>
                                <div class="action-item delete" @click="handleDelete(item.uuid)">
                                    <SvgIcon class="mr-10" color="#EC6B62" name="icon-lajitong-mian" size="12"/>
                                    <span>删除</span>
                                </div>
                            </div>
                        </template>
                    </Poptip>
                </div>
            </div>
            <div v-else class="empty-state">
                <img alt="" src="@/assets/images/no-data.png">
                <div class="empty-text">暂无数据</div>
            </div>
            <Pagination
                v-if="recordList.length > 0"
                v-model:current="pagination.current"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                @on-change="handlePageChange"
                @on-page-size-change="handlePageSizeChange"
            />
        </div>
        <div class="page-right">
            <iframe
                v-if="selectedRecord?.htmlUrl"
                :src="Config.baseUrl + selectedRecord.htmlUrl"
                class="preview-iframe"
                frameborder="0"
            />
            <div v-else class="empty-state">
                <img alt="" src="@/assets/images/no-data.png">
                <div class="empty-text">暂无数据</div>
            </div>
        </div>
        <PromptDialog ref="deleteDialogRef" :confirm="confirmDelete" content="删除后将无法恢复，确认是否删除？"/>
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

    .empty-state {
        flex: 1;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        img {
            width: vw(120);
            height: vw(128);
        }

        .empty-text {
            font-size: vw(18);
            color: $font-middle;
            margin-top: vh(20);
        }
    }

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

                :deep(.custom-poptip) {
                    height: vw(18);
                }

                .more-icon {
                    width: vw(18);
                    height: vw(18);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;

                    svg {
                        width: 100%;
                        height: 100%;
                    }

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
        position: relative;
        overflow: hidden;

        .preview-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
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
