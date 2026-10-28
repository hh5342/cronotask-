import { jsPDF } from 'jspdf';
import { WorkSession } from '../types';
import { calculateProductivityAnalysis } from './analytics';
import { formatDateTime, formatDuration, getCategoryInfo } from './formatters';

// Utility to create a crisp canvas for drawing charts offscreen for the PDF
function renderDailyChartCanvas(dailyData: Array<{ label: string; hours: number; focus: number }>, width = 800, height = 300): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Border & Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  const padding = { top: 40, right: 30, bottom: 50, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max value calculation
  const maxHours = Math.max(4, ...dailyData.map((d) => d.hours));
  const ceilHours = Math.ceil(maxHours * 1.2);

  // Horizontal Grid Lines
  const gridSteps = 4;
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridSteps; i++) {
    const yVal = (ceilHours / gridSteps) * i;
    const yPos = padding.top + chartH - (i / gridSteps) * chartH;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(padding.left, yPos);
    ctx.lineTo(width - padding.right, yPos);
    ctx.stroke();

    ctx.fillText(`${yVal.toFixed(1)} h`, padding.left - 10, yPos + 4);
  }

  // Draw Bars
  const n = dailyData.length;
  if (n === 0) return canvas.toDataURL('image/png');

  const slotW = chartW / n;
  const barW = Math.max(8, Math.min(36, slotW * 0.65));

  dailyData.forEach((item, idx) => {
    const xCenter = padding.left + idx * slotW + slotW / 2;
    const barHeight = (item.hours / ceilHours) * chartH;
    const barY = padding.top + chartH - barHeight;

    // Bar gradient (emerald)
    const grad = ctx.createLinearGradient(0, barY, 0, padding.top + chartH);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(1, '#065f46');

    ctx.fillStyle = grad;
    // Rounded top bar
    const radius = 3;
    ctx.beginPath();
    ctx.roundRect(xCenter - barW / 2, barY, barW, barHeight, [radius, radius, 0, 0]);
    ctx.fill();

    // Value on top if there's space
    if (barHeight > 18) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.hours}h`, xCenter, barY - 6);
    }

    // X Axis Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, xCenter, height - padding.bottom + 18);

    // Focus indicator dot on bottom
    const focusColor = item.focus >= 4.5 ? '#34d399' : item.focus >= 3.5 ? '#38bdf8' : '#fbbf24';
    ctx.fillStyle = focusColor;
    ctx.beginPath();
    ctx.arc(xCenter, height - padding.bottom + 32, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Title & Legend
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Comparativa Diaria de Horas Trabajadas', padding.left, 24);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('● Verde: Foco Alto (>=4.5)  ● Azul: Foco Medio (3.5-4.4)  ● Amarillo: Moderado', width - padding.right, 24);

  return canvas.toDataURL('image/png');
}

function renderMonthlyChartCanvas(monthlyData: Array<{ label: string; hours: number; sessions: number; avgDaily: number }>, width = 800, height = 280): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  const padding = { top: 40, right: 30, bottom: 50, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxHours = Math.max(10, ...monthlyData.map((m) => m.hours));
  const ceilHours = Math.ceil(maxHours * 1.25);

  // Horizontal Grid
  const gridSteps = 4;
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridSteps; i++) {
    const yVal = (ceilHours / gridSteps) * i;
    const yPos = padding.top + chartH - (i / gridSteps) * chartH;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(padding.left, yPos);
    ctx.lineTo(width - padding.right, yPos);
    ctx.stroke();

    ctx.fillText(`${yVal.toFixed(0)} h`, padding.left - 10, yPos + 4);
  }

  const n = monthlyData.length;
  if (n === 0) return canvas.toDataURL('image/png');

  const slotW = chartW / n;
  const barW = Math.max(24, Math.min(60, slotW * 0.45));

  monthlyData.forEach((item, idx) => {
    const xCenter = padding.left + idx * slotW + slotW / 2;
    const barHeight = (item.hours / ceilHours) * chartH;
    const barY = padding.top + chartH - barHeight;

    // Indigo / Violet gradient
    const grad = ctx.createLinearGradient(0, barY, 0, padding.top + chartH);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#3730a3');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(xCenter - barW / 2, barY, barW, barHeight, [4, 4, 0, 0]);
    ctx.fill();

    // Value text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.hours}h`, xCenter, barY - 8);

    // Month Label
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(item.label, xCenter, height - padding.bottom + 18);

    // Secondary subtext: sessions & avg daily
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText(`${item.sessions} ses. · ${item.avgDaily}h/día`, xCenter, height - padding.bottom + 32);
  });

  // Chart Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Comparativa Mensual de Productividad (Horas & Sesiones)', padding.left, 24);

  return canvas.toDataURL('image/png');
}

/**
 * Downloads a complete single session detailed report
 */
export async function downloadSingleSessionPDF(session: WorkSession): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  let y = margin;

  // Header Bar
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CRONOTASK · REPORTE DETALLADO DE SESIÓN', margin + 6, y + 9);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const genDateStr = `Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  doc.text(genDateStr, margin + 6, y + 17);

  y += 28;

  // Title Box
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text('TÍTULO DE LA SESIÓN', margin + 6, y + 7);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const wrappedTitle = doc.splitTextToSize(session.title, contentWidth - 12);
  doc.text(wrappedTitle, margin + 6, y + 16);

  y += 32;

  // 4 KPI Summary Cards
  const kpiWidth = (contentWidth - 9) / 4;
  const kpiH = 22;

  // KPI 1: Net Duration
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, kpiWidth, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('DURACIÓN NETA', margin + 4, y + 6);
  doc.setTextColor(52, 211, 153); // emerald
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(formatDuration(session.durationSeconds), margin + 4, y + 16);

  // KPI 2: Project
  const kpi2X = margin + kpiWidth + 3;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(kpi2X, y, kpiWidth, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('PROYECTO', kpi2X + 4, y + 6);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const projText = doc.splitTextToSize(session.project, kpiWidth - 8);
  doc.text(projText[0] || '', kpi2X + 4, y + 16);

  // KPI 3: Category
  const kpi3X = kpi2X + kpiWidth + 3;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(kpi3X, y, kpiWidth, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('CATEGORÍA', kpi3X + 4, y + 6);
  const catInfo = getCategoryInfo(session.category);
  doc.setTextColor(167, 139, 250); // purple
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(catInfo.label, kpi3X + 4, y + 16);

  // KPI 4: Focus Score
  const kpi4X = kpi3X + kpiWidth + 3;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(kpi4X, y, kpiWidth, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('ÍNDICE DE FOCO', kpi4X + 4, y + 6);
  doc.setTextColor(251, 191, 36); // amber
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${session.focusScore} / 5 ★`, kpi4X + 4, y + 16);

  y += 28;

  // Metadata Row
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  const startStr = formatDateTime(session.startTime);
  const endStr = formatDateTime(session.endTime);
  const breakStr = formatDuration(session.breakDurationSeconds);
  doc.text(`Inicio: ${startStr}   ·   Fin: ${endStr}   ·   Tiempo de pausa: ${breakStr}`, margin + 6, y + 9);

  y += 20;

  // Checklist of completed tasks
  if (session.tasks && session.tasks.length > 0) {
    doc.setTextColor(248, 250, 252);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CHECKLIST DE ENTREGABLES Y TAREAS', margin, y);
    y += 6;

    session.tasks.forEach((t) => {
      doc.setFillColor(24, 33, 47);
      doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      if (t.completed) {
        doc.setTextColor(52, 211, 153);
        doc.text('[✓]', margin + 4, y + 6);
      } else {
        doc.setTextColor(148, 163, 184);
        doc.text('[ ]', margin + 4, y + 6);
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text(t.text, margin + 14, y + 6);
      y += 11;
    });

    y += 5;
  }

  // Session Notes
  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NOTAS Y MEMORIA DE TRABAJO', margin, y);
  y += 6;

  doc.setFillColor(30, 41, 59);
  const notesText = session.notes || 'Sin notas registradas para esta sesión.';
  const wrappedNotes = doc.splitTextToSize(notesText, contentWidth - 12);
  const notesBoxH = Math.max(26, wrappedNotes.length * 5 + 10);
  doc.roundedRect(margin, y, contentWidth, notesBoxH, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  doc.text(wrappedNotes, margin + 6, y + 8);

  y += notesBoxH + 8;

  // Blockers / Next steps if present
  if (session.blockers || session.nextSteps) {
    const halfW = (contentWidth - 6) / 2;

    // Blockers box
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, halfW, 28, 2, 2, 'F');
    doc.setTextColor(251, 113, 133); // rose
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('OBSTÁCULOS O FRICCIÓN', margin + 5, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8.5);
    const wrappedBlockers = doc.splitTextToSize(session.blockers || 'Ninguno reportado.', halfW - 10);
    doc.text(wrappedBlockers, margin + 5, y + 13);

    // Next steps box
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin + halfW + 6, y, halfW, 28, 2, 2, 'F');
    doc.setTextColor(96, 165, 250); // blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PRÓXIMOS PASOS', margin + halfW + 11, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8.5);
    const wrappedNext = doc.splitTextToSize(session.nextSteps || 'Ninguno definido.', halfW - 10);
    doc.text(wrappedNext, margin + halfW + 11, y + 13);

    y += 36;
  }

  // Tags
  if (session.tags && session.tags.length > 0) {
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Etiquetas: ${session.tags.map((t) => `#${t}`).join('   ')}`, margin, y);
    y += 8;
  }

  // Footer
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Cronotask Productivity Suite · Documento Oficial de Auditoría de Tiempo', margin, pageHeight - 10);
  doc.text(`ID: ${session.id}`, pageWidth - margin - 35, pageHeight - 10);

  // Save PDF
  const cleanTitle = session.title.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`reporte-sesion-${cleanTitle}-${session.id.slice(0, 6)}.pdf`);
}

/**
 * Downloads a Consolidated Multi-Session PDF with comparative monthly and daily productivity charts
 */
export async function downloadConsolidatedPDF(
  sessions: WorkSession[],
  reportTitle = 'Informe Consolidado de Productividad y Análisis Comparativo'
): Promise<void> {
  if (sessions.length === 0) {
    throw new Error('No hay sesiones seleccionadas para generar el reporte consolidado.');
  }

  const analysis = calculateProductivityAnalysis(sessions);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // ---------------- PAGE 1: COVER & EXECUTIVE DASHBOARD ----------------
  // Slate dark background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  let y = margin;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CRONOTASK PRODUCTIVITY PLATFORM · REPORTE CONSOLIDADO MULTI-SESIÓN', margin + 6, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  const wrappedReportTitle = doc.splitTextToSize(reportTitle, contentWidth - 12);
  doc.text(wrappedReportTitle[0] || reportTitle, margin + 6, y + 17);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const nowFormatted = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generado: ${nowFormatted} · Alcance: ${sessions.length} sesiones auditadas`, margin + 6, y + 23);

  y += 32;

  // 4 Top KPI Cards
  const kpiW = (contentWidth - 9) / 4;
  const kpiH = 24;

  // KPI 1: Horas Totales
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, kpiW, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('HORAS TOTALES', margin + 4, y + 6);
  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${analysis.totalHours} h`, margin + 4, y + 16);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`En ${analysis.totalSessions} sesiones`, margin + 4, y + 21);

  // KPI 2: Promedio Diario
  const kpi2X = margin + kpiW + 3;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(kpi2X, y, kpiW, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('PROMEDIO DIARIO', kpi2X + 4, y + 6);
  doc.setTextColor(96, 165, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${analysis.avgDailyHours} h`, kpi2X + 4, y + 16);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${analysis.dailyTrend.length} días activos`, kpi2X + 4, y + 21);

  // KPI 3: Índice Foco Promedio
  const kpi3X = kpi2X + kpiW + 3;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(kpi3X, y, kpiW, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('ÍNDICE FOCO (1-5)', kpi3X + 4, y + 6);
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${analysis.overallFocusScore} ★`, kpi3X + 4, y + 16);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Calidad de concentración', kpi3X + 4, y + 21);

  // KPI 4: Proyecto Líder
  const kpi4X = kpi3X + kpiW + 3;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(kpi4X, y, kpiW, kpiH, 2, 2, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('PROYECTO LÍDER', kpi4X + 4, y + 6);
  doc.setTextColor(167, 139, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const cleanTopProj = doc.splitTextToSize(analysis.topProject.name, kpiW - 8);
  doc.text(cleanTopProj[0] || 'N/A', kpi4X + 4, y + 15);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${analysis.topProject.hours}h (${analysis.topProject.percentage}%)`, kpi4X + 4, y + 21);

  y += 30;

  // ---------------- CHART 1: COMPARATIVA DIARIA DE HORAS ----------------
  // Take up to the last 14 daily entries for clean spacing
  const dailySlice = analysis.dailyTrend.slice(-14).map((d) => ({
    label: `${d.displayDate.split(' ')[0]} ${d.dayOfWeek}`,
    hours: d.totalHours,
    focus: d.avgFocusScore,
  }));

  const dailyChartImg = renderDailyChartCanvas(dailySlice, 800, 260);
  if (dailyChartImg) {
    doc.addImage(dailyChartImg, 'PNG', margin, y, contentWidth, 54);
    y += 58;
  }

  // ---------------- CHART 2: COMPARATIVA MENSUAL DE HORAS ----------------
  const monthlySlice = analysis.monthlyTrend.map((m) => ({
    label: m.shortMonth,
    hours: m.totalHours,
    sessions: m.sessionCount,
    avgDaily: m.avgDailyHours,
  }));

  const monthlyChartImg = renderMonthlyChartCanvas(monthlySlice, 800, 240);
  if (monthlyChartImg) {
    doc.addImage(monthlyChartImg, 'PNG', margin, y, contentWidth, 50);
    y += 54;
  }

  // Category Distribution Bar
  if (analysis.categoryBreakdown.length > 0) {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
    doc.setTextColor(248, 250, 252);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DISTRIBUCIÓN POR CATEGORÍA', margin + 6, y + 6);

    let catX = margin + 6;
    analysis.categoryBreakdown.slice(0, 5).forEach((cat) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      const text = `${cat.label}: ${cat.hours}h (${cat.percentage}%)`;
      doc.text(text, catX, y + 16);
      catX += 34;
    });

    y += 28;
  }

  // Footer Page 1
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Cronotask Productivity Suite · Página 1 de 2 · Resumen Ejecutivo y Gráficos', margin, pageHeight - 8);

  // ---------------- PAGE 2: DETAILED SESSIONS CATALOG & NOTES ----------------
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  let y2 = margin;

  // Header Page 2
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y2, contentWidth, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('APÉNDICE: DESGLOSE DETALLADO DE SESIONES CONSOLIDADAS', margin + 6, y2 + 10);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Total de ${sessions.length} registros`, pageWidth - margin - 35, y2 + 10);

  y2 += 22;

  // Table Header
  doc.setFillColor(24, 33, 47);
  doc.rect(margin, y2, contentWidth, 8, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('FECHA', margin + 4, y2 + 5.5);
  doc.text('PROYECTO', margin + 28, y2 + 5.5);
  doc.text('SESIÓN / DESCRIPCIÓN & NOTAS', margin + 68, y2 + 5.5);
  doc.text('DURACIÓN', margin + contentWidth - 36, y2 + 5.5);
  doc.text('FOCO', margin + contentWidth - 12, y2 + 5.5);

  y2 += 8;

  // List sessions (latest first)
  const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);
  const maxSessionsOnPage2 = 10;
  const sessionsToPrint = sortedSessions.slice(0, maxSessionsOnPage2);

  sessionsToPrint.forEach((s, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 30 : 22, isEven ? 41 : 30, isEven ? 59 : 45);
    const rowH = 18;
    doc.rect(margin, y2, contentWidth, rowH, 'F');

    // Date
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const dateFormatted = new Date(s.startTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const timeFormatted = new Date(s.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    doc.text(dateFormatted, margin + 4, y2 + 6);
    doc.setTextColor(100, 116, 139);
    doc.text(timeFormatted, margin + 4, y2 + 12);

    // Project
    doc.setTextColor(167, 139, 250);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const projShort = doc.splitTextToSize(s.project, 36);
    doc.text(projShort[0] || '', margin + 28, y2 + 7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const cat = getCategoryInfo(s.category);
    doc.text(cat.label, margin + 28, y2 + 13);

    // Title & Notes snippet
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const titleLines = doc.splitTextToSize(s.title, contentWidth - 110);
    doc.text(titleLines[0] || '', margin + 68, y2 + 6);

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const notePreview = s.notes ? s.notes.replace(/\n/g, ' ') : 'Sin notas complementarias';
    const noteLines = doc.splitTextToSize(notePreview, contentWidth - 110);
    doc.text(noteLines[0] || '', margin + 68, y2 + 12);

    // Duration
    doc.setTextColor(52, 211, 153);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(formatDuration(s.durationSeconds), margin + contentWidth - 36, y2 + 8);

    // Focus
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(8.5);
    doc.text(`${s.focusScore} ★`, margin + contentWidth - 12, y2 + 8);

    y2 += rowH;
  });

  if (sortedSessions.length > maxSessionsOnPage2) {
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(`... y ${sortedSessions.length - maxSessionsOnPage2} sesiones adicionales incluidas en el cómputo global de horas y analítica comparativa.`, margin + 4, y2 + 8);
    y2 += 12;
  }

  // Summary Note on bottom of page 2
  y2 += 8;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y2, contentWidth, 24, 2, 2, 'F');
  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONCLUSIONES DEL ANÁLISIS DE PRODUCTIVIDAD', margin + 6, y2 + 6);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const conclusionText = `El período auditado refleja una dedicación acumulada de ${analysis.totalHours} horas netas de trabajo productivo a través de ${analysis.totalSessions} sesiones, con un índice de foco promedio de ${analysis.overallFocusScore}/5. El proyecto "${analysis.topProject.name}" concentró el mayor esfuerzo (${analysis.topProject.percentage}%). Los gráficos comparativos evidencian la consistencia operativa entre días y meses.`;
  const wrappedConclusion = doc.splitTextToSize(conclusionText, contentWidth - 12);
  doc.text(wrappedConclusion, margin + 6, y2 + 13);

  // Footer Page 2
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Cronotask Productivity Suite · Página 2 de 2 · Catálogo y Conclusiones', margin, pageHeight - 8);

  const cleanFileTitle = reportTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`informe-productividad-consolidado-${cleanFileTitle}-${new Date().toISOString().split('T')[0]}.pdf`);
}
