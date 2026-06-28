/**
 * SIVEL - Script de Inicialización del Google Sheet
 * Ejecutar desde Google Apps Script: menu Ejecutar → inicializarSIVEL
 * Solo se ejecuta UNA VEZ para crear la estructura de tablas.
 */

function inicializarSIVEL() {
  // ⚠️ Cambia esta URL por la de TU Google Sheet
  // Abre tu Sheet → copia el ID de la URL (entre /d/ y /edit)
  const SHEET_ID = "REEMPLAZAR_CON_TU_SHEET_ID";

  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Eliminar hoja por defecto "Hoja 1" si existe y está vacía
  const hojaDefault = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
  if (hojaDefault && ss.getSheets().length > 1) {
    ss.deleteSheet(hojaDefault);
  }

  const COLOR_HEADER = "#1a3a5c";  // Azul POSTECSA
  const COLOR_TEXTO  = "#FFFFFF";

  function crearHoja(nombre, columnas, datosEjemplo) {
    let hoja = ss.getSheetByName(nombre);
    if (!hoja) hoja = ss.insertSheet(nombre);
    else hoja.clear();

    // Encabezados
    const rng = hoja.getRange(1, 1, 1, columnas.length);
    rng.setValues([columnas]);
    rng.setBackground(COLOR_HEADER);
    rng.setFontColor(COLOR_TEXTO);
    rng.setFontWeight("bold");
    rng.setFontFamily("Arial");
    rng.setFontSize(10);
    hoja.setFrozenRows(1);

    // Autoajustar columnas
    for (let i = 1; i <= columnas.length; i++) {
      hoja.autoResizeColumn(i);
    }

    // Datos de ejemplo
    if (datosEjemplo && datosEjemplo.length > 0) {
      hoja.getRange(2, 1, datosEjemplo.length, columnas.length)
          .setValues(datosEjemplo);
    }

    Logger.log(`✅ Hoja creada: ${nombre}`);
    return hoja;
  }

  // -----------------------------------------------------------------------
  // 1. PRODUCTOS_MAESTRO
  // -----------------------------------------------------------------------
  crearHoja(
    "PRODUCTOS_MAESTRO",
    ["tmcode", "tmdescrip", "tmund", "tmcant"],
    [
      [1001, "Poste Centrifugado 8M x 300kg DAP",   "UND", 45],
      [1002, "Poste Centrifugado 10M x 400kg DAP",  "UND", 30],
      [1003, "Poste Centrifugado 12M x 500kg DAP",  "UND", 12],
      [1004, "Poste Vibro-compactado 6M",            "UND", 60],
      [1005, "Poste Vibro-compactado 8M",            "UND", 25],
      [1006, "Adoquín Tipo A 20x10x8",               "M2",  200],
      [1007, "Adoquín Tipo B Biselado 20x10x6",      "M2",  150],
      [1008, "Bordillo Prefabricado BV-1",            "ML",  180],
      [1009, "Bordillo Doble BV-2",                   "ML",  90],
      [1010, "Bloque de Concreto 20x20x40",           "UND", 500]
    ]
  );

  // -----------------------------------------------------------------------
  // 2. VENDEDORES
  // -----------------------------------------------------------------------
  crearHoja(
    "VENDEDORES",
    ["id_vendedor", "nombre_vendedor", "correo_usuario", "estado"],
    [
      [1093945001, "Jose Eduardo Ramírez",  "joseduardo@postecsa.com",   "Activo"],
      [1093945002, "Felipe Andrés Muñoz",   "felipeandres@postecsa.com", "Activo"],
      [1093945003, "Valentina Torres Ruiz", "valentina@postecsa.com",    "Activo"]
    ]
  );

  // -----------------------------------------------------------------------
  // 3. CLIENTES
  // -----------------------------------------------------------------------
  crearHoja(
    "CLIENTES",
    ["cliente_nit", "razon_social", "vendedor_asignado", "coordenadas_home", "foto_fachada_url"],
    [
      ["900123456-1", "Constructora Andina S.A.S.",       1093945001, "3.4516,-76.5320", ""],
      ["800987654-2", "Urbanización Los Cedros Ltda.",    1093945002, "3.8654,-76.4982", ""],
      ["901234567-3", "Obras Civiles del Valle S.A.",     1093945001, "3.9012,-76.3011", ""],
      ["700111222-4", "Ingeniería y Concretos CENCAR",    1093945002, "3.8750,-76.4890", ""],
      ["830456789-5", "Constructora Buenaventura E.U.",   1093945003, "3.8833,-77.0311", ""]
    ]
  );

  // -----------------------------------------------------------------------
  // 4. PREVENTAS_AP
  // -----------------------------------------------------------------------
  crearHoja(
    "PREVENTAS_AP",
    ["ap_id", "cliente_nit", "vendedor_id", "fecha_creacion", "tipo_entrega", "estado_ap"],
    [
      [1, "900123456-1", 1093945001, new Date("2026-06-20"), "Con Transporte",   "Despachado Total"],
      [2, "800987654-2", 1093945002, new Date("2026-06-22"), "Venta en Planta",  "Pendiente"],
      [3, "901234567-3", 1093945001, new Date("2026-06-25"), "Con Transporte",   "Despachado Parcial"],
      [4, "700111222-4", 1093945002, new Date("2026-06-27"), "Con Transporte",   "Pendiente"]
    ]
  );

  // -----------------------------------------------------------------------
  // 5. DETALLE_AP
  // -----------------------------------------------------------------------
  crearHoja(
    "DETALLE_AP",
    ["detalle_id", "ap_id", "tmcode", "cantidad_solicitada", "cantidad_despachada", "descuento_aplicado"],
    [
      [1, 1, 1001, 10,  10,  0.05],
      [2, 1, 1006, 50,  50,  0.00],
      [3, 2, 1002, 8,   0,   0.08],
      [4, 2, 1008, 30,  0,   0.00],
      [5, 3, 1001, 15,  10,  0.05],
      [6, 3, 1003, 4,   2,   0.00],
      [7, 4, 1004, 100, 0,   0.10],
      [8, 4, 1007, 80,  0,   0.05]
    ]
  );

  // -----------------------------------------------------------------------
  // 6. CONTROL_PATIO_Y_LOGISTICA
  // -----------------------------------------------------------------------
  crearHoja(
    "CONTROL_PATIO_Y_LOGISTICA",
    ["despacho_id","ap_id","tmcode","cant_en_curado","fecha_liberacion_curado",
     "cant_mermas_averias","placa_vehiculo","evidencia_carga_url","fecha_registro"],
    [
      [1, 1, 1001, 0,  "",             0, "TRF-987",  "", new Date("2026-06-20")],
      [2, 3, 1001, 0,  "",             0, "VXD-234",  "", new Date("2026-06-25")],
      [3, "", 1003, 8, "2026-07-05",   0, "",         "", new Date("2026-06-26")]
    ]
  );

  // -----------------------------------------------------------------------
  // 7. PRECIOS_GERENCIA
  // -----------------------------------------------------------------------
  crearHoja(
    "PRECIOS_GERENCIA",
    ["id_precio","tmcode","precio_base_planta","descuento_max_vendedor",
     "costo_flete_unidad_zonaA","costo_flete_unidad_zonaB",
     "fecha_vigencia_inicio","fecha_vigencia_fin"],
    [
      [1, 1001, 285000, 0.08,  12000, 18000, "2026-01-01", "2026-12-31"],
      [2, 1002, 380000, 0.08,  15000, 22000, "2026-01-01", "2026-12-31"],
      [3, 1003, 520000, 0.06,  20000, 30000, "2026-01-01", "2026-12-31"],
      [4, 1004, 125000, 0.10,   8000, 12000, "2026-01-01", "2026-12-31"],
      [5, 1005, 155000, 0.10,  10000, 15000, "2026-01-01", "2026-12-31"],
      [6, 1006,   4800, 0.10,    500,    800, "2026-01-01", "2026-12-31"],
      [7, 1007,   5200, 0.10,    500,    800, "2026-01-01", "2026-12-31"],
      [8, 1008,  18500, 0.08,   1200,  1800, "2026-01-01", "2026-12-31"],
      [9, 1009,  22000, 0.08,   1500,  2200, "2026-01-01", "2026-12-31"],
      [10,1010,   2800, 0.10,    300,    500, "2026-01-01", "2026-12-31"]
    ]
  );

  // Mensaje final
  SpreadsheetApp.getUi().alert(
    "✅ SIVEL inicializado correctamente\n\n" +
    "Tablas creadas:\n" +
    "• PRODUCTOS_MAESTRO (10 productos)\n" +
    "• VENDEDORES (3 usuarios)\n" +
    "• CLIENTES (5 clientes de prueba)\n" +
    "• PREVENTAS_AP (4 pedidos de prueba)\n" +
    "• DETALLE_AP (8 líneas de detalle)\n" +
    "• CONTROL_PATIO_Y_LOGISTICA (3 registros)\n" +
    "• PRECIOS_GERENCIA (10 políticas de precio)\n\n" +
    "Siguiente paso: Desplegar el GAS como Web App (Implementar → Nueva implementación)"
  );

  Logger.log("🎉 SIVEL: Inicialización completa");
}
