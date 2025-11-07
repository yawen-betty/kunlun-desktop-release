<template>
  <div class="resume-container">
    <div class="resume-card" v-for="(resume, index) in resumeList" :key="index">
      <div class="resume-content">
        <!-- 预留简历内容区域 -->
      </div>
      <div class="resume-info mt-15">
        <div class="resume-name">
          <span>{{ resume.name }}</span>


          <Poptip placement="bottom-end">
            <SvgIcon name="icon-gengduo" size="18" color="#9499A4" class="pointer"/>

            <template #content>
              <div class="select-list">
                <div :class="['select-item', 'pointer',info.key === 'delete' && 'select-delete']"
                     v-for="info in selectList" :key="info.key" @click="handleClick(resume,info.key)">
                  <SvgIcon :name="info.icon" size="12" color="#9499A5" class="select-icon mr-10"/>
                  <span class="select-name">{{ info.name }}</span>
                </div>
              </div>
            </template>
          </Poptip>
        </div>
        <div class="resume-time mt-10">{{ resume.time }}</div>
      </div>
    </div>
  </div>

  <Modal
    v-model="previewVisible"
    :mask-closable="false"
    :closable="false"
    footer-hide
    class="preview-modal"
  >
    <div class="preview-header">
      <Icon type="md-close" class="preview-close-icon" @click="previewVisible = false"/>
      <h3 class="preview-title mb-20">预览</h3>
    </div>
    <div class="preview-content pt-20"></div>
  </Modal>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import SvgIcon from "@/components/svgIcon/index.vue";
import {Icon, Modal} from "view-ui-plus";

interface ResumeItem {
  name: string;
  time: string;
  id?: string
}

interface SelectItem {
  name: string;
  icon: string;
  key: string
}

// 预览弹窗状态
const previewVisible = ref<boolean>(false);
// 预览简历id
const previewResumeId = ref<string>('');

const resumeList = ref<ResumeItem[]>([
  {name: '简历模板1', time: '2024-01-15'},
  {name: '简历模板2', time: '2024-01-10'},
  {name: '简历模板3', time: '2024-01-05'}
]);

const selectList = ref<SelectItem[]>([
  {name: '预览', icon: 'icon-yulan', key: 'preview'},
  {name: '编辑', icon: 'icon-bianji', key: 'edit'},
  {name: '复制', icon: 'icon-fuzhi-mian', key: 'copy'},
  {name: '下载', icon: 'icon-xiazai', key: 'download'},
  {name: '删除', icon: 'icon-lajitong-mian', key: 'delete'},
])

// 处理点击事件
const handleClick = (resume: ResumeItem, key: string) => {
  switch (key) {
    case 'preview':
      console.log('预览');
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
      console.log('删除');
      break;
    default:
      break;
  }
  console.log(key)
}

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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.resume-content {
  width: 100%;
  height: vh(749);
  background-color: $white;
  box-shadow: 0 0 6.625px 0 rgba(0, 0, 0, 0.10);
  border-radius: vw(2);
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

.preview-modal {
  :deep(.ivu-modal-body) {
    padding: 0 !important;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
  }
}
</style>
