/**
 * SIVEL — Actualizar datos reales de POSTECSA
 * Vendedores, correos, cédulas y vehículos reales
 * Ejecutar: actualizarDatosReales()
 */
function actualizarDatosReales() {
  const SHEET_ID = "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI";
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // ── 1. VENDEDORES reales ────────────────────────────────────
  let hV = ss.getSheetByName("VENDEDORES");
  if (!hV) hV = ss.insertSheet("VENDEDORES");
  else hV.clearContents();

  const hdrsV = ["id_vendedor","nombre_vendedor","correo_usuario","estado","cargo"];
  const rV = hV.getRange(1,1,1,hdrsV.length);
  rV.setValues([hdrsV]);
  rV.setBackground("#1a3a5c").setFontColor("#fff").setFontWeight("bold")
    .setFontFamily("Arial").setFontSize(10);
  hV.setFrozenRows(1);

  const vendedores = [
    [1006054987,  "Valentina Garcia",                "Despachos@postecsa.com",  "Activo","Despachadora"],
    [16777882,    "Felipe Andres Guendica Moreno",   "Ventas@postecsa.com",     "Activo","Vendedor"],
    [10243199,    "Jose Eduardo Garcia Cano",         "Ventas1@postecsa.com",    "Activo","Vendedor"],
    [1193585144,  "Juan Jose Lasso",                  "Ventas2@postecsa.com",    "Activo","Vendedor"],
    ["",          "Vendedor por asignar",             "Ventas3@postecsa.com",    "Inactivo","Vendedor"],
    [1093944000,  "Abdiel Cicar Moreno Velasquez",   "acmv0921@gmail.com",      "Activo","Administrador"],
    ["",          "Jaime Guardiola",                  "Jhguardiola@gmail.com",   "Activo","Jefe de Ventas"],
    [3149227,     "Nohra Constanza Jimenez Hidalgo", "Gerencia@postecsa.com",   "Activo","Gerente General"]
  ];

  hV.getRange(2,1,vendedores.length,hdrsV.length).setValues(vendedores);
  for (let c=1;c<=hdrsV.length;c++) hV.autoResizeColumn(c);
  Logger.log("✅ VENDEDORES: " + vendedores.length + " registros");

  // ── 2. VEHICULOS con placas reales ─────────────────────────
  let hVeh = ss.getSheetByName("VEHICULOS");
  if (!hVeh) hVeh = ss.insertSheet("VEHICULOS");
  else hVeh.clearContents();

  const hdrsVeh = ["vehiculo_id","placa","marca","modelo","color",
                   "capacidad_und","conductor_nombre","conductor_cel",
                   "conductor_cc","estado","notas"];
  const rVeh = hVeh.getRange(1,1,1,hdrsVeh.length);
  rVeh.setValues([hdrsVeh]);
  rVeh.setBackground("#7c3200").setFontColor("#fff").setFontWeight("bold")
      .setFontFamily("Arial").setFontSize(10);
  hVeh.setFrozenRows(1);

  // Placas reales de POSTECSA
  const placas = ["JZX 337", "TIH 346", "WCY 128", "SXJ 693", "VKJ 130", "IFK 202", "AFK 202", "UFK 202", "VKJ 088", "ETK 952", "VOJ 480", "THK 165", "VCC 392", "OOB 522", "FUC 610", "FTI 420", "KJZ 025", "CXP 930", "WA 421", "CKT 147", "VAC 257", "ORA 962", "PEC 665", "OKA 262"];
  const vehiculos = placas.map((placa, i) => [
    i + 1, placa, "", "", "", "", "", "", "", "Activo", "Flota POSTECSA"
  ]);

  hVeh.getRange(2,1,vehiculos.length,hdrsVeh.length).setValues(vehiculos);
  for (let c=1;c<=hdrsVeh.length;c++) hVeh.autoResizeColumn(c);
  Logger.log("✅ VEHICULOS: " + vehiculos.length + " placas reales");

  SpreadsheetApp.getUi().alert(
    "✅ Datos reales actualizados\n\n" +
    "VENDEDORES: " + vendedores.length + " funcionarios\n" +
    "  - Valentina Garcia (Despachos)\n" +
    "  - Felipe Andres Guendica (Ventas)\n" +
    "  - Jose Eduardo Garcia Cano (Ventas1)\n" +
    "  - Juan Jose Lasso (Ventas2)\n" +
    "  - Ventas3 (por asignar)\n" +
    "  - Jaime Guardiola (Jefe Ventas)\n" +
    "  - Nohra Constanza Jimenez (Gerente)\n\n" +
    "VEHICULOS: 24 placas reales de POSTECSA\n\n" +
    "IMPORTANTE: Complete marca, modelo, color y\n" +
    "datos del conductor de cada vehiculo en la hoja VEHICULOS."
  );
}
