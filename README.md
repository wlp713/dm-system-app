# DM 系统 / ระบบ DM

工厂日常管理 APP 原型，重点实现全厂执行排名、**4M 点检** 和 **两小时检讨会议** 的拍照打卡。采用 Expo / React Native + TypeScript，同一套代码面向 Android、iOS 和网页预览。

## 已实现

- 全厂首页：支持日 / 周 / 月切换；可分别查看 4M、两小时检讨会议的车间 / 部门排名和执行人排名。当前排名明确标记为演示数据。
- 4M：人、机、料、法四类点检，提供各类别的选择项、正常 / 异常、照片和说明。人员照片可选；机、料、法必须有照片。
- 两小时检讨会议：上午、下午各一场；支持 10:00 / 10:30、14:00 / 15:00 时点配置，记录是否召开并上传照片；未召开需说明原因。
- 记录：按当前车间查看本机保存的点检记录和照片。
- 设置：人员姓名、六个车间及 PE/IP/QA/PC、班次、中泰语言切换。

各车间内部的正式检查项尚未配置，原型选择项仅用于流程预览。LOSS 台账暂缓。当前记录只保存在单机；跨 Android/iOS 实时同步要接入 Firebase 后才能使用。产品范围、指标口径、权限和后续数据结构见 [DM 产品与代码架构初稿](docs/DM-PRODUCT-ARCHITECTURE.md)。

## 分层

`src/app` 页面与导航；`src/ui` 可复用界面与表单；`src/domain` 4M / 会议模型、指标周期、样例排名和中泰文案；`src/data` 本地仓储与照片选择；`src/state` 界面状态。接 Firebase 时扩展 repository 数据适配层，不重写点检页面。

## 本地运行

需要 Node.js 22.13 或更新版本。运行 `npm ci`、`npx expo start`，或 `npm run web` 在浏览器预览。`npm run lint`、`npm run typecheck` 检查代码，`npm run export:web` 导出网页版。

## 安装包与发布

- Android：[`v0.2.0 演示 APK`](https://github.com/wlp713/dm-system-app/releases/download/v0.2.0/DM-System-Android-v0.2.0.apk) 已发布，使用开发签名，仅适合内部试用。正式稳定发布需配置专用签名密钥；也可登录 Expo/EAS 后运行 `npx eas-cli@latest build --platform android --profile preview`。
- iOS：`npx eas-cli@latest build --platform ios --profile production --auto-submit` 提交 TestFlight。需 Expo/EAS 账号、Apple Developer 账号与 App Store Connect 配置。苹果正式使用 TestFlight 或 App Store 链接安装。
- `site/index.html` 是统一下载页；`site/config.js` 配置当前 APK 链接。iPhone 现在可通过 Safari“添加到主屏幕”安装网页演示版；原生安装仍需 TestFlight。

技术依据：[Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)、[Expo Router](https://docs.expo.dev/router/installation/)、[ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/)、[内部安装包](https://docs.expo.dev/build/internal-distribution/)、[TestFlight](https://docs.expo.dev/submit/testflight/)。
