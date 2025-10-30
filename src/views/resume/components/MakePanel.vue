<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {Message, RadioGroup} from "view-ui-plus";
import SvgIcon from "@/components/svgIcon/index.vue";

// 输入框提示词列表
const placeholderList = [
    '人工智能',
    '产品经理',
    'Java开发工程师',
    'UI设计师',
    '销售经理',
    '运营专员',
    '语文教师',
    '信贷专员',
    '会计',
    '律师'
]

const infoList = [
    '10分钟顶3小时，AI一键出简历',
    '输入经历，帮你搞定剩下的',
    '不会夸自己？把“普通经历”写得更值钱',
    '同份经历，帮你改出“适配不同岗位”的版本',
    'AI简历定制，让Offer多来几封'
]
const placeholderIdx = ref<number>(0)
const formRef = ref();
const formRules = {
    resumeName: [{ required: true, message: '请输入求职岗位！', trigger: 'submit'}],
    identity: [{ required: true, message: '请选择身份！', trigger: 'submit'}],
}
const formData = reactive({
    identity: '',
    resumeName: ''
})

const submit = () => {
    if(!formData.resumeName.trim())return Message.error('请输入求职岗位！')
    if(!formData.identity)return Message.error('请选择身份！')
}

onMounted(() => {
    setInterval(() => {
        placeholderIdx.value++;
        if (placeholderIdx.value === placeholderList.length) {
            placeholderIdx.value = 0
        }
    }, 2000)
})
</script>

<template>
    <div class="resume-prod-cont">
        <div class="prod-left">
            <div class="title">简历制作</div>
            <Form ref="formRef" class="custom-form" :model="formData" :rules="formRules">
                <FormItem prop="resumeName">
                    <Input v-model="formData.resumeName" class="job-name" :placeholder="placeholderList[placeholderIdx]" :max-length="20"/>
                </FormItem>
                <FormItem class="custom-form-item" prop="identity">
                    <RadioGroup v-model="formData.identity" class="custom-radio">
                        <Radio label="0">职场人</Radio>
                        <Radio label="1">在校/应届生</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem>
                    <p class="tip">已有简历，上传后帮你润色</p>
                    <Upload action="//jsonplaceholder.typicode.com/posts/" :show-upload-list="false">
                        <Button class="upload-btn">
                            <SvgIcon class="mr-5" name="icon-daoru" size="16" />
                            上传简历
                        </Button>
                    </Upload>
                    <div class="file-box mt-10 pl-20 pr-15 flex-column align-between">
                        <div class="file-name flex-column">
                            <SvgIcon name="icon-pdf" size="24"/>
                            <div class="file-status ml-20">
                                <p class="mb-10 name">行政专员-聘小方.pdf</p>
                                <p class="status">上传中...<span class="ml-5 mr-5"></span>196KB</p>
                            </div>
                        </div>
                        <SvgIcon class="pointer" name="icon-bufuhe" size="20" color="#FC8719"/>
                    </div>
                </FormItem>
            </Form>
            <div class="submit-btn" @click="submit">
                <SvgIcon class="mr-5" name="icon-bianji" size="10" />
                立即制作
            </div>
        </div>
        <div class="prod-right">
            <div class="big-title mb-55">
                <p>别被简历难住！</p>
                <p class="plus">AI让“写简历”变简单</p>
            </div>
            <div class="info">
                <ul class="info-ul">
                    <li v-for="item in infoList" :key="item"><span>·</span>{{ item }}</li>
                </ul>
                <img src="../../../assets/images/resume.png" alt="">
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.resume-prod-cont {
    display: flex;
    height: 100%;
    padding: vh(40) 0;
    background: $white;

    .prod-left {
        width: vw(600);
        height: 100%;
        padding: vh(138) vw(120) 0 vw(80);
        border-right: vw(2) $border-default solid;

        .title {
            margin-bottom: vh(50);
            color: $font-dark;
            font-family: 'YouSheBiaoTiHei';
            font-size: vw(38);
            font-style: normal;
            line-height: vh(50); /* 131.579% */
        }

        .custom-form {
            width: vw(400);

            :deep(.job-name){
                .ivu-input{
                    background-color: $white;
                    border:vw(1) solid $theme-color !important;
                }
            }

            .file-box{
                height: vh(70);
                padding-top: vh(16);
                padding-bottom: vh(16);
                border-radius: vw(2);
                background: $bg-gray;
                line-height: normal;

                .name{
                    color: $font-dark;
                    font-family: Inter;
                    font-size: vw(14);
                    font-weight: 500;
                }

                .status{
                    display: flex;
                    align-items: center;
                    color: #B0B7C6;
                    font-family: Inter;
                    font-size: vw(12);
                    font-weight: 500;

                    span{
                        width: vw(1);
                        height: vh(12);
                       background: #B0B7C6;
                    }
                }
            }
        }

        :deep(.custom-radio .ivu-radio-wrapper) {
            width: vw(190);
            margin-right: vw(20);

            &:last-child {
                margin-right: 0;
            }
        }

        .tip {
            margin-bottom: vh(10);
            color: $font-dark;
            font-family: "PingFangSCBold";
            font-size: vw(14);
            line-height: vh(16); /* 114.286% */
        }

        .upload-btn {

            width: vw(400);
            height: vh(50);
            border-radius: vw(2);
            border: vw(1.5) dashed $border-default;
            color: #9499A4;
            font-family: "PingFangSCBold";
            font-size: vw(16);
            font-weight: 600;
            line-height: vh(16); /* 100% */

            &:hover {
                color: $theme-color;
                border-color: $theme-color;
            }

            :deep(>span){
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .submit-btn {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: vw(104);
            height: vh(32);
            padding: vh(10) vw(20);
            border-radius: vw(2);
            background: linear-gradient(90deg, #FFB32C 0%, #FC8919 100%);
            color: $white;
            font-family: "PingFangSCBold";
            font-size: vw(12);
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
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
            height: calc(100% - vh(180));

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
