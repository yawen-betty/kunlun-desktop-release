<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {checkForUpdates} from '@/updater';
import UpdateDialog from '@/components/updateDialog/index.vue';
import {Config} from "@/Config.ts";
import {GetProfileInDto} from "@/api/user/dto/GetProfile.ts";
import {UserInfo} from "@/utiles/userInfo.ts";
import {UserService} from "@/service/UserService.ts";
import {auth} from "@/utiles/tauriCommonds.ts";
import {useRouter} from "vue-router";
import {GetConfigInDto} from "@/api/admin/dto/GetConfig.ts";
import {SystemInfo} from "@/utiles/systemInfo.ts";
import {AdminService} from "@/service/AdminService.ts";

const adminService = new AdminService();
const userService = new UserService();
const updateDialogRef = ref();
const currentVersion = Config.version; // 从 package.json 或 tauri.conf.json 读取

const router = useRouter();

// 应用启动时自动检查更新
onMounted(async () => {
  try {

    const result = await checkForUpdates(currentVersion, false);

    if (result) {
      updateDialogRef.value?.show({
        ...result,
        currentVersion
      });
    }
  } catch (e) {
    console.info('=====检测更新失败====', e)
  }

  auth.getToken().then(token => {
    if (token) {
      UserInfo.info.token = token;
      getUserInfo(userService);
    }
  })

  getConfigInfo();
});

// 手动检查更新（绑定到菜单或按钮）
const manualCheckUpdate = async () => {
  const result = await checkForUpdates(currentVersion, true);

  if (result) {
    updateDialogRef.value?.show({
      ...result,
      currentVersion
    });
  }
}

// 获取用户信息
const getUserInfo = (userService: UserService) => {
  userService.getProfile(new GetProfileInDto()).then(res => {
    if (res.code === 200) {
      UserInfo.info.avatar = Config.baseUrl + res.data.avatarUrl!;
      UserInfo.info.userName = res.data.name!;
      UserInfo.info.userId = res.data.uuid!;

      if (Config.env !== 'dev') {
        if (res.data.profileCompleteFlag === '1') {
          router.push('/resume')
        } else {
          router.push('/initProfile')
        }
      }
    }
  })
}

// 获取系统配置
const getConfigInfo = () => {
  adminService.getConfig(new GetConfigInDto()).then(res => {
    if (res.code === 200) {
      SystemInfo.info.loginTitle = res.data.appName
      SystemInfo.info.loginBg = res.data.loginPageImage
    }
  })
}

</script>

<template>
  <main class="container">
    <router-view/>
  </main>
  <UpdateDialog ref="updateDialogRef"/>
</template>
<style scoped lang="scss">
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.container {
  height: 100vh;
  margin: 0;
  padding: 0;
  background: $bg-gray;
}
</style>
