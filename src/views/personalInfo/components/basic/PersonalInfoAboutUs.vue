<template>
    <div class="about-us">
        <h1 class="about-title">关于我们</h1>

        <Button type="primary" @click="handleGoToWebsite" class="website-btn">点击，前去官网</Button>

        <div class="agreements">
            <span class="agreement-link" @click="handleServiceAgreement">《服务协议》</span>
            <span class="agreement-link" @click="handlePrivacyAgreement">《隐私协议》</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import {Button} from 'view-ui-plus';

const handleGoToWebsite = () => {
    // 跳转到官网
    window.open('https://www.example.com', '_blank');
};

const handleServiceAgreement = () => {
    // 显示服务协议
    console.log('显示服务协议');
};

const handlePrivacyAgreement = () => {
    // 显示隐私协议
    console.log('显示隐私协议');
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.about-us {
    width: vw(1279);
    height: vh(940);
    background: $white;
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);
    padding: vh(40);
    position: relative;

    .about-title {
        font-family: YouSheBiaoTiHei;
        font-size: vw(28);
        color: $font-dark;
        font-weight: 400;
        line-height: vh(28);
        margin: 0;
        position: absolute;
        top: vh(40);
        left: vw(40);
    }

    .website-btn {
        position: absolute;
        top: vh(128);
        left: vw(40);
        background: linear-gradient(90deg, #ffb32c 0%, #fc8919 100%);
        border: none;
        border-radius: vw(2);
        padding: vh(10) vw(20);
        font-size: vw(12);
        font-weight: 600;
        color: $white;
        line-height: vh(12);
        box-shadow: none;

        :deep(.ivu-btn-loading-icon) {
            display: none;
        }
    }

    .agreements {
        position: absolute;
        top: vh(200);
        left: vw(40);
        display: flex;
        flex-direction: column;
        gap: vh(22);

        .agreement-link {
            font-size: vw(16);
            color: $theme-color;
            font-weight: 500;
            line-height: vh(22);
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
