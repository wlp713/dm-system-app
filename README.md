# DM 系统 / ระบบ DM

工厂日常管理 APP 第一版，重点实现 **4M 点检** 和 **两小时检查** 的拍照打卡。采用 Expo / React Native + TypeScript，同一套代码面向 Android、iOS 和网页预览。

## 已实现

- 工作台：显示当前车间、班次、4M 完成进度和当前两小时时段。
- 4M：人、机、料、法四类点检，正常/异常状态、照片、说明。人员照片可选；机、料、法必须有照片。
- 两小时检查：按手机本地时间自动识别当前两小时时段，提交时必须有照片。
- 记录：按当前车间查看本机保存的点检记录和照片。
- 设置：人员姓名、六个车间及 PE/IP/QA/PC、班次、中泰语言切换。

各车间内部的详细检查项尚未配置。LOSS 台账暂缓。当前记录只保存在单机；跨 Android/iOS 实时同步要接入 Firebase 后才能使用。

## 分层

`src/app` 页面与导航；`src/ui` 可复用界面与表单；`src/domain` 4M 模型、时间规则和中泰文案；`src/data` 本地仓储与照片持久化；`src/state` 界面状态。将来接 Firebase 时可实现 `CheckRepository`，不用重写点检页面。

## 本地运行

需要 Node.js 22.13 或更新版本。运行 `npm ci`、`npx expo start`，或 `npm run web` 在浏览器预览。`npm run lint`、`npm run typecheck` 检查代码，`npm run export:web` 导出网页版。

## 安装包与发布

- Android：`npx eas-cli@latest build --platform android --profile preview` 生成可安装 APK。需先登录 Expo/EAS 账号。
- iOS：`npx eas-cli@latest build --platform ios --profile production --auto-submit` 提交 TestFlight。需 Expo/EAS 账号、Apple Developer 账号与 App Store Connect 配置。苹果正式使用 TestFlight 或 App Store 链接安装。
- `site/index.html` 是统一下载页；在 `site/config.js` 填入实际 APK 和 TestFlight 链接后再发布。没有 APK 时会显示“待发布”。iPhone 现在可通过 Safari“添加到主屏幕”安装网页演示版；原生安装仍需 TestFlight。

技术依据：[Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)、[Expo Router](https://docs.expo.dev/router/installation/)、[ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/)、[内部安装包](https://docs.expo.dev/build/internal-distribution/)、[TestFlight](https://docs.expo.dev/submit/testflight/)。
