<script lang="ts" setup>
interface Props {
    current: number
    pageSize: number
    total: number
    pageSizeOpts?: number[]
}

interface Emits {
    (e: 'update:current', value: number): void

    (e: 'update:pageSize', value: number): void

    (e: 'on-change', page: number): void

    (e: 'on-page-size-change', pageSize: number): void
}

const props = withDefaults(defineProps<Props>(), {
    pageSizeOpts: () => [10, 20, 50]
})

const emit = defineEmits<Emits>()

const handlePageChange = (page: number) => {
    emit('update:current', page)
    emit('on-change', page)
}

const handlePageSizeChange = (pageSize: number) => {
    emit('update:pageSize', pageSize)
    emit('update:current', 1)
    emit('on-page-size-change', pageSize)
}
</script>

<template>
    <div class="pagination-wrapper">
        <div class="pagination-left mr-10">
            <span class="total-text mr-20">共{{ total }}条</span>
            <Select :model-value="pageSize" class="page-size-select" @on-change="handlePageSizeChange">
                <Option v-for="item in pageSizeOpts" :key="item" :value="item">{{ item }}条/页</Option>
            </Select>
        </div>
        <Page
            :model-value="current"
            :page-size="pageSize"
            :total="total"
            class="custom-page"
            show-elevator
            @on-change="handlePageChange"
        />
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.pagination-wrapper {
    width: 100%;
    height: vh(70);
    background: $white;
    border-radius: vw(2);
    margin-top: vh(10);
    padding: 0 vw(20);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;

    :deep(.page-size-select) {
        width: vw(88);
        height: vh(30);

        .ivu-select-selection {
            height: 100%;
            border: 1px solid $border-default;
            border-radius: vw(2);
            padding: vh(3) vw(10);
            background: $white;

            &:hover {
                border-color: $theme-color;
            }

            > div {
                height: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .ivu-select-selected-value {
                    height: 100%;
                    line-height: vh(22);
                    font-size: vw(14);
                    color: $font-middle;
                    padding: 0;
                }

                .ivu-icon {
                    position: unset;
                    transform: translateY(0);
                }
            }
        }

        .ivu-select-dropdown {
            width: vw(200);
        }

        &.ivu-select-visible {
            .ivu-select-selection {
                border: 1px solid $theme-color !important;
            }

            .ivu-select-arrow {
                transform: rotate(180deg) !important;
            }
        }
    }

    .total-text {
        font-size: vw(12);
        color: $font-dark;
    }

    :deep(.custom-page) {
        display: flex;
        align-items: center;
        column-gap: vw(10);

        li {
            margin: 0;
        }

        .ivu-page-item {
            display: flex;
            justify-content: center;
            align-items: center;
            width: vw(30);
            height: vw(30);
            border: 1px solid $border-default;
            border-radius: vw(2);
            font-size: vw(14);
            color: $font-middle;
            box-sizing: border-box;
            min-height: unset;
            min-width: unset;

            &:hover {
                border-color: $theme-color;

                a {
                    color: $theme-color;
                }
            }
        }

        .ivu-page-item-active {
            border-color: $theme-color;
            background: transparent;

            a {
                color: $theme-color;
            }
        }

        .ivu-page-item-jump-next .ivu-icon-ios-arrow-forward, .ivu-page-item-jump-prev .ivu-icon-ios-arrow-back {
            color: $theme-color;
        }

        .ivu-page-prev,
        .ivu-page-next {
            display: flex;
            justify-content: center;
            align-items: center;
            width: vw(30);
            height: vw(30);
            border: 1px solid $border-default;
            border-radius: vw(2);
            min-height: unset;
            min-width: unset;

            a {
                font-size: vw(14);
                color: $font-middle;
            }

            &:hover {
                border-color: $theme-color;

                a {
                    color: $theme-color;
                }
            }
        }

        .ivu-page-options {
            display: flex;
            align-items: center;
            column-gap: vw(10);
            margin: 0;
            font-size: vw(12);

            .ivu-page-options-sizer {
                display: none;
            }

            .ivu-page-options-elevator {
                display: flex;
                align-items: center;
                column-gap: vw(8);

                input {
                    width: vw(30);
                    height: vw(30);
                    border: 1px solid $border-default !important;
                    border-radius: vw(2);
                    text-align: center;
                    font-size: vw(14);
                    color: $font-middle;
                    margin: 0;

                    &:focus, &:hover {
                        border-color: $theme-color !important;
                    }
                }
            }
        }
    }
}
</style>
