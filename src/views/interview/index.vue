<!-- 模拟面试页面 -->
<script lang="ts" setup>
import SvgIcon from "@/components/svgIcon/index.vue";

const infoList = [
    '依岗定题，凭简历复盘，面试更精准',
    '不知简历差在哪？面完打分，短板秒抓！',
    '简历对接岗位题，模拟面完有分析！',
    '先模拟，再实战，求职少走弯',
    '每一次模拟，都离 offer 近一步'
]

const websiteUrl = 'https://www.example.com'

</script>

<template>
    <div class="interview-page">
        <div class="interview-page-wrapper">
            <div class="prod-left">
                <div class="title">
                    <SvgIcon class="ai-icon" color="#FC8719" name="icon-AI" size="40"/>
                    <span>模拟面试</span>
                </div>

                <div class="step-item step-1">
                    <div class="step-number">1</div>
                    <p class="step-text">前去官网，下载并安装APP</p>
                </div>

                <a :href="websiteUrl" class="submit-btn" target="_blank">
                    前去官网
                </a>

                <div class="divider"></div>

                <div class="step-item step-2">
                    <div class="step-number">2</div>
                    <p class="step-text">AI 模拟面试两大功能</p>
                </div>

                <div class="feature-section">
                    <p class="feature-title">一、AI面试辅导：可在APP中开始辅导</p>
                    <img alt="AI面试辅导" class="feature-img" src="../../assets/images/interview-feature1.png">
                </div>

                <div class="feature-section">
                    <p class="feature-title">二、AI面试间：可在APP中开始面试</p>
                    <img alt="AI面试间" class="feature-img" src="../../assets/images/interview-feature2.png">
                </div>
            </div>
            <div class="prod-right">
                <div class="big-title mb-55">
                    <p>没实战怕翻车？</p>
                    <p class="plus">AI模拟面，底气先满！</p>
                </div>
                <div class="info">
                    <ul class="info-ul">
                        <li v-for="item in infoList" :key="item"><span>·</span>{{ item }}</li>
                    </ul>
                    <img alt="" src="../../assets/images/interview.png">
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.interview-page {
    height: 100%;
    padding: vh(40);

    .interview-page-wrapper {
        display: flex;
        height: 100%;
        padding: vh(40) 0;
        background: $white;
    }

    .prod-left {
        position: relative;
        width: vw(600);
        height: 100%;
        padding: vh(60) 0 0 vw(80);
        border-right: vw(2) $border-default solid;

        .title {
            display: flex;
            align-items: center;
            margin-bottom: vh(60);
            color: $font-dark;
            font-family: 'YouSheBiaoTiHei';
            font-size: vw(38);
            line-height: vh(50);

            svg {
                width: vw(50) !important;
                height: vw(50) !important;
                margin-right: vw(20);
            }
        }

        .step-item {
            display: flex;
            align-items: center;
            margin-bottom: vh(20);

            .step-number {
                display: flex;
                align-items: center;
                justify-content: center;
                width: vw(25);
                height: vw(25);
                border-radius: 50%;
                background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
                color: $white;
                font-family: "PingFang SC";
                font-size: vw(16);
                font-weight: 500;
                margin-right: vw(22);
            }

            .step-text {
                color: $font-dark;
                font-family: "PingFang SC";
                font-size: vw(16);
                font-weight: 600;
                line-height: vh(16);
                margin: 0;
            }
        }

        .step-1 {
            margin-left: vw(4);
        }

        .step-2 {
            margin-left: vw(4);
            margin-bottom: vh(20);
        }

        .submit-btn {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: vw(88);
            height: vh(32);
            padding: vh(10) vw(20);
            margin-left: vw(50);
            margin-bottom: vh(40);
            border-radius: vw(2);
            background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
            color: $white;
            font-family: "PingFang SC";
            font-size: vw(12);
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
        }

        .divider {
            width: vw(500);
            height: 0;
            border-top: vh(1) solid $border-default;
            margin-left: vw(-28);
            margin-bottom: vh(40);
        }

        .feature-section {
            margin-left: vw(50);
            margin-bottom: vh(40);

            .feature-title {
                color: $font-dark;
                font-family: "PingFang SC";
                font-size: vw(16);
                line-height: vh(16);
                margin: 0 0 vh(20) 0;
            }

            .feature-img {
                width: vw(341);
                height: vh(134);
                border: vw(1) solid $border-default;
                border-radius: vw(5);
                object-fit: cover;
            }
        }
    }

    .prod-right {
        flex: 1;
        padding: vh(122) vw(91) vh(106) vw(75);

        .big-title {
            color: $font-dark;
            font-family: 'YouSheBiaoTiHei';
            font-size: vw(36);
            line-height: vh(66); /* 183.333% */

            .plus {
                font-size: vw(56);
            }
        }

        .info {
            display: flex;
            align-items: flex-end;
            height: vh(512);

            .info-ul {
                height: 100%;

                li {
                    color: #9499A4;
                    font-family: 'YouSheBiaoTiHei';
                    font-size: vw(22);
                    line-height: vh(40); /* 181.818% */

                    span {
                        margin-right: vw(5);
                    }
                }
            }

            img {
                width: vw(459);
                height: vh(375);
            }
        }
    }
}
</style>
