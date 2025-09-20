# 🚌 接驳车实时查询系统

一个现代化的跨平台接驳车时刻查询应用，支持Web、桌面和移动端。

## ✨ 特性

- 🌐 **跨平台支持**: Web、Windows桌面、Android移动端
- ⚡ **轻量高效**: Tauri桌面版仅8.15MB（比Electron小90%）
- 🎯 **实时查询**: 智能显示当前时间最近的班车信息
- 📅 **节假日智能**: 自动识别工作日/节假日，显示对应时刻表
- 🔄 **循环班车**: 支持循环发车时间段的智能显示
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🎨 **现代UI**: 基于React + TypeScript的现代化界面

## 🚀 快速开始

### 🎯 直接使用（推荐）

如果您只想使用应用，无需安装开发环境：

1. **Windows用户**: 下载并运行 `release/接驳车实时查询-Tauri.exe`
2. **Android用户**: 安装 `release/接驳车查询.apk`
3. **详细说明**: 查看 `release/版本说明.md`

### 🛠️ 开发环境

如果您想参与开发或自定义构建：

#### 环境要求

- Node.js 18+
- Rust (用于Tauri桌面版)
- Android Studio (用于Android版本)

#### 安装依赖

```bash
npm install
```

#### 开发模式

```bash
# Web版本开发
npm run dev

# Tauri桌面版开发
npm run tauri-dev

# Android版本开发
npm run android-dev
```

## 📦 构建部署

### Web版本
```bash
npm run build
# 输出到 dist/ 目录
```

### Tauri桌面版
```bash
npm run build-tauri
# 输出到 src-tauri/target/release/
```

### Android版本
```bash
npm run build-android
# 输出APK文件
```

## 🏗️ 技术栈

### 前端核心
- **React 19.1.1** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite 6.2.0** - 现代化构建工具
- **Tailwind CSS** - 实用优先的CSS框架

### 跨平台方案
- **Tauri 2.8.x** - 轻量级桌面应用框架（Rust + WebView）
- **Capacitor 7.4.3** - 移动端跨平台框架

### 开发工具
- **ESLint + Prettier** - 代码质量和格式化
- **TypeScript** - 静态类型检查

## 📱 应用版本

| 平台 | 文件名 | 大小 | 位置 | 状态 |
|------|--------|------|------|------|
| Web | dist/ | 241.79 KB | `dist/` | ✅ 最新 |
| Windows桌面 | 接驳车实时查询-Tauri.exe | 8.15 MB | `release/` | ✅ 最新 |
| Android | 接驳车查询.apk | 7.02 MB | `release/` | ✅ 最新 |

### 📦 发布版本下载

所有发布版本已整理到 `release/` 文件夹中：

```
release/
├── 接驳车实时查询-Tauri.exe    # Windows桌面版 (8.15 MB)
├── 接驳车查询.apk              # Android移动版 (7.02 MB)
└── 版本说明.md                 # 详细版本信息和安装说明
```

- **Windows用户**: 直接运行 `release/接驳车实时查询-Tauri.exe`，无需安装
- **Android用户**: 安装 `release/接驳车查询.apk`，支持Android 7.0+
- **Web用户**: 运行 `npm run build` 后访问 `dist/index.html`

## 🎯 核心功能

### 智能时刻查询
- 自动显示当前时间最近的班车
- 支持工作日/节假日时刻表切换
- 循环班车时间段智能处理

### 节假日管理
- 内置2025年完整节假日数据
- 支持自定义节假日和调休安排
- 可视化节假日管理界面

### 用户体验
- 实时倒计时显示
- 响应式设计适配各种设备
- 现代化的用户界面

## 📂 项目结构

```
接驳车查询/
├── src/                    # React源代码
├── src-tauri/             # Tauri桌面应用配置
├── android/               # Android应用配置
├── release/               # 📦 发布版本文件夹
│   ├── 接驳车实时查询-Tauri.exe  # Windows桌面版
│   ├── 接驳车查询.apk            # Android移动版
│   └── 版本说明.md              # 版本说明文档
├── dist/                  # Web构建输出
├── components/            # React组件
├── utils/                 # 工具函数
├── assets/               # 静态资源
├── package.json          # 项目配置
├── 打包说明.md            # 构建和打包指南
├── 部署指南.md            # 生产环境部署指南
└── README.md            # 项目文档
```

## 🔧 开发指南

### 添加新功能
1. 在 `components/` 中创建新组件
2. 在 `utils/` 中添加工具函数
3. 更新类型定义在 `types.ts`

### 构建优化
- Web版本使用Vite进行优化打包
- Tauri版本自动进行Rust编译优化
- Android版本通过Capacitor优化

## 📄 许可证

MIT License

## 📚 相关文档

- 📦 [打包说明.md](./打包说明.md) - 详细的构建和打包指南
- 🚀 [部署指南.md](./部署指南.md) - 生产环境部署指南  
- 📋 [release/版本说明.md](./release/版本说明.md) - 发布版本详细信息

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

🎉 **项目亮点**: 从82MB的Electron应用优化到8.15MB的Tauri应用，体积减少90%，同时保持完整功能和跨平台支持！
