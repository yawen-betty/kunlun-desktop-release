<template>
  <div class="login-page">
    <div class="left-section">
      <div class="brand-header">
        <img v-if="config.logoUrl" :src="config.logoUrl" alt="Logo" class="logo" />
        <h1 class="app-name">{{ config.appName || 'AI聘次方' }}</h1>
      </div>
      
      <div class="slogan-area">
        <p class="slogan-cn">{{ config.sloganZh || '求职不用"硬扛"，你的求职竞争力，从此"次方"增涨！' }}</p>
        <p class="slogan-en">{{ config.sloganEn || 'No more struggling through job hunting – with AI PinCifang, your job-hunting competitiveness grows exponentially!' }}</p>
      </div>

      <img :src="config.loginImageUrl || illustrationDefault" alt="Illustration" class="illustration" />
    </div>

    <div class="right-section">
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
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: $bg-gray;
  position: relative;

  .left-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-left: 5.73%;
    padding-top: 7.78%;

    .brand-header {
      display: flex;
      align-items: center;
      gap: 2.08%;

      .logo {
        width: 50px;
        height: 50px;
      }

      .app-name {
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-size: 46px;
        color: $font-dark;
        font-weight: 400;
        line-height: 60px;
        margin: 0;
      }
    }

    .slogan-area {
      margin-top: 96px;
      width: 44.06%;

      .slogan-cn {
        color: $font-dark;
        font-size: 32px;
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-weight: 400;
        line-height: 1.3;
        margin: 0 0 13px 0;
      }

      .slogan-en {
        color: $font-light;
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-size: 24px;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
      }
    }

    .illustration {
      margin-top: 76px;
      width: 544px;
      height: 544px;
    }
  }

  .right-section {
    flex: 0 0 29.17%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 5%;

    .login-box {
      width: 560px;
      height: 710px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.50);
      box-shadow: 6px 6px 50px 0 rgba(0, 0, 0, 0.10);
      backdrop-filter: blur(5px);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 109px;

      .login-title {
        color: $font-dark;
        font-size: 32px;
        font-weight: bold;
        line-height: 32px;
        margin: 0 0 71px 0;
      }

      .qrcode {
        width: 320px;
        height: 320px;
        margin-bottom: 40px;
      }

      .agreement-text {
        color: $font-middle;
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
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
  }

  .version-info {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    color: $font-light;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    text-align: center;
  }
}
</style>
