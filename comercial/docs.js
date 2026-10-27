/* Documentos de POSTECSA — módulo del Comercial (27 oct 2026)
 * El vendedor elige de una lista los documentos oficiales (RUT, portafolio, fichas, certificados)
 * y se anexan a la cotización o al pedido. RUT y certificados SIEMPRE preguntan "¿es el actualizado?"
 * y permiten reemplazarlos por el actual (queda registrado quién y cuándo).
 * Los archivos viven en Drive (backend); aquí se descargan bajo demanda y se guardan en IndexedDB.
 */
(function () {
  var CAT = null;            // catálogo en memoria
  var MAX_MB = 25;
  var DB = 'sivil_docs_com';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hoy() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fechaLeg(s) { if (!s) return ''; var p = String(s).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; }
  function tam(b) { return b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
  function usuario() { try { return (STATE.vendedor && STATE.vendedor.nombre_vendedor) || STATE.usuario || ''; } catch (e) { return ''; } }
  function vencido(d) { return !!(d.vigente_hasta && d.vigente_hasta < hoy()); }

  // ---------- IndexedDB (caché de archivos grandes) ----------
  function idb() {
    return new Promise(function (ok, no) {
      try { var r = indexedDB.open(DB, 1); r.onupgradeneeded = function () { r.result.createObjectStore('f'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; } catch (e) { no(e); }
    });
  }
  function cacheGet(k) { return idb().then(function (db) { return new Promise(function (ok) { var q = db.transaction('f').objectStore('f').get(k); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; }); }).catch(function () { return null; }); }
  function cachePut(k, v) { return idb().then(function (db) { return new Promise(function (ok) { var t = db.transaction('f', 'readwrite'); t.objectStore('f').put(v, k); t.oncomplete = function () { ok(); }; t.onerror = function () { ok(); }; }); }).catch(function () {}); }

  function llave(d) { return d.doc_id + '|' + (d.fecha_actualizacion || '') + '|' + (d.tamano || 0); }

  function leerArchivo(file) {
    return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = function () { no(new Error('No se pudo leer el archivo')); }; r.readAsDataURL(file); });
  }

  async function cargarCatalogo(forzar) {
    if (CAT && !forzar) return CAT;
    var r = await escribirGAS({ accion: 'listarDocsComerciales' });
    if (!r || !r.ok) throw new Error((r && r.error) || 'No se pudo cargar la lista de documentos');
    CAT = r.docs; return CAT;
  }

  // Devuelve {nombre,tipo,tamano,b64(dataURL)} del documento vigente
  async function traerArchivo(d) {
    var k = llave(d), c = await cacheGet(k);
    if (c) return c;
    var r = await escribirGAS({ accion: 'getDocComercial', doc_id: d.doc_id });
    if (!r || !r.ok) throw new Error((r && r.error) || 'No se pudo descargar ' + d.nombre);
    var mime = r.mime || 'application/pdf';
    var o = { nombre: r.nombre_archivo || (d.doc_id + '.pdf'), tipo: mime, tamano: Math.round(r.b64.length * 3 / 4), b64: 'data:' + mime + ';base64,' + r.b64 };
    cachePut(k, o); return o;
  }

  // ---------- Interfaz ----------
  function modal(html) {
    var o = document.createElement('div');
    o.className = 'modal-overlay show'; o.style.zIndex = 900;
    o.innerHTML = '<div class="modal-box" style="max-width:560px;">' + html + '</div>';
    document.body.appendChild(o); return o;
  }
  function cerrar(o) { if (o && o.parentNode) o.parentNode.removeChild(o); }

  function filaDoc(d) {
    var sin = !d.tiene_archivo, ven = vencido(d);
    var meta = sin ? '<span style="color:#b91c1c;">Aún sin cargar</span>' :
      '📄 ' + tam(d.tamano) + (d.fecha_documento ? ' · del ' + fechaLeg(d.fecha_documento) : '') +
      (d.vigente_hasta ? ' · vigente hasta <b style="color:' + (ven ? '#b91c1c' : '#166534') + ';">' + fechaLeg(d.vigente_hasta) + (ven ? ' (VENCIDO)' : '') + '</b>' : '') +
      (d.confirmar ? ' · <span style="color:#92400e;">pide confirmar</span>' : '');
    return '<label style="display:flex;gap:10px;align-items:flex-start;padding:9px 6px;border-bottom:1px solid #eee;' + (sin ? 'opacity:.8;' : '') + '">' +
      '<input type="checkbox" data-doc="' + esc(d.doc_id) + '" ' + (sin ? 'disabled' : '') + ' style="margin-top:4px;width:20px;height:20px;">' +
      '<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:.88rem;">' + esc(d.nombre) + '</div>' +
      '<div style="font-size:.72rem;color:#666;margin-top:2px;">' + meta + '</div></div>' +
      '<button type="button" data-rep="' + esc(d.doc_id) + '" class="btn btn-outline btn-sm" style="white-space:nowrap;">' + (sin ? '⬆️ Subir' : '🔄') + '</button></label>';
  }

  async function abrir(opts) {
    opts = opts || {};
    var m = modal('<button class="modal-close" data-x>✕</button><div style="font-size:1.05rem;font-weight:800;color:var(--verde);margin-bottom:4px;">📚 Documentos de POSTECSA</div>' +
      '<div style="font-size:.75rem;color:#666;margin-bottom:8px;">' + esc(opts.subtitulo || 'Marca los que quieres anexar.') + '</div><div id="dpBody" style="font-size:.85rem;">⏳ Cargando lista…</div>');
    m.querySelector('[data-x]').onclick = function () { cerrar(m); };
    try { await pintar(m, opts); } catch (e) { m.querySelector('#dpBody').innerHTML = '<div style="color:#b91c1c;">⚠️ ' + esc(e.message) + '</div>'; }
  }

  async function pintar(m, opts, forzar) {
    var docs = await cargarCatalogo(forzar), cats = [], porCat = {};
    docs.forEach(function (d) { if (!porCat[d.categoria]) { porCat[d.categoria] = []; cats.push(d.categoria); } porCat[d.categoria].push(d); });
    var h = cats.map(function (c) { return '<div style="font-weight:800;font-size:.78rem;color:#555;margin:10px 0 2px;text-transform:uppercase;">' + esc(c) + '</div>' + porCat[c].map(filaDoc).join(''); }).join('');
    h += '<button type="button" id="dpOk" class="btn btn-primary" style="width:100%;margin-top:14px;">Anexar seleccionados (0)</button>';
    var body = m.querySelector('#dpBody'); body.innerHTML = h;
    var btn = body.querySelector('#dpOk');
    function sel() { return Array.prototype.slice.call(body.querySelectorAll('input[data-doc]:checked')).map(function (i) { return i.getAttribute('data-doc'); }); }
    body.addEventListener('change', function () { btn.textContent = 'Anexar seleccionados (' + sel().length + ')'; });
    Array.prototype.forEach.call(body.querySelectorAll('[data-rep]'), function (b) {
      b.onclick = async function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        var d = docs.filter(function (x) { return x.doc_id === b.getAttribute('data-rep'); })[0];
        var r = await reemplazar(d, !d.tiene_archivo);
        if (r) { await pintar(m, opts, true); }
      };
    });
    btn.onclick = async function () {
      var ids = sel(); if (!ids.length) { toast('Marca al menos un documento'); return; }
      btn.disabled = true; btn.textContent = '⏳ Preparando…';
      var out = [];
      try {
        for (var i = 0; i < ids.length; i++) {
          var d = docs.filter(function (x) { return x.doc_id === ids[i]; })[0];
          if (d.confirmar || vencido(d)) {
            var dec = await confirmarActual(d);
            if (dec === 'quitar') continue;
            if (dec === 'reemplazado') { await cargarCatalogo(true); d = CAT.filter(function (x) { return x.doc_id === ids[i]; })[0]; }
          }
          out.push(await traerArchivo(d));
        }
        cerrar(m);
        if (out.length && opts.alAdjuntar) await opts.alAdjuntar(out);
      } catch (e) { toast('⚠️ ' + e.message, 4000); btn.disabled = false; btn.textContent = 'Anexar seleccionados'; }
    };
  }

  // Pregunta obligatoria: ¿es el actualizado?  → 'ok' | 'reemplazado' | 'quitar'
  function confirmarActual(d) {
    return new Promise(function (res) {
      var ven = vencido(d);
      var o = modal('<div style="font-size:1.05rem;font-weight:800;color:' + (ven ? '#b91c1c' : '#92400e') + ';margin-bottom:6px;">' + (ven ? '⛔ Documento VENCIDO' : '❓ ¿Es el documento actualizado?') + '</div>' +
        '<div style="font-weight:700;margin-bottom:4px;">' + esc(d.nombre) + '</div>' +
        '<div style="font-size:.8rem;color:#444;line-height:1.5;margin-bottom:10px;">' +
        (d.fecha_documento ? 'Fecha del documento: <b>' + fechaLeg(d.fecha_documento) + '</b><br>' : '') +
        (d.vigente_hasta ? 'Vigente hasta: <b>' + fechaLeg(d.vigente_hasta) + '</b><br>' : '') +
        (d.actualizado_por ? 'Cargado por ' + esc(d.actualizado_por) + (d.fecha_actualizacion ? ' el ' + fechaLeg(d.fecha_actualizacion) : '') + '<br>' : '') +
        (ven ? '<span style="color:#b91c1c;">Este documento ya venció: debes reemplazarlo por el actual.</span>' : 'Revisa que sea el vigente antes de enviarlo al cliente.') + '</div>' +
        (ven ? '' : '<button type="button" class="btn btn-success" data-a="ok" style="width:100%;margin-bottom:6px;">✅ Sí, es el actualizado</button>') +
        '<button type="button" class="btn btn-primary" data-a="rep" style="width:100%;margin-bottom:6px;">🔄 No — reemplazar por el actual</button>' +
        '<button type="button" class="btn btn-outline" data-a="q" style="width:100%;">Quitar de la selección</button>');
      o.addEventListener('click', async function (ev) {
        var a = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-a'); if (!a) return;
        if (a === 'ok') { cerrar(o); res('ok'); }
        else if (a === 'q') { cerrar(o); res('quitar'); }
        else if (a === 'rep') { var r = await reemplazar(d, false); if (r) { cerrar(o); res('reemplazado'); } }
      });
    });
  }

  // Selecciona el archivo nuevo, pide fechas y lo sube. → true si se reemplazó
  function reemplazar(d, primera) {
    return new Promise(function (res) {
      var o = modal('<button class="modal-close" data-x>✕</button><div style="font-size:1.05rem;font-weight:800;color:var(--verde);margin-bottom:6px;">' + (primera ? '⬆️ Subir' : '🔄 Reemplazar') + ' · ' + esc(d.nombre) + '</div>' +
        '<div style="font-size:.76rem;color:#666;margin-bottom:8px;">' + (primera ? 'Este documento aún no tiene archivo.' : 'El archivo actual quedará guardado en “Anteriores” y se registrará quién lo cambió.') + '</div>' +
        '<label class="form-label">Archivo (PDF o imagen, máx. ' + MAX_MB + ' MB)</label><input type="file" id="dpF" accept="application/pdf,image/*" class="form-control" style="margin-bottom:8px;">' +
        '<label class="form-label">Fecha del documento</label><input type="date" id="dpFd" class="form-control" style="margin-bottom:8px;">' +
        (d.confirmar ? '<label class="form-label">Vigente hasta (si aplica)</label><input type="date" id="dpVg" class="form-control" style="margin-bottom:8px;">' : '') +
        '<div id="dpMsg" style="font-size:.78rem;color:#b91c1c;min-height:18px;"></div>' +
        '<button type="button" id="dpSubir" class="btn btn-primary" style="width:100%;">Guardar como documento actual</button>');
      var fin = function (v) { cerrar(o); res(v); };
      o.querySelector('[data-x]').onclick = function () { fin(false); };
      o.querySelector('#dpSubir').onclick = async function () {
        var f = o.querySelector('#dpF').files[0], msg = o.querySelector('#dpMsg'), b = o.querySelector('#dpSubir');
        if (!f) { msg.textContent = 'Elige el archivo.'; return; }
        if (f.size > MAX_MB * 1048576) { msg.textContent = 'El archivo pesa más de ' + MAX_MB + ' MB.'; return; }
        b.disabled = true; b.textContent = '⏳ Subiendo…'; msg.textContent = '';
        try {
          var url = await leerArchivo(f);
          var r = await escribirGAS({ accion: 'guardarDocComercial', doc_id: d.doc_id, b64: url.split(',')[1], nombre_archivo: f.name, mime: f.type || 'application/pdf',
            fecha_documento: o.querySelector('#dpFd').value || '', vigente_hasta: (o.querySelector('#dpVg') || {}).value || '', usuario: usuario() });
          if (!r || !r.ok) throw new Error((r && r.error) || 'No se pudo guardar');
          CAT = null; toast('✅ Documento actualizado'); fin(true);
        } catch (e) { msg.textContent = '⚠️ ' + e.message; b.disabled = false; b.textContent = 'Guardar como documento actual'; }
      };
    });
  }

  window.DocsPostecsa = { abrir: abrir };
})();
