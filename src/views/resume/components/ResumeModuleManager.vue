<template>
    <div ref="triggerRef" class="module-wrapper">
        <slot :toggle="toggleVisible" :visible="visible">
            <div :class="{ active: visible }" class="module-trigger" @click="toggleVisible">
                <SvgIcon :name="triggerIcon" class="icon" color="#9499A4" size="12"/>
                <span>{{ triggerText }}</span>
            </div>
        </slot>
        <Teleport to="body">
            <div v-if="visible" :style="dropdownStyle" class="module-dropdown">
                <div class="module-manager">
                    <div :style="{ width: columnWidthStyle }" class="module-column">

                        <div ref="selectedListRef" :class="['module-list', !selectedModules.length && 'empty']"
                             data-tauri-drag-region="false">
                            <div
                                v-for="item in selectedModules"
                                :key="item.id"
                                :class="{ disabled: props.disabledDragIds.includes(item.id) }"
                                class="module-item"
                            >
                                <div class="name-wrapper">
                                    <SvgIcon class="icon-drag mr-10" color="#9499A4" name="icon-tuozhuai" size="12"/>
                                    <span class="module-name">{{ item.name }}</span>
                                </div>
                                <SvgIcon v-if="!showAddButton && selectedModules.length > 1" class="icon-delete"
                                         color="#9499A4" name="icon-shanchu-xian" size="12"
                                         @click="removeModule(item.id)"/>
                            </div>
                        </div>
                        <div v-if="showAddButton" class="module-add" @click="showAvailableList = true">
                            <span>{{ addButtonText }}</span>
                        </div>
                        <div :class="[!showAddButton && 'mt-10']" class="module-actions">
                            <span class="action-btn" @click="handleCancel">取消</span>
                            <div class="divider"></div>
                            <span class="action-btn" @click="handleApply">应用</span>
                        </div>
                    </div>

                    <div v-if="showAvailableList" :style="{ width: columnWidthStyle }" class="module-column available">
                        <div class="module-list">
                            <div
                                v-for="item in availableModules"
                                :key="item.id"
                                :class="{ hover: hoveredId === item.id }"
                                class="module-item pointer pl-10"
                                @click="addModule(item.id)"
                                @mouseenter="hoveredId = item.id"
                                @mouseleave="hoveredId = null"
                            >
                                <span class="module-name">{{ item.name }}</span>
                            </div>
                            <div
                                :class="{ hover: hoveredId === 'custom' }"
                                class="module-item pointer pl-10"
                                @click="showCustomModuleModal"
                                @mouseenter="hoveredId = 'custom'"
                                @mouseleave="hoveredId = null"
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
            :footer-hide="true"
            :mask-closable="false"
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
            :footer-hide="true"
            :mask-closable="false"
            class-name="custom-module-modal"
            @on-cancel="handleCustomModalClose"
        >
            <div class="custom-modal-content">
                <div class="modal-header">
                    <span class="modal-title">{{ modalTitle }}</span>
                </div>
                <Form ref="formRef" :model="formData" :rules="rules" @submit.prevent>
                    <FormItem prop="name">
                        <div class="input-wrapper">
                            <Input
                                v-model="formData.name"
                                maxlength="10"
                                placeholder="请输入"
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

<script lang="ts" setup>
import {ref, nextTick, computed, watch, onMounted, onBeforeUnmount} from 'vue';
import {Modal, Message} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import Sortable from 'sortablejs';
import {message} from "@/utiles/Message.ts";

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
                } else if (selectedModules.value.some(m => m.name === value.trim())) {
                    const errorMsg = props.itemType === ItemType.MODULE ? '该模块已存在！' : '该字段已存在！';
                    callback(new Error(errorMsg));
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
const currentZIndex = ref(1000);

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
    const selectedIds = selectedModules.value.map(m => m.id);
    if (props.availableModulesList && props.availableModulesList.length > 0) {
        return customAvailableModules.value.filter(m => !selectedIds.includes(m.id));
    }
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
        selectedModules.value.splice(index, 1);
    }
    showDeleteModal.value = false;
}

const addModule = (id: string) => {
    if (selectedModules.value.find(m => m.id === id)) {
        return;
    }

    let module: ModuleItem | undefined;
    if (props.availableModulesList && props.availableModulesList.length > 0) {
        module = props.availableModulesList.find(m => m.id === id);
    } else {
        module = allModules.find(m => m.id === id);
    }

    if (!module) return;

    if (props.disabledDragIds.includes(id)) {
        const existingDisabledIds = selectedModules.value
            .filter(m => props.disabledDragIds.includes(m.id))
            .map(m => m.id);

        const allDisabledIds = [...existingDisabledIds, id];
        const sortedDisabledIds = props.disabledDragIds.filter(did => allDisabledIds.includes(did));
        const insertIndex = sortedDisabledIds.indexOf(id);

        selectedModules.value.splice(insertIndex, 0, {...module});
    } else {
        selectedModules.value.push({...module});
    }
}

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
            message.warning(Message, '请完善必填项！');
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
    showAvailableList.value = false;
    visible.value = false;
};

let sortableInstance: Sortable | null = null;

const initSortable = () => {
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
    nextTick(() => {
        if (selectedListRef.value) {
            sortableInstance = Sortable.create(selectedListRef.value, {
                animation: 150,
                handle: '.icon-drag',
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                fallbackClass: 'sortable-fallback',
                filter: '.disabled',
                forceFallback: true,
                fallbackTolerance: 3,
                onMove: (evt) => {
                    return !evt.related.classList.contains('disabled');
                },
                onEnd: (evt) => {
                    const {oldIndex, newIndex} = evt;
                    if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
                        const item = selectedModules.value.splice(oldIndex, 1)[0];
                        selectedModules.value.splice(newIndex, 0, item);
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
            zIndex: currentZIndex.value
        };
    }
};

const getMaxZIndex = () => {
    const dropdowns = document.querySelectorAll('.module-dropdown');
    if (dropdowns.length < 1) return 1000;

    let maxZ = 1000;
    dropdowns.forEach(el => {
        const z = parseInt(window.getComputedStyle(el).zIndex) || 1000;
        if (z > maxZ) maxZ = z;
    });
    return maxZ + 1;
};

const toggleVisible = () => {
    console.log(visible.value)
    if (visible.value) {
        handleCancel();
    } else {
        currentZIndex.value = getMaxZIndex();
        visible.value = true;
        selectedModules.value = [...props.appliedModules];
        customAvailableModules.value = [...props.availableModulesList];
        setTimeout(() => {
            updateDropdownPosition();
            initSortable();
            window.addEventListener('scroll', updateDropdownPosition, true);
            window.addEventListener('resize', updateDropdownPosition);
        }, 50);
    }
};

watch(() => props.appliedModules, (newVal) => {
    if (!visible.value) {
        selectedModules.value = [...newVal];
    }
}, {deep: true});

watch(() => props.availableModulesList, (newVal) => {
    if (!visible.value) {
        customAvailableModules.value = [...newVal];
    }
}, {deep: true});

const handleGlobalClose = () => {
    if (visible.value) {
        handleCancel();
    }
};

onMounted(() => {
    window.addEventListener('close-all-dropdowns', handleGlobalClose);
});

onBeforeUnmount(() => {
    window.removeEventListener('close-all-dropdowns', handleGlobalClose);
});

defineExpose({
    handleCancel
});


</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

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

.module-manager {
    display: flex;
    background: transparent;
    border-radius: vw(4);
}

.module-column {
    background: $white;
    box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.10);

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
    overflow-x: visible;
    -webkit-app-region: no-drag;

    &.empty {
        padding: 0;
    }

    &::-webkit-scrollbar {
        display: none;
    }
}

.module-item {
    display: flex;
    align-items: center;
    width: 100%;
    height: vh(32);
    padding: 0 vw(10);
    background: $white;
    font-size: vw(14);
    color: $font-dark;
    -webkit-app-region: no-drag;
    border-radius: vw(4);
    font-family: "PingFangSCBold";

    &:not(:last-child) {
        margin-bottom: vh(4);
    }

    &:hover:not(.disabled) {
        background: linear-gradient(90deg, $hover-color 0%, $hover-color 100%);
    }

    .name-wrapper {
        width: 96%;
        flex: 1;
        display: flex;
        align-items: center;
        line-height: normal;

        .icon-drag {
            flex-shrink: 0;
            color: $font-middle;
            cursor: move;
        }

        .module-name {
            white-space: nowrap;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
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

        .icon-drag {
            cursor: not-allowed;

            :deep(> use) {
                fill: #EAECEE;
            }
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

:deep(.sortable-fallback) {
    opacity: 1 !important;
    background: $white !important;
    box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1) !important;
    border-radius: vw(4) !important;
    cursor: move !important;

    .icon-drag {
        > use {
            fill: $theme-color !important;
        }
    }
}
</style>
