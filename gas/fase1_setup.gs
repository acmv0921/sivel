/**
 * SIVIL — FASE 1: Setup completo base de datos
 * Ejecutar en orden:
 *   1. crearUsuariosMaestro()
 *   2. limpiarCatalogo()
 *   3. verificarFase1()
 */

var SHEET_ID = "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI";

// ═══════════════════════════════════════════════════════════════
// 1. CREAR HOJA USUARIOS_MAESTRO
// ═══════════════════════════════════════════════════════════════
function crearUsuariosMaestro() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Crear o limpiar hoja
  var h = ss.getSheetByName("USUARIOS_MAESTRO");
  if (!h) h = ss.insertSheet("USUARIOS_MAESTRO");
  else h.clearContents();

  var hdrs = ["id_usuario","cedula","nombre_completo","correo",
              "pin_individual","rol","estado","cargo","creado_por","fecha_creacion"];
  var rH = h.getRange(1,1,1,hdrs.length);
  rH.setValues([hdrs]);
  rH.setBackground("#07111C").setFontColor("#E05C1A")
    .setFontWeight("bold").setFontFamily("Arial").setFontSize(10);
  h.setFrozenRows(1);

  // Usuarios reales POSTECSA con PINs individuales únicos
  // IMPORTANTE: El Admin debe cambiar estos PINs en el primer acceso
  var usuarios = [
    [1, 1093944000,  "Abdiel Cicar Moreno Velasquez",    "acmv0921@gmail.com",       "ADMIN2026$",   "ADMIN",        "ACTIVO", "Administrador Master",          "SISTEMA",          new Date()],
    [2, 3149227,     "Nohra Constanza Jimenez Hidalgo",  "Gerencia@postecsa.com",    "GER#8823",     "GERENTE",      "ACTIVO", "Gerente General",               "acmv0921@gmail.com", new Date()],
    [3, 1006054987,  "Valentina Garcia",                 "Despachos@postecsa.com",   "DSP#4417",     "DESPACHADOR",  "ACTIVO", "Despacho y Patio",              "acmv0921@gmail.com", new Date()],
    [4, 16777882,    "Felipe Andres Guendica Moreno",    "Ventas@postecsa.com",       "VNT#2291",     "VENDEDOR",     "ACTIVO", "Asesor Comercial",              "acmv0921@gmail.com", new Date()],
    [5, 10243199,    "Jose Eduardo Garcia Cano",         "Ventas1@postecsa.com",     "VNT#5538",     "VENDEDOR",     "ACTIVO", "Asesor Comercial",              "acmv0921@gmail.com", new Date()],
    [6, 1193585144,  "Juan Jose Lasso",                  "Ventas2@postecsa.com",     "VNT#7764",     "VENDEDOR",     "ACTIVO", "Asesor Comercial",              "acmv0921@gmail.com", new Date()],
    [7, "",          "Por asignar",                      "Ventas3@postecsa.com",     "VNT#0003",     "VENDEDOR",     "INACTIVO","Asesor Comercial",             "acmv0921@gmail.com", new Date()],
    [8, "",          "Jaime Guardiola",                  "Jhguardiola@gmail.com",    "JFV#3310",     "JEFE_VENTAS",  "ACTIVO", "Jefe de Ventas",               "acmv0921@gmail.com", new Date()],
  ];

  h.getRange(2,1,usuarios.length,hdrs.length).setValues(usuarios);
  for (var c=1;c<=hdrs.length;c++) h.autoResizeColumn(c);

  // Ocultar columna PIN (col 5) para que no sea visible fácilmente
  h.hideColumns(5);

  // Proteger hoja — solo Admin puede editar
  var prot = h.protect();
  prot.setDescription("Solo Administrador Master puede modificar");

  Logger.log("✅ USUARIOS_MAESTRO creado: " + usuarios.length + " usuarios");
  SpreadsheetApp.getUi().alert(
    "✅ USUARIOS_MAESTRO creado\n\n" +
    "Usuarios registrados: " + usuarios.length + "\n\n" +
    "PINs individuales asignados:\n" +
    "- Abdiel (Admin): ADMIN2026$\n" +
    "- Nohra (Gerente): GER#8823\n" +
    "- Valentina (Despacho): DSP#4417\n" +
    "- Felipe (Vendedor): VNT#2291\n" +
    "- Jose Eduardo (Vendedor): VNT#5538\n" +
    "- Juan Jose (Vendedor): VNT#7764\n" +
    "- Jaime Guardiola (Jefe Ventas): JFV#3310\n\n" +
    "⚠️ IMPORTANTE: Comunica a cada funcionario su PIN individual.\n" +
    "La columna PIN está oculta en el Sheet por seguridad.\n\n" +
    "Ahora ejecuta limpiarCatalogo()"
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. LIMPIAR CATÁLOGO — pretensados + columna activo + mínimos
// ═══════════════════════════════════════════════════════════════
function limpiarCatalogo() {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName("PRODUCTOS_MAESTRO");

  if (!hoja) {
    SpreadsheetApp.getUi().alert("❌ No existe PRODUCTOS_MAESTRO. Ejecuta primero cargarProductosConPrecios()");
    return;
  }

  var datos = hoja.getDataRange().getValues();
  var hdrs  = datos[0];

  // Verificar si ya tiene columnas activo y tmcant_minimo
  var colActivo  = hdrs.indexOf("activo");
  var colMinimo  = hdrs.indexOf("tmcant_minimo");
  var colCode    = hdrs.indexOf("tmcode");
  var colDescrip = hdrs.indexOf("tmdescrip");

  // Agregar columna activo si no existe
  if (colActivo === -1) {
    hoja.insertColumnAfter(hdrs.length);
    hoja.getRange(1, hdrs.length+1).setValue("activo");
    hoja.getRange(1, hdrs.length+1).setBackground("#07111C").setFontColor("#E05C1A").setFontWeight("bold");
    colActivo = hdrs.length;
    // Marcar todos como activos por defecto
    var totalFilas = datos.length - 1;
    hoja.getRange(2, colActivo+1, totalFilas, 1).setValue("S");
    Logger.log("Columna 'activo' agregada");
  }

  // Agregar columna tmcant_minimo si no existe
  if (colMinimo === -1) {
    var totalCols = hoja.getLastColumn();
    hoja.insertColumnAfter(totalCols);
    hoja.getRange(1, totalCols+1).setValue("tmcant_minimo");
    hoja.getRange(1, totalCols+1).setBackground("#07111C").setFontColor("#E05C1A").setFontWeight("bold");
    colMinimo = totalCols;
    // Mínimo default = 5 unidades
    var totalFilas2 = hoja.getLastRow() - 1;
    hoja.getRange(2, totalCols+1, totalFilas2, 1).setValue(5);
    Logger.log("Columna 'tmcant_minimo' agregada — default: 5 unidades");
  }

  // Re-leer con columnas actualizadas
  datos = hoja.getDataRange().getValues();
  hdrs  = datos[0];
  colActivo  = hdrs.indexOf("activo");
  colCode    = hdrs.indexOf("tmcode");
  colDescrip = hdrs.indexOf("tmdescrip");

  // Marcar pretensados como INACTIVOS
  var codigosPretensados = ["3118", "3122", "3126", "31126"];
  var pretensadosMarcados = 0;
  var pretensadosPorNombre = 0;

  for (var i=1; i<datos.length; i++) {
    var codigo  = String(datos[i][colCode]).trim();
    var descrip = String(datos[i][colDescrip]).toUpperCase();

    var esPretensado = codigosPretensados.indexOf(codigo) >= 0 ||
                       descrip.indexOf('PRETEN') >= 0;

    if (esPretensado) {
      hoja.getRange(i+1, colActivo+1).setValue("N");
      hoja.getRange(i+1, 1, 1, hoja.getLastColumn())
          .setBackground("#FEE2E2");  // fondo rojo claro = inactivo
      if (codigosPretensados.indexOf(codigo) >= 0) pretensadosMarcados++;
      else pretensadosPorNombre++;
      Logger.log("Inactivo: " + codigo + " | " + datos[i][colDescrip]);
    }
  }

  // Marcar activos con fondo blanco
  for (var j=1; j<datos.length; j++) {
    if (String(datos[j][colActivo]).trim() !== "N") {
      hoja.getRange(j+1, 1, 1, hoja.getLastColumn()).setBackground("#FFFFFF");
    }
  }

  for (var c=1;c<=hoja.getLastColumn();c++) hoja.autoResizeColumn(c);

  var totalActivos = datos.slice(1).filter(r=>String(r[colActivo]).trim()!=="N").length;
  var totalInactivos = datos.slice(1).filter(r=>String(r[colActivo]).trim()==="N").length;

  SpreadsheetApp.getUi().alert(
    "✅ Catálogo depurado\n\n" +
    "Pretensados desactivados (por código): " + pretensadosMarcados + "\n" +
    "Pretensados desactivados (por nombre): " + pretensadosPorNombre + "\n\n" +
    "Productos ACTIVOS: " + totalActivos + "\n" +
    "Productos INACTIVOS: " + totalInactivos + "\n\n" +
    "Columnas nuevas agregadas:\n" +
    "  - activo (S/N)\n" +
    "  - tmcant_minimo (default: 5 unidades)\n\n" +
    "Ahora ejecuta verificarFase1()"
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. VERIFICAR FASE 1
// ═══════════════════════════════════════════════════════════════
function verificarFase1() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var checks = [];

  // Check 1: USUARIOS_MAESTRO
  var hU = ss.getSheetByName("USUARIOS_MAESTRO");
  if (hU) {
    var usuarios = hU.getLastRow() - 1;
    checks.push("✅ USUARIOS_MAESTRO: " + usuarios + " usuarios registrados");
  } else {
    checks.push("❌ USUARIOS_MAESTRO: NO existe");
  }

  // Check 2: PRODUCTOS_MAESTRO
  var hP = ss.getSheetByName("PRODUCTOS_MAESTRO");
  if (hP) {
    var datos  = hP.getDataRange().getValues();
    var hdrs   = datos[0];
    var tieneActivo  = hdrs.indexOf("activo")        >= 0;
    var tieneMinimo  = hdrs.indexOf("tmcant_minimo") >= 0;
    var activos   = datos.slice(1).filter(r=>String(r[hdrs.indexOf("activo")]).trim()==="S").length;
    var inactivos = datos.slice(1).filter(r=>String(r[hdrs.indexOf("activo")]).trim()==="N").length;
    checks.push("✅ PRODUCTOS_MAESTRO: " + (datos.length-1) + " productos");
    checks.push(tieneActivo  ? "✅ Columna 'activo' presente"        : "❌ Columna 'activo' falta");
    checks.push(tieneMinimo  ? "✅ Columna 'tmcant_minimo' presente" : "❌ Columna 'tmcant_minimo' falta");
    checks.push("✅ Activos: " + activos + " | Inactivos (pretensados): " + inactivos);
  } else {
    checks.push("❌ PRODUCTOS_MAESTRO: NO existe");
  }

  // Check 3: Hojas existentes
  var hojas = ss.getSheets().map(function(s){return s.getName();});
  var requeridas = ["USUARIOS_MAESTRO","PRODUCTOS_MAESTRO","PRECIOS_GERENCIA",
                    "VENDEDORES","VEHICULOS","ADMIN_CONFIG"];
  requeridas.forEach(function(nombre){
    checks.push(hojas.indexOf(nombre)>=0 ? "✅ Hoja " + nombre : "⚠️ Hoja " + nombre + " (pendiente)");
  });

  SpreadsheetApp.getUi().alert("VERIFICACIÓN FASE 1\n\n" + checks.join("\n"));
  Logger.log(checks.join("\n"));
}
