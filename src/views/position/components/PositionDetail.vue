<script lang="ts" setup>
import {computed, ref} from 'vue'
import SvgIcon from '@/components/svgIcon/index.vue'
import {debounce} from '@/utiles/debounce'

interface PositionDetailData {
    matchRate?: number
    matchSummary?: string
    analysisContent?: string
    positionInfo?: {
        companyName?: string
        positionTitle?: string
        salary?: string
        tags?: string[]
        workAddress?: {
            area?: string
            detail?: string
        }
        description?: string
        benefits?: string[]
        source?: string
        recommendTime?: string
    }
    isInterested?: boolean
}

const props = withDefaults(defineProps<{
    data?: PositionDetailData | null
}>(), {
    data: () => null
})

const activeTab = ref<'analysis' | 'info'>('analysis')
const isInterested = ref(false)

// 判断是否为空状态
const isEmpty = computed(() => props.data === null || props.data === undefined)

// 处理感兴趣按钮点击
const handleInterestClick = debounce(async () => {
    isInterested.value = !isInterested.value
    // TODO: 调用接口
    // await someApi.toggleInterest(positionId, isInterested.value)
}, 300)

// 处理文本格式，将纯文本转换为HTML
const formatDescription = (text: string) => {
    if (!text) return ''
    if (text.includes('<p>') || text.includes('<br>')) return text
    return text
        .split('\n')
        .map(line => line.trim() ? `<p>${line}</p>` : '<p>&nbsp;</p>')
        .join('')
}

// 计算属性
const matchRate = computed(() => props.data?.matchRate ?? 82)
const matchSummary = computed(() => props.data?.matchSummary ?? '经验丰富，技术栈匹配，但需深入理解Java核心机制和设计模式。')
const analysisContent = computed(() => props.data?.analysisContent ?? '')
const positionInfo = computed(() => ({
    companyName: props.data?.positionInfo?.companyName ?? '北京高徒云集教育科技有限公司',
    positionTitle: props.data?.positionInfo?.positionTitle ?? 'Java开发工程师',
    salary: props.data?.positionInfo?.salary ?? '50-60K·14薪',
    tags: props.data?.positionInfo?.tags ?? ['本科', '3-5年', '职位标签'],
    workAddress: {
        area: props.data?.positionInfo?.workAddress?.area ?? '辽宁省/大连市/中山区',
        detail: props.data?.positionInfo?.workAddress?.detail ?? '黄浦路533g号，海创大厦C座'
    },
    description: formatDescription(props.data?.positionInfo?.description ?? ''),
    benefits: props.data?.positionInfo?.benefits ?? ['弹性工作制', '周末双休', '有餐补'],
    source: props.data?.positionInfo?.source ?? 'BOSS直聘',
    recommendTime: props.data?.positionInfo?.recommendTime ?? '2025.10.20 12:20'
}))
</script>

<template>
    <div class="position-detail">
        <!-- 空状态 -->
        <div v-if="isEmpty" class="empty-state">
            <img alt="" src="@/assets/images/no-data.png">
            <div class="empty-text">暂无数据</div>
        </div>

        <!-- 正常内容 -->
        <template v-else>
            <!-- 头部区域 -->
            <div class="header">
                <!-- Tab切换 -->
                <div class="tab-switch">
                    <div class="tab-bg"></div>
                    <div class="tab-content">
                        <div :class="['tab-item', { active: activeTab === 'analysis' }]"
                             @click="activeTab = 'analysis'">
                            分析报告
                        </div>
                        <div :class="['tab-item', { active: activeTab === 'info' }]" @click="activeTab = 'info'">
                            职位信息
                        </div>
                    </div>
                </div>

                <!-- 感兴趣按钮 -->
                <div :class="['interest-btn', { active: isInterested }]" @click="handleInterestClick">
                    <SvgIcon :color="isInterested ? '#F6CD00' : '#9499A4'" name="icon-heart" size="16"/>
                    <span>感兴趣</span>
                </div>
            </div>

            <!-- 分析报告 -->
            <template v-if="activeTab === 'analysis'">
                <!-- 匹配度卡片 -->
                <div class="match-card mt-20 mb-40">
                    <div class="match-info">
                        <div class="match-rate mb-10">{{ matchRate }}% <span class="match-label">匹配度</span></div>
                        <div class="match-desc">{{ matchSummary }}</div>
                    </div>
                    <img alt="" class="match-img" src="@/assets/images/position_detail.png"/>
                </div>

                <!-- 详细内容 -->
                <div class="analysis-content">
                    <div class="analysis-scroll" v-html="analysisContent"></div>
                </div>
            </template>

            <!-- 职位信息 -->
            <template v-else>
                <div class="position-info mt-40">

                    <!-- 职位标题和薪资 -->
                    <div class="title-row">
                        <div class="position-title">{{ positionInfo.positionTitle }}</div>
                        <div class="salary">{{ positionInfo.salary }}</div>
                    </div>

                    <!-- 公司名称 -->
                    <div class="company-name">{{ positionInfo.companyName }}</div>
                    <!-- 标签组 -->
                    <div class="tags-row mb-20">
                        <span v-for="(tag, index) in positionInfo.tags" :key="index" class="tag">{{ tag }}</span>
                    </div>

                    <!-- 工作地址 -->
                    <div class="section">
                        <div class="section-title">工作地址</div>
                        <div class="section-content">{{ positionInfo.workAddress.area }}</div>
                    </div>

                    <!-- 详细地址 -->
                    <div class="section">
                        <div class="section-title">详细地址</div>
                        <div class="section-content" style="white-space: pre-line">{{
                                positionInfo.workAddress.detail
                            }}
                        </div>
                    </div>

                    <!-- 职位描述 -->
                    <div class="section description-section">
                        <div class="section-title">职位描述</div>
                        <div class="section-content scroll">
                            <div v-html="positionInfo.description"></div>
                        </div>
                    </div>

                    <!-- 福利待遇 -->
                    <div class="section">
                        <div class="section-title">福利待遇</div>
                        <div class="tags-row mb-20">
                        <span v-for="(benefit, index) in positionInfo.benefits" :key="index" class="tag">{{
                                benefit
                            }}</span>
                        </div>
                    </div>

                    <!-- 底部信息 -->
                    <div class="footer-info mt-20">
                        <div>职位信息来源于：{{ positionInfo.source }}</div>
                        <div>推荐时间：{{ positionInfo.recommendTime }}</div>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.position-detail {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: vw(20);

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .tab-switch {
            position: relative;
            width: vw(332);
            height: vh(40);

            .tab-bg {
                position: absolute;
                inset: 0;
                background: $bg-gray;
                border-radius: vw(2);
            }

            .tab-content {
                position: relative;
                display: flex;
                gap: vw(14);
                padding: vh(3) vw(3);

                .tab-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: vh(7) vw(50);
                    font-size: vw(14);
                    line-height: vh(20);
                    color: $font-dark;
                    cursor: pointer;
                    border-radius: vw(2);
                    transition: all 0.3s;

                    &.active {
                        background: $theme-color;
                        color: $white;
                        font-family: 'PingFangSCBold';
                    }
                }
            }
        }

        .interest-btn {
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s;

            span {
                font-family: 'PingFangSCMedium';
                font-size: vw(16);
                line-height: vh(16);
                color: $font-middle;
                transition: color 0.3s;
            }

            svg {
                width: vw(16) !important;
                height: vw(16) !important;
                margin-right: vw(6);
            }

            &.active {
                span {
                    color: #F6CD00;
                }
            }

            &:hover {
                opacity: 0.8;
            }
        }
    }

    .match-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: vh(120);
        border: vw(1) solid $border-default;
        border-radius: vw(2);
        padding: vh(21) vw(30);

        .match-info {
            flex: 1;

            .match-rate {
                font-family: 'PingFangSCMedium';
                font-size: vw(32);
                line-height: vh(32);
                background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .match-label {
                font-family: 'PingFangSCMedium';
                font-size: vw(14);
                line-height: vh(14);
                background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .match-desc {
                font-size: vw(14);
                line-height: vh(18);
                color: $font-dark;
                max-width: vw(361);
                word-wrap: break-word;
            }
        }

        .match-img {
            width: vw(110);
            height: vh(99);
            object-fit: cover;
            flex-shrink: 0;
            margin-left: vw(20);
        }
    }

    .position-info {
        flex: 1;
        overflow-y: auto;

        &::-webkit-scrollbar {
            display: none;
        }

        .company-name {
            font-size: vw(14);
            line-height: vh(14);
            color: $font-dark;
            margin-bottom: vh(14);
        }

        .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: vh(14);

            .position-title {
                font-family: 'PingFangSCMedium';
                font-size: vw(20);
                line-height: vh(20);
                color: $font-dark;
            }

            .salary {
                font-family: 'PingFangSCMedium';
                font-size: vw(20);
                line-height: vh(20);
                color: $font-dark;
            }
        }

        .tags-row {
            display: flex;
            flex-wrap: wrap;
            gap: vw(5);

            .tag {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: vw(5);
                background: $bg-gray;
                border-radius: vw(2);
                font-size: vw(12);
                line-height: normal;
                color: $font-dark;
            }
        }

        .section {
            margin-bottom: vh(20);

            .section-title {
                font-size: vw(12);
                color: $font-middle;
                margin-bottom: vh(10);
            }

            .section-content {
                font-size: vw(14);
                line-height: vh(20);
                color: $font-dark;

                &.scroll {
                    max-height: vh(300);
                    overflow-y: auto;

                    &::-webkit-scrollbar {
                        display: none;
                    }
                }
            }

            &.description-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;

                .section-content {
                    flex: 1;
                    overflow-y: auto;

                    :deep(p) {
                        margin-bottom: 0;
                    }
                }
            }
        }

        .footer-info {
            font-size: vw(14);
            line-height: vh(20);
            color: $font-middle;

            div {
                margin-bottom: vh(5);

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }

    .analysis-content {
        flex: 1;
        overflow: hidden;

        .analysis-scroll {
            height: 100%;
            overflow-y: auto;
            font-family: 'PingFangSCRegular';
            font-size: vw(14);
            color: $font-dark;
            line-height: vh(18);

            &::-webkit-scrollbar {
                display: none;
            }

            :deep(p) {
                line-height: vh(20);
                margin-bottom: 0;

                &:has(strong) {
                    font-family: 'PingFangSCBold';
                }
            }

            :deep(strong) {
                font-family: 'PingFangSCBold';
            }

            :deep(ul) {
                list-style: disc;
                margin: 0;
                padding-left: vw(21);
            }

            :deep(li) {
                line-height: vh(20);
                margin-bottom: 0;
            }
        }
    }

    .empty-state {
        flex: 1;
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
        }
    }
}
</style>
