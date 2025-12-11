<template>
    <div class="personal-info-sidebar">
        <Menu :active-name="modelValue" @on-select="handleSelect">
            <MenuItem class="personal-info-item" v-for="item in menuItems" :key="item.name" :name="item.name">
                <span class="menu-text">{{ item.label }}</span>
                <span v-if="item.name === 'version' && showVersionUpdate" class="red-dot"></span>
            </MenuItem>
        </Menu>

        <div class="logout-btn" @click="logoutState = true">
            <SvgIcon name="icon-tuichu-mian" size="14" color="#B0B7C7" />
            <span class="logout-text">退出登录</span>
        </div>
    </div>

    <Modal v-model="logoutState" :mask-closable="false" :closable="false" footer-hide class="logout-modal">
        <div class="logout-box">
            <div class="logout-content">
                <Icon type="md-close" class="logout-close-icon" @click="logoutState = false" />
                <h3 class="logout-title mb-40">提示</h3>
                <div class="logout-html">退出登录后，下次需使用微信扫码登录；确认是否退出？</div>
            </div>

            <div class="logout-footer">
                <Button class="mr-10 cancel btn" @click="logoutState = false">取消</Button>
                <Button type="primary" class="submit btn" @click="handleSubmitLogout">确定</Button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/svgIcon/index.vue';
import {ref, onMounted, computed, inject, Ref} from 'vue';
import {Button, Icon, Modal} from 'view-ui-plus';
import {AuthService} from '@/service/AuthService.ts';
import {UserInfo} from '@/utiles/userInfo.ts';
import {GetHelpCenterStatusInDto} from '@/api/admin/dto/GetHelpCenterStatus';
import {AdminService} from '@/service/AdminService';

interface Props {
    modelValue: string;
}

interface Emits {
    (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const logoutState = ref(false);
const showHelpCenter = ref(false);
const showVersionUpdate = inject<Ref<boolean>>('showVersionUpdate', ref(false));
const adminService = AdminService.getInstance();
const authService = new AuthService();

const allMenuItems = [
    {name: 'personal', label: '个人信息'},
    {name: 'model', label: '模型账号'},
    // {name: 'cache', label: '清理缓存'},
    {name: 'version', label: '版本更新'},
    {name: 'feedback', label: '问题反馈'},
    {name: 'help', label: '帮助中心', visible: () => showHelpCenter.value},
    {name: 'about', label: '关于我们'},
    {name: 'settings', label: '通用设置'}
];

const menuItems = computed(() => allMenuItems.filter((item) => !item.visible || item.visible()));

/**
 * 组件挂载时获取帮助中心配置，根据 status 字段决定是否显示帮助中心菜单项
 * status: '0' 启用, '1' 停用
 */
onMounted(async () => {
    const res = await adminService.getHelpCenterStatus(new GetHelpCenterStatusInDto());
    if (res.code === 200 && res.data) {
        showHelpCenter.value = res.data.status === '0';
    }
});

/**
 * 处理菜单项选择，触发父组件更新
 * @param name - 菜单项名称
 */
const handleSelect = (name: string) => {
    emit('update:modelValue', name);
};

/**
 * 退出登录，清除用户信息并跳转到登录页
 */
const handleSubmitLogout = () => {
    authService.logout().then(() => {
        UserInfo.logout();
    });
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.personal-info-sidebar {
    width: vw(360);
    height: vh(570);
    background: $white;
    border-radius: vw(2);
    position: relative;

    .personal-info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    :deep(.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu):after) {
        background-color: $white;
    }

    :deep(.ivu-menu-vertical.ivu-menu-light:after) {
        width: 0;
        height: 0;
    }

    :deep(.ivu-menu) {
        background: transparent;
        border: none;
        padding: vw(20);
        margin: 0;
        width: 100% !important;

        .ivu-menu-item {
            height: vh(50);
            line-height: vh(50);
            padding: 0 vw(20);
            margin-bottom: 0;
            border-radius: vw(2);
            position: relative;
            transition: padding-left 0.2s ease-in-out;

            &:hover {
                padding-left: vw(36);
                background: linear-gradient(0deg, #fff8f2 0%, #fff8f2 100%), #e8eaec;
            }

            &:before {
                content: '';
                position: absolute;
                left: vw(20);
                top: 50%;
                transform: translateY(-50%);
                width: vw(6);
                height: vw(6);
                border-radius: 50%;
                background: transparent;
            }

            .menu-text {
                color: $font-dark;
                font-size: vw(16);
                font-weight: 500;
                margin-left: vw(20);
                line-height: vw(20);
            }

            .red-dot {
                width: vw(8);
                height: vw(8);
                background: #ff4d4f;
                border-radius: 50%;
            }

            &.ivu-menu-item-active {
                background: linear-gradient(90deg, $hover-color 0%, $hover-color 100%);

                &:before {
                    background: $theme-color;
                }

                .menu-text {
                    color: $theme-color;
                }
            }

            &:hover:not(.ivu-menu-item-active) {
                background: rgba(0, 0, 0, 0.02);
            }
        }
    }

    .logout-btn {
        position: absolute;
        bottom: vh(20);
        left: 50%;
        transform: translateX(-50%);
        width: vw(320);
        height: vh(40);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: vw(10);
        border: 1px solid $border-default;
        border-radius: vw(2);
        cursor: pointer;
        transition: all 0.2s;

        .logout-text {
            color: $font-light;
            font-size: vw(14);
            font-weight: 500;
        }

        &:hover {
            background: rgba(0, 0, 0, 0.02);
        }
    }
}
</style>

<style lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.logout-modal {
    width: vw(460) !important;
    height: vh(260) !important;

    .ivu-modal {
        top: 50%;
        transform: translateY(-50%);
    }

    .ivu-modal-content {
        border-radius: vw(2);
        height: 100%;

        .ivu-modal-body {
            padding: vh(15) vw(20);
            height: 100%;
        }
    }

    .logout-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;

        .logout-content {
            width: 100%;
            background-color: $white;

            .logout-close-icon {
                position: absolute;
                right: vw(20);
                top: vh(18);
                font-size: vw(20);
                cursor: pointer;
                color: $font-middle;

                &:hover {
                    color: $font-dark;
                }
            }

            .logout-title {
                color: $font-dark;
                text-align: justify;
                font-size: vw(14);
                font-style: normal;
                font-weight: 500;
                line-height: vw(22);
            }

            .logout-html {
                color: $font-dark;
                text-align: justify;
                font-size: vw(14);
                font-style: normal;
                font-weight: 400;
                line-height: vw(20);
            }
        }
    }

    .logout-footer {
        display: flex;
        justify-content: flex-end;

        .btn {
            width: vw(64);
            height: vh(32);
            padding: vh(10) 0;
            color: var(--, var(--, #e8eaec));
            font-size: vw(12);
            font-style: normal;
            font-weight: 500;
            line-height: vw(12);
            text-align: center;
            box-shadow: none;
            border: 0;
            outline: none;

            &.cancel {
                border: 1px solid $theme-color;
                color: $theme-color;
                background: $white;
            }

            &.submit {
                border: 0;
                background: $theme-color;
                color: $white;
            }
        }
    }
}
</style>
