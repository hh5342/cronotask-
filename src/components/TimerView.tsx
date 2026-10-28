import React, { useState, useEffect, useRef } from 'react';
import { ActiveTimerData, SessionCategory, TaskItem, WorkSession } from '../types';
import { formatDuration, getCategoryInfo } from '../utils/formatters';
import { Play, Pause, Square, Plus, Trash2, CheckCircle2, Circle, Clock, Flame, Tag, AlertCircle } from 'lucide-react';

interface TimerViewProps {
  activeTimer: ActiveTimerData;
  onUpdateTimer: (updated: ActiveTimerData) => void;
  onFinishSession: (session: WorkSession) => void;
  onDiscardTimer: () => void;
  availableProjects: string[];
}

const CATEGORIES: SessionCategory[] = [
  'development',
  'design',
  'research',
  'meeting',
  'writing',
  'management',
  'learning',
  'other',
];

export const TimerView: React.FC<TimerViewProps> = ({
  activeTimer,
  onUpdateTimer,
  onFinishSession,
  onDiscardTimer,
  availableProjects,
}) => {
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [customProjectInput, setCustomProjectInput] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const activeTimerRef = useRef(activeTimer);
  activeTimerRef.current = activeTimer;

  // Accurate timer tick calculation using Date.now() without re-subscribing every second
  useEffect(() => {
    if (activeTimer.status !== 'running') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      const current = activeTimerRef.current;
      const now = Date.now();
      const last = current.lastTickAt || now;
      const deltaSec = Math.max(1, Math.round((now - last) / 1000));

      onUpdateTimer({
        ...current,
        elapsedSeconds: current.elapsedSeconds + deltaSec,
        lastTickAt: now,
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeTimer.status]);

  // Handle Play / Start
  const handleStart = () => {
    setErrorNotice(null);
    const now = Date.now();
    onUpdateTimer({
      ...activeTimer,
      status: 'running',
      startedAt: activeTimer.startedAt || now,
      lastTickAt: now,
      pauseStartedAt: null,
    });
  };

  // Handle Pause
  const handlePause = () => {
    const now = Date.now();
    onUpdateTimer({
      ...activeTimer,
      status: 'paused',
      pauseStartedAt: now,
      lastTickAt: null,
    });
  };

  // Handle Resume
  const handleResume = () => {
    const now = Date.now();
    let additionalBreak = 0;
    if (activeTimer.pauseStartedAt) {
      additionalBreak = Math.round((now - activeTimer.pauseStartedAt) / 1000);
    }

    onUpdateTimer({
      ...activeTimer,
      status: 'running',
      lastTickAt: now,
      breakSeconds: activeTimer.breakSeconds + additionalBreak,
      pauseStartedAt: null,
    });
  };

  // Handle Finish & Save
  const handleFinish = () => {
    if (activeTimer.elapsedSeconds < 5) {
      setErrorNotice('La sesión debe durar al menos 5 segundos para ser registrada.');
      return;
    }

    const titleToUse = activeTimer.title.trim() || 'Sesión de trabajo sin título';
    const now = Date.now();
    const startMs = activeTimer.startedAt || (now - activeTimer.elapsedSeconds * 1000);

    const completedSession: WorkSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: titleToUse,
      project: activeTimer.project.trim() || 'General',
      category: activeTimer.category,
      startTime: startMs,
      endTime: now,
      durationSeconds: activeTimer.elapsedSeconds,
      breakDurationSeconds: activeTimer.breakSeconds,
      notes: activeTimer.notes,
      tasks: activeTimer.tasks,
      blockers: activeTimer.blockers,
      nextSteps: activeTimer.nextSteps,
      focusScore: activeTimer.focusScore,
      energyLevel: 'high',
      tags: activeTimer.tags,
      createdAt: now,
    };

    onFinishSession(completedSession);
  };

  // Add subtask
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      text: newTaskInput.trim(),
      completed: false,
    };
    onUpdateTimer({
      ...activeTimer,
      tasks: [...activeTimer.tasks, newTask],
    });
    setNewTaskInput('');
  };

  // Toggle subtask
  const toggleTask = (id: string) => {
    onUpdateTimer({
      ...activeTimer,
      tasks: activeTimer.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    });
  };

  // Remove subtask
  const removeTask = (id: string) => {
    onUpdateTimer({
      ...activeTimer,
      tasks: activeTimer.tasks.filter((t) => t.id !== id),
    });
  };

  // Add Tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!tag) return;
    if (!activeTimer.tags.includes(tag)) {
      onUpdateTimer({
        ...activeTimer,
        tags: [...activeTimer.tags, tag],
      });
    }
    setNewTagInput('');
  };

  // Remove Tag
  const removeTag = (tagToRemove: string) => {
    onUpdateTimer({
      ...activeTimer,
      tags: activeTimer.tags.filter((t) => t !== tagToRemove),
    });
  };

  const isPomodoro = activeTimer.mode === 'pomodoro';
  const targetSeconds = activeTimer.targetMinutes * 60;
  const pomodoroProgress = isPomodoro
    ? Math.min(100, (activeTimer.elapsedSeconds / targetSeconds) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer Hero Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle glow when running */}
        {activeTimer.status === 'running' && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
            <button
              onClick={() => onUpdateTimer({ ...activeTimer, mode: 'stopwatch' })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTimer.mode === 'stopwatch'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cronómetro Libre
            </button>
            <button
              onClick={() => onUpdateTimer({ ...activeTimer, mode: 'pomodoro' })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTimer.mode === 'pomodoro'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Bloque Pomodoro
            </button>
          </div>

          {isPomodoro && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400">Objetivo:</span>
              {[25, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateTimer({ ...activeTimer, targetMinutes: mins })}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    activeTimer.targetMinutes === mins
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            {activeTimer.breakSeconds > 0 && (
              <span className="font-mono">
                Pausa acumulada: <span className="text-amber-400">{formatDuration(activeTimer.breakSeconds)}</span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium ${
                activeTimer.status === 'running'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : activeTimer.status === 'paused'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeTimer.status === 'running'
                    ? 'bg-emerald-400'
                    : activeTimer.status === 'paused'
                    ? 'bg-amber-400'
                    : 'bg-neutral-500'
                }`}
              />
              {activeTimer.status === 'running'
                ? 'Activo'
                : activeTimer.status === 'paused'
                ? 'Pausado'
                : 'En reposo'}
            </span>
          </div>
        </div>

        {/* Big Digital Display */}
        <div className="text-center py-4 sm:py-6">
          <div className="text-6xl sm:text-7xl md:text-8xl font-mono font-bold tracking-tight text-white tabular-nums drop-shadow-sm select-none">
            {formatDuration(activeTimer.elapsedSeconds, true)}
          </div>

          {/* Pomodoro Progress Bar */}
          {isPomodoro && (
            <div className="max-w-md mx-auto mt-4">
              <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                <span>Avance de bloque</span>
                <span>{Math.round(pomodoroProgress)}% ({formatDuration(targetSeconds)})</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pomodoroProgress}%` }}
                  className="h-full bg-emerald-400 transition-all duration-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {activeTimer.status === 'idle' && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 text-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Iniciar Sesión</span>
            </button>
          )}

          {activeTimer.status === 'running' && (
            <>
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl transition-colors text-sm border border-neutral-700 cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </button>
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-all text-sm shadow-md cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finalizar y Guardar</span>
              </button>
            </>
          )}

          {activeTimer.status === 'paused' && (
            <>
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-all text-sm cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Reanudar</span>
              </button>
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl transition-colors text-sm border border-neutral-700 cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>Guardar Ahora</span>
              </button>
            </>
          )}

          {activeTimer.status !== 'idle' && (
            <button
              onClick={onDiscardTimer}
              className="px-3 py-2 text-xs text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Descartar
            </button>
          )}
        </div>

        {errorNotice && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}
      </div>

      {/* Session Details Form Card (Editable while running or preparing) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Metadatos y Contexto de la Sesión
          </h3>
          <p className="text-xs text-neutral-400">
            Define la tarea, el proyecto asignado y toma notas mientras trabajas. Todo se guarda automáticamente.
          </p>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">
            Título / Tarea Principal
          </label>
          <input
            type="text"
            value={activeTimer.title}
            onChange={(e) => onUpdateTimer({ ...activeTimer, title: e.target.value })}
            placeholder="Ej: Implementación de pipeline de exportación PDF"
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Project & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Project */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Proyecto
            </label>
            {!isAddingProject ? (
              <div className="flex gap-2">
                <select
                  value={activeTimer.project}
                  onChange={(e) => onUpdateTimer({ ...activeTimer, project: e.target.value })}
                  className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {availableProjects.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddingProject(true)}
                  className="px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors whitespace-nowrap"
                  title="Nuevo proyecto"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customProjectInput}
                  onChange={(e) => setCustomProjectInput(e.target.value)}
                  placeholder="Nombre del nuevo proyecto"
                  className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customProjectInput.trim()) {
                      onUpdateTimer({ ...activeTimer, project: customProjectInput.trim() });
                      setCustomProjectInput('');
                    }
                    setIsAddingProject(false);
                  }}
                  className="px-3 py-2 bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg"
                >
                  Usar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingProject(false)}
                  className="px-2 py-2 text-neutral-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Categoría de Trabajo
            </label>
            <select
              value={activeTimer.category}
              onChange={(e) =>
                onUpdateTimer({ ...activeTimer, category: e.target.value as SessionCategory })
              }
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {CATEGORIES.map((cat) => {
                const info = getCategoryInfo(cat);
                return (
                  <option key={cat} value={cat}>
                    {info.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Checklist of subtasks */}
        <div className="pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-neutral-300">
              Checklist de Entregables / Subtareas
            </label>
            <span className="text-[11px] text-neutral-500 font-mono">
              {activeTimer.tasks.filter((t) => t.completed).length}/{activeTimer.tasks.length} completadas
            </span>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="Añadir entregable o subobjetivo (Enter)..."
              className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </form>

          {activeTimer.tasks.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {activeTimer.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-3 py-2 bg-neutral-950/60 border border-neutral-800/60 rounded-lg group"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2 text-xs text-left cursor-pointer flex-1"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-500 shrink-0" />
                    )}
                    <span
                      className={`${
                        task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {task.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Pad */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">
            Notas de la Sesión y Memoria de Actividad
          </label>
          <textarea
            rows={4}
            value={activeTimer.notes}
            onChange={(e) => onUpdateTimer({ ...activeTimer, notes: e.target.value })}
            placeholder="Documenta decisiones técnicas, enlaces, dudas resueltas o detalles para el informe final..."
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-y font-sans leading-relaxed"
          />
        </div>

        {/* Blockers & Next Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Obstáculos o Fricción (Opcional)
            </label>
            <input
              type="text"
              value={activeTimer.blockers}
              onChange={(e) => onUpdateTimer({ ...activeTimer, blockers: e.target.value })}
              placeholder="Ej: Dependencia bloqueante, lentitud de build..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Próximos Pasos (Opcional)
            </label>
            <input
              type="text"
              value={activeTimer.nextSteps}
              onChange={(e) => onUpdateTimer({ ...activeTimer, nextSteps: e.target.value })}
              placeholder="Ej: Continuar con tests de integración..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
            />
          </div>
        </div>

        {/* Self-Rating Focus Score & Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-neutral-800/80">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Autoevaluación de Foco y Concentración
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onUpdateTimer({ ...activeTimer, focusScore: star })}
                  className={`text-lg transition-transform hover:scale-110 cursor-pointer ${
                    star <= activeTimer.focusScore ? 'text-amber-400' : 'text-neutral-700'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs text-neutral-400 ml-2 font-mono">
                {activeTimer.focusScore}/5
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="sm:max-w-xs w-full">
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Etiquetas
            </label>
            <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Nueva etiqueta..."
                className="flex-1 px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-neutral-800 text-neutral-300 hover:text-white text-xs rounded-lg"
              >
                +
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {activeTimer.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
