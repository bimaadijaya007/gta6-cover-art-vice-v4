// Vice Cover Studio — pure canvas drawing. No DOM, no network, no fonts.
// Draws the multi-panel poster, the colour grade and the caption.

export const GRADES = [
  { id: 'sunset', label: 'Sunset' },
  { id: 'neon', label: 'Neon Nights' },
  { id: 'pink', label: 'Vice Pink' },
  { id: 'golden', label: 'Golden Hour' },
];

export const LAYOUTS = [
  { id: 'trio', label: 'Vice Trio' },
  { id: 'duo', label: 'Duo' },
  { id: 'full', label: 'Full-bleed' },
];

/** Panel rectangles for a layout, in canvas pixels. */
export function panelRects(layout, w, h) {
  const gap = Math.max(2, Math.round(w * 0.012));
  if (layout === 'duo') {
    const half = (w - gap) / 2;
    return [
      { x: 0, y: 0, w: half, h },
      { x: half + gap, y: 0, w: half, h },
    ];
  }
  if (layout === 'full') {
    return [{ x: 0, y: 0, w, h }];
  }
  // Trio: big hero on the left, two stacked vignettes on the right.
  const heroW = Math.round(w * 0.62);
  const rightX = heroW + gap;
  const rightW = w - rightX;
  const halfH = (h - gap) / 2;
  return [
    { x: 0, y: 0, w: heroW, h },
    { x: rightX, y: 0, w: rightW, h: halfH },
    { x: rightX, y: halfH + gap, w: rightW, h: halfH },
  ];
}

/** Draw one photo cover-fit inside a panel (no distortion), with zoom + pan. */
function drawPhoto(ctx, img, rect, zoom, panX, panY) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!img || !img.naturalWidth) {
    ctx.fillStyle = '#241640';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = '#ff5ea8';
    ctx.font = `700 ${Math.round(rect.w * 0.08)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const s = base * zoom;
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const cx = rect.x + rect.w / 2 + panX;
  const cy = rect.y + rect.h / 2 + panY;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

/** Colour grade: translucent gradient washes over the whole cover. */
function applyGrade(ctx, grade, w, h) {
  ctx.save();
  if (grade === 'sunset') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255, 94, 168, 0.30)');
    g.addColorStop(0.55, 'rgba(255, 140, 66, 0.20)');
    g.addColorStop(1, 'rgba(40, 10, 60, 0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'neon') {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255, 0, 160, 0.32)');
    g.addColorStop(0.5, 'rgba(120, 0, 200, 0.10)');
    g.addColorStop(1, 'rgba(0, 229, 255, 0.32)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'pink') {
    ctx.fillStyle = 'rgba(255, 45, 149, 0.22)';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
    g.addColorStop(1, 'rgba(80, 0, 60, 0.30)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Golden Hour: warm wash, stronger at the top.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255, 190, 80, 0.30)');
    g.addColorStop(0.6, 'rgba(255, 150, 60, 0.14)');
    g.addColorStop(1, 'rgba(60, 20, 0, 0.22)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  // Soft dark vignette at the edges so the caption pops.
  const v = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.35,
    w / 2, h / 2, Math.max(w, h) * 0.78,
  );
  v.addColorStop(0, 'rgba(0, 0, 0, 0)');
  v.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Big slanted poster title (white, thick black outline) + small tagline. */
function drawCaption(ctx, title, tagline, w, h) {
  const text = (title || 'VICE CITY').toUpperCase();
  let size = Math.round(w * 0.105);
  ctx.save();
  ctx.translate(w * 0.055, h * 0.88);
  ctx.rotate(-0.05);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.lineJoin = 'round';
  // Shrink long titles so they never run off the right edge.
  const fitFont = (s) => `900 ${s}px "Arial Black", Arial, Helvetica, sans-serif`;
  ctx.font = fitFont(size);
  while (ctx.measureText(text).width > w * 0.9 && size > 12) {
    size -= 2;
    ctx.font = fitFont(size);
  }
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(3, size * 0.17);
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 0, 0);
  const sub = (tagline || '').trim();
  if (sub) {
    const ts = Math.round(w * 0.032);
    ctx.font = `700 ${ts}px Arial, Helvetica, sans-serif`;
    ctx.lineWidth = Math.max(2, ts * 0.2);
    ctx.strokeText(sub, 4, size * 0.52);
    ctx.fillStyle = '#ffe9f5';
    ctx.fillText(sub, 4, size * 0.52);
  }
  ctx.restore();
}

/**
 * Draw the whole cover.
 * opts: { width, height, layout, grade, title, tagline,
 *         panels: [{ img, zoom, panX, panY }, ...] }
 */
export function drawCover(ctx, opts) {
  const { width: w, height: h } = opts;
  const rects = panelRects(opts.layout, w, h);
  ctx.save();
  ctx.fillStyle = '#0b0618';
  ctx.fillRect(0, 0, w, h);
  rects.forEach((rect, i) => {
    const p = opts.panels[i] || {};
    drawPhoto(ctx, p.img || null, rect, p.zoom || 1, p.panX || 0, p.panY || 0);
  });
  // Thin pale frame around each panel, poster style.
  ctx.lineWidth = Math.max(2, Math.round(w * 0.004));
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  for (const rect of rects) {
    ctx.strokeRect(
      rect.x + ctx.lineWidth / 2, rect.y + ctx.lineWidth / 2,
      rect.w - ctx.lineWidth, rect.h - ctx.lineWidth,
    );
  }
  ctx.restore();
  applyGrade(ctx, opts.grade || 'sunset', w, h);
  drawCaption(ctx, opts.title, opts.tagline, w, h);
}
