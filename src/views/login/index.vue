<template>
  <div class="login-page">
    <div class="left-section">
      <div class="brand-area">
        <Image :src="configInfo.appIcon" alt="Logo" class="logo mr-30"/>
        <h1 class="app-name">{{ SystemInfo.info.loginTitle }}</h1>
      </div>

      <div class="slogan-area">
        <p class="slogan-cn">{{ configInfo.appChineseSlogan }}</p>
        <p class="slogan-en">{{ configInfo.appEnglishSlogan }}</p>
      </div>

      <div class="illustration-area">
        <img :src="SystemInfo.info.loginBg" alt="Illustration" class="illustration"/>
      </div>
    </div>

    <div class="right-section">
      <div class="login-box">
        <h2 class="login-title">微信扫码登录/注册</h2>
        <img :src="qrCodeUrl" alt="QR Code" class="qrcode pointer" @click="generateQRCode">

        <div class="agreement-text">
          登录即同意
          <span class="agreement-link pointer" @click="openAgreement(2)">《服务协议》</span>、
          <span class="agreement-link pointer" @click="openAgreement(1)">《隐私协议》</span>
        </div>
      </div>
    </div>

    <div class="version-info">{{ Config.version }} - {{ Config.env !== 'prod' && Config.env }}</div>
  </div>

  <AgreementModal
    v-model:visible="showAgreement"
    :title="agreementType === 1 ? '隐私协议' : '服务协议'"
    @close="closeModal"
    :agreementType="agreementType"
  />
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import {onBeforeUnmount, onMounted, reactive, ref} from 'vue';
import {Image, Message} from "view-ui-plus";
import {Config} from "@/Config.ts";
import AgreementModal from '@/views/login/components/AgreementModal.vue';
import {SystemInfo} from "@/utiles/systemInfo.ts";
import {AdminService} from "@/service/AdminService.ts";
import {GetConfigInDto, GetConfigOutDto} from "@/api/admin/dto/GetConfig.ts";
import {AuthService} from "@/service/AuthService.ts";
import {GetTokenInDto} from "@/api/auth/dto/GetToken.ts";
import {UserInfo} from "@/utiles/userInfo.ts";
import {UserService} from "@/service/UserService.ts";
import {GetProfileInDto} from "@/api/user/dto/GetProfile.ts";
import {auth} from "@/utiles/tauriCommonds.ts";
import {useRouter} from "vue-router";
import {message} from "@/utiles/Message.ts";

const qrCodeUrl = ref<string>('');
const showAgreement = ref<boolean>(false);
const agreementType = ref<number>(1);
const configInfo = reactive<GetConfigOutDto>(new GetConfigOutDto)
const state = ref<string>('');
const inter = ref();
const router = useRouter();

// 在setup中创建service实例，避免在定时器中丢失Vue上下文
const authService = new AuthService();
const adminService = new AdminService();
const userService = new UserService();

const openAgreement = (type: number) => {
  showAgreement.value = true;
  agreementType.value = type;
};

const closeModal = () => {
  showAgreement.value = false;
};

const generateQRCode = async () => {
  try {
    const redirect_uri = encodeURIComponent('https://hr-stu.dev.lingxizhifu.net/api/kunlun/auth/wechat/callback')
    const hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-'];
    const list = [] as string[];

    for (let n = 0; n < 36; n++) {
      list.push(hexRef[Math.floor(Math.random() * 16)]);
    }
    state.value = list.join('');

    const url = `https://open.weixin.qq.com/connect/qrconnect?appid=wxb1fa1b36925f5f61&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_login&state=${state.value}#wechat_redirect`

    qrCodeUrl.value = await QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (e) {
    console.error(e)
  }
}

const getConfigInfo = () => {
  adminService.getConfig(new GetConfigInDto()).then(res => {
    if (res.code === 200) {
      Object.assign(configInfo, res.data);
      SystemInfo.info.loginTitle = res.data.appName
      SystemInfo.info.loginBg = res.data.loginPageImage
      generateQRCode()
    }
  })
}

const getStatus = () => {
  const data: GetTokenInDto = {
    state: state.value
  }

  authService.getToken(data).then(res => {
    if (res.code === 200) {
      clearInterval(inter.value);
      UserInfo.info.token = res.data.token;
      auth.saveToken(res.data.token);
      message.success(Message, '登录成功！')
      getUserInfo();
    }
  })
};

const getUserInfo = () => {
  userService.getProfile(new GetProfileInDto()).then(res => {
    if (res.code === 200) {
      UserInfo.info.avatar = res.data.avatarUrl!;
      UserInfo.info.userName = res.data.name;

      if (res.data.profileCompleteFlag === '1') {
        router.push('/personalInfo')
      } else {
        router.push('/initProfile')
      }
    }
  })
}

const open = () => {
  inter.value = setInterval(() => {
    getStatus();
  }, 1000);
};

onBeforeUnmount(() => {
  clearInterval(inter.value);
});

onMounted(() => {
  getConfigInfo();
  open();
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
    width: vw(1006);

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
        text-align: center;
      }

      .qrcode {
        width: vw(320);
        height: vw(320);
      }
    }
  }

  .agreement-text {
    margin-top: vh(40);
    color: #9499A4;
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
