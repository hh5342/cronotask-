import React, { useState, useMemo } from 'react';
import { SessionCategory, WorkSession } from '../types';
import { formatDateTime, formatDuration, getCategoryInfo } from '../utils/formatters';
import { downloadSingleSessionPDF } from '../utils/pdfGenerator';
import {
  Search,
  Filter,
  Download,
  FileText,
  Trash2,
  Edit3,
  CheckSquare,
  Square as SquareIcon,
  Sparkles,
  Layers,
  ArrowUpDown,
  Calendar,
  Clock,
} from 'lucide-react';

interface SessionListProps {
  sessions: WorkSession[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onDeleteSession: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onOpenDetailModal: (session: WorkSession) => void;
  onGenerateConsolidatedPDF: (selectedSessions: WorkSession[]) => void;
  availableProjects: string[];
  onNavigateToTimer: () => void;
  onOpenManualModal: () => void;
  onLoadSampleData: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onDeleteSession,
  onDeleteMultiple,
  onOpenDetailModal,
  onGenerateConsolidatedPDF,
  availableProjects,
  onNavigateToTimer,
  onOpenManualModal,
  onLoadSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<SessionCategory | 'ALL'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filtered & Sorted Sessions
  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return sessions
      .filter((session) => {
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = session.title.toLowerCase().includes(q);
          const matchProj = session.project.toLowerCase().includes(q);
          const matchNotes = (session.notes || '').toLowerCase().includes(q);
          const matchTags = session.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchProj && !matchNotes && !matchTags) return false;
        }

        // Project
        if (projectFilter !== 'ALL' && session.project !== projectFilter) {
          return false;
        }

        // Category
        if (categoryFilter !== 'ALL' && session.category !== categoryFilter) {
          return false;
        }

        // Time
        if (timeFilter === 'TODAY') {
          return now - session.startTime <= oneDay;
        }
        if (timeFilter === 'WEEK') {
          return now - session.startTime <= 7 * oneDay;
        }
        if (timeFilter === 'MONTH') {
          return now - session.startTime <= 31 * oneDay;
        }

        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'desc' ? b.startTime - a.startTime : a.startTime - b.startTime;
      });
  }, [sessions, searchTerm, projectFilter, categoryFilter, timeFilter, sortOrder]);

  const allFilteredSelected =
    filteredSessions.length > 0 &&
    filteredSessions.every((s) => selectedIds.includes(s.id));

  const handleSelectAllToggle = () => {
    if (allFilteredSelected) {
      onClearSelection();
    } else {
      onSelectAll(filteredSessions.map((s) => s.id));
    }
  };

  const handleDownloadSinglePDF = async (session: WorkSession, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloadingId(session.id);
      await downloadSingleSessionPDF(session);
    } catch (err) {
      console.error('Error generating single PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const selectedSessionsList = useMemo(() => {
    return sessions.filter((s) => selectedIds.includes(s.id));
  }, [sessions, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Control / Filter Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, proyecto, notas o etiquetas..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg shrink-0">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'TODAY', label: 'Hoy' },
              { id: 'WEEK', label: 'Últimos 7d' },
              { id: 'MONTH', label: 'Este Mes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeFilter(tab.id as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeFilter === tab.id
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Project Filter */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Proyecto:</span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="ALL">Todos los proyectos</option>
                {availableProjects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Categoría:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="ALL">Todas las categorías</option>
                <option value="development">Desarrollo</option>
                <option value="design">Diseño</option>
                <option value="research">Investigación</option>
                <option value="meeting">Reunión</option>
                <option value="writing">Redacción</option>
                <option value="management">Gestión</option>
                <option value="learning">Aprendizaje</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguas primero'}</span>
            </button>

            <span className="text-neutral-600">|</span>

            <span className="text-neutral-400 font-mono">
              {filteredSessions.length} sesión{filteredSessions.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Batch Actions Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-neutral-900 border border-emerald-500/40 shadow-xl rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-400 font-mono">
              {selectedIds.length} sesión{selectedIds.length > 1 ? 'es' : ''} seleccionada{selectedIds.length > 1 ? 's' : ''}
            </span>
            <span className="text-neutral-500">·</span>
            <button
              onClick={onClearSelection}
              className="text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Deseleccionar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onGenerateConsolidatedPDF(selectedSessionsList)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Generar PDF Consolidado ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => onDeleteMultiple(selectedIds)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-rose-950/60 text-neutral-300 hover:text-rose-400 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      )}

      {/* Sessions Grid / Table */}
      {filteredSessions.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-10 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Clock className="w-6 h-6" />
          </div>
          {sessions.length === 0 ? (
            <>
              <h3 className="text-base font-semibold text-white">Base de datos vacía y lista</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                No tienes ninguna sesión registrada. La aplicación está completamente limpia para que empieces a registrar tus propias sesiones desde cero.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onNavigateToTimer}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Iniciar Primer Cronómetro
                </button>
                <button
                  onClick={onOpenManualModal}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Registro Manual
                </button>
                <button
                  onClick={onLoadSampleData}
                  className="px-4 py-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Cargar Datos de Muestra
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-white">No hay coincidencias</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                No se encontraron sesiones para los filtros seleccionados. Intenta restablecer el texto de búsqueda o los selectores.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Row for Selection */}
          <div className="flex items-center justify-between px-2 text-xs text-neutral-500">
            <button
              onClick={handleSelectAllToggle}
              className="flex items-center gap-2 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <SquareIcon className="w-4 h-4 text-neutral-500" />
              )}
              <span>{allFilteredSelected ? 'Deseleccionar todas' : 'Seleccionar todas las visibles'}</span>
            </button>

            <span>Haz clic en cualquier sesión para ver o editar sus notas completas</span>
          </div>

          {filteredSessions.map((session) => {
            const isSelected = selectedIds.includes(session.id);
            const catInfo = getCategoryInfo(session.category);
            const completedTasks = session.tasks.filter((t) => t.completed).length;

            return (
              <div
                key={session.id}
                onClick={() => onOpenDetailModal(session)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-neutral-900 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                    : 'bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Column: Checkbox, Project, Title, Metadata */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(session.id);
                      }}
                      className="mt-1 text-neutral-500 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <SquareIcon className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Quiet metadata line without pills */}
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="font-semibold text-neutral-200">{session.project}</span>
                        <span aria-hidden="true">·</span>
                        <span className={catInfo.textClass}>{catInfo.label}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDateTime(session.startTime)}</span>
                        {session.tasks.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-neutral-400">
                              {completedTasks}/{session.tasks.length} entregables
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {session.title}
                      </h4>

                      {/* Notes snippet */}
                      {session.notes && (
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Duration, Focus Score, Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80">
                    {/* Focus Star indicator */}
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                      <span>★</span>
                      <span>{session.focusScore}</span>
                    </div>

                    {/* Duration */}
                    <div className="text-right">
                      <div className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                        {formatDuration(session.durationSeconds)}
                      </div>
                      {session.breakDurationSeconds > 0 && (
                        <div className="text-[10px] font-mono text-neutral-500">
                          pausa {formatDuration(session.breakDurationSeconds)}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSinglePDF(session, e)}
                        disabled={downloadingId === session.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs transition-colors border border-neutral-700/80 cursor-pointer"
                        title="Descargar reporte individual en PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden md:inline">
                          {downloadingId === session.id ? 'Descargando...' : 'PDF'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('¿Seguro que deseas eliminar esta sesión?')) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Eliminar sesión"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
