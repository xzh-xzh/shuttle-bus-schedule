
export type ScheduleType = 'weekday' | 'holiday';

export interface DepartureInfo {
  time: string;
  routeDetail: string;
}

export interface LoopingInfo {
  startTime: string;
  endTime: string;
  routeDetail: string;
}

export interface Route {
  name:string;
  departures: DepartureInfo[];
  loopingServices?: LoopingInfo[];
}

export interface Schedule {
  weekday: Route[];
  holiday: Route[];
}

export interface UpcomingDeparture {
  time: string;
  minutesUntil: number;
  isTomorrow: boolean;
  routeDetail: string;
  isLooping?: boolean;
}

// 节日调休数据类型定义
export interface HolidayAdjustment {
  date: string; // YYYY-MM-DD 格式
  type: 'holiday' | 'workday'; // 该日期应该按照什么类型的时刻表
  name: string; // 节日名称或调休说明
  description?: string; // 详细说明
}

export interface HolidayConfig {
  presetId: string;
  presetRevision: number;
  label: string;
  source: string;
  validFrom: string;
  validTo: string;
  adjustments: HolidayAdjustment[];
  notes: string[];
  lastUpdated: string; // ISO 日期字符串
}

export interface HolidayRule {
  startDate: string;
  endDate?: string;
  type: 'holiday' | 'workday';
  name: string;
  description?: string;
}

export interface HolidayPreset {
  schemaVersion: number;
  presetId: string;
  revision: number;
  label: string;
  source: string;
  updatedAt: string;
  validFrom: string;
  validTo: string;
  rules: HolidayRule[];
  notes?: string[];
}

// 全局类型声明
declare global {
  interface Window {
    Capacitor?: any;
    electronAPI?: any;
  }
}
