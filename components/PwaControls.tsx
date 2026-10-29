import React, { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const WebPwaControls: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [cached, setCached] = useState(false);
  const [cacheError, setCacheError] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && navigator.standalone === true)
  );
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      registrationRef.current = registration;
      if (registration?.active?.state === 'activated') setCached(true);
    },
    onRegisterError(error) {
      console.warn('Offline cache registration failed:', error);
      setCacheError(true);
    }
  });

  useEffect(() => {
    const checkForUpdates = () => {
      if (navigator.onLine) registrationRef.current?.update().catch(() => {});
    };
    const onOnline = () => { setOnline(true); checkForUpdates(); };
    const onOffline = () => setOnline(false);
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('focus', checkForUpdates);
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('focus', checkForUpdates);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
    } catch (error) {
      console.warn('Install prompt unavailable:', error);
    } finally {
      setInstallPrompt(null);
    }
  };

  const update = async () => {
    setUpdateError(false);
    try { await updateServiceWorker(true); }
    catch { setUpdateError(true); }
  };
  const ready = offlineReady || cached;

  return (
    <section aria-label="离线使用与安装" className="mx-auto mt-6 max-w-md rounded-xl border border-slate-700/70 bg-slate-800/50 px-4 py-3 text-center text-xs text-slate-400">
      <p role="status" aria-live="polite" className={ready ? 'text-cyan-400' : ''}>
        {ready ? (online ? '已缓存，可离线查询' : '离线查询中') :
          cacheError ? '离线缓存未完成，请联网刷新重试' :
          online ? '正在缓存离线数据…' : '首次使用需要联网缓存'}
      </p>
      {needRefresh && (
        <div className="mt-3">
          <p>有新版本，可更新时刻表与应用。</p>
          <button type="button" onClick={update} disabled={!online} className="mt-2 rounded-lg bg-cyan-600 px-4 py-2 text-white disabled:opacity-50">
            {online ? '更新应用' : '联网后更新'}
          </button>
          {updateError && <p role="alert" className="mt-2">更新失败，请联网后重试。</p>}
        </div>
      )}
      {!installed && (
        <>
          {installPrompt && <button type="button" onClick={install} className="mt-3 rounded-lg bg-slate-700 px-4 py-2 text-slate-200">安装到手机桌面</button>}
          <details className="mt-2">
            <summary className="cursor-pointer py-1 text-slate-300">添加到手机桌面</summary>
            <div className="mt-2 space-y-2 text-left leading-relaxed">
              <p>Android：用 Chrome 或 Edge 打开，在浏览器菜单选择“安装应用”或“添加到主屏幕”。</p>
              <p>iPhone：用 Safari 打开，点击“分享”→“添加到主屏幕”。</p>
              <p>首次联网打开，等到显示“已缓存，可离线查询”后即可断网使用。清除浏览器数据后，需要重新联网缓存。</p>
            </div>
          </details>
        </>
      )}
    </section>
  );
};

export const PwaControls: React.FC = () => {
  const web = import.meta.env.PROD && /^https?:$/.test(location.protocol) &&
    !window.Capacitor && !window.electronAPI && !('__TAURI_INTERNALS__' in window);
  return web && 'serviceWorker' in navigator ? <WebPwaControls /> : null;
};
