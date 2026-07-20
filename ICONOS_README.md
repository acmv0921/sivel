# Iconos de las apps SIVIL — NO TOCAR sin leer esto

Cada una de las 4 apps tiene su **propio** `icon-192.png` e `icon-512.png`,
DIFERENTE entre sí, para poder distinguirlas visualmente:

- En el launcher del celular cuando están instaladas como PWA
- En el selector "Compartir" de WhatsApp/Android cuando se comparte
  un PDF o el link de la app
- En la vista previa que genera WhatsApp al compartir el link (Open Graph)

| App | Color | Emoji | Archivo fuente |
|---|---|---|---|
| Comercial | Azul `#1a3a5c` | 💼 | `comercial/icon-192.png` / `icon-512.png` |
| Despacho | Naranja `#7c3200` | 🚛 | `despacho/icon-192.png` / `icon-512.png` |
| Gerencia | Verde `#14532d` | 📊 | `gerencia/icon-192.png` / `icon-512.png` |
| Suministros | Morado `#4c1d95` | 📦 | `suministros/icon-192.png` / `icon-512.png` |

## ⚠️ Error que ya pasó una vez — no repetir

En algún punto, las 4 apps terminaron compartiendo el mismo ícono genérico
(el logo de POSTECSA en `assets/`), perdiendo la diferenciación. Esto pasa
si alguien copia `assets/icon-192.png` sobre las carpetas de cada app
"para arreglar algo rápido".

**Antes de tocar cualquier `icon-192.png` o `icon-512.png` dentro de
`comercial/`, `despacho/`, `gerencia/` o `suministros/`, verificar que
sigan siendo diferentes entre sí:**

```bash
md5sum comercial/icon-192.png despacho/icon-192.png gerencia/icon-192.png suministros/icon-192.png
```

Si los 4 hashes son iguales, algo se rompió — regenerar con el script
en `/tmp/iconos_sivil/generar.py` (o pedirle a Claude que lo regenere,
este archivo documenta exactamente el criterio de diseño).

## Meta tags Open Graph

Cada `index.html` tiene sus propios `og:image`, `og:title`, `og:description`
apuntando a su propio ícono en `https://acmv0921.github.io/sivel/<app>/icon-512.png`.
Esto es lo que hace que WhatsApp muestre una vista previa correcta con el
ícono correspondiente cuando alguien comparte el link de una app específica.
