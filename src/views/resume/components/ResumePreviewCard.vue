<!-- 个人中心我的简历预览组件 -->
<template>
    <div :class="['resume-preview-card', `size-${size}`, { 'no-scroll': !scrollable }]">
        <!-- 顶部个人信息 -->
        <div class="header-section">
            <div class="info-left">
                <h1 class="name">{{ resumeData.name || '未命名' }}</h1>
                <p class="job-position">{{ resumeData.jobPosition || '求职岗位' }}</p>
                <div class="contact-info">
                    <span v-if="contactInfo.phone" class="contact-item">手机号码：{{ contactInfo.phone }}</span>
                    <span v-if="contactInfo.email" class="contact-item">个人邮箱：{{ contactInfo.email }}</span>
                </div>
            </div>
            <div class="photo-wrapper">
                <img v-if="contactInfo.photo" :src="`${Config.baseUrl}${contactInfo.photo}`" :style="photoStyle"
                     alt="个人照片"
                     class="photo"/>
                <div v-else class="photo-placeholder"></div>
            </div>
        </div>

        <!-- 基本信息模块 -->
        <div v-if="basicInfoModule" class="module-section">
            <div class="module-header">
                <h2 class="module-title">{{ basicInfoModule.moduleName }}</h2>
                <div class="divider-line"></div>
            </div>
            <div class="basic-info-grid">
                <div v-for="field in getAllBasicFields(basicInfoModule)" :key="field.uuid" class="field-item">
                    <span v-if="field.fieldValue" class="field-text">
                        {{ field.fieldName }}：{{ field.fieldValue }}
                    </span>
                </div>
            </div>
        </div>

        <!-- 其他模块列表 -->
        <div v-for="module in sortedModules" :key="module.uuid" class="module-section">
            <div class="module-header">
                <h2 class="module-title">{{ module.moduleName }}</h2>
                <div class="divider-line"></div>
            </div>

            <!-- 经历类模块 -->
            <div v-if="isExperienceModule(module.moduleKey)" class="experience-list">

                <div v-for="entry in module.entries" :key="entry.entryUuid" class="experience-item">
                    <div class="experience-header">
                        <p class="experience-title">{{ getEntryTitle(entry) }}</p>
                        <p :class="{ 'time-placeholder': !getEntryTime(entry) }" class="experience-time">
                            {{ getEntryTime(entry) || getEntryTimeFieldName(entry) }}
                        </p>
                    </div>
                    <div class="experience-content">
                        <template v-if="getEntryDuties(entry).length > 0">
                            <ul class="duties-list">
                                <li v-for="(duty, index) in getEntryDuties(entry)" :key="index">{{ duty }}</li>
                            </ul>
                        </template>
                        <template v-else-if="getEntryDescription(entry)">
                            <p class="description-text">{{ getEntryDescription(entry) }}</p>
                        </template>
                        <p v-else class="description-text placeholder">
                            {{ getEntryDescriptionFieldName(entry) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 其他文本类模块 -->
            <div v-else class="text-module">
                <p :class="{ 'placeholder': !getTextModuleContent(module) }" class="text-content">
                    {{ getTextModuleContent(module) || getTextModuleFieldName(module) }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, withDefaults, ref, watch, onActivated} from 'vue';
import {GetResumeDetailOutDto} from '@/api/resume/dto/GetResumeDetail';
import {ResumeModuleBean} from '@/api/resume/dto/bean/ResumeModuleBean';
import {ResumeEntryBean} from '@/api/resume/dto/bean/ResumeEntryBean';
import {ResumeFieldBean} from '@/api/resume/dto/bean/ResumeFieldBean';
import {Config} from "@/Config.ts";

const props = withDefaults(defineProps<{
    resumeData: GetResumeDetailOutDto;
    scrollable?: boolean;
    size?: 'small' | 'large';
}>(), {
    scrollable: true,
    size: 'large'
});

const photoStyle = ref<any>({});

const contactInfo = computed(() => {
    const basicModule = props.resumeData.modules?.find(m => m.moduleKey === 'basic_info');
    const fields = basicModule?.entries?.[0]?.fields || [];
    return {
        phone: fields.find(f => f.fieldKey === 'mobile')?.fieldValue,
        email: fields.find(f => f.fieldKey === 'email')?.fieldValue,
        photo: fields.find(f => f.fieldKey === 'personal_image')?.fieldValue
    };
});

const basicInfoModule = computed(() => {
    return props.resumeData.modules?.find(m => m.moduleKey === 'basic_info');
});

const sortedModules = computed(() => {
    return props.resumeData.modules?.filter(m => m.moduleKey !== 'basic_info' && m.moduleKey !== 'default_info').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];
});

const topFieldKeys = ['name', 'job_position', 'mobile', 'email', 'personal_image'];

const getAllBasicFields = (module: ResumeModuleBean): ResumeFieldBean[] => {
    const fields = module.entries?.[0]?.fields || [];
    return fields.filter(f => !topFieldKeys.includes(f.fieldKey || '') && f.fieldValue);
};

const getEntryTitle = (entry: ResumeEntryBean): string => {
    const fields = entry.fields || [];
    const companyField = fields.find(f => f.fieldKey === 'company_name' || f.fieldKey === 'school_name' || f.fieldKey === 'project_name');
    const positionField = fields.find(f => f.fieldKey === 'position_name' || f.fieldKey === 'major');
    const degreeField = fields.find(f => f.fieldKey === 'degree');

    const parts = [
        companyField?.fieldValue || companyField?.fieldName,
        positionField?.fieldValue || positionField?.fieldName,
        degreeField?.fieldValue || degreeField?.fieldName
    ].filter(Boolean);

    return parts.join(' ｜ ');
};

const getEntryTime = (entry: ResumeEntryBean): string => {
    const fields = entry.fields || [];
    return fields.find(f => f.fieldKey === 'end_time')?.fieldValue || '';
};

const getEntryTimeFieldName = (entry: ResumeEntryBean): string => {
    const fields = entry.fields || [];
    return fields.find(f => f.fieldKey === 'end_time')?.fieldName || '';
};

const getEntryDuties = (entry: ResumeEntryBean): string[] => {
    const fields = entry.fields || [];
    const duties = fields.find(f => f.fieldKey === 'duties')?.fieldValue;
    return duties ? duties.split('\n').filter(d => d.trim()) : [];
};

const getEntryDescription = (entry: ResumeEntryBean): string => {
    const fields = entry.fields || [];
    return fields.find(f => f.fieldKey === 'description')?.fieldValue || '';
};

const getEntryDescriptionFieldName = (entry: ResumeEntryBean): string => {
    const fields = entry.fields || [];
    return fields.find(f => f.fieldKey === 'description')?.fieldName || '';
};

const experienceModuleKeys = ['education_history', 'internship_history', 'work_history', 'project_history'];

const isExperienceModule = (moduleKey?: string): boolean => {
    return experienceModuleKeys.includes(moduleKey || '');
};

const getTextModuleContent = (module: ResumeModuleBean): string => {
    return module.entries?.[0]?.fields?.[0]?.fieldValue || '';
};

const getTextModuleFieldName = (module: ResumeModuleBean): string => {
    return module.entries?.[0]?.fields?.[0]?.fieldName || '';
};

const updatePhotoStyle = () => {
    if (contactInfo.value.photo) {
        const imageUrl = `${Config.baseUrl}${contactInfo.value.photo}`;
        const img = new Image();
        img.onload = () => {
            photoStyle.value = img.width > img.height ? {height: '100%'} : {width: '100%'};
        };
        img.src = imageUrl;
    }
};

watch(() => props.resumeData, updatePhotoStyle, {deep: true});

onActivated(() => {
    updatePhotoStyle();
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-preview-card {
    height: 100%;
    background-color: $white;
    overflow: auto;

    --padding-v: #{vh(38.4)};
    --padding-h: #{vw(48)};
    --radius: #{vw(2.4)};
    --shadow-size: #{vw(6)};

    &.size-small {
        --padding-v: #{vh(16.96)};
        --padding-h: #{vw(21.2)};
        --radius: #{vw(2.208)};
        --shadow-size: #{vw(6.625)};
    }

    border-radius: var(--radius);

    &.no-scroll {
        overflow: hidden;
    }

    &::-webkit-scrollbar {
        display: none;
    }
}

.header-section {
    --header-mb: #{vh(38.4)};
    --name-size: #{vw(38.4)};
    --name-lh: #{vh(57.6)};
    --name-mb: #{vh(16.8)};
    --job-size: #{vw(26.4)};
    --job-lh: #{vh(45.6)};
    --job-mb: #{vh(16.8)};
    --contact-gap: #{vw(66)};
    --contact-size: #{vw(19.2)};
    --contact-lh: #{vh(38.4)};
    --photo-w: #{vw(120)};
    --photo-h: #{vh(156)};

    .size-small & {
        --header-mb: #{vh(16.88)};
        --name-size: #{vw(16.96)};
        --name-lh: #{vh(25.44)};
        --name-mb: #{vh(8.42)};
        --job-size: #{vw(11.66)};
        --job-lh: #{vh(20.14)};
        --job-mb: #{vh(7.98)};
        --contact-gap: #{vw(29.15)};
        --contact-size: #{vw(8.48)};
        --contact-lh: #{vh(16.96)};
        --photo-w: #{vw(53)};
        --photo-h: #{vh(68.9)};
    }

    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--header-mb);

    .info-left {
        flex: 1;

        .name {
            font-size: var(--name-size);
            font-weight: 600;
            color: $font-dark;
            line-height: var(--name-lh);
            margin: 0 0 var(--name-mb) 0;
        }

        .job-position {
            font-size: var(--job-size);
            font-weight: 500;
            color: $font-dark;
            line-height: var(--job-lh);
            margin: 0 0 var(--job-mb) 0;
        }

        .contact-info {
            display: flex;
            gap: var(--contact-gap);

            .contact-item {
                font-size: var(--contact-size);
                color: $font-dark;
                line-height: var(--contact-lh);
            }
        }
    }

    .photo-wrapper {
        display: flex;
        justify-content: center;
        width: var(--photo-w);
        height: var(--photo-h);
        overflow: hidden;

        .photo-placeholder {
            width: 100%;
            height: 100%;
            background-color: $bg-gray;
        }
    }
}

.module-section {
    --module-mb: #{vh(47)};
    --title-size: #{vw(26.4)};
    --title-lh: #{vh(26.4)};
    --title-mb: #{vh(14.88)};
    --divider-h: #{vh(2.4)};
    --header-mb: #{vh(23.52)};
    --grid-gap-v: #{vh(4.8)};
    --grid-gap-h: #{vw(240)};
    --field-size: #{vw(19.2)};
    --field-lh: #{vh(38.4)};

    .size-small & {
        --module-mb: #{vh(20)};
        --title-size: #{vw(11.66)};
        --title-lh: #{vh(11.66)};
        --title-mb: #{vh(6.6)};
        --divider-h: #{vh(1.06)};
        --header-mb: #{vh(10.36)};
        --grid-gap-v: #{vh(2)};
        --grid-gap-h: #{vw(105.8)};
        --field-size: #{vw(8.48)};
        --field-lh: #{vh(16.96)};
    }

    margin-bottom: var(--module-mb);

    .module-header {
        margin-bottom: var(--header-mb);

        .module-title {
            font-size: var(--title-size);
            font-weight: 500;
            color: $font-dark;
            line-height: var(--title-lh);
            margin: 0 0 var(--title-mb) 0;
        }

        .divider-line {
            height: var(--divider-h);
            background-color: $font-dark;
        }
    }

    .basic-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--grid-gap-v) var(--grid-gap-h);

        .field-item {
            .field-text {
                font-size: var(--field-size);
                color: $font-dark;
                line-height: var(--field-lh);
            }
        }
    }

    .experience-list {
        --exp-mb: #{vh(45.6)};
        --exp-header-mb: #{vh(23.76)};
        --exp-size: #{vw(19.2)};
        --exp-lh: #{vh(38.4)};
        --list-pl: #{vw(28.8)};
        --list-lh: #{vh(26.4)};
        --list-mb: #{vh(11.34)};

        .size-small & {
            --exp-mb: #{vh(20)};
            --exp-header-mb: #{vh(10.52)};
            --exp-size: #{vw(8.48)};
            --exp-lh: #{vh(16.96)};
            --list-pl: #{vw(12.72)};
            --list-lh: #{vh(11.66)};
            --list-mb: #{vh(5)};
        }

        .experience-item {
            margin-bottom: var(--exp-mb);

            &:last-child {
                margin-bottom: 0;
            }

            .experience-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: var(--exp-header-mb);

                .experience-title {
                    font-size: var(--exp-size);
                    font-weight: 600;
                    color: $font-dark;
                    line-height: var(--exp-lh);
                    margin: 0;
                }

                .experience-time {
                    font-size: var(--exp-size);
                    color: $font-dark;
                    line-height: var(--exp-lh);
                    margin: 0;
                    text-align: right;
                }
            }

            .experience-content {
                .duties-list {
                    margin: 0;
                    padding-left: var(--list-pl);
                    list-style: disc;

                    li {
                        font-size: var(--exp-size);
                        color: $font-dark;
                        line-height: var(--list-lh);
                        margin-bottom: var(--list-mb);

                        &:last-child {
                            margin-bottom: 0;
                        }
                    }
                }

                .description-text {
                    font-size: var(--exp-size);
                    color: $font-dark;
                    line-height: var(--list-lh);
                    margin: 0;
                }
            }
        }
    }
}

.placeholder {
    color: $placeholder-color;
}

.time-placeholder {
    color: $placeholder-color;
    text-align: right;
}

.text-module {
    --text-size: #{vw(19.2)};
    --text-lh: #{vh(26.4)};

    .size-small & {
        --text-size: #{vw(8.48)};
        --text-lh: #{vh(11.66)};
    }

    .text-content {
        font-size: var(--text-size);
        color: $font-dark;
        line-height: var(--text-lh);
        margin: 0;
        white-space: pre-line;

        &.placeholder {
            color: $placeholder-color;
        }
    }
}
</style>
