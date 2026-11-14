function iniciar() {
  aplicarPersonalizacion();
  $$('[data-v]').forEach(
    (b) =>
      (b.onclick = () => {
        if (b.dataset.v === 'temas') leccionActual = null;
        if (b.dataset.v === 'juegos') juegoElegido = null;
        irAVista(b.dataset.v);
      })
  );
  $('#snd').onclick = () => {
    estado.sound = !estado.sound;
    guardar();
    actualizarCabecera();
    sonido('ok');
  };
  $('#modal').onclick = (e) => {
    if (e.target.id === 'modal') cerrarModal();
  };
  $('#start').onclick = () => {
    const n = $('#inName').value.trim().replace(/\s+/g, ' ').slice(0, 20);
    if (n.length < 2) {
      aviso('✏️ Escribe tu nombre para comenzar');
      $('#inName').focus();
      return;
    }
    $('#mgName').textContent = n;
    $('#mgGrade').textContent = $('#inGrade').value;
    abrirModal('mdGrade');
  };
  $('#gNo').onclick = cerrarModal;
  $('#gYes').onclick = () => {
    estado.name = $('#inName').value.trim().replace(/\s+/g, ' ').slice(0, 20);
    estado.grade = +$('#inGrade').value;
    estado.locked = true;
    ajustesJuego.grade = estado.grade;
    gradoElegido = estado.grade;
    gradoProgreso = estado.grade;
    guardar();
    cerrarModal();
    leccionActual = null;
    revisarLogros();
    irAVista('temas');
  };
  $('#cont').onclick = () => {
    const nx = temasDelGrado(estado.grade).find((t) => !estado.topics[t.id]?.done);
    if (!nx) return;
    gradoElegido = nx.g;
    leccionActual = { id: nx.id, step: 0 };
    irAVista('temas');
  };
  $$('#gradeTabs [data-g]').forEach(
    (b) =>
      (b.onclick = () => {
        if (estado.locked) return;
        gradoElegido = +b.dataset.g;
        DIBUJAR_VISTA.temas();
      })
  );
  $('#recGo').onclick = () => abrirTema($('#recGo').dataset.rec);
  $$('#topicGrid .topic').forEach((b) => (b.onclick = () => abrirTema(b.dataset.t)));
  $('#backT').onclick = () => {
    leccionActual = null;
    DIBUJAR_VISTA.temas();
  };
  $$('#stepsNav [data-s]').forEach(
    (b) =>
      (b.onclick = () => {
        leccionActual.step = +b.dataset.s;
        if (leccionActual.step === 2) leccionActual.qs = null;
        dibujarLeccion();
      })
  );
  $('#s0Next').onclick = () => {
    leccionActual.step = 1;
    dibujarLeccion();
  };
  $$('#s1Grid .ex-btn').forEach(
    (b) =>
      (b.onclick = () => {
        const c = b.closest('.ex');
        mostrar($('.ex-r', c), true);
        mostrar(b, false);
      })
  );
  $('#s1Next').onclick = () => {
    leccionActual.step = 2;
    leccionActual.qs = null;
    dibujarLeccion();
  };
  $$('#pqOpts .opt').forEach(
    (b, i) =>
      (b.onclick = () => {
        if (!leccionActual || !leccionActual.qs || leccionActual.ans) return;
        responder(leccionActual.qs[leccionActual.i].opts[i]);
      })
  );
  const send = () => {
    const v = $('#inA').value;
    if (!v.trim() || !leccionActual || !leccionActual.qs || leccionActual.ans) return;
    responder(v);
  };
  $('#inA').onkeydown = (e) => {
    if (e.key === 'Enter') send();
  };
  conectarTeclado($('#kpPractice'), $('#inA'), send);
  $('#nq').onclick = () => {
    leccionActual.i++;
    leccionActual.ans = null;
    dibujarPractica();
  };
  $('#again').onclick = () => {
    leccionActual.qs = null;
    leccionActual.step = 2;
    dibujarLeccion();
  };
  $('#toLab').onclick = () => {
    leccionActual.step = 3;
    dibujarLeccion();
  };
  $('#toList').onclick = $('#toList2').onclick = () => {
    leccionActual = null;
    DIBUJAR_VISTA.temas();
  };
  $('#again2').onclick = () => dibujarLeccion();
  addEventListener('pointerup', () => {
    pintandoCuadricula = false;
    pintandoConstruye = false;
  });
  $$('#gGrid .gcard').forEach(
    (b) =>
      (b.onclick = () => {
        juegoElegido = b.dataset.g;
        if (estado.locked) ajustesJuego.grade = estado.grade;
        DIBUJAR_VISTA.juegos();
      })
  );
  $('#back').onclick = () => {
    detenerJuego();
    juegoElegido = null;
    DIBUJAR_VISTA.juegos();
  };
  $$('#gsGrades [data-gr]').forEach(
    (b) =>
      (b.onclick = () => {
        if (estado.locked) return;
        ajustesJuego.grade = +b.dataset.gr;
        prepararJuego();
      })
  );
  $$('#gsDiffs [data-df]').forEach(
    (b) =>
      (b.onclick = () => {
        ajustesJuego.diff = +b.dataset.df;
        prepararJuego();
      })
  );
  $('#play').onclick = iniciarJuego;
  $('#exit').onclick = () => {
    detenerJuego();
    prepararJuego();
  };
  $('#m1').onclick = () => {
    cerrarModal();
    prepararJuego();
    $('#play').click();
  };
  $('#m2').onclick = () => {
    cerrarModal();
    juegoElegido = null;
    DIBUJAR_VISTA.juegos();
  };
  conectarTeclado($('#kpReto'), $('#ra'), () => enviarReto && enviarReto());
  $$('#aOpts .opt').forEach((b, i) => (b.onclick = () => elegirAventura(i)));
  $('#cnA').onclick = siguienteAventura;
  $$('#mGrid button').forEach((b, i) => (b.onclick = () => voltearCarta(i)));
  $$('#pgTabs [data-pg]').forEach(
    (b) =>
      (b.onclick = () => {
        if (estado.locked) return;
        gradoProgreso = +b.dataset.pg;
        DIBUJAR_VISTA.progreso();
      })
  );
  $('#rst').onclick = () => abrirModal('mdReset');
  $('#no').onclick = cerrarModal;
  $('#yes').onclick = () => {
    estado = estadoInicial();
    guardar();
    actualizarCabecera();
    cerrarModal();
    gradoElegido = 4;
    gradoProgreso = null;
    ajustesJuego.grade = 4;
    leccionActual = null;
    juegoElegido = null;
    irAVista('home');
  };
  $$('#accGrid .acc-btn').forEach(
    (b) =>
      (b.onclick = () => {
        if (b.disabled) return;
        estado.acc = b.dataset.a;
        guardar();
        actualizarCabecera();
        DIBUJAR_VISTA.logros();
      })
  );
  ajustesJuego.grade = estado.grade;
  gradoElegido = estado.grade;
  registrarDia();
  actualizarCabecera();
  irAVista('home');
  revisarLogros();
}
iniciar();
