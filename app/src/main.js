// Vice Cover Studio — page wiring: state, uploads, drag-to-pan, export.
// The drawing itself lives in cover.js; the shot presets in shots.js.
import { drawCover, GRADES, LAYOUTS, panelRects } from './cover.js';
import { shotPreset, markShotReady } from './shots.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const titleInput = document.getElementById('title');
const taglineInput = document.getElementById('tagline');
const gradeSelect = document.getElementById('grade');
const panelBox = document.getElementById('panels');

// Photo slots A/B/C. A and B start on the two bundled samples so the app
// works in one click; C starts empty and reuses A until a photo is added.
const photos = { A: null, B: null, C: null };

// One entry per panel: which slot it shows, its zoom and its pan offset.
const state = {
  layout: 'trio',
  grade: 'sunset',
  title: 'VICE CITY',
  tagline: 'Welcome back to Vice City',
  panels: [
    { slot: 'A', zoom: 1, panX: 0, panY: 0 },
    { slot: 'B', zoom: 1, panX: 0, panY: 0 },
    { slot: 'C', zoom: 1, panX: 0, panY: 0 },
  ],
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function photoFor(slot) {
  return photos[slot] || photos.A || photos.B || null;
}

function activePanels() {
  const count = state.layout === 'trio' ? 3 : state.layout === 'duo' ? 2 : 1;
  return state.panels.slice(0, count);
}

function redraw() {
  const w = canvas.width;
  const h = canvas.height;
  drawCover(ctx, {
    width: w,
    height: h,
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    tagline: state.tagline,
    panels: activePanels().map((p) => ({
      img: photoFor(p.slot),
      zoom: p.zoom,
      panX: p.panX,
      panY: p.panY,
    })),
  });
}

/** Resize the preview canvas to the layout's aspect, then redraw. */
function fitCanvas() {
  if (document.body.classList.contains('shot-cover')) {
    // Cover shots: canvas pixels match the viewport, so nothing stretches.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    // Preview stays square; exports pick their own size.
    canvas.width = 900;
    canvas.height = 900;
  }
  redraw();
}

// ---- panel controls (rebuilt when the layout changes) --------------------

function buildPanelControls() {
  panelBox.innerHTML = '';
  activePanels().forEach((panel, i) => {
    const row = document.createElement('div');
    row.className = 'panel-row';
    const label = document.createElement('span');
    label.textContent = `Panel ${i + 1}`;
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Photo for panel ${i + 1}`);
    for (const slot of ['A', 'B', 'C']) {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = `Photo ${slot}`;
      if (panel.slot === slot) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', () => {
      panel.slot = select.value;
      redraw();
    });
    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '2.5';
    zoom.step = '0.05';
    zoom.value = String(panel.zoom);
    zoom.setAttribute('aria-label', `Zoom for panel ${i + 1}`);
    zoom.addEventListener('input', () => {
      panel.zoom = Number(zoom.value);
      redraw();
    });
    row.append(label, select, zoom);
    panelBox.appendChild(row);
  });
}

// ---- drag to pan ----------------------------------------------------------

let drag = null;

function panelAt(clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  const x = ((clientX - box.left) / box.width) * canvas.width;
  const y = ((clientY - box.top) / box.height) * canvas.height;
  const rects = panelRects(state.layout, canvas.width, canvas.height);
  const idx = rects.findIndex((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  return idx < 0 ? null : { idx, x, y, scale: canvas.width / box.width };
}

canvas.addEventListener('pointerdown', (e) => {
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit) return;
  const panel = activePanels()[hit.idx];
  drag = { panel, startX: hit.x, startY: hit.y, panX: panel.panX, panY: panel.panY };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit) return;
  drag.panel.panX = drag.panX + (hit.x - drag.startX);
  drag.panel.panY = drag.panY + (hit.y - drag.startY);
  redraw();
});

canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

// ---- toolbar ---------------------------------------------------------------

for (const layout of LAYOUTS) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'layout-btn';
  btn.dataset.layout = layout.id;
  btn.textContent = layout.label;
  if (layout.id === state.layout) btn.classList.add('active');
  btn.addEventListener('click', () => {
    state.layout = layout.id;
    document.querySelectorAll('.layout-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.layout === layout.id);
    });
    fitCanvas();
    buildPanelControls();
  });
  document.getElementById('layouts').appendChild(btn);
}

for (const grade of GRADES) {
  const opt = document.createElement('option');
  opt.value = grade.id;
  opt.textContent = grade.label;
  gradeSelect.appendChild(opt);
}
gradeSelect.value = state.grade;
gradeSelect.addEventListener('change', () => {
  state.grade = gradeSelect.value;
  redraw();
});

titleInput.addEventListener('input', () => {
  state.title = titleInput.value;
  redraw();
});
taglineInput.addEventListener('input', () => {
  state.tagline = taglineInput.value;
  redraw();
});

// Uploads: one file input per slot; a photo replaces that slot everywhere.
for (const slot of ['A', 'B', 'C']) {
  const input = document.getElementById(`upload-${slot.toLowerCase()}`);
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      photos[slot] = await loadImage(URL.createObjectURL(file));
      statusEl.textContent = `Photo ${slot} loaded.`;
      redraw();
    } catch {
      statusEl.textContent = `Could not read photo ${slot}.`;
    }
  });
}

// ---- export -----------------------------------------------------------------

const EXPORT_SIZES = [
  { w: 1080, h: 1080, label: '1080 x 1080' },
  { w: 1080, h: 1350, label: '1080 x 1350' },
  { w: 1920, h: 1080, label: '1920 x 1080' },
];

for (const size of EXPORT_SIZES) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'export-btn';
  btn.textContent = `Export PNG ${size.label}`;
  btn.addEventListener('click', () => {
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off.getContext('2d'), {
      width: size.w,
      height: size.h,
      layout: state.layout,
      grade: state.grade,
      title: state.title,
      tagline: state.tagline,
      panels: activePanels().map((p) => ({
        img: photoFor(p.slot),
        zoom: p.zoom,
        panX: p.panX * (size.w / canvas.width),
        panY: p.panY * (size.h / canvas.height),
      })),
    });
    off.toBlob((blob) => {
      if (!blob) {
        statusEl.textContent = 'Export failed.';
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-cover-${size.w}x${size.h}.png`;
      a.click();
      statusEl.textContent = `Saved vice-cover-${size.w}x${size.h}.png`;
    }, 'image/png');
  });
  document.getElementById('exports').appendChild(btn);
}

// ---- boot -------------------------------------------------------------------

async function boot() {
  try {
    photos.A = await loadImage('samples/pier.jpg');
    photos.B = await loadImage('samples/boulevard.jpg');
  } catch {
    statusEl.textContent = 'Sample photos could not load; upload your own.';
  }
  const shot = shotPreset();
  if (shot) {
    state.layout = shot.layout;
    state.grade = shot.grade;
    state.title = shot.title;
    state.tagline = shot.tagline;
    titleInput.value = shot.title;
    taglineInput.value = shot.tagline;
    gradeSelect.value = shot.grade;
    document.querySelectorAll('.layout-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.layout === shot.layout);
    });
    if (shot.shot !== 'editor') document.body.classList.add('shot-cover');
    try {
      const sample = await loadImage(`samples/${shot.photo}.jpg`);
      photos.A = sample;
      state.panels[0].slot = 'A';
    } catch {
      // Keep whatever loaded; the shot still renders.
    }
  }
  fitCanvas();
  buildPanelControls();
  if (shot) markShotReady();
}

boot();
