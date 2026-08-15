// Genera variantes más claras/oscuras de un color hex, para armar
// automáticamente la paleta brand-50/100/500/600/700 a partir de un
// único color que elige el admin.
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function shade(hex, percent) {
  // percent > 0 aclara, percent < 0 oscurece
  const { r, g, b } = hexToRgb(hex);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  const newR = Math.round((t - r) * p) + r;
  const newG = Math.round((t - g) * p) + g;
  const newB = Math.round((t - b) * p) + b;
  return `rgb(${newR}, ${newG}, ${newB})`;
}

export function applyBrandColor(primaryColor) {
  if (!primaryColor) return;
  const root = document.documentElement;
  root.style.setProperty("--brand-50", shade(primaryColor, 0.93));
  root.style.setProperty("--brand-100", shade(primaryColor, 0.85));
  root.style.setProperty("--brand-500", primaryColor);
  root.style.setProperty("--brand-600", shade(primaryColor, -0.12));
  root.style.setProperty("--brand-700", shade(primaryColor, -0.28));
}
