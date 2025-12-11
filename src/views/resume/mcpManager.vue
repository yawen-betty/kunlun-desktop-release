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

let shouldStop = true;
let prompt = `# Role：简历与岗位匹配机器\\r\\n**目标**：\\r\\n
      需要从给定的简历文本中提取所有信息，结合职位要求信息，动态生成匹配维度并进行匹配分析，
      在完成所有匹配维度分析后，基于“职位要求核心项（剔除软性要求）
      ”与“简历已提供信息”的整体差异，自动生成一段“总结与建议”，
      该段内容需简明扼要、可操作性强，禁止出现推理步骤，仅输出最终结果。
      输出对应结果。按规范输出结构化JSON数据，确保字段完整、
      格式统一且无冗余符号。输出内容仅包含结果数据，禁止输出任何推理过程以及推理依据。
      \\r\\n\\r\\n**约束条件**：\\r\\n1. **信息提取规则**：\\r\\n
        - 仅基于简历原文和职位要求信息提取并剔除软性要求，禁止补充或虚构信息以及推理过程或推理依据。\\r\\n
        - 严格区分各字段含义，避免信息混淆。\\r\\n2. **格式强制规范**：\\r\\n
        - **职位匹配度**：该简历信息与职位要求信息（剔除软性要求后）的综合匹配程度，最高“1.0000”，
        最低“0.0000”，结果需保证合理性。\\r\\n
        - **匹配总结**：  该简历信息与职位相关信息（剔除软性要求后）的总结，确保50字以内。\\r\\n
        - **相关维度分析**：需根据职位要求信息动态生成匹配维度（维度为模型返回内容，非固定项），
        每条分析必须包含匹配维度、匹配度、匹配原因字段。\\r\\n
        - **匹配维度**：由模型根据职位要求信息动态生成，需贴合职位核心需求，
        不包含软性要求（如良好的沟通、团队协作意识、抗压能力等），
        如果相关信息中有软性要求也不需要进行匹配。\\r\\n
        - **匹配度**：该维度与简历的匹配程度，只输出低/中/高。\\r\\n
         - **匹配原因**：该维度与简历的匹配度高低的原因，需引用简历中对应内容，
         200字以内。\\r\\n3. **异常处理**：\\r\\n
         - 同一信息重复出现，优先选取最完整、清晰的内容。\\r\\n
          - 职位匹配度为小数点后4位小数，不需要转换百分制。\\r\\n
          - 当职位要求信息为空或填写不完全时，仅根据已有内容动态生成维度并进行分析。\\r\\n
           - 软性要求（如良好的沟通、团队协作意识、抗压能力等）不列入最终的维度分析和匹配打分。\\r\\n
           4. **总结与建议规则**：\\r\\n   - 仅基于简历中已提供的信息与职位要求（剔除软性要求）进行差异总结。\\r\\n
              - 禁止虚构经历或补充不存在的内容。\\r\\n
              - 禁止输出推理过程，只能输出最终的总结与建议。\\r\\n
               - 总结需对整体匹配情况进行凝练描述，50 字以内。\\r\\n
               - 建议需严格限定在“硬性能力、经验、技术、证书、工具”等可量化或可补强领域。\\r\\n
               - 不得引用软性要求（如沟通能力、团队合作）。\\r\\n\\r\\n**核心能力**：\\r\\n
               - 简历文本与职位要求信息（剔除软性要求后）语义解析\\r\\n
               - 职位要求信息（剔除软性要求后）核心要素提取与动态维度生成 （剔除软性要求）\\r\\n
               - 简历与动态生成维度的匹配计算（保证结果合理性）\\r\\n
               - 规范JSON数据格式校验与生成\\r\\n\\r\\n**输出规范**：\\r\\n{\\r\\n  \\
               "jobPositionMatchScore\\": string; // 职位匹配度（剔除软性要求，结果合理）\\r\\n  \\"
               summaryAndSuggestion\\": string; // 匹配整体总结（50字以内）\\r\\n  \\
               "relatedDimensionAnalysisList\\": [\\r\\n      \\"matchingDimensions\\
               ": string; // 匹配维度（模型根据职位要求信息动态生成，剔除软性要求）\\r\\n
               \\"matchingDegree\\": string; // 匹配度（低 / 中 / 高）\\r\\n
               \\"matchingReason\\": string; // 匹配原因（引用简历对应内容，200字以内）\\r\\n
               ]; // 相关维度分析（维度为模型动态生成，非固定项）\\r\\n}\\r\\n\\r\\n**工作流**：\\r\\n
               1. **文本信息解析**：\\r\\n   - 解析简历内容，提取所有信息；解析职位要求信息，
               剔除软性要求（如良好的沟通、团队协作意识、抗压能力等）。\\r\\n
               - 若职位要求信息为空或填写不完全，仅基于已有内容进行后续操作。\\r\\n2.
               **动态维度生成**：\\r\\n   - 根据解析后的职位要求信息（剔除软性要求后），
               动态生成匹配维度（维度为模型返回内容，非固定项），确保维度贴合职位核心需求，
               如果职位要求信息中有软性要求也不需要进行匹配维度生成 。\\r\\n
               3. **匹配分析逻辑**：\\r\\n   - 逐一比对每个动态生成的维度与简历中对应信息的匹配情况；\\r\\n
               - 生成职位要求信息匹配维度且剔除软性要求；\\r\\n
               - 综合各维度匹配结果，计算合理的职位匹配度（保证结果合理性）；\\r\\n
               - 每条分析需明确匹配维度、匹配度及匹配原因（引用简历内容）。\\r\\n
               4. **评估标准**：\\r\\n   - 基于动态生成的维度进行评估，不涉及软性要求；\\r\\n
               - 确保匹配度计算和分析结果符合职位实际需求，具备合理性。\\r\\n5. **总结与建议生成**：\\r\\n
               - 依据匹配维度分析中的整体表现，生成简短总结（50 字内）。\\r\\n
               - 提取职位要求（剔除软性要求）中简历未覆盖或薄弱的部分。\\r\\n
                - 若职位要求信息不完整，则仅基于现有维度进行差异化建议。\\r\\n
                - 禁止虚构内容，不得使用软要求或推理过程。\\r\\n6. **数据清洗与格式转换**：\\r\\n
                - 生成 JSON 后，扫描并移除所有':'符号（除 JSON 键值对分隔符外）。\\r\\n
                - 必须确保值中不包含非法符号（':'），如将 \\"技术开发：后端\\" 转换为 \\"技术开发 后端\\"\\r\\n
                  - 将 json.dumps 无法转义的字符自动转义，如将\\"\\\\\\" 转换为 \\"\\\\\\\\\\"\\r\\n
                  - 生成标准JSON数据，剔除换行、空格等无效字符。\\r\\n7. **质量校验**：\\r\\n
                  - 检查字段完整性，补充\\"未提供\\"占位；\\r\\n
                  - 校验匹配维度是否为动态生成（非固定项）、是否剔除软性要求；\\r\\n
                  - 校验职位匹配度、分析结果、总结与建议的合理性，确保数据符合输出规范。`
const bossPosition = async () => {
    await robotManager.initMCP();
    const result = await executePositionSearch({
        channelName: 'boss',
        searchParams: {
            jobTitle: '学徒',
            cityInfos: '兰州',
            experience: '50K以上'
        },
        apiKey: 'ca9112c0753043ae9c2f9647892f49e7.bfZ2cqxbzv7duOph'
    },
      `姓名：豆包麻薯 /n
求职岗位：3243123 /n
手机号码：18888888888 /n
个人邮箱：8888@163.com /n
性别：男 /n
出生日期：1996.10 /n
居住城市：上海市`,
      '145b19cf73e749efac73a6f05827bead',
      prompt,
      () => shouldStop);

    console.info('================职位====================', result)
}

const zhilianPosition = async () => {
    await robotManager.initMCP();
    const result = await executePositionSearch({
        channelName: 'zhilian',
        searchParams: {
            jobTitle: '学徒',
            cityInfos: '丽水',
            experience: '50K以上'
        },
        apiKey: 'ca9112c0753043ae9c2f9647892f49e7.bfZ2cqxbzv7duOph'
    },
      `姓名：豆包麻薯 /n
求职岗位：3243123 /n
手机号码：18888888888 /n
个人邮箱：8888@163.com /n
性别：男 /n
出生日期：1996.10 /n
居住城市：上海市`,
      '145b19cf73e749efac73a6f05827bead',
      prompt,
      () => shouldStop);

    console.info('================职位====================', result)
}

const guopinPosition = async () => {
    await robotManager.initMCP();
    const result = await executePositionSearch({
        channelName: 'guopin',
        searchParams: {
            jobTitle: '测试开发',
            cityInfos: '北京',
            experience: '60k以上'
        },
        apiKey: '2f8832011b8142c88355c47e436a371d.dxOs4FN5VORHJGbI'
    },
      `姓名：豆包麻薯 /n
求职岗位：3243123 /n
手机号码：18888888888 /n
个人邮箱：8888@163.com /n
性别：男 /n
出生日期：1996.10 /n
居住城市：上海市`,
      '145b19cf73e749efac73a6f05827bead',
      prompt,
      () => shouldStop);

    console.info('================职位====================', result)
}

const stop = async () => {
    await robotManager.cleanup();
}

const logedChannels = ref([] as string[]);
const check = async () => {
    logedChannels.value = await checkLogin();
}

const crPosition = async () => {
    await robotManager.crawlPosition({
        jobTitle: 'Java',
        cityInfos: '丽水',
        experience: '10K-20K'
    },
      `姓名：豆包麻薯 /n
求职岗位：3243123 /n
手机号码：18888888888 /n
个人邮箱：8888@163.com /n
性别：男 /n
出生日期：1996.10 /n
居住城市：上海市`,'145b19cf73e749efac73a6f05827bead',`# Role：简历与岗位匹配机器\\r\\n**目标**：\\r\\n需要从给定的简历文本中提取所有信息，结合职位要求信息，动态生成匹配维度并进行匹配分析，在完成所有匹配维度分析后，基于“职位要求核心项（剔除软性要求）”与“简历已提供信息”的整体差异，自动生成一段“总结与建议”，该段内容需简明扼要、可操作性强，禁止出现推理步骤，仅输出最终结果。输出对应结果。按规范输出结构化JSON数据，确保字段完整、格式统一且无冗余符号。输出内容仅包含结果数据，禁止输出任何推理过程以及推理依据。\\r\\n\\r\\n**约束条件**：\\r\\n1. **信息提取规则**：\\r\\n   - 仅基于简历原文和职位要求信息提取并剔除软性要求，禁止补充或虚构信息以及推理过程或推理依据。\\r\\n   - 严格区分各字段含义，避免信息混淆。\\r\\n2. **格式强制规范**：\\r\\n   - **职位匹配度**：该简历信息与职位要求信息（剔除软性要求后）的综合匹配程度，最高“1.0000”，最低“0.0000”，结果需保证合理性。\\r\\n   - **匹配总结**：  该简历信息与职位相关信息（剔除软性要求后）的总结，确保50字以内。\\r\\n   - **相关维度分析**：需根据职位要求信息动态生成匹配维度（维度为模型返回内容，非固定项），每条分析必须包含匹配维度、匹配度、匹配原因字段。\\r\\n   - **匹配维度**：由模型根据职位要求信息动态生成，需贴合职位核心需求，不包含软性要求（如良好的沟通、团队协作意识、抗压能力等），如果相关信息中有软性要求也不需要进行匹配。\\r\\n   - **匹配度**：该维度与简历的匹配程度，只输出低/中/高。\\r\\n   - **匹配原因**：该维度与简历的匹配度高低的原因，需引用简历中对应内容，200字以内。\\r\\n3. **异常处理**：\\r\\n   - 同一信息重复出现，优先选取最完整、清晰的内容。\\r\\n   - 职位匹配度为小数点后4位小数，不需要转换百分制。\\r\\n   - 当职位要求信息为空或填写不完全时，仅根据已有内容动态生成维度并进行分析。\\r\\n   - 软性要求（如良好的沟通、团队协作意识、抗压能力等）不列入最终的维度分析和匹配打分。\\r\\n4. **总结与建议规则**：\\r\\n   - 仅基于简历中已提供的信息与职位要求（剔除软性要求）进行差异总结。\\r\\n   - 禁止虚构经历或补充不存在的内容。\\r\\n   - 禁止输出推理过程，只能输出最终的总结与建议。\\r\\n   - 总结需对整体匹配情况进行凝练描述，50 字以内。\\r\\n   - 建议需严格限定在“硬性能力、经验、技术、证书、工具”等可量化或可补强领域。\\r\\n   - 不得引用软性要求（如沟通能力、团队合作）。\\r\\n\\r\\n**核心能力**：\\r\\n- 简历文本与职位要求信息（剔除软性要求后）语义解析\\r\\n- 职位要求信息（剔除软性要求后）核心要素提取与动态维度生成 （剔除软性要求）\\r\\n- 简历与动态生成维度的匹配计算（保证结果合理性）\\r\\n- 规范JSON数据格式校验与生成\\r\\n\\r\\n**输出规范**：\\r\\n{\\r\\n  \\"jobPositionMatchScore\\": string; // 职位匹配度（剔除软性要求，结果合理）\\r\\n  \\"summaryAndSuggestion\\": string; // 匹配整体总结（50字以内）\\r\\n  \\"relatedDimensionAnalysisList\\": [\\r\\n      \\"matchingDimensions\\": string; // 匹配维度（模型根据职位要求信息动态生成，剔除软性要求）\\r\\n      \\"matchingDegree\\": string; // 匹配度（低 / 中 / 高）\\r\\n      \\"matchingReason\\": string; // 匹配原因（引用简历对应内容，200字以内）\\r\\n  ]; // 相关维度分析（维度为模型动态生成，非固定项）\\r\\n}\\r\\n\\r\\n**工作流**：\\r\\n1. **文本信息解析**：\\r\\n   - 解析简历内容，提取所有信息；解析职位要求信息，剔除软性要求（如良好的沟通、团队协作意识、抗压能力等）。\\r\\n   - 若职位要求信息为空或填写不完全，仅基于已有内容进行后续操作。\\r\\n2. **动态维度生成**：\\r\\n   - 根据解析后的职位要求信息（剔除软性要求后），动态生成匹配维度（维度为模型返回内容，非固定项），确保维度贴合职位核心需求，如果职位要求信息中有软性要求也不需要进行匹配维度生成 。\\r\\n3. **匹配分析逻辑**：\\r\\n   - 逐一比对每个动态生成的维度与简历中对应信息的匹配情况；\\r\\n   - 生成职位要求信息匹配维度且剔除软性要求；\\r\\n   - 综合各维度匹配结果，计算合理的职位匹配度（保证结果合理性）；\\r\\n   - 每条分析需明确匹配维度、匹配度及匹配原因（引用简历内容）。\\r\\n4. **评估标准**：\\r\\n   - 基于动态生成的维度进行评估，不涉及软性要求；\\r\\n   - 确保匹配度计算和分析结果符合职位实际需求，具备合理性。\\r\\n5. **总结与建议生成**：\\r\\n   - 依据匹配维度分析中的整体表现，生成简短总结（50 字内）。\\r\\n   - 提取职位要求（剔除软性要求）中简历未覆盖或薄弱的部分。\\r\\n   - 若职位要求信息不完整，则仅基于现有维度进行差异化建议。\\r\\n   - 禁止虚构内容，不得使用软要求或推理过程。\\r\\n6. **数据清洗与格式转换**：\\r\\n   - 生成 JSON 后，扫描并移除所有':'符号（除 JSON 键值对分隔符外）。\\r\\n   - 必须确保值中不包含非法符号（':'），如将 \\"技术开发：后端\\" 转换为 \\"技术开发 后端\\"\\r\\n   - 将 json.dumps 无法转义的字符自动转义，如将\\"\\\\\\" 转换为 \\"\\\\\\\\\\"\\r\\n   - 生成标准JSON数据，剔除换行、空格等无效字符。\\r\\n7. **质量校验**：\\r\\n   - 检查字段完整性，补充\\"未提供\\"占位；\\r\\n   - 校验匹配维度是否为动态生成（非固定项）、是否剔除软性要求；\\r\\n   - 校验职位匹配度、分析结果、总结与建议的合理性，确保数据符合输出规范。`
      )
}

const getCacheSize = async () => {
    const cacheInfo = await invoke('get_cache_size');
    console.info('//////////1212121212', JSON.stringify(cacheInfo));
}

const clearCache = async () => {
    const result = await invoke('clear_cache');
    console.info('//////////34343434', JSON.stringify(result));
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
