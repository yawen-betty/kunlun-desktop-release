<script lang="ts" setup>
import {ref} from 'vue';
import {channelAuth} from '@/robot/channelLogin/authManage.ts';
import {executeLogin} from '@/robot/channelLogin/login.ts';
import {executePositionSearch} from "@/robot/channelPositions/positionSearch.ts";
import {robotManager} from "@/robot/service";
import {checkLogin} from '@/robot/checkLogin/index.ts';
import {openWeb} from "@/utiles/openWeb.ts";
import {UserInfo} from "@/utiles/userInfo.ts";
import {invoke} from "@tauri-apps/api/core";

const channelName = ref('boss');
const cookies = ref('sessionid=test123; token=abc456');
const result = ref('');

const openBaidu = async () => {
    await openWeb('https://www.baidu.com/');
}

// 测试保存 Cookies
async function testSave() {
    try {
        await channelAuth.saveCookies(channelName.value, cookies.value);
        result.value = `✅ 保存成功！\n渠道: ${channelName.value}\nCookies: ${cookies.value}`;
    } catch (error) {
        result.value = `❌ 保存失败: ${error}`;
    }
}

// 测试获取单个渠道 Cookies
async function testGet() {
    try {
        const data = await channelAuth.getCookies(channelName.value);
        result.value = `✅ 获取成功！\n渠道: ${channelName.value}\nCookies: ${data}`;
    } catch (error) {
        result.value = `❌ 获取失败: ${error}`;
    }
}

// 测试获取所有渠道 Cookies
async function testGetAll() {
    try {
        const data = await channelAuth.getAllCookies();
        result.value = `✅ 获取所有渠道成功！\n\n${JSON.stringify(data, null, 2)}`;
    } catch (error) {
        result.value = `❌ 获取失败: ${error}`;
    }
}

const login = async (channelName: string) => {
    try {
        result.value = '正在启动登录流程...';
        console.log('开始执行 executeLogin');

        const loginResult = await executeLogin(channelName);

        console.log('登录结果:', loginResult);

        if (loginResult.success) {
            result.value = `✅ 登录成功！\n渠道: ${loginResult.channelName}`;
        } else {
            result.value = `❌ 登录失败\n错误: ${loginResult.error}`;
        }
    } catch (error) {
        console.error('登录异常:', error);
        result.value = `❌ 异常: ${error}`;
    }
}

const bossPosition = async () => {
    await robotManager.initMCP();
    const result = await executePositionSearch({
        channelName: 'boss',
        searchParams: {
            jobTitle: 'Java',
            cityInfos: '丽水',
            experience: '5-10K'
        },
        apiKey: 'ca9112c0753043ae9c2f9647892f49e7.bfZ2cqxbzv7duOph'
    }, '145b19cf73e749efac73a6f05827bead');

    console.info('================职位====================', result)
}

const zhilianPosition = async () => {
    await robotManager.initMCP();
    const result = await executePositionSearch({
        channelName: 'zhilian',
        searchParams: {
            jobTitle: 'Java',
            cityInfos: '丽水',
            experience: '10K-15K'
        },
        apiKey: 'ca9112c0753043ae9c2f9647892f49e7.bfZ2cqxbzv7duOph'
    }, '145b19cf73e749efac73a6f05827bead');

    console.info('================职位====================', result)
}

const guopinPosition = async () => {
    await robotManager.initMCP();
    const result = await executePositionSearch({
        channelName: 'guopin',
        searchParams: {
            jobTitle: 'Java',
            cityInfos: '丽水',
            experience: '10K-20K'
        },
        apiKey: '2f8832011b8142c88355c47e436a371d.dxOs4FN5VORHJGbI'
    }, '145b19cf73e749efac73a6f05827bead');

    console.info('================职位====================', result)
}

const stop = async () => {
    await robotManager.cleanup();
}

const logedChannels = ref([]);
const check = async () => {
    logedChannels.value = await checkLogin();
}

const crPosition = async () => {
    await robotManager.crawlPosition({
        jobTitle: 'Java',
        cityInfos: '丽水',
        experience: '10K-20K'
    }, '145b19cf73e749efac73a6f05827bead')
}

const getCacheSize = async () => {
  const cacheInfo = await invoke('get_cache_size');
  console.info('//////////1212121212',JSON.stringify(cacheInfo));
}

const clearCache = async () => {
  const result = await invoke('clear_cache');
  console.info('//////////34343434',JSON.stringify(result));
}
</script>

<template>
    <div class="test-container">
        <h2>渠道认证测试</h2>
        token: {{ UserInfo.info.token }}
        <div class="form-group">
            <label>渠道名称:</label>
            <input v-model="channelName" placeholder="如: boss, zhipin, linkedin" type="text"/>
        </div>

        <div class="form-group">
            <label>Cookies:</label>
            <textarea v-model="cookies" placeholder="输入 Cookie 字符串" rows="3"></textarea>
        </div>

        <div class="button-group">
            <button class="btn-primary" @click="testSave">保存 Cookies</button>
            <button class="btn-secondary" @click="testGet">获取指定渠道</button>
            <button class="btn-info" @click="testGetAll">获取所有渠道</button>
        </div>
        <div class="button-group">
            <button class="btn-info" @click="login('boss')">boss登录</button>
            <button class="btn-info" @click="login('zhilian')">智联登录</button>
            <button class="btn-info" @click="login('guopin')">国聘登录</button>
        </div>
        <div class="button-group">
            <button class="btn-info" @click="bossPosition">boss职位</button>
            <button class="btn-info" @click="zhilianPosition">智联职位</button>
            <button class="btn-info" @click="guopinPosition">国聘职位</button>
        </div>
        <div class="button-group">
            <button class="btn-info" @click="crPosition">爬职位</button>
        </div>
        <div class="button-group">
            <button class="btn-info" @click="stop">关闭</button>
            <button class="btn-info" @click="check">检测登录</button>
            {{ logedChannels }}
        </div>
        <div class="button-group">
            <button class="btn-info" @click="openBaidu">打开百度</button>
        </div>

      <div class="button-group">
        <button class="btn-info" @click="getCacheSize">计算</button>
        <button class="btn-info" @click="clearCache">清理</button>
      </div>


        <div v-if="result" class="result-box">
            <h4>测试结果:</h4>
            <pre>{{ result }}</pre>
        </div>


    </div>
</template>

<style scoped>
.test-container {
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
}

h2 {
    margin-bottom: 24px;
    color: #333;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #666;
    font-size: 14px;
    font-weight: 500;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    font-family: inherit;
}

.form-group textarea {
    resize: vertical;
}

.button-group {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

button {
    flex: 1;
    padding: 12px 24px;
    font-size: 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
}

.btn-primary {
    background: #1890ff;
    color: white;
}

.btn-primary:hover {
    background: #40a9ff;
}

.btn-secondary {
    background: #52c41a;
    color: white;
}

.btn-secondary:hover {
    background: #73d13d;
}

.btn-info {
    background: #fa8c16;
    color: white;
}

.btn-info:hover {
    background: #ffa940;
}

.result-box {
    padding: 16px;
    background: #f5f5f5;
    border-radius: 6px;
    border: 1px solid #ddd;
}

.result-box h4 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 14px;
}

.result-box pre {
    margin: 0;
    padding: 12px;
    background: white;
    border-radius: 4px;
    font-size: 13px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #333;
}
</style>
