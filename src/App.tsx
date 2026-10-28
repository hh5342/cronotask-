import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, ActiveTimerData, WorkSession } from './types';
import {
  loadSessions,
  saveSessions,
  syncSessionsToServer,
  loadActiveTimer,
  saveActiveTimer,
  clearAllSessions,
  getSampleSessions,
  fetchServerSessions,
  DEFAULT_ACTIVE_TIMER,
} from './utils/storage';
import { Header } from './components/Header';
import { TimerView } from './components/TimerView';
import { SessionList } from './components/SessionList';
import { AnalyticsView } from './components/AnalyticsView';
import { ConsolidatedReportView } from './components/ConsolidatedReportView';
import { SessionDetailModal } from './components/SessionDetailModal';
import { ManualSessionModal } from './components/ManualSessionModal';
import { DataManagementModal } from './components/DataManagementModal';
import { DesktopLauncherModal } from './components/DesktopLauncherModal';
import { CheckCircle2, RotateCcw, Trash2, Database, ShieldCheck, Laptop } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState<WorkSession[]>(() => loadSessions());
  const [activeTimer, setActiveTimer] = useState<ActiveTimerData>(() => loadActiveTimer());
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectingSession, setInspectingSession] = useState<WorkSession | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync from server disk file on initial load if available
  useEffect(() => {
    fetchServerSessions().then((serverSessions) => {
      if (serverSessions && Array.isArray(serverSessions)) {
        setSessions(serverSessions);
      }
    });
  }, []);

  // Sync sessions to localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Sync active timer to localStorage
  useEffect(() => {
    saveActiveTimer(activeTimer);
  }, [activeTimer]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Available unique project names
  const availableProjects = useMemo(() => {
    const set = new Set<string>(['Cronotask Platform', 'Investigación & Core', 'Cliente Acme Corp', 'Gestión Interna']);
    sessions.forEach((s) => {
      if (s.project && s.project.trim()) {
        set.add(s.project.trim());
      }
    });
    return Array.from(set);
  }, [sessions]);

  // Handlers for Timer
  const handleUpdateTimer = (updated: ActiveTimerData) => {
    setActiveTimer(updated);
  };

  const handleFinishSession = (newSession: WorkSession) => {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    syncSessionsToServer(updated);
    setActiveTimer({
      ...DEFAULT_ACTIVE_TIMER,
      project: activeTimer.project,
      category: activeTimer.category,
    });
    setToastMessage(`¡Sesión guardada con éxito! ("${newSession.title}")`);
    setActiveTab('sessions');
  };

  const handleDiscardTimer = () => {
    if (window.confirm('¿Seguro que deseas descartar el tiempo transcurrido de esta sesión?')) {
      setActiveTimer(DEFAULT_ACTIVE_TIMER);
    }
  };

  // Handlers for Sessions
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    syncSessionsToServer(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setToastMessage('Sesión eliminada.');
  };

  const handleDeleteMultiple = (ids: string[]) => {
    if (window.confirm(`¿Confirmas eliminar las ${ids.length} sesiones seleccionadas?`)) {
      const updated = sessions.filter((s) => !ids.includes(s.id));
      setSessions(updated);
      syncSessionsToServer(updated);
      setSelectedIds([]);
      setToastMessage(`${ids.length} sesiones eliminadas.`);
    }
  };

  const handleUpdateSession = (updatedSession: WorkSession) => {
    const updated = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setSessions(updated);
    syncSessionsToServer(updated);
    setToastMessage('Sesión actualizada correctamente.');
  };

  const handleAddManualSession = (newSession: WorkSession) => {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    syncSessionsToServer(updated);
    setToastMessage(`Sesión manual registrada: "${newSession.title}"`);
    setActiveTab('sessions');
  };

  const handleNavigateToConsolidatedWithSelection = (selectedSessions: WorkSession[]) => {
    setSelectedIds(selectedSessions.map((s) => s.id));
    setActiveTab('consolidated');
  };

  // Clear all data to start fresh from scratch (0 sessions)
  const handleClearAllData = () => {
    setSessions([]);
    clearAllSessions();
    setSelectedIds([]);
    setActiveTimer(DEFAULT_ACTIVE_TIMER);
    setToastMessage('Base de datos vaciada. Puedes empezar a registrar tus sesiones desde cero.');
  };

  // Load demo sample sessions
  const handleLoadSamples = () => {
    const samples = getSampleSessions();
    setSessions(samples);
    syncSessionsToServer(samples);
    setSelectedIds([]);
    setToastMessage('Datos de muestra cargados con éxito.');
  };

  // Import JSON backup
  const handleImportSessions = (imported: WorkSession[]) => {
    setSessions(imported);
    syncSessionsToServer(imported);
    setSelectedIds([]);
    setToastMessage(`Se importaron ${imported.length} sesiones con éxito.`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        isTimerRunning={activeTimer.status === 'running'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-8">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mb-6 max-w-md mx-auto p-3 bg-neutral-900 border border-emerald-500/50 rounded-xl shadow-xl flex items-center gap-3 text-xs text-white animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-medium">{toastMessage}</span>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'timer' && (
          <TimerView
            activeTimer={activeTimer}
            onUpdateTimer={handleUpdateTimer}
            onFinishSession={handleFinishSession}
            onDiscardTimer={handleDiscardTimer}
            availableProjects={availableProjects}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionList
            sessions={sessions}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onDeleteSession={handleDeleteSession}
            onDeleteMultiple={handleDeleteMultiple}
            onOpenDetailModal={(session) => setInspectingSession(session)}
            onGenerateConsolidatedPDF={handleNavigateToConsolidatedWithSelection}
            availableProjects={availableProjects}
            onNavigateToTimer={() => setActiveTab('timer')}
            onOpenManualModal={() => setIsManualModalOpen(true)}
            onLoadSampleData={handleLoadSamples}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            sessions={sessions}
            onNavigateToConsolidated={() => setActiveTab('consolidated')}
          />
        )}

        {activeTab === 'consolidated' && (
          <ConsolidatedReportView
            allSessions={sessions}
            preselectedIds={selectedIds}
            availableProjects={availableProjects}
          />
        )}
      </main>

      {/* Modals */}
      {inspectingSession && (
        <SessionDetailModal
          session={inspectingSession}
          isOpen={true}
          onClose={() => setInspectingSession(null)}
          onUpdateSession={handleUpdateSession}
          onDeleteSession={handleDeleteSession}
          availableProjects={availableProjects}
        />
      )}

      {isManualModalOpen && (
        <ManualSessionModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onAddSession={handleAddManualSession}
          availableProjects={availableProjects}
        />
      )}

      {isDataModalOpen && (
        <DataManagementModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          sessions={sessions}
          onClearAll={handleClearAllData}
          onLoadSamples={handleLoadSamples}
          onImportSessions={handleImportSessions}
        />
      )}

      {isDesktopModalOpen && (
        <DesktopLauncherModal
          isOpen={isDesktopModalOpen}
          onClose={() => setIsDesktopModalOpen(false)}
        />
      )}

      {/* Clean Footer with Data Management Affordances */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold text-neutral-300">Cronotask</span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardado en local (data/sessions.json & localStorage)</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsDesktopModalOpen(true)}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Abrir en Desktop</span>
            </button>

            <button
              onClick={() => setIsDataModalOpen(true)}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gestión de Datos & Respaldos</span>
            </button>

            <button
              onClick={handleClearAllData}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
              title="Borrar todas las sesiones y empezar de cero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empezar de cero</span>
            </button>

            <button
              onClick={handleLoadSamples}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              title="Cargar datos de ejemplo para pruebas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cargar datos de muestra</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
