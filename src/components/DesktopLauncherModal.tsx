import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Smartphone,
  Sparkles,
  Laptop,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Terminal,
  UploadCloud
} from 'lucide-react';

interface DesktopLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLOUD_APP_URL = 'https://ais-pre-ezbgcdvhap7ckr7j6o3v5q-319735497040.europe-west2.run.app';

export const DesktopLauncherModal: React.FC<DesktopLauncherModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBashCmd, setCopiedBashCmd] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(true);

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(CLOUD_APP_URL, {
        width: 200,
        margin: 2,
        color: {
          dark: '#09090b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(CLOUD_APP_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCopyBashCmd = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('chmod +x iniciar_mac.command && ./iniciar_mac.command');
      setCopiedBashCmd(true);
      setTimeout(() => setCopiedBashCmd(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Activar en iPhone y Mac</h3>
              <p className="text-xs text-neutral-400">
                Solución a «Page not found» y privilegios en macOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* PASO CLAVE: Botón Publish */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <UploadCloud className="w-4 h-4 shrink-0" />
              <span>PASO IMPORTANTE: ¿Por qué salía «Page not found»?</span>
            </div>
            <p className="text-xs text-neutral-200 leading-relaxed">
              El enlace en la nube da <em>«Page not found»</em> porque la aplicación está en modo borrador. Para activarla públicamente para tu iPhone:
            </p>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-2">
              <div className="flex items-start gap-2 text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                <span>Mira <strong>arriba a la derecha</strong> en la pantalla de Google AI Studio (junto a los botones <em>Remix</em> y <em>Share</em>).</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                <span>Haz clic en el botón blanco <strong>«Publish»</strong>.</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                <span>¡Listo! Google desplegará el servidor público y el enlace web funcionará de inmediato en cualquier dispositivo.</span>
              </div>
            </div>
          </div>

          {/* Enlace y QR para iPhone */}
          <div className="p-4 bg-neutral-950 border border-emerald-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Enlace Web Público (Tras pulsar «Publish»)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                Para iPhone y Safari
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={CLOUD_APP_URL}
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-emerald-300 font-mono select-all focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                </button>
                <a
                  href={CLOUD_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Probar</span>
                </a>
              </div>
            </div>

            {/* QR Scan */}
            <div className="flex items-center gap-4 pt-2 border-t border-neutral-900">
              {qrCodeDataUrl && (
                <div className="bg-white p-1.5 rounded-lg shrink-0 shadow">
                  <img src={qrCodeDataUrl} alt="QR iPhone" className="w-20 h-20 object-contain" />
                </div>
              )}
              <div className="text-xs text-neutral-400 space-y-1">
                <p className="font-semibold text-neutral-200">Cómo añadirlo como app en iPhone:</p>
                <p>1. Escanea el QR con la cámara de tu iPhone o abre el enlace en Safari.</p>
                <p>2. Pulsa el botón <strong>Compartir</strong> (cuadrado con flecha ↑).</p>
                <p>3. Pulsa <strong>«Añadir a pantalla de inicio»</strong>.</p>
              </div>
            </div>
          </div>

          {/* Solución a Privilegios en Mac Local */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Terminal className="w-4 h-4 shrink-0" />
              <span>Si descargaste el código a tu Mac («careces de privilegios de acceso»)</span>
            </div>

            <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>
                En macOS, los archivos descargados de internet se bloquean por seguridad. Para ejecutar <code className="text-amber-300">iniciar_mac.command</code> sin error de privilegios:
              </p>

              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-2">
                <p className="font-semibold text-white">Método más fácil:</p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-300">
                  <li>Abre el <strong>Terminal</strong> en tu Mac.</li>
                  <li>Escribe <code className="text-emerald-400 font-mono bg-neutral-950 px-1.5 py-0.5 rounded">bash </code> (con un espacio al final).</li>
                  <li>Arrastra el archivo <strong>iniciar_mac.command</strong> dentro de la ventana del Terminal y pulsa <strong>Enter</strong>.</li>
                </ol>
              </div>

              <div className="text-[11px] text-neutral-400">
                O si prefieres darle permisos para siempre de doble clic, ejecuta esto en la carpeta:
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 font-mono text-[11px] bg-neutral-900 p-2 rounded border border-neutral-800 text-emerald-400">
                    chmod +x iniciar_mac.command
                  </code>
                  <button
                    onClick={handleCopyBashCmd}
                    className="px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[11px] transition-colors cursor-pointer"
                  >
                    {copiedBashCmd ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="text-[11px] text-neutral-500">
            Cronotask v1.0
          </div>
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
