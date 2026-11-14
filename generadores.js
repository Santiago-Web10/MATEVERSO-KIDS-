const aleatorio = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const elegir = (a) => a[aleatorio(0, a.length - 1)];
const mezclar = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = aleatorio(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const mcd = (a, b) => (b ? mcd(b, a % b) : Math.abs(a));
const mcm = (a, b) => (a / mcd(a, b)) * b;
const aEspanol = (texto) => String(texto).replace('.', ',').replace('-', '−');
const formatoNumero = (n) => aEspanol(+(+n).toFixed(6));
const formatoDecimales = (n, d) => aEspanol((+n).toFixed(d));
const porNivel = (nivel, valores) => valores[nivel - 1];
const fraccionSimplificada = (n, d) => {
  const g = mcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? String(n) : n + '/' + d;
};
const leerNumero = (s) => {
  s = String(s).trim().replace('−', '-').replace(',', '.').replace(/\s/g, '');
  return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
};
const numeroDeCampo = (input) => leerNumero(input.value);
function opcionesNumericas(ans, o = {}) {
  const step = o.step || 1,
    dec = o.dec ?? (Number.isInteger(ans) ? 0 : 2),
    neg = o.neg,
    f = o.f || (dec ? (x) => formatoDecimales(x, dec) : String);
  const set = new Set([f(ans)]),
    cands = [
      ...(o.extra || []),
      ans + step,
      ans - step,
      ans + 2 * step,
      ans - 2 * step,
      ans + 10 * step,
      ans - 10 * step,
      ans * 2,
      ans + 5 * step,
      ans - 5 * step,
      ans + 3 * step,
    ];
  const out = [f(ans)];
  for (const c0 of mezclar(cands)) {
    const c = +(+c0).toFixed(6);
    if (!neg && c < 0) continue;
    const s = f(c);
    if (!set.has(s)) {
      set.add(s);
      out.push(s);
    }
    if (out.length >= 4) break;
  }
  let k = 7;
  while (out.length < 4) {
    const s = f(ans + k * step);
    if (!set.has(s) && (neg || ans + k * step >= 0)) {
      set.add(s);
      out.push(s);
    }
    k += 2;
  }
  return mezclar(out);
}
const crearPregunta = (q, a, opts, exp, x = {}) => Object.assign({ q, a: String(a), opts: mezclar(opts), exp }, x);
const crearPreguntaNumerica = (q, ans, exp, o = {}) => {
  const f = o.f || (o.dec ? (x) => formatoDecimales(x, o.dec) : Number.isInteger(ans) ? String : formatoNumero);
  const dec = o.dec ?? (Number.isInteger(ans) ? 0 : 2);
  return crearPregunta(
    q,
    f(ans),
    opcionesNumericas(ans, Object.assign({ f, dec }, o)),
    exp,
    Object.assign({ num: ans }, o.x || {})
  );
};
function opcionesFraccion(n, d) {
  const a = fraccionSimplificada(n, d);
  const c = [
    `${n + 1}/${d}`,
    `${n}/${d + 1}`,
    `${Math.max(1, n - 1)}/${d}`,
    `${n + 2}/${d}`,
    `${n}/${d + 2}`,
    `${d}/${n}`,
    `${n * 2}/${d * 3}`,
  ].filter((x) => x !== a);
  return [a, ...mezclar([...new Set(c)]).slice(0, 3)];
}
const GENERADORES = {};
GENERADORES.t4_1 = (L) => {
  const t = aleatorio(0, 3);
  if (t === 0) {
    const m = porNivel(L, [
        [10, 50],
        [50, 200],
        [100, 500],
      ]),
      a = aleatorio(...m),
      b = aleatorio(...m);
    return crearPreguntaNumerica(`${a} + ${b} = ?`, a + b, `Suma ${a} + ${b} = ${a + b}`, {
      step: porNivel(L, [10, 100, 1000]),
    });
  }
  if (t === 1) {
    const m = porNivel(L, [
      [20, 60],
      [50, 200],
      [100, 500],
    ]);
    let a = aleatorio(...m),
      b = aleatorio(Math.floor(m[0] / 2), a - 1);
    return crearPreguntaNumerica(`${a} − ${b} = ?`, a - b, `Resta ${a} − ${b} = ${a - b}`, {
      step: porNivel(L, [10, 100, 1000]),
    });
  }
  if (t === 2) {
    const p = porNivel(L, [10, 10, 100]),
      n = aleatorio(p * 3, p * (L === 3 ? 15 : 9)) + aleatorio(1, p - 1);
    const a = Math.round(n / p) * p;
    return crearPreguntaNumerica(
      `Redondea ${n} a ${p === 10 ? 'las decenas' : p === 100 ? 'las centenas' : 'los millares'}`,
      a,
      `${n} está más cerca de ${a}.`,
      { step: p }
    );
  }
  const d = porNivel(L, [2, 2, 3]);
  const nums = new Set();
  while (nums.size < 4) nums.add(aleatorio(10 ** (d - 1), 10 ** d - 1));
  const arr = [...nums];
  const mx = Math.max(...arr);
  return crearPregunta(
    '¿Cuál es el número mayor?',
    String(mx),
    arr.map(String),
    `Compara cifra por cifra desde la izquierda: ${mx} es el mayor.`
  );
};
GENERADORES.t4_2 = (L) => {
  const t = aleatorio(0, 3);
  if (t === 0) {
    const [a, b] = porNivel(L, [
      [aleatorio(2, 5), aleatorio(2, 5)],
      [aleatorio(2, 9), aleatorio(2, 5)],
      [aleatorio(2, 9), aleatorio(2, 9)],
    ]);
    return crearPreguntaNumerica(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a * b}`, {
      step: porNivel(L, [a, b, 10]),
      x: { vis: L === 1 ? dibujoArreglo(a, b) : '' },
    });
  }
  if (t === 1) {
    const [b, c] = porNivel(L, [
      [aleatorio(2, 5), aleatorio(2, 5)],
      [aleatorio(2, 5), aleatorio(2, 9)],
      [aleatorio(2, 9), aleatorio(2, 9)],
    ]);
    return crearPreguntaNumerica(`${b * c} ÷ ${b} = ?`, c, `Porque ${b} × ${c} = ${b * c}.`, {
      step: L === 1 ? 1 : 2,
    });
  }
  if (t === 2) {
    const a = porNivel(L, [aleatorio(2, 4), aleatorio(2, 5), aleatorio(3, 6)]),
      b = porNivel(L, [aleatorio(2, 5), aleatorio(2, 6), aleatorio(2, 6)]);
    return crearPreguntaNumerica(
      `Una bandeja tiene ${b} salteñas. ¿Cuántas salteñas hay en ${a} bandejas?`,
      a * b,
      `${a} × ${b} = ${a * b} salteñas.`,
      { step: b }
    );
  }
  const a = aleatorio(2, 9),
    b = porNivel(L, [aleatorio(2, 5), aleatorio(2, 6), aleatorio(2, 9)]);
  return crearPreguntaNumerica(`${a} × ? = ${a * b}`, b, `${a * b} ÷ ${a} = ${b}`, { step: 1 });
};
GENERADORES.t4_3 = (L) => {
  const t = aleatorio(0, 3),
    ds = porNivel(L, [
      [2, 3, 4],
      [2, 3, 4, 5],
      [2, 3, 4, 5, 6],
    ]),
    d = elegir(ds),
    n = aleatorio(1, d - 1);
  if (t === 0) {
    const k = aleatorio(2, L === 1 ? 2 : 3);
    return crearPreguntaNumerica(`${n}/${d} = ?/${d * k}`, n * k, `Multiplica arriba y abajo por ${k}: ${n}×${k}=${n * k}.`, {
      step: 1,
    });
  }
  if (t === 1) {
    const D = d < 3 ? 4 : d,
      n1 = aleatorio(1, D - 1);
    let m = aleatorio(1, D - 1);
    while (m === n1) m = aleatorio(1, D - 1);
    const big = Math.max(n1, m);
    return crearPregunta(
      '¿Qué fracción es mayor?',
      `${big}/${D}`,
      [`${n1}/${D}`, `${m}/${D}`, 'Son iguales'],
      'Con el mismo denominador, es mayor la que tiene mayor numerador.'
    );
  }
  if (t === 2) {
    const a = aleatorio(1, Math.max(1, d - 2)),
      b = aleatorio(1, d - 1 - a < 1 ? 1 : d - 1 - a);
    const s = a + b;
    return crearPregunta(
      `${a}/${d} + ${b}/${d} = ?`,
      `${s}/${d}`,
      [`${s}/${d}`, `${s}/${d * 2}`, `${s + 1}/${d}`, `${Math.abs(a - b) || 1}/${d}`],
      `Mismo denominador: se suman los numeradores. ${a}+${b}=${s}.`
    );
  }
  return crearPregunta(
    '¿Qué fracción está pintada?',
    `${n}/${d}`,
    [`${n}/${d}`, `${d - n}/${d}`, `${n}/${d + 1}`, `${n + 1}/${d}`].filter((v, i, a) => a.indexOf(v) === i),
    `Hay ${n} partes pintadas de ${d} iguales.`,
    { vis: dibujoBarras(n, d) }
  );
};
GENERADORES.t4_4 = (L) => {
  if (aleatorio(0, 3) === 0) {
    const it = elegir([
      ['la distancia de Santa Cruz a Cotoca', 'km'],
      ['el peso de una mochila', 'kg'],
      ['el agua de una botella', 'L'],
      ['el largo de un lápiz', 'cm'],
      ['el peso de una moneda', 'g'],
      ['una dosis de jarabe', 'mL'],
      ['la altura de una puerta', 'm'],
    ]);
    const u = ['m', 'km', 'cm', 'kg', 'g', 'L', 'mL'];
    const o = [it[1], ...mezclar(u.filter((x) => x !== it[1])).slice(0, 3)];
    return crearPregunta(`¿Qué unidad usarías para medir ${it[0]}?`, it[1], o, `Lo más cómodo es medir ${it[0]} en ${it[1]}.`);
  }
  const P = [
      ['m', 'cm', 100],
      ['km', 'm', 1000],
      ['kg', 'g', 1000],
      ['L', 'mL', 1000],
      ['cm', 'mm', 10],
    ],
    [A, B, f] = elegir(P);
  if (aleatorio(0, 2) === 0) {
    const v = aleatorio(1, L + 2);
    return crearPreguntaNumerica(`${v * f} ${B} = ? ${A}`, v, `${v * f} ÷ ${f} = ${v}`, { step: 1 });
  }
  const v = porNivel(L, [aleatorio(1, 5), aleatorio(2, 10), elegir([0.5, 1.5, 2.5])]);
  return crearPreguntaNumerica(
    `${formatoNumero(v)} ${A} = ? ${B}`,
    v * f,
    `${formatoNumero(v)} × ${f} = ${formatoNumero(v * f)}`,
    { step: f / 10 }
  );
};
GENERADORES.t4_5 = (L) => {
  const t = aleatorio(0, 4),
    m = porNivel(L, [
      [2, 5],
      [2, 8],
      [3, 10],
    ]),
    w = aleatorio(...m),
    h = aleatorio(...m);
  if (t === 0)
    return crearPreguntaNumerica(
      `Un rectángulo mide ${w} m de largo y ${h} m de ancho. ¿Cuál es su perímetro (m)?`,
      2 * (w + h),
      `P = 2 × (${w} + ${h}) = ${2 * (w + h)} m`,
      { step: 2, x: { vis: dibujoRectangulo(w, h) } }
    );
  if (t === 1)
    return crearPreguntaNumerica(
      `Un cuadrado tiene lado ${w} cm. ¿Cuál es su perímetro (cm)?`,
      4 * w,
      `P = 4 × ${w} = ${4 * w} cm`,
      { step: 4 }
    );
  if (t === 2) {
    const c = aleatorio(m[0], m[1]);
    return crearPreguntaNumerica(
      `Un triángulo tiene lados de ${w} cm, ${h} cm y ${c} cm. ¿Cuál es su perímetro (cm)?`,
      w + h + c,
      `Suma de los lados: ${w}+${h}+${c}=${w + h + c}`,
      { step: 2 }
    );
  }
  if (t === 3) {
    const f = elegir([
      ['triángulo', 3],
      ['cuadrilátero', 4],
      ['pentágono', 5],
      ['hexágono', 6],
      ['octógono', 8],
    ]);
    return crearPregunta(
      `¿Cuántos lados tiene un ${f[0]}?`,
      String(f[1]),
      opcionesNumericas(f[1]),
      `El ${f[0]} tiene ${f[1]} lados.`
    );
  }
  return crearPreguntaNumerica(
    `Un rectángulo tiene perímetro ${2 * (w + h)} m y un lado de ${w} m. ¿Cuánto mide el otro lado (m)?`,
    h,
    `Semiperímetro = ${w + h}. ${w + h} − ${w} = ${h}`,
    { step: 1 }
  );
};
GENERADORES.t5_1 = (L) => {
  const t = aleatorio(0, 4),
    d = L < 3 ? 1 : 2,
    k = 10 ** d;
  if (t === 0) {
    const a = aleatorio(11, 60 * L + 39) / k,
      b = aleatorio(11, 60 * L + 39) / k;
    return crearPreguntaNumerica(`${formatoDecimales(a, d)} + ${formatoDecimales(b, d)} = ?`, a + b, `Alinea las comas y suma.`, {
      dec: d,
      step: (1 / k) * 10,
    });
  }
  if (t === 1) {
    let a = aleatorio(30, 60 * L + 39) / k,
      b = aleatorio(11, Math.floor(a * k) - 1) / k;
    return crearPreguntaNumerica(
      `${formatoDecimales(a, d)} − ${formatoDecimales(b, d)} = ?`,
      a - b,
      `Alinea las comas y resta.`,
      {
        dec: d,
        step: (1 / k) * 10,
      }
    );
  }
  if (t === 2) {
    let a = aleatorio(11, 99) / 100,
      b = aleatorio(11, 99) / 100;
    while (a === b) b = aleatorio(11, 99) / 100;
    const mx = Math.max(a, b);
    return crearPregunta(
      '¿Cuál es mayor?',
      formatoDecimales(mx, 2),
      [formatoDecimales(a, 2), formatoDecimales(b, 2)],
      `Compara décimas, luego centésimas: ${formatoDecimales(mx, 2)} es mayor.`
    );
  }
  if (t === 3) {
    const x = aleatorio(11, 99) / 10,
      p = elegir([10, 10, 10, 100]);
    return crearPreguntaNumerica(
      `${formatoNumero(x)} × ${p} = ?`,
      Math.round(x * p * 1000) / 1000,
      `Multiplicar por ${p} mueve la coma ${p === 10 ? 1 : 2} lugar(es) a la derecha.`,
      { f: formatoNumero, step: p / 10 }
    );
  }
  const a = aleatorio(2, 9) + elegir([0.5, 0]),
    b = aleatorio(3, 12) + elegir([0.5, 0]);
  return crearPregunta(
    `Compras pan por Bs ${formatoDecimales(a, 2)} y leche por Bs ${formatoDecimales(b, 2)}. ¿Cuánto gastas?`,
    'Bs ' + formatoDecimales(a + b, 2),
    opcionesNumericas(a + b, { dec: 2, step: 0.5, f: (x) => 'Bs ' + formatoDecimales(x, 2) }),
    `${formatoDecimales(a, 2)} + ${formatoDecimales(b, 2)} = ${formatoDecimales(a + b, 2)}`
  );
};
GENERADORES.t5_2 = (L) => {
  const t = aleatorio(0, 3);
  if (t === 0) {
    const d1 = elegir([2, 3, 4]);
    let d2 = L === 1 ? d1 * 2 : elegir([2, 3, 4].filter((x) => x !== d1));
    const n = aleatorio(1, d1 - 1),
      m = aleatorio(1, d2 - 1);
    const N = n * d2 + m * d1,
      D = d1 * d2,
      a = fraccionSimplificada(N, D);
    const o = [a, `${n + m}/${d1 + d2}`, `${N + 1}/${D}`, `${N}/${D + d1}`].filter((v, i, x) => x.indexOf(v) === i);
    while (o.length < 4) o.push(`${N + o.length}/${D}`);
    return crearPregunta(`${n}/${d1} + ${m}/${d2} = ?`, a, o, `Denominador común ${mcm(d1, d2)}. Resultado ${a}.`);
  }
  if (t === 1) {
    const b = aleatorio(2, 5),
      a = aleatorio(1, b - 1),
      d = aleatorio(2, 4),
      c = aleatorio(1, d - 1);
    const ans = fraccionSimplificada(a * c, b * d);
    return crearPregunta(
      `${a}/${b} × ${c}/${d} = ?`,
      ans,
      [...new Set([ans, `${a + c}/${b + d}`, `${a * c}/${b + d}`, `${a * d}/${b * c}`, '1/2', '2/3', '3/4', '1/3'])].slice(0, 4),
      `Multiplica numeradores y denominadores: ${a * c}/${b * d}, y simplifica.`
    );
  }
  if (t === 2) {
    const g = elegir([2, 3]),
      n = elegir([1, 2, 3]),
      d = elegir([4, 5, 6].filter((x) => mcd(n, x) === 1 && x > n));
    return crearPregunta(
      `Simplifica ${n * g}/${d * g}`,
      `${n}/${d}`,
      opcionesFraccion(n, d),
      `Divide arriba y abajo entre ${g}.`
    );
  }
  const d = elegir([2, 3, 4, 5]),
    n = aleatorio(1, d - 1),
    k = aleatorio(2, 6);
  return crearPreguntaNumerica(`${n}/${d} de ${d * k} = ?`, n * k, `${d * k} ÷ ${d} = ${k} y ${k} × ${n} = ${n * k}`, {
    step: 1,
  });
};
GENERADORES.t5_3 = (L) => {
  const t = aleatorio(0, 3),
    mx = porNivel(L, [4, 6, 8]);
  if (t === 0) {
    const g = aleatorio(2, 4),
      u = aleatorio(2, 4),
      a = g * u,
      b = g * elegir([2, 3, 4].filter((x) => x !== u));
    return crearPreguntaNumerica(
      `¿Cuál es el máximo común divisor (MCD) de ${a} y ${b}?`,
      mcd(a, b),
      `El mayor número que divide a ambos es ${mcd(a, b)}.`,
      { step: 1 }
    );
  }
  if (t === 1) {
    const a = aleatorio(2, mx),
      b = aleatorio(2, mx);
    return crearPreguntaNumerica(
      `¿Cuál es el mínimo común múltiplo (mcm) de ${a} y ${b}?`,
      mcm(a, b),
      `El menor número que es múltiplo de ambos es ${mcm(a, b)}.`,
      { step: Math.max(a, b) }
    );
  }
  if (t === 2) {
    const k = elegir([2, 3, 5, 9, 10, 4, 6].slice(0, L === 1 ? 3 : 5));
    const m = k * aleatorio(2, 10);
    const o = new Set([m]);
    while (o.size < 4) {
      const x = aleatorio(10, 150);
      if (x % k) o.add(x);
    }
    return crearPregunta(
      `¿Cuál de estos números es múltiplo de ${k}?`,
      String(m),
      [...o].map(String),
      `${m} ÷ ${k} = ${m / k}, división exacta.`
    );
  }
  const n = elegir([6, 8, 10, 12, 15, 16, 18, 20, 24].slice(0, L === 1 ? 3 : 5)),
    dv = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) dv.push(i);
  return crearPreguntaNumerica(`¿Cuántos divisores tiene el ${n}?`, dv.length, `Los divisores de ${n} son: ${dv.join(', ')}.`, {
    step: 1,
  });
};
GENERADORES.t5_4 = (L) => {
  const t = aleatorio(0, 4),
    m = porNivel(L, [
      [2, 5],
      [2, 7],
      [3, 9],
    ]),
    w = aleatorio(...m),
    h = aleatorio(...m);
  if (t === 0)
    return crearPreguntaNumerica(
      `Un rectángulo mide ${w} m por ${h} m. ¿Cuál es su área (m²)?`,
      w * h,
      `A = ${w} × ${h} = ${w * h} m²`,
      {
        step: w,
        x: { vis: dibujoRectangulo(w, h, 'm', true) },
      }
    );
  if (t === 1) {
    const b = w * 2,
      hh = h;
    return crearPreguntaNumerica(
      `Un triángulo tiene base ${b} cm y altura ${hh} cm. ¿Cuál es su área (cm²)?`,
      (b * hh) / 2,
      `A = (${b} × ${hh}) ÷ 2 = ${(b * hh) / 2} cm²`,
      { step: b / 2, x: { vis: dibujoTriangulo(b, hh) } }
    );
  }
  if (t === 2) {
    const a = aleatorio(2, 4),
      b = aleatorio(2, 3),
      c = aleatorio(2, 4);
    return crearPreguntaNumerica(
      `Un prisma mide ${a} cm × ${b} cm × ${c} cm. ¿Cuál es su volumen (cm³)?`,
      a * b * c,
      `V = ${a} × ${b} × ${c} = ${a * b * c} cm³`,
      { step: a, x: { vis: dibujoPrisma(a, b, c) } }
    );
  }
  if (t === 3)
    return crearPreguntaNumerica(
      `Un cuadrado tiene lado ${w} m. ¿Cuál es su área (m²)?`,
      w * w,
      `A = ${w} × ${w} = ${w * w} m²`,
      { step: w }
    );
  return crearPreguntaNumerica(
    `Un rectángulo tiene área ${w * h} m² y un lado de ${w} m. ¿Cuánto mide el otro lado (m)?`,
    h,
    `${w * h} ÷ ${w} = ${h}`,
    { step: 1 }
  );
};
GENERADORES.t5_5 = (L) => {
  const T = [
    () => {
      const k = aleatorio(2, 4),
        p = aleatorio(5, 12),
        pay = Math.ceil((k * p) / 50 + 0.01) * 50;
      return crearPreguntaNumerica(
        `Doña Rosa compra ${k} kg de tomate a Bs ${p} el kilo y paga con Bs ${pay}. ¿Cuánto cambio recibe (Bs)?`,
        pay - k * p,
        `Gasta ${k}×${p}=${k * p}. Cambio: ${pay}−${k * p}=${pay - k * p}.`,
        { step: 5 }
      );
    },
    () => {
      const v = elegir([20, 30, 40, 50]),
        t = aleatorio(2, 3);
      return crearPreguntaNumerica(
        `Un micro viaja a ${v} km por hora durante ${t} horas. ¿Cuántos kilómetros recorre?`,
        v * t,
        `${v} × ${t} = ${v * t} km`,
        { step: (v / 2) | 0 || 5 }
      );
    },
    () => {
      const g = aleatorio(2, 5),
        c = aleatorio(2, 6);
      return crearPreguntaNumerica(
        `Se reparten ${g * c} cuadernos en partes iguales entre ${g} cursos. ¿Cuántos cuadernos recibe cada curso?`,
        c,
        `${g * c} ÷ ${g} = ${c}`,
        { step: 1 }
      );
    },
    () => {
      const x = aleatorio(2, 5) * 100,
        y = elegir([2, 6, 8]);
      return crearPreguntaNumerica(
        `Una receta de empanadas lleva ${x} g de harina para 4 personas. ¿Cuántos gramos para ${y} personas?`,
        (x / 4) * y,
        `Para 1 persona: ${x / 4} g. Para ${y}: ${(x / 4) * y} g.`,
        { step: 50 }
      );
    },
    () => {
      const a = aleatorio(2, 6),
        p = aleatorio(2, 6),
        q = aleatorio(1, 3);
      return crearPreguntaNumerica(
        `Compras ${a} cuadernos a Bs ${p} cada uno y un lápiz de Bs ${q}. ¿Cuánto pagas en total (Bs)?`,
        a * p + q,
        `${a}×${p} = ${a * p}, más ${q} = ${a * p + q}.`,
        { step: 2 }
      );
    },
    () => {
      const a = aleatorio(130, 150) / 100,
        b = a + aleatorio(5, 25) / 100;
      return crearPreguntaNumerica(
        `Ana mide ${formatoDecimales(a, 2)} m y su hermano ${formatoDecimales(b, 2)} m. ¿Cuántos metros más alto es el hermano?`,
        b - a,
        `${formatoDecimales(b, 2)} − ${formatoDecimales(a, 2)} = ${formatoDecimales(b - a, 2)}`,
        { dec: 2, step: 0.05 }
      );
    },
  ];
  return elegir(porNivel(L, [T.slice(0, 3), T.slice(1, 5), T.slice(3)]))();
};
GENERADORES.t6_1 = (L) => {
  const a = aleatorio(2, 9),
    b = aleatorio(2, 6),
    c = aleatorio(2, 6),
    d = aleatorio(2, 6);
  if (L === 1) {
    const t = aleatorio(0, 1);
    return t
      ? crearPreguntaNumerica(
          `${a} + ${b} × ${c} = ?`,
          a + b * c,
          `Primero la multiplicación: ${b}×${c}=${b * c}; luego ${a}+${b * c}.`,
          {
            extra: [(a + b) * c],
            step: 2,
          }
        )
      : crearPreguntaNumerica(
          `(${a} + ${b}) × ${c} = ?`,
          (a + b) * c,
          `Primero el paréntesis: ${a}+${b}=${a + b}; luego ×${c}.`,
          {
            extra: [a + b * c],
            step: 2,
          }
        );
  }
  if (L === 2) {
    const x = a * b,
      y = c * d,
      mx = Math.max(x, y),
      mn = Math.min(x, y);
    return aleatorio(0, 1)
      ? crearPreguntaNumerica(
          `${mx > x ? c : a} × ${mx > x ? d : b} − ${mx > x ? a : c} × ${mx > x ? b : d} = ?`,
          mx - mn,
          `Haz las multiplicaciones y luego resta.`,
          { step: 2 }
        )
      : crearPreguntaNumerica(
          `(${a} + ${b}) × ${c} − ${d} = ?`,
          (a + b) * c - d,
          `Paréntesis, multiplicación y al final la resta.`,
          { step: 2 }
        );
  }
  const e = aleatorio(1, 9);
  return crearPreguntaNumerica(
    `${a} + [(${b} + ${c}) × ${d}] − ${e} = ?`,
    a + (b + c) * d - e,
    `Corchete: (${b}+${c})×${d}=${(b + c) * d}. Luego ${a}+${(b + c) * d}−${e}.`,
    { step: 3 }
  );
};
GENERADORES.t6_2 = (L) => {
  const t = aleatorio(0, 4);
  if (t === 0) {
    const p = elegir(
        porNivel(L, [
          [10, 50],
          [10, 20, 25, 50],
          [10, 20, 25, 50, 75],
        ])
      ),
      N = aleatorio(1, 6) * 20;
    return crearPreguntaNumerica(
      `¿Cuánto es el ${p}% de ${N}?`,
      (p * N) / 100,
      `${p}% de ${N} = ${N} × ${p} ÷ 100 = ${(p * N) / 100}`,
      { step: L }
    );
  }
  if (t === 1) {
    const p = elegir([10, 20, 25, 50]),
      N = aleatorio(2, 8) * 20;
    return crearPreguntaNumerica(
      `Una mochila cuesta Bs ${N} y tiene ${p}% de descuento. ¿Cuánto pagas (Bs)?`,
      N - (p * N) / 100,
      `Descuento: ${(p * N) / 100}. Pagas ${N}−${(p * N) / 100}.`,
      { step: 5 }
    );
  }
  if (t === 2) {
    const a = aleatorio(2, 6),
      u = aleatorio(2, 9),
      c = a * aleatorio(2, 4);
    return crearPreguntaNumerica(
      `Si ${a} cuadernos cuestan Bs ${a * u}, ¿cuánto cuestan ${c} cuadernos (Bs)?`,
      c * u,
      `Cada cuaderno cuesta ${u}. ${c} × ${u} = ${c * u}.`,
      { step: u }
    );
  }
  if (t === 3) {
    const f = elegir([
      [1, 2, 50],
      [1, 4, 25],
      [3, 4, 75],
      [1, 5, 20],
      [2, 5, 40],
      [1, 10, 10],
      [3, 5, 60],
    ]);
    return crearPregunta(
      `${f[0]}/${f[1]} equivale a…`,
      f[2] + '%',
      mezclar([f[2], f[2] + 10, f[2] - 10, f[2] + 25].map((x) => (x <= 0 ? 5 : x) + '%'))
        .filter((v, i, x) => x.indexOf(v) === i)
        .slice(0, 3)
        .concat(f[2] + '%')
        .filter((v, i, x) => x.indexOf(v) === i),
      `${f[0]}÷${f[1]} = ${f[2] / 100} = ${f[2]}%`
    );
  }
  const N = elegir([20, 25, 40, 50]),
    p = elegir([10, 20, 30, 40, 50, 60, 80].filter((x) => (x * N) % 100 === 0)),
    x = (p * N) / 100;
  return crearPregunta(
    `En un curso de ${N} estudiantes, ${x} llegaron en bus. ¿Qué porcentaje es?`,
    p + '%',
    mezclar([p, p + 10, p - 10 > 0 ? p - 10 : p + 20, p + 20].map((v) => v + '%'))
      .filter((v, i, a) => a.indexOf(v) === i)
      .concat(p + '%')
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 4),
    `${x} ÷ ${N} = ${p / 100} = ${p}%`
  );
};
GENERADORES.t6_3 = (L) => {
  const t = aleatorio(0, 3),
    m = porNivel(L, [5, 10, 20]),
    a = aleatorio(-m, m),
    b = aleatorio(-m, m),
    s = (n) => (n < 0 ? `(${formatoNumero(n)})` : String(n));
  if (t === 0)
    return crearPreguntaNumerica(
      `${a} + ${s(b)} = ?`,
      a + b,
      `Si los signos son distintos se restan y se conserva el signo del mayor.`,
      {
        neg: 1,
        f: formatoNumero,
        step: 1,
      }
    );
  if (t === 1)
    return crearPreguntaNumerica(`${a} − ${s(b)} = ?`, a - b, `Restar un número equivale a sumar su opuesto.`, {
      neg: 1,
      f: formatoNumero,
      step: 1,
    });
  if (t === 2) {
    const s = new Set();
    while (s.size < 4) s.add(aleatorio(-m, m));
    const arr = [...s],
      mn = Math.min(...arr);
    return crearPregunta(
      '¿Cuál es el menor?',
      formatoNumero(mn),
      arr.map(formatoNumero),
      `En la recta, el número más a la izquierda es el menor.`,
      {
        vis: dibujoRecta(-6, 6, []),
      }
    );
  }
  const T = [
    () => {
      const x = aleatorio(2, 9),
        d = aleatorio(x + 1, x + 10);
      return crearPreguntaNumerica(
        `En Potosí la temperatura era ${x} °C y bajó ${d} grados. ¿Qué temperatura marca ahora (°C)?`,
        x - d,
        `${x} − ${d} = ${x - d}`,
        { neg: 1, f: formatoNumero, step: 1 }
      );
    },
    () => {
      const x = aleatorio(5, 20),
        u = aleatorio(2, x);
      return crearPreguntaNumerica(
        `Un buzo está a −${x} m y sube ${u} m. ¿A qué profundidad está (m)?`,
        -x + u,
        `−${x} + ${u} = ${-x + u}`,
        {
          neg: 1,
          f: formatoNumero,
          step: 1,
        }
      );
    },
  ];
  return elegir(T)();
};
GENERADORES.t6_4 = (L) => {
  const pool = porNivel(L, [
      [0, 4, 5],
      [0, 2, 4, 5],
      [1, 2, 3, 4],
    ]),
    t = elegir(pool);
  if (t === 0) {
    const a = aleatorio(30, 90),
      b = aleatorio(30, 80);
    return crearPreguntaNumerica(
      `Dos ángulos de un triángulo miden ${a}° y ${b}°. ¿Cuánto mide el tercero (°)?`,
      180 - a - b,
      `Los ángulos de un triángulo suman 180°. 180−${a}−${b}.`,
      { step: 5 }
    );
  }
  if (t === 1) {
    const n = elegir([5, 6, 8]);
    return crearPreguntaNumerica(
      `¿Cuánto suman los ángulos interiores de un polígono de ${n} lados (°)?`,
      (n - 2) * 180,
      `(n − 2) × 180 = ${n - 2} × 180`,
      { step: 180 }
    );
  }
  if (t === 2) {
    const r = aleatorio(1, 5);
    return crearPreguntaNumerica(
      `Un círculo tiene radio ${r} cm. ¿Cuál es su circunferencia? (usa π = 3,14)`,
      +(2 * 3.14 * r).toFixed(2),
      `C = 2 × 3,14 × ${r}`,
      { f: formatoNumero, step: 3.14, x: { vis: dibujoCirculo(r) } }
    );
  }
  if (t === 3) {
    const r = aleatorio(2, 5);
    return crearPreguntaNumerica(
      `Un círculo tiene radio ${r} cm. ¿Cuál es su área (cm²)? (π = 3,14)`,
      +(3.14 * r * r).toFixed(2),
      `A = 3,14 × ${r} × ${r}`,
      { f: formatoNumero, step: 3.14, x: { vis: dibujoCirculo(r) } }
    );
  }
  if (t === 4) {
    const a = aleatorio(60, 110),
      b = aleatorio(70, 100),
      c = aleatorio(60, 100);
    return crearPreguntaNumerica(
      `Tres ángulos de un cuadrilátero miden ${a}°, ${b}° y ${c}°. ¿Cuánto mide el cuarto (°)?`,
      360 - a - b - c,
      `Un cuadrilátero suma 360°.`,
      { step: 5 }
    );
  }
  const g = elegir([
    [30, 'agudo'],
    [50, 'agudo'],
    [90, 'recto'],
    [120, 'obtuso'],
    [150, 'obtuso'],
    [180, 'llano'],
  ]);
  return crearPregunta(
    `Un ángulo de ${g[0]}° es…`,
    g[1],
    ['agudo', 'recto', 'obtuso', 'llano'],
    `Agudo <90°, recto =90°, obtuso entre 90° y 180°, llano =180°.`
  );
};
GENERADORES.t6_5 = (L) => {
  const t = aleatorio(0, 3);
  if (t === 0) {
    const a = aleatorio(2, 9),
      d = aleatorio(2, 5),
      k = 2;
    const seq = L === 1 ? [0, 1, 2, 3].map((i) => a + d * i) : [1, 2, 3, 4].map((i) => a * k ** (i - 1)).slice(0, 4);
    const nx = L === 1 ? a + d * 4 : a * k ** 4;
    return crearPreguntaNumerica(
      `¿Qué número sigue? ${seq.join(', ')}, …`,
      nx,
      L === 1 ? `Aumenta de ${d} en ${d}.` : `Se multiplica por ${k} cada vez.`,
      { step: d }
    );
  }
  if (t === 1) {
    const x = aleatorio(3, 12);
    return crearPreguntaNumerica(
      `Ana tiene el doble de años que Beto. Juntos suman ${3 * x}. ¿Cuántos años tiene Ana?`,
      2 * x,
      `Beto = ${x}, Ana = ${2 * x}, juntos ${3 * x}.`,
      { step: 1 }
    );
  }
  if (t === 2) {
    if (L < 3 || aleatorio(0, 3)) {
      const nm = mezclar(['Luis', 'Ana', 'Pedro', 'Marta', 'Sofía', 'Diego']).slice(0, 3),
        top = aleatorio(0, 1);
      const fm = (n) => (/a$/.test(n) ? 'alta' : 'alto');
      return crearPregunta(
        `${nm[0]} es más ${fm(nm[0])} que ${nm[1]}. ${nm[1]} es más ${fm(nm[1])} que ${nm[2]}. ¿Qué persona es la más ${top ? 'alta' : 'baja'}?`,
        top ? nm[0] : nm[2],
        nm,
        'Ordena a los tres de mayor a menor estatura.'
      );
    }
    const n = aleatorio(3, 5);
    return crearPreguntaNumerica(
      `En una reunión hay ${n} personas y cada una saluda a las demás una sola vez. ¿Cuántos saludos hay?`,
      (n * (n - 1)) / 2,
      `${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2}`,
      { step: 1 }
    );
  }
  const x = aleatorio(2, 6),
    d = aleatorio(2, 8);
  return crearPreguntaNumerica(
    `Un cuaderno y un lápiz cuestan Bs ${2 * x + d}. El cuaderno cuesta Bs ${d} más que el lápiz. ¿Cuánto cuesta el lápiz (Bs)?`,
    x,
    `Lápiz = x, cuaderno = x + ${d}. 2x + ${d} = ${2 * x + d}, entonces x = ${x}.`,
    { step: 1 }
  );
};
