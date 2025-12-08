#!/bin/bash

# ------------------- 请在这里填写您的信息 -------------------

# 1. .app 文件的路径
#    请先双击打开从 GitHub 下载的 .dmg 文件，然后将 .app 文件拖到“应用程序”或桌面。
#    再将这个变量设置为 .app 文件的完整路径。
APP_PATH="/Applications/Kunlun.app"

# 2. 您的签名身份 (Signing Identity)
#    打开“钥匙串访问” -> “我的证书”，找到 "Developer ID Application: ..." 证书。
#    将其“常用名称"(Common Name) 完整地复制到这里。
#    例如:"Developer ID Application: Your Name (XXXXXXXXXX)"
IDENTITY="Developer ID Application: Dalian Liangji Yuren Technology Co., Ltd. (M39X94LDRM)"

# 3. 您的 Apple ID 和应用专用密码
APPLE_ID="lihonggang1103@163.com"
APP_SPECIFIC_PASSWORD="bnkb-zjuj-ubth-vdju" # 您生成的那个应用专用密码

# 4. 您的开发者团队 ID (Team ID)
#    登录 apple developer 网站，在右上角您的名字下面可以找到。
TEAM_ID="M39X94LDRM"

# ------------------- 脚本正文，无需修改 -------------------

# 检查配置
if [[ "$IDENTITY" == "Developer ID Application: your name" ]]; then
    echo "错误：请先修改脚本顶部的配置变量！"
    exit 1
fi

echo "--- 1. 开始对应用进行深度签名 ---"
codesign --force --deep --options=runtime --sign "$IDENTITY" "$APP_PATH"
if [ $? -ne 0 ]; then
    echo "错误：签名失败。请检查您的 IDENTITY 名称是否正确，以及证书是否已在钥匙串中。"
    exit 1
fi
echo "签名成功。"

echo "\n--- 2. 创建用于公证的 zip 文件 ---"
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "${APP_PATH}.zip"
echo "zip 文件创建成功: ${APP_PATH}.zip"

echo "\n--- 3. 提交到苹果进行公证 (此过程可能需要几分钟) ---"
xcrun notarytool submit "${APP_PATH}.zip" \
    --apple-id "$APPLE_ID" \
    --password "$APP_SPECIFIC_PASSWORD" \
    --team-id "$TEAM_ID" \
    --wait
if [ $? -ne 0 ]; then
    echo "错误：公证提交失败。请检查您的 Apple ID、应用专用密码和 Team ID 是否正确。"
    rm "${APP_PATH}.zip" # 清理 zip 文件
    exit 1
fi
echo "公证成功。"

echo "\n--- 4. 将公证票据“钉”在应用上 ---"
xcrun stapler staple "$APP_PATH"
if [ $? -ne 0 ]; then
    echo "错误：Staple 失败。"
    rm "${APP_PATH}.zip" # 清理 zip 文件
    exit 1
fi
echo "Staple 成功。"

# 清理 zip 文件
rm "${APP_PATH}.zip"

echo "\n\n🎉 全部完成！您的应用已签名并公证完毕。"
echo "现在您可以分发 ${APP_PATH} 了。"
