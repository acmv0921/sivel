// =============================================================================
// SIVIL - Sistema Integrado de Ventas, Inventario y Logística
// POSTEC DE OCCIDENTE S.A.S.
// Backend: Google Apps Script (GAS) v1.0
// Arquitectura: GET público para lectura | POST no-cors para escritura
// =============================================================================

const SHEET_ID = "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI";

// Nombres de hojas
const HOJAS = {
  PRODUCTOS:   "PRODUCTOS_MAESTRO",
  VENDEDORES:  "VENDEDORES",
  CLIENTES:    "CLIENTES",
  PREVENTAS:   "PREVENTAS_AP",
  DETALLE:     "DETALLE_AP",
  PATIO:       "CONTROL_PATIO_Y_LOGISTICA",
  PRECIOS:     "PRECIOS_GERENCIA",
  VEHICULOS:   "VEHICULOS"
};

// =============================================================================
// ROUTER PRINCIPAL
// =============================================================================
function doGet(e) {
  const accion = e.parameter.accion || "";
  let resultado;

  try {
    switch (accion) {
      // --- PRODUCTOS ---
      case "getProductos":
        resultado = getProductos();
        break;
      case "getProducto":
        resultado = getProducto(e.parameter.tmcode);
        break;

      // --- VENDEDORES ---
      case "getVendedores":
        resultado = getVendedores();
        break;
      case "getVendedor":
        resultado = getVendedor(e.parameter.correo);
        break;

      // --- CLIENTES ---
      case "getClientes":
        resultado = getClientes(e.parameter.vendedor_id);
        break;
      case "getCliente":
        resultado = getCliente(e.parameter.nit);
        break;
      case "buscarCliente":
        resultado = buscarCliente(e.parameter.q);
        break;

      // --- PREVENTAS ---
      case "getPreventas":
        resultado = getPreventas(e.parameter.vendedor_id, e.parameter.estado);
        break;
      case "getPreventa":
        resultado = getPreventa(e.parameter.ap_id);
        break;
      case "getDetalleAP":
        resultado = getDetalleAP(e.parameter.ap_id);
        break;

      // --- INVENTARIO DINÁMICO ---
      case "getInventarioDinamico":
        resultado = getInventarioDinamico();
        break;
      case "getDisponibleProducto":
        resultado = getDisponibleProducto(e.parameter.tmcode);
        break;

      // --- PATIO ---
      case "getDespachos":
        resultado = getDespachos(e.parameter.ap_id);
        break;
      case "getCurados":
        resultado = getCurados();
        break;

      // --- PRECIOS ---
      case "getPrecios":
        resultado = getPrecios(e.parameter.tmcode);
        break;

      // --- DASHBOARD ---
      case "getDashboard":
        resultado = getDashboard();
        break;
      case "getAlertasProduccion":
        resultado = getAlertasProduccion();
        break;

      case "getPromociones":   resultado = getPromociones(); break;
      case "getConsecutivoAP": resultado = getConsecutivoAP(); break;
      default:
        resultado = { ok: true, mensaje: "SIVIL API v1.0 activa", timestamp: new Date().toISOString() };
    }
  } catch (err) {
    resultado = { ok: false, error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body, accion, resultado;

  try {
    body   = JSON.parse(e.postData.contents);
    accion = body.accion || "";

    switch (accion) {
      // --- VENDEDORES ---
      case "crearVendedor":
        resultado = crearVendedor(body);
        break;
      case "actualizarVendedor":
        resultado = actualizarVendedor(body);
        break;

      // --- CLIENTES ---
      case "crearCliente":
        resultado = crearCliente(body);
        break;
      case "actualizarCliente":
        resultado = actualizarCliente(body);
        break;

      // --- PREVENTAS ---
      case "crearPreventa":
        resultado = crearPreventa(body);
        break;
      case "agregarDetalleAP":
        resultado = agregarDetalleAP(body);
        break;
      case "actualizarEstadoAP":
        resultado = actualizarEstadoAP(body);
        break;
      case "modificarDetalleAP":
        resultado = modificarDetalleAP(body);
        break;

      // --- PATIO ---
      case "registrarDespacho":
        resultado = registrarDespacho(body);
        break;
      case "registrarAveria":
        resultado = registrarAveria(body);
        break;
      case "registrarNovedadDespacho":
        resultado = registrarNovedadDespacho(body);
        break;
      case "registrarNovedad":
        resultado = registrarNovedad(body);
        break;
      case "crearVehiculo":
        resultado = crearVehiculo(body);
        break;
      case "importarClientesMasivo":
        resultado = importarClientesMasivo(body);
        break;
      case "registrarCurado":
        resultado = registrarCurado(body);
        break;
      case "liberarCurado":
        resultado = liberarCurado(body);
        break;
      case "generarInformeDespacho":
        resultado = generarInformeDespachoDesdeBody(body);
        break;

      // --- PRODUCTOS ---
      case "actualizarStock":
        resultado = actualizarStock(body);
        break;

      // --- PRECIOS ---
      case "crearPrecio":
        resultado = crearPrecio(body);
        break;
      case "actualizarPrecio":
        resultado = actualizarPrecio(body);
        break;

      default:
        resultado = { ok: false, error: `Acción desconocida: ${accion}` };
    }
  } catch (err) {
    resultado = { ok: false, error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

// =============================================================================
// INFORME DE DESPACHO — dispara la generación de PDF+Excel definida en el
// script Informes.gs.gs (proyecto separado "SIVIL" bound al Sheet). Requiere
// que la función generarInformeDespacho() de ese archivo esté disponible en
// este MISMO proyecto (pégala aquí también si vive en otro proyecto Apps
// Script, ya que un doPost solo puede llamar funciones de su propio proyecto).
// =============================================================================
function generarInformeDespachoDesdeBody(body) {
  try {
    const datos = JSON.parse(body.datos);
    return generarInformeDespacho(datos);
  } catch (err) {
    return { ok: false, error: "Error generando informe de despacho: " + err.message };
  }
}

// =============================================================================
// UTILIDADES GENERALES
// =============================================================================
function getHoja(nombre) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const hoja = ss.getSheetByName(nombre);
  if (!hoja) throw new Error(`Hoja '${nombre}' no encontrada`);
  return hoja;
}

function hojaAObjetos(hoja) {
  const datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return [];
  const headers = datos[0].map(h => String(h).trim());
  return datos.slice(1)
    .filter(fila => fila.some(c => c !== ""))
    .map(fila => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = fila[i] ?? ""; });
      return obj;
    });
}

function siguienteId(hoja, columnaId) {
  const datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return 1;
  const ids = datos.slice(1)
    .map(f => parseInt(f[columnaId]) || 0)
    .filter(n => n > 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function formatFecha(fecha) {
  if (!fecha) return "";
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return isNaN(d) ? String(fecha) : d.toISOString();
}

// =============================================================================
// MOTOR DE INVENTARIO DINÁMICO
// Disponible = tmcant - cant_en_curado - cant_mermas_averias - SUM(cantidad_solicitada pendiente)
// =============================================================================
function calcularDisponible(tmcode) {
  // Stock bruto
  const hProd   = getHoja(HOJAS.PRODUCTOS);
  const prods   = hojaAObjetos(hProd);
  const prod    = prods.find(p => String(p.tmcode) === String(tmcode));
  if (!prod) return null;
  const stockBruto = parseFloat(prod.tmcant) || 0;

  // Cantidad en curado + averías (patio) — SIEMPRE filtrado por tmcode
  // (fix: antes el filtro de curado era un no-op "|| true" y el de averías
  // no filtraba en absoluto, sumando TODO el patio de la empresa contra
  // cada producto. Corregido 03/07/2026.)
  const hPatio   = getHoja(HOJAS.PATIO);
  const patios   = hojaAObjetos(hPatio).filter(p => String(p.tmcode) === String(tmcode));
  const enCurado = patios
    .reduce((acc, p) => acc + (parseFloat(p.cant_en_curado) || 0), 0);

  // Averías: se deducen del disponible (Cargue + Restribado + Reposiciones +
  // el histórico cant_mermas_averias). Los Saldos de Segunda NO se deducen
  // del disponible principal — siguen siendo stock vendible, solo que bajo
  // otra condición de precio; se reportan aparte.
  const averias = patios.reduce((acc, p) =>
    acc + (parseFloat(p.cant_mermas_averias) || 0)
        + (parseFloat(p.cant_averia_cargue) || 0)
        + (parseFloat(p.cant_averia_restribado) || 0)
        + (parseFloat(p.cant_reposicion) || 0), 0);
  const saldosSegunda = patios
    .reduce((acc, p) => acc + (parseFloat(p.cant_merma_segunda) || 0), 0);

  // Comprometido en APs pendientes
  const hDetalle  = getHoja(HOJAS.DETALLE);
  const detalles  = hojaAObjetos(hDetalle);
  const hAP       = getHoja(HOJAS.PREVENTAS);
  const aps       = hojaAObjetos(hAP);
  const apsPendientes = new Set(
    aps.filter(a => ["Pendiente","Despachado Parcial"].includes(a.estado_ap))
       .map(a => String(a.ap_id))
  );
  const comprometido = detalles
    .filter(d => String(d.tmcode) === String(tmcode) && apsPendientes.has(String(d.ap_id)))
    .reduce((acc, d) => {
      const sol  = parseFloat(d.cantidad_solicitada) || 0;
      const desp = parseFloat(d.cantidad_despachada) || 0;
      return acc + Math.max(0, sol - desp);
    }, 0);

  const disponible = stockBruto - enCurado - averias - comprometido;

  return {
    tmcode,
    tmdescrip:    prod.tmdescrip,
    tmund:        prod.tmund,
    stock_bruto:  stockBruto,
    en_curado:    enCurado,
    averias,
    saldos_segunda: saldosSegunda,
    comprometido,
    disponible,
    estado_semaforo: disponible > 10 ? "VERDE"
                   : disponible > 0  ? "AMARILLO"
                   : "ROJO"
  };
}

function getInventarioDinamico() {
  const hProd = getHoja(HOJAS.PRODUCTOS);
  const prods = hojaAObjetos(hProd);
  const inv   = prods.map(p => calcularDisponible(p.tmcode)).filter(Boolean);
  return { ok: true, data: inv };
}

function getDisponibleProducto(tmcode) {
  const d = calcularDisponible(tmcode);
  if (!d) return { ok: false, error: `Producto ${tmcode} no encontrado` };
  return { ok: true, data: d };
}

// =============================================================================
// MÓDULO: PRODUCTOS
// =============================================================================
function getProductos() {
  const datos = hojaAObjetos(getHoja(HOJAS.PRODUCTOS));
  return { ok: true, data: datos };
}

function getProducto(tmcode) {
  const datos = hojaAObjetos(getHoja(HOJAS.PRODUCTOS));
  const prod  = datos.find(p => String(p.tmcode) === String(tmcode));
  if (!prod) return { ok: false, error: "Producto no encontrado" };
  return { ok: true, data: prod };
}

function actualizarStock(body) {
  const hoja  = getHoja(HOJAS.PRODUCTOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colCode = hdrs.indexOf("tmcode");
  const colCant = hdrs.indexOf("tmcant");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colCode]) === String(body.tmcode)) {
      hoja.getRange(i + 1, colCant + 1).setValue(body.tmcant);
      return { ok: true, mensaje: `Stock de ${body.tmcode} actualizado a ${body.tmcant}` };
    }
  }
  return { ok: false, error: "Producto no encontrado" };
}

// =============================================================================
// MÓDULO: VENDEDORES
// =============================================================================
function getVendedores() {
  const datos = hojaAObjetos(getHoja(HOJAS.VENDEDORES));
  return { ok: true, data: datos.filter(v => v.estado === "Activo") };
}

function getVendedor(correo) {
  const datos = hojaAObjetos(getHoja(HOJAS.VENDEDORES));
  const v     = datos.find(x => x.correo_usuario === correo);
  if (!v) return { ok: false, error: "Vendedor no encontrado" };
  return { ok: true, data: v };
}

function crearVendedor(body) {
  const hoja = getHoja(HOJAS.VENDEDORES);
  hoja.appendRow([
    body.id_vendedor,
    body.nombre_vendedor,
    body.correo_usuario,
    body.estado || "Activo"
  ]);
  return { ok: true, mensaje: "Vendedor creado", id: body.id_vendedor };
}

function actualizarVendedor(body) {
  const hoja  = getHoja(HOJAS.VENDEDORES);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
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

// =============================================================================
// MÓDULO: CLIENTES
// =============================================================================
function getClientes(vendedor_id) {
  const datos = hojaAObjetos(getHoja(HOJAS.CLIENTES));
  const res   = vendedor_id
    ? datos.filter(c => String(c.vendedor_asignado) === String(vendedor_id))
    : datos;
  return { ok: true, data: res };
}

function getCliente(nit) {
  const datos = hojaAObjetos(getHoja(HOJAS.CLIENTES));
  const c     = datos.find(x => String(x.cliente_nit) === String(nit));
  if (!c) return { ok: false, error: "Cliente no encontrado" };
  return { ok: true, data: c };
}

function buscarCliente(q) {
  const datos = hojaAObjetos(getHoja(HOJAS.CLIENTES));
  const ql    = String(q).toLowerCase();
  const res   = datos.filter(c =>
    String(c.cliente_nit).includes(ql) ||
    String(c.razon_social).toLowerCase().includes(ql)
  );
  return { ok: true, data: res };
}

function crearCliente(body) {
  // Validar duplicado por NIT
  const check = getCliente(body.cliente_nit);
  if (check.ok) return { ok: false, error: "NIT ya registrado. Cliente duplicado bloqueado." };

  const hoja = getHoja(HOJAS.CLIENTES);
  hoja.appendRow([
    body.cliente_nit,
    body.razon_social,
    body.vendedor_asignado,
    body.coordenadas_home || "",
    body.foto_fachada_url || ""
  ]);
  return { ok: true, mensaje: "Cliente creado", nit: body.cliente_nit };
}

function actualizarCliente(body) {
  const hoja  = getHoja(HOJAS.CLIENTES);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colNit = hdrs.indexOf("cliente_nit");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colNit]) === String(body.cliente_nit)) {
      if (body.razon_social       !== undefined) hoja.getRange(i+1, hdrs.indexOf("razon_social")+1).setValue(body.razon_social);
      if (body.vendedor_asignado  !== undefined) hoja.getRange(i+1, hdrs.indexOf("vendedor_asignado")+1).setValue(body.vendedor_asignado);
      if (body.coordenadas_home   !== undefined) hoja.getRange(i+1, hdrs.indexOf("coordenadas_home")+1).setValue(body.coordenadas_home);
      if (body.foto_fachada_url   !== undefined) hoja.getRange(i+1, hdrs.indexOf("foto_fachada_url")+1).setValue(body.foto_fachada_url);
      return { ok: true, mensaje: "Cliente actualizado" };
    }
  }
  return { ok: false, error: "Cliente no encontrado" };
}

// Importación masiva desde DATAX. Se llama en lotes (batches) desde el
// cliente para no exceder límites de payload. body.limpiar=true SOLO en el
// primer lote, para borrar los clientes de prueba antes de cargar los reales.
// Todos los vendedores pueden ver todos los clientes (decisión 03/07/2026);
// vendedor_datax se guarda solo como referencia histórica del ERP, no se usa
// para filtrar.
function importarClientesMasivo(body) {
  const hoja = getHoja(HOJAS.CLIENTES);
  const hdrs = ["cliente_nit","razon_social","vendedor_asignado","coordenadas_home","foto_fachada_url","telefono","ciudad","vendedor_datax"];

  if (body.limpiar) {
    hoja.clearContents();
    hoja.getRange(1,1,1,hdrs.length).setValues([hdrs]);
    hoja.getRange(1,1,1,hdrs.length).setBackground("#1a3a5c").setFontColor("#fff").setFontWeight("bold");
    hoja.setFrozenRows(1);
  }

  const filas = (body.clientes || []).map(c => [
    c.nit, c.nombre, "", "", "", c.telefono || "", c.ciudad || "", c.vendedor_datax || ""
  ]);
  if (filas.length > 0) {
    const inicio = hoja.getLastRow() + 1;
    hoja.getRange(inicio, 1, filas.length, hdrs.length).setValues(filas);
  }

  return { ok: true, mensaje: `${filas.length} clientes importados`, total_en_hoja: hoja.getLastRow() - 1 };
}

// =============================================================================
// MÓDULO: PREVENTAS (AP)
// =============================================================================
function getPreventas(vendedor_id, estado) {
  const datos = hojaAObjetos(getHoja(HOJAS.PREVENTAS));
  let res = datos;
  if (vendedor_id) res = res.filter(a => String(a.vendedor_id) === String(vendedor_id));
  if (estado)      res = res.filter(a => a.estado_ap === estado);
  return { ok: true, data: res };
}

function getPreventa(ap_id) {
  const datos = hojaAObjetos(getHoja(HOJAS.PREVENTAS));
  const ap    = datos.find(a => String(a.ap_id) === String(ap_id));
  if (!ap) return { ok: false, error: "AP no encontrada" };
  // Traer detalle incluido
  const detalle = getDetalleAP(ap_id);
  return { ok: true, data: { ...ap, detalle: detalle.data } };
}

function crearPreventa(body) {
  const hoja = getHoja(HOJAS.PREVENTAS);
  let ap_id;
  if (body.ap_id_reservado) {
    ap_id = parseInt(body.ap_id_reservado);
    const datos = hoja.getDataRange().getValues();
    const hdrs  = datos[0].map(h => String(h).trim());
    const colId = hdrs.indexOf("ap_id");
    const colEst = hdrs.indexOf("estado_ap");
    for (let i = 1; i < datos.length; i++) {
      if (String(datos[i][colId]) === String(ap_id) && datos[i][colEst] === "RESERVADO") {
        hoja.getRange(i+1,1,1,11).setValues([[ap_id,body.cliente_nit,body.vendedor_id,new Date(),
          body.tipo_entrega||"Venta en Planta","Pendiente",
          body.fecha_entrega||"",body.obs_entrega||"",
          body.direccion_obra||"",body.contacto_obra||"",body.cel_contacto||""]]);
        SpreadsheetApp.flush();
        if (body.detalle&&Array.isArray(body.detalle)) body.detalle.forEach(d=>agregarDetalleAP({ap_id,...d}));
        return { ok: true, mensaje: "AP confirmada", ap_id };
      }
    }
  }
  ap_id = incrementarConsecutivo();
  hoja.appendRow([
    ap_id,
    body.cliente_nit,
    body.vendedor_id,
    new Date(),
    body.tipo_entrega      || "Venta en Planta",
    "Pendiente",
    body.fecha_entrega     || "",   // Fecha de entrega solicitada
    body.obs_entrega       || "",   // Observaciones de entrega
    body.direccion_obra    || "",   // Dirección de la obra
    body.contacto_obra     || "",   // Nombre contacto en obra
    body.cel_contacto      || ""    // Celular contacto en obra
  ]);

  // Agregar líneas de detalle si vienen incluidas
  if (body.detalle && Array.isArray(body.detalle)) {
    body.detalle.forEach(d => {
      agregarDetalleAP({ ap_id, ...d });
    });
  }

  return { ok: true, mensaje: "AP creada", ap_id };
}

function actualizarEstadoAP(body) {
  const hoja  = getHoja(HOJAS.PREVENTAS);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colId  = hdrs.indexOf("ap_id");
  const colEst = hdrs.indexOf("estado_ap");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.ap_id)) {
      hoja.getRange(i+1, colEst+1).setValue(body.estado_ap);
      return { ok: true, mensaje: `AP ${body.ap_id} → ${body.estado_ap}` };
    }
  }
  return { ok: false, error: "AP no encontrada" };
}

// =============================================================================
// MÓDULO: DETALLE AP
// =============================================================================
function getDetalleAP(ap_id) {
  const datos = hojaAObjetos(getHoja(HOJAS.DETALLE));
  const res   = datos.filter(d => String(d.ap_id) === String(ap_id));
  return { ok: true, data: res };
}

function agregarDetalleAP(body) {
  const hoja       = getHoja(HOJAS.DETALLE);
  const detalle_id = siguienteId(hoja, 0);

  // Validar descuento contra tabla de precios
  const precioCheck = validarDescuento(body.tmcode, body.descuento_aplicado || 0);
  if (!precioCheck.ok) return precioCheck;

  hoja.appendRow([
    detalle_id,
    body.ap_id,
    body.tmcode,
    body.cantidad_solicitada,
    body.cantidad_despachada || 0,
    body.descuento_aplicado  || 0
  ]);
  return { ok: true, mensaje: "Línea agregada", detalle_id };
}

function modificarDetalleAP(body) {
  // Al modificar se marca la AP como "Modificado" pero conserva el mismo ap_id
  const hoja  = getHoja(HOJAS.DETALLE);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("detalle_id");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.detalle_id)) {
      if (body.cantidad_solicitada !== undefined) hoja.getRange(i+1, hdrs.indexOf("cantidad_solicitada")+1).setValue(body.cantidad_solicitada);
      if (body.descuento_aplicado  !== undefined) {
        const check = validarDescuento(datos[i][hdrs.indexOf("tmcode")], body.descuento_aplicado);
        if (!check.ok) return check;
        hoja.getRange(i+1, hdrs.indexOf("descuento_aplicado")+1).setValue(body.descuento_aplicado);
      }
      // Marcar AP como Modificado
      actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Modificado" });
      return { ok: true, mensaje: "Línea modificada" };
    }
  }
  return { ok: false, error: "Detalle no encontrado" };
}

// =============================================================================
// MÓDULO: PRECIOS Y VALIDACIÓN DE DESCUENTOS
// =============================================================================
function getPrecios(tmcode) {
  const datos  = hojaAObjetos(getHoja(HOJAS.PRECIOS));
  const hoy    = new Date();
  const vigentes = datos.filter(p => {
    const ini = p.fecha_vigencia_inicio ? new Date(p.fecha_vigencia_inicio) : new Date(0);
    const fin = p.fecha_vigencia_fin    ? new Date(p.fecha_vigencia_fin)    : new Date("2099-12-31");
    const enVigencia = hoy >= ini && hoy <= fin;
    return enVigencia && (!tmcode || String(p.tmcode) === String(tmcode));
  });
  return { ok: true, data: vigentes };
}

function validarDescuento(tmcode, descuento) {
  const precios = getPrecios(tmcode);
  if (!precios.ok || precios.data.length === 0) return { ok: true }; // Sin política = sin restricción
  const politica = precios.data[0];
  const maxDesc  = parseFloat(politica.descuento_max_vendedor) || 0;
  if (parseFloat(descuento) > maxDesc) {
    return {
      ok: false,
      error: `Descuento ${(descuento*100).toFixed(1)}% supera el máximo permitido (${(maxDesc*100).toFixed(1)}%). Se requiere aprobación de gerencia.`,
      requiere_aprobacion: true,
      max_permitido: maxDesc
    };
  }
  return { ok: true };
}

function crearPrecio(body) {
  const hoja  = getHoja(HOJAS.PRECIOS);
  const id    = siguienteId(hoja, 0);
  hoja.appendRow([
    id,
    body.tmcode,
    body.precio_base_planta,
    body.descuento_max_vendedor,
    body.costo_flete_unidad_zonaA || 0,
    body.costo_flete_unidad_zonaB || 0,
    body.fecha_vigencia_inicio    || "",
    body.fecha_vigencia_fin       || ""
  ]);
  return { ok: true, mensaje: "Política de precio creada", id_precio: id };
}

function actualizarPrecio(body) {
  const hoja  = getHoja(HOJAS.PRECIOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("id_precio");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.id_precio)) {
      const campos = ["precio_base_planta","descuento_max_vendedor",
                      "costo_flete_unidad_zonaA","costo_flete_unidad_zonaB",
                      "fecha_vigencia_inicio","fecha_vigencia_fin"];
      campos.forEach(campo => {
        if (body[campo] !== undefined)
          hoja.getRange(i+1, hdrs.indexOf(campo)+1).setValue(body[campo]);
      });
      return { ok: true, mensaje: "Precio actualizado" };
    }
  }
  return { ok: false, error: "Precio no encontrado" };
}

// =============================================================================
// MÓDULO: PATIO Y LOGÍSTICA
// =============================================================================
function registrarDespacho(body) {
  // Registrar alerta de cargue manual si aplica
  if (body.cargue_manual && body.cargue_manual.requiere) {
    try {
      const ss    = SpreadsheetApp.openById(SIVIL_SHEET_ID || SHEET_ID);
      let hCM     = ss.getSheetByName("ALERTAS_CARGUE_MANUAL");
      if (!hCM) {
        hCM = ss.insertSheet("ALERTAS_CARGUE_MANUAL");
        hCM.getRange(1,1,1,5).setValues([["ap_id","fecha_cargue","nota","estado","fecha_registro"]]);
        hCM.getRange(1,1,1,5).setBackground("#7c3200").setFontColor("#fff").setFontWeight("bold");
        hCM.setFrozenRows(1);
      }
      hCM.appendRow([
        body.ap_id||"",
        body.cargue_manual.fecha||"",
        body.cargue_manual.nota||"",
        "Pendiente",
        new Date()
      ]);
    } catch(e) { Logger.log("Alerta cargue manual: " + e.message); }
  }


  const hoja       = getHoja(HOJAS.PATIO);
  const despacho_id = siguienteId(hoja, 0);
  const cantReal   = parseFloat(body.cant_real_cargada) || 0;

  hoja.appendRow([
    despacho_id,
    body.ap_id,
    body.tmcode || "",
    0,           // cant_en_curado
    "",          // fecha_liberacion_curado
    0,           // cant_mermas_averias
    body.placa_vehiculo    || "",
    body.evidencia_carga_url || "",
    new Date()
  ]);

  // Actualizar cantidad despachada en DETALLE_AP
  if (body.detalle_id && cantReal > 0) {
    actualizarCantDespachada(body.detalle_id, body.ap_id, cantReal);
  }

  // Revisar si hay saldo (remanente)
  const cantSol = parseFloat(body.cantidad_solicitada) || 0;
  const saldo   = cantSol - cantReal;
  if (saldo > 0) {
    // La AP pasa a "Despachado Parcial" y el saldo queda visible
    actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Despachado Parcial" });
    return {
      ok: true,
      mensaje: `Despacho registrado. Saldo pendiente: ${saldo} ${body.tmund || "UND"}`,
      despacho_id,
      saldo,
      estado_ap: "Despachado Parcial"
    };
  }

  actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Despachado Total" });
  return { ok: true, mensaje: "Despacho total registrado", despacho_id, saldo: 0, estado_ap: "Despachado Total" };
}

function actualizarCantDespachada(detalle_id, ap_id, cantDespachada) {
  const hoja  = getHoja(HOJAS.DETALLE);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("detalle_id");
  const colD  = hdrs.indexOf("cantidad_despachada");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(detalle_id)) {
      const actual   = parseFloat(datos[i][colD]) || 0;
      hoja.getRange(i+1, colD+1).setValue(actual + cantDespachada);
      return;
    }
  }
}

// Mantenida por compatibilidad — usa la categoría "cargue" por defecto.
// A partir del 03/07/2026, usar registrarNovedad(body) con body.categoria.
// Guarda una novedad de despacho (varado, reprogramado, etc.) en una
// hoja dedicada NOVEDADES_DESPACHO para trazabilidad y auditoría.
// El WhatsApp lo gestiona el frontend; aquí solo persistimos el registro.
function registrarNovedadDespacho(body) {
  const ss   = SpreadsheetApp.openById(SIVIL_SHEET_ID || SHEET_ID);
  let hoja   = ss.getSheetByName("NOVEDADES_DESPACHO");
  if (!hoja) {
    hoja = ss.insertSheet("NOVEDADES_DESPACHO");
    hoja.getRange(1, 1, 1, 7).setValues([["id","ap_id","tipo_novedad","detalle","nueva_fecha","resumen","fecha_registro"]]);
    hoja.getRange(1, 1, 1, 7).setBackground("#7c3200").setFontColor("#fff").setFontWeight("bold");
    hoja.setFrozenRows(1);
  }
  const id = hoja.getLastRow();  // ID simple = número de fila
  hoja.appendRow([
    id,
    body.ap_id        || "",
    body.tipo_novedad || "",
    body.detalle_novedad || "",
    body.nueva_fecha  || "",
    body.resumen      || "",
    new Date()
  ]);

  // También actualizar el estado de la AP si aplica
  if (body.tipo_novedad && body.tipo_novedad.includes("Cancelada")) {
    actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Cancelado" });
  } else if (body.tipo_novedad && body.tipo_novedad.includes("Reprogramada")) {
    actualizarEstadoAP({ ap_id: body.ap_id, estado_ap: "Pendiente" });
  }

  return { ok: true, mensaje: "Novedad registrada: " + (body.tipo_novedad || ""), id };
}

// =============================================================================
// CONSECUTIVO GLOBAL DE AP — ATÓMICO CON LOCKSERVICE
// =============================================================================

function getConfigHoja() {
  const ss = SpreadsheetApp.openById(SIVIL_SHEET_ID || SHEET_ID);
  let hoja = ss.getSheetByName(HOJAS.CONFIG);
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS.CONFIG);
    hoja.getRange(1,1,1,2).setValues([["clave","valor"]]);
    hoja.getRange(1,1,1,2).setBackground("#1a3a5c").setFontColor("#fff").setFontWeight("bold");
    hoja.appendRow(["ultimo_ap_id", 1967]);
    hoja.appendRow(["fecha_inicio_sivil", new Date().toISOString()]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function getConsecutivoAP() {
  const hoja  = getConfigHoja();
  const datos = hoja.getDataRange().getValues();
  const fila  = datos.find(r => r[0] === "ultimo_ap_id");
  return { ok: true, ultimo_ap_id: fila ? parseInt(fila[1]) : 1967, siguiente: fila ? parseInt(fila[1])+1 : 1968 };
}

function incrementarConsecutivo() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(8000);
    const hoja  = getConfigHoja();
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === "ultimo_ap_id") {
        const nuevo = parseInt(datos[i][1]) + 1;
        hoja.getRange(i+1, 2).setValue(nuevo);
        SpreadsheetApp.flush();
        return nuevo;
      }
    }
    hoja.appendRow(["ultimo_ap_id", 1968]);
    SpreadsheetApp.flush();
    return 1968;
  } finally {
    lock.releaseLock();
  }
}

function reservarNumeroAP(body) {
  try {
    const ap_id = incrementarConsecutivo();
    getHoja(HOJAS.PREVENTAS).appendRow([ap_id,body.cliente_nit||"",body.vendedor_id||"",
      new Date(),body.tipo_entrega||"Venta en Planta","RESERVADO","","","","",""]);
    SpreadsheetApp.flush();
    return { ok: true, ap_id, mensaje: `AP #${ap_id} reservada` };
  } catch(e) {
    return { ok: false, error: "Error al reservar: " + e.message };
  }
}

function inicializarConsecutivoAP(body) {
  const n = parseInt(body.numero_inicial);
  if (!n || n < 1) return { ok: false, error: "Número inválido" };
  const hoja  = getConfigHoja();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === "ultimo_ap_id") {
      hoja.getRange(i+1, 2).setValue(n);
      SpreadsheetApp.flush();
      return { ok: true, mensaje: `Consecutivo en ${n}. Próxima AP: #${n+1}` };
    }
  }
  hoja.appendRow(["ultimo_ap_id", n]);
  SpreadsheetApp.flush();
  return { ok: true, mensaje: `Consecutivo en ${n}. Próxima AP: #${n+1}` };
}

// =============================================================================
// PROMOCIONES CON VIGENCIA POR FECHAS
// =============================================================================

function getPromociones() {
  const ss   = SpreadsheetApp.openById(SIVIL_SHEET_ID || SHEET_ID);
  const hoja = ss.getSheetByName(HOJAS.PROMOCIONES);
  if (!hoja) return { ok: true, data: [], activas: 0, promociones_activas: [] };
  const hoy  = new Date();
  const todas = hojaAObjetos(hoja);
  const act  = todas.filter(p => {
    if (String(p.activa) === "No") return false;
    const ini = p.fecha_inicio ? new Date(p.fecha_inicio) : new Date(0);
    const fin = p.fecha_fin    ? new Date(p.fecha_fin)    : new Date("2099-12-31");
    fin.setHours(23,59,59);
    return hoy >= ini && hoy <= fin;
  });
  return { ok: true, data: todas, activas: act.length, promociones_activas: act };
}

function crearPromocion(body) {
  const ss  = SpreadsheetApp.openById(SIVIL_SHEET_ID || SHEET_ID);
  let hoja  = ss.getSheetByName(HOJAS.PROMOCIONES);
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS.PROMOCIONES);
    const h = ["id_promo","titulo","descripcion","tmcode","descuento_pct","fecha_inicio","fecha_fin","activa","creado_por","fecha_creacion"];
    hoja.getRange(1,1,1,h.length).setValues([h]);
    hoja.getRange(1,1,1,h.length).setBackground("#7c3200").setFontColor("#fff").setFontWeight("bold");
    hoja.setFrozenRows(1);
  }
  const id = siguienteId(hoja, 0);
  hoja.appendRow([id,body.titulo||"",body.descripcion||"",body.tmcode||"",
    parseFloat(body.descuento_pct)||0,
    body.fecha_inicio||new Date().toISOString().slice(0,10),
    body.fecha_fin||"","Sí",body.creado_por||"Gerencia",new Date()]);
  return { ok: true, mensaje: `Promoción "${body.titulo}" creada`, id_promo: id };
}

function desactivarPromocion(body) {
  const ss  = SpreadsheetApp.openById(SIVIL_SHEET_ID || SHEET_ID);
  const h   = ss.getSheetByName(HOJAS.PROMOCIONES);
  if (!h) return { ok: false, error: "Sin promociones" };
  const d   = h.getDataRange().getValues();
  const hdr = d[0].map(x => String(x).trim());
  const ci  = hdr.indexOf("id_promo"), ca = hdr.indexOf("activa");
  for (let i = 1; i < d.length; i++) {
    if (String(d[i][ci]) === String(body.id_promo)) {
      h.getRange(i+1,ca+1).setValue("No");
      return { ok: true, mensaje: `Promoción #${body.id_promo} desactivada` };
    }
  }
  return { ok: false, error: "No encontrada" };
}

function registrarAveria(body) {
  return registrarNovedad({ ...body, categoria: "cargue" });
}

// Categorías válidas: "cargue", "restribado", "reposicion", "merma_segunda"
// (definidas en la reunión de Gerencia del 02/07/2026). Las 3 primeras
// descuentan del stock bruto; "merma_segunda" NO descuenta — reclasifica
// unidades que siguen siendo vendibles a otra condición de precio.
const COLUMNA_POR_CATEGORIA = {
  cargue:        "cant_averia_cargue",
  restribado:    "cant_averia_restribado",
  reposicion:    "cant_reposicion",
  merma_segunda: "cant_merma_segunda"
};

function registrarNovedad(body) {
  const categoria = body.categoria || "cargue";
  const colNombre = COLUMNA_POR_CATEGORIA[categoria];
  if (!colNombre) return { ok: false, error: "Categoría de novedad no reconocida: " + categoria };

  const hoja  = getHoja(HOJAS.PATIO);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colAp = hdrs.indexOf("ap_id");
  let colCat  = hdrs.indexOf(colNombre);

  // Auto-migración: si la columna de esta categoría aún no existe, se crea.
  if (colCat === -1) {
    colCat = hdrs.length;
    hoja.getRange(1, colCat + 1).setValue(colNombre);
  }

  const cantidad = parseFloat(body.cantidad ?? body.cant_averias) || 0;

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colAp]) === String(body.ap_id)) {
      const actual = parseFloat(datos[i][colCat]) || 0;
      hoja.getRange(i + 1, colCat + 1).setValue(actual + cantidad);

      // Solo las categorías que reducen stock afectan tmcant directamente.
      if (categoria !== "merma_segunda") {
        actualizarStock({ tmcode: body.tmcode, tmcant: obtenerStockBruto(body.tmcode) - cantidad });
      }

      const etiquetas = {
        cargue: "Avería por cargue", restribado: "Avería por restribado",
        reposicion: "Reposición (cortesía)", merma_segunda: "Merma / saldo de segunda"
      };
      return { ok: true, mensaje: `${etiquetas[categoria]}: ${cantidad} unidades registradas` };
    }
  }
  return { ok: false, error: "Despacho no encontrado para esa AP" };
}

// Crea un vehículo nuevo en la biblioteca compartida VEHICULOS, o lo
// actualiza si la placa ya existe (upsert por placa — nunca borra flota
// existente). Conectado al botón "Agregar vehículo" de la app Despacho,
// que ya existía en el frontend pero no tenía backend (corregido 03/07/2026).
function crearVehiculo(body) {
  const hoja = getHoja(HOJAS.VEHICULOS);
  const datos = hoja.getDataRange().getValues();
  const hdrs = datos[0].map(h => String(h).trim());
  const colPlaca = hdrs.indexOf("placa");
  const placa = String(body.placa || "").trim().toUpperCase();
  if (!placa) return { ok: false, error: "Placa requerida" };

  const fila = [
    body.vehiculo_id || Date.now(),
    placa,
    body.marca || "",
    body.modelo || "",
    body.color || "",
    body.capacidad_und || "",
    body.conductor_nombre || "",
    body.conductor_cel || "",
    body.conductor_cc || "",
    body.estado || "Activo",
    body.notas || ""
  ];

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colPlaca]).trim().toUpperCase() === placa) {
      hoja.getRange(i + 1, 1, 1, fila.length).setValues([fila]);
      return { ok: true, mensaje: `Vehículo ${placa} actualizado` };
    }
  }
  hoja.appendRow(fila);
  return { ok: true, mensaje: `Vehículo ${placa} agregado a la biblioteca` };
}

function registrarCurado(body) {
  const hoja = getHoja(HOJAS.PATIO);
  const id   = siguienteId(hoja, 0);
  hoja.appendRow([
    id,
    body.ap_id || "",
    body.tmcode || "",
    body.cant_en_curado,
    body.fecha_liberacion_curado || "",
    0, "", "", new Date()
  ]);
  return { ok: true, mensaje: `Lote de ${body.cant_en_curado} unidades en curado hasta ${body.fecha_liberacion_curado}`, despacho_id: id };
}

function liberarCurado(body) {
  const hoja  = getHoja(HOJAS.PATIO);
  const datos = hoja.getDataRange().getValues();
  const hdrs  = datos[0].map(h => String(h).trim());
  const colId = hdrs.indexOf("despacho_id");
  const colC  = hdrs.indexOf("cant_en_curado");

  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][colId]) === String(body.despacho_id)) {
      hoja.getRange(i+1, colC+1).setValue(0); // Ya liberado
      return { ok: true, mensaje: "Lote liberado del curado" };
    }
  }
  return { ok: false, error: "Registro de curado no encontrado" };
}

function getDespachos(ap_id) {
  const datos = hojaAObjetos(getHoja(HOJAS.PATIO));
  const res   = ap_id ? datos.filter(d => String(d.ap_id) === String(ap_id)) : datos;
  return { ok: true, data: res };
}

function getCurados() {
  const datos = hojaAObjetos(getHoja(HOJAS.PATIO));
  const hoy   = new Date();
  const res   = datos.filter(d => (parseFloat(d.cant_en_curado) || 0) > 0);
  return {
    ok: true,
    data: res.map(d => ({
      ...d,
      dias_restantes: d.fecha_liberacion_curado
        ? Math.ceil((new Date(d.fecha_liberacion_curado) - hoy) / 86400000)
        : null
    }))
  };
}

function obtenerStockBruto(tmcode) {
  const datos = hojaAObjetos(getHoja(HOJAS.PRODUCTOS));
  const prod  = datos.find(p => String(p.tmcode) === String(tmcode));
  return prod ? (parseFloat(prod.tmcant) || 0) : 0;
}

// =============================================================================
// MÓDULO: DASHBOARD Y ALERTAS
// =============================================================================
function getDashboard() {
  const aps      = hojaAObjetos(getHoja(HOJAS.PREVENTAS));
  const detalles = hojaAObjetos(getHoja(HOJAS.DETALLE));
  const vendedores = hojaAObjetos(getHoja(HOJAS.VENDEDORES));

  // Ventas por vendedor
  const ventasPorVendedor = {};
  aps.filter(a => a.estado_ap !== "Cancelado").forEach(ap => {
    const v = String(ap.vendedor_id);
    if (!ventasPorVendedor[v]) ventasPorVendedor[v] = { ap_count: 0, vendedor_id: v };
    ventasPorVendedor[v].ap_count++;
  });

  // APs por estado
  const porEstado = {};
  aps.forEach(ap => {
    porEstado[ap.estado_ap] = (porEstado[ap.estado_ap] || 0) + 1;
  });

  // Productos con stock negativo (alerta de producción)
  const inv = getInventarioDinamico().data || [];
  const alertasNegativas = inv.filter(p => p.disponible <= 0);

  return {
    ok: true,
    data: {
      total_aps:           aps.length,
      aps_por_estado:      porEstado,
      ventas_por_vendedor: Object.values(ventasPorVendedor),
      alertas_negativas:   alertasNegativas.length,
      inventario_resumen:  inv
    }
  };
}

function getAlertasProduccion() {
  const inv = getInventarioDinamico().data || [];
  const alertas = inv
    .filter(p => p.disponible <= 0)
    .map(p => ({
      tmcode:      p.tmcode,
      tmdescrip:   p.tmdescrip,
      disponible:  p.disponible,
      unidades_a_producir: Math.abs(p.disponible) + 5, // Buffer sugerido
      urgencia:    p.disponible < -10 ? "CRÍTICA" : "ALTA"
    }));
  return { ok: true, data: alertas };
}

// =============================================================================
// SETUP: Crear estructura del Google Sheet automáticamente
// Ejecutar UNA SOLA VEZ desde el editor de GAS
// =============================================================================
function inicializarSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  const estructura = {
    [HOJAS.PRODUCTOS]:  ["tmcode","tmdescrip","tmund","tmcant"],
    [HOJAS.VENDEDORES]: ["id_vendedor","nombre_vendedor","correo_usuario","estado"],
    [HOJAS.CLIENTES]:   ["cliente_nit","razon_social","vendedor_asignado","coordenadas_home","foto_fachada_url"],
    [HOJAS.PREVENTAS]:  ["ap_id","cliente_nit","vendedor_id","fecha_creacion","tipo_entrega","estado_ap"],
    [HOJAS.DETALLE]:    ["detalle_id","ap_id","tmcode","cantidad_solicitada","cantidad_despachada","descuento_aplicado"],
    [HOJAS.PATIO]:      ["despacho_id","ap_id","tmcode","cant_en_curado","fecha_liberacion_curado","cant_mermas_averias","placa_vehiculo","evidencia_carga_url","fecha_registro","cant_averia_cargue","cant_averia_restribado","cant_reposicion","cant_merma_segunda"],
    [HOJAS.PRECIOS]:    ["id_precio","tmcode","precio_base_planta","descuento_max_vendedor","costo_flete_unidad_zonaA","costo_flete_unidad_zonaB","fecha_vigencia_inicio","fecha_vigencia_fin"]
  };

  Object.entries(estructura).forEach(([nombre, cols]) => {
    let hoja = ss.getSheetByName(nombre);
    if (!hoja) {
      hoja = ss.insertSheet(nombre);
    }
    hoja.getRange(1, 1, 1, cols.length).setValues([cols]);
    hoja.getRange(1, 1, 1, cols.length)
      .setBackground("#1a3a5c")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    hoja.setFrozenRows(1);
    Logger.log(`✅ Hoja '${nombre}' configurada`);
  });

  // Datos de prueba: Vendedores
  const hV = ss.getSheetByName(HOJAS.VENDEDORES);
  if (hV.getLastRow() < 2) {
    hV.getRange("A2:D4").setValues([
      [1093945001, "Jose Eduardo Ramírez",  "joseduardo@postecsa.com",  "Activo"],
      [1093945002, "Felipe Andrés Muñoz",   "felipeandres@postecsa.com","Activo"],
      [1093945003, "Valentina Torres",      "valentina@postecsa.com",   "Activo"]
    ]);
  }

  // Datos de prueba: Productos de muestra
  const hP = ss.getSheetByName(HOJAS.PRODUCTOS);
  if (hP.getLastRow() < 2) {
    hP.getRange("A2:D6").setValues([
      [1001, "Poste Centrifugado 8M x 300kg",  "UND", 45],
      [1002, "Poste Centrifugado 10M x 400kg", "UND", 30],
      [1003, "Poste Vibro-compactado 6M",       "UND", 60],
      [1004, "Adoquín Tipo A 20x10x8",          "M2",  200],
      [1005, "Bordillo Prefabricado BV-1",       "ML",  150]
    ]);
  }

  Logger.log("✅ SIVEL: Inicialización completa");
  return "Inicialización exitosa";
}
