/* Guías de SIVIL Suministros (texto editable; el motor está en ../assets/guia.js) */
window.GUIAS_SUMINISTROS = [
  { id: 'revisar-inventario', icono: '📦', titulo: 'Revisar inventario y alertas',
    resumen: 'Qué está agotado o en stock bajo y qué hay que comprar.',
    pasos: [
      { titulo: 'Mire el Inicio', ir: 'screenDashboard', boton: 'Ir al Inicio',
        texto: 'El semáforo resume: <b>🔴 Agotados</b>, <b>🟡 Stock bajo</b> y <b>🟢 OK</b>. Abajo, <b>🚨 Requieren atención inmediata</b> y sus <b>notas de compra activas</b>.' },
      { titulo: 'Abra Inventario', ir: 'screenInventario', boton: 'Ir a Inventario', resaltar: '#buscarSum',
        texto: 'Busque por <b>código o nombre</b>. Filtre con los chips: 🔴 Agotado, 🟡 Stock bajo, ⚠️ Con alerta o 📦 Todos.' },
      { titulo: 'Decida qué comprar',
        texto: 'Para cada producto en rojo o amarillo registre una <b>nota de compra</b> (siguiente guía) para que todo el equipo sepa que ya se está gestionando.' }
    ] },
  { id: 'nota-compra', icono: '📝', titulo: 'Registrar una nota de compra',
    resumen: 'Dejar constancia del proveedor, cantidad y fecha estimada de llegada.',
    pasos: [
      { titulo: 'Elija el producto', ir: 'screenInventario', boton: 'Ir a Inventario',
        texto: 'En <b>Inventario</b> toque el producto que necesita comprar. Se abre la <b>Nota de compra</b>.' },
      { titulo: 'Complete la nota', resaltar: '#notaEstado',
        texto: '<ul><li><b>Estado del pedido</b></li><li><b>Proveedor / observaciones</b></li><li><b>Cantidad solicitada</b></li><li><b>Fecha estimada de llegada</b></li></ul>' },
      { titulo: 'Guarde', resaltar: '[onclick*="guardarNota"]',
        texto: 'Pulse <b>💾 Guardar nota</b>. Queda visible para todo el equipo en <b>Notas</b> y en el <b>Historial</b>. Actualícela cuando cambie el estado o llegue el material.' },
      { titulo: 'Consulte sus notas', ir: 'screenNotas', boton: 'Ir a Notas',
        texto: 'En <b>📝 Notas</b> están todas las compras en curso; en <b>📋 Historial</b> las ya cerradas.' }
    ] },
  { id: 'receta', icono: '🧾', titulo: 'Crear una receta (BOM) de un producto',
    resumen: 'Materiales y cantidades necesarios para fabricar un producto.',
    pasos: [
      { titulo: 'Abra Recetas', ir: 'screenRecetas', boton: 'Ir a Recetas',
        texto: 'Una receta dice <b>qué materiales y cuánto</b> se necesita para fabricar una unidad del producto.' },
      { titulo: 'Nueva receta', abrir: 'abrirNuevaReceta', boton: 'Nueva receta', resaltar: '#recetaCodigo',
        texto: 'Escriba el <b>código</b> del producto (el nombre se completa) o use un código ya existente para editarla.' },
      { titulo: 'Materiales',
        texto: 'Cargue los materiales <b>desde Excel</b> o agréguelos <b>a mano</b> (fila por fila) con su cantidad por unidad.' },
      { titulo: 'Guardar', resaltar: '[onclick*="enviarReceta"]', texto: 'Pulse <b>💾 Guardar receta</b>. Revise que cantidades y unidades sean las correctas antes de guardar.' }
    ] }
];
