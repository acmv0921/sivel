/* SIVIL · Guía interactiva (módulo común a todas las aplicaciones)
 * Uso: GuiaSIVIL.init({ app:'gerencia', guias:[...], usuario:{rol:'gerencia'} })
 * Cada guía: {id, icono, titulo, resumen, roles?:[...], pasos:[{titulo, texto, ir?:'screenId', abrir?:'nombreFuncion', boton?:'texto', verificar?:'#selector'}]}
 * El avance se guarda en el navegador (localStorage); no toca servidor ni hojas. */
(function () {
  var G = { cfg: null, estado: null, guia: null, paso: 0, min: false };
  var LS = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };
  var clave = function (id) { return 'sivil_guia_' + G.cfg.app + '_' + id; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var $ = function (id) { return document.getElementById(id); };

  var CSS = '' +
    '.gz-btn{background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.45);border-radius:20px;padding:.28rem .7rem;font-size:.72rem;font-weight:700;cursor:pointer;margin-right:.5rem;white-space:nowrap;}' +
    '.gz-fab{position:fixed;right:14px;bottom:96px;z-index:640;background:#e05c1a;color:#fff;border:0;border-radius:24px;padding:.55rem .9rem;font-weight:800;font-size:.78rem;box-shadow:0 3px 12px rgba(0,0,0,.3);cursor:pointer;}' +
    '.gz-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:700;align-items:center;justify-content:center;padding:1rem;}' +
    '.gz-ov.show{display:flex;}' +
    '.gz-box{background:#fff;border-radius:16px;max-width:520px;width:100%;max-height:88vh;overflow:auto;padding:1.1rem;position:relative;color:#1e2b3a;font-family:inherit;}' +
    '.gz-x{position:absolute;right:.7rem;top:.5rem;border:0;background:none;font-size:1.2rem;cursor:pointer;color:#666;}' +
    '.gz-h{font-weight:800;font-size:1rem;color:#1a3a5c;margin-bottom:.2rem;}' +
    '.gz-sub{font-size:.74rem;color:#666;margin-bottom:.8rem;line-height:1.4;}' +
    '.gz-item{display:flex;gap:.7rem;align-items:center;border:1px solid #e2e8f0;border-radius:12px;padding:.7rem;margin-bottom:.5rem;cursor:pointer;background:#fafbfc;}' +
    '.gz-item:active{background:#eef3f8;}' +
    '.gz-ic{font-size:1.5rem;}' +
    '.gz-it{font-weight:700;font-size:.85rem;}' +
    '.gz-is{font-size:.7rem;color:#666;margin-top:.1rem;line-height:1.35;}' +
    '.gz-tag{margin-left:auto;font-size:.65rem;font-weight:800;padding:.15rem .5rem;border-radius:10px;background:#e2e8f0;color:#334;white-space:nowrap;}' +
    '.gz-tag.on{background:#fde7d9;color:#b24a12;} .gz-tag.ok{background:#d6f0e0;color:#15603b;}' +
    '.gz-dock{position:fixed;left:8px;right:8px;top:62px;z-index:720;background:#fff;border:2px solid #e05c1a;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.35);padding:.7rem .8rem;max-width:560px;margin:0 auto;font-family:inherit;color:#1e2b3a;display:none;}' +
    '.gz-dock.show{display:block;}' +
    '.gz-bar{height:5px;background:#e8ecf1;border-radius:4px;overflow:hidden;margin:.15rem 0 .5rem;} .gz-bar i{display:block;height:100%;background:#e05c1a;transition:width .25s;}' +
    '.gz-top{display:flex;align-items:center;gap:.4rem;font-size:.66rem;color:#888;font-weight:700;}' +
    '.gz-top span{flex:1;}' +
    '.gz-ic2{border:0;background:#eef1f5;border-radius:8px;padding:.15rem .45rem;font-size:.75rem;cursor:pointer;}' +
    '.gz-st{font-weight:800;font-size:.88rem;color:#1a3a5c;margin-bottom:.2rem;}' +
    '.gz-tx{font-size:.78rem;line-height:1.45;max-height:34vh;overflow:auto;}' +
    '.gz-tx ul{margin:.3rem 0 0 1.1rem;} .gz-tx li{margin-bottom:.15rem;}' +
    '.gz-row{display:flex;gap:.4rem;margin-top:.6rem;flex-wrap:wrap;}' +
    '.gz-b{border:0;border-radius:9px;padding:.45rem .75rem;font-weight:700;font-size:.76rem;cursor:pointer;background:#eef1f5;color:#1e2b3a;}' +
    '.gz-b.p{background:#e05c1a;color:#fff;} .gz-b.g{background:#1a7a4a;color:#fff;} .gz-b:disabled{opacity:.4;}' +
    '.gz-pill{position:fixed;left:50%;transform:translateX(-50%);top:62px;z-index:720;background:#e05c1a;color:#fff;border:0;border-radius:20px;padding:.4rem .9rem;font-weight:800;font-size:.76rem;box-shadow:0 3px 12px rgba(0,0,0,.35);cursor:pointer;display:none;}' +
    '.gz-pill.show{display:block;}' +
    '.gz-pulse{outline:3px solid #e05c1a !important;outline-offset:2px;animation:gzp 1s ease-in-out infinite;}' +
    '@keyframes gzp{50%{outline-color:rgba(224,92,26,.25);}}';

  function montar() {
    if ($('gzOv')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var d = document.createElement('div');
    d.innerHTML =
      '<div class="gz-ov" id="gzOv"><div class="gz-box"><button class="gz-x" onclick="GuiaSIVIL.cerrarMenu()">✕</button><div id="gzMenu"></div></div></div>' +
      '<div class="gz-dock" id="gzDock"></div><button class="gz-pill" id="gzPill" onclick="GuiaSIVIL.expandir()"></button>';
    while (d.firstChild) document.body.appendChild(d.firstChild);
    var boton = document.createElement('button');
    boton.className = 'gz-btn'; boton.id = 'gzBtn'; boton.textContent = '📖 Guía'; boton.onclick = function () { GuiaSIVIL.abrirMenu(); };
    var chip = document.querySelector('.user-chip, .btn-salir, #btnSalir');
    var hdr = document.querySelector('.header');
    if (chip && chip.parentNode) { var w = chip.parentNode; if (w === hdr) { var box = document.createElement('div'); box.style.cssText = 'display:flex;align-items:center;'; hdr.insertBefore(box, chip); box.appendChild(boton); box.appendChild(chip); } else w.insertBefore(boton, chip); }
    else { boton.className = 'gz-fab'; document.body.appendChild(boton); }
  }

  function visibles() {
    var rol = G.cfg.usuario && typeof G.cfg.usuario === 'function' ? (G.cfg.usuario() || {}).rol : (G.cfg.usuario || {}).rol;
    return G.cfg.guias.filter(function (g) { return !g.roles || !rol || g.roles.indexOf(rol) >= 0; });
  }
  function est(id) { return LS(clave(id)) || { paso: 0, fin: false }; }

  function menu() {
    var h = '<div class="gz-h">📖 Guías paso a paso</div><div class="gz-sub">Elija un proceso. Puede cerrar la guía en cualquier momento: queda guardada donde la dejó y la retoma cuando quiera.</div>';
    visibles().forEach(function (g) {
      var e = est(g.id), n = g.pasos.length;
      var tag = e.fin ? '<span class="gz-tag ok">✓ Completada</span>' : e.paso > 0 ? '<span class="gz-tag on">Paso ' + (e.paso + 1) + ' de ' + n + ' · Continuar</span>' : '<span class="gz-tag">' + n + ' pasos</span>';
      h += '<div class="gz-item" onclick="GuiaSIVIL.abrir(\'' + g.id + '\')"><div class="gz-ic">' + esc(g.icono || '📘') + '</div><div><div class="gz-it">' + esc(g.titulo) + '</div><div class="gz-is">' + esc(g.resumen || '') + '</div></div>' + tag + '</div>';
    });
    if (!visibles().length) h += '<div class="gz-sub">No hay guías disponibles para su rol.</div>';
    $('gzMenu').innerHTML = h;
  }

  function dibujar() {
    var g = G.guia, n = g.pasos.length, p = g.pasos[G.paso];
    quitarResalte();
    var dock = $('gzDock');
    var last = G.paso === n - 1;
    dock.innerHTML =
      '<div class="gz-top"><span>' + esc(g.icono || '') + ' ' + esc(g.titulo) + ' · Paso ' + (G.paso + 1) + ' de ' + n + '</span>' +
      '<button class="gz-ic2" title="Ocultar para trabajar" onclick="GuiaSIVIL.minimizar()">▾ Ocultar</button>' +
      '<button class="gz-ic2" title="Cerrar y guardar para después" onclick="GuiaSIVIL.guardarSalir()">✕</button></div>' +
      '<div class="gz-bar"><i style="width:' + Math.round((G.paso + 1) / n * 100) + '%"></i></div>' +
      '<div class="gz-st">' + esc(p.titulo) + '</div><div class="gz-tx">' + p.texto + '</div>' +
      '<div class="gz-row">' +
      (p.ir || p.abrir ? '<button class="gz-b g" onclick="GuiaSIVIL.ir()">👉 ' + esc(p.boton || 'Ir allí') + '</button>' : '') +
      '<button class="gz-b" onclick="GuiaSIVIL.mover(-1)"' + (G.paso === 0 ? ' disabled' : '') + '>◀ Anterior</button>' +
      '<button class="gz-b p" onclick="GuiaSIVIL.mover(1)">' + (last ? '✓ Finalizar' : 'Siguiente ▶') + '</button>' +
      '</div>' +
      '<div class="gz-row" style="margin-top:.35rem;"><button class="gz-b" style="font-size:.68rem;" onclick="GuiaSIVIL.guardarSalir()">💾 Guardar para después</button>' +
      '<button class="gz-b" style="font-size:.68rem;" onclick="GuiaSIVIL.reiniciar()">↺ Reiniciar</button>' +
      '<button class="gz-b" style="font-size:.68rem;" onclick="GuiaSIVIL.abrirMenu()">☰ Otras guías</button></div>';
    guardar(false);
    resaltar(p);
  }
  function guardar(fin) { LS(clave(G.guia.id), { paso: G.paso, fin: !!fin || (est(G.guia.id).fin && false) }); }
  function resaltar(p) { if (!p.resaltar) return; try { var el = document.querySelector(p.resaltar); if (el && el.offsetParent !== null) { el.classList.add('gz-pulse'); el.scrollIntoView({ block: 'center', behavior: 'auto' }); } } catch (e) {} }
  function quitarResalte() { document.querySelectorAll('.gz-pulse').forEach(function (e) { e.classList.remove('gz-pulse'); }); }

  window.GuiaSIVIL = {
    init: function (cfg) { G.cfg = cfg; montar(); },
    abrirMenu: function () { if (!G.cfg) return; menu(); $('gzDock').classList.remove('show'); $('gzPill').classList.remove('show'); $('gzOv').classList.add('show'); },
    cerrarMenu: function () { $('gzOv').classList.remove('show'); if (G.guia && G.activa) this.expandir(); },
    abrir: function (id) {
      G.guia = G.cfg.guias.filter(function (g) { return g.id === id; })[0]; if (!G.guia) return;
      var e = est(id); G.paso = e.fin ? 0 : Math.min(e.paso || 0, G.guia.pasos.length - 1); G.activa = true;
      $('gzOv').classList.remove('show'); $('gzPill').classList.remove('show'); $('gzDock').classList.add('show'); dibujar();
    },
    mover: function (d) {
      var n = G.guia.pasos.length, np = G.paso + d;
      if (np >= n) { LS(clave(G.guia.id), { paso: 0, fin: true }); G.activa = false; quitarResalte(); $('gzDock').classList.remove('show'); $('gzPill').classList.remove('show'); alert('✅ Guía completada: ' + G.guia.titulo + '\n\nPuede repetirla cuando la necesite desde el botón 📖 Guía.'); return; }
      if (np < 0) return; G.paso = np; dibujar();
    },
    ir: function () {
      var p = G.guia.pasos[G.paso];
      try { if (p.ir && typeof window.irA === 'function') window.irA(p.ir); if (p.abrir && typeof window[p.abrir] === 'function') window[p.abrir](); } catch (e) { console.warn('Guía:', e); }
      setTimeout(function () { resaltar(p); }, 350);
    },
    minimizar: function () { quitarResalte(); $('gzDock').classList.remove('show'); var n = G.guia.pasos.length; var b = $('gzPill'); b.textContent = '📖 ' + G.guia.titulo + ' · Paso ' + (G.paso + 1) + '/' + n; b.classList.add('show'); },
    expandir: function () { if (!G.guia) return; $('gzPill').classList.remove('show'); $('gzDock').classList.add('show'); dibujar(); },
    guardarSalir: function () { guardar(false); G.activa = false; quitarResalte(); $('gzDock').classList.remove('show'); $('gzPill').classList.remove('show'); },
    reiniciar: function () { if (!confirm('¿Reiniciar esta guía desde el paso 1?')) return; G.paso = 0; LS(clave(G.guia.id), { paso: 0, fin: false }); dibujar(); }
  };
})();
