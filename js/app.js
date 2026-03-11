(function init() {
  // Set initial palette
  State.palette = PALETTES[0].colors;

  // Build UI widgets
  buildPaletteUI();
  updateStatPal();

  // Wire sliders
  initSlider('pixelSize',       'pixelSizeVal',  'pixelSize');
  initSlider('colorDepth',      'colorDepthVal', 'colorDepth');
  initSlider('contrastSlider',  'contrastVal',   'contrast');
  initSlider('brightnessSlider','brightnessVal', 'brightness');
  initSlider('saturationSlider','saturationVal', 'saturation');

  // Wire controls
  initModeButtons();
  initToggles();
  initFormatButtons();

  // Wire file input & drag-drop
  initUpload();

  // Wire action buttons
  document.getElementById('applyBtn')   .addEventListener('click', triggerApply);
  document.getElementById('downloadBtn').addEventListener('click', handleDownload);
  document.getElementById('resetBtn')   .addEventListener('click', handleReset);
})();

/* ── File Upload ───────────────────────────── */
function initUpload() {
  const upload   = document.getElementById('upload');
  const dropZone = document.getElementById('dropZone');

  upload.addEventListener('change', e => loadFile(e.target.files[0]));

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadFile(file);
  });
}

function loadFile(file) {
  if (!file) return;
  const reader = new FileReader();

  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      State.img = img;

      // Snapshot original pixels
      canvas.width  = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      State.originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Show canvas, hide placeholder
      canvas.style.display = 'block';
      document.getElementById('placeholder').style.display = 'none';

      // Update stats
      updateStatDim();
      updateStatMode();
      updateStatPal();
      updateStatPx();

      showToast('IMAGE LOADED ✓');
      if (State.auto) triggerApply();
    };
    img.src = ev.target.result;
  };

  reader.readAsDataURL(file);
}

function triggerApply() {
  if (!State.img) return;

  showLoading(true);

  // Yield to browser paint so loading overlay is visible first
  setTimeout(() => {
    canvas.width  = State.img.width;
    canvas.height = State.img.height;

    runEffect(ctx, canvas); // defined in effects.js
    saveHistory();          // defined in ui.js

    updateStatPx();
    updateStatMode();

    showLoading(false);
  }, 50);
}

function handleDownload() {
  if (!State.img) { showToast('NO IMAGE LOADED'); return; }

  const fmt  = State.downloadFmt;
  const link = document.createElement('a');
  link.download = `pixelforge-${State.mode}-${Date.now()}.${fmt}`;
  link.href     = canvas.toDataURL(`image/${fmt}`, fmt === 'jpeg' ? 0.92 : 1);
  link.click();

  showToast(`SAVED AS ${fmt.toUpperCase()} ✓`);
}

function handleReset() {
  if (!State.img || !State.originalImageData) return;
  canvas.width  = State.img.width;
  canvas.height = State.img.height;
  ctx.putImageData(State.originalImageData, 0, 0);
  showToast('RESET ✓');
}
