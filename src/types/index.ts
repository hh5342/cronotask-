export type SessionCategory =
  | 'development'
  | 'design'
  | 'research'
  | 'meeting'
  | 'writing'
  | 'management'
  | 'learning'
  | 'other';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WorkSession {
  id: string;
  title: string;
  project: string;
  category: SessionCategory;
  startTime: number; // ms timestamp
  endTime: number; // ms timestamp
  durationSeconds: number; // Net active work time in seconds
  breakDurationSeconds: number; // Time on break
  notes: string;
  tasks: TaskItem[];
  blockers?: string;
  nextSteps?: string;
  focusScore: number; // 1 - 5
  energyLevel: 'high' | 'medium' | 'low';
  tags: string[];
  createdAt: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused';
export type TimerMode = 'stopwatch' | 'pomodoro';

export interface ActiveTimerData {
  status: TimerStatus;
  mode: TimerMode;
  targetMinutes: number;
  title: string;
  project: string;
  category: SessionCategory;
  notes: string;
  tasks: TaskItem[];
  focusScore: number;
  tags: string[];
  blockers: string;
  nextSteps: string;
  startedAt: number | null; // Timestamp ms when started
  lastTickAt: number | null;
  elapsedSeconds: number;
  breakSeconds: number;
  pauseStartedAt: number | null;
}

export interface DailyProductivity {
  dateKey: string; // YYYY-MM-DD
  displayDate: string; // "27 Oct 2026"
  dayOfWeek: string; // "Mar"
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
  avgFocusScore: number;
  projectHours: Record<string, number>;
  categoryHours: Record<string, number>;
}

export interface MonthlyProductivity {
  monthKey: string; // YYYY-MM
  monthName: string; // "Octubre 2026"
  shortMonth: string; // "Oct 26"
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
  avgDailyHours: number;
  avgFocusScore: number;
  topProject: string;
  projectHours: Record<string, number>;
  dailyBreakdown: DailyProductivity[];
}

export interface ProductivityAnalysis {
  totalHours: number;
  totalSessions: number;
  avgSessionMinutes: number;
  avgDailyHours: number;
  overallFocusScore: number;
  streakDays: number;
  topProject: { name: string; hours: number; percentage: number };
  dailyTrend: DailyProductivity[];
  monthlyTrend: MonthlyProductivity[];
  hourlyDistribution: { hour: number; hours: number }[];
  dayOfWeekDistribution: { day: string; dayIndex: number; hours: number; sessionCount: number }[];
  categoryBreakdown: { category: SessionCategory; label: string; hours: number; percentage: number; color: string }[];
}

export type ActiveTab = 'timer' | 'sessions' | 'analytics' | 'consolidated';
