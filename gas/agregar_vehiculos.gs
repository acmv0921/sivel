/**
 * SIVEL - Agregar hoja VEHICULOS al Sheet existente
 * Ejecutar UNA VEZ desde Apps Script
 */
function agregarHojaVehiculos() {
  const SHEET_ID = "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI";
  const ss   = SpreadsheetApp.openById(SHEET_ID);
  const nombre = "VEHICULOS";
  
  let hoja = ss.getSheetByName(nombre);
  if (!hoja) hoja = ss.insertSheet(nombre);
  else hoja.clear();

  const cols = ["vehiculo_id","placa","marca","modelo","color","capacidad_und",
                "conductor_nombre","conductor_cel","conductor_cc","estado","notas"];
  const rng = hoja.getRange(1,1,1,cols.length);
  rng.setValues([cols]);
  rng.setBackground("#7c3200").setFontColor("#fff").setFontWeight("bold").setFontFamily("Arial").setFontSize(10);
  hoja.setFrozenRows(1);
  cols.forEach((_,i) => hoja.autoResizeColumn(i+1));

  // Datos de ejemplo
  hoja.getRange("A2:K5").setValues([
    [1,"TRF-987","Chevrolet","NHR","Blanco",200,"Carlos Pérez","3001234567","12345678","Activo","Camión principal"],
    [2,"VXD-234","Kenworth","T300","Rojo",350,"Luis Torres","3109876543","87654321","Activo","Camión grande"],
    [3,"ABC-123","Mazda","BT50","Gris",150,"Pedro Gómez","3207654321","11223344","Activo","Camioneta"],
    [4,"ZZZ-999","Ford","Cargo","Blanco",400,"Juan López","3156789012","44332211","Inactivo","En mantenimiento"]
  ]);

  SpreadsheetApp.getUi().alert("✅ Hoja VEHICULOS creada con 4 vehículos de ejemplo.\n\nColumnas:\nplaca · marca · modelo · color · capacidad · conductor · celular · CC · estado · notas");
  Logger.log("✅ VEHICULOS creada");
}
