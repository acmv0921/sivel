/* Fotos y anexos de la AP — compartido por Comercial (sube) y Comercial/Despacho (ven) */
(function () {
  function b64Raw(u) { return String(u || '').split(',')[1] || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tam(b) { b = Number(b) || 0; return b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
  function url(it, r) { var bin = atob(r.b64), n = bin.length, u8 = new Uint8Array(n); while (n--) u8[n] = bin.charCodeAt(n); return URL.createObjectURL(new Blob([u8], { type: r.mime })); }

  // Sube en segundo plano, de a uno (para no exceder el tamaño de cada petición)
  async function subir(ap_id, fotos, archivos, usuario) {
    var lista = [], i;
    (fotos || []).forEach(function (f, k) { lista.push({ tipo: 'foto', nombre: 'foto_' + (k + 1) + '.jpg', mime: 'image/jpeg', b64: b64Raw(f.b64), hora: f.hora || '' }); });
    (archivos || []).forEach(function (f) { lista.push({ tipo: 'archivo', nombre: f.nombre, mime: f.tipo || 'application/octet-stream', b64: b64Raw(f.b64) }); });
    var ok = 0, mal = 0;
    for (i = 0; i < lista.length; i++) {
      try {
        var r = await escribirGAS({ accion: 'guardarAdjuntoAP', ap_id: ap_id, nombre: lista[i].nombre, mime: lista[i].mime, b64: lista[i].b64, tipo: lista[i].tipo, hora: lista[i].hora, usuario: usuario || '' });
        if (r && r.ok) ok++; else mal++;
      } catch (e) { mal++; }
    }
    return { ok: ok, mal: mal, total: lista.length };
  }

  // Pinta en `el` el botón/galería de fotos y anexos de la AP
  function ver(ap_id, el) {
    if (!el) return;
    el.innerHTML = '<button type="button" class="btn btn-outline btn-sm" style="width:100%;" id="adjBtn">📷 Ver fotos y anexos del pedido</button><div id="adjBox"></div>';
    el.querySelector('#adjBtn').onclick = async function () {
      var b = this, box = el.querySelector('#adjBox'); b.disabled = true; b.textContent = '⏳ Cargando…';
      var r = await escribirGAS({ accion: 'listarAdjuntosAP', ap_id: ap_id });
      if (!r || !r.ok) { b.disabled = false; b.textContent = '📷 Ver fotos y anexos del pedido'; box.innerHTML = '<div style="color:#b91c1c;font-size:.78rem;">⚠️ ' + esc((r && r.error) || 'No se pudo cargar') + '</div>'; return; }
      if (!r.items.length) { b.style.display = 'none'; box.innerHTML = '<div style="font-size:.78rem;color:#888;">Este pedido no tiene fotos ni anexos.</div>'; return; }
      b.style.display = 'none';
      var fotos = r.items.filter(function (x) { return x.tipo === 'foto' || /^image\//.test(x.mime); }), otros = r.items.filter(function (x) { return fotos.indexOf(x) < 0; });
      box.innerHTML = (fotos.length ? '<div style="font-weight:800;font-size:.78rem;margin:6px 0;">📷 Fotos (' + fotos.length + ')</div><div id="adjFotos" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;"></div>' : '') +
        (otros.length ? '<div style="font-weight:800;font-size:.78rem;margin:10px 0 4px;">📎 Anexos (' + otros.length + ')</div><div id="adjOtros"></div>' : '');
      fotos.forEach(function (it) {
        var d = document.createElement('div'); d.style.cssText = 'aspect-ratio:1;background:#eee;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#888;cursor:pointer;'; d.textContent = '⏳';
        box.querySelector('#adjFotos').appendChild(d);
        escribirGAS({ accion: 'getAdjuntoAP', ap_id: ap_id, file_id: it.id }).then(function (g) {
          if (!g || !g.ok) { d.textContent = '⚠️'; return; }
          var u = url(it, g); d.innerHTML = '<img src="' + u + '" style="width:100%;height:100%;object-fit:cover;">';
          d.onclick = function () { if (typeof verFotoGrande === 'function') verFotoGrande(u); else window.open(u, '_blank'); };
        });
      });
      otros.forEach(function (it) {
        var a = document.createElement('button'); a.type = 'button'; a.className = 'btn btn-outline btn-sm'; a.style.cssText = 'width:100%;margin-bottom:4px;text-align:left;';
        a.textContent = '📄 ' + it.nombre + ' · ' + tam(it.tamano);
        a.onclick = async function () {
          a.disabled = true; var t = a.textContent; a.textContent = '⏳ Abriendo…';
          var g = await escribirGAS({ accion: 'getAdjuntoAP', ap_id: ap_id, file_id: it.id });
          a.disabled = false; a.textContent = t;
          if (g && g.ok) window.open(url(it, g), '_blank'); else alert('No se pudo abrir el archivo');
        };
        box.querySelector('#adjOtros').appendChild(a);
      });
    };
  }
  window.AdjuntosAP = { subir: subir, ver: ver };
})();
