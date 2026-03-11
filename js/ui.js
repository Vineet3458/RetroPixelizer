const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d', { willReadFrequently: true });

function buildPaletteUI() {
  const grid = document.getElementById('paletteGrid');
  grid.innerHTML = '';

  PALETTES.forEach((p, i) => {
    const swatch = document.createElement('div');
    swatch.className = 'palette-swatch' + (i === activePaletteIndex ? ' active' : '');
    swatch.title = p.name;
    swatch.style.background = `linear-gradient(135deg, ${p.colors.slice(0, 4).join(', ')})`;

    swatch.addEventListener('click', () => {
      activePaletteIndex = i;
      State.palette = p.colors;
      document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      updateStatPal();
      if (State.auto && State.img) triggerApply();
    });

    grid.appendChild(swatch);
  });
}

function updateStatDim()  { document.getElementById('statDim').textContent  = `${State.img.width}×${State.img.height}`; }
function updateStatPx()   { document.getElementById('statPx').textContent   = State.pixelSize + 'px'; }
function updateStatPal()  { document.getElementById('statPal').textContent  = PALETTES[activePaletteIndex].name.toUpperCase(); }
function updateStatMode() { document.getElementById('statMode').textContent = State.mode.toUpperCase(); }

function showLoading(show) {
  document.getElementById('loadingOverlay').classList.toggle('show', show);
}

function saveHistory() {
  const strip    = document.getElementById('historyStrip');
  const histPanel = document.getElementById('historyPanel');

  const thumb    = document.createElement('img');
  thumb.className = 'history-thumb';
  thumb.src       = canvas.toDataURL('image/jpeg', 0.4);
  thumb.title     = State.mode.toUpperCase();

  thumb.addEventListener('click', () => {
    const tmp = new Image();
    tmp.onload = () => {
      canvas.width  = tmp.width;
      canvas.height = tmp.height;
      ctx.drawImage(tmp, 0, 0);
    };
    tmp.src = thumb.src;
  });

  strip.prepend(thumb);
  if (strip.children.length > 8) strip.removeChild(strip.lastChild);
  histPanel.style.display = 'block';
}

function initSlider(inputId, valId, stateKey) {
  const el  = document.getElementById(inputId);
  const val = document.getElementById(valId);

  el.addEventListener('input', () => {
    State[stateKey] = +el.value;
    val.textContent = el.value;
    updateSliderTrack(el);
    if (stateKey === 'pixelSize') updateStatPx();
    if (State.auto && State.img) triggerApply();
  });

  updateSliderTrack(el); // set initial track fill
}

function initModeButtons() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.mode = btn.dataset.mode;
      updateStatMode();
      if (State.auto && State.img) triggerApply();
    });
  });
}

function initToggles() {
  document.querySelectorAll('.toggle').forEach(t => {
    t.addEventListener('click', () => {
      const key = t.dataset.key;
      State[key] = !State[key];
      t.classList.toggle('on', State[key]);
      if (State.auto && State.img && key !== 'auto') triggerApply();
    });
  });
}

function initFormatButtons() {
  document.querySelectorAll('.fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.downloadFmt = btn.dataset.fmt;
    });
  });
}
