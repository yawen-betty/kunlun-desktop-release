<script setup lang="ts">
import {nextTick, onMounted, ref, watch, computed, inject, type Ref} from 'vue';
import {UserInfo} from '@/utiles/userInfo.ts';
import Ellipsis from '@/components/ellipsis/index.vue';
import routes from '@/router/routers.ts';
import {useRoute, useRouter} from 'vue-router';
import SvgIcon from '@/components/svgIcon/index.vue';
import {hasChineseCharacters} from '@/utiles/validators.ts';
import {Config} from '@/Config.ts';

// 从 App.vue 注入版本更新状态
const showVersionUpdate = inject<Ref<boolean>>('showVersionUpdate', ref(false));

/**
 * 监听窗口大小,调整尺寸 开始
 */
const minSize = ref(false);
const listenerResize = () => {
    minSize.value = window.innerWidth < 1500;
};
/**
 * 监听窗口大小,调整尺寸 结束
 */

/**
 * 处理用户名 结束
 */

const activeMenu = ref();
const route = useRoute();
const router = useRouter();
const menuRef = ref<any>(null);
const selectMenu = (path: string) => {
    router.push({
        path: path
    });
};
watch(route, (newRoute) => {
    activeMenu.value = newRoute.path;
    nextTick(() => {
        menuRef.value.updateActiveName();
    });
});
onMounted(() => {
    listenerResize();
    window.addEventListener('resize', () => {
        listenerResize();
    });

    activeMenu.value = route.path;
});
</script>

<template>
    <div class="left-menu" :class="{minibar: minSize}">
        <div class="user">
            <img v-if="UserInfo.info.avatar" :src="Config.baseUrl + UserInfo.info.avatar" :class="['user-avatar', !minSize && 'mr-10']" />
            <div v-else :class="['user-circle', !minSize && 'mr-10']">{{ hasChineseCharacters(UserInfo.info.userName || '') }}</div>
            <div v-if="!minSize" class="user-text">
                <Ellipsis :content="UserInfo.info.userName" placement="bottom" />
            </div>
        </div>
        <Menu class="menu" :active-name="activeMenu" @on-select="selectMenu" ref="menuRef">
            <template v-for="item in routes" :key="item.path">
                <MenuItem :name="item.path" v-if="item.show">
                    <SvgIcon :name="item.meta.icon" :size="minSize ? '20px' : '16px'" />
                    <span>{{ item.meta.title }}</span>
                    <template v-if="item.path === '/personalInfo' && showVersionUpdate">
                        <SvgIcon class="new-svg" name="icon-triangle" size="10px" />
                        <span class="new-badge">
                            <span style="width: 94px">NEW 新版本！</span>
                            <SvgIcon class="new-close" name="icon-cha" size="10px" color="#fff" @click="showVersionUpdate = false" />
                        </span>
                    </template>
                </MenuItem>
            </template>
        </Menu>
    </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.left-menu {
    width: 160px;
    height: 100vh;
    background: #fff;
    border-right: 1px solid $border-default;
    box-sizing: content-box;

    .menu {
        z-index: 10;
    }

    .user {
        display: flex;
        align-items: center;
        padding: 60px 20px 20px;

        .user-avatar {
            width: vw(30);
            height: vw(30);
            border-radius: 50%;
        }

        .user-circle {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: vw(30);
            height: vw(30);
            border-radius: 50%;
            background: $theme-color;
            margin-right: 10px;
            font-size: 12px;
            font-weight: bold;
            color: #fff;
        }

        .user-text {
            width: 80px;
            font-size: 16px;
            font-weight: bold;
            color: $font-dark;
        }
    }

    :deep(.ivu-menu) {
        width: 160px !important;

        &:after {
            display: none;
        }
    }

    :deep(.ivu-menu-item) {
        position: relative;
        display: flex;
        align-items: center;
        margin: 10px;
        padding: 0 20px;
        width: 140px;
        height: 46px;
        border-radius: 2px;
        font-size: 14px;
        font-weight: bold;
        color: $font-dark;

        &:hover {
            background: $hover-color;
        }

        .svg-icon {
            margin-right: 10px;
            color: $font-dark;
        }
        .new-svg {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: -21px;
        }

        .new-badge {
            box-sizing: border-box;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: -139px;
            width: 130px;
            height: 30px;
            padding: 0 10px;
            display: flex;
            align-items: center;
            background: $remind-red;
            color: $white;
            font-size: 14px;
            line-height: 16px;
            text-align: center;
            border-radius: 4px;

            .new-close {
                margin: 0 0 0 5px;
            }
        }
    }

    .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) {
        background: $theme-color;
        color: #fff;

        .svg-icon {
            color: #fff;
        }

        &:after {
            display: none;
        }
    }
}

.minibar {
    width: 74px;

    .user {
        padding: 55px 0 15px;
        justify-content: center;

        .user-circle {
            width: vw(30);
            height: vw(30);
            font-size: vw(16);
        }
    }

    :deep(.ivu-menu) {
        width: 74px !important;
    }

    :deep(.ivu-menu-item) {
        flex-direction: column;
        justify-content: center;
        width: 54px;
        height: 54px;
        padding: 0;
        font-size: 10px;

        .svg-icon:not(.new-svg, .new-close) {
            margin-right: 0;
            margin-bottom: 6px;
        }
    }
}
</style>
