import React, { useState } from 'react';
import { SessionCategory, WorkSession } from '../types';
import { getCategoryInfo } from '../utils/formatters';
import { X, Plus, Calendar, Clock } from 'lucide-react';

interface ManualSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (session: WorkSession) => void;
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

export const ManualSessionModal: React.FC<ManualSessionModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
  availableProjects,
}) => {
  if (!isOpen) return null;

  // Defaults to today
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toTimeString().slice(0, 5);

  const [title, setTitle] = useState('');
  const [project, setProject] = useState(availableProjects[0] || 'Proyecto Principal');
  const [category, setCategory] = useState<SessionCategory>('development');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(currentTimeStr);
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [focusScore, setFocusScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [tasksText, setTasksText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const totalSeconds = h * 3600 + m * 60;

    if (totalSeconds <= 0) {
      alert('Por favor especifica una duración válida mayor a 0 minutos.');
      return;
    }

    const startDateTime = new Date(`${date}T${time}:00`);
    const startMs = startDateTime.getTime() || Date.now();
    const endMs = startMs + totalSeconds * 1000;

    const parsedTasks = tasksText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `m-task-${Date.now()}-${idx}`,
        text: text.replace(/^[-*•]\s*/, ''),
        completed: true,
      }));

    const newSession: WorkSession = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim() || 'Sesión de trabajo registrada manualmente',
      project: project.trim() || 'General',
      category,
      startTime: startMs,
      endTime: endMs,
      durationSeconds: totalSeconds,
      breakDurationSeconds: 0,
      notes: notes.trim(),
      tasks: parsedTasks,
      focusScore,
      energyLevel: 'high',
      tags: ['registro-manual'],
      createdAt: Date.now(),
    };

    onAddSession(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-white">Registrar Sesión Manual</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Añade horas trabajadas fuera de línea o pasadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Título / Actividad Realizada
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Análisis de requerimientos y reunión técnica"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Proyecto
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                list="manual-projects"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="manual-projects">
                {availableProjects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryInfo(cat).label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Duration Inputs */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Duración Dedicada
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white text-center font-mono"
                />
                <span className="text-xs text-neutral-400">horas</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white text-center font-mono"
                />
                <span className="text-xs text-neutral-400">minutos</span>
              </div>
            </div>
          </div>

          {/* Focus Score */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Índice de Foco Autoevaluado
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFocusScore(star)}
                  className={`text-xl transition-transform hover:scale-110 cursor-pointer ${
                    star <= focusScore ? 'text-amber-400' : 'text-neutral-700'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs text-neutral-400 ml-2 font-mono">{focusScore}/5</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Notas y Resumen de la Sesión
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe lo realizado durante este tiempo..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {/* Tasks text */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Tareas o Entregables (una por línea)
            </label>
            <textarea
              rows={2}
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              placeholder="Ej:&#10;Entregable 1&#10;Revisión de pull request"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Registrar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
