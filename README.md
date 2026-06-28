# SIVEL — Sistema Integrado de Ventas, Inventario y Logística
**POSTEC DE OCCIDENTE S.A.S.** · v1.0

Ecosistema de 3 aplicaciones PWA interconectadas en tiempo real sobre Google Sheets + GAS.

## Aplicaciones

| App | Usuarios | Estado |
|-----|----------|--------|
| [App Comercial](https://acmv0921.github.io/sivel/comercial/) | Jose Eduardo, Felipe Andrés | 🔧 En construcción |
| [App Despacho](https://acmv0921.github.io/sivel/despacho/) | Valentina, Patio | 🔧 En construcción |
| [App Gerencia](https://acmv0921.github.io/sivel/gerencia/) | Ing. Nohra Constanza Jiménez H. | 🕐 Fase 4 |

## Arquitectura

- **Base de datos:** Google Sheets (7 tablas relacionales)
- **API:** Google Apps Script Web App
- **Frontend:** PWA de un solo archivo HTML por app
- **Hosting:** GitHub Pages

## Motor de Inventario Dinámico

```
Disponible = tmcant - cant_en_curado - cant_mermas_averias - Σ(solicitado_pendiente)
```

## Estructura del Repositorio

```
sivel/
├── index.html              ← Landing page del ecosistema
├── comercial/
│   └── index.html          ← App Comercial (Fase 2)
├── despacho/
│   └── index.html          ← App Despacho (Fase 3)
├── gerencia/
│   └── index.html          ← App Gerencia (Fase 4)
└── gas/
    ├── backend.js           ← Código GAS completo
    └── setup_sheet.gs       ← Script inicialización Google Sheet
```

## Instalación

### 1. Google Sheet
1. Crear un nuevo Google Sheet en Drive
2. Copiar el ID del Sheet (URL entre `/d/` y `/edit`)
3. En Google Apps Script → nuevo proyecto → pegar `gas/setup_sheet.gs`
4. Reemplazar `REEMPLAZAR_CON_TU_SHEET_ID` con el ID real
5. Ejecutar `inicializarSIVEL()` — crea las 7 tablas con datos de prueba

### 2. GAS Backend
1. En el mismo proyecto GAS → nuevo archivo → pegar `gas/backend.js`
2. Reemplazar `REEMPLAZAR_CON_ID_DEL_GOOGLE_SHEET` con el ID real
3. **Implementar → Nueva implementación → Aplicación web**
4. Ejecutar como: **Yo** · Acceso: **Cualquier usuario**
5. Copiar la URL del despliegue

### 3. Conectar Apps
En cada `index.html` de las apps, reemplazar:
```javascript
const GAS_URL = "PEGAR_URL_DESPLIEGUE_GAS_AQUÍ";
```

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `PRODUCTOS_MAESTRO` | Stock bruto desde ERP Datas |
| `VENDEDORES` | Control de acceso y carteras |
| `CLIENTES` | NIT, GPS, foto fachada |
| `PREVENTAS_AP` | Cabecera de pedidos |
| `DETALLE_AP` | Líneas + descuentos validados |
| `CONTROL_PATIO_Y_LOGISTICA` | Curado, averías, despachos |
| `PRECIOS_GERENCIA` | Tarifas, topes y fletes por zona |

---
*Desarrollado por Abdiel Cicar Moreno Velásquez · Área de Gestión de Mantenimiento y Confiabilidad*
