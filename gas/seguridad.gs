// =============================================================================
// SIVIL — SEGURIDAD · FASE 1 (16 oct 2026)
// -----------------------------------------------------------------------------
// Qué hace este archivo:
//   1. El login pasa al SERVIDOR: la app envía correo + PIN y el backend decide.
//      El PIN ya no viaja al navegador ni se compara en la pantalla.
//   2. Los PIN viven con hash (SHA-256 + sal) en un Sheet PRIVADO, aparte del
//      Sheet de datos. Ese Sheet privado nadie lo comparte: solo lo lee este script.
//   3. Cada login correcto devuelve un "pase" firmado (HMAC) con vencimiento.
//      En la Fase 2 el backend exigirá ese pase en cada petición.
//   4. Tope de intentos: 5 fallos por correo → espera de 15 minutos.
//   5. Interruptor maestro: bloquearSistema() / desbloquearSistema().
//      Con el bloqueo activo solo el ADMIN_CORREO puede iniciar sesión.
//
// Cómo se instala (una sola vez, en este orden, desde el editor de Apps Script):
//   a) Pegar este archivo como "seguridad.gs" y publicar el backend como NUEVA VERSIÓN.
//   b) Ejecutar  configurarSeguridad()      → crea el Sheet privado y los secretos.
//   c) Ejecutar  migrarPinesAPrivado()      → copia los PIN actuales (con hash) al Sheet privado.
//   d) Publicar las apps nuevas (Comercial, Despacho, Gerencia, Suministros).
//   e) Ejecutar  ocultarPinesPublicos()     → borra los PIN de la hoja USUARIOS_MAESTRO.
// No hay que escribir ninguna clave a mano: los secretos se generan solos.
// =============================================================================

var SEG = {
  HOJA_PINES: "PINES",
  INTENTOS_MAX: 5,
  BLOQUEO_SEG: 900,   // 15 minutos
  PASE_DIAS: 14
};

// ---------- Configuración inicial ----------
function configurarSeguridad() {
  var props = PropertiesService.getScriptProperties();
  var lineas = [];
  if (!props.getProperty("PIN_SHEET_ID")) {
    var ss = SpreadsheetApp.create("SIVIL - PINES PRIVADO (no compartir)");
    var h = ss.getSheets()[0];
    h.setName(SEG.HOJA_PINES);
    h.getRange(1, 1, 1, 3).setValues([["correo", "pin_hash", "actualizado"]]);
    props.setProperty("PIN_SHEET_ID", ss.getId());
    lineas.push("Sheet privado creado: " + ss.getUrl());
  } else {
    lineas.push("El Sheet privado ya existía.");
  }
  if (!props.getProperty("PIN_SALT")) { props.setProperty("PIN_SALT", _segAleatorio(48)); lineas.push("Sal de PIN generada."); }
  if (!props.getProperty("PASE_SECRETO")) { props.setProperty("PASE_SECRETO", _segAleatorio(64)); lineas.push("Secreto de pases generado."); }
  if (!props.getProperty("ADMIN_CORREO")) { props.setProperty("ADMIN_CORREO", "acmv0921@gmail.com"); lineas.push("Administrador: acmv0921@gmail.com"); }
  Logger.log(lineas.join("\n"));
  return lineas.join("\n");
}

function _segAleatorio(n) {
  var s = "";
  while (s.length < n) s += Utilities.getUuid().replace(/-/g, "");
  return s.substring(0, n);
}

function segActiva() {
  return !!PropertiesService.getScriptProperties().getProperty("PIN_SHEET_ID");
}

// ---------- Hash y comparación ----------
function _segHex(bytes) {
  return bytes.map(function (b) { return ("0" + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join("");
}
function _segHashPin(correo, pin) {
  var sal = PropertiesService.getScriptProperties().getProperty("PIN_SALT") || "";
  var texto = sal + "|" + String(correo).trim().toLowerCase() + "|" + String(pin);
  return _segHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8));
}
// Comparación en tiempo constante (evita filtrar información por tiempos de respuesta).
function _segIgual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  var r = 0;
  for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ---------- Sheet privado de PIN ----------
function _segHojaPines() {
  var id = PropertiesService.getScriptProperties().getProperty("PIN_SHEET_ID");
  if (!id) return null;
  var ss = SpreadsheetApp.openById(id);
  var h = ss.getSheetByName(SEG.HOJA_PINES);
  if (!h) {
    h = ss.insertSheet(SEG.HOJA_PINES);
    h.getRange(1, 1, 1, 3).setValues([["correo", "pin_hash", "actualizado"]]);
  }
  return h;
}
function _segGuardarPin(correo, pin) {
  var h = _segHojaPines();
  if (!h) throw new Error("Seguridad no configurada: ejecuta configurarSeguridad()");
  var c = String(correo).trim().toLowerCase();
  var hash = _segHashPin(c, pin);
  var datos = h.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).trim().toLowerCase() === c) {
      h.getRange(i + 1, 2, 1, 2).setValues([[hash, new Date()]]);
      return;
    }
  }
  h.appendRow([c, hash, new Date()]);
}
// true / false si hay PIN privado registrado para el correo; null si no hay registro.
function _segPinCorrecto(correo, pin) {
  var h = _segHojaPines();
  if (!h) return null;
  var c = String(correo).trim().toLowerCase();
  var datos = h.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).trim().toLowerCase() === c) {
      return _segIgual(datos[i][1], _segHashPin(c, pin));
    }
  }
  return null;
}

// ---------- Tope de intentos ----------
function _segIntentos(correo) {
  return Number(CacheService.getScriptCache().get("seg_int_" + correo) || 0);
}
function _segFallo(correo) {
  CacheService.getScriptCache().put("seg_int_" + correo, String(_segIntentos(correo) + 1), SEG.BLOQUEO_SEG);
}
function _segLimpiarIntentos(correo) {
  CacheService.getScriptCache().remove("seg_int_" + correo);
}

// ---------- Pase firmado ----------
function _segEmitirPase(correo, rol) {
  var secreto = PropertiesService.getScriptProperties().getProperty("PASE_SECRETO");
  if (!secreto) return "";
  var carga = Utilities.base64EncodeWebSafe(
    JSON.stringify({ c: correo, r: rol, e: Date.now() + SEG.PASE_DIAS * 86400000 }), Utilities.Charset.UTF_8);
  var firma = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(carga, secreto));
  return carga + "." + firma;
}
// Devuelve { ok:true, correo, rol } o { ok:false }. Lo usará la Fase 2 en cada petición.
function segVerificarPase(pase) {
  try {
    var secreto = PropertiesService.getScriptProperties().getProperty("PASE_SECRETO");
    var partes = String(pase || "").split(".");
    if (!secreto || partes.length !== 2) return { ok: false };
    var firma = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(partes[0], secreto));
    if (!_segIgual(firma, partes[1])) return { ok: false };
    var d = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(partes[0])).getDataAsString());
    if (!d.e || Date.now() > d.e) return { ok: false };
    return { ok: true, correo: d.c, rol: d.r };
  } catch (e) {
    return { ok: false };
  }
}

// ---------- Login en el servidor ----------
// Entrada: { accion:"login", correo, pin }
// Salida:  { ok:true, pase, usuario:{...sin PIN} } o { ok:false, error }
function login(body) {
  var correo = String(body.correo || "").trim().toLowerCase();
  var pin = String(body.pin || "").trim();
  if (!correo || !pin) return { ok: false, error: "Completa correo y PIN" };

  var props = PropertiesService.getScriptProperties();
  var admin = String(props.getProperty("ADMIN_CORREO") || "acmv0921@gmail.com").toLowerCase();
  if (props.getProperty("BLOQUEADO") === "SI" && correo !== admin) {
    return { ok: false, error: "Sistema bloqueado por el administrador" };
  }
  if (_segIntentos(correo) >= SEG.INTENTOS_MAX) {
    return { ok: false, error: "Demasiados intentos. Espera 15 minutos e intenta de nuevo." };
  }

  var u = _usuariosHoja();
  var iCorreo = u.hdrs.indexOf("correo");
  var iEstado = u.hdrs.indexOf("estado");
  var iPin = u.hdrs.indexOf("pin_individual");
  var fila = null;
  for (var i = 1; i < u.datos.length; i++) {
    if (String(u.datos[i][iCorreo]).trim().toLowerCase() === correo) { fila = u.datos[i]; break; }
  }
  if (!fila) { _segFallo(correo); return { ok: false, error: "Correo o PIN incorrecto" }; }
  var estado = String(fila[iEstado] || "").trim().toUpperCase();
  if (estado !== "ACTIVO") return { ok: false, error: "Usuario inactivo" };

  var ok = _segPinCorrecto(correo, pin);
  if (ok === null) {
    // Transición: este usuario aún no está en el Sheet privado → se acepta el PIN de la hoja pública.
    var legado = iPin >= 0 ? String(fila[iPin]).trim() : "";
    ok = legado !== "" && _segIgual(legado, pin);
  }
  if (!ok) { _segFallo(correo); return { ok: false, error: "Correo o PIN incorrecto" }; }

  _segLimpiarIntentos(correo);
  var usuario = {};
  u.hdrs.forEach(function (h, j) { if (h !== "pin_individual" && h !== "pin") usuario[h] = fila[j]; });
  return { ok: true, pase: _segEmitirPase(correo, String(usuario.rol || "")), usuario: usuario };
}

// ---------- Migración de PIN existentes ----------
// Paso (c): copia los PIN actuales al Sheet privado (con hash). NO toca la hoja pública.
function migrarPinesAPrivado() {
  if (!segActiva()) throw new Error("Primero ejecuta configurarSeguridad()");
  var u = _usuariosHoja();
  var iCorreo = u.hdrs.indexOf("correo"), iPin = u.hdrs.indexOf("pin_individual");
  var n = 0;
  for (var i = 1; i < u.datos.length; i++) {
    var c = String(u.datos[i][iCorreo] || "").trim().toLowerCase();
    var p = String(u.datos[i][iPin] || "").trim();
    if (c && p) { _segGuardarPin(c, p); n++; }
  }
  Logger.log("PIN migrados al Sheet privado: " + n);
  return n;
}

// Paso (e): borra los PIN de la hoja pública. Solo corre si TODOS están ya en el Sheet privado.
function ocultarPinesPublicos() {
  if (!segActiva()) throw new Error("Primero ejecuta configurarSeguridad()");
  var u = _usuariosHoja();
  var iCorreo = u.hdrs.indexOf("correo"), iPin = u.hdrs.indexOf("pin_individual");
  if (iPin < 0) { Logger.log("La hoja ya no tiene columna pin_individual."); return 0; }
  var faltan = [];
  for (var i = 1; i < u.datos.length; i++) {
    var c = String(u.datos[i][iCorreo] || "").trim().toLowerCase();
    var p = String(u.datos[i][iPin] || "").trim();
    if (c && p && _segPinCorrecto(c, p) !== true) faltan.push(c);
  }
  if (faltan.length) throw new Error("No se borró nada. Estos usuarios no están bien migrados: " + faltan.join(", "));
  var filas = u.datos.length - 1;
  if (filas > 0) u.hoja.getRange(2, iPin + 1, filas, 1).clearContent();
  Logger.log("PIN borrados de la hoja pública: " + filas + " filas.");
  return filas;
}

// ---------- Interruptor maestro ----------
function bloquearSistema() {
  PropertiesService.getScriptProperties().setProperty("BLOQUEADO", "SI");
  Logger.log("🔒 SISTEMA BLOQUEADO: solo el administrador puede iniciar sesión.");
}
function desbloquearSistema() {
  PropertiesService.getScriptProperties().deleteProperty("BLOQUEADO");
  Logger.log("🔓 Sistema desbloqueado.");
}
