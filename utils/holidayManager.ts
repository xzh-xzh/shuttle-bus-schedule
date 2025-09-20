import type { HolidayConfig, HolidayAdjustment, ScheduleType } from '../types';

// 默认的2025年节假日调休数据
const DEFAULT_2025_HOLIDAYS: HolidayAdjustment[] = [
  // 元旦
  { date: '2025-01-01', type: 'holiday', name: '元旦' },
  
  // 春节
  { date: '2025-01-28', type: 'holiday', name: '春节前夕' },
  { date: '2025-01-29', type: 'holiday', name: '春节' },
  { date: '2025-01-30', type: 'holiday', name: '春节' },
  { date: '2025-01-31', type: 'holiday', name: '春节' },
  { date: '2025-02-01', type: 'holiday', name: '春节' },
  { date: '2025-02-02', type: 'holiday', name: '春节' },
  { date: '2025-02-03', type: 'holiday', name: '春节' },
  { date: '2025-02-04', type: 'holiday', name: '春节' },
  // 春节调休
  { date: '2025-01-26', type: 'workday', name: '春节调休', description: '周日上班' },
  { date: '2025-02-08', type: 'workday', name: '春节调休', description: '周六上班' },
  
  // 清明节
  { date: '2025-04-05', type: 'holiday', name: '清明节' },
  { date: '2025-04-06', type: 'holiday', name: '清明节' },
  { date: '2025-04-07', type: 'holiday', name: '清明节' },
  
  // 劳动节
  { date: '2025-05-01', type: 'holiday', name: '劳动节' },
  { date: '2025-05-02', type: 'holiday', name: '劳动节' },
  { date: '2025-05-03', type: 'holiday', name: '劳动节' },
  { date: '2025-05-04', type: 'holiday', name: '劳动节' },
  { date: '2025-05-05', type: 'holiday', name: '劳动节' },
  // 劳动节调休
  { date: '2025-04-27', type: 'workday', name: '劳动节调休', description: '周日上班' },
  
  // 端午节
  { date: '2025-05-31', type: 'holiday', name: '端午节' },
  { date: '2025-06-02', type: 'holiday', name: '端午节' },
  // 端午节调休
  { date: '2025-06-01', type: 'workday', name: '端午节调休', description: '周日上班' },
  
  // 中秋节
  { date: '2025-10-06', type: 'holiday', name: '中秋节' },
  
  // 国庆节
  { date: '2025-10-01', type: 'holiday', name: '国庆节' },
  { date: '2025-10-02', type: 'holiday', name: '国庆节' },
  { date: '2025-10-03', type: 'holiday', name: '国庆节' },
  { date: '2025-10-04', type: 'holiday', name: '国庆节' },
  { date: '2025-10-05', type: 'holiday', name: '国庆节' },
  { date: '2025-10-07', type: 'holiday', name: '国庆节' },
  { date: '2025-10-08', type: 'holiday', name: '国庆节' },
  // 国庆节调休
  { date: '2025-09-28', type: 'workday', name: '国庆节调休', description: '周日上班' },
  { date: '2025-10-11', type: 'workday', name: '国庆节调休', description: '周六上班' },
];

const STORAGE_KEY = 'shuttle_holiday_config';

export class HolidayManager {
  private config: HolidayConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  // 从本地存储加载配置
  private loadConfig(): HolidayConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 验证数据结构
        if (parsed.year && parsed.adjustments && Array.isArray(parsed.adjustments)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load holiday config from storage:', error);
    }

    // 返回默认配置
    return {
      year: 2025,
      adjustments: DEFAULT_2025_HOLIDAYS,
      lastUpdated: new Date().toISOString()
    };
  }

  // 保存配置到本地存储
  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save holiday config:', error);
    }
  }

  // 获取当前配置
  getConfig(): HolidayConfig {
    return { ...this.config };
  }

  // 更新整个配置
  updateConfig(newConfig: HolidayConfig): void {
    this.config = {
      ...newConfig,
      lastUpdated: new Date().toISOString()
    };
    this.saveConfig();
  }

  // 添加或更新单个节假日调整
  addOrUpdateAdjustment(adjustment: HolidayAdjustment): void {
    const existingIndex = this.config.adjustments.findIndex(
      adj => adj.date === adjustment.date
    );

    if (existingIndex >= 0) {
      this.config.adjustments[existingIndex] = adjustment;
    } else {
      this.config.adjustments.push(adjustment);
    }

    // 按日期排序
    this.config.adjustments.sort((a, b) => a.date.localeCompare(b.date));
    this.config.lastUpdated = new Date().toISOString();
    this.saveConfig();
  }

  // 删除节假日调整
  removeAdjustment(date: string): void {
    this.config.adjustments = this.config.adjustments.filter(
      adj => adj.date !== date
    );
    this.config.lastUpdated = new Date().toISOString();
    this.saveConfig();
  }

  // 根据日期获取时刻表类型
  getScheduleType(date: Date): ScheduleType {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 查找是否有特殊调整
    const adjustment = this.config.adjustments.find(adj => adj.date === dateStr);
    if (adjustment) {
      return adjustment.type === 'holiday' ? 'holiday' : 'weekday';
    }

    // 默认逻辑：周末为节假日
    const dayOfWeek = date.getDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? 'holiday' : 'weekday';
  }

  // 获取指定日期的节假日信息
  getHolidayInfo(date: Date): HolidayAdjustment | null {
    const dateStr = date.toISOString().split('T')[0];
    return this.config.adjustments.find(adj => adj.date === dateStr) || null;
  }

  // 导出配置为JSON
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // 从JSON导入配置
  importConfig(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      
      // 验证数据结构
      if (!imported.year || !imported.adjustments || !Array.isArray(imported.adjustments)) {
        throw new Error('Invalid config structure');
      }

      // 验证每个调整项
      for (const adj of imported.adjustments) {
        if (!adj.date || !adj.type || !adj.name) {
          throw new Error('Invalid adjustment item');
        }
        if (!['holiday', 'workday'].includes(adj.type)) {
          throw new Error('Invalid adjustment type');
        }
      }

      this.updateConfig(imported);
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }

  // 重置为默认配置
  resetToDefault(): void {
    this.config = {
      year: 2025,
      adjustments: [...DEFAULT_2025_HOLIDAYS],
      lastUpdated: new Date().toISOString()
    };
    this.saveConfig();
  }
}

// 全局实例
export const holidayManager = new HolidayManager();