import React, { useState, useEffect } from 'react';
import { holidayManager } from '../utils/holidayManager';
import type { HolidayAdjustment, HolidayConfig } from '../types';

interface HolidayManagerProps {
  onClose: () => void;
  onConfigChange: () => void;
}

export const HolidayManagerComponent: React.FC<HolidayManagerProps> = ({
  onClose,
  onConfigChange
}) => {
  const [config, setConfig] = useState<HolidayConfig>(holidayManager.getConfig());
  const [newAdjustment, setNewAdjustment] = useState<Partial<HolidayAdjustment>>({
    date: '',
    type: 'holiday',
    name: '',
    description: ''
  });
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setConfig(holidayManager.getConfig());
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddAdjustment = () => {
    if (!newAdjustment.date || !newAdjustment.name) {
      showMessage('error', '请填写日期和名称');
      return;
    }

    const adjustment: HolidayAdjustment = {
      date: newAdjustment.date!,
      type: newAdjustment.type as 'holiday' | 'workday',
      name: newAdjustment.name!,
      description: newAdjustment.description || undefined
    };

    holidayManager.addOrUpdateAdjustment(adjustment);
    setConfig(holidayManager.getConfig());
    setNewAdjustment({ date: '', type: 'holiday', name: '', description: '' });
    showMessage('success', '调整项添加成功');
    onConfigChange();
  };

  const handleDeleteAdjustment = (date: string) => {
    holidayManager.removeAdjustment(date);
    setConfig(holidayManager.getConfig());
    showMessage('success', '调整项删除成功');
    onConfigChange();
  };

  const handleExport = () => {
    const exported = holidayManager.exportConfig();
    navigator.clipboard.writeText(exported).then(() => {
      showMessage('success', '配置已复制到剪贴板');
    }).catch(() => {
      // 如果剪贴板API不可用，创建下载链接
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `holiday-config-${config.year}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('success', '配置已下载');
    });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      showMessage('error', '请输入配置数据');
      return;
    }

    const success = holidayManager.importConfig(importText);
    if (success) {
      setConfig(holidayManager.getConfig());
      setImportText('');
      setShowImport(false);
      showMessage('success', '导入成功');
      onConfigChange();
    } else {
      showMessage('error', '导入失败，请检查数据格式');
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认配置吗？这将清除所有自定义设置。')) {
      holidayManager.resetToDefault();
      setConfig(holidayManager.getConfig());
      showMessage('success', '已重置为默认配置');
      onConfigChange();
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">节假日调休管理</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-slate-400 mt-2">
            管理 {config.year} 年的节假日和调休安排
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/50 text-green-300 border border-green-700' 
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 添加新调整 */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">添加节假日调整</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">日期</label>
                <input
                  type="date"
                  value={newAdjustment.date}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, date: e.target.value })}
                  className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">类型</label>
                <select
                  value={newAdjustment.type}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, type: e.target.value as 'holiday' | 'workday' })}
                  className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-white"
                >
                  <option value="holiday">节假日</option>
                  <option value="workday">工作日</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">名称</label>
                <input
                  type="text"
                  value={newAdjustment.name}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, name: e.target.value })}
                  placeholder="如：春节、调休等"
                  className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">说明</label>
                <input
                  type="text"
                  value={newAdjustment.description}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, description: e.target.value })}
                  placeholder="可选"
                  className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-white placeholder-slate-400"
                />
              </div>
            </div>
            <button
              onClick={handleAddAdjustment}
              className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              添加
            </button>
          </div>

          {/* 当前调整列表 */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              当前调整 ({config.adjustments.length} 项)
            </h3>
            <div className="max-h-60 overflow-y-auto">
              {config.adjustments.length === 0 ? (
                <p className="text-slate-400 text-center py-4">暂无调整</p>
              ) : (
                <div className="space-y-2">
                  {config.adjustments.map((adj, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-600/50 p-3 rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="text-white font-mono">{adj.date}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            adj.type === 'holiday' 
                              ? 'bg-orange-900/50 text-orange-300' 
                              : 'bg-blue-900/50 text-blue-300'
                          }`}>
                            {adj.type === 'holiday' ? '节假日' : '工作日'}
                          </span>
                          <span className="text-slate-300">{adj.name}</span>
                          {adj.description && (
                            <span className="text-slate-400 text-sm">({adj.description})</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAdjustment(adj.date)}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 导入导出 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">数据管理</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                导出配置
              </button>
              <button
                onClick={() => setShowImport(!showImport)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                导入配置
              </button>
              <button
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                重置为默认
              </button>
            </div>

            {showImport && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    从文件导入
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-600 file:text-white hover:file:bg-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    或粘贴JSON配置
                  </label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="粘贴配置JSON..."
                    className="w-full h-32 bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-white placeholder-slate-400 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleImport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    确认导入
                  </button>
                  <button
                    onClick={() => {
                      setShowImport(false);
                      setImportText('');
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <p className="text-slate-400 text-sm">
            最后更新：{new Date(config.lastUpdated).toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
};