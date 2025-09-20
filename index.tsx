
import React from 'react';
import ReactDOM from 'react-dom/client';

// 平台检测函数
const detectPlatform = (): 'mobile' | 'desktop' => {
  // 检查是否在 Capacitor 环境中（移动端）
  if (window.Capacitor) {
    console.log('检测到 Capacitor 环境，使用移动端布局');
    return 'mobile';
  }
  
  // 检查是否在 Electron 环境中（桌面端）
  if (window.electronAPI) {
    console.log('检测到 Electron 环境，使用桌面端布局');
    return 'desktop';
  }
  
  // 检查URL参数强制指定平台
  const urlParams = new URLSearchParams(window.location.search);
  const forcePlatform = urlParams.get('platform');
  if (forcePlatform === 'mobile' || forcePlatform === 'desktop') {
    console.log(`URL参数强制指定平台: ${forcePlatform}`);
    return forcePlatform as 'mobile' | 'desktop';
  }
  
  // 基于屏幕尺寸和用户代理检测
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth <= 1024; // 提高阈值到1024px
  
  const platform = isMobile ? 'mobile' : 'desktop';
  console.log(`平台检测结果: ${platform} (窗口宽度: ${window.innerWidth}px)`);
  
  return platform;
};

// 动态导入对应的 App 组件
const loadApp = async () => {
  const platform = detectPlatform();
  
  let AppComponent;
  if (platform === 'mobile') {
    const module = await import('./App.mobile');
    AppComponent = module.default;
  } else {
    const module = await import('./App.desktop');
    AppComponent = module.default;
  }
  
  return AppComponent;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// 异步加载并渲染对应的 App 组件
loadApp().then((AppComponent) => {
  root.render(
    <React.StrictMode>
      <AppComponent />
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Failed to load app component:', error);
  // 降级到默认的 App 组件
  import('./App').then((module) => {
    const DefaultApp = module.default;
    root.render(
      <React.StrictMode>
        <DefaultApp />
      </React.StrictMode>
    );
  });
});
