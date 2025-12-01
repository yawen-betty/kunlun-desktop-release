<template>
    <div class="version-update">
        <h1 class="title">版本更新</h1>
        <div class="version-info">
            <span class="current-version">当前版本：V1.0.0</span>
            <span class="new-version">发现新版本！<span class="update-link" @click="handleUpdate">立即更新</span></span>
        </div>
        <p class="update-time">更新时间：2025.05.09 12:30</p>
        <p class="update-title">更新详情：</p>
        <div class="update-details">
            <div class="update-content">
                <p>我是标题</p>
                <ul>
                    <li>支持添加不同颜色便签，快捷记录灵感</li>
                    <li>新增流程图、类图等更多图形，满足多场景需求</li>
                    <li>支持拖拽气泡图形的端点调整其指向，编辑更灵活</li>
                    <li>无需快速新建图形时，可隐藏图形四周端点以避免误操作</li>
                </ul>
            </div>
            <div class="placeholder"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 立即更新
 */
const handleUpdate = () => {
    console.log('立即更新');
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.version-update {
    width: vw(1279);
    height: vh(940);
    background: $white;
    border-radius: vw(2);
    box-shadow: 0 0 vw(6) rgba(0, 0, 0, 0.1);
    padding: vh(40) vw(40);
}

.title {
    font-family: 'YouSheBiaoTiHei', sans-serif;
    font-size: vw(28);
    line-height: vh(28);
    color: $font-dark;
    margin: 0 0 vh(28) 0;
    font-weight: normal;
}

.version-info {
    display: flex;
    gap: vw(20);
    margin-bottom: vh(32);
}

.current-version {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    font-weight: 500;
}

.new-version {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $theme-color;
    font-weight: 500;
}

.update-link {
    text-decoration: underline;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
}

.update-time {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    margin: 0 0 vh(32) 0;
    font-weight: 500;
}

.update-title {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;
    margin: 0 0 vh(22) 0;
    font-weight: 500;
}

.update-details {
    width: vw(1199);
    height: vh(350);
    background: $bg-gray;
    border-radius: vw(2);
    padding: vh(20) vw(20);
    position: relative;
}

.update-content {
    font-family: 'PingFang SC', sans-serif;
    font-size: vw(16);
    line-height: vh(22);
    color: $font-dark;

    p {
        margin: 0 0 vh(10) 0;
    }

    ul {
        margin: 0;
        padding-left: vw(24);
        list-style: disc;

        li {
            margin-bottom: vh(5);

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}

.placeholder {
    width: vw(692);
    height: vh(180);
    background: #ffe7e7;
    margin-top: vh(20);
}
</style>
