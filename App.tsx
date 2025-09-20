
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
  <div className="bg-slate-800 rounded-xl shadow-lg p-6 w-full">
    <div className="flex items-center mb-4">
      <BusIcon className="w-6 h-6 text-cyan-400 mr-3" />
      <h3 className="text-xl font-bold text-slate-100">{route.name}</h3>
    </div>
    <div className="space-y-4">
      {departures.length > 0 ? (
        departures.map((departure, index) => (
          <div key={index} className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg">
            <div className="flex-grow">
              <p className="text-2xl font-mono font-bold text-white">{departure.time}</p>
              <div className="flex items-center gap-2 mt-2 text-slate-400">
                <RouteIcon className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">{departure.routeDetail}</p>
              </div>
              {departure.isTomorrow && <p className="text-xs text-amber-400 mt-1">明天</p>}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              {departure.isLooping ? (
                 <p className="text-lg font-semibold text-cyan-300">循环中</p>
              ) : (
                <>
                  <p className="text-lg font-semibold text-cyan-300">{departure.minutesUntil} 分钟</p>
                  <p className="text-xs text-slate-400">后</p>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 bg-slate-700/50 rounded-lg">
          <p className="text-slate-400">{isQueryToday ? '今日已无班次' : '当日已无班次'}</p>
        </div>
      )}
    </div>
  </div>
);

const FullScheduleView: React.FC<{ routes: Route[] }> = ({ routes }) => {
    return (
        <div className="mt-6 space-y-6">
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
                    <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-cyan-400 mb-3 border-b border-slate-700 pb-2">{route.name}</h4>
                        
                        {/* Display looping services */}
                        {route.loopingServices && route.loopingServices.length > 0 && (
                            <div className="space-y-4 mb-4">
                                {route.loopingServices.map((loop, loopIndex) => (
                                    <div key={`loop-${loopIndex}`}>
                                        <p className="text-sm text-slate-300 mb-2 flex items-center gap-2">
                                            <RouteIcon className="w-4 h-4 flex-shrink-0" />
                                            <span>{loop.routeDetail}</span>
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                          <div className="bg-slate-700 text-center rounded-md py-1 px-2 col-span-2">
                                              <span className="font-mono text-sm text-white">{loop.startTime} - {loop.endTime}</span>
                                          </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Display timed departures */}
                        <div className="space-y-4">
                            {Object.entries(departuresByRoute).map(([routeDetail, times]: [string, string[]]) => (
                                <div key={routeDetail}>
                                    <p className="text-sm text-slate-300 mb-2 flex items-center gap-2">
                                        <RouteIcon className="w-4 h-4 flex-shrink-0" />
                                        <span>{routeDetail}</span>
                                    </p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                        {times.map((time, timeIndex) => (
                                            <div key={timeIndex} className="bg-slate-700 text-center rounded-md py-1 px-2">
                                                <span className="font-mono text-sm text-white">{time}</span>
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


const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queryTime, setQueryTime] = useState(new Date());
  const [queryDate, setQueryDate] = useState(new Date());
  const [useRealTime, setUseRealTime] = useState(true);
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('weekday');
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showHolidayManager, setShowHolidayManager] = useState(false);
  const [holidayConfigVersion, setHolidayConfigVersion] = useState(0);
  const [isSmartMode, setIsSmartMode] = useState(true); // 默认启用智能模式

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
    // 保持当前的时间，只更改日期
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

  const upcomingDepartures = useMemo(() => {
    const activeSchedule = SCHEDULE_DATA[scheduleType];
    
    // 计算第二天的日期和对应的时刻表类型（基于查询日期）
    const tomorrow = new Date(queryDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowScheduleType = holidayManager.getScheduleType(tomorrow);
    const tomorrowSchedule = SCHEDULE_DATA[tomorrowScheduleType];
    
    return activeSchedule.map((route, routeIndex) => {
        const activeLoops = findActiveLoopingServices(route.loopingServices, queryTime);
        
        // 创建获取第二天对应路线时刻表的函数
        const getTomorrowSchedule = () => {
          return tomorrowSchedule[routeIndex]?.departures || [];
        };
        
        // 创建获取第二天对应路线循环发车服务的函数
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
  const queryTimeValue = `${queryTime.getHours().toString().padStart(2, '0')}:${queryTime.getMinutes().toString().padStart(2, '0')}`;
  
  // 格式化查询日期
  const queryFormattedDate = queryDate.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const isQueryToday = queryDate.toDateString() === currentTime.toDateString();

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            接驳车时刻查询
          </h1>
          <p className="text-slate-400 mt-2">轻松查询下一班车</p>
        </header>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-2xl border border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <ClockIcon className="w-8 h-8 text-slate-400"/>
                    <div>
                        <p className="text-3xl font-mono font-bold">{formattedTime}</p>
                        <p className="text-sm text-slate-400">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center bg-slate-900 rounded-full p-1">
                        <button
                            onClick={() => {
                              setIsSmartMode(true);
                              const currentScheduleType = holidayManager.getScheduleType(new Date());
                              setScheduleType(currentScheduleType);
                            }}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${isSmartMode ? 'bg-green-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                        >
                            <SettingsIcon className="w-4 h-4"/>
                            智能
                        </button>
                        <button
                            onClick={() => {
                              setIsSmartMode(false);
                              setScheduleType('weekday');
                            }}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${!isSmartMode && scheduleType === 'weekday' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                        >
                            <MoonIcon className="w-4 h-4"/>
                            工作日
                        </button>
                        <button
                            onClick={() => {
                              setIsSmartMode(false);
                              setScheduleType('holiday');
                            }}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${!isSmartMode && scheduleType === 'holiday' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            <SunIcon className="w-4 h-4"/>
                            节假日
                        </button>
                    </div>
                    <button
                        onClick={() => setShowHolidayManager(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors text-sm"
                    >
                        <CalendarIcon className="w-4 h-4" />
                        节假日设置
                    </button>
                </div>
            </div>
             <div className="border-t border-slate-700 my-4"></div>
            
            {/* 日期和时间选择器 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <label className="text-sm font-medium text-slate-300">
                    查询时间：
                </label>
                <input
                    type="date"
                    id="queryDate"
                    value={queryDate.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-white font-mono text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label="查询日期"
                />
                <input
                    type="time"
                    id="queryTime"
                    value={queryTimeValue}
                    onChange={handleTimeChange}
                    className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-white font-mono text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label="查询时间"
                />
                <button
                    onClick={handleResetToRealTime}
                    className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={useRealTime && useCurrentDate}
                    aria-label="使用当前时间"
                >
                    <ResetIcon className="w-4 h-4"/>
                    <span>使用当前时间</span>
                </button>
            </div>
        </div>

        <main className="space-y-8">
            <div className="text-center mb-6">
                {!isQueryToday && (
                    <p className="text-lg text-amber-400 mb-2">
                        查询日期：{queryFormattedDate}
                    </p>
                )}
                <h2 className="text-2xl font-bold text-slate-300 flex items-center justify-center gap-3">
                    <CalendarIcon className="w-6 h-6"/>
                    <span className="capitalize text-cyan-400">{scheduleType === 'weekday' ? '工作日' : '节假日'}</span> - 
                    {isQueryToday ? '即将发车' : '班次信息'}
                </h2>
            </div>
          {upcomingDepartures.map((route, index) => (
            <DepartureCard key={index} route={route} departures={route.upcoming} isQueryToday={isQueryToday} />
          ))}
        </main>

        <footer className="text-center mt-12">
            <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-6 rounded-lg transition-all"
            >
                {showFullSchedule ? '隐藏' : '显示'}完整时刻表
            </button>
            {showFullSchedule && <FullScheduleView routes={SCHEDULE_DATA[scheduleType]} />}
        </footer>

      </div>
      
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
