<template>
    <div class="help-center">
        <h1 class="help-title">帮助中心</h1>
        <div class="help-content">
            <div class="content-text">
                <p class="section-title">我是标题</p>
                <ul class="help-list">
                    <li>支持添加不同颜色便签，快捷记录灵感</li>
                    <li>新增流程图、类图等更多图形，满足多场景需求</li>
                    <li>支持拖拽气泡图形的端点调整其指向，编辑更灵活</li>
                    <li>无需快速新建图形时，可隐藏图形四周端点以避免误操作</li>
                </ul>
            </div>
            <div class="placeholder-image"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 静态展示页面，无需额外逻辑
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
    margin: 0 0 vh(68) 0;
    font-weight: normal;
}

.help-content {
    width: vw(1199);
    height: vh(782);
    background: $bg-gray;
    border-radius: vw(2);
    padding: vh(20) vw(20);
    position: relative;
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
    // margin: 0 0 vh(10) 0;
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
        // margin-bottom: vh(8);
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
}
</style>
