<template>
    <div v-if="resumeList.length > 0" class="resume-container">
        <div v-for="(resume,index) in resumeList" :key="resume.uuid" class="resume-card">
            <div :class="['resume-content',`resume-content-index_${index}`]">
                <div class="resume-content-wrapper">
                    <ResumePreviewCard :resume-data="resume" :scrollable="true" size="small"/>
                </div>
            </div>
            <div class="resume-info mt-15">
                <div class="resume-name">
                    <span>{{ resume.name }}</span>

                    <Poptip placement="bottom-end">
                        <SvgIcon class="pointer" color="#9499A4" name="icon-gengduo" size="18"/>

                        <template #content>
                            <div class="select-list">
                                <div v-for="info in selectList"
                                     :key="info.key"
                                     :class="['select-item', 'pointer',info.key === 'delete' && 'select-delete']"
                                     @click.stop="handleClick(resume,info.key)">
                                    <SvgIcon :color="info.key === 'delete' ? '#EC6B62' :'#9499A5'" :name="info.icon"
                                             class="select-icon mr-10"
                                             size="12"/>
                                    <span class="select-name">{{ info.name }}</span>
                                </div>
                            </div>
                        </template>
                    </Poptip>
                </div>
                <div class="resume-time mt-10">{{ parseDate(resume.createTime!, '{y}-{m}-{d} {h}:{i}') }}</div>
            </div>
        </div>
    </div>

    <div v-else class="no-data">
        <img class="no-data_icon" src="@/assets/images/no-data.png"/>
        <div class="no-data-text">暂无数据</div>
    </div>

    <Modal
        v-model="previewVisible"
        :closable="false"
        :mask-closable="false"
        :width="1200"
        class="resume-preview-modal"
        footer-hide
    >
        <div class="preview-header">
            <div class="preview-title">预览</div>
            <SvgIcon class="cha pointer" color="#9499A4" name="icon-cha" size="20"
                     @click="previewVisible = false"></SvgIcon>
        </div>
        <div class="preview-content">
            <ResumePreviewCard :resume-data="previewResume" size="large"/>
        </div>
    </Modal>


    <Modal
        v-model="deleteVisible"
        :closable="false"
        :mask-closable="false"
        class="resume-delete-modal"
        footer-hide
    >
        <div class="delete-box">
            <div class="delete-content">
                <div class="delete-header">
                    <h3 class="delete-title mb-40">提示</h3>
                    <SvgIcon class="cha pointer" color="#9499A4" name="icon-cha" size="20"
                             @click="deleteVisible = false"></SvgIcon>
                </div>
                <div class="delete-html">删除后将无法恢复，确认是否删除？</div>
            </div>

            <div class="delete-footer">
                <Button class="mr-10 cancel btn" @click="deleteVisible = false">取消</Button>
                <Button class="submit btn" type="primary" @click="handleDeleteResume">确定</Button>
            </div>
        </div>

    </Modal>

    <Modal
        v-model="editVisible"
        :closable="false"
        :mask-closable="false"
        class="resume-delete-modal"
        footer-hide
    >
        <div class="delete-box">
            <div class="delete-content">
                <div class="delete-header">
                    <h3 class="delete-title mb-40">提示</h3>
                    <SvgIcon class="cha pointer" color="#9499A4" name="icon-cha" size="20"
                             @click="deleteVisible = false"></SvgIcon>
                </div>
                <div class="delete-html">当前有正在编辑的简历，如执行此操作将会中断当前的简历制作；是否继续？</div>
            </div>

            <div class="delete-footer">
                <Button class="mr-10 cancel btn" @click="editVisible = false">取消</Button>
                <Button class="submit btn" type="primary" @click="handleEditResume">确定</Button>
            </div>
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import SvgIcon from "@/components/svgIcon/index.vue";
import {Button, Icon, Message, Modal} from "view-ui-plus";
import ResumePreviewCard from "@/views/resume/components/ResumePreviewCard.vue";
import {ResumeService} from "@/service/ResumeService.ts";
import {MyResumeBean} from "@/api/resume/dto/bean/MyResumeBean.ts";
import {GetModelAccountInDto} from "@/api/user/dto/GetModelAccount.ts";
import {GetMyResumeListInDto} from "@/api/resume/dto/GetMyResumeList.ts";
import {parseDate} from "@/utiles/DateUtils.ts";
import {useRouter} from "vue-router";
import {CopyResumeInDto} from "@/api/resume/dto/CopyResume.ts";
import {message} from "@/utiles/Message.ts";
import {download} from "@/utiles/download.ts";
import {UserInfo} from "@/utiles/userInfo.ts";

interface SelectItem {
    name: string;
    icon: string;
    key: string
}

const resumeService = new ResumeService();
const router = useRouter();

// 预览弹窗状态
const previewVisible = ref<boolean>(false);
// 预览简历
const previewResume = ref<MyResumeBean>(new MyResumeBean());
// 删除弹窗状态
const deleteVisible = ref<boolean>(false);
// 刪除简历Id
const deleteResumeId = ref<string>('');
// 编辑弹窗状态
const editVisible = ref<boolean>(false);
// 编辑简历id
const editResumeId = ref<string>('');
// 简历列表
const resumeList = ref<MyResumeBean[]>([]);

const selectList = ref<SelectItem[]>([
    {name: '预览', icon: 'icon-yulan', key: 'preview'},
    {name: '编辑', icon: 'icon-bianji', key: 'edit'},
    {name: '复制', icon: 'icon-fuzhi-mian', key: 'copy'},
    {name: '下载', icon: 'icon-xiazai', key: 'download'},
    {name: '删除', icon: 'icon-lajitong-mian', key: 'delete'},
])

// 处理点击事件
const handleClick = (resume: MyResumeBean, key: string) => {

    document.body.click();
    switch (key) {
        case 'preview':
            previewResume.value = resume;
            previewVisible.value = true;
            break;
        case 'edit':
            if (UserInfo.info.runningResumeId && UserInfo.info.runningResumeId !== resume.uuid) {
                editVisible.value = true
                editResumeId.value = resume.uuid!
                return;
            }

            router.push(`/resume?resumeId=${resume.uuid}`)
            break;
        case 'copy':
            handleCopyResume(resume.uuid!)
            break;
        case 'download':
            downLoadResume(resume)
            break;
        case 'delete':
            if (UserInfo.info.runningResumeId === resume.uuid) {
                message.error(Message, '简历正在编辑中，不可删除！');
                return;
            }
            deleteVisible.value = true;
            deleteResumeId.value = resume.uuid!
            break;
    }
}

// 跳转编辑
const handleEditResume = () => {
    router.push(`/resume?resumeId=${editResumeId.value}`)
}

// 删除
const handleDeleteResume = () => {
    const data: CopyResumeInDto = {
        resumeId: deleteResumeId.value
    }
    resumeService.deleteResume(data).then(res => {
        if (res.code === 200) {
            message.success(Message, '简历删除成功！');
            deleteVisible.value = false;
            getResumeList();
        }
    })
}

// 下載
const downLoadResume = (resume: MyResumeBean) => {
    const index = resumeList.value.findIndex(info => info.uuid === resume.uuid);

    download(`.resume-content-index_${index} .resume-content-wrapper`, 'pdf', resume.name!)
}

// 复制
const handleCopyResume = (resumeId: string) => {
    const data: CopyResumeInDto = {
        resumeId
    }

    resumeService.copyResume(data).then(res => {
        if (res.code === 200) {
            message.success(Message, '复制简历成功！');
            getResumeList();
        }
    })
}

// 获取简历列表
const getResumeList = () => {
    resumeService.getMyResumeList(new GetMyResumeListInDto()).then(res => {
        if (res.code === 200) {
            resumeList.value = res.data.resumes!;
        }
    })
}

onMounted(() => {
    getResumeList();
})

</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-container {
    display: flex;
    gap: vw(40);
    padding: vh(40) vw(49) 0 vw(41);
}

.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .no-data_icon {
        width: vw(140);
        height: vh(148);
    }

    .no-data-text {
        color: $icon-gray;
        font-size: vw(24);
        font-style: normal;
        font-weight: 400;
        line-height: vw(24);
    }
}

.resume-card {
    width: vw(530);
    height: vh(750);
    display: flex;
    flex-direction: column;
}

.resume-content {
    width: 100%;
    height: vh(749);
    overflow: hidden;
    background-color: $white;
    box-shadow: 0 0 6.625px 0 rgba(0, 0, 0, 0.10);
    border-radius: vw(2);

}

.resume-content-wrapper {
    padding: vh(15) vw(20);
}

.resume-info {
    .resume-name {
        display: flex;
        justify-content: space-between;
        align-content: center;

        span {
            color: $font-dark;
            font-size: vw(18);
            font-style: normal;
            font-weight: 500;
            line-height: vw(18);
        }
    }
}

.resume-time {
    color: $font-light;
    font-size: vw(16);
    line-height: vw(16);
    font-style: normal;
    font-weight: 500;
}

:deep(.ivu-poptip-body) {
    padding: vw(10);
}

.select-list {
    width: vw(180);

    .select-item {
        width: 100%;
        height: vh(32);
        padding: 0 vw(10);
        display: flex;
        justify-content: flex-start;
        align-content: center;
        flex-wrap: wrap;
        transition: padding-left 0.2s ease-in-out;

        .select-name {
            color: $font-dark;
            font-size: vw(14);
            font-style: normal;
            font-weight: 400;
            line-height: vw(14);
        }

        &:hover {
            background: linear-gradient(0deg, #FFF8F2 0%, #FFF8F2 100%), #E8EAEC;
            padding-left: vw(26)
        }
    }

    .select-delete {
        .select-name {
            color: #EC6B62;
        }

        .select-icon use {
            fill: #EC6B62;
        }

    }
}

</style>

<style lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-preview-modal {
    .ivu-modal-body {
        padding: 0 !important;
        border-radius: vw(2);
        height: vh(1000);
        overflow-y: hidden;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: vw(20);
        box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.10);

        .preview-title {
            color: $font-dark;
            font-size: vw(24);
            font-style: normal;
            font-weight: 600;
            line-height: vw(24);
        }
    }

    .preview-content {
        height: 100%;
        overflow-y: auto;
        padding: vw(48);
    }
}

.resume-delete-modal {
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

    .delete-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;


        .delete-content {
            width: 100%;
            background-color: $white;

            .delete-header {
                display: flex;
                justify-content: space-between;
            }


            .delete-close-icon {
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

            .delete-title {
                color: $font-dark;
                text-align: justify;
                font-size: vw(14);
                font-style: normal;
                font-weight: 500;
                line-height: vw(22)
            }

            .delete-html {
                color: $font-dark;
                text-align: justify;
                font-size: vw(14);
                font-style: normal;
                font-weight: 400;
                line-height: vw(20)
            }
        }
    }

    .delete-footer {
        display: flex;
        justify-content: flex-end;

        .btn {
            width: vw(64);
            height: vh(32);
            padding: vh(10) 0;
            color: var(--, var(--, #E8EAEC));
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
