<template>
    <div class="added-services">
        <div class="services-grid">
            <Card v-for="service in services" :key="service.id" class="service-card" :bordered="false">
                <div class="service-content">
                    <h2 class="service-title">{{ service.title }}</h2>
                    <div class="service-image"></div>
                    <p class="service-description">{{ service.description }}</p>
                    <div class="service-price">{{ service.price }}</div>
                    <Button type="primary" class="consult-btn" @click="showModal = true">预约咨询</Button>
                </div>
            </Card>
        </div>
        <BookingSuccessModal :visible="showModal" @close="showModal = false" />
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {Card, Button} from 'view-ui-plus';
import BookingSuccessModal from './components/BookingSuccessModal.vue';

interface ServiceItem {
    id: number;
    title: string;
    description: string;
    price: string;
}

const showModal = ref(false);

const services = ref<ServiceItem[]>([
    {
        id: 1,
        title: '增值服务一',
        description:
            '服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明\n\n服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明',
        price: '¥ 999起'
    },
    {
        id: 2,
        title: '增值服务二',
        description:
            '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二',
        price: '¥ 999起'
    },
    {
        id: 3,
        title: '增值服务三',
        description: '服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明',
        price: '¥ 999起'
    },
    {
        id: 4,
        title: '增值服务四',
        description:
            '服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明\n\n服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明',
        price: '¥ 999起'
    },
    {
        id: 5,
        title: '增值服务四',
        description:
            '服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明\n\n服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明服务说明',
        price: '¥ 999起'
    }
]);
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variable.scss' as *;
@use '@/assets/styles/compute.scss' as *;

.added-services {
    width: calc(100vw - vw(160));
    height: 100vh;
    background-color: $bg-gray;
    padding: vh(140) 0 0;
    overflow-x: auto;
}

.services-grid {
    display: flex;
    gap: vw(25);
    padding-left: vw(40);
    padding-right: vw(40);
    width: fit-content;
}

.service-card {
    width: vw(404);
    height: vh(800);
    background-color: $white;
    border-radius: 0;
    flex-shrink: 0;

    :deep(.ivu-card-body) {
        padding: 0;
        height: 100%;
    }
}

.service-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.service-title {
    font-family: 'YouSheBiaoTiHei', sans-serif;
    font-size: vw(36);
    line-height: vh(66);
    color: $font-dark;
    margin: vh(64) 0 0;
    font-weight: normal;
}

.service-image {
    width: vw(404);
    height: vh(220);
    background-color: #ffe7e7;
    margin: vh(16) 0 vh(54);
    flex-shrink: 0;
}

.service-description {
    display: flex;
    align-items: center;
    justify-content: center;
    width: vw(300);
    height: vh(180);
    font-family: 'PingFang SC', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    line-height: vh(20);
    color: $font-middle;
    text-align: center;
    margin: 0 0 vh(41);
    white-space: pre-line;
    overflow: auto;
}

.service-price {
    font-family: 'PingFang SC', sans-serif;
    font-weight: 600;
    font-size: vw(16);
    line-height: vh(20);
    color: $font-dark;
    text-align: center;
    margin: 0 0 vh(60);
}

.consult-btn {
    background: transparent;
    border: none;
    font-family: 'PingFang SC', sans-serif;
    font-weight: 600;
    font-size: vw(18);
    line-height: vh(18);
    color: $theme-color;
    padding: 0;
    height: auto;

    &:hover {
        background: transparent;
        color: $theme-color;
    }
}
</style>
