// =============================================================================
// SIVEL - Sistema Integrado de Ventas, Inventario y Logística
// POSTEC DE OCCIDENTE S.A.S.
// Backend: Google Apps Script (GAS) v1.0
// Arquitectura: GET público para lectura | POST no-cors para escritura
// =============================================================================

const SIVIL_SHEET_ID = "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI";

const HOJAS = {
  PRODUCTOS:   "PRODUCTOS_MAESTRO",
  VENDEDORES:  "VENDEDORES",
  CLIENTES:    "CLIENTES",
  PREVENTAS:   "PREVENTAS_AP",
  DETALLE:     "DETALLE_AP",
  PATIO:       "CONTROL_PATIO_Y_LOGISTICA",
  PRECIOS:     "PRECIOS_GERENCIA",
  VEHICULOS:   "VEHICULOS",
  CONTACTOS:   "CLIENTE_CONTACTOS",
  ENSAMBLES:   "REGISTRO_ENSAMBLES",
  TARIFAS:     "TARIFAS_FLETE",
  NOVEDADES:   "NOVEDADES_LOGISTICA",
  VIAJES:      "VIAJES_COMPARTIDOS",
  FUNCIONARIOS: "FUNCIONARIOS",
  VISITAS: "REGISTRO_VISITAS", APROBACIONES: "APROBACIONES",
  COTIZACIONES: "COTIZACIONES",
};

function doGet(e) {
  const accion = e.parameter.accion || "";
  let resultado;
  try {
    switch (accion) {
      case "getProductos": resultado = getProductos(); break;
          case "getTarifasFlete": resultado = getTarifasFlete(); break;
      case "getViajesCompartidos": resultado = getViajesCompartidos(); break;
      case "getNovedadesLogistica": resultado = getNovedadesLogistica(); break;
      case "resetSistema": resultado = resetSistema(body); break;
      case "getProducto": resultado = getProducto(e.parameter.tmcode); break;
      case "getVendedores": resultado = getVendedores(); break;
      case "getVendedor": resultado = getVendedor(e.parameter.correo); break;
      case "getClientes": resultado = getClientes(e.parameter.vendedor_id); break;
      case "getCliente": resultado = getCliente(e.parameter.nit); break;
      case "buscarCliente": resultado = buscarCliente(e.parameter.q); break;
      case "getPreventas": resultado = getPreventas(e.parameter.vendedor_id, e.parameter.estado); break;
      case "getPreventa": resultado = getPreventa(e.parameter.ap_id); break;
      case "getDetalleAP": resultado = getDetalleAP(e.parameter.ap_id); break;
      case "getInventarioDinamico": resultado = getInventarioDinamico(); break;
      case "getPendientesPorProducto": resultado = getPendientesPorProducto(e.parameter.vendedor_id); break;
      case "getDisponibleProducto": resultado = getDisponibleProducto(e.parameter.tmcode); break;
      case "getDespachos": resultado = getDespachos(e.parameter.ap_id); break;
      case "getCurados": resultado = getCurados(); break;
      case "getPrecios": resultado = getPrecios(e.parameter.tmcode); break;
      case "getDashboard": resultado = getDashboard(); break;
      case "getAlertasProduccion": resultado = getAlertasProduccion(); break;
      case "getPromociones":   resultado = getPromociones(); break;
      case "getConsecutivoAP": resultado = getConsecutivoAP(); break;
      case "getArchivosDriveInventario": resultado = getArchivosDriveInventario(); break;
      case "getFuncionarios": resultado = getFuncionarios(); break;
      case "getCarpetasInformes": resultado = getCarpetasInformes(); break;
      default: resultado = { ok: true, mensaje: "SIVIL API v1.0 activa", timestamp: new Date().toISOString() };
    }
  } catch (err) { resultado = { ok: false, error: err.message }; }
  return ContentService.createTextOutput(JSON.stringify(resultado)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body, accion, resultado;
  try {
    body = JSON.parse(e.postData.contents);
    accion = body.accion || "";
    switch (accion) {
      case "importarProductosMasivo": resultado = importarProductosMasivo(body); break;
      case "importarExistenciasDrive": resultado = importarExistenciasDrive(body); break;
      case "crearVendedor": resultado = crearVendedor(body); break;
      case "actualizarFuncionario": resultado = actualizarFuncionario(body); break;
      case "guardarInformePDF": resultado = guardarInformePDF(body); break;
      case "actualizarVendedor": resultado = actualizarVendedor(body); break;
      case "crearCliente": resultado = crearCliente(body); break;
      case "actualizarCliente": resultado = actualizarCliente(body); break;
      case "recibirLoteDatax": resultado = recibirLoteDatax(body); break;
      case "unificarClientesDatax": resultado = unificarClientesDatax(); break;
      case "cambiarNitCliente": resultado = cambiarNitCliente(body); break;
      case "crearContacto": resultado = crearContacto(body); break;
      case "marcarContactoPrincipal": resultado = marcarContactoPrincipal(body); break;
      case "registrarEnsamble": resultado = registrarEnsamble(body); break;
      case "actualizarContacto": resultado = actualizarContacto(body); break;
      case "eliminarContacto": resultado = eliminarContacto(body); break;
      case "crearPreventa": resultado = crearPreventa(body); break;
      case "guardarCotizacion": resultado = guardarCotizacion(body); break;
      case "cambiarEstadoCotizacion": resultado = cambiarEstadoCotizacion(body); break;
      case "agregarDetalleAP": resultado = agregarDetalleAP(body); break;
      case "actualizarEstadoAP": resultado = actualizarEstadoAP(body); break;
      case "resetSistema": resultado = resetSistema(body); break;
case "anularAPPrueba": resultado = anularOBorrarAPPrueba(body); break;
      case "modificarDetalleAP": resultado = modificarDetalleAP(body); break;
      case "registrarDespacho": resultado = registrarDespacho(body); break;
      case "registrarAveria": resultado = registrarAveria(body); break;
      case "registrarNovedad": resultado = registrarNovedad(body); break;
      case "registrarVisita":
        resultado = registrarVisita(body); break;
      case "registrarNovedadLogistica": resultado = registrarNovedadLogistica(body); break;
      case "actualizarStockMinimo": resultado = actualizarStockMinimo(body); break;
      case "registrarViajeCompartido": resultado = registrarViajeCompartido(body); break;
      case "desagruparViaje": resultado = desagruparViaje(body); break;
      case "crearVehiculo": resultado = crearVehiculo(body); break;
    case "resolverAprobacion": resultado = resolverAprobacion(body); break;
    case "actualizarVehiculo": resultado = actualizarVehiculo(body); break;
    case "eliminarVehiculo": resultado = eliminarVehiculo(body); break;
      case "importarClientesMasivo": resultado = importarClientesMasivo(body); break;
      case "crearPromocion":           resultado = crearPromocion(body); break;
      case "desactivarPromocion":      resultado = desactivarPromocion(body); break;
      case "reservarNumeroAP":         resultado = reservarNumeroAP(body); break;
      case "inicializarConsecutivoAP": resultado = inicializarConsecutivoAP(body); break;
      case "cargarLoteClientes": resultado = cargarLoteClientes(body); break;
      case "registrarCurado": resultado = registrarCurado(body); break;
      case "liberarCurado": resultado = liberarCurado(body); break;
      case "editarCurado": resultado = liberarCurado(body); break;
      case "liberarCuradosVencidos": resultado = liberarCuradosVencidos(body); break;
      case "generarInformeDespacho": resultado = generarInformeDespachoDesdeBody(body); break;
      case "actualizarStock": resultado = actualizarStock(body); break;
      case "crearPrecio": resultado = crearPrecio(body); break;
      case "actualizarPrecio": resultado = actualizarPrecio(body); break;
    case "registrarSuministro": resultado = registrarSuministro(body); break;
    case "guardarReceta": resultado = guardarReceta(body); break;
      default: resultado = { ok: false, error: `Acción desconocida: ${accion}` };
    }
  } catch (err) { resultado = { ok: false, error: err.message }; }
  return ContentService.createTextOutput(JSON.stringify(resultado)).setMimeType(ContentService.MimeType.JSON);
}

function generarInformeDespachoDesdeBody(body) {
  try { const datos = JSON.parse(body.datos); return generarInformeDespacho(datos); }
  catch (err) { return { ok: false, error: "Error generando informe: " + err.message }; }
}

function getHoja(nombre) {
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
  const hoja = ss.getSheetByName(nombre);
  if (!hoja) throw new Error(`Hoja '${nombre}' no encontrada`);
  return hoja;
}

function hojaAObjetos(hoja) {
  const datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return [];
  const headers = datos[0].map(h => String(h).trim());
  return datos.slice(1).filter(fila => fila.some(c => c !== "")).map(fila => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = fila[i] ?? ""; });
    return obj;
  });
}

function siguienteId(hoja, columnaId) {
  const datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return 1;
  const ids = datos.slice(1).map(f => parseInt(f[columnaId]) || 0).filter(n => n > 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function calcularDisponible(tmcode) {
  const hProd = getHoja(HOJAS.PRODUCTOS);
  const prods = hojaAObjetos(hProd);
  const prod = prods.find(p => String(p.tmcode) === String(tmcode));
  if (!prod) return null;
  const stockBruto = parseFloat(prod.tmcant) || 0;
  const stockSegundaBase = parseFloat(prod.stock_segunda) || 0;
  const hPatio = getHoja(HOJAS.PATIO);
  const patios = hojaAObjetos(hPatio).filter(p => String(p.tmcode) === String(tmcode));
  // El curado se separa por calidad (primera/segunda) — aclaración reunión
  // despacho: el curado no es solo de primera, y al liberarse debe sumar al
  // inventario correspondiente según su calidad (ver liberarCurado).
  const enCuradoPrimera = patios.reduce((acc, p) => {
    const esSegunda = String(p.calidad_curado||"").toUpperCase() === "SEGUNDA";
    return acc + (esSegunda ? 0 : (parseFloat(p.cant_en_curado) || 0));
  }, 0);
  const enCuradoSegunda = patios.reduce((acc, p) => {
    const esSegunda = String(p.calidad_curado||"").toUpperCase() === "SEGUNDA";
    return acc + (esSegunda ? (parseFloat(p.cant_en_curado) || 0) : 0);
  }, 0);
  // Lotes en curado vigentes (con fecha de disponibilidad) — para que Despacho
  // sepa, al momento de despachar, si hay más unidades por salir de curado.
  const lotesEnCurado = patios.filter(p => (parseFloat(p.cant_en_curado)||0) > 0).map(p => ({
    cantidad: parseFloat(p.cant_en_curado) || 0,
    calidad: String(p.calidad_curado || "PRIMERA").toUpperCase(),
    fecha_disponible: p.fecha_liberacion_curado || ""
  }));
  const averias = patios.reduce((acc, p) => acc
    + (parseFloat(p.cant_mermas_averias) || 0)
    + (parseFloat(p.cant_averia_cargue) || 0)
    + (parseFloat(p.cant_averia_restribado) || 0)
    + (parseFloat(p.cant_reposicion) || 0), 0);
  const saldosSegunda = patios.reduce((acc, p) => acc + (parseFloat(p.cant_merma_segunda) || 0), 0);
  const hDetalle = getHoja(HOJAS.DETALLE);
  const detalles = hojaAObjetos(hDetalle);
  const hAP = getHoja(HOJAS.PREVENTAS);
  const aps = hojaAObjetos(hAP);
  const apsPendientes = new Set(aps.filter(a => ["Pendiente","Despachado Parcial"].includes(a.estado_ap)).map(a => String(a.ap_id)));
  const comprometido = detalles.filter(d => String(d.tmcode) === String(tmcode) && apsPendientes.has(String(d.ap_id)))
    .reduce((acc, d) => acc + Math.max(0, (parseFloat(d.cantidad_solicitada)||0) - (parseFloat(d.cantidad_despachada)||0)), 0);
  const disponible = stockBruto - enCuradoPrimera - averias - comprometido;
  const disponibleSegunda = stockSegundaBase - enCuradoSegunda;
  return { tmcode, tmdescrip: prod.tmdescrip, tmund: prod.tmund,
    stock_bruto: stockBruto, en_curado: enCuradoPrimera, averias, saldos_segunda: saldosSegunda,
    comprometido, disponible,
    estado_semaforo: disponible > 10 ? "VERDE" : disponible > 0 ? "AMARILLO" : "ROJO",
    stock_segunda_base: stockSegundaBase,
    en_curado_segunda: enCuradoSegunda,
    disponible_segunda: disponibleSegunda,
    lotes_en_curado: lotesEnCurado
  };
}

function getInventarioDinamico() {
  const hProd = getHoja(HOJAS.PRODUCTOS);
  const prods = hojaAObjetos(hProd);
  return { ok: true, data: prods.map(p => calcularDisponible(p.tmcode)).filter(Boolean) };
}

// Vendedores necesitan ver, por producto, cuánto tienen pendiente de
// despachar entre todos sus AP activos — hasta ahora solo Despacho tenía
// esta vista agregada (reunión despacho 08-09/09/2026, audio de sugerencias:
// el reporte de pendientes debe organizarse por producto).
function getPendientesPorProducto(vendedorId) {
  const hAP = getHoja(HOJAS.PREVENTAS);
  const aps = hojaAObjetos(hAP).filter(a =>
    String(a.vendedor_id) === String(vendedorId) &&
    ["Pendiente", "Despachado Parcial"].includes(a.estado_ap)
  );
  const apIds = new Set(aps.map(a => String(a.ap_id)));
  const hDetalle = getHoja(HOJAS.DETALLE);
  const detalles = hojaAObjetos(hDetalle).filter(d => apIds.has(String(d.ap_id)));

  const hProd = getHoja(HOJAS.PRODUCTOS);
  const prods = hojaAObjetos(hProd);

  const porProducto = {};
  detalles.forEach(d => {
    const pendiente = Math.max(0, (parseFloat(d.cantidad_solicitada)||0) - (parseFloat(d.cantidad_despachada)||0));
    if (pendiente <= 0) return;
    const tc = String(d.tmcode);
    if (!porProducto[tc]) {
      const prod = prods.find(p => String(p.tmcode) === tc);
      porProducto[tc] = { tmcode: tc, tmdescrip: prod ? prod.tmdescrip : `Código ${tc}`, tmund: prod ? prod.tmund : '', pendiente: 0, aps: new Set() };
    }
    porProducto[tc].pendiente += pendiente;
    porProducto[tc].aps.add(String(d.ap_id));
  });

  const resultado = Object.values(porProducto).map(p => ({
    tmcode: p.tmcode, tmdescrip: p.tmdescrip, tmund: p.tmund,
    pendiente: p.pendiente, num_aps: p.aps.size, aps: Array.from(p.aps)
  })).sort((a,b) => b.pendiente - a.pendiente);

  return { ok: true, data: resultado };
}

function getDisponibleProducto(tmcode) {
  const d = calcularDisponible(tmcode);
  if (!d) return { ok: false, error: `Producto ${tmcode} no encontrado` };
  return { ok: true, data: d };
}

function getTarifasFlete() {
  return { ok: true, data: hojaAObjetos(getHoja(HOJAS.TARIFAS)) };
}

// ============================================================
// ============================================================
// FUNCIONARIOS (lista compartida para notificaciones WhatsApp)
// ============================================================
function getFuncionarios() {
var hoja = getHoja(HOJAS.FUNCIONARIOS);
return { ok: true, data: hojaAObjetos(hoja) };
}

function actualizarFuncionario(body) {
var hoja = getHoja(HOJAS.FUNCIONARIOS);
var datos = hoja.getDataRange().getValues();
var headers = datos[0].map(function(h){ return String(h).trim(); });
var idxId = headers.indexOf("id");
if (idxId === -1) return { ok: false, error: "La hoja FUNCIONARIOS no tiene columna id." };
var idBuscado = String(body.id || '').trim();
var filaNum = -1;
for (var i = 1; i < datos.length; i++) {
if (String(datos[i][idxId]).trim() === idBuscado) { filaNum = i + 1; break; }
}
var campos = ["nombre", "cargo", "wa", "recibe", "activo", "correo"];
if (filaNum === -1) {
var nuevoId = datos.length;
var nueva = new Array(headers.length).fill('');
nueva[idxId] = body.id || nuevoId;
campos.forEach(function(c){
var idx = headers.indexOf(c);
if (idx !== -1 && body[c] !== undefined) nueva[idx] = body[c];
});
hoja.getRange(hoja.getLastRow() + 1, 1, 1, headers.length).setValues([nueva]);
return { ok: true, creado: true };
}
campos.forEach(function(c){
var idx = headers.indexOf(c);
if (idx !== -1 && body[c] !== undefined) hoja.getRange(filaNum, idx + 1).setValue(body[c]);
});
return { ok: true, actualizado: true };

}// IMPORTAR INVENTARIO DESDE GOOGLE DRIVE (BOD 03 Primeras / BOD 04 Segunda)
// ============================================================
const CARPETA_INVENTARIO_DRIVE_ID = "1RSWLgbEfx6nMnZghVuYhn80veshiliE1";

function _normCode(x) {
var s = String(x || '').trim();
var n = s.replace(/^0+(?=\d)/, '');
return n === '' ? s : n;
}

function _clasificarArchivoInventario(nombre) {
var n = nombre.toUpperCase();
var esPrimeras = /BOD[\s_-]?0?3/.test(n) && /PRIMERA/.test(n);
var esSegunda = /BOD[\s_-]?0?4/.test(n) && /SEGUND/.test(n);
return { esPrimeras: esPrimeras, esSegunda: esSegunda };
}

function getArchivosDriveInventario() {
var folder = DriveApp.getFolderById(CARPETA_INVENTARIO_DRIVE_ID);
var files = folder.getFiles();
var out = [];
while (files.hasNext()) {
var f = files.next();
var clas = _clasificarArchivoInventario(f.getName());
out.push({
id: f.getId(),
nombre: f.getName(),
fecha: f.getLastUpdated().toISOString(),
esPrimeras: clas.esPrimeras,
esSegunda: clas.esSegunda
});
}
return { ok: true, data: out };
}

function _leerExistenciasDeArchivo(fileId) {
var file = DriveApp.getFileById(fileId);
var mime = file.getMimeType();
var ssId = fileId;
var temporal = null;
if (mime !== MimeType.GOOGLE_SHEETS) {
var copiado = Drive.Files.copy({ title: "TEMP_IMPORT_" + fileId, mimeType: MimeType.GOOGLE_SHEETS }, fileId);
ssId = copiado.id;
temporal = ssId;
}
var ss = SpreadsheetApp.openById(ssId);
var hoja = ss.getSheets()[0];
var datos = hoja.getDataRange().getValues();
var headers = datos[0].map(function(h){ return String(h).trim().toLowerCase(); });
var idxCode = headers.indexOf("tmcode");
var idxCant = headers.indexOf("tmcant");
var idxDesc = headers.indexOf("tmdescrip");
var idxUnd = headers.indexOf("tmund");
var filas = [];
for (var i = 1; i < datos.length; i++) {
var f2 = datos[i];
if (!f2[idxCode]) continue;
filas.push({
tmcode: String(f2[idxCode]).trim(),
tmcant: parseFloat(f2[idxCant]) || 0,
tmdescrip: idxDesc >= 0 ? f2[idxDesc] : '',
tmund: idxUnd >= 0 ? f2[idxUnd] : 'UND'
});
}
if (temporal) {
DriveApp.getFileById(temporal).setTrashed(true);
}
return filas;
}

function importarExistenciasDrive(body) {
var folder = DriveApp.getFolderById(CARPETA_INVENTARIO_DRIVE_ID);
var files = folder.getFiles();
var archPrimeras = null, archSegunda = null;
while (files.hasNext()) {
var f = files.next();
var clas = _clasificarArchivoInventario(f.getName());
if (clas.esPrimeras && (!archPrimeras || f.getLastUpdated() > archPrimeras.getLastUpdated())) archPrimeras = f;
if (clas.esSegunda && (!archSegunda || f.getLastUpdated() > archSegunda.getLastUpdated())) archSegunda = f;
}
if (!archPrimeras || !archSegunda) {
return { ok: false, error: "Falta el archivo de Primeras o de Segunda en la carpeta de Drive." };
}

var filasPrimeras = _leerExistenciasDeArchivo(archPrimeras.getId()).map(function(f){
f.calidad = 'PRIMERA'; return f;
});
var filasSegunda = _leerExistenciasDeArchivo(archSegunda.getId()).map(function(f){
f.calidad = 'SEGUNDA'; return f;
});
var todas = filasPrimeras.concat(filasSegunda);

var hoja = getHoja(HOJAS.PRODUCTOS);
var datos = hoja.getDataRange().getValues();
var headers = datos[0].map(function(h){ return String(h).trim(); });
var idxCalidad = headers.indexOf("calidad");
if (idxCalidad === -1) {
idxCalidad = headers.length;
hoja.getRange(1, idxCalidad + 1).setValue("calidad");
headers.push("calidad");
if (datos.length > 1) {
var vals = [];
for (var i = 1; i < datos.length; i++) vals.push(["PRIMERA"]);
hoja.getRange(2, idxCalidad + 1, datos.length - 1, 1).setValues(vals);
}
}
var idxCode = headers.indexOf("tmcode");
var idxCant = headers.indexOf("tmcant");
var idxDesc = headers.indexOf("tmdescrip");
var idxUnd = headers.indexOf("tmund");

var datos2 = hoja.getDataRange().getValues();
var mapaFilas = {};
for (var j = 1; j < datos2.length; j++) {
var code = _normCode(datos2[j][idxCode]);
var cal = String(datos2[j][idxCalidad] || 'PRIMERA').trim().toUpperCase();
if (code) mapaFilas[code + '|' + cal] = j + 1;
}

var actualizados = 0, nuevos = 0;
var filasNuevas = [];
todas.forEach(function(p){
var key = _normCode(p.tmcode) + '|' + p.calidad;
var filaNum = mapaFilas[key];
if (filaNum) {
hoja.getRange(filaNum, idxCant + 1).setValue(p.tmcant);
actualizados++;
} else {
var nueva = new Array(headers.length).fill('');
nueva[idxCode] = p.tmcode;
nueva[idxDesc] = p.tmdescrip;
nueva[idxUnd] = p.tmund || 'UND';
nueva[idxCant] = p.tmcant;
nueva[idxCalidad] = p.calidad;
filasNuevas.push(nueva);
nuevos++;
}
});
if (filasNuevas.length) {
hoja.getRange(hoja.getLastRow() + 1, 1, filasNuevas.length, headers.length).setValues(filasNuevas);
}

return {
ok: true,
primeras: filasPrimeras.length,
segunda: filasSegunda.length,
resumen: { actualizados: actualizados, nuevos: nuevos }
};
}

// ============================================================
// TRIGGER AUTOMATICO - actualizar inventario cuando se agreguen archivos a Drive
// ============================================================
// ============================================================
// GUARDAR INFORMES PDF EN DRIVE (Ventas / Despacho) - para consulta de Gerencia
// ============================================================
function _getOrCrearCarpetaInformes(nombre) {
  var props = PropertiesService.getScriptProperties();
  var key = 'carpeta_informe_' + nombre;
  var id = props.getProperty(key);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch(e) {}
  }
  var folders = DriveApp.getFoldersByName(nombre);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(nombre);
  props.setProperty(key, folder.getId());
  return folder;
}

function getCarpetasInformes() {
  var ventas = _getOrCrearCarpetaInformes('SIVIL - Informes de Ventas');
  var despachos = _getOrCrearCarpetaInformes('SIVIL - Informes de Despacho');
  return { ok: true, ventas: ventas.getUrl(), despachos: despachos.getUrl() };
}

function guardarInformePDF(body) {
  try {
    var nombreCarpeta = (body.tipo === 'despacho') ? 'SIVIL - Informes de Despacho' : 'SIVIL - Informes de Ventas';
    var folder = _getOrCrearCarpetaInformes(nombreCarpeta);
    var bytes = Utilities.base64Decode(body.base64_pdf);
    var nombreArchivo = body.nombre_archivo || ('Informe_' + Date.now() + '.pdf');
    var blob = Utilities.newBlob(bytes, 'application/pdf', nombreArchivo);
    var file = folder.createFile(blob);
    return { ok: true, fileId: file.getId(), url: file.getUrl() };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

function importarExistenciasDriveAuto() {
  try {
    var props = PropertiesService.getScriptProperties();
    var folder = DriveApp.getFolderById(CARPETA_INVENTARIO_DRIVE_ID);
    var files = folder.getFiles();
    var firmas = [];
    while (files.hasNext()) {
      var f = files.next();
      firmas.push(f.getId() + ':' + f.getLastUpdated().getTime());
    }
    firmas.sort();
    var firma = firmas.join('|');
    var firmaAnterior = props.getProperty('inventario_firma_archivos');
    if (!firmas.length || firma === firmaAnterior) return;
    var resultado = importarExistenciasDrive();
    if (resultado && resultado.ok) {
      props.setProperty('inventario_firma_archivos', firma);
    }
  } catch(e) {
    console.error('Error en importarExistenciasDriveAuto: ' + e.message);
  }
}

function configurarTriggerInventarioAuto() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'importarExistenciasDriveAuto') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('importarExistenciasDriveAuto')
    .timeBased()
    .everyHours(2)
    .create();
  return { ok: true, mensaje: 'Trigger automatico configurado: revisa Drive cada 2 horas y actualiza el inventario si hay archivos nuevos.' };
}

function getProductos() {
  var productos = hojaAObjetos(getHoja(HOJAS.PRODUCTOS));
  var precios = getPrecios().data;
  var mapPrecios = {};
  precios.forEach(function(p){ mapPrecios[String(p.tmcode)] = p; });
  var combinados = productos.map(function(prod){
    var pv = mapPrecios[String(prod.tmcode)];
    if (!pv) return prod;
    var out = {};
    for (var k in prod) out[k] = prod[k];
    if (pv.precio_base_planta !== null && pv.precio_base_planta !== "" && pv.precio_base_planta !== undefined) out.precio_base = pv.precio_base_planta;
    if (pv.precio_m2 !== null && pv.precio_m2 !== "" && pv.precio_m2 !== undefined) out.precio_m2 = pv.precio_m2;
    if (pv.descuento_max_vendedor !== null && pv.descuento_max_vendedor !== "" && pv.descuento_max_vendedor !== undefined) out.descuento_max = pv.descuento_max_vendedor;
    return out;
  });
  return { ok: true, data: combinados };
}
function getProducto(tmcode) {
  var todos = getProductos();
  var p = todos.data.find(function(p){ return String(p.tmcode) === String(tmcode); });
  return p ? { ok: true, data: p } : { ok: false, error: "Producto no encontrado" };
}

function actualizarStock(body) {
  const hoja = getHoja(HOJAS.PRODUCTOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colCode = hdrs.indexOf("tmcode"), colCant = hdrs.indexOf("tmcant");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colCode]) === String(body.tmcode)) {
      hoja.getRange(i+1, colCant+1).setValue(body.tmcant);
      return { ok: true, mensaje: `Stock de ${body.tmcode} actualizado a ${body.tmcant}` };
    }
  }
  return { ok: false, error: "Producto no encontrado" };
}

function getVendedores() { return { ok: true, data: hojaAObjetos(getHoja(HOJAS.VENDEDORES)).filter(v => v.estado === "Activo") }; }
function getVendedor(correo) {
  const v = hojaAObjetos(getHoja(HOJAS.VENDEDORES)).find(x => x.correo_usuario === correo);
  return v ? { ok: true, data: v } : { ok: false, error: "Vendedor no encontrado" };
}
function crearVendedor(body) {
  getHoja(HOJAS.VENDEDORES).appendRow([body.id_vendedor, body.nombre_vendedor, body.correo_usuario, body.estado || "Activo"]);
  return { ok: true, mensaje: "Vendedor creado", id: body.id_vendedor };
}
function actualizarVendedor(body) {
  const hoja = getHoja(HOJAS.VENDEDORES);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("id_vendedor");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.id_vendedor)) {
      if (body.nombre_vendedor !== undefined) hoja.getRange(i+1, hdrs.indexOf("nombre_vendedor")+1).setValue(body.nombre_vendedor);
      if (body.correo_usuario  !== undefined) hoja.getRange(i+1, hdrs.indexOf("correo_usuario")+1).setValue(body.correo_usuario);
      if (body.estado          !== undefined) hoja.getRange(i+1, hdrs.indexOf("estado")+1).setValue(body.estado);
      return { ok: true, mensaje: "Vendedor actualizado" };
    }
  }
  return { ok: false, error: "Vendedor no encontrado" };
}

function getClientes(vendedor_id) {
  // Todos los clientes son visibles para todos los vendedores (decisión Gerencia 03/07/2026)
  return { ok: true, data: hojaAObjetos(getHoja(HOJAS.CLIENTES)) };
}
function getCliente(nit) {
  const c = hojaAObjetos(getHoja(HOJAS.CLIENTES)).find(x => String(x.cliente_nit) === String(nit));
  return c ? { ok: true, data: c } : { ok: false, error: "Cliente no encontrado" };
}
function buscarCliente(q) {
  const ql = String(q).toLowerCase();
  const res = hojaAObjetos(getHoja(HOJAS.CLIENTES)).filter(c =>
    String(c.cliente_nit).includes(ql) || String(c.razon_social).toLowerCase().includes(ql));
  return { ok: true, data: res };
}
function crearCliente(body) {
  const check = getCliente(body.cliente_nit);
  if (check.ok) return { ok: false, error: "NIT ya registrado." };
  getHoja(HOJAS.CLIENTES).appendRow([body.cliente_nit, body.razon_social, body.vendedor_asignado, body.coordenadas_home||"" , body.foto_fachada_url||""]);
  return { ok: true, mensaje: "Cliente creado", nit: body.cliente_nit };
}
function actualizarCliente(body) {
  // Blindaje (23/09/2026): versiones viejas de Comercial (antes de la C27)
  // enviaban coordenadas GPS en el campo direccion y borraban la dirección
  // real del cliente. Si llega un par lat,lon como dirección, se ignora.
  if (body && typeof body.direccion === "string" && /^\s*-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+\s*$/.test(body.direccion)) delete body.direccion;
  const hoja = getHoja(HOJAS.CLIENTES);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colNit = hdrs.indexOf("cliente_nit");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colNit]) === String(body.cliente_nit)) {
      if (body.razon_social      !== undefined) hoja.getRange(i+1, hdrs.indexOf("razon_social")+1).setValue(body.razon_social);
      if (body.vendedor_asignado !== undefined) hoja.getRange(i+1, hdrs.indexOf("vendedor_asignado")+1).setValue(body.vendedor_asignado);
      if (body.coordenadas_home  !== undefined) hoja.getRange(i+1, hdrs.indexOf("coordenadas_home")+1).setValue(body.coordenadas_home);
      if (body.foto_fachada_url  !== undefined) hoja.getRange(i+1, hdrs.indexOf("foto_fachada_url")+1).setValue(body.foto_fachada_url);
      if (body.telefono   !== undefined) hoja.getRange(i+1, hdrs.indexOf("telefono")+1).setValue(body.telefono);
      if (body.ciudad     !== undefined) hoja.getRange(i+1, hdrs.indexOf("ciudad")+1).setValue(body.ciudad);
      if (body.direccion  !== undefined) hoja.getRange(i+1, hdrs.indexOf("direccion")+1).setValue(body.direccion);
      return { ok: true, mensaje: "Cliente actualizado" };
    }
  }
  return { ok: false, error: "Cliente no encontrado" };
}

// =============================================================================
// UNIFICACIÓN DE CLIENTES CON BASE DATAX (4301 registros, sep/2026) — pedido
// de la reunión: "unifica los clientes, que quede la posibilidad de edición
// y alimentación del MASTER". La hoja CLIENTES sigue siendo la que prevalece;
// esta rutina la enriquece con datos que faltan y agrega los clientes nuevos
// que aún no existían, sin pisar nunca lo que ya está bien en CLIENTES.
//
// Diseñado para ser REUTILIZABLE ("alimentación" continua del master): la
// próxima vez que llegue una base nueva de DATAX, se repiten los mismos 2
// pasos (recibirLoteDatax en lotes + unificarClientesDatax al final).
// =============================================================================

// Mapa código DATAX (vendedor_b) -> cédula real, usando la misma
// convención ya establecida en la migración anterior de vendedor_asignado.
const MAPA_VENDEDOR_B_CEDULA = {
  "1": { cedula: "31409227", label: "Principal" },   // Gerencia/Nohra
  "2": { cedula: "10243199", label: "Eduardo" },
  "4": { cedula: "1144160845", label: "Juan Fernando" },
  "5": { cedula: "16777882", label: "Felipe" },
  "7": { cedula: "10243199", label: "Eduardo" },
  "11": { cedula: "31434163", label: "Lorena" },
  "13": { cedula: "1193585144", label: "Juan Jose" }
  // códigos 6 ("Sin clasificar") y 14 ("Otros") y cualquier otro no mapeado
  // quedan sin vendedor asignado — igual que la migración anterior.
};

// Recibe un lote de filas de la base DATAX y las guarda en una hoja
// temporal (DATAX_TEMP). Se llama muchas veces seguidas (un lote pequeño
// por llamada) para no exceder límites de tamaño de una sola petición.
// Cada fila: [nit, nombre, ciudad, direccion, telefono, vendedor_b_code]
function recibirLoteDatax(body) {
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
  let hoja = ss.getSheetByName("DATAX_TEMP");
  if (!hoja) {
    hoja = ss.insertSheet("DATAX_TEMP");
    hoja.appendRow(["nit", "nombre", "ciudad", "direccion", "telefono", "vendedor_b"]);
  }
  const filas = body.filas || [];
  if (filas.length > 0) {
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, 6).setValues(filas);
  }
  return { ok: true, mensaje: `${filas.length} filas agregadas a DATAX_TEMP`, totalEnTemp: hoja.getLastRow() - 1 };
}

// Fusión final: recorre DATAX_TEMP, y por cada NIT decide si es un cliente
// nuevo (se agrega a CLIENTES) o ya existe (se completan SOLO los campos
// que estén vacíos — nunca se sobrescribe un dato que el vendedor ya
// cargó o corrigió a mano).
function unificarClientesDatax() {
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
  const hojaTemp = ss.getSheetByName("DATAX_TEMP");
  if (!hojaTemp) return { ok: false, error: "No hay datos en DATAX_TEMP — sube los lotes primero" };
  const datosTemp = hojaTemp.getDataRange().getValues();
  const filasDatax = datosTemp.slice(1); // [nit, nombre, ciudad, direccion, telefono, vendedor_b]

  const hojaCli = ss.getSheetByName(HOJAS.CLIENTES);
  const datosCli = hojaCli.getDataRange().getValues();
  const hdrsCli = datosCli[0].map(h => String(h).trim());
  const colNit = hdrsCli.indexOf("cliente_nit");
  const colRazon = hdrsCli.indexOf("razon_social");
  const colVendAsig = hdrsCli.indexOf("vendedor_asignado");
  const colTel = hdrsCli.indexOf("telefono");
  const colCiudad = hdrsCli.indexOf("ciudad");
  const colVendDatax = hdrsCli.indexOf("vendedor_datax");
  const colDireccion = hdrsCli.indexOf("direccion");

  // Índice NIT -> número de fila real en la hoja (1-based, incluye encabezado)
  const indiceNit = {};
  for (let i = 1; i < datosCli.length; i++) {
    const nit = String(datosCli[i][colNit]).trim();
    if (nit) indiceNit[nit] = i + 1;
  }

  let nuevos = 0, enriquecidos = 0, sinCambio = 0;
  const filasNuevas = [];
  const vistos = new Set(); // evita duplicados dentro del mismo archivo DATAX

  filasDatax.forEach(([nit, nombre, ciudad, direccion, telefono, vb]) => {
    nit = String(nit || "").trim();
    if (!nit || vistos.has(nit)) return;
    vistos.add(nit);

    const filaExistente = indiceNit[nit];
    if (filaExistente) {
      // Cliente ya existe — completar SOLO lo que esté vacío.
      let cambio = false;
      if (telefono && colTel > -1 && !String(hojaCli.getRange(filaExistente, colTel + 1).getValue()).trim()) {
        hojaCli.getRange(filaExistente, colTel + 1).setValue(telefono); cambio = true;
      }
      if (ciudad && colCiudad > -1 && !String(hojaCli.getRange(filaExistente, colCiudad + 1).getValue()).trim()) {
        hojaCli.getRange(filaExistente, colCiudad + 1).setValue(ciudad); cambio = true;
      }
      if (direccion && colDireccion > -1 && !String(hojaCli.getRange(filaExistente, colDireccion + 1).getValue()).trim()) {
        hojaCli.getRange(filaExistente, colDireccion + 1).setValue(direccion); cambio = true;
      }
      if (cambio) enriquecidos++; else sinCambio++;
    } else {
      // Cliente nuevo — se agrega con el vendedor mapeado si el código es conocido.
      const mapeo = MAPA_VENDEDOR_B_CEDULA[String(vb)];
      const fila = [];
      fila[colNit] = nit;
      fila[colRazon] = nombre || `Cliente ${nit}`;
      fila[colVendAsig] = mapeo ? mapeo.cedula : "";
      fila[colTel] = telefono || "";
      fila[colCiudad] = ciudad || "";
      fila[colVendDatax] = mapeo ? mapeo.label : "";
      fila[colDireccion] = direccion || "";
      filasNuevas.push(fila);
      nuevos++;
    }
  });

  if (filasNuevas.length > 0) {
    const numCols = hdrsCli.length;
    const matriz = filasNuevas.map(f => {
      const row = new Array(numCols).fill("");
      for (let c = 0; c < numCols; c++) if (f[c] !== undefined) row[c] = f[c];
      return row;
    });
    hojaCli.getRange(hojaCli.getLastRow() + 1, 1, matriz.length, numCols).setValues(matriz);
  }

  // Limpiar la hoja temporal — ya cumplió su función.
  ss.deleteSheet(hojaTemp);

  return { ok: true, nuevos, enriquecidos, sinCambio, totalProcesados: filasDatax.length };
}
function cambiarNitCliente(body) {
  const nitActual = String(body.cliente_nit_actual || "").trim();
  const nitNuevo  = String(body.cliente_nit_nuevo  || "").trim();
  if (!nitActual) return { ok: false, error: "Falta cliente_nit_actual" };
  if (!nitNuevo)  return { ok: false, error: "Falta cliente_nit_nuevo" };
  if (nitActual === nitNuevo) return { ok: true, mensaje: "NIT sin cambios" };

  const hojaCli = getHoja(HOJAS.CLIENTES);
  const datosCli = hojaCli.getDataRange().getValues();
  const hdrsCli = datosCli[0].map(h => String(h).trim());
  const colNitCli = hdrsCli.indexOf("cliente_nit");

  let filaActual = -1;
  for (let i = 1; i < datosCli.length; i++) {
    const nit = String(datosCli[i][colNitCli]);
    if (nit === nitNuevo) return { ok: false, error: "El NIT nuevo ya esta en uso por otro cliente" };
    if (nit === nitActual) filaActual = i;
  }
  if (filaActual === -1) return { ok: false, error: "Cliente (NIT actual) no encontrado" };

  hojaCli.getRange(filaActual + 1, colNitCli + 1).setValue(nitNuevo);

  const hojasCascada = [HOJAS.PREVENTAS, HOJAS.CONTACTOS, HOJAS.VISITAS];
  const detalle = {};
  hojasCascada.forEach(nombreHoja => {
    const hoja = getHoja(nombreHoja);
    const datos = hoja.getDataRange().getValues();
    const hdrs = datos[0].map(h => String(h).trim());
    const colNit = hdrs.indexOf("cliente_nit");
    if (colNit === -1) return;
    let n = 0;
    for (let i = 1; i < datos.length; i++) {
      if (String(datos[i][colNit]) === nitActual) {
        hoja.getRange(i + 1, colNit + 1).setValue(nitNuevo);
        n++;
      }
    }
    detalle[nombreHoja] = n;
  });

  return { ok: true, mensaje: "NIT actualizado y propagado", detalle: detalle };
}

// =============================================================================
// MODULO: CONTACTOS DE CLIENTE - varios contactos por cliente (NIT, correo,
// telefono, nombre y cargo), pedido por los vendedores en reunion 24/08/2026.
// Hoja separada CLIENTE_CONTACTOS (no se mezcla con CLIENTES) para permitir
// N contactos por cada NIT.
// =============================================================================
function crearContacto(body) {
  if (!body.cliente_nit)     return { ok: false, error: "Falta cliente_nit" };
  if (!body.nombre_contacto) return { ok: false, error: "Falta nombre_contacto" };

  const hoja = getHoja(HOJAS.CONTACTOS);
  const id   = siguienteId(hoja, 0);
  const _datosExist = hoja.getDataRange().getValues();
  const _yaTieneContactos = _datosExist.slice(1).some(function(r){ return String(r[1]) === String(body.cliente_nit); });
  const esPrincipal = !_yaTieneContactos;
  hoja.appendRow([
    id,
    body.cliente_nit,
    body.nombre_contacto,
    body.cargo    || "",
    body.telefono || "",
    body.correo   || "",
    new Date(),
    body.vendedor_registro || "",
    esPrincipal
  ]);
  return { ok: true, mensaje: "Contacto creado", id_contacto: id };
}

function marcarContactoPrincipal(body) {
  if (!body.id_contacto || !body.cliente_nit) return { ok: false, error: "Faltan datos (id_contacto, cliente_nit)" };
  const hoja = getHoja(HOJAS.CONTACTOS);
  const datos = hoja.getDataRange().getValues();
  const headers = datos[0];
  const colPrincipal = headers.indexOf("es_principal");
  if (colPrincipal === -1) return { ok: false, error: "Falta la columna es_principal" };
  let encontrado = false;
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][1]) === String(body.cliente_nit)) {
      const esEste = String(datos[i][0]) === String(body.id_contacto);
      hoja.getRange(i + 1, colPrincipal + 1).setValue(esEste);
      if (esEste) encontrado = true;
    }
  }
  if (!encontrado) return { ok: false, error: "Contacto no encontrado para ese cliente" };
  return { ok: true };
}

// =============================================================================
// ENSAMBLES — reunión de ventas/despacho: la columna "ensambles" en
// PRODUCTOS_MAESTRO es un ACUMULADO histórico (nunca se reinicia). Cada
// registro diario desde Despacho suma a ese total y además queda en
// REGISTRO_ENSAMBLES como historial/trazabilidad.
// =============================================================================
function registrarEnsamble(body) {
  if (!body.tmcode) return { ok: false, error: "Falta tmcode" };
  const cantidad = Number(body.cantidad);
  if (!cantidad || cantidad <= 0) return { ok: false, error: "Cantidad inválida" };

  const hojaProd = getHoja(HOJAS.PRODUCTOS);
  const datosProd = hojaProd.getDataRange().getValues();
  const hdrsProd = datosProd[0].map(h => String(h).trim());
  const colTmcode = hdrsProd.indexOf("tmcode");
  const colDescrip = hdrsProd.indexOf("tmdescrip");
  const colEnsambles = hdrsProd.indexOf("ensambles");
  if (colTmcode === -1 || colEnsambles === -1) {
    return { ok: false, error: "Falta la columna ensambles en PRODUCTOS_MAESTRO" };
  }

  let filaProd = -1, descripcion = "";
  for (let i = 1; i < datosProd.length; i++) {
    if (String(datosProd[i][colTmcode]) === String(body.tmcode)) {
      filaProd = i;
      descripcion = datosProd[i][colDescrip] || "";
      break;
    }
  }
  if (filaProd === -1) return { ok: false, error: "Producto no encontrado" };

  const totalActual = Number(datosProd[filaProd][colEnsambles]) || 0;
  const nuevoTotal = totalActual + cantidad;
  hojaProd.getRange(filaProd + 1, colEnsambles + 1).setValue(nuevoTotal);

  // Historial en REGISTRO_ENSAMBLES para trazabilidad.
  const hojaReg = getHoja(HOJAS.ENSAMBLES);
  const id = siguienteId(hojaReg, 0);
  hojaReg.appendRow([id, new Date(), body.tmcode, descripcion, cantidad, body.registrado_por || ""]);

  return { ok: true, mensaje: "Ensamble registrado", nuevo_total: nuevoTotal };
}

function actualizarContacto(body) {
  const hoja  = getHoja(HOJAS.CONTACTOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("id_contacto");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.id_contacto)) {
      if (body.nombre_contacto !== undefined) hoja.getRange(i+1, hdrs.indexOf("nombre_contacto")+1).setValue(body.nombre_contacto);
      if (body.cargo           !== undefined) hoja.getRange(i+1, hdrs.indexOf("cargo")+1).setValue(body.cargo);
      if (body.telefono        !== undefined) hoja.getRange(i+1, hdrs.indexOf("telefono")+1).setValue(body.telefono);
      if (body.correo          !== undefined) hoja.getRange(i+1, hdrs.indexOf("correo")+1).setValue(body.correo);
      return { ok: true, mensaje: "Contacto actualizado" };
    }
  }
  return { ok: false, error: "Contacto no encontrado" };
}

function eliminarContacto(body) {
  const hoja  = getHoja(HOJAS.CONTACTOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("id_contacto");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.id_contacto)) {
      hoja.deleteRow(i+1);
      return { ok: true, mensaje: "Contacto eliminado" };
    }
  }
  return { ok: false, error: "Contacto no encontrado" };
}

function getPreventas(vendedor_id, estado) {
  let res = hojaAObjetos(getHoja(HOJAS.PREVENTAS));
  if (vendedor_id) res = res.filter(a => String(a.vendedor_id) === String(vendedor_id));
  if (estado) res = res.filter(a => a.estado_ap === estado);
  return { ok: true, data: res };
}
function getPreventa(ap_id) {
  const ap = hojaAObjetos(getHoja(HOJAS.PREVENTAS)).find(a => String(a.ap_id) === String(ap_id));
  if (!ap) return { ok: false, error: "AP no encontrada" };
  return { ok: true, data: { ...ap, detalle: getDetalleAP(ap_id).data } };
}
function crearPreventa(body) {
  const hoja = getHoja(HOJAS.PREVENTAS);
  let ap_id;
  if (body.ap_manual) {
    ap_id = parseInt(body.ap_manual);
    if (!ap_id || ap_id < 1) {
      return { ok: false, error: "Numero de AP invalido" };
    }
    const datosExist = hoja.getDataRange().getValues();
    for (let i = 1; i < datosExist.length; i++) {
      if (String(datosExist[i][0]) === String(ap_id) && datosExist[i][5] !== "Cancelado") {
        return { ok: false, error: "AP #" + ap_id + " ya existe y esta activa. Verifica el numero." };
      }
    }
  } else {
    ap_id = body.modo_prueba === true ? siguienteConsecutivoPrueba() : siguienteId(hoja, 0);
  }
  hoja.appendRow([
    ap_id,
    body.cliente_nit,
    body.vendedor_id,
    new Date(),
    body.tipo_entrega||"Venta en Planta",
    "Pendiente",
    body.destino||"",
    body.flete_valor||0,
    body.orden_compra_cliente||"",
    body.cotizacion_ref||"",
    body.condiciones_pago||"",
    body.nombre_obra||"",
    body.flete_sugerido||0,
    body.transportista_flete||"",
    body.flete_negociado === true,
    body.plan_entregas||"",
    body.flete_incorporado === true,
    body.flete_contra_entrega === true,
    "",
    "",
    body.es_apoyo === true,
    body.creado_por_apoyo || ""
  ]);
  try { _setCamposExtraAP(hoja, hoja.getLastRow(), body); } catch (e) {}
  if (body.detalle && Array.isArray(body.detalle)) body.detalle.forEach(d => agregarDetalleAP({ ap_id, ...d }));
  return { ok: true, mensaje: "AP creada", ap_id };
}
function actualizarEstadoAP(body) {
  const hoja = getHoja(HOJAS.PREVENTAS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("ap_id"), colEst = hdrs.indexOf("estado_ap");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.ap_id)) {
      if (body.estado_ap !== undefined) hoja.getRange(i+1, colEst+1).setValue(body.estado_ap);
      if (body.detalle_flete_despacho !== undefined) {
        let colDF = hdrs.indexOf("detalle_flete_despacho");
        if (colDF === -1) { hoja.getRange(1, hdrs.length+1).setValue("detalle_flete_despacho"); colDF = hdrs.length + 1; }
        else colDF = colDF + 1;
        hoja.getRange(i+1, colDF).setValue(body.detalle_flete_despacho);
      }
      // Cargue manual — reportado por Valentina: antes se capturaba en el
      // formulario de despacho pero nunca quedaba guardado en ningún lado.
      if (body.cargue_manual_requerido !== undefined) {
        const colCMR = hdrs.indexOf("cargue_manual_requerido");
        if (colCMR > -1) hoja.getRange(i+1, colCMR+1).setValue(body.cargue_manual_requerido);
      }
      if (body.cargue_manual_fecha !== undefined) {
        const colCMF = hdrs.indexOf("cargue_manual_fecha");
        if (colCMF > -1) hoja.getRange(i+1, colCMF+1).setValue(body.cargue_manual_fecha);
      }
      if (body.cargue_manual_nota !== undefined) {
        const colCMN = hdrs.indexOf("cargue_manual_nota");
        if (colCMN > -1) hoja.getRange(i+1, colCMN+1).setValue(body.cargue_manual_nota);
      }
      return { ok: true, mensaje: `AP ${body.ap_id} → ${body.estado_ap||"(sin cambio de estado)"}` };
    }
  }
  return { ok: false, error: "AP no encontrada" };
}
function getDetalleAP(ap_id) {
  return { ok: true, data: hojaAObjetos(getHoja(HOJAS.DETALLE)).filter(d => String(d.ap_id) === String(ap_id)) };
}
function agregarDetalleAP(body) {
  const hoja = getHoja(HOJAS.DETALLE);
  const detalle_id = siguienteId(hoja, 0);
  const precioCheck = validarDescuento(body.tmcode, body.descuento_aplicado||0);
  const hdrsRow = hoja.getRange(1,1,1,Math.max(hoja.getLastColumn(),1)).getValues()[0].map(h=>String(h).trim());
  function asegurarCol(nombre){
    let idx = hdrsRow.indexOf(nombre);
    if (idx === -1) { hoja.getRange(1, hdrsRow.length+1).setValue(nombre); hdrsRow.push(nombre); idx = hdrsRow.length-1; }
    return idx+1;
  }
  const colCalidad = asegurarCol("calidad");
  const colPrecioBase = asegurarCol("precio_base");
  const colEstiba = asegurarCol("valor_estiba");
  const colPostes = asegurarCol("valor_postes");
  // Datos de cada producto tal como se negociaron (9 oct 2026): tipo de IVA y valores
  const extraDet = ["tipo_iva","precio_con_descuento","valor_linea","iva_linea","total_linea","flete_unitario"];
  const colsExtra = extraDet.map(asegurarCol);
  hoja.appendRow([detalle_id, body.ap_id, body.tmcode, body.cantidad_solicitada, body.cantidad_despachada||0, body.descuento_aplicado||0]);
  const filaNueva = hoja.getLastRow();
  hoja.getRange(filaNueva, colCalidad).setValue(body.calidad||"PRIMERA");
  hoja.getRange(filaNueva, colPrecioBase).setValue(body.precio_base||0);
  hoja.getRange(filaNueva, colEstiba).setValue(body.valor_estiba||0);
  hoja.getRange(filaNueva, colPostes).setValue(body.valor_postes||0);
  extraDet.forEach(function (k, ix) { if (body[k] !== undefined && body[k] !== null && body[k] !== '') hoja.getRange(filaNueva, colsExtra[ix]).setValue(body[k]); });
  if (precioCheck.excede_referencia) {
    try {
      const apRow = hojaAObjetos(getHoja(HOJAS.PREVENTAS)).find(a => String(a.ap_id) === String(body.ap_id));
      const vend = apRow ? hojaAObjetos(getHoja(HOJAS.VENDEDORES)).find(v => String(v.id_vendedor) === String(apRow.vendedor_id)) : null;
      const cli = apRow ? hojaAObjetos(getHoja(HOJAS.CLIENTES)).find(c => String(c.cliente_nit) === String(apRow.cliente_nit)) : null;
      const prod = hojaAObjetos(getHoja(HOJAS.PRODUCTOS)).find(p => String(p.tmcode) === String(body.tmcode));
      let hojaAprob;
      try { hojaAprob = getHoja(HOJAS.APROBACIONES); }
      catch (eHoja) {
        const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
        hojaAprob = ss.insertSheet(HOJAS.APROBACIONES);
        hojaAprob.appendRow(["id","ap_id","detalle_id","tmcode","producto_nombre","vendedor","cliente","descuento","desc_max","estado","fecha","resuelto_por","fecha_resolucion"]);
      }
      const idAprob = siguienteId(hojaAprob, 0);
      hojaAprob.appendRow([
        idAprob, body.ap_id, detalle_id, body.tmcode,
        prod ? prod.tmdescrip : body.tmcode,
        vend ? vend.nombre_vendedor : (apRow ? apRow.vendedor_id : ""),
        cli ? cli.razon_social : (apRow ? apRow.cliente_nit : ""),
        body.descuento_aplicado||0, precioCheck.referencia_historica||0,
        "pendiente", new Date(), "", ""
      ]);
    } catch (errAprob) {
      // No bloquear el guardado del pedido si falla el registro de la aprobación
    }
  }
  return { ok: true, mensaje: "Línea agregada", detalle_id, excede_referencia: precioCheck.excede_referencia||false, referencia_historica: precioCheck.referencia_historica||0 };
}

function resolverAprobacion(body) {
  const hoja = getHoja(HOJAS.APROBACIONES);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("id");
  const colEstado = hdrs.indexOf("estado");
  const colResueltoPor = hdrs.indexOf("resuelto_por");
  const colFechaRes = hdrs.indexOf("fecha_resolucion");
  const colApId = hdrs.indexOf("ap_id");
  const colDetalleId = hdrs.indexOf("detalle_id");
  const colDescMax = hdrs.indexOf("desc_max");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.id)) {
      hoja.getRange(i+1, colEstado+1).setValue(body.decision);
      hoja.getRange(i+1, colResueltoPor+1).setValue(body.resuelto_por||"Gerencia");
      hoja.getRange(i+1, colFechaRes+1).setValue(new Date());
      if (body.decision === "rechazada") {
        modificarDetalleAP({ ap_id: datos[i][colApId], detalle_id: datos[i][colDetalleId], descuento_aplicado: parseFloat(datos[i][colDescMax])||0 });
      }
      return { ok: true, mensaje: "Aprobacion " + body.decision };
    }
  }
  return { ok: false, error: "Solicitud no encontrada" };
}
function modificarDetalleAP(body) {
  const hoja = getHoja(HOJAS.DETALLE);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("detalle_id");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.detalle_id)) {
      if (body.cantidad_solicitada !== undefined) hoja.getRange(i+1, hdrs.indexOf("cantidad_solicitada")+1).setValue(body.cantidad_solicitada);
      if (body.descuento_aplicado !== undefined) {
        hoja.getRange(i+1, hdrs.indexOf("descuento_aplicado")+1).setValue(body.descuento_aplicado);
      }
      actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Modificado" });
      return { ok: true, mensaje: "Línea modificada" };
    }
  }
  return { ok: false, error: "Detalle no encontrado" };
}

function getPrecios(tmcode) {
  const hoy = new Date();
  const vigentes = hojaAObjetos(getHoja(HOJAS.PRECIOS)).filter(p => {
    const ini = p.fecha_vigencia_inicio ? new Date(p.fecha_vigencia_inicio) : new Date(0);
    const fin = p.fecha_vigencia_fin ? new Date(p.fecha_vigencia_fin) : new Date("2099-12-31");
    return hoy >= ini && hoy <= fin && (!tmcode || String(p.tmcode) === String(tmcode));
  });
  return { ok: true, data: vigentes };
}
function validarDescuento(tmcode, descuento) {
  const precios = getPrecios(tmcode);
  if (!precios.ok || precios.data.length === 0) return { ok: true };
  const maxDesc = parseFloat(precios.data[0].descuento_max_vendedor) || 0;
  const excede = parseFloat(descuento) > maxDesc;
  return { ok: true, excede_referencia: excede, referencia_historica: maxDesc };
}
function crearPrecio(body) {
  const hoja = getHoja(HOJAS.PRECIOS);
  const id = siguienteId(hoja, 0);
  hoja.appendRow([id, body.tmcode, body.precio_base_planta, body.descuento_max_vendedor, body.costo_flete_unidad_zonaA||0, body.costo_flete_unidad_zonaB||0, body.fecha_vigencia_inicio||"", body.fecha_vigencia_fin||""]);
  return { ok: true, mensaje: "Precio creado", id_precio: id };
}
function actualizarPrecio(body) {
  const hoja = getHoja(HOJAS.PRECIOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("id_precio");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.id_precio)) {
      ["precio_base_planta","descuento_max_vendedor","costo_flete_unidad_zonaA","costo_flete_unidad_zonaB","precio_m2","fecha_vigencia_inicio","fecha_vigencia_fin"]
        .forEach(campo => { if (body[campo] !== undefined) hoja.getRange(i+1, hdrs.indexOf(campo)+1).setValue(body[campo]); });
      return { ok: true, mensaje: "Precio actualizado" };
    }
  }
  return { ok: false, error: "Precio no encontrado" };
}

function registrarDespacho(body) {
  const hoja = getHoja(HOJAS.PATIO);
  const despacho_id = siguienteId(hoja, 0);
  const cantReal = parseFloat(body.cant_real_cargada) || 0;
  hoja.appendRow([despacho_id, body.ap_id, body.tmcode||"", 0, "", 0, body.placa_vehiculo||"", body.evidencia_carga_url||"", new Date()]);
  // Cantidad real cargada en ESTE viaje (23/09/2026): antes solo se guardaba
  // el acumulado en DETALLE_AP, y Comercial no podía mostrar cuánto salió en
  // cada entrega. Se escribe por nombre de encabezado (se crea si no existe).
  try {
    const hdrsP = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(h => String(h).trim());
    let colV = hdrsP.indexOf("cant_despachada_viaje");
    if (colV < 0) { colV = hdrsP.length; hoja.getRange(1, colV + 1).setValue("cant_despachada_viaje"); }
    hoja.getRange(hoja.getLastRow(), colV + 1).setValue(cantReal);
  } catch (eViaje) { Logger.log("cant_despachada_viaje: " + eViaje.message); }
  if (body.detalle_id && cantReal > 0) actualizarCantDespachada(body.detalle_id, body.ap_id, cantReal);
  const cantSol = parseFloat(body.cantidad_solicitada) || 0;
  const saldo = cantSol - cantReal;
  if (saldo > 0) {
    actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Despachado Parcial" });
    return { ok: true, mensaje: `Saldo pendiente: ${saldo}`, despacho_id, saldo, estado_ap: "Despachado Parcial" };
  }
  actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Despachado Total" });
  return { ok: true, mensaje: "Despacho total", despacho_id, saldo: 0, estado_ap: "Despachado Total" };
}
function actualizarCantDespachada(detalle_id, ap_id, cantDespachada) {
  const hoja = getHoja(HOJAS.DETALLE);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("detalle_id"), colD = hdrs.indexOf("cantidad_despachada");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(detalle_id)) {
      hoja.getRange(i+1, colD+1).setValue((parseFloat(datos[i][colD])||0) + cantDespachada);
      return;
    }
  }
}

function registrarAveria(body) { return registrarNovedad({ ...body, categoria: "cargue" }); }
const COLUMNA_POR_CATEGORIA = { cargue: "cant_averia_cargue", restribado: "cant_averia_restribado", reposicion: "cant_reposicion", merma_segunda: "cant_merma_segunda" };
function registrarNovedad(body) {
  const categoria = body.categoria || "cargue";
  const colNombre = COLUMNA_POR_CATEGORIA[categoria];
  if (!colNombre) return { ok: false, error: "Categoría no reconocida: " + categoria };
  const hoja = getHoja(HOJAS.PATIO);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colAp = hdrs.indexOf("ap_id");
  const colTmcode = hdrs.indexOf("tmcode");
  const colDespachoId = hdrs.indexOf("despacho_id");
  const colFechaReg = hdrs.indexOf("fecha_registro");
  let colCat = hdrs.indexOf(colNombre);
  if (colCat === -1) { colCat = hdrs.length; hoja.getRange(1, colCat+1).setValue(colNombre); }
  const cantidad = parseFloat(body.cantidad ?? body.cant_averias) || 0;
  const etiquetas = { cargue: "Avería por cargue", restribado: "Avería por restribado", reposicion: "Reposición (cortesía)", merma_segunda: "Merma / saldo de segunda" };

  // Si viene una AP y ya existe una fila de esa AP, se acumula ahí (permite
  // varias novedades de la misma AP en un solo registro). Si la AP viene
  // vacía (es "opcional" en el formulario) o no hay ninguna fila con ese
  // ap_id, se crea un registro nuevo — ANTES esto fallaba silenciosamente
  // con "Despacho no encontrado" mientras el frontend mostraba éxito de
  // todas formas, así que ninguna novedad sin AP asociada llegaba a
  // guardarse (reportado por Valentina: registraba una reposición y nunca
  // aparecía en ningún lado, ni en Despacho ni en Gerencia).
  if (body.ap_id) {
    for (let i = 1; i < datos.length; i++) {
      if (String(datos[i][colAp]) === String(body.ap_id)) {
        hoja.getRange(i+1, colCat+1).setValue((parseFloat(datos[i][colCat])||0) + cantidad);
        if (categoria !== "merma_segunda") actualizarStock({ tmcode: body.tmcode, tmcant: obtenerStockBruto(body.tmcode) - cantidad });
        return { ok: true, mensaje: `${etiquetas[categoria]}: ${cantidad} unidades` };
      }
    }
  }

  const numCols = hdrs.length;
  const fila = new Array(numCols).fill("");
  if (colDespachoId > -1) {
    const maxId = datos.slice(1).reduce((m,r) => Math.max(m, parseFloat(r[colDespachoId])||0), 0);
    fila[colDespachoId] = maxId + 1;
  }
  if (colAp > -1) fila[colAp] = body.ap_id || "";
  if (colTmcode > -1) fila[colTmcode] = body.tmcode || "";
  if (colFechaReg > -1) fila[colFechaReg] = new Date();
  fila[colCat] = cantidad;
  hoja.getRange(hoja.getLastRow()+1, 1, 1, numCols).setValues([fila]);
  if (categoria !== "merma_segunda") actualizarStock({ tmcode: body.tmcode, tmcant: obtenerStockBruto(body.tmcode) - cantidad });
  return { ok: true, mensaje: `${etiquetas[categoria]}: ${cantidad} unidades` };
}

function registrarVisita(body) {
  const hoja = getHoja(HOJAS.VISITAS);
  const id = siguienteId(hoja, 0);
  hoja.appendRow([
    id,
    new Date(),
    body.id_vendedor || "",
    body.nombre_vendedor || "",
    body.cliente_nit || "",
    body.razon_social || "",
    body.canal || "",
    body.gps || "",
    body.contacto_nombre || "",
    body.contacto_cel || "",
    body.notas || "",
    body.num_fotos || 0,
    body.num_archivos || 0
  ]);
  return { ok: true, mensaje: "Visita registrada", visita_id: id };
}

function registrarNovedadLogistica(body) {
  const categoria = body.categoria || "";
  const etiquetas = {
    transporte_varado: "Transporte varado",
    logistica_cancelada: "Logistica cancelada por el cliente",
    regresado_patio: "Producto regresado al patio",
    incidencia_entrega: "Incidencia directa en la entrega"
  };
  if (!etiquetas[categoria]) return { ok: false, error: "Categoria no reconocida: " + categoria };
  const hoja = getHoja(HOJAS.NOVEDADES);
  const id = siguienteId(hoja, 0);
  hoja.appendRow([
    id,
    new Date(),
    body.ap_id || "",
    categoria,
    etiquetas[categoria],
    body.descripcion || "",
    body.usuario || "",
    body.placa_vehiculo || ""
  ]);
  return { ok: true, mensaje: etiquetas[categoria] + " registrada" };
}

function actualizarStockMinimo(body) {
  const tmcode = String(body.tmcode || "").trim();
  if (!tmcode) return { ok: false, error: "tmcode requerido" };
  const stockMinimo = parseFloat(body.stock_minimo);
  if (isNaN(stockMinimo) || stockMinimo < 0) return { ok: false, error: "stock_minimo invalido" };
  const hoja = getHoja(HOJAS.PRODUCTOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colCode = hdrs.indexOf("tmcode");
  let colMin = hdrs.indexOf("stock_minimo");
  if (colMin === -1) { colMin = hdrs.length; hoja.getRange(1, colMin + 1).setValue("stock_minimo"); }
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colCode]) === tmcode) {
      hoja.getRange(i + 1, colMin + 1).setValue(stockMinimo);
      return { ok: true, mensaje: "Stock minimo actualizado para " + tmcode };
    }
  }
  return { ok: false, error: "Producto no encontrado: " + tmcode };
}

function registrarViajeCompartido(body) {
  const apIds = (Array.isArray(body.ap_ids) ? body.ap_ids : String(body.ap_ids||'').split(',')).map(x => String(x).trim()).filter(Boolean);
  if (apIds.length < 2) return { ok:false, error: 'Se requieren al menos 2 pedidos para un viaje compartido' };

  const hoja = getHoja(HOJAS.PREVENTAS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colApId    = hdrs.indexOf('ap_id');
  const colEstado  = hdrs.indexOf('estado_ap');
  const colDestino = hdrs.indexOf('destino');
  let colViaje = hdrs.indexOf('viaje_compartido_id');
  if (colViaje === -1) { colViaje = hdrs.length; hoja.getRange(1, colViaje+1).setValue('viaje_compartido_id'); }

  const filas = [];
  let destinoComun = null;
  for (const apId of apIds) {
    let encontrado = false;
    for (let i = 1; i < datos.length; i++) {
      if (String(datos[i][colApId]) === apId) {
        encontrado = true;
        const estado = datos[i][colEstado];
        if (estado !== 'Pendiente' && estado !== 'Despachado Parcial') {
          return { ok:false, error: 'AP #' + apId + ' no esta pendiente (estado: ' + estado + ')' };
        }
        const viajeActual = datos[i][colViaje];
        if (viajeActual) {
          return { ok:false, error: 'AP #' + apId + ' ya pertenece al viaje ' + viajeActual };
        }
        const destino = datos[i][colDestino] || '';
        if (destinoComun === null) destinoComun = destino;
        else if (destino !== destinoComun) {
          return { ok:false, error: 'Los pedidos deben tener el mismo destino/zona (AP #' + apId + ' es "' + destino + '", esperado "' + destinoComun + '")' };
        }
        filas.push(i);
        break;
      }
    }
    if (!encontrado) return { ok:false, error: 'AP #' + apId + ' no encontrada' };
  }

  const viajeId = 'VJ' + new Date().getTime();
  filas.forEach(i => hoja.getRange(i+1, colViaje+1).setValue(viajeId));

  const hojaViajes = getHoja(HOJAS.VIAJES);
  hojaViajes.appendRow([viajeId, new Date(), destinoComun, apIds.join(', '), body.placa_vehiculo||'', body.notas||'', body.usuario||'']);

  return { ok:true, viaje_id: viajeId, mensaje: 'Viaje compartido registrado con ' + apIds.length + ' pedidos' };
}

function desagruparViaje(body) {
  const viajeId = String(body.viaje_id||'').trim();
  if (!viajeId) return { ok:false, error: 'viaje_id requerido' };
  const hoja = getHoja(HOJAS.PREVENTAS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colViaje = hdrs.indexOf('viaje_compartido_id');
  if (colViaje === -1) return { ok:false, error: 'Columna viaje_compartido_id no existe' };
  let n = 0;
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colViaje]) === viajeId) {
      hoja.getRange(i+1, colViaje+1).setValue('');
      n++;
    }
  }
  return { ok:true, mensaje: 'Viaje ' + viajeId + ' desagrupado (' + n + ' pedidos liberados)' };
}

function getViajesCompartidos() {
  const hoja = getHoja(HOJAS.VIAJES);
  return hojaAObjetos(hoja);
}


function getNovedadesLogistica() {
  const hoja = getHoja(HOJAS.NOVEDADES);
  return hojaAObjetos(hoja);
}

function crearVehiculo(body) {
  const hoja = getHoja(HOJAS.VEHICULOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colPlaca = hdrs.indexOf("placa");
  const placa = String(body.placa || "").trim().toUpperCase();
  if (!placa) return { ok: false, error: "Placa requerida" };
  const fila = [body.vehiculo_id||Date.now(), placa, body.marca||"", body.modelo||"", body.color||"", body.capacidad_und||"", body.conductor_nombre||"", body.conductor_cel||"", body.conductor_cc||"", body.estado||"Activo", body.notas||""];
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colPlaca]).trim().toUpperCase() === placa) {
      hoja.getRange(i+1, 1, 1, fila.length).setValues([fila]);
      return { ok: true, mensaje: `Vehículo ${placa} actualizado` };
    }
  }
  hoja.appendRow(fila);
  return { ok: true, mensaje: `Vehículo ${placa} agregado` };
}
function actualizarVehiculo(body) {
  const hoja = getHoja(HOJAS.VEHICULOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("vehiculo_id");
  const colPlacaOriginal = hdrs.indexOf("placa");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.vehiculo_id)) {
      const placa = String(body.placa || datos[i][colPlacaOriginal] || "").trim().toUpperCase();
      const fila = [body.vehiculo_id, placa, body.marca||"", body.modelo||"", body.color||"", body.capacidad_und||"", body.conductor_nombre||"", body.conductor_cel||"", body.conductor_cc||"", body.estado||"Activo", body.notas||""];
      hoja.getRange(i+1, 1, 1, fila.length).setValues([fila]);
      return { ok: true, mensaje: `Vehículo ${placa} actualizado` };
    }
  }
  return { ok: false, error: "Vehículo no encontrado" };
}

function eliminarVehiculo(body) {
  const hoja = getHoja(HOJAS.VEHICULOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("vehiculo_id");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.vehiculo_id)) {
      hoja.deleteRow(i+1);
      return { ok: true, mensaje: "Vehículo eliminado" };
    }
  }
  return { ok: false, error: "Vehículo no encontrado" };
}

function cargarLoteClientes(body) {
  const hoja = getHoja(HOJAS.CLIENTES);
  const datos = body.datos;
  if (!Array.isArray(datos) || datos.length === 0) return { ok: false, error: "Sin datos" };
  const startRow = body.start_row || 2;
  hoja.getRange(startRow, 1, datos.length, datos[0].length).setValues(datos);
  SpreadsheetApp.flush();
  return { ok: true, mensaje: "Lote cargado: " + datos.length + " clientes desde fila " + startRow };
}

// Suma unidades liberadas de curado al inventario correspondiente según su
// calidad — aclaración reunión despacho: el curado no es solo de primera, y
// al liberarse debe reflejarse como MÁS producto disponible (antes solo se
// dejaba de restar, pero nunca se sumaba realmente al stock).
function _sumarStockPorCurado(tmcode, cantidad, calidad) {
  if (!tmcode || !cantidad) return;
  const hoja = getHoja(HOJAS.PRODUCTOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colTmcode = hdrs.indexOf("tmcode");
  const colCalidad = hdrs.indexOf("calidad");
  const colTmcant = hdrs.indexOf("tmcant");
  if (colTmcode === -1 || colTmcant === -1) return;
  const calidadBuscada = String(calidad || "PRIMERA").toUpperCase();
  // PRODUCTOS_MAESTRO tiene una fila POR CALIDAD para cada tmcode (una fila
  // PRIMERA y otra SEGUNDA, cada una con su propio tmcant) — descubierto al
  // revisar por qué el inventario mostraba cantidades negativas en SEGUNDA
  // tras liberar curado (el sistema anterior sumaba a una columna nueva que
  // ninguna pantalla real lee). Ahora se busca la fila EXACTA por tmcode +
  // calidad; si no existe esa combinación, se cae a la primera fila con ese
  // tmcode como respaldo (para no perder la actualización silenciosamente).
  let filaExacta = -1, filaCualquiera = -1;
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colTmcode]) === String(tmcode)) {
      if (filaCualquiera === -1) filaCualquiera = i;
      const calFila = colCalidad > -1 ? String(datos[i][colCalidad] || "PRIMERA").toUpperCase() : "PRIMERA";
      if (calFila === calidadBuscada) { filaExacta = i; break; }
    }
  }
  const fila = filaExacta > -1 ? filaExacta : filaCualquiera;
  if (fila === -1) return;
  const actual = parseFloat(datos[fila][colTmcant]) || 0;
  hoja.getRange(fila + 1, colTmcant + 1).setValue(actual + cantidad);
}

function registrarCurado(body) {
  const hoja = getHoja(HOJAS.PATIO);
  const id = siguienteId(hoja, 0);
  let fechaLib = body.fecha_liberacion_curado || "";
  let dias = body.dias_curado_aplicado || null;
  if (!fechaLib) {
    const prod = hojaAObjetos(getHoja(HOJAS.PRODUCTOS)).find(p => String(p.tmcode) === String(body.tmcode));
    dias = dias || calcularDiasCurado(prod ? prod.tmdescrip : "");
    const f = new Date(); f.setDate(f.getDate() + dias);
    fechaLib = Utilities.formatDate(f, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  hoja.appendRow([id, body.ap_id||"", body.tmcode||"", body.cant_en_curado, fechaLib, 0, "", "", new Date(), dias||"", "", "", "", "", body.calidad_curado || "PRIMERA"]);
  return { ok: true, mensaje: `${body.cant_en_curado} unidades en curado hasta ${fechaLib}`, despacho_id: id };
}
function liberarCurado(body) {
  const hoja = getHoja(HOJAS.PATIO);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("despacho_id"), colC = hdrs.indexOf("cant_en_curado");
    const colTmcode = hdrs.indexOf("tmcode"), colCalidad = hdrs.indexOf("calidad_curado");
  const colOrigen = hdrs.indexOf("origen_liberacion"), colFechaReal = hdrs.indexOf("fecha_liberacion_real");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.despacho_id)) {
      _sumarStockPorCurado(datos[i][colTmcode], parseFloat(datos[i][colC])||0, datos[i][colCalidad]);
      hoja.getRange(i+1, colC+1).setValue(0);
      if (colOrigen > -1) hoja.getRange(i+1, colOrigen+1).setValue("manual");
      if (colFechaReal > -1) hoja.getRange(i+1, colFechaReal+1).setValue(new Date());
      return { ok: true, mensaje: "Lote liberado" };
    }
  }
  return { ok: false, error: "Registro no encontrado" };
}

// Edición de un lote en curado ya registrado — Valentina reportó que no
// había forma de corregir un error (cantidad, fecha o calidad mal
// digitada) una vez guardado. Solo permite editar lotes que SIGUEN en
// curado (cant_en_curado > 0); uno ya liberado no se toca desde aquí.
function editarCurado(body) {
  const hoja = getHoja(HOJAS.PATIO);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("despacho_id");
  const colC = hdrs.indexOf("cant_en_curado");
  const colFecha = hdrs.indexOf("fecha_liberacion_curado");
  const colCalidad = hdrs.indexOf("calidad_curado");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.despacho_id)) {
      const cantActual = parseFloat(datos[i][colC]) || 0;
      if (cantActual <= 0) return { ok: false, error: "Este lote ya fue liberado, no se puede editar" };
      if (body.cant_en_curado !== undefined) hoja.getRange(i+1, colC+1).setValue(body.cant_en_curado);
      if (body.fecha_liberacion_curado !== undefined) hoja.getRange(i+1, colFecha+1).setValue(body.fecha_liberacion_curado);
      if (body.calidad_curado !== undefined && colCalidad > -1) hoja.getRange(i+1, colCalidad+1).setValue(body.calidad_curado);
      return { ok: true, mensaje: "Lote de curado actualizado" };
    }
  }
  return { ok: false, error: "Registro no encontrado" };
}

function liberarCuradosVencidos() {
  const hoja = getHoja(HOJAS.PATIO);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colC = hdrs.indexOf("cant_en_curado");
  const colFecha = hdrs.indexOf("fecha_liberacion_curado");
  const colTmcode = hdrs.indexOf("tmcode"), colCalidad = hdrs.indexOf("calidad_curado");
  const colOrigen = hdrs.indexOf("origen_liberacion");
  const colFechaReal = hdrs.indexOf("fecha_liberacion_real");
  const hoy = new Date();
  let liberados = [];
  for (let i = 1; i < datos.length; i++) {
    const cant = parseFloat(datos[i][colC]) || 0;
    const fLib = datos[i][colFecha];
    if (cant > 0 && fLib && new Date(fLib) <= hoy) {
      _sumarStockPorCurado(datos[i][colTmcode], cant, datos[i][colCalidad]);
      hoja.getRange(i+1, colC+1).setValue(0);
      if (colOrigen > -1) hoja.getRange(i+1, colOrigen+1).setValue("automatico");
      if (colFechaReal > -1) hoja.getRange(i+1, colFechaReal+1).setValue(hoy);
      liberados.push(datos[i][0]);
    }
  }
  return { ok: true, liberados: liberados.length, ids: liberados };
}

function instalarTriggerCurado() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'liberarCuradosVencidos') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('liberarCuradosVencidos').timeBased().everyDays(1).atHour(6).create();
}

function calcularDiasCurado(tmdescripRaw) {
  const d = String(tmdescripRaw || '').toUpperCase();
  if (d.includes('POSTE')) {
    // Formato real: LARGOxRESISTENCIA (ej. "10x1350"), donde el segundo valor
    // es la resistencia CHR (Carga Horizontal de Rotura) en KGF — NO es peso.
    // Aclaración reunión despacho 08/09/2026.
    let kgf = null;
    const mDim = d.match(/\d+\s*[xX]\s*(\d{3,4})/);
    if (mDim) {
      kgf = parseInt(mDim[1], 10);
    } else {
      const mSufijo = d.match(/(\d{3,4})\s*(KGF|KG|KD)/);
      if (mSufijo) kgf = parseInt(mSufijo[1], 10);
    }
    if (kgf !== null) {
      if (kgf < 1000) return 15; // 300–999 KGF
      return 21;                 // ≥1000 KGF
    }
    return 15;
  }
  if (d.includes('BLOQUE')) return 7;
  // "Pisos" (adoquín, loseta, baldosa) — corrección reunión despacho: 10 días.
  if (d.includes('ADOQUIN') || d.includes('ADOQUÍN') || d.includes('PISO') || d.includes('LOSETA') || d.includes('BALDOSA')) return 10;
  // Bordillo/sardinel — prefabricados base: 7 días (siempre editable manualmente).
  if (d.includes('BORDILLO') || d.includes('SARDINEL')) return 7;
  if (d.includes('ALFAJIA') || d.includes('ALFAJÍA') || d.includes('RAYUELA') || d.includes('TAPA') || d.includes('CAÑUELA') || d.includes('ALCORQUE')) return 14;
  if (d.includes('BANCA') || d.includes('BOLARDO') || d.includes('TOPELLANTA')) return 21;
  if (d.includes('ZAPATA')) return 14;
  if (d.includes('VIGA') || d.includes('COLUMNA')) return 21;
  return 7;
}

function getDespachos(ap_id) {
  const datos = hojaAObjetos(getHoja(HOJAS.PATIO));
  return { ok: true, data: ap_id ? datos.filter(d => String(d.ap_id) === String(ap_id)) : datos };
}
function getCurados() {
  const hoy = new Date();
  const res = hojaAObjetos(getHoja(HOJAS.PATIO)).filter(d => (parseFloat(d.cant_en_curado)||0) > 0);
  return { ok: true, data: res.map(d => ({ ...d, dias_restantes: d.fecha_liberacion_curado ? Math.ceil((new Date(d.fecha_liberacion_curado)-hoy)/86400000) : null })) };
}
function obtenerStockBruto(tmcode) {
  const p = hojaAObjetos(getHoja(HOJAS.PRODUCTOS)).find(p => String(p.tmcode) === String(tmcode));
  return p ? (parseFloat(p.tmcant)||0) : 0;
}
function getDashboard() {
  const aps = hojaAObjetos(getHoja(HOJAS.PREVENTAS));
  const porEstado = {};
  aps.forEach(ap => { porEstado[ap.estado_ap] = (porEstado[ap.estado_ap]||0)+1; });
  const inv = getInventarioDinamico().data || [];
  return { ok: true, data: { total_aps: aps.length, aps_por_estado: porEstado, alertas_negativas: inv.filter(p=>p.disponible<=0).length, inventario_resumen: inv } };
}
function getAlertasProduccion() {
  const alertas = (getInventarioDinamico().data||[]).filter(p=>p.disponible<=0).map(p => ({ tmcode: p.tmcode, tmdescrip: p.tmdescrip, disponible: p.disponible, unidades_a_producir: Math.abs(p.disponible)+5, urgencia: p.disponible<-10?"CRÍTICA":"ALTA" }));
  return { ok: true, data: alertas };
}

function importarClientesMasivo(body) {
  const hoja = getHoja(HOJAS.CLIENTES);
  const datos = body.datos;
  if (!Array.isArray(datos)||!datos.length) return {ok:false,error:"Sin datos"};
  const start = parseInt(body.start_row)||2;
  hoja.getRange(start,1,datos.length,datos[0].length).setValues(datos);
  SpreadsheetApp.flush();
  return {ok:true,mensaje:"Lote:"+datos.length+" desde fila "+start};
}
function resetSistema(body) {
  if (body.confirmacion !== "RESET_CONFIRMADO") return { ok: false, error: "Confirmacion incorrecta" };
  const numeroInicial = parseInt(body.numero_inicial);
  if (!numeroInicial || numeroInicial < 1) return { ok: false, error: "Debes indicar el numero de AP inicial del libro fisico (numero_inicial)" };
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
  const hojas = ["PREVENTAS_AP","DETALLE_AP","CONTROL_PATIO_Y_LOGISTICA","APROBACIONES","VIAJES_COMPARTIDOS","NOVEDADES_LOGISTICA","SUMINISTROS_NOTAS"];
  const res = [];
  hojas.forEach(n => {
    const h = ss.getSheetByName(n);
    if (!h) { res.push(n+":no-existe"); return; }
    const last = h.getLastRow();
    if (last > 1) { h.getRange(2,1,last-1,h.getLastColumn()).clearContent(); res.push(n+":"+(last-1)+"f"); }
    else res.push(n+":vacia");
  });
  const cfg = ss.getSheetByName("CONFIG_SIVIL");
  if (cfg) {
    const d = cfg.getDataRange().getValues();
    let actualizado = false;
    for (let i=1;i<d.length;i++) { if(d[i][0]==="ultimo_ap_id"){cfg.getRange(i+1,2).setValue(numeroInicial);res.push("consecutivo:"+numeroInicial);actualizado=true;break;} }
    if (!actualizado) { cfg.appendRow(["ultimo_ap_id", numeroInicial]); res.push("consecutivo:"+numeroInicial); }
  }
  SpreadsheetApp.flush();
  return { ok: true, mensaje: "Reset completado", resumen: res };
}

function registrarSuministro(body) {
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
  let hoja = ss.getSheetByName("SUMINISTROS_NOTAS");
  const headers = ["tmcode","tmdescrip","tmund","disponible","estado","nota","cantidad","fecha_llegada_estimada","registrado_por","fecha_registro"];
  if (!hoja) {
    hoja = ss.insertSheet("SUMINISTROS_NOTAS");
    hoja.getRange(1,1,1,headers.length).setValues([headers]);
    hoja.getRange(1,1,1,headers.length).setBackground("#4c1d95").setFontColor("#fff").setFontWeight("bold");
    hoja.setFrozenRows(1);
  }
  const fila = headers.map(h => body[h] !== undefined ? body[h] : "");
  hoja.appendRow(fila);
  SpreadsheetApp.flush();
  return { ok: true };
}

function guardarReceta(body) {
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
  let hoja = ss.getSheetByName("RECETAS");
  const headers = ["producto_codigo","producto_nombre","material_descripcion","cantidad","unidad","actualizado_por","fecha_actualizacion"];
  if (!hoja) {
    hoja = ss.insertSheet("RECETAS");
    hoja.getRange(1,1,1,headers.length).setValues([headers]);
    hoja.getRange(1,1,1,headers.length).setBackground("#4c1d95").setFontColor("#fff").setFontWeight("bold");
    hoja.setFrozenRows(1);
  }
  const productoCodigo = String(body.producto_codigo || "");
  const datos = hoja.getDataRange().getValues();
  const filasABorrar = [];
  for (let i = datos.length - 1; i >= 1; i--) {
    if (String(datos[i][0]) === productoCodigo) filasABorrar.push(i + 1);
  }
  filasABorrar.forEach(function(fila) { hoja.deleteRow(fila); });
  SpreadsheetApp.flush();

  const materiales = body.materiales || [];
  const ahora = new Date().toISOString();
  const filasNuevas = materiales.map(function(mat) {
    return [
      productoCodigo,
      body.producto_nombre || "",
      mat.descripcion || "",
      mat.cantidad || 0,
      mat.unidad || "",
      body.actualizado_por || "",
      ahora
    ];
  });
  if (filasNuevas.length) {
    const ultima = hoja.getLastRow();
    hoja.getRange(ultima + 1, 1, filasNuevas.length, headers.length).setValues(filasNuevas);
  }
  SpreadsheetApp.flush();
  return { ok: true, guardados: filasNuevas.length };
}


function importarProductosMasivo(body) {
  const SHEET_ID = "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI";
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const productos = body.productos || [];
  if (!productos.length) return { ok:false, error:"Sin productos para importar" };

  // PRODUCTOS_MAESTRO: agregar columna es_tercero si no existe
  const hojaProd = ss.getSheetByName("PRODUCTOS_MAESTRO");
  const lastColProd = hojaProd.getLastColumn();
  const headersProd = hojaProd.getRange(1,1,1,lastColProd).getValues()[0];
  let colEsTercero = headersProd.indexOf("es_tercero");
  if (colEsTercero === -1) {
    hojaProd.getRange(1, lastColProd+1).setValue("es_tercero");
    colEsTercero = lastColProd;
  }

  const datosProd = hojaProd.getDataRange().getValues();
  const codigosExistentes = {};
  for (let i = 1; i < datosProd.length; i++) codigosExistentes[String(datosProd[i][0])] = true;

  const filasProd = [];
  productos.forEach(p => {
    if (codigosExistentes[String(p.tmcode)]) return;
    const obs = p.es_tercero ? "PRODUCTO DE TERCEROS - compra a proveedor externo para reventa" : "";
    filasProd.push([p.tmcode, p.tmdescrip, p.tmund, 0, p.precio_base, p.flete_cali, 0, 0, 0.05, obs, "", "", "G", "", "PRIMERA", !!p.es_tercero]);
  });
  if (filasProd.length > 0) {
    hojaProd.getRange(hojaProd.getLastRow()+1, 1, filasProd.length, 16).setValues(filasProd);
  }

  // PRECIOS_GERENCIA
  const hojaPrecios = ss.getSheetByName("PRECIOS_GERENCIA");
  const datosPrecios = hojaPrecios.getDataRange().getValues();
  const tmcodesConPrecio = {};
  for (let i = 1; i < datosPrecios.length; i++) tmcodesConPrecio[String(datosPrecios[i][1])] = true;
  let siguienteId = datosPrecios.length;

  const filasPrecios = [];
  productos.forEach(p => {
    if (tmcodesConPrecio[String(p.tmcode)]) return;
    const fleteB = p.flete_cali ? Math.round(p.flete_cali * 1.3) : 0;
    filasPrecios.push([siguienteId++, p.tmcode, p.precio_base, 0.05, p.flete_cali, fleteB, new Date(2026,6,25), new Date(2099,11,31), 0, p.tmdescrip, p.tmund, "", ""]);
  });
  if (filasPrecios.length > 0) {
    hojaPrecios.getRange(hojaPrecios.getLastRow()+1, 1, filasPrecios.length, 13).setValues(filasPrecios);
  }

  return {
    ok: true,
    productos_agregados: filasProd.length,
    productos_ya_existian: productos.length - filasProd.length,
    precios_agregados: filasPrecios.length,
    precios_ya_existian: productos.length - filasPrecios.length
  };
}


/**
 * LIMPIEZA ÚNICA (23/09/2026) — Ejecutar UNA vez desde el editor.
 * Borra de CLIENTES.direccion los valores que son coordenadas GPS (lat,lon),
 * escritos por error por Comercial antes de la Compilación 27. Las
 * coordenadas reales del cliente siguen en coordenadas_home (no se tocan).
 * Deja la lista de clientes afectados en la hoja LIMPIEZA_DIRECCIONES para
 * que los vendedores puedan volver a registrar la dirección real.
 * Es seguro re-ejecutarla: si ya no hay coordenadas en direccion, no hace nada.
 */
function limpiarDireccionesConCoordenadas() {
  const hoja = getHoja(HOJAS.CLIENTES);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const cNit = hdrs.indexOf("cliente_nit"), cRs = hdrs.indexOf("razon_social"), cDir = hdrs.indexOf("direccion"), cCoord = hdrs.indexOf("coordenadas_home");
  if (cDir < 0) { Logger.log("No existe la columna direccion"); return; }
  const re = /^\s*-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+\s*$/;
  const afectados = [];
  for (let i = 1; i < datos.length; i++) {
    const dir = String(datos[i][cDir] || "");
    if (re.test(dir)) {
      afectados.push([datos[i][cNit], datos[i][cRs], dir, cCoord >= 0 ? datos[i][cCoord] : "", new Date()]);
      hoja.getRange(i + 1, cDir + 1).setValue("");
    }
  }
  if (afectados.length) {
    const ss = hoja.getParent();
    let log = ss.getSheetByName("LIMPIEZA_DIRECCIONES");
    if (!log) {
      log = ss.insertSheet("LIMPIEZA_DIRECCIONES");
      log.getRange(1, 1, 1, 5).setValues([["cliente_nit", "razon_social", "valor_borrado_de_direccion", "coordenadas_home", "fecha_limpieza"]]);
      log.getRange(1, 1, 1, 5).setBackground("#1a3a5c").setFontColor("#fff").setFontWeight("bold");
      log.setFrozenRows(1);
    }
    log.getRange(log.getLastRow() + 1, 1, afectados.length, 5).setValues(afectados);
  }
  Logger.log("Direcciones con coordenadas limpiadas: " + afectados.length);
  return afectados.length;
}


// ===== Tabla oficial de productos y precios (carga unica, clave requerida) =====
function _setCamposExtraAP(hoja, fila, body) {
  // Datos de la negociacion que Despacho necesita ver (9 oct 2026). Antes solo se guardaban
  // numero_viajes, lleva_estiba y flete_gravado; la fecha de entrega, observaciones, direccion
  // y contacto de la obra viajaban en la peticion pero no se escribian en la hoja.
  const extra = { numero_viajes: body.numero_viajes || '', lleva_estiba: body.lleva_estiba || '', flete_gravado: body.flete_gravado || '',
    fecha_entrega: body.fecha_entrega || '', obs_entrega: body.obs_entrega || '', direccion_obra: body.direccion_obra || '',
    contacto_obra: body.contacto_obra || '', cel_contacto: body.cel_contacto || '',
    forma_pago: body.forma_pago || '', dias_credito: body.dias_credito || '', flete_incluido: body.flete_incluido || '',
    subtotal_ap: body.subtotal_ap, descuento_ap: body.descuento_ap, estiba_ap: body.estiba_ap,
    iva_productos_ap: body.iva_productos_ap, iva_flete_ap: body.iva_flete_ap, iva_ap: body.iva_ap, total_ap: body.total_ap };
  const textos = { fecha_entrega: 1, cel_contacto: 1, direccion_obra: 1, contacto_obra: 1, obs_entrega: 1 };
  let lc = hoja.getLastColumn();
  const hdr = hoja.getRange(1, 1, 1, lc).getValues()[0].map(String);
  Object.keys(extra).forEach(function (k) {
    let ix = hdr.indexOf(k);
    if (ix < 0) { lc++; hoja.getRange(1, lc).setValue(k); hdr.push(k); ix = hdr.length - 1; }
    const celda = hoja.getRange(fila, ix + 1);
    if (extra[k] === undefined || extra[k] === null) return;
    if (textos[k]) celda.setNumberFormat('@'); // texto tal cual: la fecha queda aaaa-mm-dd y el celular no pierde ceros
    celda.setValue(extra[k]);
  });
}

// =============================================================================
// COTIZACIONES (9 oct 2026) — módulo Cotizador de Comercial.
// Número de cotización MANUAL: si ya existe en otra cotización se avisa
// (duplicado) y solo se guarda si el usuario confirma. Se lee desde la app por gviz.
// =============================================================================
const COTIZ_COLS = ["uid","numero","fecha","vendedor_id","cliente_nit","cliente_nombre","obra","vigencia","despachos_hasta","subtotal","iva","total","estado","payload","creado","actualizado","ap_id","nota_estado"];
function _hojaCotiz() {
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID);
  let h = ss.getSheetByName(HOJAS.COTIZACIONES);
  if (!h) {
    h = ss.insertSheet(HOJAS.COTIZACIONES);
    h.getRange(1, 1, 1, COTIZ_COLS.length).setValues([COTIZ_COLS]).setFontWeight("bold");
    h.setFrozenRows(1);
  }
  h.getRange(1, 1, h.getMaxRows(), COTIZ_COLS.length).setNumberFormat("@");
  return h;
}
function _normNumCotiz(n) { return String(n || "").toUpperCase().replace(/\s+/g, ""); }
function guardarCotizacion(body) {
  const num = String(body.numero || "").trim();
  if (!num) return { ok: false, error: "Falta el número de cotización" };
  const hoja = _hojaCotiz();
  const datos = hoja.getDataRange().getValues();
  const iU = COTIZ_COLS.indexOf("uid"), iN = COTIZ_COLS.indexOf("numero");
  let fila = -1;
  if (body.uid) for (let i = 1; i < datos.length; i++) if (String(datos[i][iU]) === String(body.uid)) { fila = i + 1; break; }
  if (!body.confirmar_duplicado) {
    for (let i = 1; i < datos.length; i++) {
      if (String(datos[i][iU]) === String(body.uid || "")) continue;
      if (_normNumCotiz(datos[i][iN]) === _normNumCotiz(num) && String(datos[i][COTIZ_COLS.indexOf("estado")]) !== "Anulada") {
        return { ok: false, duplicado: true, existente: { numero: datos[i][iN], cliente: datos[i][COTIZ_COLS.indexOf("cliente_nombre")], fecha: datos[i][COTIZ_COLS.indexOf("fecha")], vendedor_id: datos[i][COTIZ_COLS.indexOf("vendedor_id")] } };
      }
    }
  }
  const ahora = new Date().toISOString();
  const uid = body.uid || ("Q" + new Date().getTime());
  const fila_ = [uid, num, body.fecha || "", body.vendedor_id || "", body.cliente_nit || "", body.cliente_nombre || "", body.obra || "", body.vigencia || "", body.despachos_hasta || "",
    body.subtotal || 0, body.iva || 0, body.total || 0, body.estado || "Borrador", JSON.stringify(body.payload || {}), "", ahora, body.ap_id || "", body.nota_estado || ""];
  if (fila > 0) {
    fila_[COTIZ_COLS.indexOf("creado")] = datos[fila - 1][COTIZ_COLS.indexOf("creado")];
    fila_[COTIZ_COLS.indexOf("ap_id")] = body.ap_id || datos[fila - 1][COTIZ_COLS.indexOf("ap_id")];
    hoja.getRange(fila, 1, 1, COTIZ_COLS.length).setValues([fila_]);
  } else {
    fila_[COTIZ_COLS.indexOf("creado")] = ahora;
    hoja.appendRow(fila_);
  }
  return { ok: true, uid: uid, numero: num };
}
function cambiarEstadoCotizacion(body) {
  const hoja = _hojaCotiz();
  const datos = hoja.getDataRange().getValues();
  const iU = COTIZ_COLS.indexOf("uid");
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][iU]) === String(body.uid)) {
      hoja.getRange(i + 1, COTIZ_COLS.indexOf("estado") + 1).setValue(body.estado);
      hoja.getRange(i + 1, COTIZ_COLS.indexOf("actualizado") + 1).setValue(new Date().toISOString());
      if (body.nota !== undefined) hoja.getRange(i + 1, COTIZ_COLS.indexOf("nota_estado") + 1).setValue(body.nota);
      if (body.ap_id) hoja.getRange(i + 1, COTIZ_COLS.indexOf("ap_id") + 1).setValue(body.ap_id);
      return { ok: true };
    }
  }
  return { ok: false, error: "Cotización no encontrada" };
}
