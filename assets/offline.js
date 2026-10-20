/* SIVIL · Modo sin conexión (módulo común)
 * - Guarda en el celular la última lectura de cada hoja (IndexedDB) y la usa si no hay conexión.
 * - Avisa con una franja visible y BLOQUEA los guardados hacia el servidor mientras no haya conexión
 *   (evita cantidades "guardadas" que en realidad no llegaron).
 * Uso: OfflineSIVIL.init({ app:'despacho', leer:['leerGVIZ'], escribir:'escribirGAS', escribirModo:'return'|'throw' }) */
(function () {
  var C = null, dbP = null, usoCache = {}, bar = null;
  var MSG = 'Sin conexión: este cambio NO se guardó. Espere a tener señal e inténtelo de nuevo.';
  function abrirDB() {
    return new Promise(function (ok) {
      try {
        var rq = indexedDB.open('sivil_offline', 2);
        rq.onupgradeneeded = function () { var d = rq.result; if (!d.objectStoreNames.contains('datos')) d.createObjectStore('datos'); if (!d.objectStoreNames.contains('cola')) d.createObjectStore('cola', { autoIncrement: true }); };
        rq.onsuccess = function () { ok(rq.result); };
        rq.onerror = function () { ok(null); };
      } catch (e) { ok(null); }
    });
  }
  function put(k, v) { dbP.then(function (db) { try { if (db) db.transaction('datos', 'readwrite').objectStore('datos').put(v, C.app + '|' + k); } catch (e) {} }); }
  function get(k) {
    return dbP.then(function (db) {
      return new Promise(function (ok) {
        try { if (!db) return ok(null); var rq = db.transaction('datos').objectStore('datos').get(C.app + '|' + k); rq.onsuccess = function () { ok(rq.result || null); }; rq.onerror = function () { ok(null); }; }
        catch (e) { ok(null); }
      });
    });
  }
  var pend = 0, enviando = false, origEsc = null;
  function colaTx(modo, fn) {
    return dbP.then(function (db) {
      return new Promise(function (ok) {
        try { if (!db) return ok(null); var tx = db.transaction('cola', modo); var r = fn(tx.objectStore('cola')); tx.oncomplete = function () { ok(r && r.result !== undefined ? r.result : true); }; tx.onerror = function () { ok(null); }; }
        catch (e) { ok(null); }
      });
    });
  }
  function contar() { return colaTx('readonly', function (st) { return st.count(); }).then(function (n) { pend = n || 0; pintar(); }); }
  function encolar(body) { return colaTx('readwrite', function (st) { return st.add({ app: C.app, body: body, ts: Date.now() }); }).then(contar); }
  function listar() {
    return dbP.then(function (db) {
      return new Promise(function (ok) {
        var out = []; try { if (!db) return ok(out); var rq = db.transaction('cola').objectStore('cola').openCursor();
          rq.onsuccess = function () { var c = rq.result; if (c) { if (c.value.app === C.app) out.push({ k: c.key, v: c.value }); c.continue(); } else ok(out); }; rq.onerror = function () { ok(out); }; }
        catch (e) { ok(out); }
      });
    });
  }
  function esRed(r) { return r && r.ok === false && /conexi[oó]n|failed to fetch|network|abort/i.test(String(r.error || '')); }
  async function enviarCola() {
    if (enviando || !navigator.onLine || !origEsc) return; enviando = true;
    try {
      var items = await listar();
      for (var i = 0; i < items.length; i++) {
        var ok = false;
        try { var r = await origEsc.call(window, items[i].v.body); ok = r !== undefined ? (r && r.ok !== false) : true; } catch (e) { ok = false; }
        if (!ok) break;
        await colaTx('readwrite', function (st) { return st.delete(items[i].k); });
        await contar();
      }
    } finally { enviando = false; contar(); }
  }
  function fmt(ts) { try { return new Date(ts).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function franja() {
    if (bar) return bar;
    var st = document.createElement('style');
    st.textContent = '#ofBar{display:none;position:fixed;left:0;right:0;bottom:0;z-index:900;padding:.45rem .8rem;font:700 .74rem/1.35 "Segoe UI",Arial,sans-serif;text-align:center;color:#fff;background:#b91c1c;box-shadow:0 -2px 10px rgba(0,0,0,.3);}#ofBar.show{display:block;}#ofBar.ok{background:#1a7a4a;cursor:pointer;}';
    document.head.appendChild(st);
    bar = document.createElement('div'); bar.id = 'ofBar'; document.body.appendChild(bar); return bar;
  }
  function pintar() {
    var b = franja(), antiguos = Object.keys(usoCache);
    var tp = pend ? ' · ⏳ ' + pend + ' pendiente(s) de enviar' : '';
    if (!navigator.onLine) {
      var ts = antiguos.length ? Math.min.apply(null, antiguos.map(function (k) { return usoCache[k]; })) : null;
      b.className = 'show'; b.style.background = ''; b.onclick = null;
      b.innerHTML = '📴 SIN CONEXIÓN' + (ts ? ' · datos guardados del ' + fmt(ts) : '') + ' · puede consultar, pero no guardar cambios.' + tp;
    } else if (pend) {
      b.className = 'show'; b.style.background = '#b45309'; b.onclick = null;
      b.innerHTML = '⏳ Enviando ' + pend + ' registro(s) guardado(s) sin conexión…';
    } else if (antiguos.length) {
      b.style.background = '';
      b.className = 'show ok'; b.onclick = function () { location.reload(); };
      b.innerHTML = '✅ Conexión restablecida · toque aquí para actualizar los datos';
    } else { b.className = ''; }
  }
  function envolverLeer(nombre) {
    var orig = window[nombre]; if (typeof orig !== 'function') return;
    window[nombre] = async function (hoja) {
      try {
        var r = await orig.apply(this, arguments);
        if (Array.isArray(r) && r.length) put(hoja, { ts: Date.now(), datos: r });
        delete usoCache[hoja]; return r;
      } catch (e) {
        var c = await get(hoja);
        if (c && c.datos) { usoCache[hoja] = c.ts; pintar(); return c.datos; }
        throw e;
      }
    };
  }
  function envolverEscribir(nombre) {
    var orig = window[nombre]; if (typeof orig !== 'function') return; origEsc = orig;
    var q = C.cola || [];
    window[nombre] = async function (body) {
      var encolable = body && q.indexOf(body.accion) >= 0;
      var avisoCola = function () { if (typeof window.toast === 'function') window.toast('📴 Sin conexión: guardado en el celular. Se enviará solo cuando haya señal.', 5000); };
      if (!navigator.onLine) {
        if (encolable) { await encolar(body); avisoCola(); return { ok: true, encolado: true }; }
        pintar(); if (typeof window.toast === 'function') window.toast('📴 ' + MSG, 5000);
        if (C.escribirModo === 'throw') throw new Error(MSG);
        return { ok: false, offline: true, error: MSG };
      }
      var r;
      try { r = await orig.apply(this, arguments); }
      catch (e) { if (encolable && /failed to fetch|network|abort|load failed/i.test(String(e && e.message))) { await encolar(body); avisoCola(); return { ok: true, encolado: true }; } throw e; }
      if (encolable && esRed(r)) { await encolar(body); avisoCola(); return { ok: true, encolado: true }; }
      return r;
    };
  }
  window.OfflineSIVIL = {
    init: function (cfg) {
      C = cfg; dbP = abrirDB();
      (cfg.leer || []).forEach(envolverLeer);
      envolverEscribir(cfg.escribir || 'escribirGAS');
      window.addEventListener('offline', pintar);
      window.addEventListener('online', function () { pintar(); setTimeout(enviarCola, 1500); });
      setTimeout(function () { contar().then(enviarCola); }, 3000);
      setInterval(enviarCola, 60000);
      if (!navigator.onLine) pintar();
    }
  };
})();
