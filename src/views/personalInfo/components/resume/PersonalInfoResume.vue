<template>
  <div class="resume-container">
    <div class="resume-card" v-for="resume in resumeList" :key="resume.uuid">
      <div class="resume-content">
        <ResumePreviewCard :resume-data="resume" :scrollable="false" size="small"/>
      </div>
      <div class="resume-info mt-15">
        <div class="resume-name">
          <span>{{ resume.name }}</span>

          <Poptip placement="bottom-end" v-model="isShow">
            <SvgIcon name="icon-gengduo" size="18" color="#9499A4" class="pointer"/>

            <template #content>
              <div class="select-list">
                <div :class="['select-item', 'pointer',info.key === 'delete' && 'select-delete']"
                     v-for="info in selectList" :key="info.key" @click.stop="handleClick(resume,info.key)">
                  <SvgIcon :name="info.icon" size="12" color="#9499A5" class="select-icon mr-10"/>
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

  <Modal
    v-model="previewVisible"
    :mask-closable="false"
    :closable="false"
    footer-hide
    :width="1200"
    class="resume-preview-modal"
  >
    <div class="preview-header">
      <div class="preview-title">预览</div>
      <SvgIcon name="icon-cha" size="20" class="cha pointer" @click="previewVisible = false" color="#9499A4"></SvgIcon>
    </div>
    <div class="preview-content pt-20"></div>
  </Modal>


  <Modal
    v-model="deleteVisible"
    :mask-closable="false"
    :closable="false"
    footer-hide
    class="resume-delete-modal"
  >
    <div class="delete-box">
      <div class="delete-content">
        <div class="delete-header">
          <h3 class="delete-title mb-40">提示</h3>
          <SvgIcon name="icon-cha" size="20" class="cha pointer" @click="deleteVisible = false"
                   color="#9499A4"></SvgIcon>
        </div>
        <div class="delete-html">删除后将无法恢复，确认是否删除？</div>
      </div>

      <div class="delete-footer">
        <Button class="mr-10 cancel btn" @click="deleteVisible = false">取消</Button>
        <Button type="primary" class="submit btn" @click="handleDeleteResume">确定</Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import SvgIcon from "@/components/svgIcon/index.vue";
import {Button, Icon, Modal} from "view-ui-plus";
import ResumePreviewCard from "@/views/resume/components/ResumePreviewCard.vue";
import {ResumeService} from "@/service/ResumeService.ts";
import {MyResumeBean} from "@/api/resume/dto/bean/MyResumeBean.ts";
import {GetModelAccountInDto} from "@/api/user/dto/GetModelAccount.ts";
import {GetMyResumeListInDto} from "@/api/resume/dto/GetMyResumeList.ts";
import {parseDate} from "@/utiles/DateUtils.ts";

interface SelectItem {
  name: string;
  icon: string;
  key: string
}

const resumeService = new ResumeService();

// 预览弹窗状态
const previewVisible = ref<boolean>(false);
// 预览简历id
const previewResumeId = ref<string>('');
// 删除弹窗状态
const deleteVisible = ref<boolean>(false);
const isShow = ref<boolean>(false);

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

  isShow.value = false
  switch (key) {
    case 'preview':
      previewResumeId.value = resume.id!
      previewVisible.value = true;
      break;
    case 'edit':
      console.log('编辑');
      break;
    case 'copy':
      console.log('复制');
      break;
    case 'download':
      console.log('下载');
      break;
    case 'delete':
      deleteVisible.value = true;
      break;
    default:
      break;
  }
  console.log(key)
}

// 删除
const handleDeleteResume = () => {

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

<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-container {
  display: flex;
  gap: vw(40);
  padding: vh(40) vw(49) 0 vw(41);
}

.resume-card {
  width: vw(530);
  display: flex;
  flex-direction: column;
}

.resume-content {
  width: 100%;
  height: vh(749);
  background-color: $white;
  box-shadow: 0 0 6.625px 0 rgba(0, 0, 0, 0.10);
  border-radius: vw(2);
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
