import React, { useState } from 'react';
import { WorkSession } from '../types';
import { calculateProductivityAnalysis } from '../utils/analytics';
import { DailyComparativeChart, MonthlyComparativeChart, CategoryDistributionChart } from './ComparativeCharts';
import { Clock, Flame, Calendar, Award, TrendingUp, BarChart2, Layers } from 'lucide-react';

interface AnalyticsViewProps {
  sessions: WorkSession[];
  onNavigateToConsolidated: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessions, onNavigateToConsolidated }) => {
  const [dailyDaysRange, setDailyDaysRange] = useState<7 | 14 | 30>(14);

  const analysis = calculateProductivityAnalysis(sessions);

  return (
    <div className="space-y-8">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Horas Totales</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {analysis.totalHours} <span className="text-xs text-neutral-400 font-sans">h</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            En {analysis.totalSessions} sesiones registradas
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Promedio Diario</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {analysis.avgDailyHours} <span className="text-xs text-neutral-400 font-sans">h/día</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {analysis.dailyTrend.length} días de actividad
          </div>
        </div>

        {/* Focus Score */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Índice de Foco</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {analysis.overallFocusScore}{' '}
            <span className="text-xs text-neutral-400 font-sans">/ 5 ★</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Autoevaluación de concentración
          </div>
        </div>

        {/* Top Project */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Proyecto Líder</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-white truncate" title={analysis.topProject.name}>
            {analysis.topProject.name}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            {analysis.topProject.hours} h ({analysis.topProject.percentage}% del total)
          </div>
        </div>
      </div>

      {/* Daily Comparative Chart with Range Selector */}
      <div>
        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            <span className="text-neutral-500 px-2">Ventana:</span>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDailyDaysRange(d as any)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  dailyDaysRange === d
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {d} días
              </button>
            ))}
          </div>
        </div>

        <DailyComparativeChart dailyData={analysis.dailyTrend} daysToShow={dailyDaysRange} />
      </div>

      {/* Monthly Comparative Chart */}
      <MonthlyComparativeChart monthlyData={analysis.monthlyTrend} />

      {/* Secondary Grids: Category Distribution & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart categories={analysis.categoryBreakdown} />

        {/* Peak Hours distribution */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">
            Patrón Circadiano de Trabajo
          </div>
          <h3 className="text-base font-semibold text-neutral-100 mb-4">
            Horas Pico de Concentración (24 Horas)
          </h3>

          <div className="space-y-4">
            <div className="h-40 flex items-end gap-1 pt-4 pb-2 border-b border-neutral-800">
              {analysis.hourlyDistribution.map((slot) => {
                const maxH = Math.max(1, ...analysis.hourlyDistribution.map((h) => h.hours));
                const pct = Math.max(4, Math.round((slot.hours / maxH) * 100));

                return (
                  <div
                    key={slot.hour}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 text-[10px] bg-neutral-950 border border-neutral-800 px-1.5 py-0.5 rounded text-white whitespace-nowrap z-20 font-mono">
                      {slot.hour}:00 · {slot.hours}h
                    </div>
                    <div
                      style={{ height: `${pct}%` }}
                      className={`w-full rounded-t transition-all ${
                        slot.hours > 0
                          ? 'bg-emerald-500/80 hover:bg-emerald-400'
                          : 'bg-neutral-800/40'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>

            <p className="text-xs text-neutral-400">
              Muestra a qué horas del día se inicia la mayor carga de trabajo focalizado, ideal para optimizar tu agenda y reuniones.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action for Consolidated PDF */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-900/80 border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-white mb-1">
            ¿Deseas exportar estos gráficos y el desglose en un informe ejecutivo?
          </h4>
          <p className="text-xs text-neutral-400">
            Genera un PDF multipágina con todos los gráficos comparativos mensuales y diarios, tablas tabulares y notas para clientes o directivos.
          </p>
        </div>
        <button
          onClick={onNavigateToConsolidated}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer shadow-md shrink-0"
        >
          Crear Reporte Consolidado PDF
        </button>
      </div>
    </div>
  );
};
