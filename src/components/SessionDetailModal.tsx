import React, { useState } from 'react';
import { SessionCategory, TaskItem, WorkSession } from '../types';
import { formatDateTime, formatDuration, getCategoryInfo } from '../utils/formatters';
import { downloadSingleSessionPDF } from '../utils/pdfGenerator';
import { X, Download, Save, Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';

interface SessionDetailModalProps {
  session: WorkSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSession: (updated: WorkSession) => void;
  onDeleteSession: (id: string) => void;
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

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  onUpdateSession,
  onDeleteSession,
  availableProjects,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(session.title);
  const [project, setProject] = useState(session.project);
  const [category, setCategory] = useState<SessionCategory>(session.category);
  const [notes, setNotes] = useState(session.notes);
  const [tasks, setTasks] = useState<TaskItem[]>(session.tasks || []);
  const [blockers, setBlockers] = useState(session.blockers || '');
  const [nextSteps, setNextSteps] = useState(session.nextSteps || '');
  const [focusScore, setFocusScore] = useState(session.focusScore);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSession({
      ...session,
      title: title.trim() || 'Sesión sin título',
      project: project.trim() || 'General',
      category,
      notes,
      tasks,
      blockers,
      nextSteps,
      focusScore,
    });
    onClose();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await downloadSingleSessionPDF({
        ...session,
        title,
        project,
        category,
        notes,
        tasks,
        blockers,
        nextSteps,
        focusScore,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([...tasks, { id: `task-${Date.now()}`, text: newTaskInput.trim(), completed: true }]);
    setNewTaskInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-white">Detalle y Edición de Sesión</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {formatDateTime(session.startTime)} · Duración {formatDuration(session.durationSeconds)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Título de la Sesión
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Project & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Proyecto
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                list="project-suggestions"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="project-suggestions">
                {availableProjects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
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

          {/* Focus Score */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Autoevaluación de Foco
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

          {/* Checklist */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Tareas y Entregables Completados
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Añadir tarea..."
                className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-200 text-xs rounded-lg hover:text-white"
              >
                + Añadir
              </button>
            </div>

            <div className="space-y-1.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/70 border border-neutral-800 rounded-lg text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    )}
                    <span className={task.completed ? 'line-through text-neutral-500' : 'text-white'}>
                      {task.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="text-neutral-500 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Notas y Memoria de Actividad
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {/* Blockers & Next steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Obstáculos Reportados
              </label>
              <input
                type="text"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Próximos Pasos
              </label>
              <input
                type="text"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Confirmas que deseas eliminar esta sesión?')) {
                  onDeleteSession(session.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Sesión</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isDownloading ? 'Generando...' : 'Descargar PDF'}</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
