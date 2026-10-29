import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react(), VitePWA({
        registerType: 'prompt',
        injectRegister: null,
        includeManifestIcons: false,
        manifest: {
          id: './',
          name: '接驳车实时查询',
          short_name: '接驳车查询',
          description: '东南大学兰台公寓接驳车时刻表，支持离线查询。',
          lang: 'zh-CN',
          start_url: './',
          scope: './',
          display: 'standalone',
          background_color: '#0f172a',
          theme_color: '#0f172a',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true
        }
      })],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      base: './', // 重要：设置相对路径，适配Electron
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            manualChunks: undefined
          }
        }
      },
      server: {
        port: 5173,
        strictPort: true
      }
    };
});
