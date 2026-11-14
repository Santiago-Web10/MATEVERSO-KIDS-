const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const mostrar = (el, on = true) => el.classList.toggle('hide', !on);
const pintarEstrellas = (el, n) => [...el.children].forEach((s, i) => s.classList.toggle('off', i >= n));
const marcarPresionado = (sel, attr, val) => $$(sel).forEach((b) => b.setAttribute('aria-pressed', +b.dataset[attr] === val));

const vestirNova = () =>
  $$('img[data-nova]').forEach((img) => (img.src = 'nova.svg' + (estado.acc ? '#' + estado.acc : '')));
function actualizarCabecera() {
  $('#dstrN').textContent = estado.day.n;
  $('#dstrT').textContent = estado.day.n === 1 ? 'día' : 'días';
  $('#snd').textContent = estado.sound ? '🔊' : '🔇';
  $('#lvN').textContent = nivelPorPuntos(estado.xp);
  $('#lvB').style.width = ((estado.xp % 150) / 150) * 100 + '%';
  vestirNova();
}

let temporizadorAviso;
function aviso(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => t.classList.remove('on'), 2600);
}
let piezasConfeti = [],
  confetiActivo = false;
function lanzarConfeti() {
  sonido('win');
  const c = $('#fx');
  c.width = innerWidth;
  c.height = innerHeight;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const cols = ['#ffc24d', '#7fd8b0', '#ff8fab', '#7cc4ff', '#b79bff'];
  for (let i = 0; i < 110; i++)
    piezasConfeti.push({
      x: innerWidth / 2,
      y: innerHeight / 3,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 13 - 2,
      s: 5 + Math.random() * 7,
      c: elegir(cols),
      r: Math.random() * 6,
      l: 90 + Math.random() * 50,
    });
  if (!confetiActivo) {
    confetiActivo = true;
    (function f() {
      const x = c.getContext('2d');
      x.clearRect(0, 0, c.width, c.height);
      piezasConfeti = piezasConfeti.filter((p) => p.l-- > 0);
      piezasConfeti.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.r += 0.2;
        x.save();
        x.translate(p.x, p.y);
        x.rotate(p.r);
        x.fillStyle = p.c;
        x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        x.restore();
      });
      if (piezasConfeti.length) requestAnimationFrame(f);
      else {
        confetiActivo = false;
        x.clearRect(0, 0, c.width, c.height);
      }
    })();
  }
}
function textoFlotante(t, txt, col) {
  if (!t) return;
  const r = t.getBoundingClientRect(),
    e = document.createElement('span');
  e.className = 'pop';
  e.textContent = txt;
  e.style.cssText = `left:${Math.min(innerWidth - 60, Math.max(60, r.left + r.width / 2))}px;top:${Math.max(70, r.top)}px;color:${col || '#ffc83d'}`;
  document.body.appendChild(e);
  setTimeout(() => e.remove(), 900);
}
function destello(t, ok) {
  if (!t) return;
  t.classList.remove('flash-ok', 'flash-bad');
  void t.offsetWidth;
  t.classList.add(ok ? 'flash-ok' : 'flash-bad');
}
const FELICITACIONES = ['¡Genial!', '¡Excelente!', '¡Eres un crack!', '¡Muy bien!', '¡Así se hace!'],
  ANIMOS = ['¡Casi!', '¡Ánimo!', '¡Sigue intentando!', '¡Tú puedes!'];

function abrirModal(id) {
  $$('.md-panel').forEach((p) => mostrar(p, p.id === id));
  $('#modal').classList.add('on');
  const b = $('#' + id + ' button');
  b && b.focus();
}
function cerrarModal() {
  $('#modal').classList.remove('on');
}
function conectarTeclado(kp, inp, send) {
  kp.onclick = (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    const x = b.dataset.k;
    if (x === '⌫') inp.value = inp.value.slice(0, -1);
    else if (x === 'Enviar') send();
    else inp.value += x;
    sonido('tick');
  };
}

let temporizadorVista;
const VISTAS = ['home', 'temas', 'juegos', 'progreso', 'logros'];
const DIBUJAR_VISTA = {};
function irAVista(v) {
  clearInterval(temporizadorVista);
  detenerJuego();
  VISTAS.forEach((k) => $('#v-' + k).classList.toggle('on', k === v));
  $$('[data-v]').forEach((b) => b.setAttribute('aria-current', b.dataset.v === v));
  DIBUJAR_VISTA[v]();
  scrollTo({ top: 0 });
}

DIBUJAR_VISTA.home = () => {
  const done = TEMAS.filter((t) => estado.topics[t.id]?.done).length;
  const nx = temasDelGrado(estado.grade).find((t) => !estado.topics[t.id]?.done);
  mostrar($('#hGreet'), !!estado.name);
  mostrar($('#hWelcome'), !estado.name);
  $('#hName').textContent = estado.name;
  $('#inName').value = estado.name;
  $('#inGrade').value = estado.grade;
  mostrar($('#hProfile'), estado.locked);
  mostrar($('#hFields'), !estado.locked);
  mostrar($('#start'), !estado.locked);
  $('#hpName').textContent = estado.name;
  $('#hpGrade').textContent = estado.grade;
  mostrar($('#cont'), !!(nx && estado.locked && Object.keys(estado.topics).length));
  $('#homeDone').textContent = estado.locked ? temasCompletados(estado.grade) : done;
};

let gradoElegido = estado.grade,
  leccionActual = null;
const etiquetaGrado = () => estado.grade + '.º de Primaria';
DIBUJAR_VISTA.temas = () => {
  if (estado.locked) gradoElegido = estado.grade;
  mostrar($('#gradeTabs'), !estado.locked);
  $('#temasTitle').textContent = estado.locked ? `Temas de ${etiquetaGrado()}` : 'Temas por grado';
  $('#temasSub').textContent = estado.locked
    ? `${nombreAlumno()}, elige un tema. Completa cada tema con 6 aciertos de 10.`
    : 'Elige un grado y un tema. Completa cada tema con 6 aciertos de 10.';
  mostrar($('#temasList'), !leccionActual);
  mostrar($('#lesson'), !!leccionActual);
  if (leccionActual) return dibujarLeccion();
  const n = temasDelGrado(gradoElegido).find((t) => !estado.topics[t.id]?.done);
  $('#recTitle').textContent = n ? conNombre('Nova recomienda') : conNombre(`¡Completaste los 5 temas de ${gradoElegido}.º!`);
  $('#recText').textContent = n
    ? `${n.ic} ${n.name}`
    : estado.locked
      ? '¡Gran trabajo! Practica en los juegos para ganar medallas.'
      : 'Practica en los juegos o pasa al siguiente grado.';
  const rg = $('#recGo');
  mostrar(rg, !!n);
  if (n) rg.dataset.rec = n.id;
  marcarPresionado('#gradeTabs [data-g]', 'g', gradoElegido);
  $$('#topicGrid .topic').forEach((c) => {
    const t = temaPorId(c.dataset.t),
      s = estado.topics[t.id] || {};
    mostrar(c, t.g === gradoElegido);
    $('.t-state', c).textContent = s.done ? 'Completado ✓' : s.attempts ? 'En curso' : 'Nuevo';
    pintarEstrellas($('.stars', c), s.best >= 90 ? 3 : s.best >= 60 ? 2 : s.best >= 40 ? 1 : 0);
    $('.t-bar', c).style.width = (s.best || 0) + '%';
  });
};
const abrirTema = (id) => {
  leccionActual = { id, step: 0 };
  DIBUJAR_VISTA.temas();
  scrollTo({ top: 0 });
};

function dibujarLeccion() {
  const t = temaPorId(leccionActual.id),
    th = TEORIA[t.id];
  $('#lessonChip').textContent = `${t.g}.º · ${t.ic} ${t.name}`;
  $$('#stepsNav [data-s]').forEach((b) => b.setAttribute('aria-current', +b.dataset.s === leccionActual.step));
  for (let i = 0; i < 4; i++) mostrar($('#step' + i), i === leccionActual.step);
  if (leccionActual.step === 0) {
    $('#s0Title').textContent = t.name;
    const lines = th.intro.split(/(?<=\.)\s/);
    $$('#s0Intro .intro-line').forEach((p, i) => {
      mostrar(p, i < lines.length);
      p.textContent = lines[i] || '';
    });
    $('#s0Tip').textContent = th.tip;
  } else if (leccionActual.step === 1) {
    $$('#s1Grid .ex').forEach((c, i) => {
      const e = th.ex[i];
      mostrar(c, !!e);
      if (!e) return;
      $('.ex-t', c).innerHTML = e.t;
      $('.ex-v', c).innerHTML = e.v;
      $('.ex-r', c).innerHTML = e.r;
      mostrar($('.ex-r', c), false);
      mostrar($('.ex-btn', c), true);
    });
  } else if (leccionActual.step === 2) {
    iniciarPractica();
    dibujarPractica();
  } else dibujarActividad(t);
}

function iniciarPractica() {
  if (leccionActual.qs) return;
  const lv = [1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
    seen = new Set(),
    qs = [];
  lv.forEach((L) => {
    let q,
      n = 0;
    do {
      q = GENERADORES[leccionActual.id](L);
      n++;
    } while (seen.has(q.q) && n < 30);
    seen.add(q.q);
    q.L = L;
    q.input = q.num !== undefined && L >= 2 && Math.random() < 0.25;
    qs.push(q);
  });
  leccionActual.qs = qs;
  leccionActual.i = 0;
  leccionActual.ok = 0;
  leccionActual.ans = null;
  leccionActual.streak = 0;
  leccionActual.ended = false;
}

function dibujarPractica() {
  const end = leccionActual.i >= 10;
  mostrar($('#pq'), !end);
  mostrar($('#pEnd'), end);
  if (end) return terminarPractica();
  const q = leccionActual.qs[leccionActual.i],
    A = leccionActual.ans;
  $('#pqN').textContent = leccionActual.i + 1;
  $('#pqLv').textContent = '●'.repeat(q.L) + '○'.repeat(3 - q.L);
  $('#pqOk').textContent = leccionActual.ok;
  $('#pqStreak').textContent = leccionActual.streak;
  $('#pqBar').style.width = leccionActual.i * 10 + '%';
  $('#pqText').innerHTML = q.q;
  const v = $('#pqVis');
  v.innerHTML = q.vis || '';
  mostrar(v, !!q.vis);
  mostrar($('#pqOpts'), !q.input);
  $$('#pqOpts .opt').forEach((b, i) => {
    const o = q.opts[i];
    mostrar(b, o !== undefined);
    if (o === undefined) return;
    b.textContent = o;
    b.disabled = !!A;
    b.classList.remove('ok', 'bad');
    if (A) {
      if (o === q.a) b.classList.add('ok');
      else if (o === A.v) b.classList.add('bad');
    }
  });
  mostrar($('#pqInputBox'), !!q.input && !A);
  if (q.input && !A) {
    const i = $('#inA');
    i.value = '';
    i.focus();
  }
  const y = $('#pqYour');
  mostrar(y, !!q.input && !!A);
  if (q.input && A) {
    $('#pqYourV').textContent = A.v;
    y.classList.toggle('ok', A.right);
    y.classList.toggle('bad', !A.right);
  }
  const fb = $('#pqFb');
  mostrar(fb, !!A);
  if (A) {
    fb.classList.toggle('ok', A.right);
    fb.classList.toggle('bad', !A.right);
    $('#pqFbHead').textContent = A.head;
    $('#pqFbExp').innerHTML = q.exp;
  }
  mostrar($('#pqNextRow'), !!A);
  if (A) {
    $('#nq').textContent = leccionActual.i === 9 ? 'Ver resultado' : 'Siguiente →';
    setTimeout(() => $('#nq').focus(), 400);
  }
}
function responder(v) {
  const q = leccionActual.qs[leccionActual.i];
  if (leccionActual.ans) return;
  const right = q.input ? Math.abs(leerNumero(v) - q.num) < 1e-9 : v === q.a;
  sonido(right ? 'ok' : 'bad');
  const s = estadoTema(leccionActual.id);
  s.total++;
  if (right) {
    s.correct++;
    leccionActual.ok++;
    leccionActual.streak++;
    estado.stats.correct++;
    estado.streakMax = Math.max(estado.streakMax, leccionActual.streak);
    estado.xp += 10;
  } else leccionActual.streak = 0;
  leccionActual.ans = {
    v,
    right,
    head: right
      ? conNombre(elegir(FELICITACIONES)) + ' +10 puntos.'
      : conNombre(elegir(ANIMOS)) + ' La respuesta es ' + q.a + '.',
  };
  guardar();
  actualizarCabecera();
  revisarLogros();
  dibujarPractica();
  destello($('#pq'), right);
  textoFlotante(
    $('#pqText'),
    right ? (leccionActual.streak >= 3 ? '🔥x' + leccionActual.streak + ' +10' : '+10 ⭐') : '💫',
    right ? COLORES.mint : COLORES.coral
  );
}
function terminarPractica() {
  const s = estadoTema(leccionActual.id),
    pct = leccionActual.ok * 10;
  if (!leccionActual.ended) {
    leccionActual.ended = true;
    leccionActual.was = s.done;
    s.attempts++;
    s.last = pct;
    s.best = Math.max(s.best, pct);
    if (pct >= 60) s.done = true;
    guardar();
    if (pct >= 60) lanzarConfeti();
    revisarLogros();
  }
  const st = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0;
  $('#pEndMsg').textContent =
    pct >= 90
      ? '¡Perfecto! Eres un as.'
      : pct >= 60
        ? '¡Tema completado! Muy buen trabajo.'
        : 'Casi. Repasa la explicación e inténtalo otra vez.';
  pintarEstrellas($('#pEndStars'), st);
  $('#pEndOk').textContent = leccionActual.ok;
  $('#pEndPct').textContent = pct;
  $('#pEndXp').textContent = leccionActual.ok * 10;
  mostrar($('#pEndNew'), !leccionActual.was && s.done);
}

const PANELES_ACTIVIDAD = ['labFrac', 'labRect', 'labOrder', 'labPct', 'labPairs'];
function reiniciarActividad() {
  PANELES_ACTIVIDAD.forEach((id) => mostrar($('#' + id), false));
  mostrar($('#labBad'), false);
  mostrar($('#labOk'), false);
  mostrar($('#labEnd'), false);
}
function actividadCorrecta(msg) {
  const t = estadoTema(leccionActual.id);
  estado.stats.labs++;
  let bonus = '';
  if (!t.lab) {
    t.lab = true;
    bonus = '+20 puntos';
    guardar();
    sumarPuntos(20);
  } else guardar();
  lanzarConfeti();
  $('#labOkMsg').textContent = msg;
  $('#labBonus').textContent = bonus;
  mostrar($('#labBad'), false);
  mostrar($('#labOk'), true);
  mostrar($('#labEnd'), true);
}
function actividadIncorrecta(msg) {
  const f = $('#labBad');
  f.textContent = msg;
  mostrar(f, true);
}
function dibujarActividad(t) {
  const [kind, mode] = t.lab.split('-');
  reiniciarActividad();
  ({
    frac: actividadFracciones,
    rect: actividadGeometria,
    order: actividadOrdenar,
    pct: actividadPorcentajes,
    pairs: actividadParejas,
  })[kind](mode, t);
}
function actividadFracciones(_, t) {
  mostrar($('#labFrac'), true);
  let n,
    d,
    eq = '';
  if (t.g === 4) {
    d = aleatorio(2, 5);
    n = aleatorio(1, d - 1);
  } else {
    const base = elegir([
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [1, 4],
    ]);
    const k = 2;
    n = base[0] * k;
    d = base[1] * k;
    eq = `${base[0]}/${base[1]}`;
  }
  const on = Array(d).fill(false),
    btns = $$('#lfBar button');
  $('#lfTotal').textContent = d;
  $('#lfQ').innerHTML = eq ? `Pinta una fracción de la barra equivalente a <b>${eq}</b>.` : `Pinta <b>${n}/${d}</b> de la barra.`;
  const draw = () => {
    btns.forEach((b, i) => {
      mostrar(b, i < d);
      b.classList.toggle('on', !!on[i]);
    });
    $('#lfCount').textContent = on.filter(Boolean).length;
  };
  btns.forEach(
    (b, i) =>
      (b.onclick = () => {
        on[i] = !on[i];
        draw();
      })
  );
  const chk = $('#lfChk');
  chk.disabled = false;
  chk.onclick = () => {
    const c = on.filter(Boolean).length;
    if (c === n) {
      chk.disabled = true;
      actividadCorrecta(eq ? `¡Sí! ${n}/${d} es equivalente a ${eq}.` : `¡Exacto, ${n}/${d}!`);
    } else actividadIncorrecta(c > n ? 'Pintaste demasiadas partes.' : 'Faltan partes por pintar.');
  };
  draw();
}
function actividadGeometria(m) {
  mostrar($('#labRect'), true);
  let w = aleatorio(2, 6),
    h = aleatorio(2, 6),
    r = aleatorio(2, 8),
    tgt;
  if (m === 'perim') {
    tgt = 2 * (aleatorio(3, 7) + aleatorio(2, 5));
  } else if (m === 'area') {
    tgt = aleatorio(2, 6) * aleatorio(2, 5);
  } else {
    tgt = +(2 * 3.14 * aleatorio(2, 5)).toFixed(2);
  }
  $('#lrQ').innerHTML =
    m === 'perim'
      ? `Forma un rectángulo con perímetro <b>${tgt} m</b>.`
      : m === 'area'
        ? `Forma un rectángulo con área <b>${tgt} m²</b>.`
        : `Elige el radio para que la circunferencia mida <b>${formatoNumero(tgt)} cm</b> (π = 3,14).`;
  mostrar($('#lrCircle'), m === 'circle');
  mostrar($('#lrRectBox'), m !== 'circle');
  $('#sr').value = r;
  $('#sw').value = w;
  $('#sh').value = h;
  const upd = () => {
    if (m === 'circle') {
      r = +$('#sr').value;
      $('#vr').textContent = r + ' cm';
      $('#rv').innerHTML = dibujoCirculo(r);
      $('#rn').innerHTML = `Circunferencia: <b>${formatoNumero(+(2 * 3.14 * r).toFixed(2))} cm</b>`;
    } else {
      w = +$('#sw').value;
      h = +$('#sh').value;
      $('#vw').textContent = w + ' m';
      $('#vh').textContent = h + ' m';
      $('#rv').innerHTML = dibujoRectangulo(w, h, 'm', true);
      $('#rn').innerHTML = `Perímetro: <b>${2 * (w + h)} m</b> · Área: <b>${w * h} m²</b>`;
    }
  };
  $$('#labRect input').forEach((i) => (i.oninput = upd));
  upd();
  const chk = $('#lrChk');
  chk.disabled = false;
  chk.onclick = () => {
    const v = m === 'perim' ? 2 * (w + h) : m === 'area' ? w * h : +(2 * 3.14 * r).toFixed(2);
    if (Math.abs(v - tgt) < 1e-6) {
      chk.disabled = true;
      actividadCorrecta('¡Medida exacta!');
    } else actividadIncorrecta(`Ahora tienes ${formatoNumero(v)}. Ajusta las barras.`);
  };
}
function actividadOrdenar(m) {
  mostrar($('#labOrder'), true);
  const s = new Set();
  while (s.size < 4) s.add(m === 'nat' ? aleatorio(10, 999) : m === 'dec' ? aleatorio(5, 499) / 100 : aleatorio(-9, 9));
  const arr = mezclar([...s]),
    sorted = [...arr].sort((x, y) => x - y);
  let k = 0;
  const used = Array(4).fill(false),
    chips = $$('#loChips .opt'),
    f = (x) => (m === 'dec' ? formatoDecimales(x, 2) : formatoNumero(x));
  const draw = () => {
    chips.forEach((b, i) => {
      b.textContent = f(arr[i]);
      b.classList.toggle('used', used[i]);
      b.classList.remove('bad');
    });
    $('#loSeq').textContent = sorted.slice(0, k).map(f).join(' < ') || '…';
  };
  chips.forEach(
    (b, i) =>
      (b.onclick = () => {
        if (used[i]) return;
        if (arr[i] === sorted[k]) {
          used[i] = true;
          k++;
          draw();
          if (k === 4) actividadCorrecta('¡Ordenados!');
        } else {
          b.classList.add('bad');
          actividadIncorrecta('Ese no es el menor de los que quedan. Inténtalo otra vez.');
          setTimeout(() => b.classList.remove('bad'), 400);
        }
      })
  );
  draw();
}
let pintandoCuadricula = false;
function actividadPorcentajes() {
  mostrar($('#labPct'), true);
  const p = elegir([10, 20, 25, 50]);
  const on = Array(100).fill(false);
  let val = true;
  $('#lpP').textContent = p;
  const g = $('#pg'),
    cells = $$('#pg div');
  const upd = () => {
    cells.forEach((d, i) => d.classList.toggle('on', on[i]));
    const c = on.filter(Boolean).length;
    $('#pc').textContent = `Pintados: ${c} de 100 = ${c}%`;
  };
  const hit = (e) => {
    const t = document.elementFromPoint(e.clientX, e.clientY),
      i = cells.indexOf(t);
    if (i >= 0) {
      on[i] = val;
      upd();
    }
  };
  g.onpointerdown = (e) => {
    const i = cells.indexOf(document.elementFromPoint(e.clientX, e.clientY));
    if (i >= 0) {
      val = !on[i];
      pintandoCuadricula = true;
      hit(e);
    }
  };
  g.onpointermove = (e) => {
    if (pintandoCuadricula) hit(e);
  };
  const chk = $('#lpChk');
  chk.disabled = false;
  chk.onclick = () => {
    const c = on.filter(Boolean).length;
    if (c === p) {
      chk.disabled = true;
      actividadCorrecta(`¡${p}% son ${p} de 100!`);
    } else actividadIncorrecta(c > p ? 'Pintaste de más.' : 'Faltan cuadritos.');
  };
  upd();
}
function actividadParejas(_, t) {
  mostrar($('#labPairs'), true);
  const qs = [],
    seen = new Set();
  let n = 0;
  while (qs.length < 3 && n++ < 60) {
    const q = GENERADORES[t.id](n % 2 ? 1 : 2);
    if (!seen.has(q.a) && q.q.length < 110) {
      seen.add(q.a);
      qs.push(q);
    }
  }
  const right = mezclar(qs.map((q) => q.a));
  let selL = null;
  const done = new Set(),
    L = $$('#lpL .opt'),
    Rr = $$('#lpR .opt');
  const draw = () => {
    L.forEach((b, i) => {
      const q = qs[i];
      mostrar(b, !!q);
      if (!q) return;
      b.innerHTML = q.q;
      b.classList.toggle('done', done.has(q.a));
      b.classList.toggle('sel', selL === i);
    });
    Rr.forEach((b, i) => {
      const a = right[i];
      mostrar(b, a !== undefined);
      if (a === undefined) return;
      b.textContent = a;
      b.classList.remove('bad');
      b.classList.toggle('done', done.has(a));
    });
  };
  L.forEach(
    (b, i) =>
      (b.onclick = () => {
        selL = i;
        draw();
      })
  );
  Rr.forEach(
    (b, i) =>
      (b.onclick = () => {
        if (selL === null) return actividadIncorrecta('Primero toca una pregunta.');
        const a = right[i];
        if (qs[selL].a === a) {
          done.add(a);
          selL = null;
          draw();
          if (done.size === qs.length) actividadCorrecta('¡Todas las parejas!');
        } else {
          b.classList.add('bad');
          actividadIncorrecta('Esa no es la pareja. Sigue intentando.');
        }
      })
  );
  draw();
}
