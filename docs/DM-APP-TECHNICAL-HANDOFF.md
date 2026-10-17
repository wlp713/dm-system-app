# DM 系统开发交接说明

**用途：** 将当前代码、原型逻辑、技术选型和真实安装状态交给另一位 AI / 开发团队继续开发。  
**核对日期：** 2026-10-17  
**代码仓库：** https://github.com/wlp713/dm-system-app  
**当前分支：** feature/field-ready-workflow  
**本次核对的提交：** 3e47cea8678bdd53fc732dc7f9afeed25882641c（Build field-ready DM workflow prototype）  
**当前在线预览：** https://dm-daily-management-preview.wnlipeng.chatgpt.site  
**当前代码位置：** C:\Users\19777\Documents\Codex\2026-10-16\https-chatgpt-com-share-6ad22933-cb64\work\dm-system

## 1. 先读这一页的结论

DM 系统目前是一个可在手机浏览器和 Expo 原生客户端运行的中泰双语交互原型。它围绕工厂班前 / 交班 4M 准备、上午和下午两场生产检讨会议，以及异常责任闭环设计。Android、iOS、Web 共用一套 Expo / React Native / TypeScript 页面和业务模型。

当前版本主要用于现场流程和界面评审。资料保存在当前设备的 AsyncStorage，首页榜单是样例数据，角色是本机预览开关。尚未接入 Firebase、员工账号、真实组织权限、跨手机实时同步、服务器提醒或生产级照片存储。因此目前不能把网页预览当成工厂实时系统，也不能依据样例排名评价车间或员工。

| 项目 | 当前实际状态 |
|---|---|
| Android / iOS / Web 共用业务代码 | 已有，基于 Expo / React Native |
| Web 静态预览 | 已部署，可从上方链接打开 |
| Android APK | GitHub Actions 有手动构建工作流，结果是 Actions artifact；没有配置公开下载地址 |
| iPhone 原生安装 | 尚未构建或发布；没有 Apple 签名凭据、App Store Connect 配置、TestFlight / App Store 链接 |
| Firebase / 跨设备数据 | 尚未接入 |
| 真实用户、岗位与权限校验 | 尚未接入；设置页角色切换只用于演示 |
| 工厂正式 4M 表、班次任务与会议日程 | 尚未配置；当前内容是通用样例 |
| 正式排名 | 尚未实现；原型榜单明确为演示数据 |
| 真正的推送通知 | 尚未接入 APNs / FCM 或服务端消息 |

## 2. 仓库与代码目录

GitHub 仓库根目录对应上方本机代码位置。以下是应用的主要文件结构：

~~~text
dm-system/
├── src/
│   ├── app/                         # Expo Router 页面和导航
│   │   ├── _layout.tsx              # 根布局、DM Provider
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # 底部主导航
│   │   │   ├── index.tsx            # 工厂总览 / 首页
│   │   │   ├── inspections.tsx      # 点检入口
│   │   │   ├── inbox.tsx            # 异常协同待办
│   │   │   ├── records.tsx          # 历史记录
│   │   │   └── settings.tsx         # 我的、语言、角色演示、车间和班次
│   │   ├── inspection/
│   │   │   ├── four-m.tsx           # 一次提交人、机、料、法 4M
│   │   │   └── meeting.tsx          # 上午 / 下午检讨会议记录
│   │   ├── issue/
│   │   │   └── index.tsx            # 单条异常详情、接单、跟进、复核、关闭、分享
│   │   └── rankings.tsx             # 车间与执行人完整排名
│   ├── data/
│   │   ├── repository.ts            # AsyncStorage 本地仓储与旧记录迁移
│   │   ├── photo.ts                 # 相机 / 相册取证、照片本机复制
│   │   └── shareIssue.ts            # 异常摘要及系统分享 / 剪贴板
│   ├── domain/
│   │   ├── model.ts                 # 设置、检查记录、异常、角色、状态机、时间周期
│   │   ├── i18n.ts                  # 中文和泰文界面文案
│   │   └── demo-rankings.ts         # 明确标注为样例的车间 / 执行人榜单
│   ├── state/
│   │   └── DmProvider.tsx           # React Context 状态、加载与本地仓储协调
│   └── ui/
│       ├── components.tsx           # 通用 UI 组件、按钮、卡片、表单控件
│       ├── RankingRow.tsx           # 排名行
│       └── theme.ts                 # 颜色和界面样式 token
├── assets/                          # Expo App 图标、Android 自适应图标、启动图
├── site/
│   ├── index.html                   # 静态安装 / 预览入口页
│   ├── config.js                    # Android APK / iOS App Store 按钮地址；目前均为空
│   ├── manifest.webmanifest         # Web App manifest
│   └── icon.png                     # 网页主屏幕图标
├── docs/
│   ├── DM-APP-TECHNICAL-HANDOFF.md  # 本交接说明
│   ├── DM-PROTOTYPE-v0.4.md         # 与当前代码对应的原型逻辑和范围
│   ├── DM-OPERATING-SYSTEM-v1.md    # 现场协同、指标、通知和交付目标方案
│   ├── DM-PRODUCT-LOGIC-v0.3.md     # 产品逻辑方案；比当前实现更完整，包含未实现目标
│   ├── DM-PRODUCT-ARCHITECTURE.md   # 早期架构初稿，个别内容已经过时
│   └── architecture.md              # 较早架构文档的索引
├── .github/workflows/
│   ├── pages.yml                    # 构建 Web 并部署 GitHub Pages
│   └── android-apk.yml              # 手动构建 Android Release APK
├── android/                         # 本地存在的 Expo prebuild 生成目录；Git 忽略，CI 会重新生成
├── app.json                         # Expo 应用 ID、平台参数、Web 静态输出配置
├── eas.json                         # EAS preview / production build profile
├── package.json                     # 依赖版本和常用命令
├── package-lock.json                # npm 锁定文件
├── tsconfig.json                    # TypeScript 设置
├── eslint.config.js                 # ESLint 设置
└── README.md                        # 仓库简要介绍、范围和运行边界
~~~

**不属于可交付源码的目录：** node_modules 是本机依赖；.expo 是 Expo 开发缓存；dist 是 Web 静态构建结果并被 Git 忽略；android 是预构建产物并被 Git 忽略。修改原生应用配置优先通过 app.json 和 Expo config plugin，避免把本机生成的 android / ios 目录作为唯一配置来源。

## 3. 技术栈与应用结构

| 层次 | 当前技术 | 主要位置 |
|---|---|---|
| 跨平台应用 | Expo SDK 58、React Native 0.88、React 19.3、TypeScript 6 | package.json、app.json |
| 页面与路由 | Expo Router 文件路由、typed routes | src/app/ |
| Web 运行 | React Native Web、Metro bundler、静态导出 | src/app/、app.json、dist/ |
| 本地状态 | React Context | src/state/DmProvider.tsx |
| 本机数据 | AsyncStorage | src/data/repository.ts |
| 现场照片 | Expo Image Picker、Expo File System | src/data/photo.ts |
| 微信等分享 | 原生系统 Share；网页 Web Share API / 复制文字 | src/data/shareIssue.ts |
| 图标 / 样式 | Expo Symbols、Linear Gradient、项目自有组件与主题 | src/ui/ |
| 持续集成 | GitHub Actions、Node.js 22、Java 17、Gradle | .github/workflows/ |
| 云构建配置 | EAS Build profiles 已有，当前工作流尚未调用 EAS | eas.json |
| 云数据服务 | 无；Firebase 尚未配置 | 后续开发 |

目前的调用关系可以概括为：

~~~text
页面 src/app
  → 复用控件和主题 src/ui
  → DmProvider 管本机应用状态 src/state
  → 领域模型、状态流转、中泰文案 src/domain
  → localRepository / 相机 / 分享 src/data
  → AsyncStorage + 本机照片文件
~~~

仓储接口已经集中在 data/repository.ts，适合作为后续接入 Firebase 的边界；不过当前只有 localRepository 实现，并没有 Firebase repository 或同步队列。将来接云时，需要设计用户身份和组织授权、离线暂存 / 重试、云端照片 Storage、冲突与修订、服务端时间和审计事件，再把真实数据接到看板计算中。

### 常用开发命令

需 Node.js 22.13 或更高版本；Expo SDK 58 官方版本表对应 React Native 0.88 和 React 19.3。

~~~bash
npm ci
npm run web
npm run android
npm run ios
npm run export:web
npm run typecheck
npm run lint
~~~

其中 npm run ios 用于启动开发环境 / iOS 模拟器，不代表已完成可交付 iPhone 安装包。原生 iOS Release 构建、签名、TestFlight / App Store 上传另需 Apple Developer 与 App Store Connect 配置。仓库的 GitHub Pages 工作流额外执行 npm run typecheck 与 npm run export:web。

## 4. 当前路由与页面用途

| 页面路由 | 用户看到的页面 | 主要交互 |
|---|---|---|
| /(tabs) | 首页，工厂总览 | 日 / 周 / 月，4M / 两小时检讨切换，车间和执行人样例排名；按演示角色显示不同范围 |
| /(tabs)/inspections | 点检入口 | 进入 4M 点检或两小时检讨会议 |
| /inspection/four-m | 4M 表单 | 选目标班次，逐项填写人机料法状态和异常影响，共用现场照片后提交 |
| /inspection/meeting | 检讨会议表单 | 选择上午 / 下午，记录已召开或未召开、时间 / 结论或原因、照片与重新检讨时间 |
| /(tabs)/inbox | 异常待办 | 查看未关闭的异常，进入责任处理 |
| /issue?id=… | 异常详情 | 接单、开始处理、提交复核、退回、跨班交接、补充进展、关闭、分享摘要 |
| /(tabs)/records | 历史记录 | 查看本机保存的点检 / 会议 / 异常记录 |
| /rankings | 完整榜单 | 查看演示车间和执行人完成率 |
| /(tabs)/settings | 我的 / 设置 | 姓名、中文 / 泰文、演示角色、车间、班次；管理员演示可选会议时点 |

## 5. 产品目标与现场设计

### 使用对象与范围

目标现场是泰国工厂，工厂约有 6 个生产车间及生产、物流、设备、质量、工程等职能部门，预期 DM 用户少于 100 人。系统首阶段聚焦：

1. 生产班次开始前或交班窗口内的 4M（人、机、料、法）准备自检。
2. 每天上午和下午各一次的两小时检讨会议记录。这里记录生产状况会议是否召开，不生成每两小时一次的“检查任务”。
3. 检查发现的异常协同：责任队列、接单、处置、跨班交接、复核和关闭。
4. 工厂总览、历史记录、现场照片及主动分享异常摘要到微信等工具。

LOSS 台账不在当前首阶段实现范围。

### 三类岗位视角

正式设计建议保持三类常用角色，并叠加组织范围授权：

| 角色 | 设计职责 |
|---|---|
| 工厂管理员 | 配置组织、人员、班次、4M 模板、会议日程、责任路由；查看全厂 |
| 车间 / 部门负责人 | 查看所属范围、跟进异常、分派 / 复核授权范围内的工作 |
| 执行人 | 完成本人任务、记录现场情况、提报异常、反馈措施和交接 |

当前页面只用本机设置切换 operator / supervisor / admin 来看不同演示界面。它不构成认证、数据隔离或真实授权；正式系统应从登录账号及后端组织权限确定用户范围。

### 4M 班前准备流程

业务对象是“某生产日期、某车间、某目标班次的准备状态”。夜班员工可以在次日白班开始前提交，记录应归属于将被支持的目标白班，而不能单纯按手机拍照时间归到上一班。班次窗口、生产日期、各车间具体模板都应由工厂配置，不能在正式版本中把示例时间写死。

当前表单实现：

- 4M 固定为人员、设备、物料、方法，四类都必须明确选择正常、异常或不适用；空白不算正常。
- 一次提交完成四类，四类共用一张现场证据照。
- 异常必须写问题及对生产的影响，并选择优先级；当前按类别预设责任部门：人员→生产、设备→设备、物料→物流 / 仓库、方法→工程 / 工艺。
- 当前每类仅有通用演示选项；正式检查项目、判定标准、适用车间、照片规则要按各车间纸质标准表配置。
- 当前尚无正式人员目录，责任人也没有账号级接收确认。

目标现场操作应控制为：默认展示当前责任范围及目标班次；正常快速选项尽量少；异常才补充影响范围、受影响产品 / 产线 / 时间、主责岗位与人员、期限、行动；缺料、停机等高风险问题应进入明确的负责人待办并要求接单。异常上报数量不应用来惩罚报告者或直接作为绩效排名。

### 两小时检讨会议流程

每天每个适用车间 / 部门记录上午和下午两个场次。工厂示例时点为上午 10:00 或 10:30、下午 14:00 或 15:00；实际排程以工厂确认的配置为准。

- 已召开：记录实际召开时间、会议结论 / 后续动作、现场照片，可关联尚未关闭的异常。
- 未召开：填写原因、照片和重新检讨时间；目标是形成责任待办并继续追踪。
- 会议记录应让管理者看出哪些车间已开、哪些未开，以及异常有没有带入跟进。

原型中管理员可在四个时间选项中切换；正式应用需要日历与权限配置、服务端计划分母，以及负责人验证会议结论的流程。

### 异常处理与消息协同

异常是独立于点检表的事项，原型已有状态流转：

~~~text
待接单 → 已接单 → 处理中 → 待复核 → 已关闭
                     ↘ 跨班交接 → 接单 / 继续处理
~~~

复核可以关闭，或退回继续处理；每次动作和评论作为时间线更新保留。点检异常需要主责单位、影响、优先级和照片。微信分享当前只是主动分享文字摘要或复制文本，不代表消息送达、责任人已读、已接单或数据已同步。

正式协同应把“系统提醒送达”“责任人确认收到”“责任人接单”区分开。Android 原生推送可走 FCM；iPhone 原生推送需 APNs；两者需由后端或推送服务统一发事件，并以云端记录作为共同状态。浏览器通知不应作为工厂唯一提醒渠道。高风险事项应在应用内待办、原生推送、值班升级和现场班次交接之间有清楚的兜底。

## 6. 数据模型、存储和指标

### 主要模型

领域模型定义在 src/domain/model.ts：

- Settings：本机姓名、演示角色、车间、当前班次、目标班次、语言和会议时点。
- CheckRecord：4M 或会议记录，包含状态、备注、照片 URI、目标班次、日期槽位、创建时间，以及修订 / 关联异常等字段。
- Issue：独立异常事项，包含来源记录、类别、车间、班次、责任部门 / 主责人、优先级、状态、照片、更新历史。
- IssueUpdate：提报、接单、开始处理、送复核、退回、跨班交接、关闭和评论事件。

### 本机保存

AsyncStorage 数据键当前为：

| 键 | 内容 |
|---|---|
| dm:settings:v1 | 本机设置 |
| dm:records:v2 | 当前检查 / 会议记录 |
| dm:records:v1 | 旧记录迁移来源；新结构保存后写入 v2 |
| dm:issues:v1 | 异常事件及处理时间线 |

原生照片被复制到应用文档目录，并只在记录中存本机 URI；网页照片可能以 Data URL 形式保存在本机数据里。清应用数据、换手机或卸载可能导致这些数据 / 照片不可用。当前没有云备份、同步、远程访问或服务器审计。

### 首页完成率与排名

看板可选日 / 周 / 月和 4M / 会议，显示车间 / 部门、执行人的排行。当前数值直接来自 src/domain/demo-rankings.ts，是为评审界面准备的明确演示样例。其计划数也由固定演示逻辑生成，不能用于现场判断。

正式口径需从实际配置的计划任务生成分母：

- 4M 按目标日期、目标班次、适用模板和分配给执行人的计划项计算；重复修订不应多算。
- 会议按排程的上午 / 下午场次计算；未记录要和明确未召开分开显示。
- 无适用计划时显示“未配置 / 无计划”，不能伪装成 0% 后参加排名。
- 待同步记录不应冒充全厂已完成；已提交异常不应减少责任者的诚信分或造成不报告风险的动机。

## 7. 构建、安装与发布路径

### Web 预览

应用本体由 Expo Metro 静态导出到 dist/。顶层 site/ 是另一张静态入口页，显示预览入口和 Android / iPhone 下载按钮。site/config.js 中 androidApk、iosAppStore 当前都为空，因此页面会显示待准备状态，并不会提供真实安装包下载。

- 当前私有静态网页预览：https://dm-daily-management-preview.wnlipeng.chatgpt.site
- GitHub 源码仓库：https://github.com/wlp713/dm-system-app
- GitHub Pages workflow：先装 npm 依赖、类型检查和 Web 导出，再将 site/ 放在发布根目录、dist/ 放在 /app/ 下。
- 之前 GitHub Pages 部署遇到环境保护规则拒绝 feature 分支部署；不能据此声称 GitHub Pages 已成功发布。当前供评审使用的是上方独立的静态网页预览地址。

### Android

仓库现有 GitHub Actions 工作流 .github/workflows/android-apk.yml 由 workflow_dispatch 手动启动。它在云端执行 npm ci、Expo Android prebuild，然后用 Java 17 / Gradle assembleRelease 构建 APK，最后将 APK 作为名为 dm-system-android-demo 的 Actions artifact 保存。工作流没有创建 GitHub Release、上传商店或生成稳定的公众下载链接。

eas.json 另有 preview profile：distribution 为 internal、Android buildType 为 apk。若将来选择 EAS Build，需要设置 Expo/EAS 项目、检查凭据和包名后按 profile 构建；当前 GitHub Actions 工作流本身走 Gradle，不调用 eas build。

手机安装 APK 适合受控内部试用，需按 Android 系统提示允许本次来源安装。正式分发要考虑包签名、升级时签名一致、版本号、下载入口和组织设备政策。APK 链接需要在 site/config.js 配置后，入口页才会显示下载按钮。

### iPhone

Expo 配置已设置 bundleIdentifier 为 com.dm.factory.app，但仓库当前没有 ios/ 原生目录、iOS 构建工作流、签名配置或 iOS 安装链接。app.json 里的 iOS bundle ID 只是应用标识，不等于已经有可安装 IPA。

对于少于百名工厂用户、希望员工点击网页链接后像普通 App 一样安装且不逐台注册设备，建议评估 App Store 非公开链接（Unlisted App）作为长期路线：仍需 Apple Developer 组织账号、App Store Connect 应用记录、正式签名构建、隐私 / 商店材料、App Review 和 Apple 对非公开分发申请的批准。批准后 Apple 生成可直接打开 App Store 的链接；网页按钮指向该链接。它不是跳过审核的安装包直链。

短期试点可用 TestFlight，但员工通常还需要安装 TestFlight 并接受邀请 / 测试链接；外部测试构建需遵守 Apple 的 Beta App Review 及有效期限等要求，不适合作为长期正式安装承诺。EAS iOS internal / ad hoc 分发通常要先登记设备 UDID，和“员工点一个链接即可安装”目标不相符。

因此当前 iPhone 按钮没有一个可配置的 IPA 直链。要正式实现 iPhone 安装，先取得组织 Apple Developer / App Store Connect 账号及负责人配合，然后由 EAS Build 生成 iOS Store 构建，提交 App Store 审核，并申请非公开 App 分发。未完成这些条件之前，应在页面明示“尚未发布”，不能让按钮指向伪造或不可安装的包。

## 8. 推送、Firebase 和生产化缺口

当前没有 Firebase 配置、客户端 SDK、项目 ID、Firestore 规则、Storage 规则、Cloud Functions、用户账号、身份登录、APNs / FCM 凭据或推送服务。项目只依赖 localRepository，因此 Android 和 iOS 的本机记录也没有互通。

建议后续按依赖顺序落地：

1. 工厂确认真实组织目录、目标班次 / 生产日期规则、各车间纸质 4M 项、会议排程和责任路由；确认执行人可见范围及主责确认流程。
2. 建立 Firebase 项目与 Auth 用户 / 组织目录；在服务端强制验证组织与角色范围，配置 Firestore 和 Storage 安全规则。不要把客户端隐藏按钮当权限保护。
3. 为 4M 任务、会议、异常、事件时间线、计划分母和照片定义云端 schema；照片压缩上传，记录使用云端对象路径。
4. 实现离线队列、待同步状态、重试、重复提交防护、修订审计与跨设备冲突处理；线上指标只基于服务端确认的数据。
5. 实现应用内收件箱、责任人接单、通知送达 / 已读 / 已接单状态、超时升级及跨班交接。
6. 注册 Android FCM 和 iOS APNs 凭据，决定使用 Expo Push Service 还是自建推送发送端，完成设备 token 注册、失效清理、权限说明及真实双机试点。
7. 取得 Apple 账号后做 iOS EAS Store build 和 TestFlight 试点，随后申请非公开 App Store 分发；配置稳定安装链接。Android 按最终渠道配置已签名下载包或 Google Play 企业测试。
8. 用泰国现场人员逐页校对泰文、图标和异常处理词汇，并在真实弱网设备、换班、重复提交、照片上传失败和跨部门责任场景验收。

数据库、推送、组织权限与安装发布相互有关联，但不需要一次性重写全部页面。建议保留当前目录分层，把 repository 抽象实现为 local / Firebase 适配器，逐步把已验证流程迁移到线上服务。

## 9. 当前版本的依据文件

按理解当前实现的优先顺序：

1. 本说明：文件位置、运行方式、实现边界与交接要点。
2. docs/DM-PROTOTYPE-v0.4.md：最贴近现有代码的原型逻辑。
3. docs/DM-OPERATING-SYSTEM-v1.md：现场运行、权限、跨班协同、指标和上线方案，包含当前未实现的目标。
4. docs/DM-PRODUCT-LOGIC-v0.3.md：较完整的产品逻辑草案，不能当作已实现功能清单。
5. docs/DM-PRODUCT-ARCHITECTURE.md：早期架构初稿，个别页面和行为描述落后于当前代码。

用户提供的外部参考文件：

- C:\Users\19777\WorkBuddy AI\2026-10-17-11-28-41\outputs\DM日常管理APP_产品分析与优化方案.pdf
- C:\Users\19777\WorkBuddy AI\2026-10-17-11-28-41\outputs\DM-App_开发任务书_v2.md

这些附件位于当前代码仓库之外。另一个 AI 平台若没有本机文件权限，需要用户一并上传附件；当前产品设计已经把其中对现场闭环、双语、少角色、指标可信度和分阶段开发的建议整理进上述项目文档。

## 10. 提交给下一位 AI 的任务说明

请在 GitHub 仓库 https://github.com/wlp713/dm-system-app 中继续开发。先查看当前分支 feature/field-ready-workflow 和提交 3e47cea8678bdd53fc732dc7f9afeed25882641c，再阅读本交接说明、DM-PROTOTYPE-v0.4.md、DM-OPERATING-SYSTEM-v1.md 和用户提供的产品分析 PDF / 开发任务书。

保持项目以手机优先的 Expo / React Native / TypeScript 结构开发。以工厂实际班次、车间模板和责任闭环为业务基础，先确保每个页面能由现场人员用泰文、少量操作完成。任何阶段都要清楚标记演示数据；不可声称 Firebase、跨设备同步、正式推送或 iPhone 安装已完成，除非配置、构建和真机验收确实已经通过。修改 Expo 或 React Native 接口前先阅读与 SDK 58 匹配的官方文档。新功能按小步交付，并说明变更、验证结果和仍需工厂 / Apple 账号提供的输入。

当前分支存在一项本机 app.json 未提交改动，只是在文件末尾多一个空行；该空白改动未包含在上方提交中。处理 Git 时应先检查工作区并保留它，避免把它误判为产品功能或与新变更混在一起。

## 11. 官方技术参考

- [Expo SDK 58 版本说明](https://docs.expo.dev/versions/v58.0.0/)
- [Expo SDK 58 Expo Router](https://docs.expo.dev/versions/v58.0.0/sdk/router/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Android APK 构建与安装](https://docs.expo.dev/build-reference/apk/)
- [Expo EAS 内部分发说明](https://docs.expo.dev/build/internal-distribution/)
- [Expo TestFlight 分发](https://docs.expo.dev/submit/testflight/)
- [Apple App Store 非公开链接分发](https://developer.apple.com/support/unlisted-app-distribution/)

这些链接说明的是平台构建和分发规则；是否能发布仍取决于组织账号、签名凭据、工厂信息、商店审查及实际设备验证。
