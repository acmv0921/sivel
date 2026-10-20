/* Guías de SIVIL Comercial (texto editable; el motor está en ../assets/guia.js) */
window.GUIAS_COMERCIAL = [
  { id: 'cotizar', icono: '🧾', titulo: 'Hacer una cotización',
    resumen: 'Desde el cliente hasta el PDF o WhatsApp. El número se asigna solo.',
    pasos: [
      { titulo: 'Abra el Cotizador', ir: 'screenCotizador', boton: 'Ir al Cotizador',
        texto: 'Está en el menú inferior (<b>🧾 Cotiz.</b>). Allí ve <b>Mis Cotizaciones</b>; para empezar pulse <b>➕ Nueva cotización</b>.' },
      { titulo: 'Número y vigencia', abrir: 'czNuevaConAviso', boton: 'Nueva cotización',
        texto: 'El <b>número de cotización es automático</b> (sus iniciales + consecutivo); no lo escriba. Defina la <b>Vigencia de precios</b> y <b>Despachos hasta</b>.' },
      { titulo: 'Cliente y obra',
        texto: 'Use <b>Buscar cliente</b> por NIT o nombre. Si no existe, regístrelo primero (guía "Registrar un cliente nuevo"). Complete atención, teléfono, correo, <b>obra</b> y la <b>dirección de despachos</b>.' },
      { titulo: 'Productos', resaltar: '[onclick*="czAgregar"]',
        texto: 'Pulse <b>➕ Agregar</b> para cada producto: cantidad y precio salen del catálogo. Respete el descuento máximo permitido. Si lleva estiba, márquelo.' },
      { titulo: 'Flete',
        texto: 'Elija si la cotización lleva flete. El sistema propone el <b>flete sugerido</b> según el peso y la tarifa por viaje (<b>Aplicar flete sugerido</b>). Si lo cambia a mano, el <b>motivo del ajuste es obligatorio</b>. Puede agregar un flete adicional.' },
      { titulo: 'Condiciones',
        texto: 'Elija condiciones de <b>pago</b> y <b>entrega</b> y las observaciones. Las <b>observaciones internas 🔒 son privadas</b>: no salen en el PDF ni en WhatsApp.' },
      { titulo: 'Guardar y enviar', resaltar: '[onclick*="czPDF"]',
        texto: '<ul><li><b>💾 Guardar borrador</b>: queda en Mis Cotizaciones.</li><li><b>📄 Guardar y generar PDF</b></li><li><b>💬 Guardar y enviar por WhatsApp</b></li></ul>Al terminar, cambie su estado: <b>Aceptada</b>, <b>Perdida</b> o <b>Anulada</b>. Para cambios grandes use <b>Nueva versión (A/B)</b>.' }
    ] },
  { id: 'cot-a-ap', icono: '📦', titulo: 'Convertir una cotización en AP',
    resumen: 'El cliente aceptó: de la cotización al pedido, con número de AP automático.',
    pasos: [
      { titulo: 'Abra la cotización aceptada', ir: 'screenCotizador', boton: 'Ir a Mis Cotizaciones',
        texto: 'En <b>Mis Cotizaciones</b> abra la cotización que el cliente aceptó. Conviene marcarla antes como <b>✅ Aceptada</b>.' },
      { titulo: 'Pulse "Convertir en AP"', resaltar: '[onclick*="czAAP"]',
        texto: 'Use <b>📦 Convertir en AP (pedido)</b>. Los productos, el flete y las condiciones pasan al borrador del AP.' },
      { titulo: 'Número de AP automático', resaltar: '#inputApId',
        texto: 'El <b>número de AP lo asigna el sistema</b> (el siguiente libre; salta los ya usados). No lo cambie salvo que lo necesite. Si apoya a un compañero, vea el paso siguiente.' },
      { titulo: 'Complete los datos del pedido',
        texto: 'Revise <b>N° de orden de compra del cliente</b>, obra, dirección, contacto en obra, <b>fecha y compromiso de entrega</b> (única o despachos parciales) y la forma de pago.' },
      { titulo: 'Confirmar y guardar', resaltar: '[onclick*="guardarAP"]',
        texto: 'Pulse <b>✅ Confirmar y Guardar AP</b>. Despacho verá el pedido de inmediato. Si se equivoca antes de guardar, <b>🗑️ Cancelar</b> limpia el borrador.' }
    ] },
  { id: 'ap-directo', icono: '📝', titulo: 'Crear un AP (pedido) sin cotización',
    resumen: 'Pasos previos (borrador de AP) para un pedido directo, incluido apoyar a otro vendedor.',
    pasos: [
      { titulo: 'Abra "Pasos previos"', ir: 'screenPedido', boton: 'Abrir el borrador de AP',
        texto: 'Menú inferior <b>Nuevo AP</b> (📝 Pasos previos). El número de AP se propone solo.' },
      { titulo: '¿Apoya a otro vendedor?', resaltar: '#selectorVendedorApoyado',
        texto: 'Si el pedido es de un compañero al que usted apoya, elija el <b>Vendedor al que apoyas</b>. Si el pedido es suyo, déjelo vacío.' },
      { titulo: 'Cliente',
        texto: '<b>🔍 Buscar cliente</b> (NIT o nombre). Si es nuevo, <b>➕ Registrar cliente</b>. Complete orden de compra, N° de cotización, condiciones de pago y días de crédito.' },
      { titulo: 'Obra y entrega',
        texto: 'Nombre de la obra, dirección, <b>contacto en obra y celular</b>, fecha solicitada y observaciones. Elija <b>Entrega única</b> o <b>Despachos parciales</b> (por cantidades).' },
      { titulo: 'Productos', resaltar: '[onclick*="abrirModalProducto"]',
        texto: 'Pulse <b>➕ Agregar producto</b> por cada ítem. Revise cantidades y descuentos.' },
      { titulo: 'Estiba, flete y adjuntos',
        texto: 'Indique si <b>lleva estiba</b> y si va <b>con o sin flete</b> (destino, número de viajes, flete de lista y el valor a cobrar). Adjunte <b>fotos o archivos</b> de la negociación si los hay.' },
      { titulo: 'Revise el resumen y guarde', resaltar: '[onclick*="guardarAP"]',
        texto: 'Compruebe el <b>Resumen Financiero</b> y pulse <b>✅ Confirmar y Guardar AP</b>. Quedará en <b>Mis APs</b> y Despacho lo recibe.' }
    ] },
  { id: 'cliente-nuevo', icono: '👤', titulo: 'Registrar un cliente nuevo',
    resumen: 'Alta de cliente con NIT, datos de contacto y obra.',
    pasos: [
      { titulo: 'Primero búsquelo', ir: 'screenClientes', boton: 'Ir a Mis Clientes',
        texto: 'Antes de crear uno nuevo, <b>búsquelo por NIT o nombre</b> para no duplicarlo.' },
      { titulo: 'Abra el formulario', abrir: 'mostrarFormCliente', boton: 'Registrar cliente',
        texto: 'Pulse <b>➕ Nuevo cliente</b>. Escriba el NIT y el nombre o razón social completos.' },
      { titulo: 'Complete y guarde',
        texto: 'Agregue contacto, teléfono, correo y dirección. Guarde: el cliente queda disponible en cotizaciones y APs.' }
    ] },
  { id: 'inventario', icono: '📦', titulo: 'Consultar inventario y producto en curado',
    resumen: 'Qué hay disponible para ofrecer hoy.',
    pasos: [
      { titulo: 'Abra Inventario', ir: 'screenInventario', boton: 'Ir a Inventario',
        texto: 'Menú inferior <b>Inventario</b>. Muestra el inventario dinámico en campo.' },
      { titulo: 'Producto en curado',
        texto: 'El producto en curado todavía <b>no está disponible para despacho</b>: ofrézcalo con la fecha en que sale de curado.' }
    ] }
];
