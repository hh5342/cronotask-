import { WorkSession, ActiveTimerData } from '../types';

const STORAGE_KEY_SESSIONS = 'cronotask_sessions_v1';
const STORAGE_KEY_TIMER = 'cronotask_active_timer_v1';

export const DEFAULT_ACTIVE_TIMER: ActiveTimerData = {
  status: 'idle',
  mode: 'stopwatch',
  targetMinutes: 25,
  title: '',
  project: 'Proyecto Principal',
  category: 'development',
  notes: '',
  tasks: [],
  focusScore: 5,
  tags: ['deep-work'],
  blockers: '',
  nextSteps: '',
  startedAt: null,
  lastTickAt: null,
  elapsedSeconds: 0,
  breakSeconds: 0,
  pauseStartedAt: null,
};

// Generates realistic sample sessions spanning the current and previous month (Oct & Sep 2026)
function generateSeedSessions(): WorkSession[] {
  const now = new Date(2026, 9, 27, 14, 0, 0).getTime(); // Oct 27, 2026
  const oneDay = 24 * 60 * 60 * 1000;

  const sampleList: Array<Omit<WorkSession, 'id' | 'createdAt'>> = [
    // Today (Oct 27, 2026)
    {
      title: 'Arquitectura de módulo de exportación PDF y gráficos vectoriales',
      project: 'Cronotask Platform',
      category: 'development',
      startTime: now - 3 * 3600 * 1000,
      endTime: now - 30 * 60 * 1000,
      durationSeconds: 8400, // 2h 20m
      breakDurationSeconds: 600,
      notes: 'Diseñé el renderizado offscreen para html2canvas y vector jsPDF con fuentes incrustadas. Manejo de saltos de página y compresión de imágenes.',
      tasks: [
        { id: '1', text: 'Estructurar plantilla de informe consolidado', completed: true },
        { id: '2', text: 'Integrar soporte de gráficos diarios y mensuales en alta resolución', completed: true },
        { id: '3', text: 'Verificar alineación de métricas tabulares', completed: true },
      ],
      blockers: 'Ajuste de margen en impresión PDF para evitar cortes de encabezado.',
      nextSteps: 'Añadir filtros avanzados de fecha en la previsualización.',
      focusScore: 5,
      energyLevel: 'high',
      tags: ['deep-work', 'pdf', 'canvas'],
    },
    {
      title: 'Sincronización de sprint y revisión de requerimientos analíticos',
      project: 'Cronotask Platform',
      category: 'meeting',
      startTime: now - 5 * 3600 * 1000,
      endTime: now - 4 * 3600 * 1000,
      durationSeconds: 3200, // 53m
      breakDurationSeconds: 400,
      notes: 'Alineamos métricas clave de productividad: correlación entre horas de foco y calidad de entrega.',
      tasks: [
        { id: '1', text: 'Definir cálculo de variación mensual MoM', completed: true },
        { id: '2', text: 'Aprobar paleta sobria según guía de diseño', completed: true },
      ],
      focusScore: 4,
      energyLevel: 'medium',
      tags: ['sprint', 'equipo'],
    },
    // Yesterday (Oct 26, 2026)
    {
      title: 'Diseño UI de analítica comparativa y cuadrícula de métricas',
      project: 'Cronotask Platform',
      category: 'design',
      startTime: now - oneDay - 4 * 3600 * 1000,
      endTime: now - oneDay - 1 * 3600 * 1000,
      durationSeconds: 10200, // 2h 50m
      breakDurationSeconds: 600,
      notes: 'Composición tipográfica con Plus Jakarta Sans y JetBrains Mono tabular. Cero badges píldoras estáticas y división limpia por aire.',
      tasks: [
        { id: '1', text: 'Mockup de gráfico comparativo mensual y diario', completed: true },
        { id: '2', text: 'Estilos de estado activo/inactivo para filtros de rango', completed: true },
      ],
      focusScore: 5,
      energyLevel: 'high',
      tags: ['ui-ux', 'tailwind', 'typography'],
    },
    {
      title: 'Investigación de técnicas de renderizado de gráficos vectoriales',
      project: 'Investigación & Core',
      category: 'research',
      startTime: now - oneDay - 8 * 3600 * 1000,
      endTime: now - oneDay - 6 * 3600 * 1000,
      durationSeconds: 6900, // 1h 55m
      breakDurationSeconds: 300,
      notes: 'Evaluación de SVG declarativo vs librerías pesadas. SVG nativo ofrece renderizado sin distorsión en PDF de 300 DPI.',
      tasks: [
        { id: '1', text: 'Pruebas de exportación SVG to Canvas', completed: true },
        { id: '2', text: 'Benchmark de tiempo de compilación y bundle size', completed: true },
      ],
      focusScore: 4,
      energyLevel: 'high',
      tags: ['benchmarks', 'svg'],
    },
    // Oct 25, 2026
    {
      title: 'Optimización de persistencia local y recuperación ante fallos',
      project: 'Investigación & Core',
      category: 'development',
      startTime: now - 2 * oneDay - 5 * 3600 * 1000,
      endTime: now - 2 * oneDay - 2 * 3600 * 1000,
      durationSeconds: 9600, // 2h 40m
      breakDurationSeconds: 1200,
      notes: 'Mecanismo de delta de tiempo para el cronómetro activo cuando la pestaña queda en segundo plano.',
      tasks: [
        { id: '1', text: 'Timer drift compensation con Date.now()', completed: true },
        { id: '2', text: 'Autoguardado cada 5 segundos en background', completed: true },
      ],
      focusScore: 5,
      energyLevel: 'high',
      tags: ['core', 'performance'],
    },
    // Oct 24, 2026
    {
      title: 'Documentación técnica de la API de métricas agregadas',
      project: 'Cliente Acme Corp',
      category: 'writing',
      startTime: now - 3 * oneDay - 6 * 3600 * 1000,
      endTime: now - 3 * oneDay - 3 * 3600 * 1000,
      durationSeconds: 9000, // 2h 30m
      breakDurationSeconds: 900,
      notes: 'Guía detallada de integración de webhooks y formato de payload JSON para exportaciones.',
      tasks: [
        { id: '1', text: 'Redactar especificación OpenAPI', completed: true },
        { id: '2', text: 'Añadir ejemplos en curl y typescript', completed: true },
      ],
      focusScore: 4,
      energyLevel: 'medium',
      tags: ['docs', 'api'],
    },
    // Oct 22, 2026
    {
      title: 'Auditoría de seguridad y validación de entradas de usuario',
      project: 'Cliente Acme Corp',
      category: 'development',
      startTime: now - 5 * oneDay - 4 * 3600 * 1000,
      endTime: now - 5 * oneDay - 1 * 3600 * 1000,
      durationSeconds: 10500, // 2h 55m
      breakDurationSeconds: 600,
      notes: 'Sanitización de cadenas en notas de sesión y prevención de desbordamientos en campos de texto.',
      tasks: [
        { id: '1', text: 'Sanitización de caracteres especiales', completed: true },
        { id: '2', text: 'Límite de caracteres en notas y etiquetas', completed: true },
      ],
      focusScore: 5,
      energyLevel: 'high',
      tags: ['security', 'hardening'],
    },
    // Oct 20, 2026
    {
      title: 'Revisión trimestral de objetivos de productividad del equipo',
      project: 'Gestión Interna',
      category: 'management',
      startTime: now - 7 * oneDay - 7 * 3600 * 1000,
      endTime: now - 7 * oneDay - 4 * 3600 * 1000,
      durationSeconds: 9800, // 2h 43m
      breakDurationSeconds: 1000,
      notes: 'Análisis de cuellos de botella en reuniones recurrentes y reducción del tiempo fragmentado.',
      tasks: [
        { id: '1', text: 'Consolidar reporte mensual de horas', completed: true },
        { id: '2', text: 'Establecer política de mañanas sin reuniones', completed: true },
      ],
      focusScore: 4,
      energyLevel: 'medium',
      tags: ['management', 'okr'],
    },
    // Oct 16, 2026
    {
      title: 'Refactorización del motor de cálculo de correlaciones diarias',
      project: 'Cronotask Platform',
      category: 'development',
      startTime: now - 11 * oneDay - 6 * 3600 * 1000,
      endTime: now - 11 * oneDay - 3 * 3600 * 1000,
      durationSeconds: 10800, // 3h 0m
      breakDurationSeconds: 600,
      notes: 'Optimicé los algoritmos de agrupación por fecha para no recalcular en cada re-render.',
      tasks: [
        { id: '1', text: 'Memoizar agregaciones diarias y semanales', completed: true },
        { id: '2', text: 'Pruebas con más de 1000 sesiones sintéticas', completed: true },
      ],
      focusScore: 5,
      energyLevel: 'high',
      tags: ['perf', 'algorithms'],
    },
    // Oct 12, 2026
    {
      title: 'Diseño de paletas accesibles WCAG AA para modo oscuro y claro',
      project: 'Investigación & Core',
      category: 'design',
      startTime: now - 15 * oneDay - 5 * 3600 * 1000,
      endTime: now - 15 * oneDay - 2 * 3600 * 1000,
      durationSeconds: 8800, // 2h 26m
      breakDurationSeconds: 800,
      notes: 'Comprobación de ratios de contraste 4.5:1 para textos y 3:1 para bordes estructurales.',
      tasks: [
        { id: '1', text: 'Muestreo en simulador de deuteranopia', completed: true },
        { id: '2', text: 'Ajuste de neutrales slate y zinc', completed: true },
      ],
      focusScore: 4,
      energyLevel: 'medium',
      tags: ['accessibility', 'colors'],
    },
    // Sep 28, 2026 (Previous Month data for comparative monthly graphs!)
    {
      title: 'Setup inicial del repositorio y configuración de bundler Vite',
      project: 'Cronotask Platform',
      category: 'development',
      startTime: now - 29 * oneDay - 5 * 3600 * 1000,
      endTime: now - 29 * oneDay - 2 * 3600 * 1000,
      durationSeconds: 10200, // 2h 50m
      breakDurationSeconds: 600,
      notes: 'Configuración base con Tailwind v4 y TypeScript riguroso.',
      tasks: [
        { id: '1', text: 'Ajustar tsconfig y vite.config', completed: true },
        { id: '2', text: 'Configurar alias de módulos @/*', completed: true },
      ],
      focusScore: 5,
      energyLevel: 'high',
      tags: ['setup', 'infra'],
    },
    // Sep 24, 2026
    {
      title: 'Prototipado rápido de componentes de cronómetro con milisegundos',
      project: 'Cronotask Platform',
      category: 'development',
      startTime: now - 33 * oneDay - 6 * 3600 * 1000,
      endTime: now - 33 * oneDay - 3 * 3600 * 1000,
      durationSeconds: 9400, // 2h 36m
      breakDurationSeconds: 800,
      notes: 'Validación de rendimiento del loop requestAnimationFrame vs setInterval.',
      tasks: [
        { id: '1', text: 'Crear hook personalizado useStopwatch', completed: true },
        { id: '2', text: 'Validar pausas y reanudaciones', completed: true },
      ],
      focusScore: 4,
      energyLevel: 'high',
      tags: ['prototype', 'timer'],
    },
    // Sep 18, 2026
    {
      title: 'Investigación de patrones de deep work y método Pomodoro',
      project: 'Investigación & Core',
      category: 'research',
      startTime: now - 39 * oneDay - 5 * 3600 * 1000,
      endTime: now - 39 * oneDay - 3 * 3600 * 1000,
      durationSeconds: 7200, // 2h 00m
      breakDurationSeconds: 600,
      notes: 'Recopilación de literatura sobre fatiga cognitiva tras bloques de 90 minutos de trabajo ininterrumpido.',
      tasks: [
        { id: '1', text: 'Resumir paper de atención focalizada', completed: true },
        { id: '2', text: 'Definir opciones de intervalos recomendados (25, 45, 90m)', completed: true },
      ],
      focusScore: 5,
      energyLevel: 'medium',
      tags: ['deep-work', 'pomodoro'],
    },
    // Sep 10, 2026
    {
      title: 'Definición de requerimientos para reportes ejecutivos en PDF',
      project: 'Cliente Acme Corp',
      category: 'writing',
      startTime: now - 47 * oneDay - 4 * 3600 * 1000,
      endTime: now - 47 * oneDay - 2 * 3600 * 1000,
      durationSeconds: 7800, // 2h 10m
      breakDurationSeconds: 400,
      notes: 'Especificación de entregables que exige la gerencia para justificación de horas facturables.',
      tasks: [
        { id: '1', text: 'Plantilla de desglose de tareas y obstáculos', completed: true },
        { id: '2', text: 'Gráficos comparativos de rendimiento mensual y diario', completed: true },
      ],
      focusScore: 4,
      energyLevel: 'medium',
      tags: ['specs', 'reporting'],
    },
  ];

  return sampleList.map((item, index) => ({
    ...item,
    id: `seed-session-${index + 1}`,
    createdAt: item.endTime,
  }));
}

export function loadSessions(): WorkSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw === null) {
      // First time opening the app: initialize with sample sessions
      const seeds = generateSeedSessions();
      saveSessions(seeds);
      return seeds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load sessions from localStorage:', err);
    return [];
  }
}

export function getSampleSessions(): WorkSession[] {
  return generateSeedSessions();
}

export function clearAllSessions(): void {
  saveSessions([]);
  fetch('/api/sessions/clear', { method: 'POST' }).catch(() => {});
}

export function saveSessions(sessions: WorkSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions to localStorage:', err);
  }
}

// Only called on explicit user action (create/edit/delete), NOT on page mount!
export function syncSessionsToServer(sessions: WorkSession[]): void {
  fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessions }),
  }).catch(() => {});
}

export async function fetchServerSessions(): Promise<WorkSession[] | null> {
  try {
    const res = await fetch('/api/sessions');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.fileExists && Array.isArray(data.sessions)) {
      return data.sessions;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadActiveTimer(): ActiveTimerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIMER);
    if (!raw) return DEFAULT_ACTIVE_TIMER;
    const data = JSON.parse(raw);
    return { ...DEFAULT_ACTIVE_TIMER, ...data };
  } catch {
    return DEFAULT_ACTIVE_TIMER;
  }
}

export function saveActiveTimer(timer: ActiveTimerData): void {
  try {
    localStorage.setItem(STORAGE_KEY_TIMER, JSON.stringify(timer));
  } catch (err) {
    console.error('Failed to save active timer:', err);
  }
}

export function exportDataAsJSON(sessions: WorkSession[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `cronotask-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSessionsCSV(sessions: WorkSession[]): void {
  const headers = ['ID', 'Fecha', 'Inicio', 'Fin', 'Proyecto', 'Categoría', 'Título', 'Duración (seg)', 'Duración (h)', 'Pausa (seg)', 'Foco (1-5)', 'Etiquetas', 'Notas', 'Tareas Completadas'];
  const rows = sessions.map((s) => {
    const startStr = new Date(s.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const endStr = new Date(s.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date(s.startTime).toISOString().split('T')[0];
    const hours = (s.durationSeconds / 3600).toFixed(2);
    const tagsStr = s.tags.join('; ');
    const completedTasksCount = s.tasks.filter((t) => t.completed).length;
    const taskSummary = `${completedTasksCount}/${s.tasks.length}`;
    const cleanNotes = (s.notes || '').replace(/"/g, '""').replace(/\n/g, ' ');

    return [
      s.id,
      dateStr,
      startStr,
      endStr,
      `"${s.project}"`,
      s.category,
      `"${s.title.replace(/"/g, '""')}"`,
      s.durationSeconds,
      hours,
      s.breakDurationSeconds,
      s.focusScore,
      `"${tagsStr}"`,
      `"${cleanNotes}"`,
      taskSummary,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `cronotask-sesiones-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function parseSessionsJSON(jsonText: string): WorkSession[] {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error('El archivo no contiene un formato de lista de sesiones válido.');
  }
  return parsed;
}

