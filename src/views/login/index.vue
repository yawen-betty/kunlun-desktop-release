<template>
  <div class="login-page">
    <div class="left-section">
      <img v-if="config.logoUrl" :src="config.logoUrl" alt="Logo" class="logo" />
      <h1 class="app-name">{{ config.appName || 'AI聘次方' }}</h1>
      
      <div class="slogan-area">
        <p class="slogan-cn">{{ config.sloganZh || '求职不用"硬扛"，你的求职竞争力，从此"次方"增涨！' }}</p>
        <p class="slogan-en">{{ config.sloganEn || 'No more struggling through job hunting – with AI PinCifang, your job-hunting competitiveness grows exponentially!' }}</p>
      </div>

      <img :src="config.loginImageUrl || illustrationDefault" alt="Illustration" class="illustration" />
    </div>

    <div class="login-box">
      <h2 class="login-title">微信扫码登录/注册</h2>
      <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="二维码" class="qrcode" />
      <div class="agreement-text">
        登录即代表同意
        <a @click="showAgreement(1)" class="agreement-link">《服务协议》</a>
        和
        <a @click="showAgreement(2)" class="agreement-link">《隐私协议》</a>
      </div>
    </div>

    <div class="version-info">{{ version }}</div>

    <Modal v-model="agreementVisible" :title="agreementTitle" width="600">
      <div v-html="agreementContent"></div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Modal } from 'view-ui-plus';
import { ConfigService } from '@/service/ConfigService';
import { AgreementService } from '@/service/AgreementService';
import { Config } from '@/Config';
import illustrationDefault from '@/assets/images/illustration.svg';

const config = ref({
  logoUrl: '',
  appName: '',
  sloganZh: '',
  sloganEn: '',
  loginImageUrl: ''
});

const qrCodeUrl = ref('');
const version = ref(Config.buildVersion);
const agreementVisible = ref(false);
const agreementTitle = ref('');
const agreementContent = ref('');

const configService = ConfigService.getInstance();
const agreementService = AgreementService.getInstance();

const loadConfig = async () => {
  try {
    const result = await configService.getApplicationConfig();
    if (result.code === 200 && result.data) {
      config.value = result.data;
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
};

const showAgreement = async (type: number) => {
  try {
    const result = await agreementService.getAgreement(type);
    if (result.code === 200 && result.data) {
      agreementTitle.value = type === 1 ? '服务协议' : '隐私协议';
      agreementContent.value = result.data.content || '暂无内容';
      agreementVisible.value = true;
    }
  } catch (error) {
    console.error('加载协议失败:', error);
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: $bg-gray;

  .left-section {
    position: absolute;

    .logo {
      position: absolute;
      left: vw(110);
      top: vh(84);
      width: vw(50);
      height: vh(50);
    }

    .app-name {
      position: absolute;
      left: vw(190);
      top: vh(80);
      width: vw(179);
      height: vh(60);
      font-family: 'YouSheBiaoTiHei', sans-serif;
      font-size: vw(46);
      color: $font-dark;
      font-weight: 400;
      line-height: vh(60);
    }

    .slogan-area {
      position: absolute;
      left: vw(160);
      top: vh(236);
      width: vw(846);

      .slogan-cn {
        color: $font-dark;
        font-size: vw(32);
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-weight: 400;
        line-height: calc(vw(32) * 1.3);
        margin-bottom: vh(13);
      }

      .slogan-en {
        color: $font-light;
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-size: vw(24);
        font-weight: 400;
        line-height: calc(vw(24) * 1.4);
      }
    }

    .illustration {
      position: absolute;
      left: vw(259);
      top: vh(346);
      width: vw(544);
      height: vh(544);
    }
  }

  .login-box {
    position: absolute;
    left: vw(1100);
    top: vh(185);
    width: vw(560);
    height: vh(710);
    border-radius: vw(2);
    background: rgba(255, 255, 255, 0.50);
    box-shadow: vw(6) vw(6) vw(50) 0 rgba(0, 0, 0, 0.10);
    backdrop-filter: blur(vw(5));

    .login-title {
      position: absolute;
      left: vw(144);
      top: vh(109);
      width: vw(272);
      height: vh(32);
      color: $font-dark;
      font-size: vw(32);
      font-weight: bold;
      line-height: vh(32);
    }

    .qrcode {
      position: absolute;
      left: vw(120);
      top: vh(180);
      width: vw(320);
      height: vh(320);
    }

    .agreement-text {
      position: absolute;
      left: vw(136);
      top: vh(540);
      width: vw(288);
      height: vh(24);
      color: $font-middle;
      font-size: vw(16);
      font-weight: 400;
      line-height: vh(24);
      text-align: center;

      .agreement-link {
        color: $theme-color;
        cursor: pointer;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .version-info {
    position: absolute;
    left: vw(872);
    top: vh(1026);
    width: vw(177);
    height: vh(24);
    color: $font-light;
    font-size: vw(16);
    font-weight: 400;
    line-height: vh(24);
    text-align: center;
  }
}
</style>
