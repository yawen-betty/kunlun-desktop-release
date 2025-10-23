<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SystemInfo } from '@/utiles/systemInfo';

const qrCodeUrl = ref('');
const version = ref('v1.0.0');

onMounted(() => {
  // TODO: 获取二维码和版本号
});
</script>

<template>
  <div class="login-page">
    <div class="left-section">
      <div class="brand-area">
        <img src="@/assets/images/logo.svg" alt="Logo" class="logo" />
        <h1 class="app-name">AI聘次方</h1>
      </div>

      <div class="slogan-area">
        <p class="slogan-cn">让招聘更简单，让人才更精准</p>
        <p class="slogan-en">Make recruitment easier and talent more accurate</p>
      </div>

      <div class="illustration-area">
        <img src="@/assets/images/illustration.svg" alt="Illustration" class="illustration" />
      </div>
    </div>

    <div class="right-section">
      <div class="login-box">
        <h2 class="login-title">微信扫码登录/注册</h2>

        <div class="qrcode-area">
          <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="二维码" class="qrcode" />
          <div v-else class="qrcode-placeholder">二维码加载中...</div>
        </div>

        <div class="agreement-text">
          登录即代表同意
          <a href="#" class="agreement-link">《服务协议》</a>
          和
          <a href="#" class="agreement-link">《隐私协议》</a>
        </div>
      </div>
    </div>

    <div class="version-info">{{ version }}</div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: $bg-gray;
}

.left-section {
  display: flex;
  flex-direction: column;
  width: 55%;
  padding: 7.78% 0 0 5.73%;
}

.brand-area {
  display: flex;
  align-items: center;
  margin-bottom: 14.07%;
}

.logo {
  width: 4.55%;
  height: auto;
  aspect-ratio: 1;
}

.app-name {
  margin-left: 4.17%;
  font-family: 'YouSheBiaoTiHei', sans-serif;
  font-size: vw(46);
  color: $font-dark;
  font-weight: normal;
}

.slogan-area {
  margin-bottom: 10.19%;
}

.slogan-cn {
  font-size: clamp(20px, 1.67vw, 32px);
  line-height: 1.3em;
  color: $font-dark;
  margin-bottom: 2.87%;
}

.slogan-en {
  font-size: clamp(16px, 1.25vw, 24px);
  line-height: 1.4em;
  color: $font-middle;
}

.illustration-area {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.illustration {
  width: 51.52%;
  height: auto;
  max-width: 544px;
}

.right-section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45%;
  padding: 17.13% 5% 0 5%;
}

.login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 560px;
  background-color: $white;
  border-radius: 8px;
  padding: 15.35% 21.43% 23.94% 21.43%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.login-title {
  font-size: vw(32);
  color: $font-dark;
  margin-bottom: 10%;
  font-weight: bold;
}

.qrcode-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 30.71%;
}

.qrcode {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qrcode-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: $bg-gray;
  color: $font-middle;
  font-size: clamp(14px, 0.83vw, 16px);
  border-radius: 4px;
}

.agreement-text {
  font-size: clamp(12px, 0.73vw, 14px);
  color: $font-middle;
  text-align: center;
  line-height: 1.57em;
}

.agreement-link {
  color: $theme-color;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.version-info {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(12px, 0.73vw, 14px);
  color: $font-light;
}

@media (max-width: 1024px) {
  .login-page {
    flex-direction: column;
  }

  .left-section {
    width: 100%;
    padding: 5% 5% 0 5%;
  }

  .brand-area {
    margin-bottom: 8%;
  }

  .logo {
    width: 8%;
  }

  .slogan-area {
    margin-bottom: 5%;
  }

  .illustration-area {
    display: none;
  }

  .right-section {
    width: 100%;
    padding: 5%;
  }

  .login-box {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .left-section {
    padding: 8% 5% 0 5%;
  }

  .logo {
    width: 12%;
  }

  .app-name {
    margin-left: 3%;
  }

  .login-box {
    padding: 10% 15% 15% 15%;
  }
}
</style>
