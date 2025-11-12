<template>
    <div ref="resumeRef" class="business-resume-preview">
        <div class="content-wrapper">
            <div v-if="watermark && watermarkCount" :style="{ height: watermarkHeight + 'px' }"
                 class="watermark-container">
                <div v-for="i in watermarkCount" :key="i" class="watermark-item">{{ watermark }}</div>
            </div>
            <!-- 头部个人信息 -->
            <div class="header-section">
                <div class="header-bar">
                    <div class="name mr-40">{{ getFieldValue('basic_info', 'name') || '聘小方' }}</div>
                    <div class="contact-row">
                        <div class="contact-item">
                            <div class="icon-phone"></div>
                            <span>{{ getFieldValue('basic_info', 'mobile') }}</span>
                        </div>
                        <div class="contact-item">
                            <div class="icon-email"></div>
                            <span>{{ getFieldValue('basic_info', 'email') }}</span>
                        </div>
                    </div>
                    <div class="job-position">{{ getFieldValue('basic_info', 'job_position') || '行政专员' }}</div>
                </div>
                <div class="info-photo-wrapper">
                    <div class="basic-info-grid">
                        <div v-for="field in getBasicInfoFields()" :key="field.fieldKey" class="info-item">
                            {{ field.fieldName }}：{{ field.fieldValue }}
                        </div>
                    </div>
                    <div v-if="getFieldValue('basic_info', 'personal_image')" class="photo-wrapper">
                        <img :src="getFieldValue('basic_info', 'personal_image')" alt="个人照片" class="photo" crossorigin="anonymous"/>
                    </div>
                </div>
            </div>

            <!-- 动态渲染模块 -->
            <template v-for="module in sortedModules" :key="module.uuid">
                <!-- 经历类模块 -->
                <div v-if="isExperienceModule(module.moduleKey)" class="module-section">
                    <div class="module-header">
                        <div class="module-title">{{ module.moduleName }}</div>
                        <div class="accent-line">
                            <div class="line-left"></div>
                            <div class="line-right"></div>
                        </div>
                    </div>
                    <div v-for="entry in module.entries" :key="entry.entryUuid" class="entry-item">
                        <div class="entry-header">
                            <div class="entry-title">
                                <template v-for="(part, index) in getEntryTitleParts(entry)" :key="index">
                                    <span v-if="index > 0"> ｜ </span>
                                    <span :class="{ 'placeholder': !part.value }">{{ part.value || part.name }}</span>
                                </template>
                            </div>
                            <div :class="{ 'placeholder': !getEntryFieldValue(entry, 'end_time') }" class="entry-time">
                                {{ getEntryFieldValue(entry, 'end_time') || getEntryFieldName(entry, 'end_time') }}
                            </div>
                        </div>
                        <div :class="{ 'placeholder': !getEntryDescription(entry) }" class="entry-content">
                            {{ getEntryDescription(entry) || getEntryDescriptionFieldName(entry) }}
                        </div>
                    </div>
                </div>

                <!-- 文本类模块 -->
                <div v-else-if="module.moduleKey !== 'default_info'" class="module-section">
                    <div class="module-header">
                        <div class="module-title">{{ module.moduleName }}</div>
                        <div class="accent-line">
                            <div class="line-left"></div>
                            <div class="line-right"></div>
                        </div>
                    </div>
                    <div :class="{ 'placeholder': !getTextModuleContent(module) }" class="text-content">
                        {{ getTextModuleContent(module) || getTextModuleFieldName(module) }}
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch, onMounted, nextTick} from 'vue';
import type {GetResumeDetailOutDto} from '@/api/resume/dto/GetResumeDetail';
import type {ResumeModuleBean} from '@/api/resume/dto/bean/ResumeModuleBean';
import type {ResumeEntryBean} from '@/api/resume/dto/bean/ResumeEntryBean';

const props = defineProps<{
    resumeData: GetResumeDetailOutDto;
    watermark?: string;
}>();

const resumeRef = ref<HTMLElement>();
const watermarkCount = ref(0);
const watermarkHeight = ref(0);

const updateWatermarkCount = async () => {
    await nextTick();
    if (resumeRef.value) {
        const contentWrapper = resumeRef.value.querySelector('.content-wrapper') as HTMLElement;
        if (contentWrapper) {
            const children = Array.from(contentWrapper.children).filter(el => !el.classList.contains('watermark-container'));
            let maxHeight = 0;
            children.forEach(child => {
                const rect = (child as HTMLElement).getBoundingClientRect();
                const offsetTop = (child as HTMLElement).offsetTop;
                maxHeight = Math.max(maxHeight, offsetTop + rect.height);
            });
            watermarkHeight.value = maxHeight;
            const itemHeight = 150;
            const cols = 3;
            const rows = Math.max(1, Math.ceil(maxHeight / itemHeight));
            watermarkCount.value = Math.min(cols * rows, 100);
        }
    }
};

watch(() => props.watermark, updateWatermarkCount);
watch(() => props.resumeData, updateWatermarkCount, {deep: true});

onMounted(() => {
    updateWatermarkCount();
});

const getModule = (moduleKey: string): ResumeModuleBean | undefined => {
    return props.resumeData.modules?.find(m => m.moduleKey === moduleKey);
};

const getFieldValue = (moduleKey: string, fieldKey: string): string => {
    const module = getModule(moduleKey);
    const field = module?.entries?.[0]?.fields?.find(f => f.fieldKey === fieldKey);
    return field?.fieldValue || '';
};

const getEntryFieldValue = (entry: ResumeEntryBean, fieldKey: string): string => {
    const field = entry.fields?.find(f => f.fieldKey === fieldKey);
    return field?.fieldValue || '';
};

const getEntryFieldName = (entry: ResumeEntryBean, fieldKey: string): string => {
    const field = entry.fields?.find(f => f.fieldKey === fieldKey);
    return field?.fieldName || '';
};

const topFieldKeys = ['name', 'job_position', 'mobile', 'email', 'personal_image'];

const getBasicInfoFields = () => {
    const module = getModule('basic_info');
    return module?.entries?.[0]?.fields?.filter(f => !topFieldKeys.includes(f.fieldKey || '')) || [];
};

const sortedModules = computed(() => {
    return props.resumeData.modules?.filter(m => m.moduleKey !== 'basic_info' && m.moduleKey !== 'default_info').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];
});

const experienceModuleKeys = ['education_history', 'internship_history', 'work_history', 'project_history'];

const isExperienceModule = (moduleKey?: string): boolean => {
    return experienceModuleKeys.includes(moduleKey || '');
};

const getEntryTitleParts = (entry: ResumeEntryBean) => {
    const fields = entry.fields || [];
    const parts = [];

    const companyField = fields.find(f => f.fieldKey === 'company_name' || f.fieldKey === 'school_name' || f.fieldKey === 'project_name');
    if (companyField) parts.push({value: companyField.fieldValue, name: companyField.fieldName});

    const positionField = fields.find(f => f.fieldKey === 'position_name' || f.fieldKey === 'major');
    if (positionField) parts.push({value: positionField.fieldValue, name: positionField.fieldName});

    const degreeField = fields.find(f => f.fieldKey === 'degree');
    if (degreeField) parts.push({value: degreeField.fieldValue, name: degreeField.fieldName});

    return parts;
};

const getEntryDescription = (entry: ResumeEntryBean): string => {
    const fields = entry.fields || [];
    return fields.find(f => f.fieldKey === 'description' || f.fieldKey === 'duties')?.fieldValue || '';
};

const getEntryDescriptionFieldName = (entry: ResumeEntryBean): string => {
    const fields = entry.fields || [];
    return fields.find(f => f.fieldKey === 'description' || f.fieldKey === 'duties')?.fieldName || '';
};

const getTextModuleContent = (module: ResumeModuleBean): string => {
    return module.entries?.[0]?.fields?.[0]?.fieldValue || '';
};

const getTextModuleFieldName = (module: ResumeModuleBean): string => {
    return module.entries?.[0]?.fields?.[0]?.fieldName || '';
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.business-resume-preview {
    width: vw(680);
    height: 100%;
    background: $white;

    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        display: none;
    }
}

.content-wrapper {
    position: relative;
    padding: vw(20);
}

.watermark-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 150px;
    pointer-events: none;
    z-index: 999;
}

.watermark-item {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: vw(14);
    color: rgba(81, 90, 109, 0.10);
    white-space: nowrap;
    user-select: none;
    transform: rotate(30deg);
}

.header-section {
    margin-bottom: vh(27.2);
}

.header-bar {
    background: #5270AB;
    border-radius: vw(1.36);
    height: vh(43.52);
    padding: 0 vw(6.8);
    display: flex;
    align-items: center;
    //justify-content: space-between;
    margin-bottom: vh(13.6);
}

.name {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(21.76);
    line-height: vh(21.76);
    color: $white;
}

.contact-row {
    flex: 1;
    display: flex;
    gap: vw(41);
}

.contact-item {
    display: flex;
    align-items: center;
    gap: vw(6.8);
    font-size: vw(10.88);
    line-height: vh(10.88);
    color: $white;
}

.icon-phone,
.icon-email {
    width: vw(9.52);
    height: vw(9.52);
    background: $white;
    border-radius: 50%;
}

.job-position {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(14.96);
    line-height: vh(14.96);
    color: $white;
}

.info-photo-wrapper {
    display: flex;
    gap: vw(20);
    align-items: start;
    padding-left: vw(6.8);
}

.photo-wrapper {
    width: vw(88.4);
    height: vw(88.4);
    flex-shrink: 0;
    margin-right: vw(24);
}

.photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: $bg-gray;
}

.module-section {
    margin-bottom: vh(27.2);
}

.module-header {
    position: relative;
    margin-bottom: vh(13.6);
}

.module-title {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(14.96);
    line-height: vh(14.96);
    color: #5270AB;
    margin-bottom: vh(7.68);
}

.accent-line {
    width: 100%;
    height: vw(2);
    display: flex;
    align-items: center;

    .line-left {
        width: vw(59);
        height: 100%;
        background: #5270AB;
    }

    .line-right {
        flex: 1;
        height: vw(1);
        background: $font-dark;
    }
}

.basic-info-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: vw(40);
    row-gap: vh(13);
}

.info-item {
    font-size: vw(10.88);
    line-height: vh(10.88);
    color: #515A6D;
}

.entry-item {
    margin-bottom: vh(20.4);

    &:last-child {
        margin-bottom: 0;
    }
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: vh(13.6);
}

.entry-title {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(10.88);
    line-height: vh(11);
    color: $font-dark;
    flex: 1;
}

.entry-time {
    font-size: vw(10.88);
    line-height: vh(11);
    color: $font-dark;
    flex-shrink: 0;
}

.entry-content {
    font-size: vw(10.88);
    line-height: vh(15);
    color: $font-dark;
    white-space: pre-wrap;
    word-break: break-word;
}

.text-content {
    font-size: vw(10.88);
    line-height: vh(15);
    color: $font-dark;
    white-space: pre-wrap;
    word-break: break-word;
}

.placeholder {
    color: $placeholder-color;
}
</style>
