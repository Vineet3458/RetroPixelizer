/**
 * Clamp a number to [0, 255] and round to integer.
 * @param {number} v
 * @returns {number}
 */
function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

/**
 * Convert a CSS hex color string to an [R, G, B] array.
 * @param {string} hex  e.g. "#ff6b00"
 * @returns {[number, number, number]}
 */
function hexToRGB(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/**
 * Find the nearest palette color to a given RGB value using
 * squared Euclidean distance in RGB space.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {[number, number, number]}
 */
function nearestPaletteRGB(r, g, b) {
  const palette = State.palette;
  if (!palette || palette.length === 0) return [r, g, b];

  let best = null, bestDist = Infinity;
  for (const hex of palette) {
    const [pr, pg, pb] = hexToRGB(hex);
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (d < bestDist) { bestDist = d; best = [pr, pg, pb]; }
  }
  return best || [r, g, b];
}

/**
 * Remap all pixels in the current canvas to the nearest palette color.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 */
function quantizeColors(ctx, canvas) {
  if (!State.palette) return;
  const { width: w, height: h } = canvas;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = nearestPaletteRGB(data[i], data[i + 1], data[i + 2]);
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Show a brief toast notification.
 * @param {string} msg
 */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

/**
 * Update the CSS custom property used to style the range track fill.
 * @param {HTMLInputElement} el
 */
function updateSliderTrack(el) {
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.setProperty('--pct', pct + '%');
}
