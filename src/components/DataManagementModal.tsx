import React, { useRef, useState } from 'react';
import { WorkSession } from '../types';
import { exportDataAsJSON, parseSessionsJSON, getSampleSessions } from '../utils/storage';
import { X, Database, Download, Upload, Trash2, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WorkSession[];
  onClearAll: () => void;
  onLoadSamples: () => void;
  onImportSessions: (imported: WorkSession[]) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onClearAll,
  onLoadSamples,
  onImportSessions,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClearClick = () => {
    if (
      window.confirm(
        '¿Confirmas que deseas vaciar todas las sesiones y empezar de cero? Esta acción no se puede deshacer a menos que tengas un respaldo JSON descargado.'
      )
    ) {
      onClearAll();
      setFeedback('Todos los datos han sido eliminados. La aplicación ahora está vacía y lista.');
    }
  };

  const handleLoadSamplesClick = () => {
    if (
      sessions.length > 0 &&
      !window.confirm('¿Deseas reemplazar o combinar las sesiones actuales con los datos de muestra?')
    ) {
      return;
    }
    onLoadSamples();
    setFeedback('Se han cargado los datos de muestra correctamente.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseSessionsJSON(text);
        onImportSessions(parsed);
        setFeedback(`Se importaron con éxito ${parsed.length} sesiones desde el archivo.`);
      } catch (err: any) {
        alert('Error al leer el archivo JSON: ' + (err.message || 'Formato inválido'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Gestión y Guardado de Datos</h3>
              <p className="text-xs text-neutral-400">
                Almacenamiento local, respaldos y reinicio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Explanation Box */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Guardado en Disco Local y en Navegador</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              <strong>Tus datos se guardan en dos lugares:</strong>
            </p>
            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">En tu carpeta local de proyecto:</strong> Se guarda en el archivo físico <code className="text-emerald-400 bg-neutral-900 px-1 py-0.5 rounded font-mono text-[11px]">data/sessions.json</code>. Puedes abrirlo con cualquier editor de texto o terminal.
              </li>
              <li>
                <strong className="text-white">En el navegador:</strong> Se guarda en <code className="text-emerald-400 bg-neutral-900 px-1 py-0.5 rounded font-mono text-[11px]">localStorage</code> para que esté disponible instantáneamente incluso sin conexión.
              </li>
            </ul>
            <p className="text-[11px] text-neutral-400 pt-1">
              No se requiere base de datos externa ni internet: tus registros son 100% privados y residen en tu propia máquina.
            </p>
          </div>

          {feedback && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Action Options */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Opciones de Control
            </div>

            {/* Option 1: Empezar de Cero */}
            <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empezar de Cero (Sin datos)</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Elimina todas las sesiones registradas ({sessions.length}) y deja el sistema completamente limpio.
                </div>
              </div>
              <button
                onClick={handleClearClick}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                Vaciar todo
              </button>
            </div>

            {/* Option 2: Exportar Respaldo JSON */}
            <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Descargar Copia de Seguridad (JSON)</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Guarda un archivo de respaldo con todo tu historial de trabajo para conservarlo externamente.
                </div>
              </div>
              <button
                onClick={() => exportDataAsJSON(sessions)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                Descargar
              </button>
            </div>

            {/* Option 3: Importar Copia de Seguridad */}
            <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Importar Copia de Seguridad</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Restaura sesiones desde un archivo JSON descargado anteriormente.
                </div>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
                >
                  Importar
                </button>
              </div>
            </div>

            {/* Option 4: Cargar Datos de Muestra */}
            <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cargar Datos de Muestra</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Vuelve a inyectar las sesiones de prueba con comparativas mensuales y diarias para demostraciones.
                </div>
              </div>
              <button
                onClick={handleLoadSamplesClick}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                Cargar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
