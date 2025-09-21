*本应用使用 Gemini Code Assistant 和 Trae 开发*

# 🚌 接驳车实时查询系统

东南大学兰台公寓接驳车实时查询应用，支持桌面和移动端。

## ✨ 特性

- 🌐 **跨平台支持**: Web、Windows桌面、Android移动端
- ⚡ **轻量高效**: Tauri桌面版仅8.15MB（比Electron小90%）
- 🎯 **实时查询**: 智能显示当前时间最近的班车信息
- 📅 **节假日智能**: 自动识别工作日/节假日，显示对应时刻表
- 🔄 **循环班车**: 支持循环发车时间段的智能显示
- 📱 **响应式设计**: 适配各种屏幕尺寸

## 📦 下载使用

[![最新版本](https://img.shields.io/github/v/release/xzh-xzh/shuttle-bus-schedule?style=for-the-badge&logo=github)](https://github.com/xzh-xzh/shuttle-bus-schedule/releases/latest)

| 平台 | 文件 | 大小 | 下载 |
|------|------|------|------|
| 🖥️ Windows | 接驳车实时查询.exe | 8.15 MB | [GitHub Release](https://github.com/xzh-xzh/shuttle-bus-schedule/releases/download/v1.0/shuttle-bus-schedule.exe)  |
| 📱 Android | 接驳车查询.apk | 7.02 MB | [GitHub Release](https://github.com/xzh-xzh/shuttle-bus-schedule/releases/download/v1.0/shuttle-bus-schedule.apk)  |

**使用说明**：
- Windows：下载exe文件，双击运行，无需安装
- Android：下载apk文件，启用"未知来源"后安装，支持Android 7.0+

## 🚀 开发

### 环境要求
- Node.js 18+
- Rust（桌面版）
- Android Studio（移动版）

### 快速开始
```bash
# 安装依赖
npm install

# Web开发
npm run dev

# 桌面版开发
npm run tauri-dev

# Android开发
npm run android-dev
```

### 构建
```bash
# Web版本
npm run build

# 桌面版
npm run build-tauri

# Android版
npm run build-android
```

## 🏗️ 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **构建**: Vite
- **桌面**: Tauri (Rust + WebView)
- **移动**: Capacitor

## 📂 项目结构

```
接驳车查询/
├── src/                    # React源代码
├── components/             # React组件
├── utils/                  # 工具函数
├── src-tauri/             # Tauri桌面应用
├── android/               # Android应用
├── release/               # 发布版本
└── dist/                  # Web构建输出
```

## 📚 文档

- [打包说明](./打包说明.md) - 构建和打包指南
- [部署指南](./部署指南.md) - 生产环境部署
- [版本说明](./release/版本说明.md) - 发布版本信息

