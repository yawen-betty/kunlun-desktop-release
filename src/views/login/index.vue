<template>
  <div class="login-page">
    <div class="left-section">
      <div class="brand-area">
        <Image
          src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimage109.360doc.com%2FDownloadImg%2F2025%2F04%2F0321%2F296122601_4_20250403090445718&refer=http%3A%2F%2Fimage109.360doc.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1763859057&t=66792e5ac87ee6fe103b9cd1865c808e"
          alt="Logo" class="logo mr-30"/>
        <h1 class="app-name">AI聘次方</h1>
      </div>

      <div class="slogan-area">
        <p class="slogan-cn">求职不用“硬扛”，你的求职竞争力，从此“次方”增涨！</p>
        <p class="slogan-en">No more struggling through job hunting – with AI PinCifang, your job-hunting
          competitiveness grows exponentially!</p>
      </div>

      <div class="illustration-area">
        <img src="@/assets/images/illustration.svg" alt="Illustration" class="illustration"/>
      </div>
    </div>

    <div class="right-section">
      <div class="login-box">
        <h2 class="login-title">微信扫码登录/注册</h2>

        <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="二维码" class="qrcode"/>


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

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {Image} from "view-ui-plus";

const qrCodeUrl = ref('');
const version = ref('v1.0.0');


onMounted(() => {
  // TODO: 获取二维码和版本号
});
</script>


<style scoped lang="scss">
.login-page {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: $bg-gray;

  .left-section {
    display: flex;
    flex-direction: column;
    padding: vh(80) 0 0 vw(110);

    .brand-area {
      display: flex;
      align-items: center;
      margin-bottom: vh(96);

      .logo {
        width: vw(50);
        height: vw(50);
        border-radius: vw(10);
        background: #FFF;
        box-shadow: vw(4) vw(4) vw(20) 0 rgba(0, 0, 0, 0.10);
      }

      .app-name {
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-size: vw(46);
        color: $font-dark;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
    }

    .slogan-area {
      .slogan-cn {
        color: $font-dark;
        font-size: vw(32);
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        margin-bottom: vh(13);
      }

      .slogan-en {
        color: $font-light;
        font-family: 'YouSheBiaoTiHei', sans-serif;
        font-size: vw(24);
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
    }

    .illustration-area {
      padding-left: vw(95);
      margin-top: vh(17);

      .illustration {
        width: vw(544);
        height: vw(544);
      }
    }
  }


  .right-section {
    padding: vh(185) vw(260) 0 vw(94);

    .login-box {
      width: vw(560);
      height: vh(710);
      border-radius: vw(2);
      background: rgba(255, 255, 255, 0.50);
      box-shadow: vw(6) vw(6) vw(50) 0 rgba(0, 0, 0, 0.10);
      backdrop-filter: blur(vw(5));
      display: flex;
      justify-content: center;
      flex-direction: column;
      padding: vh(109) vw(120) vh(146);

      .login-title {
        color: $font-dark;
        font-size: vw(32);
        font-style: normal;
        font-weight: bold;
        margin-bottom: vh(39);
      }

      .qrcode {
        width: vw(320);
        height: vw(320);
      }
    }
  }

  .agreement-text {
    margin-top: vh(40);
    color: #E8EAEC;
    font-size: vw(16);
    font-style: normal;
    font-weight: 400;
    line-height: vw(24);

    .agreement-link {
      color: $theme-color;
    }
  }

  .version-info {
    position: absolute;
    bottom: vh(30);
    left: 50%;
    transform: translateX(-50%);
    color: $font-light;
    font-size: vw(16);
    font-style: normal;
    font-weight: 400;
    line-height: vw(24)
  }
}

</style>
