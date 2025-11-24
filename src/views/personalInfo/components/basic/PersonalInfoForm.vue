<template>
    <div class="personal-info-form">
        <h1 class="form-title">个人信息</h1>

        <Form ref="formRef" :model="formValidate" :rules="ruleValidate" class="form-validate">
            <!-- 头像上传 -->
            <div class="form-section">
                <div class="form-label mb-20">头像</div>
                <div class="avatar-upload pointer">
                    <Upload :show-upload-list="false" :before-upload="beforeAvatarUpload">
                        <div class="avatar-container">
                            <img :src="filePreviewUrl" v-if="filePreviewUrl" class="avatar-img" />
                            <div class="avatar-circle" v-else>
                                <span class="avatar-text">{{ hasChineseCharacters(UserInfo.info.userName || '') }}</span>
                            </div>
                        </div>

                        <div class="avatar-modal">
                            <SvgIcon name="icon-bianji-xian" size="20" color="#fff" />
                        </div>
                    </Upload>
                </div>
            </div>

            <InitProfileForm :form-data="formValidate" :form-validate-ref="formRef" />

            <!-- 保存按钮 -->
            <div class="form-actions">
                <Button type="primary" @click="handleSave" class="save-btn">
                    <SvgIcon name="icon-baocun" size="12" color="#fff" />
                    保存
                </Button>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {Form, Image, Message} from 'view-ui-plus';
import SvgIcon from '@/components/svgIcon/index.vue';
import InitProfileForm from '@/components/initProfileForm/index.vue';
import {hasChineseCharacters, validateEmail, validateMobile} from '@/utiles/validators.ts';
import {GetProfileInDto} from '@/api/user/dto/GetProfile.ts';
import {UserInfo} from '@/utiles/userInfo.ts';
import {message} from '@/utiles/Message.ts';
import {UserService} from '@/service/UserService.ts';
import {UpdateProfileInDto} from '@/api/user/dto/UpdateProfile.ts';
import {FileService} from '@/service/FileService.ts';
import {Config} from '@/Config.ts';

const formRef = ref<any>(null);

// 表单
const formValidate = reactive<UpdateProfileInDto>(new UpdateProfileInDto());

const userService = new UserService();
const fileService = new FileService();
// 预览地址
const filePreviewUrl = ref<string>('');

// 校验
const ruleValidate = {
    name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
    gender: [{required: true, message: '请选择性别', trigger: 'change', type: 'number'}],
    birthDate: [{required: true, message: '请选择出生年月', trigger: 'change', type: 'date'}],
    areaInfoBeanList: [{required: true, message: '请选择居住城市', trigger: 'change', type: 'array', mix: 1}],
    mobile: [
        {required: true, message: '请输入手机号码', trigger: 'blur'},
        {validator: validateMobile, trigger: 'blur'}
    ],
    email: [
        {required: true, message: '请输入个人邮箱', trigger: 'blur'},
        {validator: validateEmail, trigger: 'blur'}
    ]
};

const beforeAvatarUpload = (file: File) => {
    console.log('%c 🇸🇸: beforeAvatarUpload -> file ', 'font-size:16px;background-color:#c0c74d;color:black;', file);
    // 头像上传前验证
    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'];
    const isValidFormat = allowedTypes.includes(file.type);
    const isLt1M = file.size / 1024 / 1024 < 1;

    if (!isValidFormat) {
        message.error(Message, '图片格式有误，仅支持jpg、jpeg、png！');
        return false;
    }
    if (!isLt1M) {
        message.error(Message, '图片大小不得超过1M！');
        return false;
    }

    handleUploadFile(file);
    return false;
};

// 上传文件
const handleUploadFile = (file: File) => {
    fileService.upload(file).then((res) => {
        if (res.code === 200) {
            formValidate.avatarUrl = res.data.filePath;
            filePreviewUrl.value = res.data.fileHost + res.data.filePath;
        }
    });
};

// 保存
const handleSave = () => {
    formRef.value.validate((valid: boolean) => {
        if (valid) {
            const data: UpdateProfileInDto = {
                ...formValidate,
                birthDate: new Date(formValidate.birthDate as any).getTime()
            };

            userService.updateProfile(data).then((res) => {
                if (res.code === 200) {
                    message.success(Message, '保存成功！');
                    UserInfo.info.avatar = filePreviewUrl.value;
                    UserInfo.info.userName = formValidate.name!;
                }
            });
        } else {
            message.error(Message, '请完善必填项！');
        }
    });
};

// 获取用户信息
const getUserInfo = () => {
    userService.getProfile(new GetProfileInDto()).then((res) => {
        if (res.code === 200) {
            Object.assign(formValidate, {
                ...res.data,
                avatarUrl: Config.baseUrl + res.data.avatarUrl!,
                birthDate: new Date(res.data.birthDate as any)
            });

            filePreviewUrl.value = Config.baseUrl + res.data.avatarUrl!;
        }
    });
};

onMounted(() => {
    getUserInfo();
});
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.personal-info-form {
    width: vw(1279);
    height: vh(940);
    background: $white;
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);
    padding: vh(40);

    .form-title {
        font-size: vw(28);
        color: $font-dark;
        font-weight: 400;
        margin-bottom: vh(40);
    }

    .form-section {
        margin-bottom: vh(40);

        .form-label {
            color: $font-middle;
            font-size: vw(16);
            font-style: normal;
            font-weight: 600;
            line-height: vw(16);
        }
    }

    .avatar-upload {
        position: relative;

        .avatar-modal {
            display: none;
        }

        &:hover {
            .avatar-modal {
                position: absolute;
                left: 0;
                top: 0;
                z-index: 10;
                width: vw(80);
                height: vw(80);
                border-radius: 50px;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-content: center;
                justify-content: center;
                flex-wrap: wrap;
            }
        }

        .avatar-container {
            cursor: pointer;
        }

        .avatar-img {
            width: vw(80);
            height: vw(80);
            border-radius: 50%;
        }

        .avatar-circle {
            width: vw(80);
            height: vw(80);
            border-radius: 50%;
            background: linear-gradient(90deg, $theme-color 0%, $theme-color 100%);
            display: flex;
            align-items: center;
            justify-content: center;

            .avatar-text {
                color: white;
                font-size: vw(30);
                font-weight: 500;
            }
        }
    }

    .form-actions {
        margin-top: vh(40);

        .save-btn {
            width: vw(82);
            height: vh(32);
            background: $theme-color;
            border: none;
            border-radius: vw(2);
            padding: vh(10) vw(20);
            font-size: vw(12);
            font-weight: 500;
            box-shadow: none;
            border: 0;
            outline: none;
        }

        :deep(.ivu-btn span) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            gap: vw(6);
        }
    }
}
</style>
