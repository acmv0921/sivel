// =============================================================================
// SIVEL - Configuración Central
// POSTEC DE OCCIDENTE S.A.S.
// =============================================================================

const SIVEL_CONFIG = {
  GAS_URL:   "https://script.google.com/macros/s/AKfycbydQjzcYnlCtiaqitnt8-2lCA-Qx6y3D4wx_WHCOQwrHfYPbCBA2YijVsLm0vfzgdK3MQ/exec",
  SHEET_ID:  "1Wbz8A2WDdNjcByDqpH1FRDm9XvuspyzMFIh7Ep9cIMI",
  VERSION:   "1.0",
  EMPRESA:   "POSTEC DE OCCIDENTE S.A.S.",

  // Zonas de flete
  ZONAS: {
    A: "Cali / Andenes",
    B: "Yumbo / CENCAR"
  },

  // Semáforo de inventario
  SEMAFORO: {
    VERDE:    { min: 11,  label: "Disponible",       color: "#1a7a4a" },
    AMARILLO: { min: 1,   label: "Stock Bajo",        color: "#856404" },
    ROJO:     { min: -Infinity, label: "Agotado",     color: "#b91c1c" }
  },

  // Passwords de acceso (se pueden cambiar desde Gerencia)
  PASS: {
    SUPERVISOR: "POST2025",
    GERENCIA:   "GER2025"
  }
};
