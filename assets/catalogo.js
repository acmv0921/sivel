/* SIVIL · Aviso de cambios en el catálogo y los precios (Comercial, Despacho)
 * Compara lo que la app mostró la última vez con lo que hay hoy en PRODUCTOS_MAESTRO / PRECIOS_GERENCIA.
 * - Al abrir la app: muestra un mensaje con lo que cambió desde la última vez (productos nuevos, precios, retirados).
 * - Con la app abierta: cada pocos minutos revisa y, si Gerencia cambió algo, ofrece "Actualizar ahora".
 * Uso: CatalogoSIVIL.init({ app:'comercial', listo:function(){...true cuando ya inició sesión...}, leer:'leerGVIZ' }) */
(function () {
  var C = null, primera = true, aviso = null, yaAvisado = '';
  var LS = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };
  var clave = function () { return 'sivil_catalogo_' + C.app; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var CAMPOS = ['tmdescrip', 'tmund', 'tipo_iva', 'peso_kg_unitario', 'unidades_por_m2', 'unidades_por_estiba', 'valor_estiba_unidad', 'unidades_por_viaje', 'flete_total_viaje_cali', 'precio_m2', 'flete_cali', 'descuento_max', 'stock_minimo'];
  function hash(t) { var h = 5381; for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return String(h); }
  async function foto() {
    var leer = window[C.leer || 'leerGVIZ'];
    var prod = await leer('PRODUCTOS_MAESTRO'), pre = await leer('PRECIOS_GERENCIA');
    var precios = {}; pre.forEach(function (x) { precios[String(x.tmcode)] = x; });
    var items = {};
    prod.forEach(function (p) {
      if (String(p.calidad || 'PRIMERA').toUpperCase() === 'SEGUNDA') return;
      var c = String(p.tmcode), x = precios[c] || {};
      items[c] = { n: String(p.tmdescrip || ''), p: Number(x.precio_base_planta) || Number(p.precio_base) || 0, d: Number(x.descuento_max_vendedor) || 0, h: hash(CAMPOS.map(function (k) { return String(p[k] === undefined ? '' : p[k]); }).join('|')) };
    });
    return items;
  }
  function comparar(antes, ahora) {
    var nuevos = [], precio = [], otros = [], retirados = [];
    Object.keys(ahora).forEach(function (c) {
      var a = antes[c], b = ahora[c];
      if (!a) { nuevos.push(c); return; }
      if (a.p !== b.p) precio.push(c); else if (a.d !== b.d || a.h !== b.h || a.n !== b.n) otros.push(c);
    });
    Object.keys(antes).forEach(function (c) { if (!ahora[c]) retirados.push(c); });
    return { nuevos: nuevos, precio: precio, otros: otros, retirados: retirados, total: nuevos.length + precio.length + otros.length + retirados.length };
  }
  function f(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); }
  function detalle(d, antes, ahora) {
    var h = '';
    var lista = function (tit, arr, fn) { if (!arr.length) return ''; return '<div style="font-weight:800;margin:.5rem 0 .2rem;">' + tit + ' (' + arr.length + ')</div>' + arr.slice(0, 12).map(function (c) { return '<div style="font-size:.72rem;padding:2px 0;border-bottom:1px solid #eee;">' + fn(c) + '</div>'; }).join('') + (arr.length > 12 ? '<div style="font-size:.7rem;color:#666;">…y ' + (arr.length - 12) + ' más</div>' : ''); };
    h += lista('🆕 Productos nuevos', d.nuevos, function (c) { return '<b>' + esc(c) + '</b> ' + esc(ahora[c].n) + ' · ' + f(ahora[c].p); });
    h += lista('💲 Precios cambiados', d.precio, function (c) { return '<b>' + esc(c) + '</b> ' + esc(ahora[c].n) + '<br>' + f(antes[c].p) + ' → <b>' + f(ahora[c].p) + '</b>'; });
    h += lista('✏️ Datos actualizados', d.otros, function (c) { return '<b>' + esc(c) + '</b> ' + esc(ahora[c].n); });
    h += lista('🗑️ Retirados del catálogo', d.retirados, function (c) { return '<b>' + esc(c) + '</b> ' + esc(antes[c].n); });
    return h;
  }
  function franja() {
    if (aviso) return aviso;
    aviso = document.createElement('div');
    aviso.style.cssText = 'display:none;position:fixed;left:8px;right:8px;top:64px;z-index:880;max-width:560px;margin:0 auto;background:#fff;border:2px solid #2563a8;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.35);padding:.8rem;font:.78rem/1.4 "Segoe UI",Arial,sans-serif;color:#1e2b3a;max-height:70vh;overflow:auto;';
    document.body.appendChild(aviso); return aviso;
  }
  function mostrar(html) { var a = franja(); a.innerHTML = html; a.style.display = 'block'; }
  window.CatalogoSIVIL = {
    cerrar: function () { if (aviso) aviso.style.display = 'none'; },
    actualizar: function () { location.reload(); },
    init: function (cfg) {
      C = cfg;
      var revisar = async function () {
        try {
          if (!navigator.onLine || document.visibilityState === 'hidden') return;
          if (C.listo && !C.listo()) return;
          var ahora = await foto(); if (!Object.keys(ahora).length) return;
          var guardado = LS(clave());
          if (primera) {
            primera = false;
            if (guardado && guardado.items) {
              var d = comparar(guardado.items, ahora);
              if (d.total) mostrar('<div style="font-weight:800;font-size:.86rem;color:#1a3a5c;">📢 Gerencia actualizó el catálogo</div><div style="font-size:.72rem;color:#666;">Cambios desde la última vez que usó la aplicación. Ya están cargados: puede buscarlos por código o nombre.</div>' + detalle(d, guardado.items, ahora) + '<button onclick="CatalogoSIVIL.cerrar()" style="margin-top:.7rem;border:0;border-radius:9px;padding:.5rem .9rem;background:#2563a8;color:#fff;font-weight:700;">Entendido</button>');
            }
            LS(clave(), { ts: Date.now(), items: ahora });
            C._cargado = ahora;   // lo que la app tiene en pantalla
            return;
          }
          var dif = comparar(C._cargado || ahora, ahora);
          var firma = hash(JSON.stringify([dif.nuevos, dif.precio, dif.otros, dif.retirados]));
          if (dif.total && firma !== yaAvisado) {
            yaAvisado = firma;
            mostrar('<div style="font-weight:800;font-size:.86rem;color:#1a3a5c;">🔄 Gerencia acaba de actualizar el catálogo</div><div style="font-size:.74rem;margin:.2rem 0;">' + (dif.nuevos.length ? dif.nuevos.length + ' producto(s) nuevo(s) · ' : '') + (dif.precio.length ? dif.precio.length + ' precio(s) cambiado(s) · ' : '') + (dif.otros.length ? dif.otros.length + ' dato(s) actualizado(s)' : '') + '</div>' +
              '<button onclick="CatalogoSIVIL.actualizar()" style="margin-top:.5rem;border:0;border-radius:9px;padding:.5rem .9rem;background:#e05c1a;color:#fff;font-weight:700;">Actualizar ahora</button> <button onclick="CatalogoSIVIL.cerrar()" style="margin-top:.5rem;border:0;border-radius:9px;padding:.5rem .9rem;background:#eef1f5;font-weight:700;">Después</button>');
          }
        } catch (e) { /* silencioso: nunca debe estorbar la operación */ }
      };
      setTimeout(revisar, 6000);
      setInterval(revisar, (cfg.cadaMin || 4) * 60000);
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') setTimeout(revisar, 800); });
    }
  };
})();
