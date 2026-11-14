const PERSONALIZACION = {
  autores: ['Santiago Guzmán Herbas', 'Leonel Valencia Rodas'],
  anio: 2026,
  mascota: 'Nova',
  logo: '',
  paleta: 'galaxia',
};

const PALETAS = {
  galaxia: {},
  oceano: {
    '--bg': '#e3f1ff',
    '--bg2': '#e6fbff',
    '--card2': '#eef6ff',
    '--line': '#b9d6f5',
    '--track': '#d3e6fa',
    '--violet': '#b9d4ff',
    '--focus': '#2f7fd6',
  },
  menta: {
    '--bg': '#e6fbf1',
    '--bg2': '#eefbe0',
    '--card2': '#effaf4',
    '--line': '#bfe6d3',
    '--track': '#d3f2e2',
    '--violet': '#b8ecd2',
    '--focus': '#2f9e6e',
  },
  atardecer: {
    '--bg': '#fff0e6',
    '--bg2': '#ffe9f1',
    '--card2': '#fff5ee',
    '--line': '#f5cdb9',
    '--track': '#fbdccd',
    '--violet': '#ffcfb8',
    '--focus': '#d9663a',
  },
};

function aplicarPersonalizacion() {
  const p = PERSONALIZACION;
  Object.entries(PALETAS[p.paleta] || {}).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  const autores = p.autores.filter(Boolean);
  $('#credNames').innerHTML = autores.map((a) => `<span>${a}</span>`).join('');
  $('#credCopy').textContent = `© ${p.anio} · Todos los derechos reservados`;
  $('#hBubble').textContent = `¡Hola! Soy ${p.mascota}, tu robot guía. ¡Vamos a aprender!`;
  $$('img[data-nova]').forEach((i) => (i.alt = `${p.mascota}, tu guía robot espacial`));
  if (p.logo) $('.brain-icon').innerHTML = `<img src="${p.logo}" alt="" height="28" />`;
}
