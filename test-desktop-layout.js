// 测试桌面端应用布局的脚本
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动桌面端应用测试...');

// 启动桌面应用
const appPath = path.join(__dirname, 'release', '接驳车时刻查询-win32-x64', '接驳车时刻查询.exe');
console.log(`📱 应用路径: ${appPath}`);

const app = spawn(appPath, [], {
  detached: true,
  stdio: 'ignore'
});

app.unref();

console.log('✅ 桌面应用已启动！');
console.log('');
console.log('🔍 请检查以下桌面端布局特性：');
console.log('  ✓ 顶部显示当前时间和日期');
console.log('  ✓ 左上角有设置按钮');
console.log('  ✓ 点击设置按钮弹出控制面板');
console.log('  ✓ 控制面板有"关闭"按钮');
console.log('  ✓ 查询非当前时间时显示查询时间信息');
console.log('');
console.log('📋 应用特性：');
console.log('  • 平台检测: Electron环境自动识别为桌面端');
console.log('  • 布局文件: App.desktop.tsx');
console.log('  • 窗口大小: 1200x800 (可调整)');
console.log('  • 开发者工具: 生产环境已禁用');
console.log('');
console.log('🎯 测试完成后，可以关闭应用窗口。');