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
                            <svg fill="#fff" height="10" viewBox="0 0 1024 1024" width="10">
                                <path
                                    d="M977.755378 895.713383l-57.712594 58.429393A237.07629 237.07629 0 0 1 752.455078 1024c-26.767339 0-53.166037-4.526076-78.438337-13.455349C361.328351 899.891299 113.622949 645.714223 11.427831 330.486315a235.253572 235.253572 0 0 1 81.039295-259.276593l50.4422-38.481889A158.474113 158.474113 0 0 1 239.861568 0.000819a159.477632 159.477632 0 0 1 142.335886 86.937531l85.319612 165.764987a111.697831 111.697831 0 0 1-17.100786 126.730139l-17.776626 19.312624a62.46395 62.46395 0 0 0-9.523192 70.758344 302.243598 302.243598 0 0 0 130.928535 130.805655c22.753262 11.775991 52.039638 7.782394 70.819783-9.502712l19.374065-17.694706c33.648613-30.986215 86.159291-38.09277 126.812058-17.203187l165.887867 85.217212A159.477632 159.477632 0 0 1 1023.999181 783.442112c0 42.229726-16.383987 82.124734-46.243803 112.271271z m-28.262378-127.672218c0-52.633558-223.579981-146.288523-223.579981-146.288523-31.375335-11.263991-74.50618 36.577251-74.50618 36.577251-77.721538 56.504275-132.464534 13.639669-149.053321 0-48.496601-39.833568-114.462628-125.931419-149.032841-182.865774-25.866219-42.680286-14.786548-93.245365 0-109.711272 0 0 50.07356-42.434526 37.273571-73.154502-39.116769-95.190964-100.08568-236.175171-149.053321-219.422544-42.475486 13.762549-220.364624 71.638983-139.919248 283.238173 142.725006 375.0909 439.705248 526.089819 620.502543 594.452005 126.054299 9.093113 237.36301-147.107722 227.348298-182.824814z"/>
                            </svg>
                            <span>{{ getFieldValue('basic_info', 'mobile') }}</span>
                        </div>
                        <div class="contact-item">
                            <svg class="email" fill="#fff" height="10" viewBox="0 0 1024 1024" width="10">
                                <path
                                    d="M819.17952 40.96h-614.4C91.648 40.96 0 147.16928 0 278.1184v468.7872C0 877.83424 91.66848 983.04 204.75904 983.04h614.4C932.352 983.04 1024 877.83424 1024 746.9056V278.1184C1024 147.1488 932.33152 40.96 819.17952 40.96z m-109.21984 473.96864l249.856-170.10688V680.96l-249.856-166.03136zM204.75904 113.2544h614.4c73.03168 0 133.4272 66.43712 140.04224 149.66784L512 567.45984 64.512 262.73792c6.73792-83.1488 67.3792-149.46304 140.24704-149.46304zM63.8976 344.61696l250.14272 170.31168L63.8976 681.1648V344.61696z m755.28192 565.84192h-614.4c-72.82688 0-133.40672-65.04448-140.24704-147.94752l309.71904-205.824 0.55296-0.38912 121.344 82.61632c4.85376 3.2768 10.32192 4.97664 15.85152 4.97664s10.99776-1.69984 15.85152-4.97664l121.344-82.61632 0.55296 0.4096 309.43232 205.6192c-6.71744 82.98496-67.072 148.13184-140.00128 148.13184z"/>
                            </svg>
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
                        <img :src="getFieldValue('basic_info', 'personal_image')" alt="个人照片" class="photo"
                             crossorigin="anonymous"/>
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
import SvgIcon from "@/components/svgIcon/index.vue";

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

    svg {
        width: vw(10);
        height: vw(10);
    }
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
