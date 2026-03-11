function applyPixel(ctx, canvas) {
  const size = State.pixelSize;
  const { width: w, height: h } = canvas;

  const offscreen = document.createElement('canvas');
  offscreen.width  = Math.max(1, Math.floor(w / size));
  offscreen.height = Math.max(1, Math.floor(h / size));
  const octx = offscreen.getContext('2d');

  octx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, offscreen.width, offscreen.height, 0, 0, w, h);

  quantizeColors(ctx, canvas);
}

function applyMosaic(ctx, canvas) {
  const size = State.pixelSize;
  const { width: w, height: h } = canvas;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = 0; dy < size && y + dy < h; dy++) {
        for (let dx = 0; dx < size && x + dx < w; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      const [pr, pg, pb] = nearestPaletteRGB(r, g, b);

      for (let dy = 0; dy < size && y + dy < h; dy++) {
        for (let dx = 0; dx < size && x + dx < w; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          const border = (dy === 0 || dx === 0 || dy === size - 1 || dx === size - 1);
          data[i]     = border ? Math.max(0, pr - 30) : pr;
          data[i + 1] = border ? Math.max(0, pg - 30) : pg;
          data[i + 2] = border ? Math.max(0, pb - 30) : pb;
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyDither(ctx, canvas) {
  const size = State.pixelSize;
  const { width: w, height: h } = canvas;

  const offscreen = document.createElement('canvas');
  offscreen.width  = Math.max(1, Math.floor(w / size));
  offscreen.height = Math.max(1, Math.floor(h / size));
  const octx = offscreen.getContext('2d');
  octx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);

  const imageData = octx.getImageData(0, 0, offscreen.width, offscreen.height);
  const data = imageData.data;
  const ow = offscreen.width, oh = offscreen.height;

  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const i = (y * ow + x) * 4;
      const oldR = data[i], oldG = data[i + 1], oldB = data[i + 2];
      const [nr, ng, nb] = nearestPaletteRGB(oldR, oldG, oldB);
      data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;

      const er = oldR - nr, eg = oldG - ng, eb = oldB - nb;
      const spread = (xi, yi, f) => {
        if (xi < 0 || xi >= ow || yi >= oh) return;
        const j = (yi * ow + xi) * 4;
        data[j]     = clamp(data[j]     + er * f);
        data[j + 1] = clamp(data[j + 1] + eg * f);
        data[j + 2] = clamp(data[j + 2] + eb * f);
      };
      spread(x + 1, y,     7 / 16);
      spread(x - 1, y + 1, 3 / 16);
      spread(x,     y + 1, 5 / 16);
      spread(x + 1, y + 1, 1 / 16);
    }
  }

  octx.putImageData(imageData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, ow, oh, 0, 0, w, h);
}

function applyASCII(ctx, canvas) {
  const chars = ' .:-=+*#%@';
  const size = Math.max(State.pixelSize, 6);
  const { width: w, height: h } = canvas;

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.font = `${size}px monospace`;
  ctx.textBaseline = 'top';

  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      const i = (y * w + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const bright = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const charIdx = Math.floor(bright * (chars.length - 1));
      const [pr, pg, pb] = nearestPaletteRGB(r, g, b);
      ctx.fillStyle = `rgb(${pr},${pg},${pb})`;
      ctx.fillText(chars[charIdx], x, y);
    }
  }
}

function applyGlitch(ctx, canvas) {
  applyPixel(ctx, canvas); // start from pixelated base

  const { width: w, height: h } = canvas;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const scratch = new Uint8ClampedArray(data);

  // RGB channel shift
  const shift = Math.floor(State.pixelSize * 1.5);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i  = (y * w + x) * 4;
      const ri = (y * w + Math.min(w - 1, x + shift)) * 4;
      const bi = (y * w + Math.max(0, x - shift)) * 4;
      data[i]     = scratch[ri];      // Red  → shifted right
      data[i + 2] = scratch[bi + 2]; // Blue → shifted left
    }
  }

  // Random horizontal scan-line tears
  const lines = Math.floor(Math.random() * 12) + 4;
  for (let l = 0; l < lines; l++) {
    const y = Math.floor(Math.random() * h);
    const lineShift = (Math.random() - 0.5) * 40;
    for (let x = 0; x < w; x++) {
      const src = Math.min(w - 1, Math.max(0, x + lineShift));
      const i  = (y * w + x) * 4;
      const si = (y * w + Math.floor(src)) * 4;
      data[i] = scratch[si]; data[i + 1] = scratch[si + 1]; data[i + 2] = scratch[si + 2];
    }
  }

  // Chromatic noise bursts
  for (let n = 0; n < 300; n++) {
    const x = Math.floor(Math.random() * w);
    const y = Math.floor(Math.random() * h);
    const i = (y * w + x) * 4;
    if (Math.random() > 0.5) { data[i] = 255; data[i + 1] = 0;   data[i + 2] = 0;   }
    else                      { data[i] = 0;   data[i + 1] = 255; data[i + 2] = 255; }
  }

  ctx.putImageData(imageData, 0, 0);
}

/* ── Halftone ───────────────────────────────── */
function applyHalftone(ctx, canvas) {
  const size = State.pixelSize;
  const { width: w, height: h } = canvas;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  for (let y = size / 2; y < h; y += size) {
    for (let x = size / 2; x < w; x += size) {
      const px = Math.round(x), py = Math.round(y);
      if (px >= w || py >= h) continue;
      const i = (py * w + px) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const bright = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const radius = bright * size * 0.6;
      const [pr, pg, pb] = nearestPaletteRGB(r, g, b);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${pr},${pg},${pb})`;
      ctx.fill();
    }
  }
}

/* ── Post-processing ────────────────────────── */
function applyGrayscale(ctx, canvas) {
  const { width: w, height: h } = canvas;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyScanlines(ctx, canvas) {
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, y, canvas.width, 2);
  }
}

function applyVignette(ctx, canvas) {
  const { width: w, height: h } = canvas;
  const grd = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

/* ── Effect dispatcher ──────────────────────── */
function runEffect(ctx, canvas) {
  // Apply image adjustments via CSS filter before drawing
  ctx.filter = `contrast(${State.contrast}%) brightness(${State.brightness}%) saturate(${State.saturation}%)`;
  ctx.drawImage(State.img, 0, 0);
  ctx.filter = 'none';

  // Primary effect
  switch (State.mode) {
    case 'pixel':    applyPixel(ctx, canvas);    break;
    case 'dither':   applyDither(ctx, canvas);   break;
    case 'ascii':    applyASCII(ctx, canvas);    break;
    case 'glitch':   applyGlitch(ctx, canvas);   break;
    case 'mosaic':   applyMosaic(ctx, canvas);   break;
    case 'halftone': applyHalftone(ctx, canvas); break;
  }

  // Optional post-processing
  if (State.gray) applyGrayscale(ctx, canvas);
  if (State.scan) applyScanlines(ctx, canvas);
  if (State.vig)  applyVignette(ctx, canvas);
}
