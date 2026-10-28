import { WorkSession, DailyProductivity, MonthlyProductivity, ProductivityAnalysis, SessionCategory } from '../types';
import { formatDateKey, formatMonthKey, getMonthName, getCategoryInfo } from './formatters';

const SPANISH_DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function calculateProductivityAnalysis(sessions: WorkSession[]): ProductivityAnalysis {
  if (sessions.length === 0) {
    return {
      totalHours: 0,
      totalSessions: 0,
      avgSessionMinutes: 0,
      avgDailyHours: 0,
      overallFocusScore: 0,
      streakDays: 0,
      topProject: { name: 'Sin datos', hours: 0, percentage: 0 },
      dailyTrend: [],
      monthlyTrend: [],
      hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({ hour: i, hours: 0 })),
      dayOfWeekDistribution: SPANISH_DAY_NAMES.map((name, idx) => ({ day: name, dayIndex: idx, hours: 0, sessionCount: 0 })),
      categoryBreakdown: [],
    };
  }

  // Sort sessions chronologically (oldest to newest)
  const sorted = [...sessions].sort((a, b) => a.startTime - b.startTime);

  let totalSeconds = 0;
  let totalFocusScore = 0;
  const projectSecondsMap: Record<string, number> = {};
  const categorySecondsMap: Record<SessionCategory, number> = {
    development: 0,
    design: 0,
    research: 0,
    meeting: 0,
    writing: 0,
    management: 0,
    learning: 0,
    other: 0,
  };

  const dailyMap: Record<string, {
    dateKey: string;
    timestamp: number;
    totalSeconds: number;
    sessionCount: number;
    focusSum: number;
    projectHours: Record<string, number>;
    categoryHours: Record<string, number>;
  }> = {};

  const hourlyHoursMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyHoursMap[i] = 0;

  const dayOfWeekMap: Record<number, { hours: number; sessionCount: number }> = {};
  for (let i = 0; i < 7; i++) dayOfWeekMap[i] = { hours: 0, sessionCount: 0 };

  sorted.forEach((session) => {
    const durSec = session.durationSeconds;
    totalSeconds += durSec;
    totalFocusScore += session.focusScore;

    // Project aggregation
    projectSecondsMap[session.project] = (projectSecondsMap[session.project] || 0) + durSec;

    // Category aggregation
    categorySecondsMap[session.category] = (categorySecondsMap[session.category] || 0) + durSec;

    // Daily aggregation
    const dKey = formatDateKey(session.startTime);
    if (!dailyMap[dKey]) {
      dailyMap[dKey] = {
        dateKey: dKey,
        timestamp: session.startTime,
        totalSeconds: 0,
        sessionCount: 0,
        focusSum: 0,
        projectHours: {},
        categoryHours: {},
      };
    }
    const dayEntry = dailyMap[dKey];
    dayEntry.totalSeconds += durSec;
    dayEntry.sessionCount += 1;
    dayEntry.focusSum += session.focusScore;
    dayEntry.projectHours[session.project] = (dayEntry.projectHours[session.project] || 0) + durSec / 3600;
    dayEntry.categoryHours[session.category] = (dayEntry.categoryHours[session.category] || 0) + durSec / 3600;

    // Hourly distribution
    const startDate = new Date(session.startTime);
    const startHour = startDate.getHours();
    hourlyHoursMap[startHour] = (hourlyHoursMap[startHour] || 0) + durSec / 3600;

    // Day of week distribution
    const dayOfWeek = startDate.getDay();
    dayOfWeekMap[dayOfWeek].hours += durSec / 3600;
    dayOfWeekMap[dayOfWeek].sessionCount += 1;
  });

  // Build daily trend list sorted by date ascending
  const dailyTrend: DailyProductivity[] = Object.keys(dailyMap)
    .sort()
    .map((dKey) => {
      const entry = dailyMap[dKey];
      const d = new Date(entry.timestamp);
      const dayOfWeek = SPANISH_DAY_NAMES[d.getDay()];
      const displayDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      return {
        dateKey: dKey,
        displayDate,
        dayOfWeek,
        totalSeconds: entry.totalSeconds,
        totalHours: Math.round((entry.totalSeconds / 3600) * 10) / 10,
        sessionCount: entry.sessionCount,
        avgFocusScore: Math.round((entry.focusSum / entry.sessionCount) * 10) / 10,
        projectHours: entry.projectHours,
        categoryHours: entry.categoryHours,
      };
    });

  // Build monthly trend list
  const monthlyMap: Record<string, {
    monthKey: string;
    totalSeconds: number;
    sessionCount: number;
    focusSum: number;
    projectHours: Record<string, number>;
    dailyList: DailyProductivity[];
  }> = {};

  dailyTrend.forEach((day) => {
    const [year, month] = day.dateKey.split('-');
    const mKey = `${year}-${month}`;
    if (!monthlyMap[mKey]) {
      monthlyMap[mKey] = {
        monthKey: mKey,
        totalSeconds: 0,
        sessionCount: 0,
        focusSum: 0,
        projectHours: {},
        dailyList: [],
      };
    }
    const mEntry = monthlyMap[mKey];
    mEntry.totalSeconds += day.totalSeconds;
    mEntry.sessionCount += day.sessionCount;
    mEntry.focusSum += day.avgFocusScore * day.sessionCount;
    mEntry.dailyList.push(day);

    Object.entries(day.projectHours).forEach(([proj, hrs]) => {
      mEntry.projectHours[proj] = (mEntry.projectHours[proj] || 0) + hrs;
    });
  });

  const monthlyTrend: MonthlyProductivity[] = Object.keys(monthlyMap)
    .sort()
    .map((mKey) => {
      const mEntry = monthlyMap[mKey];
      const monthHours = Math.round((mEntry.totalSeconds / 3600) * 10) / 10;
      const monthName = getMonthName(mKey);
      const [y, m] = mKey.split('-');
      const shortMonth = `${monthName.slice(0, 3)} '${y.slice(2)}`;

      // Find top project for this month
      let topProj = 'Sin proyectos';
      let maxProjHours = 0;
      Object.entries(mEntry.projectHours).forEach(([proj, hrs]) => {
        if (hrs > maxProjHours) {
          maxProjHours = hrs;
          topProj = proj;
        }
      });

      const uniqueDays = mEntry.dailyList.length || 1;
      const avgDailyHours = Math.round((monthHours / uniqueDays) * 10) / 10;
      const avgFocus = mEntry.sessionCount > 0 ? Math.round((mEntry.focusSum / mEntry.sessionCount) * 10) / 10 : 0;

      return {
        monthKey: mKey,
        monthName,
        shortMonth,
        totalSeconds: mEntry.totalSeconds,
        totalHours: monthHours,
        sessionCount: mEntry.sessionCount,
        avgDailyHours,
        avgFocusScore: avgFocus,
        topProject: topProj,
        projectHours: mEntry.projectHours,
        dailyBreakdown: mEntry.dailyList,
      };
    });

  // Calculate streak (consecutive active days up to latest)
  let streak = 0;
  if (dailyTrend.length > 0) {
    const todayKey = formatDateKey(Date.now());
    const yesterdayKey = formatDateKey(Date.now() - 24 * 3600 * 1000);
    const lastDayKey = dailyTrend[dailyTrend.length - 1].dateKey;

    // If active today or yesterday, count backward
    if (lastDayKey === todayKey || lastDayKey === yesterdayKey) {
      streak = 1;
      for (let i = dailyTrend.length - 2; i >= 0; i--) {
        const curr = new Date(dailyTrend[i + 1].dateKey).getTime();
        const prev = new Date(dailyTrend[i].dateKey).getTime();
        const diffDays = Math.round((curr - prev) / (24 * 3600 * 1000));
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Top project overall
  let topProjectName = 'Ninguno';
  let topProjectSeconds = 0;
  Object.entries(projectSecondsMap).forEach(([proj, sec]) => {
    if (sec > topProjectSeconds) {
      topProjectSeconds = sec;
      topProjectName = proj;
    }
  });

  const topProjectHours = Math.round((topProjectSeconds / 3600) * 10) / 10;
  const topProjectPct = totalSeconds > 0 ? Math.round((topProjectSeconds / totalSeconds) * 100) : 0;

  // Category breakdown
  const categoryBreakdown = Object.entries(categorySecondsMap)
    .filter(([_, sec]) => sec > 0)
    .map(([cat, sec]) => {
      const info = getCategoryInfo(cat as SessionCategory);
      const hours = Math.round((sec / 3600) * 10) / 10;
      const percentage = totalSeconds > 0 ? Math.round((sec / totalSeconds) * 100) : 0;
      return {
        category: cat as SessionCategory,
        label: info.label,
        hours,
        percentage,
        color: info.color,
      };
    })
    .sort((a, b) => b.hours - a.hours);

  // Hourly distribution
  const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    hours: Math.round(hourlyHoursMap[i] * 10) / 10,
  }));

  // Day of week distribution
  const dayOfWeekDistribution = SPANISH_DAY_NAMES.map((name, idx) => ({
    day: name,
    dayIndex: idx,
    hours: Math.round(dayOfWeekMap[idx].hours * 10) / 10,
    sessionCount: dayOfWeekMap[idx].sessionCount,
  }));

  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
  const totalSessions = sessions.length;
  const avgSessionMinutes = totalSessions > 0 ? Math.round(totalSeconds / totalSessions / 60) : 0;
  const uniqueDaysCount = dailyTrend.length || 1;
  const avgDailyHours = Math.round((totalHours / uniqueDaysCount) * 10) / 10;
  const overallFocusScore = totalSessions > 0 ? Math.round((totalFocusScore / totalSessions) * 10) / 10 : 0;

  return {
    totalHours,
    totalSessions,
    avgSessionMinutes,
    avgDailyHours,
    overallFocusScore,
    streakDays: streak,
    topProject: {
      name: topProjectName,
      hours: topProjectHours,
      percentage: topProjectPct,
    },
    dailyTrend,
    monthlyTrend,
    hourlyDistribution,
    dayOfWeekDistribution,
    categoryBreakdown,
  };
}
