const PALETTES = [
  { name: 'GameBoy', colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'] },
  { name: 'CGA',     colors: ['#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa'] },
  { name: 'NES',     colors: ['#000000', '#fcfcfc', '#f8f878', '#d82800', '#0058f8', '#00a800', '#3cbcfc', '#fcbcb0'] },
  { name: 'C64',     colors: ['#000000', '#ffffff', '#68372b', '#70a4b2', '#6f3d86', '#588d43', '#352879', '#b8c76f'] },
  { name: 'Neon',    colors: ['#00ff88', '#00eaff', '#ff6b00', '#ff2d78', '#b400ff', '#ffee00'] },
  { name: 'Mono',    colors: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'] },
  { name: 'Autumn',  colors: ['#2d1b00', '#6b3a1f', '#c06000', '#e08020', '#f0c050', '#fff8d0'] },
  { name: 'Ocean',   colors: ['#001824', '#003050', '#005080', '#0080b0', '#00b0d0', '#80e8f8'] },
  { name: 'Sunset',  colors: ['#1a0030', '#4a0060', '#8b0050', '#c03040', '#f08020', '#ffd060'] },
  { name: 'Matrix',  colors: ['#000000', '#001800', '#003000', '#005000', '#00aa00', '#00ff00'] },
];

let activePaletteIndex = 0;
