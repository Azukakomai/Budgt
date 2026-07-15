/* ════════════════════════════════════════════════════
   BUDGT — Charts (lightweight canvas rendering)
   ════════════════════════════════════════════════════ */

const CHART_COLORS = [
  'oklch(0.72 0.15 185)',  // Teal
  'oklch(0.68 0.14 25)',   // Coral
  'oklch(0.72 0.14 155)',  // Green
  'oklch(0.70 0.12 280)',  // Purple
  'oklch(0.78 0.14 80)',   // Amber
  'oklch(0.65 0.15 330)',  // Pink
  'oklch(0.68 0.12 215)',  // Blue
  'oklch(0.75 0.13 110)',  // Lime
];

/**
 * Render a donut/ring chart
 */
export function renderDonutChart(canvas, data, opts = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(cx, cy) - 10;
  const lineWidth = opts.lineWidth || 24;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    // Empty state ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'oklch(0.21 0.008 260)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.fillStyle = 'oklch(0.45 0.008 260)';
    ctx.font = '500 14px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No data', cx, cy);
    return;
  }

  let currentAngle = -Math.PI / 2;
  const gap = 0.03; // Small gap between segments

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * Math.PI * 2 - gap;
    if (sliceAngle <= 0) return;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, currentAngle + gap / 2, currentAngle + sliceAngle + gap / 2);
    ctx.strokeStyle = d.color || CHART_COLORS[i % CHART_COLORS.length];
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    currentAngle += sliceAngle + gap;
  });

  // Center text
  if (opts.centerText) {
    ctx.fillStyle = 'oklch(0.93 0.005 260)';
    ctx.font = `700 ${opts.centerFontSize || 22}px Inter, system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.centerText, cx, cy - 6);

    if (opts.centerSubtext) {
      ctx.fillStyle = 'oklch(0.55 0.01 260)';
      ctx.font = '500 11px Inter, system-ui';
      ctx.fillText(opts.centerSubtext, cx, cy + 14);
    }
  }
}

/**
 * Render a bar chart (vertical bars)
 */
export function renderBarChart(canvas, data, opts = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(28, (chartW / data.length) - 6);
  const barGap = (chartW - barWidth * data.length) / (data.length + 1);

  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = padding.left + barGap + i * (barWidth + barGap);
    const y = padding.top + chartH - barH;
    const radius = Math.min(barWidth / 2, 6);

    // Bar with rounded top
    ctx.beginPath();
    ctx.moveTo(x, y + barH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, y + barH);
    ctx.closePath();

    ctx.fillStyle = d.color || opts.barColor || 'oklch(0.72 0.15 185)';
    ctx.fill();

    // Label below
    ctx.fillStyle = 'oklch(0.45 0.008 260)';
    ctx.font = '500 10px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barWidth / 2, h - 8);
  });
}

/**
 * Render a sparkline
 */
export function renderSparkline(canvas, values, opts = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const padding = 4;

  if (values.length < 2) return;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => ({
    x: padding + (i / (values.length - 1)) * (w - padding * 2),
    y: padding + (1 - (v - minVal) / range) * (h - padding * 2)
  }));

  // Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
  }
  ctx.strokeStyle = opts.color || 'oklch(0.72 0.15 185)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, (opts.color || 'oklch(0.72 0.15 185)').replace(')', ' / 0.15)').replace('oklch(', 'oklch('));
  gradient.addColorStop(1, 'transparent');

  ctx.lineTo(points[points.length - 1].x, h);
  ctx.lineTo(points[0].x, h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // End dot
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = opts.color || 'oklch(0.72 0.15 185)';
  ctx.fill();
}
