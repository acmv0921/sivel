/* Guías de SIVIL Gerencia (texto editable; el motor está en ../assets/guia.js) */
window.GUIAS_GERENCIA = [
  {
    id: 'nuevo-producto', icono: '🆕', titulo: 'Crear un producto nuevo',
    resumen: 'Alta completa en el catálogo y en la tabla de precios; lo ven todas las aplicaciones.',
    pasos: [
      { titulo: 'Reúna los datos antes de empezar',
        texto: 'Tenga a mano:<ul><li><b>Código</b> asignado y <b>nombre</b> (TIPO MEDIDAS COLOR LÍNEA)</li><li><b>Precio base</b> sin IVA y si lleva IVA</li><li>Descuentos máximos (catálogo y vendedor)</li><li>Si lo fabrica POSTECSA: <b>peso, unidades por m², por estiba, valor de la estiba, unidades por viaje y tarifa del viaje</b></li><li>Si es de terceros solo se piden precio y existencias.</li></ul>' },
      { titulo: 'Abra el formulario', ir: 'screenPrecios', abrir: 'abrirNuevoProducto', boton: 'Abrir "Nuevo producto"',
        texto: 'Se abre desde <b>Precios → 🆕 Nuevo producto</b>. Pulse el botón verde para que la guía lo abra por usted.' },
      { titulo: '1. Identificación', resaltar: '#npCodigo',
        texto: '<ul><li><b>Código asignado</b>: debe ser numérico. El sistema avisa si ya existe y muestra productos parecidos.</li><li><b>Nombre</b>: se guarda en mayúsculas.</li><li><b>Unidad</b>: UND, UNDS o ML.</li><li><b>¿Fabricado o de terceros?</b> Si elige terceros se ocultan los datos físicos y de transporte.</li></ul>' },
      { titulo: 'Existencias y calidad SEGUNDA', resaltar: '#npStock',
        texto: '<ul><li><b>Existencia inicial</b>: normalmente 0 si aún no se ha producido.</li><li><b>Stock mínimo</b>: opcional.</li><li>Marque <b>calidad SEGUNDA</b> solo si ese producto también se maneja en segunda; se crea una segunda fila en el catálogo.</li></ul>' },
      { titulo: '2. Precio e impuestos', resaltar: '#npPrecio',
        texto: '<ul><li><b>Precio base por unidad, sin IVA</b>.</li><li><b>IVA</b>: E (excluido) o G (gravado 19 %).</li><li><b>Descuento máximo de catálogo</b> y <b>del vendedor</b> (%).</li><li><b>Vigencia</b>: desde la fecha de hoy; hasta 2099-12-31 si no vence.</li></ul>' },
      { titulo: '3. Datos físicos (solo fabricados)', resaltar: '#npPeso',
        texto: 'Peso por unidad (kg), unidades por m² (solo si se vende por m²), unidades por estiba y valor de la estiba. Con el peso, Comercial calcula el peso total del pedido: <b>no lo deje vacío</b> si el producto es pesado.' },
      { titulo: '4. Transporte (solo fabricados)', resaltar: '#npUViaje',
        texto: 'Unidades por viaje (cupo del camión) y tarifa del viaje a Cali según la tabla de Gerencia. Con eso el sistema calcula solo el flete por unidad y por m². Los fletes zona A/B son opcionales (vacío = 0).' },
      { titulo: 'Revise la vista previa', resaltar: '#npPreview',
        texto: 'La vista previa muestra todo lo que se va a guardar, incluidos los valores calculados (precio por m², flete, peso del viaje, estibas por viaje). Las <b>alertas</b> en naranja indican datos que faltan. Corrija antes de continuar.' },
      { titulo: 'Guarde el producto', resaltar: '#npBtn',
        texto: 'Pulse <b>💾 Revisar y guardar producto</b>; el sistema pide una última confirmación con el resumen. Al aceptar, el producto queda en PRODUCTOS_MAESTRO y en PRECIOS_GERENCIA.<br><br>Para que lo vean los vendedores deben <b>cerrar y abrir dos veces</b> la aplicación Comercial. Verifique buscándolo en una cotización.' }
    ]
  },
  {
    id: 'editar-producto', icono: '✏️', titulo: 'Editar un producto',
    resumen: 'Cambiar cualquier característica: nombre, precio, peso, estibas, viajes, fletes...',
    pasos: [
      { titulo: 'Ubique el producto', ir: 'screenPrecios', boton: 'Ir a Precios', resaltar: '#buscarPrecios',
        texto: 'En <b>Precios</b> use el buscador (código o nombre). Los productos sin precio aparecen primero con una marca naranja.' },
      { titulo: 'Pulse ✏️ Editar',
        texto: 'Se abre el <b>mismo formulario</b> de "Nuevo producto", con los datos actuales. El <b>código no se puede cambiar</b> y las existencias no se tocan (se manejan en inventario).' },
      { titulo: 'Cambie lo que necesite', resaltar: '#npPrecio',
        texto: 'Puede cambiar nombre, unidad, IVA, precio, descuentos, vigencia, peso, unidades por m² y por estiba, valor de la estiba, unidades por viaje, tarifa del viaje y fletes por zona. Los valores calculados (precio por m², flete por unidad, peso del viaje) se recalculan solos.' },
      { titulo: 'Revise y guarde', resaltar: '#npBtn',
        texto: 'Pulse <b>💾 Revisar y guardar cambios</b>. El sistema le muestra <b>solo lo que cambió</b> (ej. "Precio base: 1.720 → 1.800") y pide confirmación. Comercial y Despacho muestran un aviso con el cambio a sus usuarios.' }
    ]
  },
  {
    id: 'lista-precios', icono: '📤', titulo: 'Subir una lista de precios',
    resumen: 'Actualizar muchos precios a la vez desde Excel, con vista previa.',
    pasos: [
      { titulo: 'Abra "Subir lista de precios"', ir: 'screenPrecios', abrir: 'abrirListaPrecios', boton: 'Abrir "Subir lista de precios"',
        texto: 'Está en <b>Precios → 📤 Subir lista de precios</b>.' },
      { titulo: 'Descargue la plantilla',
        texto: 'Pulse <b>⬇️ Descargar plantilla (Excel)</b>. Trae todos los productos con su precio actual: <b>codigo, producto, unidad, precio_base, desc_vendedor_%, flete_zona_A, flete_zona_B</b>.' },
      { titulo: 'Edite el Excel',
        texto: 'Cambie la columna <b>precio_base</b> de los productos que suben o bajan (y descuento o fletes si lo necesita). <b>No cambie el código.</b> Puede dejar los demás como están: solo se aplican los que cambian.' },
      { titulo: 'Suba el archivo', resaltar: '#lpArchivo',
        texto: 'Elija el archivo. Verá la <b>vista previa</b>: cuántos productos cambian, cada precio anterior y nuevo con su porcentaje, y los códigos que no existen. Los cambios de <b>más de 30 %</b> se marcan en naranja: revíselos, puede ser un error de digitación.' },
      { titulo: 'Aplique los cambios', resaltar: '#lpBtn',
        texto: 'Pulse <b>✅ Aplicar</b> y confirme. Los precios nuevos los ven de inmediato Comercial y Despacho (con un aviso) y cada cambio queda en la hoja <b>HISTORIAL_PRECIOS</b> con fecha y usuario.' }
    ]
  },
  {
    id: 'eliminar-producto', icono: '🗑️', titulo: 'Eliminar un producto',
    resumen: 'Borrado seguro con confirmación y copia de respaldo.',
    pasos: [
      { titulo: 'Condiciones para borrar',
        texto: 'Solo se puede eliminar un producto <b>sin existencias</b> y <b>sin historial</b> en APs, despachos o ensambles. Si tiene historial el sistema lo rechaza: en ese caso no se borra, solo se deja de usar. Antes de borrar se guarda una copia en la hoja <b>PRODUCTOS_ELIMINADOS</b>.' },
      { titulo: 'Abra "Eliminar producto"', ir: 'screenPrecios', abrir: 'abrirElimProducto', boton: 'Abrir "Eliminar producto"',
        texto: 'Está en <b>Precios → 🗑️ Eliminar producto</b>.' },
      { titulo: 'Busque el producto por código', resaltar: '#epCodigo',
        texto: 'Escriba el <b>código</b>. Debajo aparecen nombre, existencias y precio para comprobar que es el producto correcto.' },
      { titulo: 'Confirme escribiendo el código', resaltar: '#epConfirma',
        texto: 'Para evitar errores, escriba de nuevo el código en el campo de confirmación. Luego pulse <b>🗑️ Eliminar definitivamente</b>; el sistema preguntará: <i>¿Está seguro de borrar este producto?</i>' },
      { titulo: 'Resultado', 
        texto: 'El producto se quita del catálogo y de la tabla de precios de todas las aplicaciones. Los usuarios verán el cambio al cerrar y abrir dos veces su aplicación. Si se borró por error, la copia está en <b>PRODUCTOS_ELIMINADOS</b> y se puede recrear con "Nuevo producto".' }
    ]
  }
];
