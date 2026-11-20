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
    ] },
  { id: 'estadisticas', icono: '📊', titulo: 'Estadísticas de despacho: cómo leerlas',
    resumen: 'Rankings de productos y vehículos, tiempos de entrega, averías y descarga a Excel.',
    pasos: [
      { titulo: 'Abra las estadísticas', ir: 'screenEstadisticas', boton: 'Ir a Estadísticas',
        texto: 'Aquí se resume todo lo que se ha despachado. Se calcula con los registros de despacho, así que <b>entre mejor se registre, mejores serán los resultados</b>. Espere unos segundos mientras carga.' },
      { titulo: 'Elija el periodo', resaltar: '#estPeriodos',
        texto: 'Toque <b>Semana, Mes, Trimestre, Semestre o Año</b> y use las flechas ◀ ▶ para ir a periodos anteriores. <b>Rango</b> permite escoger dos fechas. Cada indicador se compara con el periodo anterior (▲ sube, ▼ baja).' },
      { titulo: 'Unidades, valor o toneladas', resaltar: '#estMetrica',
        texto: 'Cambie <b>Medir en</b> para ver los rankings por <b>unidades</b>, por <b>valor en pesos</b> o por <b>toneladas</b>. Un producto puede ser el primero en unidades y no serlo en pesos o en peso.' },
      { titulo: 'Las tarjetas de indicadores', resaltar: '#estKpis',
        texto: '<ul><li><b>Viajes:</b> salidas de vehículos.</li><li><b>Carga media por viaje:</b> toneladas por salida; más es mejor (menos viajes para el mismo despacho).</li><li><b>Tiempo de ciclo:</b> días desde que se crea la AP hasta que sale el primer despacho; menos es mejor.</li><li><b>Nivel de servicio:</b> qué porcentaje de lo pedido ya se despachó.</li><li><b>Novedades por 1.000 und:</b> averías, reposiciones y mermas; menos es mejor.</li></ul>' },
      { titulo: 'Tendencia y carta de control',
        texto: 'Las barras muestran cuánto se despacha por día o semana. Las líneas rojas son los <b>límites de control</b>: una barra roja (fuera de límites) es un día fuera de lo normal; conviene preguntar qué pasó (lluvia, falta de vehículo, un pedido grande).' },
      { titulo: 'Productos con más movimiento', resaltar: '#estPareto',
        texto: '<b>Pareto:</b> pocos productos mueven la mayor parte. <b>A</b> = el 80 % del movimiento (nunca deben faltar), <b>B</b> = hasta el 95 %, <b>C</b> = el resto. <b>X, Y, Z</b> indican qué tan regular es su demanda por semana. Toque un producto para ver sus últimos despachos.' },
      { titulo: 'Vehículos más utilizados', resaltar: '#estVeh',
        texto: 'Muestra viajes, toneladas y <b>carga media</b> de cada vehículo. Si un vehículo sale con poca carga, se pueden combinar pedidos (viaje compartido). Toque una placa para ver su detalle.' },
      { titulo: 'Averías y reclamaciones', resaltar: '#estNov',
        texto: 'Aquí aparecen los productos con más averías, reposiciones y mermas, por cada 1.000 unidades despachadas. <b>Si está vacío es porque no se registraron</b>: cada novedad se debe registrar en <b>⚠️ Averías</b> con producto y cantidad.' },
      { titulo: 'Descargue el informe', resaltar: '#estDescargar',
        texto: 'Pulse <b>📥 Descargar Excel</b>: genera un libro con resumen, Pareto, vehículos, clientes, destinos, tendencia, averías, APs abiertas y el detalle de cada despacho del periodo.' },
      { titulo: 'Qué registrar para que sirva',
        texto: '<ul><li>Siempre la <b>placa</b> del vehículo.</li><li>La <b>cantidad real cargada</b> de cada línea.</li><li>Toda avería o reposición, <b>con producto y cantidad</b>.</li><li>Confirmar el despacho <u>una sola vez</u>.</li></ul>Lo que no se registra, no se puede medir ni mejorar.' }
    ] }
];
