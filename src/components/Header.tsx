import React from 'react';
import { ActiveTab } from '../types';
import { Timer, ListTodo, BarChart3, FileText, Plus, Database, Laptop, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenManualModal: () => void;
  onOpenDataModal: () => void;
  onOpenDesktopModal: () => void;
  activeSessionDuration?: number;
  isTimerRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenManualModal,
  onOpenDataModal,
  onOpenDesktopModal,
  isTimerRunning,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Timer className="w-4 h-4" />
          </div>
          <button
            onClick={() => onTabChange('timer')}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-emerald-400 transition-colors"
          >
            Cronotask
          </button>
        </div>

        {/* Zone 2: 4 clean single-line navigation links (desktop) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('timer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'timer'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Cronómetro</span>
            {isTimerRunning && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
            )}
          </button>

          <button
            onClick={() => onTabChange('sessions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'sessions'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Sesiones</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analítica</span>
          </button>

          <button
            onClick={() => onTabChange('consolidated')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'consolidated'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Reporte PDF</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenDesktopModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            title="Abrir en iPhone o Mac sin terminal"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">iPhone / Mac</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={onOpenDataModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Gestión de datos, respaldos y reset"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Datos</span>
          </button>

          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Registro Manual</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Mobile iOS Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onTabChange('timer')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 text-[11px] transition-colors cursor-pointer ${
            activeTab === 'timer' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span>Tiempo</span>
        </button>

        <button
          onClick={() => onTabChange('sessions')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 text-[11px] transition-colors cursor-pointer ${
            activeTab === 'sessions' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <ListTodo className="w-5 h-5" />
          <span>Sesiones</span>
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 text-[11px] transition-colors cursor-pointer ${
            activeTab === 'analytics' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Analítica</span>
        </button>

        <button
          onClick={() => onTabChange('consolidated')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 text-[11px] transition-colors cursor-pointer ${
            activeTab === 'consolidated' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Reporte PDF</span>
        </button>
      </nav>
    </header>
  );
};
