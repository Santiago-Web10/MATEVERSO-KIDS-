const algunTemaCompleto = (ids) => ids.some((i) => estado.topics[i]?.done);
const hayMedallaOro = () => Object.values(estado.games).some((g) => g.medal === 3);
const LOGROS = [
  { id: 'maestro', f: () => algunTemaCompleto(['t4_1', 't4_2', 't5_1', 't6_1']) },
  { id: 'fracc', g: [4, 5], f: () => algunTemaCompleto(['t4_3', 't5_2']) },
  { id: 'campeon', f: () => estado.xp >= 1000 },
  { id: 'geo', f: () => algunTemaCompleto(['t4_5', 't5_4', 't6_4']) },
  { id: 'prob', g: [5, 6], f: () => algunTemaCompleto(['t5_5', 't6_5']) },
  { id: 'const', f: () => estado.day.n >= 3 },
  { id: 'paso', f: () => estado.stats.correct >= 1 },
  { id: 'racha', f: () => estado.streakMax >= 5 },
  { id: 'racha10', f: () => estado.streakMax >= 10 },
  { id: 'veloz', f: () => estado.stats.retoBest >= 8 },
  { id: 'viajero', f: () => estado.stats.wins >= 1 },
  { id: 'memoria', f: () => (estado.stats.pairs || 0) >= 15 },
  { id: 'constructor', f: () => estado.stats.builds >= 3 },
  { id: 'manos', f: () => estado.stats.labs >= 3 },
  { id: 'oro', f: hayMedallaOro },
  { id: 'g4', g: [4], f: () => temasCompletados(4) === 5 },
  { id: 'g5', g: [5], f: () => temasCompletados(5) === 5 },
  { id: 'g6', g: [6], f: () => temasCompletados(6) === 5 },
  { id: 'estrella', f: () => nivelPorPuntos(estado.xp) >= 5 },
  { id: 'nova', f: () => temasDelGrado(estado.grade).every((t) => (estado.topics[t.id]?.best || 0) >= 90) },
];
const logroDisponible = (b) => !estado.locked || !b.g || b.g.includes(estado.grade);
function revisarLogros() {
  let n = 0;
  LOGROS.forEach((b) => {
    if (!estado.badges[b.id] && logroDisponible(b) && b.f()) {
      estado.badges[b.id] = new Date().toISOString().slice(0, 10);
      n++;
      const el = $(`[data-b="${b.id}"]`);
      setTimeout(() => {
        aviso(`${el.dataset.i} ¡Nuevo logro${estado.name ? ', ' + estado.name : ''}: ${el.dataset.n}!`);
        lanzarConfeti();
      }, 300 * n);
    }
  });
  if (n) guardar();
}

DIBUJAR_VISTA.logros = () => {
  const lv = nivelPorPuntos(estado.xp),
    act = LOGROS.filter(logroDisponible),
    got = act.filter((b) => estado.badges[b.id]).length;
  $('#lgTitle').textContent = estado.name ? `Logros de ${estado.name}` : 'Logros';
  $('#lgLv').textContent = lv;
  $('#lgLv2').textContent = lv + 1;
  $('#lgName').textContent = nombreNivel(lv);
  $('#lgXp').textContent = estado.xp;
  $('#lgNext').textContent = 150 - (estado.xp % 150);
  $('#lgGot').textContent = got;
  $('#lgTotal').textContent = act.length;
  $('#lgBar').style.width = ((estado.xp % 150) / 150) * 100 + '%';
  $$('.badge[data-b]').forEach((c) => {
    const bd = LOGROS.find((b) => b.id === c.dataset.b);
    mostrar(c, logroDisponible(bd));
    const on = !!estado.badges[c.dataset.b];
    c.classList.toggle('lock', !on);
    $('.ic', c).textContent = on ? c.dataset.i : '🔒';
    $('.b-state', c).textContent = on ? 'Desbloqueado ✓' : 'Pendiente';
  });
  $$('#accGrid .acc-btn').forEach((b) => {
    const k = b.dataset.a,
      req = +b.dataset.req,
      locked = lv < req;
    b.classList.toggle('lock', locked);
    b.disabled = locked;
    b.classList.toggle('on', estado.acc === k);
    $('.a-state', b).textContent = locked ? 'Nivel ' + req : estado.acc === k ? 'Puesto ✓' : 'Toca para usar';
  });
};

let gradoProgreso = null;
const irAActividad = (id) => {
  if (id === 'game') {
    juegoElegido = null;
    irAVista('juegos');
  } else if (id[0] === 'g') {
    gradoElegido = +id[1];
    leccionActual = null;
    irAVista('temas');
  } else {
    gradoElegido = temaPorId(id).g;
    leccionActual = { id, step: 0 };
    irAVista('temas');
  }
};
DIBUJAR_VISTA.progreso = () => {
  gradoProgreso = estado.locked ? estado.grade : gradoProgreso || estado.grade;
  mostrar($('#pgTabs'), !estado.locked);
  const g = gradoProgreso,
    gt = temasDelGrado(g),
    done = temasCompletados(g),
    all = estado.locked ? done : TEMAS.filter((t) => estado.topics[t.id]?.done).length,
    played = Object.values(estado.games).reduce((a, x) => a + x.plays, 0);
  const tried = (estado.locked ? gt : TEMAS)
    .filter((t) => (estado.topics[t.id]?.total || 0) >= 3)
    .map((t) => ({ t, a: Math.round((estado.topics[t.id].correct / estado.topics[t.id].total) * 100) }));
  const str = tried.filter((x) => x.a >= 80),
    weak = tried.filter((x) => x.a < 70);
  const recs = [];
  weak.forEach((x) => recs.push(['📌', `Necesitas practicar ${x.t.name.toLowerCase()}.`, x.t.id]));
  str.slice(0, 2).forEach((x) => recs.push(['🌟', `Excelente trabajo en ${x.t.name.toLowerCase()}.`, x.t.id]));
  if (done === 5 && g < 6 && !estado.locked)
    recs.push(['🚀', `Te recomendamos completar el nivel avanzado: pasa a ${g + 1}.º.`, 'g' + (g + 1)]);
  else if (done === 5) recs.push(['🎮', 'Pon a prueba tu velocidad en el Reto Matemático en dificultad difícil.', 'game']);
  if (!recs.length) {
    const n = gt.find((t) => !estado.topics[t.id]?.done);
    recs.push(['👉', n ? `Empieza con «${n.name}».` : '¡Sigue jugando para ganar medallas!', n ? n.id : 'game']);
  }
  $('#pDonut').style.setProperty('--p', done * 20);
  $('#pDonutN').textContent = done * 20;
  $('#pName').textContent = nombreAlumno();
  $('#pGrade').textContent = g;
  $('#pStreak').textContent = estado.day.n;
  $('#pStreakT').textContent = estado.day.n === 1 ? 'día' : 'días';
  marcarPresionado('#pgTabs [data-pg]', 'pg', g);
  $('#pDone').textContent = done + ' de 5';
  $('#pDoneG').textContent = g;
  $('#pXp').textContent = estado.xp;
  $('#pAcc').textContent = precisionGeneral() + '%';
  $('#pAll').textContent = all + (estado.locked ? ' de 5' : ' de 15');
  $('#pAllT').textContent = estado.locked ? 'temas de tu curso' : 'temas en total';
  $('#pPlayed').textContent = played;
  $('#pBadges').textContent = Object.keys(estado.badges).length;
  $$('#pRows .prow').forEach((r, i) => {
    const t = gt[i],
      s = estado.topics[t.id] || {};
    r.className = 'prow c-' + t.c;
    $('.p-name', r).textContent = `${t.ic} ${t.name}`;
    $('.p-best', r).textContent = (s.best || 0) + '%';
    $('.p-bar', r).style.width = (s.best || 0) + '%';
    $('.p-info', r).textContent = s.total
      ? `Precisión total: ${Math.round((s.correct / s.total) * 100)}% · ${s.attempts} intento(s)`
      : 'Sin practicar';
  });
  $$('#pRecs .rec').forEach((el, i) => {
    const r = recs[i];
    mostrar(el, !!r);
    if (!r) return;
    $('.ic', el).textContent = r[0];
    $('.grow', el).textContent = r[1];
    $('button', el).onclick = () => irAActividad(r[2]);
  });
  $('#pStr').textContent = str.length
    ? str.map((x) => `${x.t.name} (${x.a}%)`).join(' · ')
    : 'Practica al menos 3 preguntas por tema para descubrirlas.';
  $('#pWeak').textContent = weak.length
    ? weak.map((x) => `${x.t.name} (${x.a}%)`).join(' · ')
    : 'Todavía no hay áreas por reforzar.';
  const mx = Math.max(100, ...Object.values(estado.games).map((y) => y.best));
  $$('#pGames .grow-row').forEach((r) => {
    const x = estado.games[r.dataset.gp];
    $('.gp-best', r).textContent = x ? x.best : 0;
    $('.gp-medal', r).textContent = ['', '🥉', '🥈', '🥇'][x ? x.medal : 0];
    $('.gp-bar', r).style.width = (x ? (x.best / mx) * 100 : 0) + '%';
  });
  const log = Object.entries(estado.games)
    .flatMap(([id, x]) => x.log.map((l) => ({ id, ...l })))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 8);
  mostrar($('#pLogWrap'), log.length > 0);
  mostrar($('#pLogEmpty'), !log.length);
  $$('#pLog tr:not(:first-child)').forEach((tr, i) => {
    const l = log[i];
    mostrar(tr, !!l);
    if (!l) return;
    const td = tr.children;
    td[0].textContent = JUEGOS.find((j) => j.id === l.id).n;
    td[1].textContent = l.score;
    td[2].textContent = l.secs + 's';
    td[3].textContent = ['—', '🥉', '🥈', '🥇'][l.medal];
  });
};

let juegoActual = null,
  juegoElegido = null,
  ajustesJuego = { grade: 4, diff: 1 };
function detenerJuego() {
  if (juegoActual && juegoActual.timer) clearInterval(juegoActual.timer);
  juegoActual = null;
}
const JUEGOS = [
  {
    id: 'reto',
    n: 'Reto Matemático',
    ic: '⏱️',
    d: 'Cada acierto acerca tu cohete al planeta. Tienes hasta 2 minutos y puedes ir con calma.',
    diff: true,
  },
  {
    id: 'aventura',
    n: 'Aventura Numérica',
    ic: '🚀',
    d: 'Haz avanzar a Nova por 12 planetas resolviendo desafíos. Tienes 5 vidas.',
  },
  {
    id: 'memoria',
    n: 'Memoria Estelar',
    ic: '🃏',
    d: 'Voltea las cartas y une cada operación con su resultado. ¡Encuentra las 6 parejas con pocos intentos!',
  },
  {
    id: 'construye',
    n: 'Constructor Espacial',
    ic: '🛰️',
    d: 'Arma los módulos de tu estación espacial usando perímetro y área. Tienes 5 minutos.',
  },
];
const MEDALLAS = ['😊', '🥉', '🥈', '🥇'],
  TEXTO_MEDALLAS = ['¡Sigue practicando!', 'Medalla de bronce', 'Medalla de plata', 'Medalla de oro'];
const PANELES_JUEGO = ['gCount', 'gReto', 'gAv', 'gMem', 'gCon'];
const mostrarPanel = (id) => PANELES_JUEGO.forEach((p) => mostrar($('#' + p), p === id));
DIBUJAR_VISTA.juegos = () => {
  if (juegoElegido) return prepararJuego();
  mostrar($('#gList'), true);
  mostrar($('#gSetup'), false);
  mostrar($('#gStage'), false);
  $$('#gGrid .gcard').forEach((c) => {
    const x = estado.games[c.dataset.g];
    $('.g-best', c).textContent = x ? x.best : 0;
    $('.g-plays', c).textContent = x ? x.plays : 0;
    $('.g-medal', c).textContent = MEDALLAS[x ? x.medal : 0];
  });
};
function prepararJuego() {
  const g = JUEGOS.find((x) => x.id === juegoElegido);
  mostrar($('#gList'), false);
  mostrar($('#gSetup'), true);
  mostrar($('#gStage'), false);
  mostrar($('#back'), true);
  mostrar($('#gsetup'), true);
  $('#gsIc').textContent = g.ic;
  $('#gsName').textContent = g.n;
  $('#gsDesc').textContent = g.d;
  if (estado.locked) ajustesJuego.grade = estado.grade;
  mostrar($('#gsGradeH'), !estado.locked);
  mostrar($('#gsGrades'), !estado.locked);
  mostrar($('#gsFixed'), estado.locked);
  $('#gsFixed').textContent = `Preguntas y retos de tu curso: ${etiquetaGrado()}`;
  marcarPresionado('#gsGrades [data-gr]', 'gr', ajustesJuego.grade);
  mostrar($('#gsDiffBox'), !!g.diff);
  marcarPresionado('#gsDiffs [data-df]', 'df', ajustesJuego.diff);
}
function iniciarJuego() {
  detenerJuego();
  mostrar($('#gSetup'), false);
  mostrar($('#gStage'), true);
  scrollTo({ top: 0 });
  const run = {
    reto: jugarReto,
    aventura: jugarAventura,
    memoria: jugarMemoria,
    construye: jugarConstruye,
  }[juegoElegido];
  if (['reto', 'construye'].includes(juegoElegido)) cuentaRegresiva(run);
  else run();
}
function cuentaRegresiva(cb) {
  let n = 3;
  juegoActual = { timer: null };
  mostrarPanel('gCount');
  const draw = () => {
    const el = $('#gCountN');
    el.textContent = n || '¡Ya!';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    sonido('tick');
  };
  draw();
  juegoActual.timer = setInterval(() => {
    n--;
    if (n < 0) {
      clearInterval(juegoActual.timer);
      juegoActual = null;
      cb();
    } else draw();
  }, 800);
}
function terminarJuego(id, score, medal, secs, extra = '') {
  const x = estado.games[id] || (estado.games[id] = { plays: 0, best: 0, medal: 0, log: [] });
  x.plays++;
  x.best = Math.max(x.best, score);
  x.medal = Math.max(x.medal, medal);
  x.log.unshift({ score, medal, secs, ts: Date.now() });
  x.log = x.log.slice(0, 8);
  guardar();
  detenerJuego();
  sumarPuntos(Math.round(score / 4));
  if (medal >= 2) lanzarConfeti();
  $('#mdMedal').textContent = MEDALLAS[medal];
  $('#mdTitle').textContent = conNombre(TEXTO_MEDALLAS[medal]);
  $('#mdScore').textContent = score;
  $('#mdSecs').textContent = secs;
  $('#mdExtra').textContent = extra;
  $('#mdXp').textContent = Math.round(score / 4);
  abrirModal('mdFinish');
}

let enviarReto = null;
function jugarReto() {
  mostrarPanel('gReto');
  const pool = {
      4: ['t4_1', 't4_2', 't4_4', 't4_5'],
      5: ['t5_1', 't5_3', 't5_4', 't5_5'],
      6: ['t6_1', 't6_2', 't6_3', 't6_5'],
    }[ajustesJuego.grade],
    d = ajustesJuego.diff;
  juegoActual = {
    t: [120, 100, 90][d - 1],
    T: [120, 100, 90][d - 1],
    score: 0,
    ok: 0,
    streak: 0,
    lock: false,
  };
  const me = juegoActual,
    i = $('#ra');
  const upd = () => {
    $('#rScore').textContent = me.score;
    $('#rOk').textContent = me.ok;
    $('#rCombo').textContent = me.streak;
    $('#rComboChip').classList.toggle('combo', me.streak >= 3);
    $('#rTm').textContent = '⏱ ' + me.t + 's';
    $('#rBar').style.width = (me.t / me.T) * 100 + '%';
    $('#rRocket').style.setProperty('--p', Math.min(me.ok / 12, 1));
  };
  const nextQ = () => {
    let q,
      n = 0;
    do {
      q = GENERADORES[elegir(pool)](d);
      n++;
    } while ((q.num === undefined || q.q.length > 85) && n < 40);
    me.q = q;
    $('#rQ').innerHTML = q.q;
    i.value = '';
    $('#rf').textContent = '';
    upd();
    i.focus();
  };
  enviarReto = () => {
    if (me.lock || !i.value.trim()) return;
    const ok = Math.abs(numeroDeCampo(i) - me.q.num) < 1e-9;
    sonido(ok ? 'ok' : 'bad');
    if (ok) {
      me.ok++;
      me.streak++;
      const pt = 10 * d + Math.min(me.streak, 5) * 2;
      me.score += pt;
      textoFlotante($('#rQ'), '+' + pt + (me.streak >= 3 ? ' 🔥' : ''), COLORES.mint);
      nextQ();
    } else {
      me.streak = 0;
      me.lock = true;
      destello($('#gReto'), false);
      $('#rf').innerHTML = `❌ Era <b>${escaparHtml(me.q.a)}</b>`;
      upd();
      setTimeout(() => {
        if (juegoActual === me) {
          me.lock = false;
          nextQ();
        }
      }, 1800);
    }
  };
  i.onkeydown = (e) => {
    if (e.key === 'Enter') enviarReto();
  };
  nextQ();
  me.timer = setInterval(() => {
    me.t--;
    upd();
    if (me.t <= 5 && me.t > 0) sonido('tick');
    if (me.t <= 0) {
      const th = [
          [3, 6, 9],
          [3, 5, 8],
          [2, 4, 6],
        ][d - 1],
        m = me.ok >= th[2] ? 3 : me.ok >= th[1] ? 2 : me.ok >= th[0] ? 1 : 0,
        sc = me.score,
        ok = me.ok;
      estado.stats.retoBest = Math.max(estado.stats.retoBest, ok);
      terminarJuego('reto', sc, m, me.T, `Resolviste ${ok} operaciones.`);
    }
  }, 1000);
}

function jugarAventura() {
  mostrarPanel('gAv');
  const gt = temasDelGrado(ajustesJuego.grade);
  juegoActual = { mode: 'av', pos: 0, lives: 5, t0: Date.now(), ans: null };
  const mk = () => {
    let q,
      n = 0;
    const L = juegoActual.pos < 8 ? 1 : juegoActual.pos < 11 ? 2 : 3;
    do {
      q = GENERADORES[elegir(gt).id](L);
      n++;
    } while (q.opts.length < 3 && n < 20);
    juegoActual.q = q;
    juegoActual.ans = null;
    draw();
  };
  const draw = () => {
    const q = juegoActual.q,
      A = juegoActual.ans;
    $('#aPos').textContent = Math.min(juegoActual.pos + 1, 12);
    $('#aLives').textContent = '❤️'.repeat(juegoActual.lives) || '💔';
    $$('#aTrack .cell').forEach((c, i) => {
      c.classList.toggle('me', i === juegoActual.pos);
      c.classList.toggle('done', i < juegoActual.pos);
      c.textContent = i === juegoActual.pos ? '🚀' : c.dataset.e;
    });
    $('#aQ').innerHTML = q.q;
    const v = $('#aVis');
    v.innerHTML = q.vis || '';
    mostrar(v, !!q.vis);
    $$('#aOpts .opt').forEach((b, i) => {
      const o = q.opts[i];
      mostrar(b, o !== undefined);
      if (o === undefined) return;
      b.textContent = o;
      b.disabled = !!A;
      b.classList.remove('ok', 'bad');
      if (A) {
        if (o === q.a) b.classList.add('ok');
        else if (o === A) b.classList.add('bad');
      }
    });
    const fb = $('#aFb');
    mostrar(fb, !!A);
    if (A) {
      const r = A === q.a;
      fb.classList.toggle('ok', r);
      fb.classList.toggle('bad', !r);
      $('#aFbHead').innerHTML = r ? '✅ ¡Avanzas!' : '❌ Pierdes una vida. Era <b>' + escaparHtml(q.a) + '</b>.';
      $('#aFbExp').innerHTML = q.exp;
    }
    mostrar($('#aNextRow'), !!A);
    const tr = $('#aTrack'),
      me = $('.cell.me', tr);
    if (me) tr.scrollLeft += me.getBoundingClientRect().left - tr.getBoundingClientRect().left - tr.clientWidth / 2;
    if (A) $('#cnA').focus();
  };
  juegoActual.mk = mk;
  juegoActual.draw = draw;
  mk();
}
function elegirAventura(i) {
  if (!juegoActual || juegoActual.mode !== 'av' || juegoActual.ans) return;
  const q = juegoActual.q,
    o = q.opts[i];
  juegoActual.ans = o;
  sonido(o === q.a ? 'ok' : 'bad');
  if (o === q.a) {
    juegoActual.pos++;
    juegoActual.draw();
    textoFlotante($('#aTrack .cell.me'), '🚀 ¡Avanzas!', COLORES.mint);
    destello($('#gAv'), true);
  } else {
    juegoActual.lives--;
    juegoActual.draw();
    textoFlotante($('#aTrack'), '💔 −1 vida', COLORES.coral);
    destello($('#gAv'), false);
  }
}
function siguienteAventura() {
  if (!juegoActual || juegoActual.mode !== 'av') return;
  const secs = Math.round((Date.now() - juegoActual.t0) / 1000);
  if (juegoActual.pos >= 12) {
    estado.stats.wins++;
    terminarJuego(
      'aventura',
      120 + juegoActual.lives * 20 + Math.max(0, 180 - secs),
      juegoActual.lives >= 4 ? 3 : juegoActual.lives >= 3 ? 2 : 1,
      secs,
      '¡Llegaste a la base!'
    );
  } else if (juegoActual.lives <= 0)
    terminarJuego('aventura', juegoActual.pos * 10, 0, secs, `Llegaste al planeta ${juegoActual.pos}.`);
  else juegoActual.mk();
}

const PARES_MEMORIA = {
  4: () => {
    const x = aleatorio(3, 9),
      y = aleatorio(3, 9),
      z = aleatorio(11, 40),
      w = aleatorio(2, 9);
    return [
      [`${x} × ${y}`, x * y],
      [`${x * w} ÷ ${w}`, x],
      [`${z * 10} − ${z * 4}`, z * 6],
      [`${z} + ${z + 10}`, z * 2 + 10],
      [`${w} × 100`, w * 100],
      [`${y * 5} ÷ 5`, y],
    ];
  },
  5: () =>
    mezclar([
      ['1/2', '0,5'],
      ['1/4', '0,25'],
      ['3/4', '0,75'],
      ['1/5', '0,2'],
      ['2/5', '0,4'],
      ['1/10', '0,1'],
      ['4/5', '0,8'],
      ['3/10', '0,3'],
    ]).slice(0, 6),
  6: () => {
    const b = elegir([40, 60, 80, 120, 200]),
      k = aleatorio(2, 5);
    return [
      [`25% de ${b}`, b / 4],
      [`50% de ${b}`, b / 2],
      [`${k}²`, k * k],
      [`${k}³`, k ** 3],
      [`√${(k + 4) ** 2}`, k + 4],
      [`20% de ${b}`, b / 5],
    ];
  },
};
function crearParesMemoria(g) {
  for (let t = 0; t < 40; t++) {
    const P = PARES_MEMORIA[g]()
      .slice(0, 6)
      .map(([q, r]) => [q, String(r)]);
    if (P.length === 6 && new Set(P.map((p) => p[0])).size === 6 && new Set(P.map((p) => p[1])).size === 6) return P;
  }
  return PARES_MEMORIA[4]();
}
function jugarMemoria() {
  mostrarPanel('gMem');
  const P = crearParesMemoria(ajustesJuego.grade);
  juegoActual = {
    mode: 'mem',
    t0: Date.now(),
    moves: 0,
    found: 0,
    open: [],
    busy: false,
    timer: null,
    cards: mezclar(
      P.flatMap(([q, r], k) => [
        { k, t: q },
        { k, t: r },
      ])
    ),
  };
  $('#mvN').textContent = 0;
  $('#mvP').textContent = 0;
  $('#mvMsg').textContent = 'Toca una carta para voltearla.';
  $$('#mGrid button').forEach((b, i) => {
    b.className = '';
    b.disabled = false;
    b.textContent = '';
    b.setAttribute('aria-label', 'Carta ' + (i + 1));
  });
}
function voltearCarta(i) {
  const g = juegoActual;
  if (!g || g.mode !== 'mem' || g.busy || g.open.includes(i)) return;
  const btn = $$('#mGrid button')[i];
  if (btn.classList.contains('hit')) return;
  sonido('tick');
  btn.classList.add('up');
  btn.textContent = g.cards[i].t;
  g.open.push(i);
  if (g.open.length < 2) return;
  g.moves++;
  $('#mvN').textContent = g.moves;
  const [a, b] = g.open,
    A = $$('#mGrid button')[a],
    B = $$('#mGrid button')[b];
  if (g.cards[a].k === g.cards[b].k) {
    g.open = [];
    g.found++;
    estado.stats.pairs = (estado.stats.pairs || 0) + 1;
    [A, B].forEach((e) => {
      e.className = 'hit';
      e.disabled = true;
    });
    $('#mvP').textContent = g.found;
    $('#mvMsg').textContent = `✅ ¡Pareja! ${g.cards[a].t} y ${g.cards[b].t} van juntos.`;
    sonido('ok');
    guardar();
    revisarLogros();
    if (g.found === 6) {
      g.busy = true;
      const sc = Math.max(10, 100 - Math.max(0, g.moves - 6) * 6),
        m = sc >= 80 ? 3 : sc >= 60 ? 2 : sc >= 35 ? 1 : 0;
      g.timer = setTimeout(
        () => terminarJuego('memoria', sc, m, Math.round((Date.now() - g.t0) / 1000), `Lo lograste en ${g.moves} intentos.`),
        900
      );
    }
  } else {
    g.busy = true;
    sonido('bad');
    A.classList.add('bad');
    B.classList.add('bad');
    $('#mvMsg').textContent = 'Casi… ¡memoriza dónde está cada una!';
    g.timer = setTimeout(() => {
      [A, B].forEach((e) => {
        e.className = '';
        e.textContent = '';
      });
      g.open = [];
      g.busy = false;
    }, 1000);
  }
}

let pintandoConstruye = false;
function jugarConstruye() {
  mostrarPanel('gCon');
  const W = 12,
    H = 8,
    g = ajustesJuego.grade;
  const task = () => {
    if (g === 4) {
      const w = aleatorio(2, 4),
        h = aleatorio(2, 4);
      return {
        k: 'perim',
        P: 2 * (w + h),
        hint: `Prueba con ${w} de largo y ${h} de ancho.`,
        t: `Construye un <b>módulo rectangular</b> de perímetro <b>${2 * (w + h)} m</b>.`,
      };
    }
    if (g === 5) {
      const w = aleatorio(2, 6),
        h = aleatorio(2, 4);
      return {
        k: 'rect',
        A: w * h,
        P: 2 * (w + h),
        hint: `Piensa en ${w} × ${h}.`,
        t: `Construye un <b>módulo rectangular</b> de área <b>${w * h} m²</b> y perímetro <b>${2 * (w + h)} m</b>.`,
      };
    }
    const A = elegir([9, 12, 16]),
      P = 2 * Math.ceil(2 * Math.sqrt(A));
    return {
      k: 'min',
      A,
      P,
      hint: `Cuanto más parecida a un cuadrado, menor perímetro. Mínimo posible: ${P} m.`,
      t: `Construye un <b>módulo</b> de área <b>${A} m²</b> con el <b>menor perímetro posible</b>.`,
    };
  };
  juegoActual = {
    mode: 'con',
    r: 0,
    solved: 0,
    hints: 0,
    t: 300,
    t0: Date.now(),
    on: new Set(),
    tk: task(),
  };
  const me = juegoActual,
    cells = $$('#bg div');
  const calc = () => {
    const on = me.on;
    let per = 0;
    on.forEach((i) => {
      const r = Math.floor(i / W),
        c = i % W;
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ].forEach(([y, x]) => {
        if (y < 0 || y >= H || x < 0 || x >= W || !on.has(y * W + x)) per++;
      });
    });
    let conn = on.size > 0;
    if (conn) {
      const st = [[...on][0]],
        seen = new Set(st);
      while (st.length) {
        const i = st.pop(),
          r = Math.floor(i / W),
          c = i % W;
        [
          [r - 1, c],
          [r + 1, c],
          [r, c - 1],
          [r, c + 1],
        ].forEach(([y, x]) => {
          const j = y * W + x;
          if (y >= 0 && y < H && x >= 0 && x < W && on.has(j) && !seen.has(j)) {
            seen.add(j);
            st.push(j);
          }
        });
      }
      conn = seen.size === on.size;
    }
    let rect = false;
    if (on.size) {
      const rs = [...on].map((i) => Math.floor(i / W)),
        cs = [...on].map((i) => i % W);
      rect = (Math.max(...rs) - Math.min(...rs) + 1) * (Math.max(...cs) - Math.min(...cs) + 1) === on.size;
    }
    return { area: on.size, per, conn, rect };
  };
  const live = () => {
    const c = calc();
    $('#bl').innerHTML = `Área: <b>${c.area} m²</b> · Perímetro: <b>${c.per} m</b>`;
    cells.forEach((d, i) => d.classList.toggle('on', me.on.has(i)));
  };
  const draw = () => {
    $('#cTm').textContent = '⏱ ' + me.t + 's';
    $('#cR').textContent = me.r + 1;
    $('#cOk').textContent = me.solved;
    $('#cQ').innerHTML = me.tk.t;
    $('#bf').textContent = '';
    live();
  };
  const end = () => {
    const sc = Math.max(0, me.solved * 20 - me.hints * 5 + (me.solved ? Math.floor(me.t / 10) : 0)),
      m = me.solved >= 4 ? 3 : me.solved >= 3 ? 2 : me.solved >= 2 ? 1 : 0;
    terminarJuego('construye', sc, m, 300 - me.t, `Instalaste ${me.solved} de 5 módulos.`);
  };
  const adv = (ok) => {
    if (juegoActual !== me) return;
    if (ok) {
      me.solved++;
      aviso('🛰️ ¡Módulo instalado!');
      lanzarConfeti();
    }
    me.r++;
    if (me.r >= 5) return end();
    me.on = new Set();
    me.tk = task();
    draw();
  };
  const gr = $('#bg');
  let val = true;
  pintandoConstruye = false;
  const hit = (e) => {
    const i = cells.indexOf(document.elementFromPoint(e.clientX, e.clientY));
    if (i >= 0) {
      val ? me.on.add(i) : me.on.delete(i);
      live();
    }
  };
  gr.onpointerdown = (e) => {
    const i = cells.indexOf(document.elementFromPoint(e.clientX, e.clientY));
    if (i >= 0) {
      val = !me.on.has(i);
      pintandoConstruye = true;
      hit(e);
    }
  };
  gr.onpointermove = (e) => {
    if (pintandoConstruye) hit(e);
  };
  gr.onpointerup = gr.onpointerleave = () => {
    pintandoConstruye = false;
  };
  $('#bc').onclick = () => {
    me.on.clear();
    live();
  };
  $('#bh').onclick = () => {
    me.hints++;
    $('#bf').textContent = '💡 ' + me.tk.hint;
  };
  $('#bs').onclick = () => adv(false);
  $('#bk').onclick = () => {
    const c = calc(),
      T = me.tk;
    let ok = false,
      msg = '';
    if (!c.conn) msg = 'El módulo debe estar todo unido.';
    else if (T.k === 'perim') {
      ok = c.rect && c.per === T.P;
      msg = !c.rect ? 'Debe ser un rectángulo.' : `Tu perímetro es ${c.per} m y debe ser ${T.P} m.`;
    } else if (T.k === 'rect') {
      ok = c.rect && c.area === T.A && c.per === T.P;
      msg = !c.rect ? 'Debe ser un rectángulo.' : `Tienes área ${c.area} y perímetro ${c.per}. Revisa las medidas.`;
    } else {
      ok = c.area === T.A && c.per === T.P;
      msg =
        c.area !== T.A ? `Tu área es ${c.area} m² y debe ser ${T.A} m².` : `Tu perímetro es ${c.per} m. Se puede con ${T.P} m.`;
    }
    if (ok) {
      estado.stats.builds++;
      guardar();
      adv(true);
    } else {
      sonido('bad');
      $('#bf').textContent = '❌ ' + msg;
    }
  };
  draw();
  me.timer = setInterval(() => {
    me.t--;
    $('#cTm').textContent = '⏱ ' + me.t + 's';
    if (me.t <= 0) end();
  }, 1000);
}
