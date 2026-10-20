/* Guías de SIVIL Despacho (texto editable; el motor está en ../assets/guia.js) */
window.GUIAS_DESPACHO = [
  { id: 'despachar', icono: '🚛', titulo: 'Registrar un despacho',
    resumen: 'De la AP pendiente al informe, con vehículo, cantidades y fotos.',
    pasos: [
      { titulo: 'Ubique la AP', ir: 'screenDespacho', boton: 'Ir a Despacho',
        texto: 'En <b>🚛 Despacho</b> aparecen las APs pendientes. Filtre por <b>Pendientes</b>, <b>Con Saldo</b>, <b>Todos</b> o <b>Historial</b>, o por vendedor y destino. Las urgentes se listan primero.' },
      { titulo: 'Abra la AP',
        texto: 'Toque la AP que va a cargar. Se abre <b>Registrar Despacho</b> con cada producto, la cantidad solicitada y la pendiente.' },
      { titulo: 'Vehículo y conductor',
        texto: 'Seleccione el <b>vehículo</b> (placa) o registre uno nuevo; si el cliente recoge, use esa opción. Confirme o edite el <b>conductor</b>. Sin vehículo no deja guardar.' },
      { titulo: 'Cantidad realmente cargada',
        texto: 'Por cada línea escriba la <b>cantidad real cargada</b> y el tipo de producto. Si carga menos de lo pendiente, la AP queda <b>Despachada Parcial</b> con saldo.' },
      { titulo: 'Fotos obligatorias',
        texto: 'Tome <b>mínimo 3 fotos</b> del vehículo y la carga. Sin ellas el sistema no permite confirmar.' },
      { titulo: 'Confirmar despacho', resaltar: '#btnConfirmarDespacho',
        texto: 'Pulse <b>✅ Confirmar Despacho</b> <u>una sola vez</u> y espere. Si una línea falla, se detiene y no marca la AP como completa. Luego puede enviar el <b>reporte por WhatsApp</b>.' },
      { titulo: 'Detalle del flete (opcional)',
        texto: 'En la AP puede dejar el <b>detalle del flete</b> (control interno) y guardarlo con 💾.' }
    ] },
  { id: 'reparto', icono: '🔗', titulo: 'Viaje compartido (reparto)',
    resumen: 'Combinar varias APs en un solo viaje.',
    pasos: [
      { titulo: 'Active el modo reparto', ir: 'screenDespacho', abrir: 'toggleModoReparto', boton: 'Activar Modo Reparto',
        texto: 'En Despacho pulse <b>🔗 Modo Reparto (combinar pedidos en un viaje)</b>.' },
      { titulo: 'Marque los pedidos', texto: 'Seleccione las APs que irán en el mismo camión.' },
      { titulo: 'Vehículo y confirmación', resaltar: '#repartoVehiculo',
        texto: 'Elija el <b>vehículo</b>, agregue notas si quiere y pulse <b>🔗 Confirmar Viaje Compartido</b>. El sistema pregunta antes de combinar.' }
    ] },
  { id: 'curado', icono: '⏳', titulo: 'Control de curado',
    resumen: 'Registrar lotes que están curando para que Comercial no los ofrezca disponibles.',
    pasos: [
      { titulo: 'Abra Curado', ir: 'screenCurado', boton: 'Ir a Curado', texto: 'Menú inferior <b>⏳ Curado</b>: lotes en curado y su fecha de salida.' },
      { titulo: 'Nuevo lote', abrir: 'abrirModalCurado', boton: 'Nuevo Lote en Curado',
        texto: 'Pulse <b>➕ Nuevo Lote en Curado</b>, elija producto, cantidad y fecha, y guarde. Cuando termina el curado el producto pasa a disponible.' }
    ] },
  { id: 'novedad', icono: '⚠️', titulo: 'Registrar una avería o novedad',
    resumen: 'Mermas, averías o novedades de logística con foto.',
    pasos: [
      { titulo: 'Abra Averías', ir: 'screenAverias', boton: 'Ir a Averías', texto: 'Menú inferior <b>⚠️ Averías</b>.' },
      { titulo: 'Novedad de inventario', resaltar: '#averiaCategoria',
        texto: 'Elija la <b>categoría</b>, el <b>producto afectado</b>, la <b>cantidad de unidades</b>, la AP relacionada (opcional) y describa lo ocurrido. Agregue una <b>foto</b> (cámara o galería).' },
      { titulo: 'Guardar', resaltar: '[onclick*="guardarAveria"]',
        texto: 'Pulse <b>⚠️ Registrar Novedad</b>. La novedad queda registrada en el <b>historial de novedades</b>.' },
      { titulo: 'Novedad de logística', resaltar: '#novedadLogCategoria',
        texto: 'Para retrasos, vehículo u otros temas de transporte use <b>Registrar Novedad de Logística</b> (tipo, AP, placa, descripción).' }
    ] }
];
