import React, { useState, useMemo } from 'react';
import { WorkSession } from '../types';
import { calculateProductivityAnalysis } from '../utils/analytics';
import { formatDateTime, formatDuration, getCategoryInfo } from '../utils/formatters';
import { downloadConsolidatedPDF, downloadSingleSessionPDF } from '../utils/pdfGenerator';
import { exportSessionsCSV, exportDataAsJSON } from '../utils/storage';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Info,
  Check,
  BarChart3,
} from 'lucide-react';

interface ConsolidatedReportViewProps {
  allSessions: WorkSession[];
  preselectedIds: string[];
  availableProjects: string[];
}

export const ConsolidatedReportView: React.FC<ConsolidatedReportViewProps> = ({
  allSessions,
  preselectedIds,
  availableProjects,
}) => {
  const [reportTitle, setReportTitle] = useState('Informe Consolidado de Productividad y Análisis Comparativo');
  const [scopeType, setScopeType] = useState<'all' | 'selected' | 'current_month' | 'last_30_days' | 'project'>(
    preselectedIds.length > 0 ? 'selected' : 'all'
  );
  const [selectedProject, setSelectedProject] = useState<string>(
    availableProjects[0] || 'Todos'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute sessions in scope
  const targetSessions = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (scopeType === 'selected') {
      if (preselectedIds.length > 0) {
        return allSessions.filter((s) => preselectedIds.includes(s.id));
      }
      return allSessions;
    }

    if (scopeType === 'current_month') {
      const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
      return allSessions.filter((s) => new Date(s.startTime).toISOString().slice(0, 7) === currentMonthKey);
    }

    if (scopeType === 'last_30_days') {
      return allSessions.filter((s) => now - s.startTime <= 30 * oneDay);
    }

    if (scopeType === 'project') {
      return allSessions.filter((s) => s.project === selectedProject);
    }

    // Default 'all'
    return allSessions;
  }, [allSessions, scopeType, preselectedIds, selectedProject]);

  const analysis = useMemo(() => {
    return calculateProductivityAnalysis(targetSessions);
  }, [targetSessions]);

  const handleDownloadPDF = async () => {
    if (targetSessions.length === 0) {
      alert('No hay sesiones en el alcance seleccionado para generar el informe.');
      return;
    }

    try {
      setIsGenerating(true);
      setSuccessMessage(null);
      await downloadConsolidatedPDF(targetSessions, reportTitle);
      setSuccessMessage('¡PDF consolidado generado y descargado con éxito!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error generating consolidated PDF:', err);
      alert('Ocurrió un error al generar el PDF: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Módulo de Consolidación Multi-Sesión</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Generador de Reportes Ejecutivos PDF con Comparativas
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
            Agrupa múltiples sesiones de trabajo en un único archivo PDF formal y auditado. Incluye gráficos comparativos diarios y mensuales, distribución horaria, desglose de entregables y memorias de notas.
          </p>
        </div>

        {/* Configuration inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-neutral-800">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Título del Reporte PDF
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Ej: Auditoría de Productividad Q4 - Cliente Acme"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Alcance de Sesiones a Consolidar
            </label>
            <select
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="all">Todas las sesiones registradas ({allSessions.length})</option>
              {preselectedIds.length > 0 && (
                <option value="selected">
                  Sesiones seleccionadas con casillas ({preselectedIds.length})
                </option>
              )}
              <option value="current_month">Únicamente el mes en curso</option>
              <option value="last_30_days">Últimos 30 días</option>
              <option value="project">Filtrar por proyecto específico...</option>
            </select>
          </div>
        </div>

        {/* Conditional Project Selector */}
        {scopeType === 'project' && (
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center gap-3 text-xs">
            <span className="text-neutral-400">Seleccionar Proyecto:</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white rounded px-3 py-1.5"
            >
              {availableProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action button strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-800">
          <div className="text-xs text-neutral-400">
            <span>Sesiones incluidas: </span>
            <span className="font-mono font-bold text-white tabular-nums">
              {targetSessions.length}
            </span>
            <span className="mx-2">·</span>
            <span>Total horas: </span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              {analysis.totalHours} h
            </span>
            <span className="mx-2">·</span>
            <span>Foco promedio: </span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              {analysis.overallFocusScore} / 5 ★
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportSessionsCSV(targetSessions)}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition-colors cursor-pointer"
              title="Descargar datos en CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => exportDataAsJSON(targetSessions)}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition-colors cursor-pointer"
              title="Exportar respaldo JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating || targetSessions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar PDF Consolidado'}</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Live PDF Preview Mockup */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Vista Previa en Vivo del Documento PDF
            </h3>
            <p className="text-xs text-neutral-500">
              Así se estructuran las 2 páginas del reporte PDF oficial que recibirás al descargar.
            </p>
          </div>
        </div>

        {/* 2-page grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mockup Page 1 */}
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-6 shadow-2xl space-y-4 text-xs font-sans relative">
            <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-500">
              Página 1 / 2
            </div>

            {/* Document Header */}
            <div className="border-b border-slate-700 pb-3">
              <div className="text-[10px] font-bold text-emerald-400 tracking-wider">
                CRONOTASK PRODUCTIVITY PLATFORM
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{reportTitle}</h4>
              <div className="text-[10px] text-slate-400 mt-1">
                Generado: {new Date().toLocaleDateString('es-ES')} · Alcance: {targetSessions.length} sesiones analizadas
              </div>
            </div>

            {/* 4 Mini KPIs */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                <div className="text-[9px] text-slate-400">HORAS</div>
                <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                  {analysis.totalHours}h
                </div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                <div className="text-[9px] text-slate-400">PROMEDIO</div>
                <div className="text-sm font-bold font-mono text-sky-400 tabular-nums">
                  {analysis.avgDailyHours}h
                </div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                <div className="text-[9px] text-slate-400">FOCO</div>
                <div className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                  {analysis.overallFocusScore}★
                </div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                <div className="text-[9px] text-slate-400">LÍDER</div>
                <div className="text-[10px] font-bold text-indigo-300 truncate">
                  {analysis.topProject.name}
                </div>
              </div>
            </div>

            {/* Daily Chart Preview Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200 mb-2">
                <span>[Gráfico 1] Comparativa Diaria de Rendimiento</span>
                <span className="text-[9px] font-mono text-slate-400">Últimos días</span>
              </div>
              <div className="h-20 flex items-end gap-1.5 pt-2 pb-1 border-b border-slate-800">
                {analysis.dailyTrend.slice(-10).map((d) => {
                  const maxH = Math.max(3, ...analysis.dailyTrend.map((x) => x.totalHours));
                  const hPct = Math.max(6, Math.round((d.totalHours / maxH) * 100));
                  return (
                    <div key={d.dateKey} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        style={{ height: `${hPct}%` }}
                        className="w-full bg-emerald-500 rounded-t"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                <span>Día 1</span>
                <span>Día final</span>
              </div>
            </div>

            {/* Monthly Chart Preview Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200 mb-2">
                <span>[Gráfico 2] Comparativa Mensual de Horas y Sesiones</span>
                <span className="text-[9px] font-mono text-indigo-400">Tendencia MoM</span>
              </div>
              <div className="h-16 flex items-end gap-3 pt-2 pb-1 border-b border-slate-800">
                {analysis.monthlyTrend.map((m) => {
                  const maxH = Math.max(10, ...analysis.monthlyTrend.map((x) => x.totalHours));
                  const hPct = Math.max(8, Math.round((m.totalHours / maxH) * 100));
                  return (
                    <div key={m.monthKey} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] font-mono text-slate-300 mb-0.5">{m.totalHours}h</span>
                      <div
                        style={{ height: `${hPct}%` }}
                        className="w-full bg-indigo-500 rounded-t"
                      />
                      <span className="text-[8px] text-slate-400 mt-1">{m.shortMonth}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown snippet */}
            <div className="bg-slate-800/50 p-2.5 rounded border border-slate-700/40 text-[10px]">
              <div className="font-semibold text-slate-300 mb-1">Distribución por Categoría:</div>
              <div className="flex flex-wrap gap-2 text-slate-400">
                {analysis.categoryBreakdown.slice(0, 4).map((c) => (
                  <span key={c.category}>
                    {c.label}: <strong className="text-white">{c.hours}h ({c.percentage}%)</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mockup Page 2 */}
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-6 shadow-2xl space-y-4 text-xs font-sans relative">
            <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-500">
              Página 2 / 2
            </div>

            {/* Header Page 2 */}
            <div className="border-b border-slate-700 pb-3">
              <h4 className="text-sm font-bold text-white">
                Apéndice: Desglose y Catálogo Detallado de Sesiones
              </h4>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {targetSessions.length} sesiones auditadas con notas y entregables
              </div>
            </div>

            {/* Table Mockup */}
            <div className="space-y-1.5 max-h-[300px] overflow-hidden">
              {targetSessions.slice(0, 6).map((s, idx) => (
                <div
                  key={s.id}
                  className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[10px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate max-w-[180px]">{s.title}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {formatDuration(s.durationSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[9px]">
                    <span>
                      {s.project} · {new Date(s.startTime).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-amber-400 font-mono">{s.focusScore}★</span>
                  </div>
                  {s.notes && (
                    <div className="text-slate-400 text-[9px] line-clamp-1 italic">
                      "{s.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {targetSessions.length > 6 && (
              <div className="text-[10px] text-slate-400 text-center italic">
                + {targetSessions.length - 6} sesiones adicionales incluidas en el documento descargable
              </div>
            )}

            {/* Conclusion box */}
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-[10px] text-slate-300">
              <div className="font-bold text-white mb-1">Conclusiones de Productividad:</div>
              <p className="leading-relaxed">
                El período auditado refleja una dedicación de {analysis.totalHours} horas netas de trabajo productivo a través de {analysis.totalSessions} sesiones con un promedio de foco de {analysis.overallFocusScore}/5. El proyecto líder fue "{analysis.topProject.name}".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
