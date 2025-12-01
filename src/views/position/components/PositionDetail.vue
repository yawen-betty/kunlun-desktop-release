<script lang="ts" setup>
import {computed, ref, watch, onMounted} from 'vue'
import SvgIcon from '@/components/svgIcon/index.vue'
import {debounce} from '@/utiles/debounce'
import {JobService} from '@/service/JobService'
import {GetPositionDetailOutDto} from '@/api/job/dto/GetPositionDetail'
import {GetPositionReportOutDto} from '@/api/job/dto/GetPositionReport'

const props = withDefaults(defineProps<{
    id?: string
}>(), {
    id: ''
})

const jobService = new JobService()
const activeTab = ref<'analysis' | 'info'>('analysis')
const detailData = ref<GetPositionDetailOutDto | null>(null)
const reportData = ref<GetPositionReportOutDto | null>(null)
const loading = ref(false)

const isInterested = computed(() => (reportData.value?.isInterested ?? 0) === 1)

defineExpose({
    activeTab
})

// 判断是否为空状态
const isEmpty = computed(() => !props.id || (!detailData.value && !loading.value))

// 加载数据
const loadData = async () => {
    if (!props.id) return

    loading.value = true
    try {
        const [detailRes, reportRes] = await Promise.all([
            jobService.getPositionDetail(props.id),
            jobService.getPositionReport(props.id)
        ])

        if (detailRes.code === 200) {
            detailData.value = detailRes.data
        }
        if (reportRes.code === 200) {
            reportData.value = reportRes.data
        }
    } catch (error) {
        console.error('加载职位数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 处理感兴趣按钮点击
const handleInterestClick = debounce(async () => {
    if (!props.id) return
    try {
        const newStatus = isInterested.value ? 0 : 1
        await jobService.markPositionInterest(props.id, newStatus)
        if (detailData.value) {
            detailData.value.isInterested = newStatus
        }
        if (reportData.value) {
            reportData.value.isInterested = newStatus
        }
    } catch (error) {
        console.error('标记感兴趣失败:', error)
    }
}, 300)

// 监听id变化
watch(() => props.id, () => {
    if (props.id) {
        loadData()
    }
}, {immediate: true})

onMounted(() => {
    if (props.id) {
        loadData()
    }
})

// 处理文本格式，将纯文本转换为HTML
const formatDescription = (text: string) => {
    if (!text) return ''
    if (text.includes('<p>') || text.includes('<br>')) return text
    return text
        .split('\n')
        .map(line => line.trim() ? `<p>${line}</p>` : '<p>&nbsp;</p>')
        .join('')
}

const channelMap: Record<number, string> = {
    0: 'BOSS直聘',
    1: '智联校园',
    2: '猎聘',
    3: '国聘',
    4: '应届生招聘',
    5: '拉钩'
}
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
                        <div class="match-rate mb-10">{{ reportData?.matchScore ?? 0 }}% <span
                            class="match-label">匹配度</span></div>
                        <div class="match-desc">{{ reportData?.aiSummary ?? '' }}</div>
                    </div>
                    <img alt="" class="match-img" src="@/assets/images/position_detail.png"/>
                </div>

                <!-- 详细内容 -->
                <div class="analysis-content">
                    <div class="analysis-scroll">
                        <div v-for="(item, index) in reportData?.aiReport" :key="index" class="analysis-item">
                            <div class="dimension-name">{{ item.dimensionName }}</div>
                            <div class="match-level">{{ item.matchLevel }}</div>
                            <div class="analysis-result">{{ item.analysisResult }}</div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- 职位信息 -->
            <template v-else>
                <div class="position-info mt-40">

                    <!-- 职位标题 -->
                    <div class="title-row">
                        <div class="position-title">{{ detailData?.title ?? '' }}</div>
                    </div>

                    <!-- 公司名称 -->
                    <div class="company-name">{{ detailData?.companyName ?? '' }}</div>
                    <!-- 标签组 -->
                    <div class="tags-row mb-20">
                        <span v-for="(tag, index) in detailData?.labels" :key="index" class="tag">{{ tag }}</span>
                    </div>

                    <!-- 工作地址 -->
                    <div class="section">
                        <div class="section-title">工作地址</div>
                        <div class="section-content">{{ detailData?.areaName ?? '' }}</div>
                    </div>

                    <!-- 详细地址 -->
                    <div class="section">
                        <div class="section-title">详细地址</div>
                        <div class="section-content">
                            <div v-for="(address, index) in detailData?.addresses" :key="index">{{ address }}</div>
                        </div>
                    </div>

                    <!-- 职位描述 -->
                    <div class="section description-section">
                        <div class="section-title">职位描述</div>
                        <div class="section-content scroll">
                            <div v-html="formatDescription(detailData?.description ?? '')"></div>
                        </div>
                    </div>

                    <!-- 福利待遇 -->
                    <div class="section">
                        <div class="section-title">福利待遇</div>
                        <div class="tags-row mb-20">
                            <span v-for="(benefit, index) in detailData?.benefits" :key="index" class="tag">{{
                                    benefit
                                }}</span>
                        </div>
                    </div>

                    <!-- 底部信息 -->
                    <div class="footer-info mt-20">
                        <div>职位信息来源于：{{ channelMap[detailData?.sourceChannel ?? 0] ?? '' }}</div>
                        <div>推荐时间：{{ new Date(detailData?.recommendedAt ?? 0).toLocaleString() }}</div>
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
