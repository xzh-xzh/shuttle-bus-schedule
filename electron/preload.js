const { contextBridge } = require('electron');

// 向渲染进程暴露API
contextBridge.exposeInMainWorld('electronAPI', {
  platform: 'desktop',
  isElectron: true,
  version: process.versions.electron
});

// 确保平台检测能够识别Electron环境
window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload script loaded - Desktop platform detected');
});