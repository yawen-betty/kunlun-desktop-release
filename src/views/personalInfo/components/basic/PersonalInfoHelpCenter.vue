<template>
    <div class="help-center">
        <h1 class="help-title">帮助中心</h1>
        <div class="help-content" v-html="content"></div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {AdminService} from '@/service/AdminService';
import {GetHelpCenterInDto} from '@/api/admin/dto/GetHelpCenter';

const adminService = AdminService.getInstance();
const content = ref('');

/**
 * 获取帮助中心内容
 */
onMounted(async () => {
    try {
        const res = await adminService.getHelpCenter(new GetHelpCenterInDto());
        if (res.code === 200 && res.data) {
            content.value = res.data.content;
        }
    } catch (error) {
        console.error('获取帮助中心内容失败:', error);
    }
});
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.help-center {
    width: vw(1279);
    height: vh(940);
    background: $white;
    border-radius: vw(2);
    box-shadow: 0px 0px vw(6) 0px rgba(0, 0, 0, 0.1);
    padding: vh(40);
    position: relative;
}

.help-title {
    font-family: 'YouSheBiaoTiHei', sans-serif;
    font-size: vw(28);
    line-height: vh(28);
    color: $font-dark;
    margin: 0 0 vh(40) 0;
    font-weight: normal;
}

.help-content {
    width: vw(1199);
    height: vh(782);
    background: $bg-gray;
    border-radius: vw(2);
    padding: vh(20) vw(20);
    position: relative;
    overflow-y: auto;
}

.content-text {
    position: absolute;
    left: vw(20);
    top: vh(20);
}

.section-title {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    font-weight: normal;
}

.help-list {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    margin: 0;
    padding-left: vw(24);

    li {
        list-style: disc;

        &:last-child {
            margin-bottom: 0;
        }
    }
}

.placeholder-image {
    position: absolute;
    left: vw(20);
    top: vh(150);
    width: vw(981);
    height: vh(180);
    background: #ffe7e7;
    overflow-y: auto;
    padding: vh(10) vw(10);
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(14);
    line-height: vh(22);
    color: $font-dark;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
        margin: vh(10) 0 vh(5) 0;
        font-weight: 600;
    }

    :deep(p) {
        margin: vh(5) 0;
    }

    :deep(ul),
    :deep(ol) {
        margin: vh(5) 0;
        padding-left: vw(20);
    }

    :deep(img) {
        max-width: 100%;
        height: auto;
    }
}
</style>
