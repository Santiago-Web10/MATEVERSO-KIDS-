const COLORES = {
  sun: '#f4b400',
  mint: '#2fbf86',
  coral: '#ee6a86',
  sky: '#3aa8e8',
  violet: '#8a6cf0',
  bg: '#ffffff',
  ln: '#b9aee8',
  fg: '#2b2a5c',
};
const svgTexto = (x, y, size, txt, mid) =>
  `<text x="${x}" y="${y}"${mid ? ' text-anchor="middle"' : ''} fill="${COLORES.fg}" font-family="Fredoka,sans-serif" font-size="${size}">${txt}</text>`;
const dibujoBarras = (n, d) => {
  const w = Math.min(300, d * 46),
    cw = w / d;
  let s = `<svg width="${w + 4}" height="56" viewBox="0 0 ${w + 4} 56" role="img" aria-label="${n} de ${d} partes pintadas">`;
  for (let i = 0; i < d; i++)
    s += `<rect x="${2 + i * cw}" y="2" width="${cw - 2}" height="52" rx="8" fill="${i < n ? COLORES.sky : COLORES.bg}" stroke="${COLORES.ln}" stroke-width="2"/>`;
  return s + '</svg>';
};
const dibujoArreglo = (r, c) => {
  let s = `<svg width="${c * 26 + 4}" height="${r * 26 + 4}" role="img" aria-label="${r} filas de ${c}">`;
  for (let i = 0; i < r; i++)
    for (let j = 0; j < c; j++) s += `<circle cx="${15 + j * 26}" cy="${15 + i * 26}" r="10" fill="${COLORES.sun}"/>`;
  return s + '</svg>';
};
const dibujoRectangulo = (w, h, u = 'm', fillIt = false) => {
  const k = Math.min(220 / w, 140 / h, 34),
    W = w * k,
    H = h * k;
  return `<svg width="${W + 70}" height="${H + 50}" role="img" aria-label="rectángulo de ${w} por ${h}">
    <rect x="35" y="14" width="${W}" height="${H}" rx="4" fill="${fillIt ? COLORES.mint + '55' : 'none'}" stroke="${COLORES.mint}" stroke-width="4"/>
    ${svgTexto(35 + W / 2, H + 38, 17, `${w} ${u}`, 1)}
    ${svgTexto(18, 14 + H / 2 + 5, 17, h, 1)}
    </svg>`;
};
const dibujoTriangulo = (b, h, u = 'cm') =>
  `<svg width="230" height="150" role="img" aria-label="triángulo base ${b} altura ${h}">
    <polygon points="25,125 205,125 120,20" fill="${COLORES.coral}44" stroke="${COLORES.coral}" stroke-width="4"/>
    <line x1="120" y1="20" x2="120" y2="125" stroke="${COLORES.fg}" stroke-dasharray="5 4"/>
    ${svgTexto(115, 144, 16, `base ${b} ${u}`, 1)}
    ${svgTexto(128, 82, 16, h)}
    </svg>`;
const dibujoPrisma = (l, w, h) =>
  `<svg width="230" height="160" role="img" aria-label="prisma ${l} por ${w} por ${h}">
    <polygon points="30,60 130,60 130,140 30,140" fill="${COLORES.violet}44" stroke="${COLORES.violet}" stroke-width="3"/>
    <polygon points="30,60 70,30 170,30 130,60" fill="${COLORES.violet}77" stroke="${COLORES.violet}" stroke-width="3"/>
    <polygon points="130,60 170,30 170,110 130,140" fill="${COLORES.violet}22" stroke="${COLORES.violet}" stroke-width="3"/>
    ${svgTexto(80, 158, 15, `${l} cm`, 1)}
    ${svgTexto(190, 85, 15, `${h} cm`)}
    ${svgTexto(100, 22, 15, `${w} cm`)}
    </svg>`;
const dibujoCirculo = (r) =>
  `<svg width="200" height="170" role="img" aria-label="círculo de radio ${r}">
    <circle cx="100" cy="85" r="68" fill="${COLORES.sky}33" stroke="${COLORES.sky}" stroke-width="4"/>
    <line x1="100" y1="85" x2="168" y2="85" stroke="${COLORES.fg}" stroke-width="3"/>
    <circle cx="100" cy="85" r="4" fill="${COLORES.fg}"/>
    ${svgTexto(134, 76, 16, `r = ${r}`, 1)}
    </svg>`;
const dibujoRecta = (a, b, marks) => {
  const w = 300,
    x = (v) => 20 + ((v - a) / (b - a)) * w;
  let s = `<svg width="${w + 40}" height="66" role="img" aria-label="recta numérica">
    <line x1="14" y1="30" x2="${w + 26}" y2="30" stroke="${COLORES.fg}" stroke-width="3"/>`;
  for (let v = a; v <= b; v++) {
    s += `<line x1="${x(v)}" y1="22" x2="${x(v)}" y2="38" stroke="${COLORES.fg}" stroke-width="2"/>
      ${svgTexto(x(v), 58, 13, String(v).replace('-', '−'), 1)}`;
  }
  (marks || []).forEach((m) => (s += `<circle cx="${x(m)}" cy="30" r="7" fill="${COLORES.sun}"/>`));
  return s + '</svg>';
};
const dibujoTexto = (t) => `<div style="font-size:42px;letter-spacing:6px">${t}</div>`;
