import React, { useState } from 'react';
import { DailyProductivity, MonthlyProductivity, SessionCategory } from '../types';
import { getCategoryInfo } from '../utils/formatters';

interface DailyChartProps {
  dailyData: DailyProductivity[];
  daysToShow?: 7 | 14 | 30;
}

export const DailyComparativeChart: React.FC<DailyChartProps> = ({ dailyData, daysToShow = 14 }) => {
  const [selectedDay, setSelectedDay] = useState<DailyProductivity | null>(null);

  // Take the most recent X days
  const slice = dailyData.slice(-daysToShow);
  const maxHours = Math.max(3, ...slice.map((d) => d.totalHours));
  const ceilHours = Math.ceil(maxHours * 1.15);

  const totalPeriodHours = slice.reduce((acc, d) => acc + d.totalHours, 0);
  const avgPeriodHours = slice.length > 0 ? (totalPeriodHours / slice.length).toFixed(1) : '0';

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">
            Tendencia de Rendimiento Diario
          </div>
          <h3 className="text-base font-semibold text-neutral-100">
            Comparativa Diaria de Horas Trabajadas
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div>
            <span>Promedio: </span>
            <span className="font-mono font-bold text-white tabular-nums">{avgPeriodHours} h/día</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>Foco Alto (≥4.5)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
              <span>Medio (≥3.5)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
              <span>Moderado</span>
            </span>
          </div>
        </div>
      </div>

      {slice.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 text-sm">
          No hay suficientes sesiones registradas para generar el gráfico comparativo diario.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Chart Visual Field */}
          <div className="relative h-56 flex items-end gap-2 pt-6 pb-2 border-b border-neutral-800">
            {/* Horizontal Grid guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-neutral-600 select-none pb-2">
              <div className="border-b border-neutral-800/60 w-full flex justify-between pr-2">
                <span>{ceilHours} h</span>
              </div>
              <div className="border-b border-neutral-800/40 w-full flex justify-between pr-2">
                <span>{(ceilHours * 0.66).toFixed(1)} h</span>
              </div>
              <div className="border-b border-neutral-800/40 w-full flex justify-between pr-2">
                <span>{(ceilHours * 0.33).toFixed(1)} h</span>
              </div>
              <div className="w-full flex justify-between pr-2">
                <span>0 h</span>
              </div>
            </div>

            {/* Bars */}
            {slice.map((day) => {
              const heightPercent = Math.max(4, Math.round((day.totalHours / ceilHours) * 100));
              const isSelected = selectedDay?.dateKey === day.dateKey;

              const barColor =
                day.avgFocusScore >= 4.5
                  ? 'bg-emerald-500 hover:bg-emerald-400'
                  : day.avgFocusScore >= 3.5
                  ? 'bg-sky-500 hover:bg-sky-400'
                  : 'bg-amber-500 hover:bg-amber-400';

              return (
                <div
                  key={day.dateKey}
                  onClick={() => setSelectedDay(day)}
                  className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer z-10"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 pointer-events-none z-30 bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-md px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                    <div className="font-semibold text-white">{day.displayDate} ({day.dayOfWeek})</div>
                    <div className="font-mono text-emerald-400 font-bold">{day.totalHours} h trabajadas</div>
                    <div className="text-neutral-400">{day.sessionCount} sesión{day.sessionCount > 1 ? 'es' : ''} · Foco {day.avgFocusScore}/5 ★</div>
                  </div>

                  {/* Value label on top of bar */}
                  <span className="text-[10px] font-mono text-neutral-400 mb-1 group-hover:text-white transition-colors">
                    {day.totalHours > 0 ? `${day.totalHours}h` : ''}
                  </span>

                  {/* The bar element */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[32px] rounded-t transition-all ${barColor} ${
                      isSelected ? 'ring-2 ring-white scale-105' : ''
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X Axis Labels */}
          <div className="flex gap-2">
            {slice.map((day) => (
              <div key={day.dateKey} className="flex-1 text-center">
                <div className="text-[11px] font-medium text-neutral-300">
                  {day.dayOfWeek}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {day.displayDate.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Day Inspector Panel */}
          {selectedDay && (
            <div className="mt-4 p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">
                  Detalles del {selectedDay.displayDate} ({selectedDay.dayOfWeek}):
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {selectedDay.totalHours} horas
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-300">
                  {selectedDay.sessionCount} sesiones
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-amber-400 font-medium">
                  Índice de Foco: {selectedDay.avgFocusScore} / 5 ★
                </span>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Cerrar detalle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MonthlyChartProps {
  monthlyData: MonthlyProductivity[];
}

export const MonthlyComparativeChart: React.FC<MonthlyChartProps> = ({ monthlyData }) => {
  const maxHours = Math.max(10, ...monthlyData.map((m) => m.totalHours));
  const ceilHours = Math.ceil(maxHours * 1.2);

  // Month-over-month trend calculation
  let momTrend = null;
  if (monthlyData.length >= 2) {
    const last = monthlyData[monthlyData.length - 1].totalHours;
    const prev = monthlyData[monthlyData.length - 2].totalHours;
    if (prev > 0) {
      const diff = Math.round(((last - prev) / prev) * 100);
      momTrend = diff;
    }
  }

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">
            Análisis de Evolución Temporal
          </div>
          <h3 className="text-base font-semibold text-neutral-100">
            Comparativa Mensual de Productividad
          </h3>
        </div>
        {momTrend !== null && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Variación MoM:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded ${
                momTrend >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {momTrend >= 0 ? `+${momTrend}%` : `${momTrend}%`}
            </span>
          </div>
        )}
      </div>

      {monthlyData.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 text-sm">
          No hay datos mensuales registrados para comparar.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyData.map((month, idx) => {
              const heightPercent = Math.max(8, Math.round((month.totalHours / ceilHours) * 100));
              const isCurrent = idx === monthlyData.length - 1;

              return (
                <div
                  key={month.monthKey}
                  className={`p-4 rounded-xl border transition-colors ${
                    isCurrent
                      ? 'bg-neutral-900 border-indigo-500/30'
                      : 'bg-neutral-950/60 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white text-sm">
                      {month.monthName}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] text-indigo-400 font-medium">
                        Mes en curso
                      </span>
                    )}
                  </div>

                  {/* Progress / Volume bar */}
                  <div className="w-full bg-neutral-800 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      style={{ width: `${heightPercent}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-neutral-500 text-[11px]">Horas Totales</div>
                      <div className="text-lg font-mono font-bold text-white tabular-nums">
                        {month.totalHours} h
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[11px]">Sesiones</div>
                      <div className="text-lg font-mono font-bold text-neutral-200 tabular-nums">
                        {month.sessionCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[11px]">Promedio Diario</div>
                      <div className="font-mono text-neutral-300 font-semibold tabular-nums">
                        {month.avgDailyHours} h/día
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[11px]">Foco Promedio</div>
                      <div className="font-mono text-amber-400 font-semibold tabular-nums">
                        {month.avgFocusScore} / 5 ★
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-800/60 text-[11px] flex items-center justify-between text-neutral-400">
                    <span>Proyecto principal:</span>
                    <span className="font-medium text-neutral-200 truncate max-w-[130px]">
                      {month.topProject}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface CategoryDistributionProps {
  categories: {
    category: SessionCategory;
    label: string;
    hours: number;
    percentage: number;
    color: string;
  }[];
}

export const CategoryDistributionChart: React.FC<CategoryDistributionProps> = ({ categories }) => {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">
        Distribución de Actividades
      </div>
      <h3 className="text-base font-semibold text-neutral-100 mb-4">
        Tiempo Invertido por Categoría
      </h3>

      {categories.length === 0 ? (
        <div className="py-8 text-center text-neutral-500 text-sm">
          No hay registros de categoría disponibles.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Segmented bar */}
          <div className="h-3 w-full rounded-full bg-neutral-800 flex overflow-hidden">
            {categories.map((cat) => (
              <div
                key={cat.category}
                style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                title={`${cat.label}: ${cat.hours}h (${cat.percentage}%)`}
                className="h-full transition-all"
              />
            ))}
          </div>

          {/* Breakdown items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {categories.map((cat) => {
              const info = getCategoryInfo(cat.category);
              return (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: cat.color }}
                      className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                    />
                    <span className="text-neutral-200 font-medium">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-neutral-400">{cat.hours} h</span>
                    <span className="text-white font-semibold">({cat.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
