<template>
    <div :mode="mode" class="resume-preview">
        <div :class="{ 'no-scroll': isGenerating }" class="preview-card">
            <!-- 模块管理按钮（人工模式） -->
            <div v-if="mode === 'manual'" class="module-manage-wrapper">
                <ResumeModuleManager
                    :applied-modules="appliedModules"
                    :available-modules-list="allAvailableModules"
                    trigger-icon="icon-liebiao"
                    trigger-text="模块管理"
                    @on-apply="handleModulesApply"
                />
            </div>

            <!-- 个人信息区 -->
            <div v-if="basicInfoModule" class="personal-info align-between">
                <div class="info-left">
                    <Input v-if="mode === 'manual' && isEditingBasicInfo" v-model="editFormData.name"
                           :maxlength="getTopField('name')?.maxLength || 0"
                           :placeholder="getTopField('name')?.fieldName"
                           class="name-input"/>
                    <div v-else
                         :class="{ 'streaming-highlight': currentStreamingField === getTopField('name')?.uuid, 'placeholder': !getStreamValue(getTopField('name')?.uuid) }"
                         class="name">
                        {{ getStreamValue(getTopField('name')?.uuid) || getTopField('name')?.fieldName }}
                    </div>
                    <Input v-if="mode === 'manual' && isEditingBasicInfo" v-model="editFormData.job_position"
                           :maxlength="getTopField('job_position')?.maxLength || 0"
                           :placeholder="getTopField('job_position')?.fieldName" class="job-input"/>
                    <div v-else
                         :class="{ 'streaming-highlight': currentStreamingField === getTopField('job_position')?.uuid, 'placeholder': !getStreamValue(getTopField('job_position')?.uuid) }"
                         class="job-title">
                        {{
                            getStreamValue(getTopField('job_position')?.uuid) || getTopField('job_position')?.fieldName
                        }}
                    </div>
                    <div v-if="getTopField('mobile')?.uuid && mode === 'manual' && isEditingBasicInfo"
                         class="contact-field flex-column">
                        <span class="field-prefix">{{ getTopField('mobile')?.fieldName }}</span>
                        <Input v-model="editFormData.mobile" :maxlength="getTopField('mobile')?.maxLength || 0"
                               class="contact-input" placeholder="请输入"/>
                    </div>
                    <div v-else-if="getTopField('mobile')?.uuid"
                         :class="{ 'streaming-highlight': currentStreamingField === getTopField('mobile')?.uuid }"
                         class="contact-item phone">
                        {{ getTopField('mobile')?.fieldName }}：{{ getStreamValue(getTopField('mobile')?.uuid) }}
                    </div>
                    <div v-if="getTopField('email')?.uuid && mode === 'manual' && isEditingBasicInfo"
                         class="contact-field flex-column">
                        <span class="field-prefix">{{ getTopField('email')?.fieldName }}</span>
                        <Input v-model="editFormData.email" :maxlength="getTopField('email')?.maxLength || 0"
                               class="contact-input" placeholder="请输入"/>
                    </div>
                    <div v-else-if="getTopField('email')?.uuid"
                         :class="{ 'streaming-highlight': currentStreamingField === getTopField('email')?.uuid }"
                         class="contact-item">
                        {{ getTopField('email')?.fieldName }}：{{ getStreamValue(getTopField('email')?.uuid) }}
                    </div>
                </div>
                <div v-if="getTopField('personal_image')?.uuid" class="photo-area flex-center mr-40 pointer"
                     @click="handlePhotoClick">
                    <input ref="photoInput" accept="image/jpg,image/jpeg,image/png" style="display: none" type="file"
                           @change="handlePhotoChange"/>
                    <img v-if="photoUrl" :src="photoUrl" :style="photoStyle" alt="照片" class="photo-img"/>
                    <SvgIcon v-else color="#9499A4" name="icon-xinzeng" size="20"/>
                </div>
            </div>

            <!-- 动态渲染模块 -->
            <template v-for="module in sortedModules" :key="module.uuid">
                <!-- 基本信息 -->
                <section v-if="module.moduleKey === 'basic_info' && hasEntries(module)" class="section base-info">
                    <div class="section-header align-between flex-center">
                        <h2 class="section-title">{{ module.moduleName }}</h2>
                        <div v-if="mode === 'manual'" class="action-btns flex">
                            <div v-if="!isEditingBasicInfo" class="action-btn flex-column pointer mr-20"
                                 @click="startEdit(module)">
                                <SvgIcon color="#9499A4" name="icon-bianji-main" size="12"/>
                                <span>编辑</span>
                            </div>
                            <div v-if="isEditingBasicInfo" class="action-btn flex-column pointer mr-20"
                                 @click="cancelEdit">
                                <SvgIcon color="#9499A4" name="icon-quxiao" size="12"/>
                                <span>取消</span>
                            </div>
                            <ResumeModuleManager
                                v-if="!isEditingBasicInfo"
                                v-slot="{ toggle, visible }"
                                :applied-modules="appliedFields"
                                :available-modules-list="allAvailableFields"
                                :column-width="200"
                                :disabled-drag-ids="disabledFieldIds"
                                :item-type="'field' as ItemType"
                                @on-apply="handleFieldsApply"
                            >
                                <div :class="{ active: visible }" class="action-btn flex-column pointer"
                                     @click="toggle">
                                    <SvgIcon color="#9499A4" name="icon-guanli" size="12"/>
                                    <span>管理</span>
                                </div>
                            </ResumeModuleManager>
                            <div v-if="isEditingBasicInfo" class="action-btn flex-column pointer"
                                 @click="saveEdit(module)">
                                <SvgIcon color="#9499A4" name="icon-queding" size="12"/>
                                <span>确定</span>
                            </div>
                        </div>
                    </div>
                    <div class="divider first"></div>
                    <div class="info-list">
                        <div v-for="field in getBasicInfoFields" v-if="mode === 'manual' && isEditingBasicInfo"
                             :key="field.uuid" class="info-field flex-column">
                            <span class="field-prefix">{{ field.fieldName }}</span>
                            <Input v-model="editFormData[field.fieldKey]" :maxlength="field.maxLength || 0"
                                   class="info-input"/>
                        </div>
                        <div v-for="field in getBasicInfoFields" v-else
                             :class="{ 'streaming-highlight': currentStreamingField === field.uuid }"
                             class="info-item flex-column">
                            {{ field.fieldName }}：{{ getStreamValue(field.uuid) }}
                        </div>
                    </div>
                </section>

                <!-- 教育经历 -->
                <section v-else-if="module.moduleKey === 'education_history' && hasEntries(module)"
                         class="section-spec">
                    <div class="section-header align-between flex-center">
                        <h2 class="section-title">{{ module.moduleName }}</h2>
                        <ResumeModuleManager
                            v-if="mode === 'manual'"
                            v-slot="{ toggle, visible }"
                            :applied-modules="getAppliedEntries(module.uuid)"
                            :column-width="200"
                            :show-add-button="false"
                            @on-apply="(entries) => handleEntriesApply(module.uuid, entries)"
                        >
                            <div :class="{ active: visible }" class="action-btn flex-column pointer" @click="toggle">
                                <SvgIcon color="#9499A4" name="icon-guanli" size="12"/>
                                <span>管理</span>
                            </div>
                        </ResumeModuleManager>
                    </div>
                    <div class="divider"></div>
                    <div v-for="entry in module.entries" :key="entry.entryUuid" class="item mb-20">
                        <div v-if="mode === 'manual' && editingEntryUuid === entry.entryUuid"
                             class="entry-edit-wrapper full-width">
                            <div class="entry-fields flex-column">
                                <Input v-model="entryEditData.school_name"
                                       :maxlength="getFieldMaxLength(entry, 'school_name')"
                                       :placeholder="getFieldName(entry, 'school_name')"
                                       class="field-input field-input-half"/>
                                <Input v-model="entryEditData.major"
                                       :maxlength="getFieldMaxLength(entry, 'major')"
                                       :placeholder="getFieldName(entry, 'major')"
                                       class="field-input field-input-half"/>
                            </div>
                            <div class="entry-fields flex-column mt-10">
                                <Input v-model="entryEditData.degree"
                                       :maxlength="getFieldMaxLength(entry, 'degree')"
                                       :placeholder="getFieldName(entry, 'degree')"
                                       class="field-input field-input-half"/>
                                <div class="time-fields flex-column">
                                    <Input v-model="entryEditData.start_time"
                                           :maxlength="getFieldMaxLength(entry, 'start_time')"
                                           class="field-input field-input-time"
                                           placeholder="开始时间"/>
                                    <span class="time-separator">至</span>
                                    <Input v-model="entryEditData.end_time"
                                           :maxlength="getFieldMaxLength(entry, 'end_time')"
                                           class="field-input field-input-time"
                                           placeholder="结束时间"/>
                                </div>
                            </div>
                            <div class="entry-textarea-wrapper mt-10">
                                <Input v-model="entryEditData.description"
                                       :maxlength="getFieldMaxLength(entry, 'description')"
                                       :placeholder="getFieldName(entry, 'description')"
                                       :rows="5" class="entry-textarea" type="textarea"/>
                                <div class="char-count">{{
                                        entryEditData.description?.length || 0
                                    }}/{{ getFieldMaxLength(entry, 'description') }}
                                </div>
                            </div>
                            <div class="entry-edit-footer align-between flex-center">
                                <div class="ai-actions flex-column">
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('polish')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>润色</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('expand')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>扩展</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('simplify')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>简化</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('summarize')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>总结</span>
                                    </div>
                                </div>
                                <div class="edit-actions flex-column">
                                    <div class="action-item flex-column" @click="cancelEntryEdit">
                                        <SvgIcon color="#9499A4" name="icon-quxiao" size="12"/>
                                        <span>取消</span>
                                    </div>
                                    <div class="action-item flex-column" @click="saveEntryEdit(entry)">
                                        <SvgIcon color="#9499A4" name="icon-queding" size="12"/>
                                        <span>确定</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else :class="{ 'streaming-highlight': isEntryStreaming(entry) }" class="item-main">
                            <div class="experience-header align-between">
                                <span>
                                    <span
                                        :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'school_name')) }">{{
                                            getStreamValue(getFieldUuid(entry, 'school_name')) || getFieldName(entry, 'school_name')
                                        }}</span> ｜
                                    <span :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'major')) }">{{
                                            getStreamValue(getFieldUuid(entry, 'major')) || getFieldName(entry, 'major')
                                        }}</span> ｜
                                    <span :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'degree')) }">{{
                                            getStreamValue(getFieldUuid(entry, 'degree')) || getFieldName(entry, 'degree')
                                        }}</span>
                                </span>
                                <span :class="{ 'time-placeholder': !getStreamValue(getFieldUuid(entry, 'end_time')) }">
                                    {{
                                        getStreamValue(getFieldUuid(entry, 'end_time')) || getFieldName(entry, 'end_time')
                                    }}
                                </span>
                            </div>
                            <div
                                :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'description')) }"
                                class="experience-desc">
                                {{
                                    getStreamValue(getFieldUuid(entry, 'description')) || getFieldName(entry, 'description')
                                }}
                            </div>
                            <div v-if="mode === 'manual'" class="edit-icon flex-column pointer"
                                 @click="startEntryEdit(entry)">
                                <SvgIcon class="pointer" color="#9499A4" name="icon-bianji-xian" size="14"/>
                            </div>
                        </div>
                    </div>
                    <div v-if="mode === 'manual'" class="add-entry-btn flex-column pointer"
                         @click="handleAddEntry(module)">
                        <SvgIcon color="#9499A4" name="icon-xinzeng-main" size="12"/>
                        <span>增加新的经历</span>
                    </div>
                </section>

                <!-- 实习经历 -->
                <section v-else-if="module.moduleKey === 'internship_history' && hasEntries(module)"
                         class="section-spec">
                    <div class="section-header align-between flex-center">
                        <h2 class="section-title">{{ module.moduleName }}</h2>
                        <ResumeModuleManager
                            v-if="mode === 'manual'"
                            v-slot="{ toggle, visible }"
                            :applied-modules="getAppliedEntries(module.uuid)"
                            :column-width="200"
                            :show-add-button="false"
                            @on-apply="(entries) => handleEntriesApply(module.uuid, entries)"
                        >
                            <div :class="{ active: visible }" class="action-btn flex-column pointer" @click="toggle">
                                <SvgIcon color="#9499A4" name="icon-guanli" size="12"/>
                                <span>管理</span>
                            </div>
                        </ResumeModuleManager>
                    </div>
                    <div class="divider"></div>
                    <div v-for="entry in module.entries" :key="entry.entryUuid" class="item mb-20">
                        <div v-if="mode === 'manual' && editingEntryUuid === entry.entryUuid"
                             class="entry-edit-wrapper full-width">
                            <div class="entry-fields flex-column">
                                <Input v-model="entryEditData.company_name"
                                       :maxlength="getFieldMaxLength(entry, 'company_name')"
                                       :placeholder="getFieldName(entry, 'company_name')"
                                       class="field-input field-input-half"/>
                                <Input v-model="entryEditData.position_name"
                                       :maxlength="getFieldMaxLength(entry, 'position_name')"
                                       :placeholder="getFieldName(entry, 'position_name')"
                                       class="field-input field-input-half ml-10"/>
                            </div>
                            <div class="entry-fields flex-column mt-10">
                                <div class="time-fields flex-column">
                                    <Input v-model="entryEditData.start_time"
                                           :maxlength="getFieldMaxLength(entry, 'start_time')"
                                           class="field-input field-input-time" placeholder="开始时间"/>
                                    <span class="time-separator">至</span>
                                    <Input v-model="entryEditData.end_time"
                                           :maxlength="getFieldMaxLength(entry, 'end_time')"
                                           class="field-input field-input-time" placeholder="结束时间"/>
                                </div>
                            </div>
                            <div class="entry-textarea-wrapper mt-10">
                                <Input v-model="entryEditData.description"
                                       :maxlength="getFieldMaxLength(entry, 'description')"
                                       :placeholder="getFieldName(entry, 'description')"
                                       :rows="5" class="entry-textarea" type="textarea"/>
                                <div class="char-count">{{
                                        entryEditData.description?.length || 0
                                    }}/{{ getFieldMaxLength(entry, 'description') }}
                                </div>
                            </div>
                            <div class="entry-edit-footer align-between flex-center">
                                <div class="ai-actions flex-column">
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('polish')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>润色</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('expand')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>扩展</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('simplify')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>简化</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('summarize')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>总结</span>
                                    </div>
                                </div>
                                <div class="edit-actions flex-column">
                                    <div class="action-item flex-column" @click="cancelEntryEdit">
                                        <SvgIcon color="#9499A4" name="icon-quxiao" size="12"/>
                                        <span>取消</span>
                                    </div>
                                    <div class="action-item flex-column" @click="saveEntryEdit(entry)">
                                        <SvgIcon color="#9499A4" name="icon-queding" size="12"/>
                                        <span>确定</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else :class="{ 'streaming-highlight': isEntryStreaming(entry) }" class="item-main">
                            <div class="experience-header align-between">
                                <span>
                                    <span
                                        :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'company_name')) }">{{
                                            getStreamValue(getFieldUuid(entry, 'company_name')) || getFieldName(entry, 'company_name')
                                        }}</span> ｜
                                    <span
                                        :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'position_name')) }">{{
                                            getStreamValue(getFieldUuid(entry, 'position_name')) || getFieldName(entry, 'position_name')
                                        }}</span>
                                </span>
                                <span :class="{ 'time-placeholder': !getStreamValue(getFieldUuid(entry, 'end_time')) }">
                                    {{
                                        getStreamValue(getFieldUuid(entry, 'end_time')) || getFieldName(entry, 'end_time')
                                    }}
                                </span>
                            </div>
                            <div
                                :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'description')) }"
                                class="experience-desc">
                                {{
                                    getStreamValue(getFieldUuid(entry, 'description')) || getFieldName(entry, 'description')
                                }}
                            </div>
                            <div v-if="mode === 'manual'" class="edit-icon" @click="startEntryEdit(entry)">
                                <SvgIcon color="#9499A4" name="icon-bianji-xian" size="14"/>
                            </div>
                        </div>
                    </div>
                    <div v-if="mode === 'manual'" class="add-entry-btn" @click="handleAddEntry(module)">
                        <SvgIcon class="pointer" color="#9499A4" name="icon-xinzeng-main" size="12"/>
                        <span>增加新的经历</span>
                    </div>
                </section>

                <!-- 工作经历 -->
                <section v-else-if="module.moduleKey === 'work_history' && hasEntries(module)" class="section-spec">
                    <div class="section-header align-between flex-center">
                        <h2 class="section-title">{{ module.moduleName }}</h2>
                        <ResumeModuleManager
                            v-if="mode === 'manual'"
                            v-slot="{ toggle, visible }"
                            :applied-modules="getAppliedEntries(module.uuid)"
                            :column-width="200"
                            :show-add-button="false"
                            @on-apply="(entries) => handleEntriesApply(module.uuid, entries)"
                        >
                            <div :class="{ active: visible }" class="action-btn flex-column pointer" @click="toggle">
                                <SvgIcon color="#9499A4" name="icon-guanli" size="12"/>
                                <span>管理</span>
                            </div>
                        </ResumeModuleManager>
                    </div>
                    <div class="divider"></div>
                    <div v-for="entry in module.entries" :key="entry.entryUuid" class="item mb-20">
                        <div v-if="mode === 'manual' && editingEntryUuid === entry.entryUuid"
                             class="entry-edit-wrapper full-width">
                            <div class="entry-fields flex-column">
                                <Input v-model="entryEditData.company_name"
                                       :maxlength="getFieldMaxLength(entry, 'company_name')"
                                       :placeholder="getFieldName(entry, 'company_name')"
                                       class="field-input field-input-half"/>
                                <Input v-model="entryEditData.position_name"
                                       :maxlength="getFieldMaxLength(entry, 'position_name')"
                                       :placeholder="getFieldName(entry, 'position_name')"
                                       class="field-input field-input-half ml-10"/>
                            </div>
                            <div class="entry-fields flex-column mt-10">
                                <div class="time-fields flex-column">
                                    <Input v-model="entryEditData.start_time"
                                           :maxlength="getFieldMaxLength(entry, 'start_time')"
                                           class="field-input field-input-time"
                                           placeholder="开始时间"/>
                                    <span class="time-separator">至</span>
                                    <Input v-model="entryEditData.end_time"
                                           :maxlength="getFieldMaxLength(entry, 'end_time')"
                                           class="field-input field-input-time"
                                           placeholder="结束时间"/>
                                </div>
                            </div>
                            <div class="entry-textarea-wrapper mt-10">
                                <Input v-model="entryEditData.description"
                                       :maxlength="getFieldMaxLength(entry, 'description')"
                                       :placeholder="getFieldName(entry, 'description')"
                                       :rows="5" class="entry-textarea" type="textarea"/>
                                <div class="char-count">{{
                                        entryEditData.description?.length || 0
                                    }}/{{ getFieldMaxLength(entry, 'description') }}
                                </div>
                            </div>
                            <div class="entry-edit-footer align-between flex-center">
                                <div class="ai-actions flex-column">
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('polish')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>润色</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('expand')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>扩展</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('simplify')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>简化</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('summarize')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>总结</span>
                                    </div>
                                </div>
                                <div class="edit-actions flex-column">
                                    <div class="action-item flex-column" @click="cancelEntryEdit">
                                        <SvgIcon color="#9499A4" name="icon-quxiao" size="12"/>
                                        <span>取消</span>
                                    </div>
                                    <div class="action-item flex-column" @click="saveEntryEdit(entry)">
                                        <SvgIcon color="#9499A4" name="icon-queding" size="12"/>
                                        <span>确定</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else :class="{ 'streaming-highlight': isEntryStreaming(entry) }" class="item-main">
                            <div class="experience-header align-between">
                                <span>
                                    <span
                                        :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'company_name')) }">{{
                                            getStreamValue(getFieldUuid(entry, 'company_name')) || getFieldName(entry, 'company_name')
                                        }}</span> ｜
                                    <span
                                        :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'position_name')) }">{{
                                            getStreamValue(getFieldUuid(entry, 'position_name')) || getFieldName(entry, 'position_name')
                                        }}</span>
                                </span>
                                <span :class="{ 'time-placeholder': !getStreamValue(getFieldUuid(entry, 'end_time')) }">
                                    {{
                                        getStreamValue(getFieldUuid(entry, 'end_time')) || getFieldName(entry, 'end_time')
                                    }}
                                </span>
                            </div>
                            <div
                                :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'description')) }"
                                class="experience-desc">
                                {{
                                    getStreamValue(getFieldUuid(entry, 'description')) || getFieldName(entry, 'description')
                                }}
                            </div>
                            <div v-if="mode === 'manual'" class="edit-icon" @click="startEntryEdit(entry)">
                                <SvgIcon color="#9499A4" name="icon-bianji-xian" size="14"/>
                            </div>
                        </div>
                    </div>
                    <div v-if="mode === 'manual'" class="add-entry-btn" @click="handleAddEntry(module)">
                        <SvgIcon class="pointer" color="#9499A4" name="icon-xinzeng-main" size="12"/>
                        <span>增加新的经历</span>
                    </div>
                </section>

                <!-- 项目经历 -->
                <section v-else-if="module.moduleKey === 'project_history' && hasEntries(module)" class="section-spec">
                    <div class="section-header align-between flex-center">
                        <h2 class="section-title">{{ module.moduleName }}</h2>
                        <ResumeModuleManager
                            v-if="mode === 'manual'"
                            v-slot="{ toggle, visible }"
                            :applied-modules="getAppliedEntries(module.uuid)"
                            :column-width="200"
                            :show-add-button="false"
                            @on-apply="(entries) => handleEntriesApply(module.uuid, entries)"
                        >
                            <div :class="{ active: visible }" class="action-btn flex-column pointer" @click="toggle">
                                <SvgIcon color="#9499A4" name="icon-guanli" size="12"/>
                                <span>管理</span>
                            </div>
                        </ResumeModuleManager>
                    </div>
                    <div class="divider"></div>
                    <div v-for="entry in module.entries" :key="entry.entryUuid" class="item mb-20">
                        <div v-if="mode === 'manual' && editingEntryUuid === entry.entryUuid"
                             class="entry-edit-wrapper full-width">
                            <div class="entry-fields flex-column">
                                <Input v-model="entryEditData.project_name"
                                       :maxlength="getFieldMaxLength(entry, 'project_name')"
                                       :placeholder="getFieldName(entry, 'project_name')"
                                       class="field-input field-input-half"/>
                                <div class="time-fields flex-column">
                                    <Input v-model="entryEditData.start_time"
                                           :maxlength="getFieldMaxLength(entry, 'start_time')"
                                           class="field-input field-input-time" placeholder="开始时间"/>
                                    <span class="time-separator">至</span>
                                    <Input v-model="entryEditData.end_time"
                                           :maxlength="getFieldMaxLength(entry, 'end_time')"
                                           class="field-input field-input-time" placeholder="结束时间"/>
                                </div>
                            </div>
                            <div class="entry-textarea-wrapper mt-10">
                                <Input v-model="entryEditData.description"
                                       :maxlength="getFieldMaxLength(entry, 'description')"
                                       :placeholder="getFieldName(entry, 'description')"
                                       :rows="5" class="entry-textarea"
                                       type="textarea"/>
                                <div class="char-count">{{
                                        entryEditData.description?.length || 0
                                    }}/{{ getFieldMaxLength(entry, 'description') }}
                                </div>
                            </div>
                            <div class="entry-edit-footer align-between flex-center">
                                <div class="ai-actions flex-column">
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('polish')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>润色</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('expand')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>扩展</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('simplify')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>简化</span>
                                    </div>
                                    <div class="ai-btn pointer flex-column" @click="handleAiAction('summarize')">
                                        <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                        <span>总结</span>
                                    </div>
                                </div>
                                <div class="edit-actions flex-column">
                                    <div class="action-item flex-column" @click="cancelEntryEdit">
                                        <SvgIcon color="#9499A4" name="icon-quxiao" size="12"/>
                                        <span>取消</span>
                                    </div>
                                    <div class="action-item flex-column" @click="saveEntryEdit(entry)">
                                        <SvgIcon color="#9499A4" name="icon-queding" size="12"/>
                                        <span>确定</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else :class="{ 'streaming-highlight': isEntryStreaming(entry) }" class="item-main">
                            <div class="experience-header align-between">
                                <span :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'project_name')) }">
                                    {{
                                        getStreamValue(getFieldUuid(entry, 'project_name')) || getFieldName(entry, 'project_name')
                                    }}
                                </span>
                                <span :class="{ 'time-placeholder': !getStreamValue(getFieldUuid(entry, 'end_time')) }">
                                    {{
                                        getStreamValue(getFieldUuid(entry, 'end_time')) || getFieldName(entry, 'end_time')
                                    }}
                                </span>
                            </div>
                            <div
                                :class="{ 'placeholder': !getStreamValue(getFieldUuid(entry, 'description')) }"
                                class="experience-desc">
                                {{
                                    getStreamValue(getFieldUuid(entry, 'description')) || getFieldName(entry, 'description')
                                }}
                            </div>
                            <div v-if="mode === 'manual'" class="edit-icon" @click="startEntryEdit(entry)">
                                <SvgIcon color="#9499A4" name="icon-bianji-xian" size="14"/>
                            </div>
                        </div>
                    </div>
                    <div v-if="mode === 'manual'" class="add-entry-btn" @click="handleAddEntry(module)">
                        <SvgIcon class="pointer" color="#9499A4" name="icon-xinzeng-main" size="12"/>
                        <span>增加新的经历</span>
                    </div>
                </section>

                <!-- 其他文本类模块 -->
                <section v-else-if="module.moduleKey !== 'default_info' && hasEntries(module)" class="section">
                    <div class="section-header align-between flex-center">
                        <h2 class="section-title">{{ module.moduleName }}</h2>
                    </div>
                    <div class="divider"></div>

                    <!-- 编辑模式 -->
                    <div v-if="mode === 'manual' && editingModuleUuid === module.uuid" class="text-edit-wrapper">
                        <div class="text-edit-box">
                            <Input
                                v-model="editTextContent"
                                :maxlength="getTextModuleMaxLength(module)"
                                :placeholder="editPlaceholder"
                                :rows="5"
                                class="text-edit-area"
                                type="textarea"
                            />
                            <div class="char-count">{{ editTextContent.length }}/{{
                                    getTextModuleMaxLength(module)
                                }}
                            </div>
                        </div>
                        <div class="text-edit-footer align-between flex-center">
                            <div class="ai-actions flex-column flex">
                                <div class="ai-btn pointer flex-column" @click="handleAiAction('polish')">
                                    <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                    <span>润色</span>
                                </div>
                                <div class="ai-btn pointer flex-column" @click="handleAiAction('expand')">
                                    <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                    <span>扩展</span>
                                </div>
                                <div class="ai-btn pointer flex-column" @click="handleAiAction('simplify')">
                                    <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                    <span>简化</span>
                                </div>
                                <div class="ai-btn pointer flex-column" @click="handleAiAction('summarize')">
                                    <SvgIcon color="#FC8719" name="icon-ai-xing" size="16"/>
                                    <span>总结</span>
                                </div>
                            </div>
                            <div class="edit-actions flex-column">
                                <div class="action-item flex-column" @click="cancelTextEdit">
                                    <SvgIcon color="#9499A4" name="icon-quxiao" size="12"/>
                                    <span>取消</span>
                                </div>
                                <div class="action-item flex-column" @click="saveTextEdit(module)">
                                    <SvgIcon color="#9499A4" name="icon-queding" size="12"/>
                                    <span>确定</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 展示模式 -->
                    <div v-else
                         :class="{ 'placeholder': !getStreamValue(module.entries[0]?.fields[0]?.uuid), 'streaming-highlight': currentStreamingField === module.entries[0]?.fields[0]?.uuid }"
                         class="rich-text-desc"
                         style="white-space: pre-line;">
                        {{
                            getStreamValue(module.entries[0]?.fields[0]?.uuid) || module.entries[0]?.fields[0]?.fieldName
                        }}
                        <div v-if="mode === 'manual'" class="edit-icon flex-column pointer"
                             @click="startTextEdit(module)">
                            <SvgIcon color="#9499A4" name="icon-bianji-xian" size="14"/>
                        </div>
                    </div>
                </section>
            </template>

            <!-- 生成中遮罩层 -->
            <div v-if="isGenerating" class="generating-mask flex-center">
                <div class="loading-content column-center">
                    <img alt="加载中" class="loading-icon" src="@/assets/images/loading.gif"/>
                    <p class="loading-text">AI简历模板生成中</p>
                </div>
            </div>
        </div>

        <ResumeAiOptimize
            v-model="showAiOptimize"
            :field-name="aiOptimizeProps.fieldName"
            :max-length="aiOptimizeProps.maxLength"
            :mode="aiOptimizeProps.mode"
            :resume-id="aiOptimizeProps.resumeId"
            :text="aiOptimizeProps.text"
            @submit="handleAiOptimizeSubmit"
        />
    </div>
</template>

<script lang="ts" setup>
import SvgIcon from '@/components/svgIcon/index.vue';
import ResumeModuleManager, {ItemType} from './ResumeModuleManager.vue';
import ResumeAiOptimize from './ResumeAiOptimize.vue';
import {computed, onMounted, ref, watch, withDefaults} from 'vue';
import {Input, Message} from 'view-ui-plus';
import {FileService} from '@/service/FileService';
import {ResumeService} from '@/service/ResumeService';
import {GetSystemModulesInDto} from '@/api/resume/dto/GetSystemModules';
import {GetModuleFieldsInDto} from '@/api/resume/dto/GetModuleFields';
import {UpdateModulesInDto} from '@/api/resume/dto/UpdateModules';
import {ModuleUpdateBean} from '@/api/resume/dto/bean/ModuleUpdateBean';
import {UpdateModuleFieldsInDto} from '@/api/resume/dto/UpdateModuleFields';
import {FieldUpdateBean} from '@/api/resume/dto/bean/FieldUpdateBean';
import {UpdateModuleEntriesInDto} from '@/api/resume/dto/UpdateModuleEntries';
import {EntryUpdateBean} from '@/api/resume/dto/bean/EntryUpdateBean';
import {Config} from "@/Config.ts";

const props = withDefaults(defineProps<{
    isGenerating?: boolean;
    resumeData?: any;
    mode?: 'ai' | 'manual';
}>(), {
    mode: 'ai'
});

const emit = defineEmits<{
    'update-modules': [];
    'data-change': [data: any];
}>();

const streamValues = ref<Map<string, string>>(new Map());
const currentStreamingField = ref<string>(''); // 当前正在流式输入的字段UUID
const isStreaming = ref(false); // 是否正在流式写入
const isEditingBasicInfo = ref(false);
const editFormData = ref<any>({});
const editingModuleUuid = ref<string>(''); // 当前编辑的模块UUID
const editTextContent = ref<string>(''); // 编辑中的文本内容
const editPlaceholder = ref<string>('请输入内容'); // 编辑框提示词
const editingEntryUuid = ref<string>(''); // 当前编辑的经历条目UUID
const entryEditData = ref<any>({}); // 经历条目编辑数据
const allAvailableModules = ref<any[]>([]); // 所有可用模块列表
const allAvailableFields = ref<any[]>([]); // 所有可用字段列表
const resumeService = new ResumeService();
const photoInput = ref<HTMLInputElement>();
const photoUrl = ref<string>('');
const photoStyle = ref<any>({});
const showAiOptimize = ref(false);
const aiOptimizeProps = ref<{
    resumeId: string;
    text: string;
    fieldName: string;
    maxLength: number;
    mode: string;
}>({
    resumeId: '',
    text: '',
    fieldName: '',
    maxLength: 0,
    mode: ''
});

// 模块管理数据
const appliedModules = computed(() => {
    if (!props.resumeData?.modules) return [];
    const a = props.resumeData.modules
        .filter((m: any) => m.moduleKey !== 'default_info' && m.moduleKey !== 'basic_info')
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((m: any) => ({
            id: m.moduleDefinitionUuid,
            name: m.moduleName
        }));
    return a
});


const fetchAvailableFields = async (basicInfoModuleId: string) => {
    try {
        const params = new GetModuleFieldsInDto();
        params.moduleDefinitionId = basicInfoModuleId;
        const result = await resumeService.getModuleFields(params);

        if (result.code === 200 && result.data?.fields) {
            return result.data.fields.map(f => ({
                id: f.uuid,
                name: f.fieldName
            }));
        }
        return [];
    } catch (error) {
        console.error('获取模块字段失败', error);
        return [];
    }
};

const fetchAvailableModules = async () => {
    try {
        const params = new GetSystemModulesInDto();
        const result = await resumeService.getSystemModules(params);

        if (result.code === 200 && result.data?.modules) {
            const basicInfoModule = result.data.modules.find(m => m.moduleKey === 'basic_info');
            if (basicInfoModule?.uuid) {
                allAvailableFields.value = await fetchAvailableFields(basicInfoModule.uuid);
            }

            return result.data.modules
                .filter(m => m.moduleKey !== 'basic_info')
                .map(m => ({
                    id: m.uuid,
                    name: m.moduleName
                }));
        }
        return [];
    } catch (error) {
        console.error('获取系统模块失败', error);
        return [];
    }
};

const handleModulesApply = async (modules: any[]) => {
    if (!props.resumeData?.modules) return;

    try {
        const params = new UpdateModulesInDto();
        params.resumeId = props.resumeData.uuid || '';

        const basicInfo = basicInfoModule.value;
        const basicBean = new ModuleUpdateBean();
        basicBean.moduleDefinitionUuid = basicInfo.moduleDefinitionUuid;
        basicBean.sortOrder = 1;
        basicBean.uuid = basicInfo.uuid;

        params.modules = [
            basicBean,
            ...modules.map((module, index) => {
                const bean = new ModuleUpdateBean();
                bean.moduleDefinitionUuid = module.id.includes('custom') ? undefined : module.id;
                bean.sortOrder = index + 2;
                const existingModule = props.resumeData.modules.find((m: any) => m.moduleDefinitionUuid === module.id);
                console.log(bean, 'bean')
                bean.uuid = existingModule?.uuid || undefined;
                if (!bean.uuid) {
                    bean.moduleName = module.name;
                }
                return bean;
            })
        ];

        await resumeService.updateModules(params);
        Message.success('模块更新成功');
        emit('update-modules');
    } catch (error) {
        Message.error('模块更新失败');
        console.error(error);
    }
};

const basicInfoModule = computed(() => {
    return props.resumeData?.modules?.find((m: any) => m.moduleKey === 'basic_info');
});

const topFields = ['name', 'job_position', 'mobile', 'email', 'personal_image'];
const topFixedFields = ['name', 'job_position'];

const getTopField = (fieldKey: string) => {
    const currentField = basicInfoModule.value?.entries?.[0]?.fields?.find((f: any) => f.fieldKey === fieldKey);
    if (currentField) return currentField;

    const fieldNameMap: Record<string, string> = {
        name: '姓名',
        job_position: '求职岗位',
        mobile: '手机',
        email: '邮箱',
        personal_image: '照片'
    };
    const fieldName = fieldNameMap[fieldKey] || '';
    return {fieldName, uuid: '', fieldKey};
};

const getBasicInfoFields = computed(() => {
    const fields = basicInfoModule.value?.entries?.[0]?.fields?.filter((f: any) => !topFields.includes(f.fieldKey)) || [];
    return fields.sort((a: any, b: any) => a.fieldSortOrder - b.fieldSortOrder);
});

const appliedFields = computed(() => {
    const fields = basicInfoModule.value?.entries?.[0]?.fields || [];
    return fields
        .filter((f: any) => f.fieldKey !== 'name' && f.fieldKey !== 'job_position')
        .map((f: any) => ({id: f.fieldDefinitionUuid, name: f.fieldName}));
});

const disabledFieldIds = computed(() => {
    const fieldNames = ['个人形象', '手机号码', '个人邮箱'];
    return fieldNames
        .map(name => allAvailableFields.value.find(f => f.name === name)?.id)
        .filter(Boolean) as string[];
});

const getAppliedEntries = (moduleUuid: string) => {
    const module = props.resumeData?.modules?.find((m: any) => m.uuid === moduleUuid);
    if (!module?.entries) return [];

    return module.entries.map((entry: any) => {
        const firstField = entry.fields?.[0];
        const name = firstField?.fieldValue || '未命名';
        return {id: entry.entryUuid, name};
    });
};

const handleEntriesApply = async (moduleUuid: string, entries: any[]) => {
    try {
        const params = new UpdateModuleEntriesInDto();
        params.resumeId = props.resumeData.uuid || '';
        params.moduleId = moduleUuid;
        params.entries = entries.map((entry, index) => {
            const bean = new EntryUpdateBean();
            bean.entryUuid = entry.id;
            bean.entrySortOrder = index + 1;
            return bean;
        });

        await resumeService.updateModuleEntries(params);
        Message.success('条目更新成功');
        emit('update-modules');
    } catch (error) {
        Message.error('条目更新失败');
        console.error(error);
    }
};

const handleFieldsApply = async (fields: any[]) => {
    console.log(fields, 'fields')
    if (!basicInfoModule.value?.entries?.[0]) return;
    try {
        const params = new UpdateModuleFieldsInDto();
        params.resumeId = props.resumeData.uuid || '';
        params.moduleId = basicInfoModule.value.uuid;

        const topFieldsData = basicInfoModule.value.entries[0].fields
            .filter((f: any) => topFixedFields.includes(f.fieldKey))
        console.log(topFieldsData, 'fieldData')
        params.fields = [
            ...topFieldsData.map((f: any, index: number) => {
                const bean = new FieldUpdateBean();
                bean.uuid = f.uuid;
                bean.fieldDefinitionUuid = f.fieldDefinitionUuid;
                bean.sortOrder = index + 1;
                return bean;
            }),
            ...fields.map((field, index) => {
                const bean = new FieldUpdateBean();
                const existingField = basicInfoModule.value.entries[0].fields.find((f: any) => f.fieldDefinitionUuid === field.id);
                if (existingField) {
                    bean.uuid = existingField.uuid;
                    bean.fieldDefinitionUuid = field.id;
                } else if (field.isCustom) {
                    bean.fieldName = field.name;
                } else {
                    bean.fieldDefinitionUuid = field.id;
                }
                bean.sortOrder = topFieldsData.length + index + 1;
                return bean;
            })
        ];
        await resumeService.updateModuleFields(params);
        Message.success('字段更新成功');
        emit('update-modules');
    } catch (error) {
        Message.error('字段更新失败');
        console.error(error);
    }
};

const sortedModules = computed(() => {
    if (!props.resumeData?.modules) return [];
    return [...props.resumeData.modules].sort((a, b) => a.sortOrder - b.sortOrder);
});

const hasEntries = (module: any) => module.entries?.length > 0;

const getFieldName = (container: any, fieldKey: string) => {
    const fields = container.entries?.[0]?.fields || container.fields;
    return fields?.find((f: any) => f.fieldKey === fieldKey)?.fieldName || '';
};

const getFieldMaxLength = (container: any, fieldKey: string) => {
    const fields = container.entries?.[0]?.fields || container.fields;
    return fields?.find((f: any) => f.fieldKey === fieldKey)?.maxLength || 0;
};

const getTextModuleMaxLength = (module: any) => {
    return module.entries?.[0]?.fields?.[0]?.maxLength || 0;
};

const getFieldUuid = (container: any, fieldKey: string) => {
    const fields = container.entries?.[0]?.fields || container.fields;
    return fields?.find((f: any) => f.fieldKey === fieldKey)?.uuid || '';
};

const getStreamValue = (fieldUuid: string) => {
    return streamValues.value.get(fieldUuid) || '';
};

const isEntryStreaming = (entry: any) => {
    if (!currentStreamingField.value) return false;
    const fields = entry.fields || [];
    return fields.some((f: any) => f.uuid === currentStreamingField.value);
};

export interface StreamItem {
    fieldUuid: string;
    fieldValue: string;
}

const streamWrite = async (items: StreamItem[], speed: number = 50) => {
    isStreaming.value = true;
    try {
        for (const item of items) {
            currentStreamingField.value = item.fieldUuid;
            const chars = item.fieldValue.split('');
            let currentText = '';

            for (const char of chars) {
                currentText += char;
                streamValues.value.set(item.fieldUuid, currentText);
                await new Promise(resolve => setTimeout(resolve, speed));
            }
            currentStreamingField.value = '';
        }

        // 流式写入完成后，同步数据到 resumeData
        syncStreamValuesToResumeData();
    } finally {
        isStreaming.value = false;
    }
};

const syncStreamValuesToResumeData = () => {
    if (!props.resumeData?.modules) return;

    props.resumeData.modules.forEach((module: any) => {
        module.entries?.forEach((entry: any) => {
            entry.fields?.forEach((field: any) => {
                const streamValue = streamValues.value.get(field.uuid);
                if (streamValue !== undefined) {
                    field.fieldValue = streamValue;
                }
            });
        });
    });

    emit('data-change', props.resumeData);
};

const startEdit = (module: any) => {
    if (isEditingBasicInfo.value || editingEntryUuid.value || editingModuleUuid.value) {
        Message.warning('当前处于编辑中，请保存后再操作！');
        return;
    }
    isEditingBasicInfo.value = true;
    editFormData.value = {};
    module.entries[0]?.fields?.forEach((f: any) => {
        editFormData.value[f.fieldKey] = getStreamValue(f.uuid);
    });
};

const cancelEdit = () => {
    isEditingBasicInfo.value = false;
    editFormData.value = {};
};

const saveEdit = (module: any) => {
    module.entries[0]?.fields?.forEach((f: any) => {
        if (editFormData.value[f.fieldKey] !== undefined) {
            streamValues.value.set(f.uuid, editFormData.value[f.fieldKey]);
            f.fieldValue = editFormData.value[f.fieldKey];
        }
    });
    isEditingBasicInfo.value = false;
    emit('data-change', props.resumeData);
};

const startTextEdit = (module: any) => {
    if (isEditingBasicInfo.value || editingEntryUuid.value || editingModuleUuid.value) {
        Message.warning('当前处于编辑中，请保存后再操作！');
        return;
    }
    editingModuleUuid.value = module.uuid;
    const fieldUuid = module.entries[0]?.fields[0]?.uuid;
    const content = getStreamValue(fieldUuid);
    editTextContent.value = content || '';
    editPlaceholder.value = content ? '请输入内容' : module.moduleName;
};

const cancelTextEdit = () => {
    editingModuleUuid.value = '';
    editTextContent.value = '';
};

const saveTextEdit = (module: any) => {
    const fieldUuid = module.entries[0]?.fields[0]?.uuid;
    if (fieldUuid) {
        streamValues.value.set(fieldUuid, editTextContent.value);
        module.entries[0].fields[0].fieldValue = editTextContent.value;
        emit('data-change', props.resumeData);
    }
    editingModuleUuid.value = '';
    editTextContent.value = '';
};

const handleAiAction = (action: 'polish' | 'expand' | 'simplify' | 'summarize') => {
    const modeMap = {polish: '1', expand: '2', simplify: '3', summarize: '4'};

    let text = '';
    let fieldName = '';
    let maxLength = 0;

    if (editingEntryUuid.value) {
        text = entryEditData.value.description || '';
        fieldName = 'description';
        const module = props.resumeData?.modules?.find((m: any) =>
            m.entries?.some((e: any) => e.entryUuid === editingEntryUuid.value)
        );
        const entry = module?.entries?.find((e: any) => e.entryUuid === editingEntryUuid.value);
        maxLength = getFieldMaxLength(entry, 'description');
    } else if (editingModuleUuid.value) {
        text = editTextContent.value;
        const module = props.resumeData?.modules?.find((m: any) => m.uuid === editingModuleUuid.value);
        fieldName = module?.entries?.[0]?.fields?.[0]?.fieldKey || '';
        maxLength = getTextModuleMaxLength(module);
    }

    aiOptimizeProps.value = {
        resumeId: props.resumeData?.uuid || '',
        text,
        fieldName,
        maxLength,
        mode: modeMap[action]
    };
    console.log(aiOptimizeProps.value, 'props')
    showAiOptimize.value = true;
};

const startEntryEdit = (entry: any) => {
    if (isEditingBasicInfo.value || editingEntryUuid.value || editingModuleUuid.value) {
        Message.warning('当前处于编辑中，请保存后再操作！');
        return;
    }
    editingEntryUuid.value = entry.entryUuid;
    entryEditData.value = {};
    entry.fields?.forEach((f: any) => {
        entryEditData.value[f.fieldKey] = getStreamValue(f.uuid);
    });
};

const cancelEntryEdit = () => {
    editingEntryUuid.value = '';
    entryEditData.value = {};
};

const saveEntryEdit = (entry: any) => {
    entry.fields?.forEach((f: any) => {
        if (entryEditData.value[f.fieldKey] !== undefined) {
            streamValues.value.set(f.uuid, entryEditData.value[f.fieldKey]);
            f.fieldValue = entryEditData.value[f.fieldKey];
        }
    });
    editingEntryUuid.value = '';
    entryEditData.value = {};
    emit('data-change', props.resumeData);
};

const handleAiOptimizeSubmit = (content: string) => {
    if (editingEntryUuid.value) {
        entryEditData.value.description = content;
    } else if (editingModuleUuid.value) {
        editTextContent.value = content;
    }
};

const handleAddEntry = (module: any) => {
    if (isEditingBasicInfo.value || editingEntryUuid.value || editingModuleUuid.value) {
        Message.warning('当前处于编辑中，请保存后再操作！');
        return;
    }

    const newEntry = {
        entryUuid: `temp_${Date.now()}`,
        entrySortOrder: module.entries.length + 1,
        fields: module.entries[0]?.fields.map((f: any) => ({
            ...f,
            uuid: `temp_${Date.now()}_${f.fieldKey}`,
            fieldValue: ''
        })) || []
    };

    module.entries.push(newEntry);
    editingEntryUuid.value = newEntry.entryUuid;
    entryEditData.value = {};
    console.log(props.resumeData, 'data')
};

const handlePhotoClick = () => {
    if (props.mode !== 'manual') return;
    photoInput.value?.click();
};
const fileService = new FileService();
const handlePhotoChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        Message.error('图片格式有误，仅支持jpg、jpeg、png！');
        target.value = '';
        return;
    }

    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
        Message.error('图片大小不得超过1M！');
        target.value = '';
        return;
    }

    try {
        const extraFields = {
            'folderPath': 'kunlun-pc/personal-image'
        };
        const result = await fileService.upload(file, extraFields);

        if (result.code === 200 && result.data) {
            const imageUrl = result.data.fileHost + result.data.filePath;
            photoUrl.value = imageUrl;

            const img = new Image();
            img.onload = () => {
                photoStyle.value = img.width > img.height ? {height: '100%'} : {width: '100%'};
            };
            img.src = imageUrl;

            const personalImageField = getTopField('personal_image');
            if (personalImageField?.uuid) {
                streamValues.value.set(personalImageField.uuid, imageUrl);
                const field = basicInfoModule.value?.entries?.[0]?.fields?.find((f: any) => f.fieldKey === 'personal_image');
                if (field) {
                    field.fieldValue = result.data.filePath;
                }
            }

            emit('data-change', props.resumeData);
            Message.success('上传成功');
        } else {
            Message.error('上传失败');
        }
    } catch (error) {
        Message.error('上传失败');
        console.error(error);
    }

    target.value = '';
};

const initFieldValues = () => {
    if (!props.resumeData?.modules) return;

    props.resumeData.modules.forEach((module: any) => {
        module.entries?.forEach((entry: any) => {
            entry.fields?.forEach((field: any) => {
                if (field.fieldValue) {
                    streamValues.value.set(field.uuid, field.fieldValue);
                    if (field.fieldKey === 'personal_image') {
                        const imageUrl = `${Config.baseUrl}${field.fieldValue}`;
                        photoUrl.value = imageUrl;
                        const img = new Image();
                        img.onload = () => {
                            photoStyle.value = img.width > img.height ? {height: '100%'} : {width: '100%'};
                        };
                        img.src = imageUrl;
                    }
                }
            });
        });
    });
};

watch(() => props.resumeData, () => {
    initFieldValues();
}, {deep: true, immediate: true});

onMounted(async () => {
    allAvailableModules.value = await fetchAvailableModules();
});

defineExpose({
    streamWrite,
    isStreaming,
    isEditingBasicInfo,
    editingEntryUuid,
    editingModuleUuid
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.resume-preview {
    width: vw(1000);
    height: vh(940);
}

.preview-card {
    width: 100%;
    height: 100%;
    background: $white;
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) 0 rgba(0, 0, 0, 0.1);
    position: relative;
    padding: vw(32) vw(40) vw(60) vw(40);
    overflow: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &.no-scroll {
        overflow: hidden;
    }

    &::-webkit-scrollbar {
        display: none;
    }
}

.personal-info {
    margin-bottom: vh(32);
}

.info-left {
    width: vw(420);
}

.name {
    height: vh(48);
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(32);
    line-height: vh(48);
    color: $font-dark;
    margin-bottom: vh(14);
}

.job-title {
    height: vh(38);
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(20);
    line-height: vh(38);
    color: $font-dark;
    margin-bottom: vh(4);
}

.contact-item {
    font-family: 'PingFangSCBold', sans-serif;
    font-size: vw(16);
    line-height: vh(32);
    height: vh(32);
    color: $font-dark;

    &.phone {
        margin-bottom: vh(4);
    }
}

.photo-area {
    width: vw(100);
    height: vh(130);
    background: $bg-gray;
    flex-shrink: 0;
    overflow: hidden;
}

.section-spec {
    margin-bottom: vh(32);

    .item {
        position: relative;
        border-radius: vw(2);

        .item-main {
            width: 100%;
            padding: vh(8) 0;
        }

        .edit-icon {
            position: absolute;
            right: vw(15);
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
        }
    }
}

.resume-preview[mode="manual"] .section-spec .item:not(:has(.entry-edit-wrapper)):hover {
    background: $hover-color;

    .item-main {
        padding-right: vw(44);
    }

    .edit-icon {
        opacity: 1;
    }
}


.section {
    margin-bottom: vh(32);

    &:last-child {
        margin-bottom: 0;
    }
}

.section-header {
    margin-bottom: vh(10);
}

.section-title {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(20);
    line-height: vh(22);
    color: $font-dark;
    margin: 0;
}

.action-btns {
    gap: vw(5);
}

.action-btn {
    gap: vw(5);

    span {
        font-family: 'PingFang SC', sans-serif;
        font-size: vw(14);
        line-height: vh(14);
        color: $font-middle;
    }

    &:hover {
        span {
            color: $theme-color;
        }

        :deep(.svg-icon > use) {
            fill: $theme-color;
        }
    }
}

.add-entry-btn {
    display: flex;
    align-items: center;
    gap: vw(10);
    margin-top: vh(20);
    cursor: pointer;

    span {
        font-family: 'PingFang SC', sans-serif;
        font-size: vw(14);
        line-height: vh(14);
        color: $font-middle;
    }
}

.module-manage-wrapper {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
}

.divider {
    width: 100%;
    height: 1px;
    background: $font-dark;
    margin-bottom: vh(12);
}

.info-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: vw(80);
    row-gap: vh(4);
}

.info-item {
    font-family: 'PingFangSCBold', sans-serif;
    font-size: vw(16);
    line-height: vh(16);
    color: $font-dark;
    height: vh(32);
}

.experience-header {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    line-height: vh(16);
    margin-bottom: vh(16);
}

.experience-desc {
    font-family: 'PingFangSCBold', sans-serif;
    font-size: vw(16);
    line-height: vh(16);
    color: $font-dark;
}

.rich-text-desc {
    position: relative;
    padding: vh(8) 0;
    font-family: 'PingFangSCBold', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    min-height: vh(30);

    .edit-icon {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        opacity: 0;
        overflow: hidden;
    }
}

.content.manual-mode .rich-text-desc {
    padding: vh(8) 0;
    border-radius: vw(2);

    &:hover {
        background: $hover-color;
        padding-right: vw(44);

        .edit-icon {
            width: vw(29);
            opacity: 1;
        }
    }
}

.placeholder {
    color: $placeholder-color;
}

.time-placeholder {
    color: $placeholder-color;
    text-align: right;
    font-weight: 400;
}

.generating-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
}

.loading-icon {
    width: vw(125);
}

.loading-text {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(20);
    line-height: vh(60);
    color: transparent;
    background: linear-gradient(135deg, #C4A2FC 28.4%, #88E9FF 95.27%);
    -webkit-background-clip: text;
    background-clip: text;
    margin: 0;
}

.streaming-highlight {
    background: $hover-color;
    border-radius: vw(2);
}

.name-input {
    height: vh(48);
    margin-bottom: vh(14);
    background: $bg-gray;
    border: none;
    border-radius: vw(2);

    :deep(.ivu-input) {
        background: $bg-gray;
        border: none;
        font-family: 'PingFangSCBold', sans-serif;
        font-weight: 600;
        font-size: vw(32);
        color: $font-dark;
        padding: 0 vw(10);
    }
}

.job-input {
    height: vh(38);
    margin-bottom: vh(4);
    background: $bg-gray;
    border: none;
    border-radius: vw(2);

    :deep(.ivu-input) {
        height: 100%;
        background: $bg-gray;
        border: none;
        font-family: 'PingFangSCBold', sans-serif;
        font-weight: 600;
        font-size: vw(22);
        color: $font-dark;
        padding: 0 vw(10);
    }
}

.contact-field {
    height: vh(32);
    background: $bg-gray;
    border-radius: vw(2);
    padding: 0 vw(10);
    margin-bottom: vh(4);

    &:last-child {
        margin-bottom: 0;
    }

    .field-prefix {
        font-family: 'PingFangSCBold', sans-serif;
        font-size: vw(16);
        color: $placeholder-color;
        white-space: nowrap;
        margin-right: vw(10);
    }

    .contact-input {
        flex: 1;
        background: transparent;
        border: none;

        :deep(.ivu-input) {
            background: transparent;
            border: none;
            font-family: 'PingFangSCBold', sans-serif;
            font-size: vw(16);
            color: $font-dark;
            padding: 0;
        }
    }
}

.info-field {
    height: vh(32);
    background: $bg-gray;
    border-radius: vw(2);
    padding: 0 vw(10);

    .field-prefix {
        font-family: 'PingFangSCBold', sans-serif;
        font-size: vw(16);
        color: $placeholder-color;
        white-space: nowrap;
        margin-right: vw(10);
    }

    .info-input {
        flex: 1;
        background: transparent;
        border: none;

        :deep(.ivu-input) {
            background: transparent;
            border: none;
            font-family: 'PingFangSCBold', sans-serif;
            font-size: vw(16);
            color: $font-dark;
            padding: 0;
        }
    }
}

.text-edit-box {
    position: relative;
    width: vw(920);
    background: $bg-gray;
    border-radius: vw(2);
    padding: vh(8) vw(10) vh(30) vw(10);
}

.text-edit-area {
    width: 100%;
    background: transparent;
    border: none;

    :deep(.ivu-input) {
        background: transparent;
        border: none;
        font-family: 'PingFang SC', sans-serif;
        font-size: vw(16);
        line-height: vh(22);
        color: $font-dark;
        padding: 0;
        max-height: vh(82);
        min-height: vh(82);
        resize: none;
        overflow-y: auto;
    }
}

.char-count {
    position: absolute;
    right: vw(10);
    bottom: vh(8);
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(14);
    line-height: vh(14);
    color: $font-middle;
}

.text-edit-footer {
    margin-top: vh(6);
}

.ai-actions {
    gap: vw(20);
}

.ai-btn {
    gap: vw(5);

    span {
        font-family: 'PingFang SC', sans-serif;
        font-size: vw(14);
        line-height: vh(14);
        color: $theme-color;
    }

    &:hover {
        opacity: 0.8;
    }
}

.edit-actions {
    gap: vw(20);
}

.action-item {
    gap: vw(5);
    cursor: pointer;

    span {
        font-family: 'PingFangSCBold', sans-serif;
        font-size: vw(14);
        line-height: vh(14);
        color: $font-middle;
    }

    &:hover {
        span {
            color: $theme-color;
        }

        :deep(.svg-icon > use) {
            fill: $theme-color;
        }
    }
}

.entry-fields {
    gap: vw(10);
    width: vw(920);
}

.field-input {
    background: $bg-gray;
    border: none;
    border-radius: vw(2);
    height: vh(32);

    :deep(.ivu-input) {
        height: 100%;
        background: $bg-gray;
        border: none;
        font-family: 'PingFang SC', sans-serif;
        font-size: vw(16);
        color: $font-dark;
        padding: 0 vw(10);

        &::placeholder {
            color: $placeholder-color;
        }
    }
}

.field-input-half {
    width: vw(380);
}

.field-input-time {
    width: vw(170);
}

.time-fields {
    gap: vw(12);
}

.time-separator {
    font-family: 'PingFangSCBold', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    line-height: vh(16);
    color: $font-dark;
}

.entry-textarea-wrapper {
    position: relative;
    width: vw(920);
    background: $bg-gray;
    border-radius: vw(2);
    padding: vh(8) vw(10) vh(30) vw(10);
}

.entry-textarea {
    width: 100%;
    background: transparent;
    border: none;

    :deep(.ivu-input) {
        background: transparent;
        border: none;
        font-family: 'PingFang SC', sans-serif;
        font-size: vw(16);
        line-height: vh(22);
        color: $font-dark;
        padding: 0;
        min-height: vh(120);
        resize: none;

        &::placeholder {
            color: $placeholder-color;
        }
    }
}

.entry-edit-footer {
    margin-top: vh(6);
}
</style>
