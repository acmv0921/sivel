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
        var rq = indexedDB.open('sivil_offline', 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore('datos'); };
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
    if (!navigator.onLine) {
      var ts = antiguos.length ? Math.min.apply(null, antiguos.map(function (k) { return usoCache[k]; })) : null;
      b.className = 'show'; b.onclick = null;
      b.innerHTML = '📴 SIN CONEXIÓN' + (ts ? ' · datos guardados del ' + fmt(ts) : '') + ' · puede consultar, pero no guardar cambios.';
    } else if (antiguos.length) {
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
    var orig = window[nombre]; if (typeof orig !== 'function') return;
    window[nombre] = async function () {
      if (!navigator.onLine) {
        pintar(); if (typeof window.toast === 'function') window.toast('📴 ' + MSG, 5000);
        if (C.escribirModo === 'throw') throw new Error(MSG);
        return { ok: false, offline: true, error: MSG };
      }
      return orig.apply(this, arguments);
    };
  }
  window.OfflineSIVIL = {
    init: function (cfg) {
      C = cfg; dbP = abrirDB();
      (cfg.leer || []).forEach(envolverLeer);
      envolverEscribir(cfg.escribir || 'escribirGAS');
      window.addEventListener('offline', pintar);
      window.addEventListener('online', pintar);
      if (!navigator.onLine) pintar();
    }
  };
})();
