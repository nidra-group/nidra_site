# Feature Specification: Sitio público de Nidra (v1)

**Feature Branch**: `001-nidra-public-site`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Sitio oficial de Nidra, agencia de desarrollo de software con IA que implementa soluciones digitales para PyMEs y emprendedores. El sitio informa sobre servicios, integraciones soportadas y partners; permite agendar citas mediante un chatbot desarrollado por fuera y embebido como cliente; incluye un formulario web de consultas; soporta español e inglés; y expone un subdominio con información profesional del fundador desde el cual se descarga su CV eligiendo formato e idioma, con los datos del CV versionados en el repositorio."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Evaluar si Nidra resuelve mi problema (Priority: P1)

Un dueño de PyME o un emprendedor llega al sitio (por búsqueda, recomendación o un enlace en redes)
sabiendo que tiene un proceso manual que le consume tiempo, pero sin saber si "IA" es una respuesta
realista para su caso ni si esta agencia es confiable. En menos de un minuto necesita entender qué
hace Nidra, si atiende empresas de su tamaño, qué tipo de problema resuelve y si el enfoque es serio
o humo. Recorre la portada, identifica el servicio más parecido a su problema y profundiza en el
detalle de ese servicio: qué incluye, cómo se trabaja y en qué plazo aproximado.

**Why this priority**: Sin esto no existe el sitio. Es la única función que, entregada sola, ya
produce valor: un visitante informado que puede contactar por los canales que la empresa ya tiene
(correo, redes). Toda otra funcionalidad amplifica esta, pero ninguna la reemplaza.

**Independent Test**: Se prueba entregando únicamente la portada y la página de servicios. Un
evaluador que no conoce la empresa debe poder responder, sin ayuda, qué hace Nidra, a quién le sirve
y cuáles son sus servicios.

**Acceptance Scenarios**:

1. **Given** un visitante que nunca oyó hablar de Nidra, **When** abre la portada, **Then** ve en el
   primer viewport qué hace la empresa, a quién le sirve y una acción de contacto, sin necesidad de
   desplazarse.
2. **Given** un visitante en la portada, **When** recorre la sección de servicios, **Then** encuentra
   exactamente los seis servicios ofrecidos, cada uno con un título y una descripción de una línea.
3. **Given** un visitante interesado en un servicio, **When** lo selecciona, **Then** llega al detalle
   de ese servicio, que expone el problema que resuelve, qué se entrega y el plazo estimado.
4. **Given** un visitante que quiere saber cómo se trabaja, **When** recorre la portada, **Then**
   encuentra el proceso de trabajo descrito en pasos secuenciales.
5. **Given** un visitante que llega con el JavaScript deshabilitado, **When** abre cualquier página
   informativa, **Then** lee el contenido completo y puede navegar entre páginas.

---

### User Story 2 - Iniciar una conversación comercial (Priority: P1)

El visitante ya se convenció de que vale la pena hablar. Quiere hacerlo ahora, por el canal que le
resulte más cómodo: dejar una consulta escrita y esperar respuesta, o reservar directamente una
reunión. En ambos casos necesita saber qué pasa después: cuándo le van a responder y por qué medio.

**Why this priority**: Es la conversión. Un sitio informativo sin canal de contacto operativo no
produce negocio. Comparte prioridad con la Historia 1 porque el valor comercial solo se realiza
cuando ambas existen.

**Independent Test**: Se prueba entregando la página de contacto sola. Un evaluador debe poder enviar
una consulta, recibir confirmación en pantalla y verificar que la consulta llegó al destinatario.

**Acceptance Scenarios**:

1. **Given** un visitante en cualquier página, **When** busca cómo contactar, **Then** encuentra una
   acción de contacto visible sin desplazarse hasta el pie de página.
2. **Given** un visitante en el formulario de consulta, **When** lo completa con datos válidos y lo
   envía, **Then** ve una confirmación explícita en pantalla que indica el plazo de respuesta
   comprometido.
3. **Given** un visitante que omite un campo obligatorio o escribe un correo mal formado, **When**
   intenta enviar, **Then** ve señalado el campo con el problema y conserva todo lo que ya había
   escrito.
4. **Given** una consulta enviada correctamente, **When** el equipo de Nidra revisa su canal de
   recepción, **Then** encuentra el mensaje con nombre, correo, empresa, servicio de interés y texto
   de la consulta.
5. **Given** un visitante que quiere reservar una reunión, **When** usa la acción de agenda, **Then**
   completa la reserva y recibe una confirmación.
6. **Given** que el asistente conversacional embebido no carga o no está disponible, **When** el
   visitante quiere agendar, **Then** dispone de una vía alternativa visible para lograrlo.

---

### User Story 3 - Navegar en mi propio idioma (Priority: P2)

El sitio atiende tanto a PyMEs hispanohablantes como a clientes o socios de habla inglesa. El
visitante debe poder leer todo el sitio en su idioma y compartir un enlace que preserve ese idioma
para quien lo reciba.

**Why this priority**: Amplía el mercado direccionable y da profesionalismo, pero el negocio inicial
es hispanohablante: el sitio en un solo idioma ya vende.

**Independent Test**: Se prueba recorriendo el sitio completo en cada idioma y verificando que ningún
texto quede sin traducir y que los enlaces compartidos abran en el idioma correcto.

**Acceptance Scenarios**:

1. **Given** un visitante en cualquier página, **When** cambia el idioma, **Then** permanece en la
   misma página, ahora en el idioma elegido, sin volver a la portada.
2. **Given** un visitante que recibió un enlace del sitio en inglés, **When** lo abre, **Then** ve la
   página en inglés sin tener que cambiar nada.
3. **Given** un visitante que ya eligió un idioma, **When** navega a otra página del sitio, **Then**
   conserva el idioma elegido.
4. **Given** cualquier página publicada, **When** se la inspecciona en un idioma, **Then** no contiene
   texto en el otro idioma ni claves de traducción sin resolver.
5. **Given** un buscador que rastrea el sitio, **When** recorre una página, **Then** encuentra
   declarada la relación entre las versiones equivalentes en ambos idiomas.

---

### User Story 4 - Verificar que Nidra se conecta con mis herramientas (Priority: P2)

Antes de contactar, el visitante quiere confirmar que Nidra puede trabajar con los sistemas que ya
usa. Busca una lista concreta y agrupada de integraciones soportadas, y también las tecnologías sobre
las que la agencia construye, como señal de competencia técnica.

**Why this priority**: Elimina una objeción frecuente y acorta el ciclo de venta, pero un visitante
puede preguntar lo mismo por el formulario. No bloquea la conversión.

**Independent Test**: Se prueba entregando la página de integraciones sola y verificando que un
visitante pueda encontrar una herramienta concreta y entender en qué categoría opera.

**Acceptance Scenarios**:

1. **Given** un visitante en la página de integraciones, **When** la recorre, **Then** ve las
   integraciones agrupadas por categoría funcional, no en una lista plana.
2. **Given** un visitante que busca una herramienta específica, **When** la ubica en la página,
   **Then** identifica su categoría y su nombre sin ambigüedad.
3. **Given** un visitante que no encuentra su herramienta, **When** llega al final de la página,
   **Then** encuentra una vía para preguntar por esa integración puntual.
4. **Given** la sección de tecnologías y alianzas, **When** un visitante la lee, **Then** la relación
   declarada con cada organización nombrada es literalmente cierta y no sugiere un vínculo comercial
   inexistente.

---

### User Story 5 - Conocer al fundador y descargar su CV (Priority: P3)

Un cliente potencial que evalúa contratar, o un reclutador, quiere saber quién está detrás de la
agencia. Accede al espacio profesional del fundador, lee su trayectoria y descarga el currículum
eligiendo el idioma y el formato que necesita.

**Why this priority**: Genera confianza en una agencia nueva sin casos publicables y abre
oportunidades individuales, pero es un espacio independiente: el sitio comercial funciona sin él.

**Independent Test**: Se prueba entregando solo el espacio profesional, verificando que el perfil se
lea completo y que cada combinación ofrecida de idioma y formato produzca una descarga válida y
coherente con el perfil mostrado.

**Acceptance Scenarios**:

1. **Given** un visitante en el espacio profesional, **When** lo recorre, **Then** lee perfil,
   experiencia, formación y capacidades técnicas sin descargar ningún archivo.
2. **Given** un visitante que quiere el currículum, **When** elige idioma y formato y confirma,
   **Then** obtiene un archivo descargado cuyo contenido corresponde a esa combinación.
3. **Given** un visitante que descarga el currículum, **When** revisa el nombre del archivo,
   **Then** este identifica a la persona, el idioma y la versión, sin nombres genéricos.
4. **Given** que el currículum fue actualizado en el repositorio, **When** un visitante descarga
   inmediatamente después de publicarse el cambio, **Then** recibe la versión más reciente sin que
   nadie haya subido un archivo manualmente.
5. **Given** una combinación de idioma y formato que no está disponible, **When** el visitante abre
   el selector, **Then** esa opción no se ofrece como elegible, en lugar de fallar al descargar.

---

### User Story 6 - Actualizar contenido versionado sin desplegar a mano (Priority: P3)

El responsable del contenido —textos del sitio y datos del currículum— necesita corregir un texto,
sumar una integración o registrar un nuevo puesto laboral editando el repositorio. Cada cambio queda
como una versión trazable en el historial, y el sitio publica siempre la última.

**Why this priority**: Es lo que hace sostenible el sitio en el tiempo y es un requisito explícito
para el currículum, pero no aporta valor al visitante hasta que el sitio ya está publicado.

**Independent Test**: Se prueba modificando un texto y un dato del currículum en el repositorio y
verificando que ambos aparecen publicados sin ninguna intervención manual adicional.

**Acceptance Scenarios**:

1. **Given** el responsable de contenido, **When** edita un texto del sitio en el repositorio,
   **Then** el cambio se publica sin modificar ningún archivo de código de presentación.
2. **Given** el historial del repositorio, **When** se consulta la evolución del currículum,
   **Then** puede reconstruirse qué decía en cualquier punto anterior del tiempo.
3. **Given** un cambio en los datos del currículum, **When** se publica, **Then** todos los formatos
   e idiomas ofrecidos reflejan ese cambio de forma consistente.
4. **Given** un contenido presente en un idioma y ausente en el otro, **When** se intenta publicar,
   **Then** la publicación falla con un mensaje que identifica el contenido faltante.

---

### Edge Cases

- **Asistente conversacional caído o bloqueado**: el widget es un componente externo. Si no carga, es
  bloqueado por una extensión o tarda demasiado, ninguna página debe romperse ni desplazar su
  contenido, y el visitante debe conservar una vía de agenda y de contacto.
- **Envío de formulario fallido**: si el envío no puede completarse, el visitante debe ver un mensaje
  que lo diga con claridad, conservar lo que escribió y recibir un canal alternativo de contacto.
- **Spam automatizado**: el formulario recibirá envíos de bots. Debe filtrarlos sin imponer al
  visitante legítimo una prueba que degrade la accesibilidad.
- **Envíos duplicados**: un visitante que presiona enviar varias veces no debe generar múltiples
  consultas idénticas.
- **Idioma no soportado en la URL**: una dirección con un idioma que el sitio no ofrece debe resolver
  a un idioma válido o a un error tratado, nunca a una página en blanco.
- **URL inexistente**: debe existir una página de error que mantenga la navegación y ofrezca una
  salida hacia la portada.
- **Contenido faltante en un idioma**: nunca debe publicarse una página mezclando idiomas ni mostrando
  identificadores internos de traducción.
- **Reserva de reunión sin horarios disponibles**: el visitante debe entender qué hacer a
  continuación en lugar de encontrar un calendario vacío sin explicación.
- **Datos de currículum inconsistentes**: fechas superpuestas, una experiencia sin fecha de fin que no
  sea la actual, o un campo obligatorio vacío deben detectarse antes de publicar.
- **Pantallas angostas y zoom alto**: todas las páginas deben seguir siendo usables a 320 px de ancho
  y con el texto ampliado al 200%.
- **Enlace compartido en redes sociales**: cualquier URL pública compartida debe mostrar una vista
  previa con título, descripción e imagen correctos en el idioma de la página.

## Requirements *(mandatory)*

### Functional Requirements

#### Estructura y contenido público

- **FR-001**: El sitio MUST publicar exactamente estas páginas en el dominio principal: portada,
  servicios, integraciones, contacto, política de privacidad y términos de uso.
- **FR-002**: El sitio MUST presentar exactamente seis servicios: asistentes conversacionales con
  recuperación de información sobre documentación propia; automatización de flujos de trabajo; base de
  conocimiento interna con búsqueda semántica; desarrollo de producto a medida con IA integrada;
  evaluación, observabilidad y seguridad de IA; y diagnóstico con hoja de ruta de IA.
- **FR-003**: Cada servicio MUST exponer, como mínimo, el problema de negocio que resuelve, qué se
  entrega al cliente y un plazo estimado de ejecución.
- **FR-004**: La portada MUST comunicar la propuesta de valor, la audiencia objetivo y una acción de
  contacto dentro del primer viewport, sin requerir desplazamiento.
- **FR-005**: La portada MUST describir el proceso de trabajo como una secuencia de pasos
  identificables.
- **FR-006**: El sitio MUST NOT publicar casos de éxito, testimonios, listas de clientes ni métricas
  de resultados que no correspondan a trabajos reales verificables.
- **FR-007**: El sitio MUST NOT incluir blog, listado de precios ni página de equipo en esta versión.
- **FR-008**: Toda página pública MUST ser navegable desde cualquier otra mediante una navegación
  principal persistente y un pie de página.

#### Contacto y conversión

- **FR-009**: El sitio MUST ofrecer un formulario de consulta que capture, como mínimo, nombre,
  correo electrónico, empresa (opcional), servicio de interés y el texto de la consulta.
- **FR-010**: El formulario MUST validar los datos antes de aceptarlos y MUST volver a validarlos en
  el servidor, rechazando envíos que no cumplan las reglas.
- **FR-011**: Un envío exitoso MUST producir una confirmación visible que declare el plazo de
  respuesta comprometido.
- **FR-012**: Un envío fallido MUST informar el fallo, preservar los datos ya ingresados y ofrecer un
  canal de contacto alternativo.
- **FR-013**: El sistema MUST entregar cada consulta recibida a un destino operado por Nidra. La
  calificación y el seguimiento posterior de la consulta quedan fuera del alcance de este proyecto,
  a cargo de un proceso externo.
- **FR-014**: El sitio MUST NOT almacenar las consultas más allá de lo estrictamente necesario para
  entregarlas. No existe una base de datos de contactos dentro de este proyecto.
- **FR-015**: Si la entrega de una consulta falla, el sistema MUST reintentarla antes de darla por
  perdida, y MUST dejar constancia del fallo en un registro operativo sin datos personales, de modo
  que Nidra pueda detectar una caída del canal de recepción.
- **FR-016**: El formulario MUST rechazar envíos automatizados mediante un mecanismo que no dependa
  de resolver pruebas visuales ni degrade la operabilidad por teclado o lector de pantalla.
- **FR-017**: El sistema MUST prevenir que un mismo envío repetido genere consultas duplicadas.
- **FR-018**: El sitio MUST ofrecer al visitante la posibilidad de reservar una reunión, y esa
  posibilidad MUST seguir disponible aunque el asistente conversacional no esté operativo.
- **FR-019**: La reserva MUST escribirse en la agenda real del responsable de Nidra, de modo que un
  horario ya ocupado no pueda ofrecerse como disponible.
- **FR-020**: Una reserva confirmada MUST generar una notificación tanto para el visitante como para
  Nidra, con el enlace de la videollamada incluido.
- **FR-021**: El visitante MUST poder reprogramar o cancelar su reunión desde la confirmación
  recibida, sin necesidad de escribir un correo.
- **FR-022**: El sitio MUST reservar un punto de integración para un asistente conversacional
  desarrollado y operado fuera de este proyecto, con un contrato de integración documentado.
- **FR-023**: La ausencia, demora o fallo del asistente conversacional MUST NOT impedir el uso de
  ninguna página, MUST NOT provocar desplazamiento del contenido y MUST NOT bloquear la conversión.

#### Integraciones y tecnologías

- **FR-024**: El sitio MUST listar las integraciones soportadas agrupadas por categoría funcional,
  según el catálogo del Anexo A.
- **FR-025**: El sitio MUST ofrecer al visitante una vía para consultar por una integración que no
  figure en la lista.
- **FR-026**: El sitio MUST declarar explícitamente que la lista es representativa y no exhaustiva, y
  que puede integrarse con cualquier plataforma que exponga una interfaz de programación.
- **FR-027**: La sección de organizaciones nombradas MUST titularse "Tecnologías con las que
  trabajamos". El sitio MUST NOT usar el término "partners", "socios" ni equivalentes mientras no
  existan acuerdos comerciales formalizados y verificables.
- **FR-028**: Toda organización externa nombrada en el sitio MUST presentarse bajo una descripción
  que sea literalmente cierta, sin declarar sociedad, certificación o alianza comercial que no exista.

#### Multilenguaje

- **FR-029**: El sitio MUST publicarse íntegramente en español e inglés, incluyendo navegación,
  formularios, mensajes de error, textos legales y metadatos.
- **FR-030**: Cada página MUST tener una dirección propia y estable por idioma.
- **FR-031**: El cambio de idioma MUST mantener al visitante en la página equivalente.
- **FR-032**: El idioma seleccionado MUST persistir durante toda la navegación.
- **FR-033**: Cada página MUST declarar sus versiones equivalentes en el otro idioma para los
  buscadores.
- **FR-034**: El sistema MUST impedir la publicación de contenido que exista en un idioma y falte en
  el otro.
- **FR-035**: Ninguna página publicada MUST mostrar identificadores internos de traducción.

#### Espacio profesional del fundador

- **FR-036**: El sitio MUST publicar un espacio profesional del fundador en un subdominio propio,
  separado del sitio comercial.
- **FR-037**: El espacio profesional MUST mostrar perfil, experiencia laboral, formación,
  certificaciones, capacidades técnicas e idiomas, legibles sin descargar archivo alguno.
- **FR-038**: El espacio profesional MUST permitir descargar el currículum eligiendo idioma
  (español o inglés) y formato (documento portátil imprimible o versión web imprimible).
- **FR-039**: La versión web del currículum MUST poder imprimirse o guardarse como documento desde el
  navegador conservando una maquetación legible, sin elementos de navegación ni fondos decorativos.
- **FR-040**: El selector MUST ofrecer únicamente combinaciones de idioma y formato efectivamente
  disponibles.
- **FR-041**: El archivo descargado MUST llevar un nombre que identifique a la persona, el idioma y
  la versión del currículum.
- **FR-042**: El contenido descargado MUST corresponder siempre a la última versión publicada del
  currículum, sin intervención manual en el momento de la descarga.

#### Contenido versionado

- **FR-043**: Los datos del currículum MUST residir en el repositorio en un formato estructurado,
  editable sin conocimientos de programación de interfaces.
- **FR-044**: Todo texto publicado del sitio MUST residir en el repositorio separado de los
  componentes que lo presentan, de modo que un cambio de contenido no requiera modificar código de
  presentación.
- **FR-045**: Cada modificación de contenido o de datos del currículum MUST quedar registrada en el
  historial de versiones del repositorio, permitiendo reconstruir el estado en cualquier momento
  anterior.
- **FR-046**: El sitio MUST publicar siempre la última versión disponible del contenido y del
  currículum.
- **FR-047**: Todas las representaciones del currículum —la página del perfil y cada formato
  descargable, en cada idioma— MUST derivarse de la misma fuente de datos, sin duplicación manual.
- **FR-048**: El sistema MUST validar la integridad de los datos del currículum antes de publicar,
  rechazando datos incompletos o cronológicamente inconsistentes.

#### Accesibilidad, hallazgo y transparencia

- **FR-049**: Toda página pública MUST cumplir WCAG 2.1 nivel AA.
- **FR-050**: El contenido esencial y la navegación de toda página informativa MUST estar disponibles
  sin ejecutar JavaScript en el navegador.
- **FR-051**: Toda página pública MUST declarar título, descripción, dirección canónica y metadatos de
  vista previa para redes sociales, en el idioma de la página.
- **FR-052**: El sitio MUST publicar un mapa del sitio y un archivo de directivas para rastreadores,
  generados a partir de las rutas realmente publicadas.
- **FR-053**: El sitio MUST publicar una política de privacidad que declare qué datos personales se
  recogen mediante el formulario, la reserva de reuniones y el asistente conversacional, con qué
  finalidad, durante cuánto tiempo se conservan y cómo ejercer los derechos sobre ellos.
- **FR-054**: El sitio MUST NOT requerir un banner de consentimiento de cookies, lo que implica no
  usar cookies ni identificadores persistentes con fines de seguimiento.
- **FR-055**: El sitio MUST ofrecer una página de error para direcciones inexistentes que conserve la
  navegación y ofrezca retorno a la portada.
- **FR-056**: Toda dirección pública publicada MUST considerarse permanente; retirarla o moverla
  REQUIERE una redirección permanente hacia su reemplazo.

### Key Entities

- **Servicio**: una oferta comercial de Nidra. Atributos: identificador estable, nombre, resumen de
  una línea, problema que resuelve, entregables, plazo estimado, orden de presentación. Existe en
  ambos idiomas. Se referencia desde el formulario como "servicio de interés".
- **Categoría de integración**: agrupación funcional de herramientas (por ejemplo, comunicación,
  datos, comercio, productividad). Atributos: nombre, orden. Agrupa integraciones.
- **Integración**: una herramienta o plataforma externa con la que Nidra puede conectar una solución.
  Atributos: nombre, categoría, marca visual. Pertenece a una categoría.
- **Organización nombrada**: tecnología, proveedor o alianza mencionada en el sitio. Atributos:
  nombre, marca visual, naturaleza declarada de la relación. Su naturaleza debe ser verificable.
- **Consulta**: mensaje enviado por un visitante desde el formulario. Atributos: nombre, correo,
  empresa, servicio de interés, texto, idioma de origen, momento de recepción. Es un objeto en
  tránsito: se entrega y no se conserva dentro de este proyecto.
- **Reserva de reunión**: reunión agendada por un visitante contra la agenda real del responsable.
  Atributos: momento, duración, datos de contacto del visitante, enlace de videollamada, estado.
  Reside en el sistema de calendario externo; el sitio solo origina la reserva.
- **Perfil profesional**: los datos del fundador que alimentan tanto la página del subdominio como
  cada archivo descargable. Atributos: datos de contacto, resumen profesional, experiencias,
  formación, certificaciones, capacidades técnicas agrupadas, idiomas. Fuente única de verdad,
  versionada en el repositorio.
- **Experiencia laboral**: un puesto dentro del perfil profesional. Atributos: puesto, organización,
  cliente o proyecto, fecha de inicio, fecha de fin o vigencia actual, logros, tecnologías.
- **Versión del currículum**: el estado del perfil profesional en un momento dado del historial.
  Atributos: identificador de versión, fecha de publicación. Determina el nombre del archivo
  descargado.
- **Idioma**: un idioma soportado por el sitio (español, inglés). Determina direcciones, contenido y
  metadatos. Uno es el idioma por defecto.
- **Contenido de página**: los textos publicables de cada página, separados de su presentación y
  existentes en cada idioma soportado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante que nunca oyó hablar de Nidra puede explicar correctamente qué hace la
  empresa y a quién le sirve tras 60 segundos en la portada; se verifica con 5 evaluadores externos y
  se considera cumplido con al menos 4 respuestas correctas.
- **SC-002**: Un visitante puede pasar de la portada a una consulta enviada en 3 pasos o menos y en
  menos de 2 minutos.
- **SC-003**: El 100% de las consultas enviadas con datos válidos llegan al canal de recepción de
  Nidra dentro de los 5 minutos.
- **SC-004**: Un visitante puede pasar de la portada a una reunión confirmada en su calendario en
  menos de 2 minutos, sin intercambiar correos.
- **SC-005**: Ninguna reserva se confirma sobre un horario ya ocupado en la agenda del responsable,
  verificable ocupando un horario y comprobando que deja de ofrecerse.
- **SC-006**: El contenido principal de cualquier página es visible en menos de 2,5 segundos en un
  teléfono de gama media sobre una conexión móvil típica.
- **SC-007**: El contenido no se desplaza mientras carga la página: el desplazamiento acumulado se
  mantiene por debajo de 0,1 en todas las páginas.
- **SC-008**: Toda página pública alcanza al menos 90 puntos en rendimiento, accesibilidad, buenas
  prácticas y posicionamiento en una auditoría automatizada en modo móvil.
- **SC-009**: Una auditoría de accesibilidad automatizada no reporta violaciones de nivel A ni AA en
  ninguna página, y el recorrido completo de portada a consulta enviada puede realizarse usando solo
  el teclado.
- **SC-010**: El 100% de las páginas existen y son navegables en los dos idiomas, sin textos sin
  traducir ni identificadores de traducción visibles.
- **SC-011**: Todas las páginas siguen siendo legibles y operables a 320 px de ancho y con el texto
  ampliado al 200%, sin desplazamiento horizontal.
- **SC-012**: Un cambio de texto o de dato del currículum queda publicado sin que nadie edite código
  de presentación ni suba archivos manualmente.
- **SC-013**: El 100% de las combinaciones de idioma y formato ofrecidas para el currículum producen
  una descarga válida cuyo contenido coincide con el perfil mostrado en pantalla.
- **SC-014**: La versión web del currículum, impresa desde el navegador, produce un documento sin
  elementos de navegación ni cortes de contenido a mitad de una sección.
- **SC-015**: Con el asistente conversacional deshabilitado o bloqueado, el 100% de las páginas siguen
  siendo utilizables y sigue siendo posible enviar una consulta y reservar una reunión.
- **SC-016**: Con JavaScript deshabilitado, el contenido y la navegación del 100% de las páginas
  informativas siguen disponibles.
- **SC-017**: Menos del 5% de las consultas recibidas en el canal de Nidra son spam automatizado.
- **SC-018**: El sitio no instala cookies ni identificadores persistentes de seguimiento, verificable
  inspeccionando el almacenamiento del navegador tras recorrer todas las páginas.

## Assumptions

- **Destino de las consultas**: las consultas se entregan por correo electrónico a una casilla de
  Nidra. No se almacenan ni se integra un CRM: la calificación de leads la resuelve un proceso
  externo, fuera del alcance de este proyecto.
- **Plazo de respuesta comprometido**: un día hábil, salvo indicación en contrario.
- **Reserva de reuniones**: el asistente conversacional externo será el canal principal de agenda,
  pero el sitio expone su propia vía de reserva conectada al calendario del responsable, que funciona
  desde el primer día y queda como respaldo permanente. Duración asumida de la reunión inicial:
  30 minutos, por videollamada.
- **Contrato del asistente conversacional**: se define y documenta desde este proyecto, y el equipo
  del asistente lo implementa. El sitio no depende de que el asistente exista para publicarse.
- **Idioma por defecto**: español, por ser el mercado inicial. El inglés es completo, no parcial.
- **Redacción del contenido en inglés**: la produce el equipo del proyecto a partir del contenido en
  español y queda sujeta a revisión del responsable antes de publicar.
- **Currículum en español**: no existe todavía; se deriva de la versión en inglés existente como
  parte de la construcción de la fuente de datos del perfil.
- **Formatos del currículum**: documento portátil imprimible y versión web imprimible, en ambos
  idiomas. Se descarta un formato editable de procesador de texto por el costo de mantenerlo
  sincronizado en cada idioma con la fuente de datos.
- **Datos del perfil profesional**: provienen del currículum vigente del fundador (Juan Mujica,
  AI/GenAI Engineer, más de 13 años de experiencia en ingeniería de software).
- **Dominios**: el sitio comercial se publica en `nidra.cloud` y el espacio profesional en
  `jmujica.nidra.cloud`. Ambos dominios están disponibles y bajo control de Nidra.
- **Sin cuentas de usuario**: el sitio no tiene registro, inicio de sesión ni área privada.
- **Sin gestor de contenidos**: la edición ocurre en el repositorio, según los principios de
  simplicidad del proyecto.
- **Volumen de tráfico**: bajo a moderado, propio de un sitio institucional nuevo. No hay requisitos
  de alta concurrencia.
- **Analítica**: si se incorpora, será sin cookies y sin datos personales, para no requerir banner de
  consentimiento.
- **Marcas de terceros**: los logotipos de integraciones y tecnologías se usan de forma nominativa,
  respetando las condiciones de uso de marca de cada titular.

## Resolved Decisions

Decisiones tomadas por el responsable el 2026-07-30, incorporadas a los requisitos.

- **RD-001 (Historia 5)**: los formatos de descarga del currículum son documento portátil imprimible
  y versión web imprimible, en español e inglés. Se descarta el formato editable de procesador de
  texto. → FR-038, FR-039.
- **RD-002 (Historia 4)**: el catálogo de integraciones publica las plataformas principales del
  mercado, con foco en aquellas donde existe experiencia demostrable, y declara explícitamente que
  puede integrarse con cualquier ecosistema que exponga una interfaz de programación. → FR-024,
  FR-026, Anexo A.
- **RD-003 (Historia 4)**: la sección se titula "Tecnologías con las que trabajamos"; no se usa
  "partners" ni equivalentes mientras no existan acuerdos formalizados. → FR-027.
- **RD-004 (Historia 2)**: las consultas del formulario no se almacenan. La calificación de leads la
  resuelve un proceso externo, fuera del alcance de este proyecto. → FR-013, FR-014.
- **RD-005 (Historia 2)**: la reserva de reuniones opera contra el Google Calendar del responsable.
  El sitio expone su propia vía de reserva desde el primer día, sin depender del asistente
  conversacional. → FR-018 a FR-021, Anexo B.

## Anexo A — Catálogo de integraciones (v1)

Lista representativa, no exhaustiva, para la página de integraciones (FR-024). Las marcadas con ★
corresponden a experiencia demostrable del equipo y deben presentarse primero dentro de su categoría.
El resto son plataformas líderes de mercado que se integran mediante sus interfaces públicas.

| Categoría | Integraciones |
|---|---|
| Modelos y plataformas de IA | OpenAI ★, Anthropic, Google Gemini, Azure OpenAI |
| Bases de datos y vectores | PostgreSQL ★, Supabase ★, pgvector ★, Qdrant ★, MongoDB ★ |
| Automatización y orquestación | n8n ★, Make, Zapier |
| Mensajería y eventos | Kafka ★, RabbitMQ ★ |
| Comunicación y colaboración | Slack, Microsoft Teams, WhatsApp Business, Telegram, Gmail ★, Google Workspace ★ |
| CRM y ventas | HubSpot, Salesforce, Pipedrive, Zoho |
| Marketing y publicidad | Google Ads ★, Meta Ads, Mailchimp |
| Comercio y pagos | Shopify, WooCommerce, Stripe, Mercado Pago |
| Gestión y productividad | Notion, Google Sheets ★, Airtable, Jira, Trello |
| Nube e infraestructura | AWS ★, Docker ★, Vercel, Cloudflare |
| Documentos y almacenamiento | Google Drive ★, Microsoft 365, Dropbox |

**Reglas de presentación**:

1. La página MUST cerrar con una declaración de alcance abierto y una vía de consulta (FR-025,
   FR-026).
2. Ninguna entrada MUST implicar certificación oficial, programa de socios ni respaldo del titular
   de la marca (FR-028).
3. Las entradas sin experiencia demostrable MUST NOT presentarse con un nivel de compromiso distinto
   al de las marcadas con ★; la diferencia se refleja en el orden, no en afirmaciones sobre el
   dominio de cada plataforma.

## Anexo B — Vía de reserva de reuniones

**Necesidad**: el visitante reserva desde el sitio y la reunión aparece en el Google Calendar del
responsable, sin doble reserva ni intercambio de correos (FR-018 a FR-021).

**Opción recomendada — plataforma de agendamiento con sincronización bidireccional de calendario**
(Cal.com y equivalentes): lee la disponibilidad real del calendario conectado para no ofrecer
horarios ocupados, escribe el evento al confirmar, genera el enlace de videollamada, envía las
notificaciones y expone al visitante enlaces propios de reprogramación y cancelación. Ofrece
incrustación en el sitio y también una página propia, lo que satisface el requisito de que la reserva
siga disponible aunque el JavaScript del sitio o el asistente conversacional fallen. Cubre FR-018 a
FR-021 sin construir nada a medida.

**Alternativa — integración directa contra la interfaz de programación de Google Calendar**: da
control total sobre la experiencia, pero obliga a construir y mantener el cálculo de disponibilidad,
la prevención de doble reserva, las notificaciones, la generación del enlace de videollamada y los
flujos de reprogramación y cancelación. Contradice el principio de simplicidad de la constitución sin
un beneficio proporcional en esta versión.

**Descartado — enlace a un formulario de contacto para coordinar por correo**: no cumple FR-019 ni
SC-004.

La elección concreta de proveedor y el modelo de conexión se cierran en `/speckit-plan`.
