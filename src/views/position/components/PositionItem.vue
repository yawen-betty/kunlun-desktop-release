<script lang="ts" setup>
import {ref, onMounted, nextTick} from 'vue';
import {MatchedPositionBean} from "@/api/job/dto/bean/MatchedPositionBean.ts";
import {channelList, enumEcho} from "@/enums/enumDict.ts";
import {parseDate} from "@/utiles/DateUtils.ts";
import {openWeb} from "@/utiles/openWeb.ts";
import SvgIcon from "@/components/svgIcon/index.vue";
import Ellipsis from "@/components/ellipsis/index.vue";

const props = defineProps<{
    item: MatchedPositionBean
    isActive: boolean
}>()

const emit = defineEmits<{
    'select': [id: string]
}>()

const tagsWrapperRef = ref<HTMLElement>()
const visibleTags = ref<string[]>([])

const getAllTags = (item: MatchedPositionBean) => {
    const tags: string[] = []
    if (item.educational) tags.push(item.educational)
    if (item.workExperience) tags.push(item.workExperience)
    if (item.labels) tags.push(...item.labels)
    return tags
}

const calculateVisibleTags = () => {
    if (!tagsWrapperRef.value) return

    const allTags = getAllTags(props.item)
    const containerWidth = tagsWrapperRef.value.offsetWidth
    const tagElements = tagsWrapperRef.value.querySelectorAll('.tag-item')
    const result: string[] = []
    let totalWidth = 0

    tagElements.forEach((el, index) => {
        const tagWidth = (el as HTMLElement).offsetWidth + 10
        if (totalWidth + tagWidth <= containerWidth) {
            totalWidth += tagWidth
            result.push(allTags[index])
        }
    })

    visibleTags.value = result
}

const openBaidu = async (url: string) => {
    if (url) {
        await openWeb(url)
    }
}

onMounted(() => {
    nextTick(() => {
        calculateVisibleTags()
    })
})
</script>

<template>
    <div :class="{ 'is-active': isActive }" class="position-item" @click="emit('select', item.uuid)">
        <div class="item-top">
            <div class="top-left">
                <Ellipsis :content="item.title" class="item-title"/>
                <div class="match-badge">
                    <SvgIcon color="#FC8919" name="icon-pipei" size="14"/>
                    <span>{{ item.matchScore }}%</span>
                </div>
            </div>
            <span class="item-salary">{{ [item.salary, item.salaryNumber].filter(Boolean).join('·') }}</span>
        </div>
        <div class="item-middle">
            <div ref="tagsWrapperRef" class="item-tags-wrapper">
                <div class="item-tags">
                    <span v-for="(tag, idx) in (visibleTags.length ? visibleTags : getAllTags(item))" :key="idx"
                          class="tag-item">{{ tag }}</span>
                </div>
            </div>
            <span class="item-time">{{ parseDate(item.recommendedAt, '{y}-{m}-{d} {h}:{i}') }} <span
                class="separator">｜</span>{{ enumEcho(item.sourceChannel, channelList, 'value', 'key') }}</span>
        </div>
        <div class="item-bottom">
            <span class="company-info">{{ item.areaName }}
                <span v-if="item.companyName" class="separator">｜</span>{{ item.companyName }}</span>
            <div class="item-action pointer" @click.stop="openBaidu(item.jobDetailUrl)">
                <SvgIcon color="#9499A4" name="icon-send" size="14"/>
                <span>去投递</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

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
            max-width: 80%;
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
            flex-shrink: 0;
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
        gap: vw(10);

        .item-tags-wrapper {
            flex: 1;
            min-width: 0;

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
                    white-space: nowrap;
                    flex-shrink: 0;
                }
            }
        }

        .item-time {
            font-size: vw(14);
            color: $font-middle;
            line-height: vw(14);
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;

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
</style>
