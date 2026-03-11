const State = {
  img: null,              // Original Image object
  originalImageData: null,// ImageData snapshot before any effects

  // Effect settings
  mode:       'pixel',
  pixelSize:  12,
  colorDepth: 8,
  contrast:   100,
  brightness: 100,
  saturation: 100,

  // Post-processing toggles
  gray: false,
  scan: false,
  vig:  false,
  auto: true,

  // Palette & download
  palette:     null,
  downloadFmt: 'png',

  // History
  history: [],
};
