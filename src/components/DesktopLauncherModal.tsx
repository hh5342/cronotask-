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
  Github
} from 'lucide-react';

interface DesktopLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// GitHub Pages URL of the application
const GITHUB_PAGES_URL = 'https://hh5342.github.io/cronotask-/';

export const DesktopLauncherModal: React.FC<DesktopLauncherModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(GITHUB_PAGES_URL, {
        width: 260,
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
      navigator.clipboard.writeText(GITHUB_PAGES_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Abrir en tu iPhone (Código QR)</h3>
              <p className="text-xs text-neutral-400">
                Enlace directo y permanente en GitHub Pages
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
          {/* Card QR Principal para iPhone */}
          <div className="p-5 bg-neutral-950 border border-emerald-500/40 rounded-2xl flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Apunta con la Cámara de tu iPhone</span>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl shadow-xl ring-4 ring-emerald-500/20">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR para abrir Cronotask en iPhone"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                  <QrCode className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Pasos en iPhone */}
            <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-left space-y-2 text-xs text-neutral-300">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Cómo instalarla como App en tu iPhone:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-300 text-[11px] leading-relaxed">
                <li>Abre la app <strong>Cámara</strong> de tu iPhone y enfoca el código QR.</li>
                <li>Toca el aviso amarillo para abrirlo en <strong>Safari</strong>.</li>
                <li>En la barra inferior de Safari, pulsa el botón <strong>Compartir</strong> (cuadrado con flecha ↑).</li>
                <li>Desliza y selecciona <strong>«Añadir a pantalla de inicio»</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Enlace de texto directo */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                <Github className="w-3.5 h-3.5 text-white" />
                <span>Enlace de GitHub Pages</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                Activo
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={GITHUB_PAGES_URL}
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
                  href={GITHUB_PAGES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir</span>
                </a>
              </div>
            </div>
          </div>

          {/* Mac Dock */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-3 text-xs text-neutral-400">
            <Laptop className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="leading-relaxed">
              <strong>En Mac:</strong> Abre ese mismo enlace en Safari y pulsa <strong className="text-neutral-200">Archivo &gt; Añadir al Dock…</strong> para tener el icono en tu escritorio sin tocar la terminal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="text-[11px] text-neutral-500 font-mono">
            hh5342.github.io/cronotask-/
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
