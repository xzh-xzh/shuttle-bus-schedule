# 📚 GitHub 上传指南

## 🚀 快速上传到 GitHub

### 1. 准备工作

#### 安装 Git（如果尚未安装）
```bash
# 下载并安装 Git for Windows
# https://git-scm.com/download/win
```

#### 配置 Git 用户信息
```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱@example.com"
```

### 2. 在 GitHub 上创建仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `shuttle-bus-schedule` 或 `接驳车查询`
   - **Description**: `🚌 现代化跨平台接驳车时刻查询应用 - 支持Web、Windows桌面、Android移动端`
   - **Visibility**: 选择 Public 或 Private
   - **不要**勾选 "Add a README file"（我们已经有了）
   - **不要**勾选 "Add .gitignore"（我们已经配置了）

### 3. 初始化本地仓库并上传

在项目根目录打开终端，执行以下命令：

```bash
# 初始化 Git 仓库
git init

# 添加远程仓库（替换为您的 GitHub 仓库地址）
git remote add origin https://github.com/您的用户名/shuttle-bus-schedule.git

# 添加所有文件到暂存区
git add .

# 提交代码
git commit -m "🎉 Initial commit: 跨平台接驳车查询应用

✨ 特性:
- 🌐 支持 Web、Windows桌面、Android 三端
- ⚡ Tauri 桌面版仅 8.15MB（比 Electron 小 90%）
- 🎯 实时查询最近班车信息
- 📅 智能节假日识别
- 🔄 循环班车支持
- 📱 响应式现代化 UI

🛠️ 技术栈:
- React 19.1.1 + TypeScript + Vite
- Tauri 2.8.x (桌面端)
- Capacitor 7.4.3 (移动端)
- Tailwind CSS"

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 4. 验证上传结果

上传完成后，您可以在 GitHub 仓库页面看到：

- ✅ 完整的项目代码
- ✅ README.md 显示项目介绍
- ✅ release/ 文件夹包含发布版本
- ✅ 完整的文档体系

## 📋 上传前检查清单

### ✅ 必须检查的项目

- [ ] `.gitignore` 文件已配置（✅ 已完成）
- [ ] `README.md` 文件完整（✅ 已完成）
- [ ] 敏感信息已移除（API密钥、密码等）
- [ ] 大文件已忽略（构建产物、安装包等）
- [ ] 项目可以正常构建和运行

### 🔍 文件大小检查

当前项目结构（忽略后）：
```
接驳车查询/
├── 源代码文件 (~2MB)
├── 配置文件 (~100KB)
├── 文档文件 (~20KB)
└── release/ (~15MB) # 可选择忽略
```

### ⚠️ 注意事项

1. **Release 文件夹**: 
   - 包含 15MB 的发布版本文件
   - 如果仓库大小有限制，可以在 `.gitignore` 中取消注释 `# release/`

2. **构建产物**:
   - `src-tauri/target/` 已被忽略（可能超过 1GB）
   - `android/.gradle/` 已被忽略
   - `node_modules/` 已被忽略

3. **环境变量**:
   - `.env.local` 已被忽略
   - 确保没有硬编码的敏感信息

## 🔄 后续维护

### 日常提交流程
```bash
# 添加修改的文件
git add .

# 提交修改
git commit -m "✨ 添加新功能: 描述您的修改"

# 推送到 GitHub
git push
```

### 版本标签
```bash
# 创建版本标签
git tag -a v2.0.0 -m "🚀 Release v2.0.0: Tauri重构版"

# 推送标签
git push origin v2.0.0
```

### 分支管理
```bash
# 创建开发分支
git checkout -b develop

# 切换分支
git checkout main
git checkout develop

# 合并分支
git checkout main
git merge develop
```

## 🎯 推荐的仓库设置

### GitHub 仓库描述
```
🚌 现代化跨平台接驳车时刻查询应用 - 支持Web、Windows桌面、Android移动端。基于React + Tauri + Capacitor，体积小巧，性能优异。
```

### Topics 标签
```
react, typescript, tauri, capacitor, cross-platform, desktop-app, mobile-app, bus-schedule, shuttle-bus, vite, tailwindcss, rust
```

### README 徽章（可选）
可以在 README.md 顶部添加：
```markdown
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Windows%20%7C%20Android-blue)
![React](https://img.shields.io/badge/React-19.1.1-61dafb)
![Tauri](https://img.shields.io/badge/Tauri-2.8.x-ffc131)
![License](https://img.shields.io/badge/license-MIT-green)
```

---

🎉 **恭喜！** 您的项目即将在 GitHub 上展示给全世界！这是一个优秀的跨平台应用案例。