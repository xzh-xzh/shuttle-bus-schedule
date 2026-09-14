import presetJson from '../data/holidays-2026-2027.json';
import type {
  HolidayAdjustment,
  HolidayConfig,
  HolidayPreset,
  HolidayRule,
  ScheduleType
} from '../types';
import { formatLocalDate, isLocalDateString, parseLocalDate } from './dateUtils';

const STORAGE_KEY = 'shuttle_holiday_config_v2';
const preset = presetJson as HolidayPreset;

const isAdjustment = (value: unknown): value is HolidayAdjustment => {
  if (!value || typeof value !== 'object') return false;
  const adjustment = value as Partial<HolidayAdjustment>;
  return isLocalDateString(adjustment.date) &&
    (adjustment.type === 'holiday' || adjustment.type === 'workday') &&
    typeof adjustment.name === 'string' && adjustment.name.trim().length > 0 &&
    (adjustment.description === undefined || typeof adjustment.description === 'string');
};

const validateRule = (rule: HolidayRule): void => {
  const start = parseLocalDate(rule.startDate);
  const end = parseLocalDate(rule.endDate ?? rule.startDate);
  if (!start || !end || end < start) {
    throw new Error(`Invalid holiday date range: ${rule.startDate} - ${rule.endDate ?? rule.startDate}`);
  }
  if (rule.type !== 'holiday' && rule.type !== 'workday') {
    throw new Error(`Invalid schedule type for ${rule.startDate}`);
  }
  if (!rule.name.trim()) {
    throw new Error(`Missing holiday name for ${rule.startDate}`);
  }
};

const expandPresetRules = (rules: HolidayRule[]): HolidayAdjustment[] => {
  const byDate = new Map<string, HolidayAdjustment>();

  for (const rule of rules) {
    validateRule(rule);
    const cursor = parseLocalDate(rule.startDate)!;
    const end = parseLocalDate(rule.endDate ?? rule.startDate)!;

    while (cursor <= end) {
      const date = formatLocalDate(cursor);
      if (byDate.has(date)) {
        throw new Error(`Duplicate holiday preset date: ${date}`);
      }
      byDate.set(date, {
        date,
        type: rule.type,
        name: rule.name,
        description: rule.description
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
};

const createDefaultConfig = (): HolidayConfig => ({
  presetId: preset.presetId,
  presetRevision: preset.revision,
  label: preset.label,
  source: preset.source,
  validFrom: preset.validFrom,
  validTo: preset.validTo,
  adjustments: expandPresetRules(preset.rules),
  notes: [...(preset.notes ?? [])],
  lastUpdated: preset.updatedAt
});

const isConfig = (value: unknown): value is HolidayConfig => {
  if (!value || typeof value !== 'object') return false;
  const config = value as Partial<HolidayConfig>;
  return typeof config.presetId === 'string' &&
    typeof config.presetRevision === 'number' &&
    typeof config.label === 'string' &&
    typeof config.source === 'string' &&
    isLocalDateString(config.validFrom) &&
    isLocalDateString(config.validTo) &&
    Array.isArray(config.adjustments) && config.adjustments.every(isAdjustment) &&
    Array.isArray(config.notes) && config.notes.every(note => typeof note === 'string') &&
    typeof config.lastUpdated === 'string';
};

export class HolidayManager {
  private config: HolidayConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): HolidayConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (
          isConfig(parsed) &&
          parsed.presetId === preset.presetId &&
          parsed.presetRevision === preset.revision
        ) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load holiday config from storage:', error);
    }

    return createDefaultConfig();
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save holiday config:', error);
    }
  }

  getConfig(): HolidayConfig {
    return {
      ...this.config,
      adjustments: this.config.adjustments.map(adjustment => ({ ...adjustment })),
      notes: [...this.config.notes]
    };
  }

  updateConfig(newConfig: HolidayConfig): void {
    this.config = {
      ...newConfig,
      adjustments: [...newConfig.adjustments].sort((a, b) => a.date.localeCompare(b.date)),
      notes: [...newConfig.notes],
      lastUpdated: new Date().toISOString()
    };
    this.saveConfig();
  }

  addOrUpdateAdjustment(adjustment: HolidayAdjustment): void {
    if (!isAdjustment(adjustment)) {
      throw new Error('Invalid holiday adjustment');
    }

    const existingIndex = this.config.adjustments.findIndex(adj => adj.date === adjustment.date);
    if (existingIndex >= 0) {
      this.config.adjustments[existingIndex] = adjustment;
    } else {
      this.config.adjustments.push(adjustment);
    }

    this.config.adjustments.sort((a, b) => a.date.localeCompare(b.date));
    this.config.lastUpdated = new Date().toISOString();
    this.saveConfig();
  }

  removeAdjustment(date: string): void {
    this.config.adjustments = this.config.adjustments.filter(adj => adj.date !== date);
    this.config.lastUpdated = new Date().toISOString();
    this.saveConfig();
  }

  getScheduleType(date: Date): ScheduleType {
    const dateStr = formatLocalDate(date);
    const adjustment = this.config.adjustments.find(adj => adj.date === dateStr);
    if (adjustment) {
      return adjustment.type === 'holiday' ? 'holiday' : 'weekday';
    }

    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6 ? 'holiday' : 'weekday';
  }

  getHolidayInfo(date: Date): HolidayAdjustment | null {
    const dateStr = formatLocalDate(date);
    return this.config.adjustments.find(adj => adj.date === dateStr) ?? null;
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(jsonString: string): boolean {
    try {
      const imported: unknown = JSON.parse(jsonString);
      if (!isConfig(imported)) {
        throw new Error('Invalid config structure');
      }
      this.updateConfig(imported);
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }

  resetToDefault(): void {
    this.config = createDefaultConfig();
    this.saveConfig();
  }
}

export const holidayManager = new HolidayManager();
