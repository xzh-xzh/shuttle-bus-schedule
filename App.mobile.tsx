import React, { useState, useEffect, useMemo } from 'react';
import { SCHEDULE_DATA } from './constants';
import type { ScheduleType, Route, UpcomingDeparture, DepartureInfo, LoopingInfo } from './types';
import { BusIcon, ClockIcon, CalendarIcon, SunIcon, MoonIcon, RouteIcon, ResetIcon, SettingsIcon } from './components/Icons';
import { HolidayManagerComponent } from './components/HolidayManager';
import { holidayManager } from './utils/holidayManager';

// Helper function to find active looping services
const findActiveLoopingServices = (loopingServices: LoopingInfo[] | undefined, queryTime: Date): UpcomingDeparture[] => {
    if (!loopingServices) return [];

    const queryTotalMinutes = queryTime.getHours() * 60 + queryTime.getMinutes();
    const activeLoops: UpcomingDeparture[] = [];

    for (const loop of loopingServices) {
        const [startHour, startMinute] = loop.startTime.split(':').map(Number);
        const loopStartMinutes = startHour * 60 + startMinute;

        const [endHour, endMinute] = loop.endTime.split(':').map(Number);
        const loopEndMinutes = endHour * 60 + endMinute;

        // 如果查询时间在循环时间内，显示"--"
        if (queryTotalMinutes >= loopStartMinutes && queryTotalMinutes <= loopEndMinutes) {
            activeLoops.push({
                time: '--',
                minutesUntil: 0,
                isTomorrow: false,
                routeDetail: loop.routeDetail,
                isLooping: true,
            });
        }
        // 如果查询时间在循环开始前，显示循环开始时间和正常倒计时
        else if (queryTotalMinutes < loopStartMinutes) {
            activeLoops.push({
                time: loop.startTime,
                minutesUntil: loopStartMinutes - queryTotalMinutes,
                isTomorrow: false,
                routeDetail: loop.routeDetail,
                isLooping: false, // 开始前不是循环状态，应显示正常倒计时
            });
        }
    }
    return activeLoops;
}

// Helper function updated to handle the new data structure and tomorrow's schedule
const findUpcomingDepartures = (
  departures: DepartureInfo[], 
  queryTime: Date, 
  queryDate: Date,
  currentTime: Date, 
  count: number, 
  getTomorrowSchedule: () => DepartureInfo[],
  getTomorrowLoopingServices?: () => LoopingInfo[]
): UpcomingDeparture[] => {
  if (count <= 0) return [];
  const queryTotalMinutes = queryTime.getHours() * 60 + queryTime.getMinutes();
  const upcoming: UpcomingDeparture[] = [];

  // 检查查询日期是否是今天
  const isToday = queryDate.toDateString() === currentTime.toDateString();
  
  // Find departures for the query date
  for (const departure of departures) {
    const [hour, minute] = departure.time.split(':').map(Number);
    const departureTotalMinutes = hour * 60 + minute;
    
    if (departureTotalMinutes > queryTotalMinutes) {
      let minutesUntil: number;
      
      if (isToday) {
        // 如果是今天，使用查询时间计算剩余时间
        minutesUntil = departureTotalMinutes - queryTotalMinutes;
      } else {
        // 如果不是今天，显示相对于查询时间的分钟数
        minutesUntil = departureTotalMinutes - queryTotalMinutes;
      }
      
      upcoming.push({
        ...departure,
        minutesUntil: Math.max(0, minutesUntil),
        isTomorrow: false
      });
    }
    if (upcoming.length === count) {
      return upcoming;
    }
  }

  // If not enough found for the query date, add from "next day"
  const remainingCount = count - upcoming.length;
  if (remainingCount > 0) {
    // 首先检查第二天的循环发车服务
    if (getTomorrowLoopingServices) {
      const tomorrowLoops = getTomorrowLoopingServices();
      for (const loop of tomorrowLoops) {
        if (upcoming.length >= count) break;
        
        const [startHour, startMinute] = loop.startTime.split(':').map(Number);
        const loopStartMinutes = startHour * 60 + startMinute;
        
        let minutesUntil: number;
        if (isToday) {
          // 如果查询日期是今天，使用查询时间计算到明天循环开始的分钟数
          minutesUntil = (24 * 60 - queryTotalMinutes) + loopStartMinutes;
        } else {
          // 如果查询日期不是今天，显示相对时间
          minutesUntil = (24 * 60 - queryTotalMinutes) + loopStartMinutes;
        }
        
        upcoming.push({
          time: loop.startTime,
          minutesUntil: minutesUntil,
          isTomorrow: true,
          routeDetail: loop.routeDetail,
          isLooping: false, // 明天的循环开始时间，不是当前循环状态
        });
      }
    }
    
    // 然后添加第二天的定时班次
    const finalRemainingCount = count - upcoming.length;
    if (finalRemainingCount > 0) {
      const tomorrowDepartures = getTomorrowSchedule().slice(0, finalRemainingCount);
      for (const departure of tomorrowDepartures) {
        const [hour, minute] = departure.time.split(':').map(Number);
        const departureTotalMinutes = hour * 60 + minute;
        
        let minutesUntil: number;
        if (isToday) {
          // 如果查询日期是今天，使用查询时间计算到明天该时间的分钟数
          minutesUntil = (24 * 60 - queryTotalMinutes) + departureTotalMinutes;
        } else {
          // 如果查询日期不是今天，显示相对时间
          minutesUntil = (24 * 60 - queryTotalMinutes) + departureTotalMinutes;
        }
        
        upcoming.push({
          ...departure,
          minutesUntil: minutesUntil,
          isTomorrow: true
        });
      }
    }
  }
  return upcoming;
};

const DepartureCard: React.FC<{ route: Route; departures: UpcomingDeparture[]; isQueryToday: boolean }> = ({ route, departures, isQueryToday }) => (
  <div className="bg-slate-800 rounded-xl shadow-lg p-4 w-full">
    <div className="flex items-center mb-3">
      <BusIcon className="w-5 h-5 text-cyan-400 mr-2" />
      <h3 className="text-lg font-bold text-slate-100">{route.name}</h3>
    </div>
    <div className="space-y-3">
      {departures.length > 0 ? (
        departures.map((departure, index) => (
          <div key={index} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
            <div className="flex-grow">
              <p className="text-xl font-mono font-bold text-white">{departure.time}</p>
              <div className="flex items-center gap-2 mt-1 text-slate-400">
                <RouteIcon className="w-3 h-3 flex-shrink-0" />
                <p className="text-xs">{departure.routeDetail}</p>
              </div>
              {departure.isTomorrow && <p className="text-xs text-amber-400 mt-1">明天</p>}
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              {departure.isLooping ? (
                 <p className="text-base font-semibold text-cyan-300">循环中</p>
              ) : (
                <>
                  <p className="text-base font-semibold text-cyan-300">{departure.minutesUntil} 分钟</p>
                  <p className="text-xs text-slate-400">后</p>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-3 bg-slate-700/50 rounded-lg">
          <p className="text-slate-400 text-sm">{isQueryToday ? '今日已无班次' : '当日已无班次'}</p>
        </div>
      )}
    </div>
  </div>
);

const FullScheduleView: React.FC<{ routes: Route[] }> = ({ routes }) => {
    return (
        <div className="mt-4 space-y-4">
            {routes.map((route, index) => {
                // Group departures by routeDetail
                const departuresByRoute = route.departures.reduce((acc, departure) => {
                    if (!acc[departure.routeDetail]) {
                        acc[departure.routeDetail] = [];
                    }
                    acc[departure.routeDetail].push(departure.time);
                    return acc;
                }, {} as Record<string, string[]>);

                return (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                        <h4 className="text-base font-semibold text-cyan-400 mb-2 border-b border-slate-700 pb-1">{route.name}</h4>
                        
                        {/* Display looping services */}
                        {route.loopingServices && route.loopingServices.length > 0 && (
                            <div className="space-y-3 mb-3">
                                {route.loopingServices.map((loop, loopIndex) => (
                                    <div key={`loop-${loopIndex}`}>
                                        <p className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                                            <RouteIcon className="w-3 h-3 flex-shrink-0" />
                                            <span>{loop.routeDetail}</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-1">
                                          <div className="bg-slate-700 text-center rounded-md py-1 px-2 col-span-2">
                                              <span className="font-mono text-xs text-white">{loop.startTime} - {loop.endTime}</span>
                                          </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Display timed departures */}
                        <div className="space-y-3">
                            {Object.entries(departuresByRoute).map(([routeDetail, times]: [string, string[]]) => (
                                <div key={routeDetail}>
                                    <p className="text-xs text-slate-300 mb-1 flex items-center gap-1">
                                        <RouteIcon className="w-3 h-3 flex-shrink-0" />
                                        <span>{routeDetail}</span>
                                    </p>
                                    <div className="grid grid-cols-4 gap-1">
                                        {times.map((time, timeIndex) => (
                                            <div key={timeIndex} className="bg-slate-700 text-center rounded-md py-1 px-1">
                                                <span className="font-mono text-xs text-white">{time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// 控制面板组件
const ControlPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  queryTime: Date;
  queryDate: Date;
  scheduleType: ScheduleType;
  isSmartMode: boolean;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScheduleTypeChange: (type: ScheduleType) => void;
  onSmartModeChange: (enabled: boolean) => void;
  onShowHolidayManager: () => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  onClose,
  queryTime,
  queryDate,
  scheduleType,
  isSmartMode,
  onTimeChange,
  onDateChange,
  onScheduleTypeChange,
  onSmartModeChange,
  onShowHolidayManager,
  onConfirm
}) => {
  if (!isOpen) return null;

  const queryTimeValue = `${queryTime.getHours().toString().padStart(2, '0')}:${queryTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm mt-16 mr-2">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-100">控制面板</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 模式选择 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-300 block mb-2">时刻表模式</label>
            <div className="flex items-center bg-slate-900 rounded-lg p-1">
              <button
                onClick={() => onSmartModeChange(true)}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300 flex items-center gap-1 flex-1 justify-center ${isSmartMode ? 'bg-green-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
              >
                <SettingsIcon className="w-3 h-3"/>
                智能
              </button>
              <button
                onClick={() => {
                  onSmartModeChange(false);
                  onScheduleTypeChange('weekday');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300 flex items-center gap-1 flex-1 justify-center ${!isSmartMode && scheduleType === 'weekday' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
              >
                <MoonIcon className="w-3 h-3"/>
                工作日
              </button>
              <button
                onClick={() => {
                  onSmartModeChange(false);
                  onScheduleTypeChange('holiday');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300 flex items-center gap-1 flex-1 justify-center ${!isSmartMode && scheduleType === 'holiday' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                <SunIcon className="w-3 h-3"/>
                节假日
              </button>
            </div>
          </div>

          {/* 时间查询 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-300 block mb-2">查询时间</label>
            <div className="space-y-2">
              <input
                type="date"
                value={queryDate.toISOString().split('T')[0]}
                onChange={onDateChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              <input
                type="time"
                value={queryTimeValue}
                onChange={onTimeChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 节假日设置 */}
          <div className="mb-4">
            <button
              onClick={onShowHolidayManager}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors text-sm"
            >
              <CalendarIcon className="w-4 h-4" />
              节假日设置
            </button>
          </div>

          {/* 确定按钮 */}
          <button
            onClick={onConfirm}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queryTime, setQueryTime] = useState(new Date());
  const [queryDate, setQueryDate] = useState(new Date());
  const [useRealTime, setUseRealTime] = useState(true);
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('weekday');
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showHolidayManager, setShowHolidayManager] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [holidayConfigVersion, setHolidayConfigVersion] = useState(0);
  const [isSmartMode, setIsSmartMode] = useState(true);

  // 智能节假日判断
  useEffect(() => {
    if (isSmartMode) {
      const currentScheduleType = holidayManager.getScheduleType(queryDate);
      setScheduleType(currentScheduleType);
    }
  }, [holidayConfigVersion, isSmartMode, queryDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (useRealTime) {
      setQueryTime(currentTime);
    }
  }, [currentTime, useRealTime]);

  useEffect(() => {
    if (useCurrentDate) {
      setQueryDate(currentTime);
    }
  }, [currentTime, useCurrentDate]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newQueryTime = new Date(queryDate);
    newQueryTime.setHours(hours, minutes, 0, 0);
    setQueryTime(newQueryTime);
    setUseRealTime(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const newQueryDate = new Date(selectedDate);
    newQueryDate.setHours(queryTime.getHours(), queryTime.getMinutes(), 0, 0);
    
    setQueryDate(selectedDate);
    setQueryTime(newQueryDate);
    setUseCurrentDate(false);
    setUseRealTime(false);
  };

  const handleResetToRealTime = () => {
    setUseRealTime(true);
    setUseCurrentDate(true);
  };

  const handleControlPanelConfirm = () => {
    setShowControlPanel(false);
  };

  const upcomingDepartures = useMemo(() => {
    const activeSchedule = SCHEDULE_DATA[scheduleType];
    
    const tomorrow = new Date(queryDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowScheduleType = holidayManager.getScheduleType(tomorrow);
    const tomorrowSchedule = SCHEDULE_DATA[tomorrowScheduleType];
    
    return activeSchedule.map((route, routeIndex) => {
        const activeLoops = findActiveLoopingServices(route.loopingServices, queryTime);
        
        const getTomorrowSchedule = () => {
          return tomorrowSchedule[routeIndex]?.departures || [];
        };
        
        const getTomorrowLoopingServices = () => {
          return tomorrowSchedule[routeIndex]?.loopingServices || [];
        };
        
        const timedDepartures = findUpcomingDepartures(
          route.departures, 
          queryTime, 
          queryDate,
          currentTime, 
          2 - activeLoops.length, 
          getTomorrowSchedule,
          getTomorrowLoopingServices
        );
        const combined = [...activeLoops, ...timedDepartures];

        return {
          ...route,
          upcoming: combined
        };
    });
  }, [scheduleType, queryTime, queryDate, currentTime]);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const queryFormattedDate = queryDate.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const queryTimeFormatted = queryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isQueryToday = queryDate.toDateString() === currentTime.toDateString();
  const isQueryNow = useRealTime && useCurrentDate;

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-3 pt-12">
      <div className="max-w-lg mx-auto">
        {/* 头部 */}
        <header className="text-center mb-6 relative">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            接驳车实时查询
          </h1>
          <p className="text-slate-400 mt-1 text-sm">轻松查询下一班车</p>
          
          {/* 控制面板按钮 */}
          <button
            onClick={() => setShowControlPanel(true)}
            className="absolute top-0 right-0 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </header>

        {/* 日期时间窗口 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-4 shadow-lg border border-slate-700">
          <div className="flex items-center justify-center gap-3">
            <ClockIcon className="w-6 h-6 text-slate-400"/>
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-white">{formattedTime}</p>
              <p className="text-sm text-slate-400">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* 查询信息显示 */}
        {!isQueryNow && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 mb-4 shadow-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-amber-400 text-sm font-medium">
                  查询时间：{queryFormattedDate} {queryTimeFormatted}
                </p>
              </div>
              <button
                onClick={handleResetToRealTime}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors ml-2"
              >
                <ResetIcon className="w-3 h-3"/>
                <span>使用当前时间</span>
              </button>
            </div>
          </div>
        )}

        <main className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-slate-300 flex items-center justify-center gap-2">
              <CalendarIcon className="w-5 h-5"/>
              <span className="capitalize text-cyan-400">{scheduleType === 'weekday' ? '工作日' : '节假日'}</span> - 
              {isQueryToday ? '即将发车' : '班次信息'}
            </h2>
          </div>
          {upcomingDepartures.map((route, index) => (
            <DepartureCard key={index} route={route} departures={route.upcoming} isQueryToday={isQueryToday} />
          ))}
        </main>

        <footer className="text-center mt-8">
          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-all text-sm"
          >
            {showFullSchedule ? '隐藏' : '显示'}完整时刻表
          </button>
          {showFullSchedule && <FullScheduleView routes={SCHEDULE_DATA[scheduleType]} />}
        </footer>
      </div>
      
      {/* 控制面板 */}
      <ControlPanel
        isOpen={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        queryTime={queryTime}
        queryDate={queryDate}
        scheduleType={scheduleType}
        isSmartMode={isSmartMode}
        onTimeChange={handleTimeChange}
        onDateChange={handleDateChange}
        onScheduleTypeChange={setScheduleType}
        onSmartModeChange={setIsSmartMode}
        onShowHolidayManager={() => setShowHolidayManager(true)}
        onConfirm={handleControlPanelConfirm}
      />
      
      {/* 节假日管理器 */}
      {showHolidayManager && (
        <HolidayManagerComponent
          onClose={() => setShowHolidayManager(false)}
          onConfigChange={() => setHolidayConfigVersion(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default App;