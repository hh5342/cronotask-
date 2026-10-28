import { SessionCategory } from '../types';

export function formatDuration(seconds: number, includeSeconds = true): string {
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const remainingSeconds = s % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (includeSeconds) {
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatHoursDecimal(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(1);
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMonthKey(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthName(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const name = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getCategoryInfo(category: SessionCategory): {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
} {
  switch (category) {
    case 'development':
      return {
        label: 'Desarrollo',
        color: '#10B981', // emerald
        bgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        textClass: 'text-emerald-400',
      };
    case 'design':
      return {
        label: 'Diseño',
        color: '#8B5CF6', // purple
        bgClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        textClass: 'text-purple-400',
      };
    case 'research':
      return {
        label: 'Investigación',
        color: '#06B6D4', // cyan
        bgClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        textClass: 'text-cyan-400',
      };
    case 'meeting':
      return {
        label: 'Reunión',
        color: '#F59E0B', // amber
        bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        textClass: 'text-amber-400',
      };
    case 'writing':
      return {
        label: 'Redacción',
        color: '#EC4899', // pink
        bgClass: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
        textClass: 'text-pink-400',
      };
    case 'management':
      return {
        label: 'Gestión',
        color: '#3B82F6', // blue
        bgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        textClass: 'text-blue-400',
      };
    case 'learning':
      return {
        label: 'Aprendizaje',
        color: '#6366F1', // indigo
        bgClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        textClass: 'text-indigo-400',
      };
    case 'other':
    default:
      return {
        label: 'Otro',
        color: '#94A3B8', // slate
        bgClass: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400',
        textClass: 'text-neutral-400',
      };
  }
}

export function getFocusScoreLabel(score: number): { label: string; color: string } {
  if (score >= 4.5) return { label: 'Foco Máximo', color: 'text-emerald-400' };
  if (score >= 3.5) return { label: 'Muy Productivo', color: 'text-teal-400' };
  if (score >= 2.5) return { label: 'Moderado', color: 'text-amber-400' };
  if (score >= 1.5) return { label: 'Con Distracciones', color: 'text-orange-400' };
  return { label: 'Bajo Rendimiento', color: 'text-rose-400' };
}
