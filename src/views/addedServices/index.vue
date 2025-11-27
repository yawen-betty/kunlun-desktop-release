<template>
    <div class="added-services">
        <div class="services-grid">
            <Card v-for="service in serviceList" :key="service.id" class="service-card" :bordered="false">
                <div class="service-content">
                    <h2 class="service-title">{{ service.name }}</h2>
                    <div class="service-image">
                        <Image :src="`${Config.baseUrl}${service.image}`" alt="服务图片" fit="contain" />
                    </div>
                    <p class="service-description">{{ service.instructions }}</p>
                    <div class="service-price">{{ service.price || '' }}</div>
                    <Button type="primary" class="consult-btn" @click="handleConsultClick(service.id)">预约咨询</Button>
                </div>
            </Card>
        </div>
        <BookingSuccessModal :visible="showModal" @close="showModal = false" />
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {Card, Button} from 'view-ui-plus';
import BookingSuccessModal from './components/BookingSuccessModal.vue';
import {AdminService} from '@/service/AdminService.ts';
import {QueryValueAddedServiceListOutDto} from '@/api/admin/dto/QueryValueAddedServiceList';
import {Config} from '@/Config.ts';

const serviceList = ref<QueryValueAddedServiceListOutDto>(new QueryValueAddedServiceListOutDto());
const adminService = new AdminService();
const queryValueAddedServiceList = () => {
    adminService.queryValueAddedServiceList({}).then((res) => {
        if (res.code === 200) {
            serviceList.value = res.data || [];
        }
    });
};

const handleConsultClick = (serviceId: string) => {
    adminService
        .getMakeAdvice({
            uuid: serviceId
        })
        .then((res) => {
            if (res.code === 200) {
                console.log('%c 🛐: handleConsultClick -> res ', 'font-size:16px;background-color:#5cf015;color:black;', res);
                showModal.value = true;
            }
        });
};
onMounted(() => {
    queryValueAddedServiceList();
});

const showModal = ref(false);
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
    // background-color: #ffe7e7;
    margin: vh(16) 0 vh(54);
    flex-shrink: 0;
    .ivu-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
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
    min-height: vh(20);
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
