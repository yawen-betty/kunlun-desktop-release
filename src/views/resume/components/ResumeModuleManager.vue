<template>
  <div class="module-wrapper" ref="triggerRef">
    <div class="module-trigger" :class="{ active: visible }" @click="toggleVisible">
      <SvgIcon class="icon" :name="triggerIcon" size="12" color="#9499A4"/>
      <span>{{ triggerText }}</span>
    </div>

    <Teleport to="body">
      <div v-if="visible" class="module-dropdown" :style="dropdownStyle">
        <div class="module-manager">
          <div class="module-column" :style="{ width: columnWidthStyle }">
            <div :class="['module-list', !selectedModules.length && 'empty']" ref="selectedListRef">
              <div
                v-for="item in selectedModules"
                :key="item.id"
                class="module-item"
                :class="{ hover: hoveredId === item.id, disabled: disabledDragIds.includes(item.id) }"
                @mouseenter="hoveredId = item.id"
                @mouseleave="hoveredId = null"
              >
                <div class="name-wrapper">
                  <SvgIcon class="icon-drag mr-10" name="icon-tuozhuai" size="12" color="#9499A4"/>
                  <span class="module-name">{{ item.name }}</span>
                </div>
                <SvgIcon class="icon-delete" name="icon-shanchu-xian" size="12" color="#9499A4"
                         @click="removeModule(item.id)"/>
              </div>
            </div>
            <div v-if="showAddButton" class="module-add" @click="showAvailableList = true">
              <span>{{ addButtonText }}</span>
            </div>
            <div class="module-actions">
              <span class="action-btn" @click="handleCancel">取消</span>
              <div class="divider"></div>
              <span class="action-btn" @click="handleApply">应用</span>
            </div>
          </div>

          <div v-if="showAvailableList" class="module-column available" :style="{ width: columnWidthStyle }">
            <div class="module-list">
              <div
                v-for="item in availableModules"
                :key="item.id"
                class="module-item pl-10"
                :class="{ hover: hoveredId === item.id }"
                @mouseenter="hoveredId = item.id"
                @mouseleave="hoveredId = null"
                @click="addModule(item.id)"
              >
                <span class="module-name">{{ item.name }}</span>
              </div>
              <div
                class="module-item pl-10"
                :class="{ hover: hoveredId === 'custom' }"
                @mouseenter="hoveredId = 'custom'"
                @mouseleave="hoveredId = null"
                @click="showCustomModuleModal"
              >
                <span class="module-name">{{ customModuleText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Modal
      v-model="showDeleteModal"
      :closable="true"
      :mask-closable="false"
      :footer-hide="true"
      class-name="delete-confirm-modal"
    >
      <!--      width="24%"-->
      <div class="delete-modal-content">
        <div class="modal-header">
          <span class="modal-title">提示</span>
        </div>
        <div class="modal-body">
          <p>确认删除“{{ deleteModuleName }}”吗？</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">取消</button>
          <button class="btn-confirm" @click="confirmDelete">确定</button>
        </div>
      </div>
    </Modal>

    <!--      width="24%"-->
    <Modal
      v-model="showCustomModal"
      :closable="true"
      :mask-closable="false"
      :footer-hide="true"
      class-name="custom-module-modal"
      @on-cancel="handleCustomModalClose"
    >
      <div class="custom-modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ modalTitle }}</span>
        </div>
        <Form ref="formRef" :model="formData" :rules="rules">
          <FormItem prop="name">
            <div class="input-wrapper">
              <Input
                v-model="formData.name"
                placeholder="请输入"
                maxlength="10"
                show-word-limit
              />
            </div>
          </FormItem>
        </Form>
        <div class="modal-footer">
          <button class="btn-cancel" @click="handleCustomModalClose">取消</button>
          <button class="btn-confirm" @click="createCustomModule">确定</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
export enum ItemType {
  MODULE = 'module',
  FIELD = 'field'
}
</script>

<script setup lang="ts">
import {ref, onMounted, nextTick, computed} from 'vue';
import {Modal, Message} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import Sortable from 'sortablejs';


interface ModuleItem {
  id: string;
  name: string;
  isCustom?: boolean;
}

interface Props {
  appliedModules?: ModuleItem[];
  availableModulesList?: ModuleItem[];
  disabledDragIds?: string[];
  showAddButton?: boolean;
  itemType?: ItemType;
  triggerText?: string;
  triggerIcon?: string;
  columnWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  appliedModules: () => [
    {id: '1', name: '教育经历'},
    {id: '2', name: '工作经历'},
    {id: '3', name: '专业技能'},
    {id: '4', name: '奖项证书'},
    {id: '5', name: '自我评价'}
  ],
  availableModulesList: () => [],
  disabledDragIds: () => [],
  showAddButton: true,
  itemType: ItemType.MODULE,
  triggerText: '模块管理',
  triggerIcon: 'icon-liebiao',
  columnWidth: 180
});

const addButtonText = computed(() =>
  props.itemType === ItemType.MODULE ? '+ 添加新模块' : '+ 添加新字段'
);

const customModuleText = computed(() =>
  props.itemType === ItemType.MODULE ? '自定义模块' : '自定义字段'
);

const modalTitle = computed(() =>
  props.itemType === ItemType.MODULE ? '请命名该模块' : '请命名该字段'
);

const emit = defineEmits<{
  'on-apply': [modules: ModuleItem[]]
}>();

const columnWidthStyle = computed(() => `calc(${props.columnWidth} / 1920 * 100vw)`);

const visible = ref(false);
const hoveredId = ref<string | null>(null);
const selectedListRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();

const showDeleteModal = ref(false);
const deleteModuleName = ref('');
const deleteModuleId = ref('');

const showCustomModal = ref(false);
const formRef = ref<any>();
const formData = ref({name: ''});
const rules = computed(() => ({
  name: [
    {
      required: true,
      message: props.itemType === ItemType.MODULE ? '请输入模块名称' : '请输入字段名称',
      trigger: 'blur'
    },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value || !value.trim()) {
          callback(new Error('不能为空'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
}));
const dropdownStyle = ref({});
const showAvailableList = ref(false);

const selectedModules = ref<ModuleItem[]>([...props.appliedModules]);
const customAvailableModules = ref<ModuleItem[]>([...props.availableModulesList]);

const allModules: ModuleItem[] = [
  {id: '1', name: '教育经历'},
  {id: '2', name: '工作经历'},
  {id: '3', name: '专业技能'},
  {id: '4', name: '奖项证书'},
  {id: '5', name: '自我评价'},
  {id: '6', name: '项目经历'},
  {id: '7', name: '培训情况'},
  {id: '8', name: '语言能力'},
  {id: '9', name: '专利/学术成果'},
  {id: '10', name: '兴趣爱好'},
  {id: '12', name: '实习经历'}
];

const availableModules = computed(() => {
  if (props.availableModulesList && props.availableModulesList.length > 0) {
    return customAvailableModules.value;
  }
  const selectedIds = selectedModules.value.map(m => m.id);
  return allModules.filter(m => !selectedIds.includes(m.id));
});

const removeModule = (id: string) => {
  const module = selectedModules.value.find(m => m.id === id);
  if (!module) return;

  deleteModuleName.value = module.name;
  deleteModuleId.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  const id = deleteModuleId.value;
  const index = selectedModules.value.findIndex(m => m.id === id);
  if (index > -1) {
    const removedModule = selectedModules.value.splice(index, 1)[0];

    if (props.availableModulesList && props.availableModulesList.length > 0) {
      const originalIndex = props.availableModulesList.findIndex(m => m.id === id);
      if (originalIndex > -1) {
        let insertIndex = 0;
        for (let i = 0; i < originalIndex; i++) {
          if (customAvailableModules.value.find(m => m.id === props.availableModulesList[i].id)) {
            insertIndex++;
          }
        }
        customAvailableModules.value.splice(insertIndex, 0, removedModule);
      }
    }
  }
  showDeleteModal.value = false;
};

const addModule = (id: string) => {
  if (props.availableModulesList && props.availableModulesList.length > 0) {
    const index = customAvailableModules.value.findIndex(m => m.id === id);
    if (index > -1) {
      const module = customAvailableModules.value.splice(index, 1)[0];

      if (props.disabledDragIds.includes(id)) {
        const disabledIndex = props.disabledDragIds.indexOf(id);
        let insertIndex = 0;
        for (let i = 0; i < disabledIndex; i++) {
          if (selectedModules.value.find(m => m.id === props.disabledDragIds[i])) {
            insertIndex++;
          }
        }
        selectedModules.value.splice(insertIndex, 0, module);
      } else {
        selectedModules.value.push(module);
      }
    }
  } else {
    const module = allModules.find(m => m.id === id);
    if (module && !selectedModules.value.find(m => m.id === id)) {
      selectedModules.value.push({...module});
    }
  }
};

const showCustomModuleModal = () => {
  formData.value.name = '';
  showCustomModal.value = true;
};

const handleCustomModalClose = () => {
  formData.value.name = '';
  formRef.value?.resetFields();
  showCustomModal.value = false;
};

const createCustomModule = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) {
      Message.warning('请完善必填项！');
      return;
    }

    const newModule: ModuleItem = {
      id: `custom_${Date.now()}`,
      name: formData.value.name.trim(),
      isCustom: true
    };
    selectedModules.value.push(newModule);
    handleCustomModalClose();
  });
};


const handleCancel = () => {
  selectedModules.value = [...props.appliedModules];
  customAvailableModules.value = [...props.availableModulesList];
  showAvailableList.value = false;
  visible.value = false;
  window.removeEventListener('scroll', updateDropdownPosition, true);
  window.removeEventListener('resize', updateDropdownPosition);
};

const handleApply = () => {
  emit('on-apply', [...selectedModules.value]);
  Message.success('应用成功');
  visible.value = false;
};

let sortableInstance: Sortable | null = null;

const initSortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy();
  }
  nextTick(() => {
    if (selectedListRef.value) {
      sortableInstance = Sortable.create(selectedListRef.value, {
        animation: 150,
        handle: '.icon-drag',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        filter: '.disabled',
        onMove: (evt) => {
          const disabledCount = selectedModules.value.filter(m => props.disabledDragIds.includes(m.id)).length;
          return evt.related.className.indexOf('disabled') === -1;
        },
        onEnd: (evt) => {
          const {oldIndex, newIndex} = evt;
          if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            const disabledCount = selectedModules.value.filter(m => props.disabledDragIds.includes(m.id)).length;
            const actualNewIndex = Math.max(newIndex, disabledCount);

            const item = selectedModules.value.splice(oldIndex, 1)[0];
            selectedModules.value.splice(actualNewIndex, 0, item);
          }
        }
      });
    }
  });
};

const updateDropdownPosition = () => {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
      zIndex: 1000
    };
  }
};

const toggleVisible = () => {
  if (visible.value) {
    handleCancel();
  } else {
    visible.value = true;
    nextTick(() => {
      updateDropdownPosition();
      initSortable();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    });
  }
};

onMounted(() => {
  initSortable();
});
</script>

<style lang="scss">
.delete-confirm-modal.ivu-modal-wrap {
  .ivu-modal-content {
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
  }

  .ivu-modal-body {
    padding: 0;
  }
}

.delete-modal-content {
  padding: vh(15) vw(20);

  .modal-header {
    margin-bottom: vh(40);

    .modal-title {
      font-size: vw(14);
      font-weight: 600;
      color: $font-dark;
      line-height: vh(22);
    }
  }

  .modal-body {
    padding: 0 vw(20);
    height: vh(126);

    p {
      font-size: vw(14);
      color: $font-dark;
      line-height: vh(20);
      margin: 0;
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: vw(10);

    button {
      padding: vh(10) vw(20);
      border-radius: vw(2);
      font-size: vw(12);
      font-weight: 600;
      line-height: vh(12);
      cursor: pointer;
      border: none;
      outline: none;
    }

    .btn-cancel {
      background: $white;
      color: $theme-color;
      border: vw(1) solid $theme-color;

      &:hover {
        opacity: 0.8;
      }
    }

    .btn-confirm {
      background: linear-gradient(90deg, $theme-color 0%, $theme-color 100%);
      color: $white;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.custom-module-modal.ivu-modal-wrap {
  .ivu-modal-content {
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
  }

  .ivu-modal-body {
    padding: 0;
  }
}

.custom-modal-content {
  padding: vh(15) vw(20);

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: vh(40);

    .modal-title {
      font-size: vw(14);
      font-weight: 600;
      color: $font-dark;
      line-height: vh(22);
    }

    .icon-close {
      cursor: pointer;
      color: $font-middle;
      flex-shrink: 0;

      &:hover {
        color: $theme-color;
      }
    }
  }

  .ivu-form {
    padding: 0 vw(20);
    height: vh(126);
  }

  .ivu-form-item {
    margin-bottom: 0;
  }

  .input-wrapper {
    position: relative;
    margin-bottom: vh(40);

    .ivu-input {
      height: vh(40);
      background: $bg-gray;
      border: none;
      border-radius: vw(2);
      padding: 0 vw(60) 0 vw(20);
      font-size: vw(16);
      font-weight: 600;
      color: $font-dark;

      &::placeholder {
        color: $placeholder-color;
        font-weight: 600;
      }

      &:focus {
        background: $bg-gray;
        box-shadow: none;
      }
    }

    .ivu-input-word-count {
      right: vw(20);
      font-size: vw(16);
      font-weight: 600;
      color: $placeholder-color;
      background: transparent;
      pointer-events: none;
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: vw(10);

    button {
      padding: vh(10) vw(20);
      border-radius: vw(2);
      font-size: vw(12);
      font-weight: 600;
      line-height: vh(12);
      cursor: pointer;
      border: none;
      outline: none;
    }

    .btn-cancel {
      background: $white;
      color: $theme-color;
      border: vw(1) solid $theme-color;

      &:hover {
        opacity: 0.8;
      }
    }

    .btn-confirm {
      background: linear-gradient(90deg, $theme-color 0%, $theme-color 100%);
      color: $white;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}
</style>

<style scoped lang="scss">
.module-wrapper {
  position: relative;
  display: inline-block;
}

.module-trigger {
  display: inline-flex;
  align-items: center;
  gap: vw(6);
  padding: vh(6) vw(12);
  background: $white;
  border-radius: vw(2);
  cursor: pointer;
  color: $font-middle;
  font-size: vw(14);
  user-select: none;


  &.active {
    background: linear-gradient(90deg, $hover-color 0%, $hover-color 100%);
    color: $theme-color;

    :deep(.icon > use) {
      fill: $theme-color;
    }
  }
}

.module-dropdown {
  /* position由JS动态设置 */
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.10));
}

.module-manager {
  display: flex;
  background: transparent;

  border-radius: vw(4);
}

.module-column {
  position: relative;
  background: transparent;
  filter: drop-shadow(0 0 vw(6) rgba(0, 0, 0, 0.10));

  &.available {
    background: $white;
    border-left: none;

    .module-list {
      padding-bottom: vw(10);
    }
  }
}

.module-list {
  max-height: vh(268);
  padding: vw(10);
  padding-bottom: 0;
  background: $white;
  overflow-y: auto;

  &.empty {
    padding: 0;
  }
}

.module-item {
  display: flex;
  align-items: center;
  height: vh(32);
  padding: 0 vw(10);
  background: $white;
  cursor: pointer;
  font-size: vw(14);
  color: $font-dark;

  border-radius: vw(4);
  font-family: "PingFangSCBold";

  &:not(:last-child) {
    margin-bottom: vh(4);
  }

  &.hover {
    background: linear-gradient(90deg, $hover-color 0%, $hover-color 100%);
  }

  .name-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    line-height: normal;

    .icon-drag {
      flex-shrink: 0;
      color: $font-middle;
      cursor: move;
    }
  }

  .icon-delete {
    flex-shrink: 0;
  }

  :deep(.icon-delete):hover {
    > use {
      fill: $theme-color;
    }
  }

  &.disabled {
    .module-name,
    .icon-delete {
      color: $font-light;
    }

    :deep(.icon-drag) {
      > use {
        fill: #EAECEE;
      }

      cursor: not-allowed;
    }
  }
}

.module-list .sortable-drag {
  + .module-item {
    .module-name {
      color: $font-light;
    }
  }
}

.module-add {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: vh(51);
  padding: vw(10) vw(10) vw(10) vw(20);
  color: $theme-color;
  font-size: vw(14);
  cursor: pointer;
  background: $white;
}

.module-actions {
  display: flex;
  align-items: center;
  height: vh(42);
  padding: 0 vw(32);
  border-top: 1px solid $border-default;
  font-size: vw(14);
  color: $font-middle;
  background: $white;

  .action-btn {
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      color: $theme-color;
    }
  }

  .divider {
    width: vw(1);
    height: vh(14);
    margin: 0 vw(29) 0 vw(30);
    background: $border-default;
  }
}

:deep(.sortable-ghost) {
  opacity: 1 !important;
  background: transparent !important;
  border-top: vw(2) solid $theme-color !important;
  color: #B0B7C6;
}

.sortable-chosen {
  cursor: move;

  .module-name {
    opacity: 0.4 !important;

  }
}

:deep(.sortable-drag) {
  opacity: 1 !important;
  background: $white !important;
  box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1) !important;
  border-radius: vw(4) !important;

  .icon-drag {
    > use {
      fill: $theme-color !important;
    }
  }
}
</style>
