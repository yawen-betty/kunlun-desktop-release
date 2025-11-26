<template>
    <Modal v-model="visible" :closable="false" :mask-closable="false" footer-hide="" class-name="feedback-reply-modal">
        <template #header>
            <div class="modal-header">
                <h2 class="modal-title">回复</h2>
                <SvgIcon name="icon-cha" size="20" @click="handleClose" class="close-icon" />
            </div>
        </template>

        <div class="modal-content" ref="scrollContainer" @scroll="handleScroll">
            <div class="reply-section">
                <template v-for="(item, index) in filteredFeedbackList" :key="index">
                    <div class="reply-item">
                        <div class="reply-time">{{ formatTime(item.replyTime) }} 回复</div>
                        <div class="reply-content" v-html="item.reply"></div>
                        <div class="reply-images" v-if="item.replyImages?.length">
                            <Image
                                v-for="(image, imgIndex) in item.replyImages"
                                :key="imgIndex"
                                :src="image"
                                :preview="true"
                                :preview-list="item.replyImages"
                                :initial-index="imgIndex"
                                class="image-item"
                                fit="contain"
                            />
                        </div>

                        <div class="user-feedback">
                            <div class="feedback-text">{{ item.problem }}</div>
                            <div class="feedback-images" v-if="item.problemImages?.length">
                                <Image
                                    v-for="(image, i) in item.problemImages"
                                    :key="i"
                                    :src="image"
                                    :preview="true"
                                    :preview-list="item.problemImages"
                                    :initial-index="i"
                                    class="image-item"
                                    fit="contain"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="divider" v-if="index < filteredFeedbackList.length - 1"></div>
                </template>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {Modal, Image} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import {AdminService} from '@/service/AdminService';
import {QueryFeedbackListInDto} from '@/api/admin/dto/QueryFeedbackList';
import type {FeedbackBean} from '@/api/admin/dto/bean/FeedbackBean';
import {Config} from '@/Config.ts';

interface Props {
    modelValue: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const vw = (px: number) => `${(px / 1920) * 100}vw`;
const adminService = AdminService.getInstance();
const scrollContainer = ref<HTMLElement>();
const feedbackList = ref<FeedbackBean[]>([]);

/**
 * 过滤后的反馈列表 - 只显示有回复的项
 */
const filteredFeedbackList = computed(() => {
    return feedbackList.value.filter((item) => item.reply && item.reply.trim() !== '');
});
const pageNum = ref(1);
const pageSize = 10;
const hasMore = ref(true);

/**
 * 获取反馈列表
 */
const loadFeedbackList = async () => {
    if (!hasMore.value) return;

    try {
        const params = new QueryFeedbackListInDto();
        params.pageInfo.pageNum = pageNum.value;
        params.pageInfo.pageSize = pageSize;

        const res = await adminService.queryFeedbackList(params);
        if (res.code === 200 && res.data) {
            const newData = (res.data.list || []).map((item: FeedbackBean) => ({
                ...item,
                problemImages: item.problemImages?.map((img: string) => Config.baseUrl + img),
                replyImages: item.replyImages?.map((img: string) => Config.baseUrl + img)
            }));
            feedbackList.value.push(...newData);
            hasMore.value = newData.length === pageSize;
            pageNum.value++;
        }
    } catch (error) {
        console.error('获取反馈列表失败:', error);
    }
};

/**
 * 滚动事件处理 - 懒加载
 */
const handleScroll = () => {
    const container = scrollContainer.value;
    if (!container) return;

    const {scrollTop, scrollHeight, clientHeight} = container;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
        loadFeedbackList();
    }
};

/**
 * 监听弹窗打开，重置并加载数据
 */
watch(visible, (newVal) => {
    if (newVal) {
        feedbackList.value = [];
        pageNum.value = 1;
        hasMore.value = true;
        loadFeedbackList();
    }
});

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
    if (!time) return '';
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
};

const handleClose = () => {
    visible.value = false;
};
</script>
<style lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;
.feedback-reply-modal {
    .ivu-modal {
        width: vw(1200) !important;
        height: vh(1000);

        .ivu-modal-body {
            padding: 0;
        }
    }
    .ivu-modal-header {
        padding: 0;
        border: none;
    }
}
</style>

<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;
:deep(.ivu-modal-content) {
    height: 100%;
    border-radius: vw(2);
}

:deep(.ivu-modal-body) {
    padding: 0;
    height: calc(100% - vh(64));
    overflow: hidden;
}

.modal-header {
    height: vh(64);
    background: $white;
    border-radius: vw(2) vw(2) 0 0;
    box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 vw(20);
    position: relative;

    .modal-title {
        font-size: vw(24);
        font-weight: 600;
        color: $font-dark;
        line-height: vh(24);
        margin: 0;
    }

    .close-icon {
        cursor: pointer;
        color: $font-middle;
    }
}

.modal-content {
    height: vh(936);
    overflow-y: auto;
    background: $white;

    .reply-section {
        padding: vw(40);

        .reply-item {
            &:last-child {
                margin-bottom: 0;
            }

            .reply-time {
                font-size: vw(16);
                color: $font-light;
                font-weight: 600;
                line-height: vh(20);
                margin-bottom: vh(10);
            }

            .reply-content {
                font-size: vw(16);
                color: $font-dark;
                font-weight: 600;
                line-height: vh(24);
                margin-bottom: vh(20);
                white-space: pre-wrap;
                word-break: break-word;
            }

            .reply-images {
                display: flex;
                gap: vw(20);
                margin-bottom: vh(40);

                .image-item {
                    width: vw(100);
                    height: vw(100);
                    cursor: pointer;
                    border-radius: vw(2);
                    overflow: hidden;

                    // :deep(img) {
                    //     width: 100%;
                    //     height: 100%;
                    //     object-fit: cover;
                    // }
                }
            }
        }

        .divider {
            height: 1px;
            background: #e1e6ec;
            margin: vh(40) 0;
        }

        .user-feedback {
            background: $bg-gray;
            border-radius: vw(2);
            padding: vw(20);

            .feedback-text {
                font-size: vw(16);
                color: $font-middle;
                font-weight: 600;
                line-height: vh(24);
                margin-bottom: vh(20);
                white-space: pre-wrap;
                word-break: break-word;
            }

            .feedback-images {
                display: flex;
                gap: vw(20);

                .image-item {
                    width: vw(100);
                    height: vw(100);
                    cursor: pointer;
                    border-radius: vw(2);
                    overflow: hidden;

                    // :deep(img) {
                    //     width: 100%;
                    //     height: 100%;
                    //     object-fit: cover;
                    // }
                }
            }
        }
    }
}
</style>
