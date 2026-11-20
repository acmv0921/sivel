/* SIVIL · Estadísticas de despacho (módulo común a Despacho y Gerencia)
 * Uso: EstDesp.montar('idContenedor', { sheetId: SHEET_ID, app: 'despacho' })
 * Lee las hojas por gviz (solo lectura). No escribe nada en el servidor.
 * Indicadores de ingeniería industrial: Pareto/ABC, variabilidad XYZ, tiempo de ciclo (lead time),
 * nivel de servicio, productividad de flota, carta de control (±3σ), tasa de defectos y backlog (aging). */
(function () {
  'use strict';
  var E = (window.EstDesp = {});
  var ST = { cfg: {}, D: null, X: null, tipo: 'mes', ref: new Date(), desde: '', hasta: '', met: 'und', sla: 3, ch: {}, cont: null, cargando: false, A: null, B: null, rg: null, drill: null };
  var MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIA = 86400000;
  var MET = { und: 'Unidades', val: 'Valor ($)', kg: 'Toneladas' };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var N = function (v) { var x = parseFloat(v); return isFinite(x) ? x : 0; };
  var fm = function (n, d) { return (+n || 0).toLocaleString('es-CO', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var money = function (n) { return '$ ' + fm(Math.round(n)); };
  var ymd = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var dmy = function (d) { return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); };
  var ini0 = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0); };
  var fin0 = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); };
  var valM = function (o) { return ST.met === 'kg' ? o.kg / 1000 : o[ST.met]; };
  var fmM = function (v) { return ST.met === 'val' ? money(v) : ST.met === 'kg' ? fm(v, 1) + ' t' : fm(v); };

  /* ---------- Lectura de datos ---------- */
  function cval(c) {
    var v = c.v;
    if (typeof v === 'string') { var m = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/.exec(v); if (m) return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)); }
    return v;
  }
  function gviz(hoja, sinEncabezado) {
    var url = 'https://docs.google.com/spreadsheets/d/' + ST.cfg.sheetId + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(hoja) + (sinEncabezado ? '&headers=0' : '') + '&_=' + Date.now();
    return fetch(url).then(function (r) { return r.text(); }).then(function (t) {
      var j = JSON.parse(t.substring(t.indexOf('{'), t.lastIndexOf('}') + 1));
      var cols = j.table.cols.map(function (c) { return c.label || c.id; });
      return j.table.rows.map(function (r) { var o = {}; (r.c || []).forEach(function (c, i) { o[cols[i]] = c ? cval(c) : null; }); return o; });
    });
  }
  function cargar(forzar) {
    if (ST.D && !forzar) return Promise.resolve(ST.D);
    var ok = function (h, s) { return gviz(h, s).catch(function () { return null; }); };
    return Promise.all([ok('CONTROL_PATIO_Y_LOGISTICA'), ok('DETALLE_AP'), ok('PREVENTAS_AP'), ok('PRODUCTOS_MAESTRO'), ok('VEHICULOS'), ok('CLIENTES'), ok('VENDEDORES'), ok('NOVEDADES_LOGISTICA', true)]).then(function (r) {
      if (!r[0] || !r[1] || !r[2]) throw new Error('No se pudieron leer las hojas de despachos (¿sin conexión?)');
      ST.D = { P: r[0], DET: r[1], AP: r[2], M: r[3] || [], V: r[4] || [], C: r[5] || [], VD: r[6] || [], N: r[7] || [] };
      preparar(); return ST.D;
    });
  }

  /* ---------- Preparación de datos (derivados) ---------- */
  function preparar() {
    var D = ST.D, X = { prod: {}, det: {}, detAp: {}, ap: {}, cli: {}, ven: {}, veh: {}, ev: [], nov: [], apFirst: {} };
    D.M.forEach(function (m) { var k = String(m.tmcode); if (!X.prod[k] || /PRIMERA/i.test(String(m.calidad || ''))) X.prod[k] = { d: m.tmdescrip || ('Código ' + k), u: m.tmund || '', peso: N(m.peso_kg_unitario), pb: N(m.precio_base) }; });
    D.DET.forEach(function (l) {
      var k = String(l.ap_id) + '|' + String(l.tmcode), o = X.det[k] || (X.det[k] = { ap: String(l.ap_id), tm: String(l.tmcode), sol: 0, des: 0, pr: 0 });
      o.sol += N(l.cantidad_solicitada); o.des += N(l.cantidad_despachada);
      if (!o.pr) o.pr = N(l.precio_con_descuento) || N(l.precio_base) * (1 - N(l.descuento_aplicado));
    });
    Object.keys(X.det).forEach(function (k) { var o = X.det[k]; (X.detAp[o.ap] = X.detAp[o.ap] || []).push(o); });
    D.AP.forEach(function (a) { if (a.ap_id == null || a.ap_id === '') return; X.ap[String(a.ap_id)] = { f: a.fecha_creacion instanceof Date ? a.fecha_creacion : null, e: String(a.estado_ap || ''), nit: String(a.cliente_nit || ''), v: String(a.vendedor_id || ''), dest: String(a.destino || '').trim(), obra: a.nombre_obra || '' }; });
    D.C.forEach(function (c) { X.cli[String(c.cliente_nit)] = c.razon_social || c.cliente_nombre || String(c.cliente_nit); });
    D.VD.forEach(function (v) { X.ven[String(v.id_vendedor)] = v.nombre_vendedor || v.nombre_completo || String(v.id_vendedor); });
    D.V.forEach(function (v) { if (v.placa) X.veh[String(v.placa).toUpperCase().trim()] = { cap: N(v.capacidad_und), cond: v.conductor_nombre || '', marca: v.marca || '' }; });
    // Eventos de despacho (una fila = una línea de producto cargada en un viaje)
    D.P.forEach(function (r) {
      if (!(r.fecha_registro instanceof Date)) return;
      var raw = r.cant_despachada_viaje;
      X.ev.push({ f: r.fecha_registro, ap: String(r.ap_id == null ? '' : r.ap_id), tm: String(r.tmcode == null ? '' : r.tmcode), pl: String(r.placa_vehiculo || '').toUpperCase().trim() || 'SIN PLACA',
        cant: (raw == null || raw === '') ? null : N(raw), est: false, und: 0, val: 0, kg: 0,
        av: N(r.cant_averia_cargue) + N(r.cant_averia_restribado) + N(r.cant_mermas_averias), rep: N(r.cant_reposicion), mer: N(r.cant_merma_segunda), vid: 0 });
    });
    // Cantidad estimada para despachos antiguos sin cantidad por viaje: lo acumulado en la AP menos lo conocido, repartido por igual.
    var grp = {};
    X.ev.forEach(function (e) { var k = e.ap + '|' + e.tm; (grp[k] = grp[k] || []).push(e); });
    Object.keys(grp).forEach(function (k) {
      var L = grp[k], falt = L.filter(function (e) { return e.cant == null; }); if (!falt.length) return;
      var conocido = L.reduce(function (a, e) { return a + (e.cant || 0); }, 0), d = X.det[k], rest = d ? Math.max(0, d.des - conocido) : 0;
      falt.forEach(function (e) { e.cant = rest / falt.length; e.est = true; });
    });
    X.ev.forEach(function (e) {
      var d = X.det[e.ap + '|' + e.tm], p = X.prod[e.tm] || { peso: 0, pb: 0, d: 'Código ' + e.tm, u: '' };
      e.und = e.cant || 0; e.val = e.und * ((d && d.pr) || p.pb); e.kg = e.und * p.peso;
    });
    // Viaje = mismas placa y ventana de 45 min entre cargues (agrupa líneas y viajes compartidos)
    X.ev.sort(function (a, b) { return a.pl < b.pl ? -1 : a.pl > b.pl ? 1 : a.f - b.f; });
    var vid = 0, ult = null;
    X.ev.forEach(function (e) { if (!ult || ult.pl !== e.pl || e.f - ult.f > 45 * 60000) vid++; e.vid = vid; ult = e; });
    X.ev.sort(function (a, b) { return a.f - b.f; });
    X.ev.forEach(function (e) { if (e.ap && (!X.apFirst[e.ap] || e.f < X.apFirst[e.ap])) X.apFirst[e.ap] = e.f; });
    // Novedades logísticas (hoja sin encabezados: A id, B fecha, C AP, D categoría, E etiqueta, F descripción, G usuario, H placa)
    D.N.forEach(function (r) {
      var cat = r.D || r.categoria; if (!cat || cat === 'categoria') return;
      X.nov.push({ f: r.B instanceof Date ? r.B : (r.fecha instanceof Date ? r.fecha : null), ap: String(r.C || r.ap_id || ''), cat: String(cat), et: r.E || r.etiqueta || String(cat), desc: r.F || r.descripcion || '', pl: String(r.H || r.placa_vehiculo || '') });
    });
    ST.X = X;
  }

  /* ---------- Periodos ---------- */
  function rango(tipo, ref) {
    var y = ref.getFullYear(), m = ref.getMonth(), ini, fin, lab;
    if (tipo === 'semana') { var dow = (ref.getDay() + 6) % 7; ini = ini0(new Date(y, m, ref.getDate() - dow)); fin = fin0(new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + 6)); lab = 'Semana del ' + dmy(ini) + ' al ' + dmy(fin); }
    else if (tipo === 'mes') { ini = new Date(y, m, 1); fin = fin0(new Date(y, m + 1, 0)); lab = MES[m].charAt(0).toUpperCase() + MES[m].slice(1) + ' de ' + y; }
    else if (tipo === 'trimestre') { var q = Math.floor(m / 3); ini = new Date(y, q * 3, 1); fin = fin0(new Date(y, q * 3 + 3, 0)); lab = 'Trimestre ' + (q + 1) + ' de ' + y; }
    else if (tipo === 'semestre') { var s = m < 6 ? 0 : 1; ini = new Date(y, s * 6, 1); fin = fin0(new Date(y, s * 6 + 6, 0)); lab = 'Semestre ' + (s + 1) + ' de ' + y; }
    else if (tipo === 'anio') { ini = new Date(y, 0, 1); fin = fin0(new Date(y, 11, 31)); lab = 'Año ' + y; }
    else { var d1 = ST.desde ? new Date(ST.desde + 'T00:00:00') : new Date(y, m, 1), d2 = ST.hasta ? new Date(ST.hasta + 'T00:00:00') : new Date(); if (d2 < d1) { var t = d1; d1 = d2; d2 = t; } ini = ini0(d1); fin = fin0(d2); lab = dmy(ini) + ' al ' + dmy(fin); }
    return { ini: ini, fin: fin, lab: lab, tipo: tipo };
  }
  function previo(rg) {
    if (rg.tipo === 'rango') { var span = rg.fin - rg.ini + 1; return { ini: new Date(rg.ini - span), fin: new Date(rg.ini - 1), lab: 'periodo anterior', tipo: 'rango' }; }
    var r = new Date(rg.ini), n = { semana: [0, 0, -7], mes: [0, -1, 0], trimestre: [0, -3, 0], semestre: [0, -6, 0], anio: [-1, 0, 0] }[rg.tipo];
    return rango(rg.tipo, new Date(r.getFullYear() + n[0], r.getMonth() + n[1], r.getDate() + n[2]));
  }

  /* ---------- Cálculo de un periodo ---------- */
  function inc(map, k, e, extra) {
    var o = map[k] || (map[k] = { k: k, und: 0, val: 0, kg: 0, av: 0, rep: 0, mer: 0, aps: {}, vi: {}, dias: {} });
    o.und += e.und; o.val += e.val; o.kg += e.kg; o.av += e.av; o.rep += e.rep; o.mer += e.mer; if (e.ap) o.aps[e.ap] = 1; o.vi[e.vid] = 1; o.dias[ymd(e.f)] = 1; return o;
  }
  function calc(ini, fin) {
    var X = ST.X, evs = X.ev.filter(function (e) { return e.f >= ini && e.f <= fin; });
    var R = { ev: evs, und: 0, val: 0, kg: 0, av: 0, rep: 0, mer: 0, viajes: 0, aps: 0, prod: {}, veh: {}, cli: {}, dest: {}, ven: {}, estim: 0, sinPlaca: 0 }, T = {}, A = {};
    evs.forEach(function (e) {
      R.und += e.und; R.val += e.val; R.kg += e.kg; R.av += e.av; R.rep += e.rep; R.mer += e.mer; T[e.vid] = 1; if (e.ap) A[e.ap] = 1; if (e.est) R.estim++; if (e.pl === 'SIN PLACA') R.sinPlaca++;
      inc(R.prod, e.tm, e); inc(R.veh, e.pl, e);
      var a = X.ap[e.ap];
      if (a) { inc(R.cli, a.nit || '(sin cliente)', e); inc(R.dest, a.dest || '(sin destino)', e); inc(R.ven, a.v || '(sin vendedor)', e); }
    });
    R.viajes = Object.keys(T).length; R.aps = Object.keys(A).length;
    // Tiempo de ciclo: creación de la AP → primer despacho (APs cuyo primer despacho cae en el periodo)
    var lt = [];
    Object.keys(X.apFirst).forEach(function (ap) { var f = X.apFirst[ap]; if (f >= ini && f <= fin && X.ap[ap] && X.ap[ap].f) { var d = Math.max(0, (f - X.ap[ap].f) / DIA); lt.push(d); } });
    lt.sort(function (a, b) { return a - b; });
    R.lt = lt; R.ltMed = lt.length ? lt.reduce(function (a, b) { return a + b; }, 0) / lt.length : null; R.ltMediana = lt.length ? lt[Math.floor((lt.length - 1) / 2)] : null; R.ltP90 = lt.length ? lt[Math.min(lt.length - 1, Math.ceil(lt.length * 0.9) - 1)] : null;
    // Cumplimiento de líneas de las APs atendidas
    var sol = 0, des = 0; Object.keys(A).forEach(function (ap) { (X.detAp[ap] || []).forEach(function (d) { sol += d.sol; des += Math.min(d.des, d.sol); }); });
    R.fill = sol > 0 ? des / sol : null;
    R.tasaNov = R.und > 0 ? (R.av + R.rep + R.mer) / R.und * 1000 : null;
    return R;
  }
  function rank(map) {
    var arr = Object.keys(map).map(function (k) { var o = map[k]; o.v = valM(o); o.nAps = Object.keys(o.aps).length; o.nVi = Object.keys(o.vi).length; return o; }).sort(function (a, b) { return b.v - a.v; });
    var tot = arr.reduce(function (a, o) { return a + o.v; }, 0), cum = 0;
    arr.forEach(function (o) { o.pc = tot ? o.v / tot * 100 : 0; cum += o.pc; o.cum = cum; o.abc = cum - o.pc < 80 ? 'A' : (cum - o.pc < 95 ? 'B' : 'C'); });
    return arr;
  }
  // Granularidad de la tendencia: día (≤ 45 días), semana (≤ 200 días), mes
  function serie(rg) {
    var dias = Math.round((rg.fin - rg.ini) / DIA) + 1, g = dias <= 45 ? 'd' : (dias <= 200 ? 's' : 'm'), hoy = new Date(), tope = rg.fin > hoy ? hoy : rg.fin;
    var keyOf = function (d) { if (g === 'd') return ymd(d); if (g === 's') { var dw = (d.getDay() + 6) % 7; return ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() - dw)); } return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); };
    var b = {}, orden = [], cur = new Date(rg.ini);
    while (cur <= tope) { var k = keyOf(cur); if (!(k in b)) { b[k] = { k: k, und: 0, val: 0, kg: 0, dom: cur.getDay() === 0 }; orden.push(k); } cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1); }
    return { g: g, b: b, orden: orden, keyOf: keyOf };
  }

  /* ---------- Interfaz ---------- */
  var CSS = '.est{font-size:.8rem;color:#1e2b3a;} .est *{box-sizing:border-box;}' +
    '.est-ban{background:linear-gradient(135deg,#1a3a5c,#2563a8);color:#fff;border-radius:14px;padding:.8rem .9rem;margin-bottom:.7rem;}' +
    '.est-ban h3{margin:0 0 .15rem;font-size:1rem;} .est-ban .sub{font-size:.7rem;opacity:.85;line-height:1.35;}' +
    '.est-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:.55rem;} .est-chip{border:1.5px solid rgba(255,255,255,.55);background:transparent;color:#fff;border-radius:18px;padding:.3rem .65rem;font-size:.72rem;font-weight:700;cursor:pointer;} .est-chip.on{background:#fff;color:#1a3a5c;}' +
    '.est-nav{display:flex;align-items:center;gap:6px;margin-top:.55rem;} .est-nav button{border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:8px;padding:.35rem .7rem;font-weight:800;cursor:pointer;} .est-nav b{flex:1;text-align:center;font-size:.82rem;}' +
    '.est-rng{display:flex;gap:6px;margin-top:.5rem;} .est-rng input{flex:1;border:0;border-radius:8px;padding:.35rem;font-size:.78rem;}' +
    '.est-ctl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:.6rem;} .est-seg{display:flex;border:1.5px solid #2563a8;border-radius:9px;overflow:hidden;} .est-seg button{border:0;background:#fff;color:#2563a8;padding:.35rem .6rem;font-size:.72rem;font-weight:700;cursor:pointer;} .est-seg button.on{background:#2563a8;color:#fff;}' +
    '.est-btn{border:0;border-radius:9px;padding:.42rem .75rem;font-weight:700;font-size:.74rem;cursor:pointer;background:#166534;color:#fff;} .est-btn.s{background:#eef1f5;color:#1e2b3a;}' +
    '.est-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:.7rem;} @media(min-width:700px){.est-kpis{grid-template-columns:repeat(4,1fr);}}' +
    '.est-k{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:.55rem .6rem;} .est-k .t{font-size:.64rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.2px;} .est-k .v{font-size:1.15rem;font-weight:800;color:#0f2942;margin:.1rem 0;} .est-k .d{font-size:.68rem;font-weight:700;} .est-k .s{font-size:.64rem;color:#94a3b8;}' +
    '.est-up{color:#15803d;} .est-dn{color:#b91c1c;} .est-eq{color:#64748b;}' +
    '.est-sec{background:#fff;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:.7rem;overflow:hidden;} .est-sec>summary{cursor:pointer;padding:.65rem .8rem;font-weight:800;font-size:.86rem;color:#1a3a5c;list-style:none;display:flex;align-items:center;gap:6px;} .est-sec>summary::-webkit-details-marker{display:none;} .est-sec>summary:after{content:"▾";margin-left:auto;color:#94a3b8;} .est-sec[open]>summary:after{content:"▴";}' +
    '.est-bd{padding:0 .8rem .8rem;} .est-how{font-size:.7rem;color:#475569;background:#f1f5f9;border-radius:8px;padding:.45rem .6rem;margin-bottom:.5rem;line-height:1.4;}' +
    '.est-tb{width:100%;border-collapse:collapse;font-size:.74rem;} .est-tb th{text-align:left;font-size:.64rem;color:#64748b;text-transform:uppercase;padding:.3rem .25rem;border-bottom:1.5px solid #e2e8f0;} .est-tb td{padding:.32rem .25rem;border-bottom:1px solid #f1f5f9;vertical-align:middle;} .est-tb tr.clk{cursor:pointer;} .est-tb tr.clk:active{background:#eff6ff;} .est-tb .n{text-align:right;white-space:nowrap;}' +
    '.est-bar{height:6px;background:#e2e8f0;border-radius:4px;overflow:hidden;min-width:40px;} .est-bar i{display:block;height:100%;background:#2563a8;}' +
    '.est-abc{display:inline-block;min-width:18px;text-align:center;border-radius:5px;font-weight:800;font-size:.66rem;padding:1px 4px;color:#fff;} .est-abc.A{background:#166534;} .est-abc.B{background:#d97706;} .est-abc.C{background:#94a3b8;}' +
    '.est-cv{font-size:.64rem;color:#64748b;} .est-hl{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.5rem .7rem;margin-bottom:.7rem;font-size:.76rem;line-height:1.5;} .est-hl b{color:#92400e;}' +
    '.est-cv2{position:relative;height:230px;} .est-vacio{text-align:center;color:#64748b;padding:.9rem .5rem;font-size:.78rem;line-height:1.45;} .est-dq{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;} .est-dq div{background:#f8fafc;border-radius:8px;padding:.4rem .55rem;font-size:.72rem;}' +
    '.est-drill{background:#eff6ff;border:1.5px solid #2563a8;border-radius:12px;padding:.6rem .75rem;margin-bottom:.7rem;}';

  function chip(t, k, on) { return '<button class="est-chip' + (on ? ' on' : '') + '" onclick="EstDesp.tipo(\'' + k + '\')">' + t + '</button>'; }
  function delta(cur, prev, bajoEsMejor) {
    if (cur == null || prev == null || prev === 0) return '<span class="est-eq">sin comparación</span>';
    var p = (cur - prev) / Math.abs(prev) * 100; if (Math.abs(p) < 0.05) return '<span class="est-eq">= igual que el anterior</span>';
    var bien = bajoEsMejor ? p < 0 : p > 0; return '<span class="' + (bien ? 'est-up' : 'est-dn') + '">' + (p > 0 ? '▲ ' : '▼ ') + fm(Math.abs(p), 1) + ' % vs. anterior</span>';
  }
  function kpi(t, v, d, s) { return '<div class="est-k"><div class="t">' + t + '</div><div class="v">' + v + '</div><div class="d">' + d + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div>'; }
  function nombreProd(k) { var p = ST.X.prod[k]; return p ? p.d : 'Código ' + k; }
  function nombreCli(k) { return ST.X.cli[k] || k; }
  function nombreVen(k) { return ST.X.ven[k] || k; }

  function filasRank(arr, tipo, max) {
    if (!arr.length) return '<tr><td colspan="6" class="est-vacio">Sin movimientos en este periodo</td></tr>';
    var top = arr.length ? arr[0].v : 1;
    return arr.slice(0, max || 10).map(function (o, i) {
      var nom = tipo === 'prod' ? '<b>' + esc(o.k) + '</b> · ' + esc(nombreProd(o.k)) : tipo === 'cli' ? esc(nombreCli(o.k)) : tipo === 'ven' ? esc(nombreVen(o.k)) : esc(o.k);
      var clk = (tipo === 'prod' || tipo === 'veh') ? ' class="clk" onclick="EstDesp.detalle(\'' + tipo + '\',\'' + esc(o.k).replace(/'/g, '') + '\')"' : '';
      return '<tr' + clk + '><td>' + (i + 1) + '</td><td>' + nom + '<div class="est-bar"><i style="width:' + (top ? Math.max(2, o.v / top * 100) : 0) + '%"></i></div></td><td class="n">' + fmM(o.v) + '</td><td class="n">' + fm(o.pc, 1) + ' %</td><td class="n">' + o.nAps + '</td><td class="n">' + o.nVi + '</td></tr>';
    }).join('');
  }
  function tablaRank(arr, tipo, max, etq) {
    return '<table class="est-tb"><thead><tr><th>#</th><th>' + etq + '</th><th class="n">' + MET[ST.met] + '</th><th class="n">%</th><th class="n">APs</th><th class="n">Viajes</th></tr></thead><tbody>' + filasRank(arr, tipo, max) + '</tbody></table>';
  }
  function cvProductos(rg, listaProd) {
    // Variabilidad semanal (coeficiente de variación) por producto → clase XYZ
    var sem = Math.ceil(((rg.fin > new Date() ? new Date() : rg.fin) - rg.ini) / DIA / 7), out = {};
    if (sem < 4) return out;
    var wk = function (d) { return Math.floor((d - rg.ini) / DIA / 7); }, ser = {};
    ST.A.ev.forEach(function (e) { var a = ser[e.tm] || (ser[e.tm] = new Array(sem).fill(0)), w = wk(e.f); if (w >= 0 && w < sem) a[w] += (ST.met === 'val' ? e.val : ST.met === 'kg' ? e.kg / 1000 : e.und); });
    listaProd.forEach(function (o) { var a = ser[o.k]; if (!a) return; var m = a.reduce(function (x, y) { return x + y; }, 0) / sem; if (!m) return; var v = a.reduce(function (x, y) { return x + (y - m) * (y - m); }, 0) / sem; var cv = Math.sqrt(v) / m; out[o.k] = { cv: cv, xyz: cv <= 0.5 ? 'X' : (cv <= 1 ? 'Y' : 'Z') }; });
    return out;
  }
  function hallazgos(A, B, prodR, vehR) {
    var h = [];
    if (A.und > 0 && prodR.length) {
      var n80 = prodR.filter(function (o) { return o.abc === 'A'; }).length;
      h.push('<b>Concentración (Pareto):</b> ' + n80 + ' de ' + prodR.length + ' productos (' + fm(n80 / prodR.length * 100) + ' %) concentran el 80 % de ' + MET[ST.met].toLowerCase() + '. Son los de clase A: no deben faltar en patio.');
    }
    var vr = vehR.filter(function (o) { return o.k !== 'SIN PLACA'; }); if (vr.length) h.push('<b>Flota:</b> el vehículo más usado fue <b>' + esc(vr[0].k) + '</b> (' + vr[0].nVi + ' viajes, ' + fmM(vr[0].v) + ').');
    if (A.ltMed != null) { var okp = A.lt.filter(function (x) { return x <= ST.sla; }).length / A.lt.length * 100; h.push('<b>Tiempo de ciclo:</b> una AP tarda en promedio ' + fm(A.ltMed, 1) + ' días en salir (P90: ' + fm(A.ltP90, 1) + ' días); ' + fm(okp) + ' % sale en ' + ST.sla + ' días o menos' + (B.ltMed != null ? ' (periodo anterior: ' + fm(B.ltMed, 1) + ' días)' : '') + '.'); }
    return h;
  }
  function backlog() {
    var X = ST.X, hoy = new Date(), L = [];
    Object.keys(X.ap).forEach(function (id) {
      var a = X.ap[id]; if (!/^(Pendiente|Despachado Parcial|Modificado)$/i.test(a.e) || !a.f) return;
      var pu = 0, pv = 0; (X.detAp[id] || []).forEach(function (d) { var r = Math.max(0, d.sol - d.des); pu += r; pv += r * d.pr; });
      if (pu <= 0 && !(X.detAp[id] || []).length) return; if (pu <= 0) return;
      L.push({ id: id, cli: nombreCli(a.nit), dest: a.dest, e: a.e, dias: Math.floor((hoy - a.f) / DIA), pu: pu, pv: pv, f: a.f });
    });
    L.sort(function (a, b) { return b.dias - a.dias; });
    var B = [{ t: '0–3 días', a: 0, b: 3 }, { t: '4–7 días', a: 4, b: 7 }, { t: '8–15 días', a: 8, b: 15 }, { t: '16–30 días', a: 16, b: 30 }, { t: 'Más de 30 días', a: 31, b: 1e9 }].map(function (x) { var s = L.filter(function (l) { return l.dias >= x.a && l.dias <= x.b; }); return { t: x.t, n: s.length, v: s.reduce(function (a, l) { return a + l.pv; }, 0) }; });
    return { L: L, B: B };
  }

  function mk(id, cfg) {
    var cv = $(id); if (!cv || typeof Chart === 'undefined') return;
    if (ST.ch[id]) { try { ST.ch[id].destroy(); } catch (e) { } }
    ST.ch[id] = new Chart(cv.getContext('2d'), cfg);
  }

  function render() {
    var c = ST.cont; if (!c || !ST.X) return;
    var rg = rango(ST.tipo, ST.ref), pr = previo(rg), A = calc(rg.ini, rg.fin), B = calc(pr.ini, pr.fin); ST.A = A; ST.B = B; ST.rg = rg;
    var prodR = rank(A.prod), vehR = rank(A.veh), cliR = rank(A.cli), destR = rank(A.dest), venR = rank(A.ven), cvp = cvProductos(rg, prodR);
    var vhOk = vehR.filter(function (o) { return o.k !== 'SIN PLACA'; }), sr = serie(rg), bk = backlog();
    A.ev.forEach(function (e) { var k = sr.keyOf(e.f); if (sr.b[k]) { sr.b[k].und += e.und; sr.b[k].val += e.val; sr.b[k].kg += e.kg; } });
    var puntos = sr.orden.filter(function (k) { return !(sr.g === 'd' && sr.b[k].dom); }).map(function (k) { return sr.b[k]; });
    var vals = puntos.map(valM), mu = vals.length ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : 0, sg = vals.length ? Math.sqrt(vals.reduce(function (a, b) { return a + (b - mu) * (b - mu); }, 0) / vals.length) : 0;
    var ucl = mu + 3 * sg, lcl = Math.max(0, mu - 3 * sg), fuera = puntos.filter(function (p) { var v = valM(p); return v > ucl || (v < lcl && lcl > 0); });
    var W = sr.g === 'd' ? 7 : 3, ma = vals.map(function (v, i) { var a = vals.slice(Math.max(0, i - W + 1), i + 1); return a.reduce(function (x, y) { return x + y; }, 0) / a.length; });
    var carga = A.viajes ? A.kg / A.viajes / 1000 : null, cargaB = B.viajes ? B.kg / B.viajes / 1000 : null;
    var hl = hallazgos(A, B, prodR, vehR);
    var pctPlaca = A.ev.length ? (1 - A.sinPlaca / A.ev.length) * 100 : null;
    var novP = ST.X.nov.filter(function (n) { return n.f && n.f >= rg.ini && n.f <= rg.fin; });
    var avTot = A.av + A.rep + A.mer;
    var catNov = {}; novP.forEach(function (n) { catNov[n.et] = (catNov[n.et] || 0) + 1; });
    var avProd = prodR.filter(function (o) { return o.av + o.rep + o.mer > 0; }).sort(function (a, b) { return (b.av + b.rep + b.mer) - (a.av + a.rep + a.mer); });

    var h = '';
    h += '<div class="est-ban" id="estBanner"><h3>📊 Estadísticas de despacho</h3><div class="sub">Indicadores de logística calculados con los despachos registrados. Toca un periodo, navega con las flechas y compáralo con el anterior.</div>' +
      '<div class="est-chips" id="estPeriodos">' + chip('Semana', 'semana', ST.tipo === 'semana') + chip('Mes', 'mes', ST.tipo === 'mes') + chip('Trimestre', 'trimestre', ST.tipo === 'trimestre') + chip('Semestre', 'semestre', ST.tipo === 'semestre') + chip('Año', 'anio', ST.tipo === 'anio') + chip('Rango', 'rango', ST.tipo === 'rango') + '</div>' +
      (ST.tipo === 'rango' ? '<div class="est-rng"><input type="date" id="estDesde" value="' + (ST.desde || ymd(rg.ini)) + '" onchange="EstDesp.fechas()"><input type="date" id="estHasta" value="' + (ST.hasta || ymd(rg.fin > new Date() ? new Date() : rg.fin)) + '" onchange="EstDesp.fechas()"></div>' :
        '<div class="est-nav"><button onclick="EstDesp.mover(-1)">◀</button><b>' + esc(rg.lab) + '</b><button onclick="EstDesp.mover(1)">▶</button></div>') + '</div>';
    h += '<div class="est-ctl"><span style="font-size:.7rem;color:#64748b;font-weight:700;">Medir en:</span><div class="est-seg" id="estMetrica"><button class="' + (ST.met === 'und' ? 'on' : '') + '" onclick="EstDesp.metrica(\'und\')">Unidades</button><button class="' + (ST.met === 'val' ? 'on' : '') + '" onclick="EstDesp.metrica(\'val\')">Valor $</button><button class="' + (ST.met === 'kg' ? 'on' : '') + '" onclick="EstDesp.metrica(\'kg\')">Toneladas</button></div>' +
      '<button class="est-btn" id="estDescargar" onclick="EstDesp.excel()">📥 Descargar Excel</button><button class="est-btn s" onclick="EstDesp.recargar()">🔄 Actualizar datos</button></div>';
    if (!A.ev.length) h += '<div class="est-hl" style="background:#f8fafc;border-color:#e2e8f0;">No hay despachos registrados en este periodo. Cambia de periodo con las flechas.</div>';
    h += '<div class="est-kpis" id="estKpis">' +
      kpi('Unidades despachadas', fm(A.und), delta(A.und, B.und), A.estim ? A.estim + ' registros con cantidad estimada' : '') +
      kpi('Valor despachado', money(A.val), delta(A.val, B.val), 'productos, sin flete ni IVA') +
      kpi('Toneladas', fm(A.kg / 1000, 1), delta(A.kg, B.kg), 'según peso unitario del producto') +
      kpi('Viajes', fm(A.viajes), delta(A.viajes, B.viajes), fm(A.aps) + ' APs atendidas') +
      kpi('Carga media por viaje', carga == null ? '—' : fm(carga, 2) + ' t', delta(carga, cargaB), 'productividad de la flota') +
      kpi('Tiempo de ciclo (AP→salida)', A.ltMed == null ? '—' : fm(A.ltMed, 1) + ' d', delta(A.ltMed, B.ltMed, true), A.ltMed == null ? '' : 'mediana ' + fm(A.ltMediana, 1) + ' d · P90 ' + fm(A.ltP90, 1) + ' d') +
      kpi('Nivel de servicio', A.fill == null ? '—' : fm(A.fill * 100, 1) + ' %', delta(A.fill, B.fill), 'despachado / solicitado en APs atendidas') +
      kpi('Novedades por 1.000 und', A.tasaNov == null ? '—' : fm(A.tasaNov, 1), delta(A.tasaNov, B.tasaNov, true), 'averías + reposiciones + mermas') + '</div>';
    if (hl.length) h += '<div class="est-hl"><b>💡 Hallazgos del periodo</b><br>• ' + hl.join('<br>• ') + '</div>';
    h += '<div id="estDrill"></div>';

    h += '<details class="est-sec" open><summary>📈 Tendencia y carta de control</summary><div class="est-bd"><div class="est-how">Muestra ' + MET[ST.met].toLowerCase() + ' despachadas por ' + (sr.g === 'd' ? 'día (sin domingos)' : sr.g === 's' ? 'semana' : 'mes') + '. La línea azul es el promedio móvil. Las líneas rojas son los <b>límites de control (promedio ± 3σ)</b>: un punto fuera de ellos indica un día o semana fuera de lo normal que vale la pena investigar.</div>' +
      '<div class="est-cv2"><canvas id="estCT"></canvas></div>' +
      (fuera.length ? '<div class="est-how" style="margin-top:.5rem;background:#fef2f2;">⚠️ Fuera de control: ' + fuera.map(function (p) { return esc(p.k) + ' (' + fmM(valM(p)) + ')'; }).join(', ') + '</div>' : (vals.length >= 5 ? '<div class="est-how" style="margin-top:.5rem;background:#f0fdf4;">✅ Proceso estable: ningún punto fuera de los límites.</div>' : '')) + '</div></details>';

    h += '<details class="est-sec" open id="estPareto"><summary>🏆 Productos con más movimiento (Pareto y ABC-XYZ)</summary><div class="est-bd"><div class="est-how"><b>Pareto:</b> pocos productos explican la mayor parte del movimiento. <b>A</b> = el primer 80 %, <b>B</b> = hasta el 95 %, <b>C</b> = el resto. <b>XYZ</b> mide qué tan regular es la demanda semanal: <b>X</b> estable, <b>Y</b> variable, <b>Z</b> muy irregular (se calcula con 4 o más semanas). Toca un producto para ver sus despachos.</div>' +
      '<div class="est-cv2"><canvas id="estPA"></canvas></div><table class="est-tb" style="margin-top:.5rem;"><thead><tr><th>#</th><th>Producto</th><th class="n">' + MET[ST.met] + '</th><th class="n">% acum.</th><th>ABC</th><th>XYZ</th></tr></thead><tbody>' +
      (prodR.length ? prodR.slice(0, 15).map(function (o, i) { var x = cvp[o.k]; return '<tr class="clk" onclick="EstDesp.detalle(\'prod\',\'' + esc(o.k).replace(/\'/g, '') + '\')"><td>' + (i + 1) + '</td><td><b>' + esc(o.k) + '</b> · ' + esc(nombreProd(o.k)) + '</td><td class="n">' + fmM(o.v) + '</td><td class="n">' + fm(o.cum, 1) + ' %</td><td><span class="est-abc ' + o.abc + '">' + o.abc + '</span></td><td>' + (x ? '<span class="est-cv">' + x.xyz + ' (CV ' + fm(x.cv * 100) + ' %)</span>' : '<span class="est-cv">—</span>') + '</td></tr>'; }).join('') : '<tr><td colspan="6" class="est-vacio">Sin movimientos en este periodo</td></tr>') + '</tbody></table></div></details>';

    h += '<details class="est-sec" open id="estVeh"><summary>🚛 Vehículos más utilizados</summary><div class="est-bd"><div class="est-how">Un <b>viaje</b> son los cargues del mismo vehículo con menos de 45 minutos entre sí (incluye viajes compartidos). La <b>carga media</b> es la productividad: más toneladas por viaje significa menos viajes para el mismo despacho. La utilización compara las unidades por viaje con la capacidad registrada del vehículo (referencial: mezcla productos de distinto tamaño).</div>' +
      '<div class="est-cv2"><canvas id="estVH"></canvas></div><table class="est-tb" style="margin-top:.5rem;"><thead><tr><th>Placa</th><th class="n">Viajes</th><th class="n">' + MET[ST.met] + '</th><th class="n">t/viaje</th><th class="n">Utiliz.</th><th class="n">Días</th></tr></thead><tbody>' +
      (vehR.length ? vehR.slice(0, 15).map(function (o) { var info = ST.X.veh[o.k], u = info && info.cap > 0 && o.nVi ? o.und / o.nVi / info.cap * 100 : null; return '<tr class="clk" onclick="EstDesp.detalle(\'veh\',\'' + esc(o.k).replace(/\'/g, '') + '\')"><td><b>' + esc(o.k) + '</b>' + (info && info.cond ? '<div class="est-cv">' + esc(info.cond) + '</div>' : '') + '</td><td class="n">' + o.nVi + '</td><td class="n">' + fmM(o.v) + '</td><td class="n">' + (o.nVi ? fm(o.kg / o.nVi / 1000, 2) : '—') + '</td><td class="n">' + (u == null ? '—' : fm(u) + ' %') + '</td><td class="n">' + Object.keys(o.dias).length + '</td></tr>'; }).join('') : '<tr><td colspan="6" class="est-vacio">Sin movimientos en este periodo</td></tr>') + '</tbody></table></div></details>';

    h += '<details class="est-sec"><summary>👥 Clientes, destinos y vendedores</summary><div class="est-bd"><div class="est-how">Quién recibe más producto y hacia dónde. Útil para planear rutas y reforzar a los clientes que más compran.</div>' +
      '<b style="font-size:.76rem;">Clientes</b>' + tablaRank(cliR, 'cli', 10, 'Cliente') + '<b style="font-size:.76rem;display:block;margin-top:.6rem;">Destinos</b>' + tablaRank(destR, 'dest', 10, 'Destino') + '<b style="font-size:.76rem;display:block;margin-top:.6rem;">Vendedores</b>' + tablaRank(venR, 'ven', 10, 'Vendedor') + '</div></details>';

    h += '<details class="est-sec" open id="estNov"><summary>⚠️ Averías, reposiciones y reclamaciones</summary><div class="est-bd"><div class="est-how">Mide la <b>tasa de defectos</b>: novedades por cada 1.000 unidades despachadas. Un producto con tasa alta es candidato a revisar el proceso de cargue, el restribado o el producto mismo.</div>' +
      (avTot > 0 || novP.length ? ('<div style="margin-bottom:.4rem;">Averías: <b>' + fm(A.av) + '</b> · Reposiciones: <b>' + fm(A.rep) + '</b> · Mermas/segunda: <b>' + fm(A.mer) + '</b> · Novedades logísticas: <b>' + novP.length + '</b></div>' +
        (avProd.length ? '<table class="est-tb"><thead><tr><th>Producto</th><th class="n">Averías</th><th class="n">Repos.</th><th class="n">Mermas</th><th class="n">Por 1.000</th></tr></thead><tbody>' + avProd.slice(0, 10).map(function (o) { return '<tr><td><b>' + esc(o.k) + '</b> · ' + esc(nombreProd(o.k)) + '</td><td class="n">' + fm(o.av) + '</td><td class="n">' + fm(o.rep) + '</td><td class="n">' + fm(o.mer) + '</td><td class="n">' + (o.und ? fm((o.av + o.rep + o.mer) / o.und * 1000, 1) : '—') + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
        (novP.length ? '<div style="margin-top:.5rem;font-size:.74rem;"><b>Novedades logísticas por tipo:</b> ' + Object.keys(catNov).map(function (k) { return esc(k) + ': ' + catNov[k]; }).join(' · ') + '</div>' : '')) :
        '<div class="est-vacio">📭 No hay averías, reposiciones ni novedades registradas en este periodo.<br>Si ocurren y no se registran en <b>⚠️ Averías</b>, esta estadística queda vacía. Registrar cada novedad con producto y cantidad es lo que permite saber qué elementos generan más reclamaciones.</div>') + '</div></details>';

    h += '<details class="est-sec"><summary>⏳ APs abiertas por antigüedad (backlog)</summary><div class="est-bd"><div class="est-how">Foto de hoy, independiente del periodo: pedidos <b>Pendientes o con saldo</b> y cuántos días llevan abiertos. Cuanto más antiguos, más riesgo de incumplir al cliente.</div>' +
      '<table class="est-tb"><thead><tr><th>Antigüedad</th><th class="n">APs</th><th class="n">Valor por despachar</th></tr></thead><tbody>' + bk.B.map(function (b) { return '<tr><td>' + b.t + '</td><td class="n">' + b.n + '</td><td class="n">' + money(b.v) + '</td></tr>'; }).join('') + '</tbody></table>' +
      (bk.L.length ? '<b style="font-size:.76rem;display:block;margin-top:.6rem;">Las 10 más antiguas</b><table class="est-tb"><thead><tr><th>AP</th><th>Cliente</th><th class="n">Días</th><th class="n">Por despachar</th></tr></thead><tbody>' + bk.L.slice(0, 10).map(function (l) { return '<tr><td><b>' + esc(l.id) + '</b></td><td>' + esc(l.cli) + '<div class="est-cv">' + esc(l.e) + (l.dest ? ' · ' + esc(l.dest) : '') + '</div></td><td class="n">' + l.dias + '</td><td class="n">' + money(l.pv) + '</td></tr>'; }).join('') + '</tbody></table>' : '<div class="est-vacio">No hay APs abiertas con saldo.</div>') + '</div></details>';

    h += '<details class="est-sec"><summary>🧪 Calidad de los datos</summary><div class="est-bd"><div class="est-how">Las estadísticas son tan buenas como los datos que se registran. Esta tarjeta dice qué tan completo está el registro del periodo.</div><div class="est-dq">' +
      '<div>Despachos con <b>placa</b>: ' + (pctPlaca == null ? '—' : fm(pctPlaca) + ' %') + '</div><div>Registros con cantidad <b>estimada</b>: ' + A.estim + '</div>' +
      '<div>Novedades registradas: ' + novP.length + '</div><div>Registros del periodo: ' + A.ev.length + '</div></div></div></details>';
    h += '<div style="font-size:.66rem;color:#94a3b8;text-align:center;margin:.5rem 0 1rem;">Fuente: hojas de despachos, APs y productos de SIVIL · calculado al abrir o al pulsar Actualizar</div>';
    c.innerHTML = h;

    if (ST.drill) E.detalle(ST.drill.tipo, ST.drill.key, true);
    mk('estCT', { type: 'bar', data: { labels: puntos.map(function (p) { return p.k.length > 7 ? p.k.slice(5) : p.k; }), datasets: [
      { type: 'bar', label: MET[ST.met], data: vals, backgroundColor: vals.map(function (v) { return v > ucl || (lcl > 0 && v < lcl) ? '#dc2626' : '#93c5fd'; }), order: 3 },
      { type: 'line', label: 'Promedio móvil', data: ma, borderColor: '#1d4ed8', pointRadius: 0, borderWidth: 2, tension: .3, order: 1 },
      { type: 'line', label: 'Promedio', data: vals.map(function () { return mu; }), borderColor: '#16a34a', borderDash: [4, 4], pointRadius: 0, borderWidth: 1, order: 2 },
      { type: 'line', label: 'Límite sup. (+3σ)', data: vals.map(function () { return ucl; }), borderColor: '#dc2626', borderDash: [6, 4], pointRadius: 0, borderWidth: 1, order: 2 },
      { type: 'line', label: 'Límite inf. (−3σ)', data: vals.map(function () { return lcl; }), borderColor: '#dc2626', borderDash: [6, 4], pointRadius: 0, borderWidth: 1, order: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10, font: { size: 9 } } } }, scales: { x: { ticks: { font: { size: 8 }, maxRotation: 60 } }, y: { beginAtZero: true, ticks: { font: { size: 9 } } } } } });
    var t15 = prodR.slice(0, 15);
    mk('estPA', { type: 'bar', data: { labels: t15.map(function (o) { return o.k; }), datasets: [
      { type: 'bar', label: MET[ST.met], data: t15.map(function (o) { return o.v; }), backgroundColor: t15.map(function (o) { return o.abc === 'A' ? '#166534' : o.abc === 'B' ? '#d97706' : '#94a3b8'; }), yAxisID: 'y' },
      { type: 'line', label: '% acumulado', data: t15.map(function (o) { return o.cum; }), borderColor: '#1d4ed8', pointRadius: 2, borderWidth: 2, yAxisID: 'y2' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10, font: { size: 9 } } } }, scales: { x: { ticks: { font: { size: 8 } } }, y: { beginAtZero: true, ticks: { font: { size: 9 } } }, y2: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { font: { size: 9 }, callback: function (v) { return v + '%'; } } } } } });
    var v12 = vhOk.slice(0, 12);
    mk('estVH', { type: 'bar', data: { labels: v12.map(function (o) { return o.k; }), datasets: [{ label: MET[ST.met], data: v12.map(function (o) { return o.v; }), backgroundColor: '#2563a8' }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { font: { size: 9 } } }, y: { ticks: { font: { size: 9 } } } } } });
  }

  /* ---------- Acciones ---------- */
  E.montar = function (id, cfg) {
    ST.cfg = cfg || ST.cfg; ST.cont = $(id); if (!ST.cont) return;
    if (!$('estCss')) { var s = document.createElement('style'); s.id = 'estCss'; s.textContent = CSS; document.head.appendChild(s); }
    ST.cont.classList.add('est');
    if (ST.X) { render(); return; }
    ST.cont.innerHTML = '<div class="est-vacio"><div class="spinner" style="margin:0 auto .5rem;"></div>Cargando despachos y calculando indicadores…</div>';
    cargar().then(render).catch(function (e) { ST.cont.innerHTML = '<div class="est-vacio">❌ ' + esc(e.message || e) + '<br><br><button class="est-btn" onclick="EstDesp.recargar()">Reintentar</button></div>'; });
  };
  E.recargar = function () { ST.D = null; ST.X = null; E.montar(ST.cont ? ST.cont.id : '', ST.cfg); };
  E.tipo = function (t) { ST.tipo = t; if (t !== 'rango') ST.ref = new Date(); render(); };
  E.mover = function (d) {
    var r = ST.ref, y = r.getFullYear(), m = r.getMonth(), dd = r.getDate();
    if (ST.tipo === 'semana') ST.ref = new Date(y, m, dd + 7 * d); else if (ST.tipo === 'mes') ST.ref = new Date(y, m + d, 1); else if (ST.tipo === 'trimestre') ST.ref = new Date(y, m + 3 * d, 1); else if (ST.tipo === 'semestre') ST.ref = new Date(y, m + 6 * d, 1); else ST.ref = new Date(y + d, m, 1);
    render();
  };
  E.fechas = function () { ST.desde = ($('estDesde') || {}).value || ''; ST.hasta = ($('estHasta') || {}).value || ''; render(); };
  E.metrica = function (m) { ST.met = m; render(); };
  E.detalle = function (tipo, key, sinScroll) {
    var A = ST.A; if (!A) return;
    var L = A.ev.filter(function (e) { return tipo === 'prod' ? e.tm === key : e.pl === key; }).sort(function (a, b) { return b.f - a.f; });
    var tot = L.reduce(function (a, e) { a.und += e.und; a.val += e.val; a.kg += e.kg; return a; }, { und: 0, val: 0, kg: 0 });
    var tit = tipo === 'prod' ? '<b>' + esc(key) + '</b> · ' + esc(nombreProd(key)) : '🚛 <b>' + esc(key) + '</b>';
    var box = $('estDrill'); if (!box) return; ST.drill = { tipo: tipo, key: key };
    box.innerHTML = '<div class="est-drill"><div style="display:flex;justify-content:space-between;gap:8px;"><div>' + tit + '</div><button class="est-btn s" onclick="EstDesp.cerrarDetalle()">✕</button></div>' +
      '<div style="font-size:.72rem;margin:.3rem 0;">' + L.length + ' registros · ' + fm(tot.und) + ' und · ' + money(tot.val) + ' · ' + fm(tot.kg / 1000, 1) + ' t</div>' +
      '<table class="est-tb"><thead><tr><th>Fecha</th><th>AP</th><th>' + (tipo === 'prod' ? 'Placa' : 'Producto') + '</th><th class="n">Cant.</th></tr></thead><tbody>' +
      L.slice(0, 12).map(function (e) { return '<tr><td>' + dmy(e.f) + '</td><td>' + esc(e.ap) + '<div class="est-cv">' + esc(nombreCli((ST.X.ap[e.ap] || {}).nit || '')) + '</div></td><td>' + (tipo === 'prod' ? esc(e.pl) : esc(nombreProd(e.tm))) + '</td><td class="n">' + fm(e.und) + (e.est ? '*' : '') + '</td></tr>'; }).join('') + '</tbody></table>' +
      (L.some(function (e) { return e.est; }) ? '<div class="est-cv">* cantidad estimada (registro antiguo sin cantidad por viaje)</div>' : '') + '</div>';
    if (!sinScroll) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  E.cerrarDetalle = function () { ST.drill = null; var b = $('estDrill'); if (b) b.innerHTML = ''; };

  /* ---------- Excel ---------- */
  E.excel = function () {
    if (typeof XLSX === 'undefined') { alert('No se cargó la librería de Excel (¿sin conexión?)'); return; }
    var A = ST.A, B = ST.B, rg = ST.rg; if (!A) return;
    var wb = XLSX.utils.book_new(), add = function (nombre, filas, anchos) { var ws = XLSX.utils.json_to_sheet(filas.length ? filas : [{ Aviso: 'Sin datos en el periodo' }]); if (anchos) ws['!cols'] = anchos.map(function (w) { return { wch: w }; }); XLSX.utils.book_append_sheet(wb, ws, nombre); };
    var dl = function (a, b) { return b ? Math.round((a - b) / Math.abs(b) * 1000) / 10 : ''; };
    add('Resumen', [
      { Indicador: 'Periodo', Valor: rg.lab, 'Periodo anterior': '', 'Variación %': '' },
      { Indicador: 'Unidades despachadas', Valor: Math.round(A.und), 'Periodo anterior': Math.round(B.und), 'Variación %': dl(A.und, B.und) },
      { Indicador: 'Valor despachado ($, sin flete ni IVA)', Valor: Math.round(A.val), 'Periodo anterior': Math.round(B.val), 'Variación %': dl(A.val, B.val) },
      { Indicador: 'Toneladas', Valor: Math.round(A.kg / 10) / 100, 'Periodo anterior': Math.round(B.kg / 10) / 100, 'Variación %': dl(A.kg, B.kg) },
      { Indicador: 'Viajes', Valor: A.viajes, 'Periodo anterior': B.viajes, 'Variación %': dl(A.viajes, B.viajes) },
      { Indicador: 'APs atendidas', Valor: A.aps, 'Periodo anterior': B.aps, 'Variación %': dl(A.aps, B.aps) },
      { Indicador: 'Carga media por viaje (t)', Valor: A.viajes ? Math.round(A.kg / A.viajes / 10) / 100 : '', 'Periodo anterior': B.viajes ? Math.round(B.kg / B.viajes / 10) / 100 : '', 'Variación %': '' },
      { Indicador: 'Tiempo de ciclo medio AP→salida (días)', Valor: A.ltMed == null ? '' : Math.round(A.ltMed * 10) / 10, 'Periodo anterior': B.ltMed == null ? '' : Math.round(B.ltMed * 10) / 10, 'Variación %': '' },
      { Indicador: 'Nivel de servicio (despachado/solicitado %)', Valor: A.fill == null ? '' : Math.round(A.fill * 1000) / 10, 'Periodo anterior': B.fill == null ? '' : Math.round(B.fill * 1000) / 10, 'Variación %': '' },
      { Indicador: 'Novedades por 1.000 unidades', Valor: A.tasaNov == null ? '' : Math.round(A.tasaNov * 10) / 10, 'Periodo anterior': B.tasaNov == null ? '' : Math.round(B.tasaNov * 10) / 10, 'Variación %': '' }], [46, 28, 18, 12]);
    var prodR = rank(A.prod), cv = cvProductos(rg, prodR);
    add('Pareto productos', prodR.map(function (o, i) { var x = cv[o.k]; return { '#': i + 1, Código: o.k, Producto: nombreProd(o.k), Unidades: Math.round(o.und), 'Valor $': Math.round(o.val), Toneladas: Math.round(o.kg / 10) / 100, APs: o.nAps, Viajes: o.nVi, '% del total': Math.round(o.pc * 10) / 10, '% acumulado': Math.round(o.cum * 10) / 10, ABC: o.abc, 'CV semanal %': x ? Math.round(x.cv * 100) : '', XYZ: x ? x.xyz : '' }; }), [5, 9, 44, 10, 14, 10, 6, 7, 10, 11, 5, 11, 5]);
    add('Vehículos', rank(A.veh).map(function (o) { var info = ST.X.veh[o.k], u = info && info.cap > 0 && o.nVi ? Math.round(o.und / o.nVi / info.cap * 100) : ''; return { Placa: o.k, Conductor: info ? info.cond : '', Viajes: o.nVi, Unidades: Math.round(o.und), 'Valor $': Math.round(o.val), Toneladas: Math.round(o.kg / 10) / 100, 't por viaje': o.nVi ? Math.round(o.kg / o.nVi / 10) / 100 : '', 'Utilización % (ref.)': u, 'Días con servicio': Object.keys(o.dias).length }; }), [10, 24, 8, 10, 14, 10, 10, 14, 10]);
    add('Clientes', rank(A.cli).map(function (o) { return { NIT: o.k, Cliente: nombreCli(o.k), Unidades: Math.round(o.und), 'Valor $': Math.round(o.val), Toneladas: Math.round(o.kg / 10) / 100, APs: o.nAps, '%': Math.round(o.pc * 10) / 10 }; }), [14, 44, 10, 14, 10, 6, 6]);
    add('Destinos', rank(A.dest).map(function (o) { return { Destino: o.k, Unidades: Math.round(o.und), 'Valor $': Math.round(o.val), Toneladas: Math.round(o.kg / 10) / 100, APs: o.nAps, Viajes: o.nVi, '%': Math.round(o.pc * 10) / 10 }; }), [30, 10, 14, 10, 6, 7, 6]);
    add('Vendedores', rank(A.ven).map(function (o) { return { Vendedor: nombreVen(o.k), Unidades: Math.round(o.und), 'Valor $': Math.round(o.val), APs: o.nAps, '%': Math.round(o.pc * 10) / 10 }; }), [30, 10, 14, 6, 6]);
    var sr = serie(rg); A.ev.forEach(function (e) { var k = sr.keyOf(e.f); if (sr.b[k]) { sr.b[k].und += e.und; sr.b[k].val += e.val; sr.b[k].kg += e.kg; } });
    add('Tendencia', sr.orden.map(function (k) { var p = sr.b[k]; return { Periodo: k, Unidades: Math.round(p.und), 'Valor $': Math.round(p.val), Toneladas: Math.round(p.kg / 10) / 100 }; }), [14, 10, 14, 10]);
    add('Averías y novedades', rank(A.prod).filter(function (o) { return o.av + o.rep + o.mer > 0; }).map(function (o) { return { Código: o.k, Producto: nombreProd(o.k), Averías: o.av, Reposiciones: o.rep, 'Mermas/segunda': o.mer, 'Por 1.000 und': o.und ? Math.round((o.av + o.rep + o.mer) / o.und * 10000) / 10 : '' }; }), [9, 44, 9, 12, 14, 12]);
    var bk = backlog(); add('APs abiertas (backlog)', bk.L.map(function (l) { return { AP: l.id, Cliente: l.cli, Destino: l.dest, Estado: l.e, 'Días abierta': l.dias, 'Unidades por despachar': Math.round(l.pu), 'Valor por despachar $': Math.round(l.pv) }; }), [8, 40, 22, 18, 12, 20, 22]);
    add('Detalle de despachos', A.ev.map(function (e) { var a = ST.X.ap[e.ap] || {}; return { Fecha: dmy(e.f) + ' ' + ('0' + e.f.getHours()).slice(-2) + ':' + ('0' + e.f.getMinutes()).slice(-2), AP: e.ap, Cliente: nombreCli(a.nit || ''), Destino: a.dest || '', Código: e.tm, Producto: nombreProd(e.tm), Placa: e.pl, Cantidad: Math.round(e.und * 100) / 100, 'Cantidad estimada': e.est ? 'Sí' : '', 'Valor $': Math.round(e.val), Kg: Math.round(e.kg), Averías: e.av, Reposición: e.rep, Merma: e.mer }; }), [18, 8, 36, 22, 9, 40, 10, 10, 10, 14, 9, 8, 10, 8]);
    XLSX.writeFile(wb, 'SIVIL_Estadisticas_Despacho_' + ymd(rg.ini) + '_a_' + ymd(rg.fin) + '.xlsx');
  };

  // Para pruebas y para el Centro de descargas
  E._st = ST; E._cargar = cargar; E._calc = calc; E._rango = rango;
})();
