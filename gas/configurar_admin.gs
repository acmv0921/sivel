/**
 * SIVEL — Configurar Administrador Master
 * Ejecutar UNA SOLA VEZ desde Apps Script
 * Abdiel Cicar Moreno Velasquez — acmv0921@gmail.com
 */
function configurarAdminMaster() {
  const SHEET_ID = "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI";
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. Crear hoja ADMIN_CONFIG
  let hojaAdmin = ss.getSheetByName("ADMIN_CONFIG");
  if (!hojaAdmin) hojaAdmin = ss.insertSheet("ADMIN_CONFIG");
  else hojaAdmin.clear();

  const colsAdmin = ["correo", "nombre", "pin_hash", "fecha_creacion", "notas"];
  const rngA = hojaAdmin.getRange(1, 1, 1, colsAdmin.length);
  rngA.setValues([colsAdmin]);
  rngA.setBackground("#15603b").setFontColor("#fff").setFontWeight("bold");
  hojaAdmin.setFrozenRows(1);

  // Datos del admin master
  hojaAdmin.getRange("A2:E2").setValues([[
    "acmv0921@gmail.com",
    "Abdiel Cicar Moreno Velasquez",
    "POSTECSA@2026$",
    new Date(),
    "Administrador Master — Area de Gestion de Mantenimiento y Confiabilidad"
  ]]);

  // Ocultar la hoja de config para que no sea visible
  hojaAdmin.hideSheet();

  // 2. Agregar a Abdiel en la hoja VENDEDORES si no existe
  const hojaVend = ss.getSheetByName("VENDEDORES");
  const datos = hojaVend.getDataRange().getValues();
  const correos = datos.slice(1).map(r => String(r[2]).toLowerCase().trim());

  if (!correos.includes("acmv0921@gmail.com")) {
    hojaVend.appendRow([
      1093944000,
      "Abdiel Cicar Moreno Velasquez",
      "acmv0921@gmail.com",
      "Activo"
    ]);
    Logger.log("Abdiel agregado a VENDEDORES");
  } else {
    Logger.log("Abdiel ya existe en VENDEDORES");
  }

  SpreadsheetApp.getUi().alert(
    "✅ Administrador Master configurado\n\n" +
    "Correo: acmv0921@gmail.com\n" +
    "PIN: POSTECSA@2026$\n\n" +
    "IMPORTANTE: Cambie el PIN despues del primer acceso.\n" +
    "La hoja ADMIN_CONFIG ha sido ocultada por seguridad.\n\n" +
    "Para acceder a la gestion de usuarios:\n" +
    "App Gerencia -> Usuarios -> toque el candado amarillo"
  );
}
