# Asistente conversacional de Nidra — brief para un proyecto aparte

Este documento **no describe una funcionalidad de este repositorio**. Es el
encargo para un proyecto independiente, que se conecta con el sitio por un
solo punto: el archivo de script que el sitio carga cuando existe la variable
`NEXT_PUBLIC_CHAT_EMBED_URL`.

## Cómo se usa

1. Creá un repositorio nuevo y vacío.
2. Instalá Spec Kit: `uvx --from git+https://github.com/github/spec-kit.git specify init . --integration claude --script sh`
3. Corré `/speckit.constitution` y pegá la sección **Principios** de acá.
4. Corré `/speckit.specify` y pegá **todo el bloque «El encargo»**.
5. Seguí con `/speckit.plan`, `/speckit.tasks` y `/speckit.implement`.

Las secciones que van después de «El encargo» son decisiones ya tomadas y
restricciones externas. Pasalas en `/speckit.plan`, no en `/speckit.specify`:
la especificación describe **qué** tiene que pasar, no con qué se construye.

---

## Principios

Para `/speckit.constitution`.

**I. No inventar es más importante que responder.** El asistente sólo afirma
lo que puede citar del material de Nidra. Ante una pregunta que no puede
responder con evidencia, dice que no sabe y ofrece derivar a una persona.
Una respuesta inventada sobre precios o plazos destruye más valor del que
genera todo el asistente junto.

**II. El asistente no vende, califica.** No cierra tratos, no negocia y no
compromete a Nidra. Su trabajo es entender el problema del visitante,
registrarlo con precisión y, cuando corresponde, conseguir una reunión.

**III. Los datos de una persona son de esa persona.** Todo lo que se guarda
tiene que estar declarado en la política de privacidad antes de encenderse,
tiene que poder borrarse a pedido y no puede salir a ningún tercero que no
esté declarado.

**IV. Presupuesto de costo explícito.** Cada conversación tiene un techo de
gasto medido. Si el costo por conversación supera el objetivo, se corrige el
diseño, no se sube el presupuesto en silencio.

**V. Degradar antes que fallar.** Si el modelo no responde, si la búsqueda no
encuentra o si la agenda no está disponible, el asistente lo dice y ofrece el
formulario o el correo. Nunca deja al visitante sin salida.

---

## El encargo

Para `/speckit.specify`. Pegá todo lo que sigue, hasta el separador.

### Qué es

Un asistente conversacional para el sitio de Nidra, una agencia de desarrollo
de software con inteligencia artificial de Buenos Aires que le vende a PyMEs y
emprendedores de Argentina y América Latina. La lleva adelante una sola
persona, Juan Mujica.

El asistente vive en un botón flotante en todas las páginas del sitio. Se abre
en un panel lateral y conversa en español o en inglés, según el idioma en el
que esté la página.

### A quién le habla

A un dueño o gerente de una empresa de menos de 50 personas. No es técnico:
puede no saber usar una planilla de cálculo con soltura. Llegó al sitio porque
algo le consume horas todas las semanas y sospecha que se puede resolver, pero
no sabe cómo, cuánto cuesta ni por dónde empezar.

Suele haber comprado antes un sistema que nadie terminó de usar. Su objeción
real no es el precio: es que esto termine como la vez anterior.

### Qué tiene que lograr

Tres cosas, en este orden de importancia:

1. **Responder las preguntas que hoy quedan sin responder** sobre los
   servicios, los plazos, con qué sistemas se integra y cómo se trabaja.
2. **Registrar de qué se trata cada consulta** con suficiente detalle como para
   que Juan pueda revisarlas después, ordenarlas por interés y armar un
   catálogo de potenciales clientes.
3. **Conseguir la reunión de 30 minutos** cuando el visitante está listo, sin
   empujarla cuando no lo está.

### Historias de usuario

**Como dueño de una PyME que llegó al sitio**, quiero preguntar en mis propias
palabras si lo que necesito se puede resolver, para saber si vale la pena
seguir leyendo o escribir.

**Como dueño de una PyME interesado**, quiero contar mi problema una sola vez y
que quede registrado, para no tener que repetirlo desde cero en la primera
reunión.

**Como dueño de una PyME decidido**, quiero reservar una reunión sin salir de
la conversación ni completar otro formulario.

**Como visitante que pregunta algo que el asistente no sabe**, quiero que me lo
diga de frente y me deje una vía para averiguarlo, en vez de recibir una
respuesta que suena bien y es falsa.

**Como Juan**, quiero abrir una lista de conversaciones ordenadas por cuánto
me interesan, con el problema de cada visitante ya resumido, para decidir a
quién le escribo primero sin leer transcripciones completas.

**Como Juan**, quiero ver qué preguntas no supo responder el asistente, para
saber qué le falta al material del sitio.

**Como visitante que dio sus datos**, quiero poder pedir que los borren y que
efectivamente se borren.

### Qué tiene que hacer

**Responder con base en el material de Nidra, y sólo en él.** El material es:
los seis servicios con su problema, entregables y plazo; el catálogo de
integraciones; las tecnologías; el proceso de trabajo de cuatro etapas; la
trayectoria profesional de Juan; y las páginas de privacidad y términos.

**Citar de dónde sale cada afirmación.** Cada respuesta que afirme algo sobre
servicios, plazos o integraciones tiene que poder mostrar en qué parte del
material se apoya.

**Negarse a responder cuando no encuentra respaldo.** Si la búsqueda no
devuelve material suficiente, el asistente dice que no lo sabe y ofrece dejar
la consulta o agendar una reunión. No completa el hueco con conocimiento
general.

**Nunca decir un precio.** Nidra no publica precios: se cotizan por escrito
después de conocer el proceso del cliente. El asistente explica ese criterio y
cómo se llega al número, pero no estima, no da rangos y no dice «depende, pero
podría rondar».

**Nunca prometer plazos fuera de los publicados.** Los rangos de cada servicio
son los únicos plazos que puede mencionar, y siempre como estimación.

**Nunca afirmar que Nidra tiene clientes o casos de éxito.** No los tiene
todavía. Si se lo preguntan, lo dice y ofrece la trayectoria verificable de
Juan como respaldo.

**Registrar cada conversación** con: el problema que describió el visitante, el
sector de su empresa si lo mencionó, el tamaño si lo mencionó, qué
herramientas usa hoy, qué servicio le corresponde del catálogo, y qué tan
listo parece para avanzar.

**Ofrecer la reunión cuando corresponde**, y sólo entonces. No en el primer
mensaje. Cuando el visitante ya describió un problema concreto y mostró
intención, el asistente ofrece agendar.

**Pedir el correo antes de terminar** cuando la conversación tuvo contenido
real, explicando para qué se lo pide.

**Funcionar en los dos idiomas** con la misma exactitud. Responde en el idioma
en que le escriben.

**Avisar que es un asistente automático** en su primer mensaje. Sin
personalidad falsa, sin nombre de persona, sin fingir ser Juan.

### Qué NO tiene que hacer

- No negocia, no descuenta y no compromete alcance ni fechas.
- No pide datos que no necesita: sin teléfono, sin dirección, sin CUIT.
- No insiste. Si el visitante no quiere dar su correo, sigue respondiendo.
- No responde consultas ajenas a Nidra, aunque sepa la respuesta.
- No guarda tarjetas, contraseñas ni ningún dato de pago.
- No aparece de golpe al entrar. Se abre sólo si el visitante lo abre.

### Qué necesita Juan del otro lado

Un panel privado, para él solo, con:

- La lista de conversaciones, ordenable por fecha y por interés.
- El resumen de cada una: problema, sector, tamaño, herramientas, servicio y
  nivel de interés, ya extraídos.
- La transcripción completa, para cuando el resumen no alcanza.
- Las preguntas que el asistente no supo responder, agrupadas por parecido.
- El costo acumulado del mes.
- Un botón para borrar una conversación y sus datos.

### Cuándo está terminado

- Un visitante puede preguntar por cualquiera de los seis servicios y recibir
  una respuesta correcta con su cita, en los dos idiomas.
- Ante veinte preguntas fuera del material, el asistente se niega en las
  veinte. Cero respuestas inventadas.
- Ante diez preguntas de precio formuladas de distinta manera, no dice un
  número en ninguna.
- Una conversación de intención clara termina con la reunión agendada o con el
  correo capturado.
- Juan puede ver una conversación nueva en su panel en menos de un minuto
  desde que terminó.
- El costo promedio por conversación se mide y se muestra.
- El panel no es accesible sin autenticarse.

---

## Decisiones técnicas ya tomadas

Para `/speckit.plan`. Cada una viene con el motivo y con el disparador que la
invalidaría.

### El modelo

**GPT-5.4 Mini** como modelo único.

Al momento de escribir esto cuesta unos USD 0,75 por millón de tokens de
entrada y 4,50 de salida. Una conversación típica de diez turnos con material
recuperado ronda los 20.000 tokens de entrada y 3.000 de salida: unos **3
centavos de dólar por conversación**, o unos 3 dólares cada cien.

**Verificá el precio antes de decidir.** Cambia seguido, y este documento
envejece.

Por qué no el más barato: Nano cuesta la cuarta parte, pero la fiabilidad al
llamar herramientas y al extraer datos estructurados es lo que sostiene el
registro de consultas y la reserva de reuniones. Ahorrar dos dólares por mes a
cambio de extracciones erráticas es un mal negocio.

Por qué no uno más grande: el trabajo es responder sobre un corpus chico y
cerrado. La capacidad de razonamiento adicional no mejora eso; sólo encarece.

**Disparador para cambiar:** si la tasa de negativas correctas baja del 95% en
las pruebas, subir a GPT-5.4 antes de tocar cualquier otra cosa.

Activá **caché de prompt**: el instructivo del sistema y el material recuperado
se repiten entre turnos, y el descuento por prefijo repetido es sustancial.

### La arquitectura

**Next.js sobre Vercel.** Juan ya lo usa en el sitio, el plan gratuito alcanza
para este volumen y el despliegue es el mismo flujo que ya conoce. No hay
razón para introducir un segundo entorno de operación.

**Vercel AI SDK** para el streaming y las llamadas a herramientas. Evita
escribir a mano el bucle de conversación con herramientas, que es la parte más
fácil de romper.

**Supabase** para las dos cosas: `pgvector` para la búsqueda del material y
Postgres para las conversaciones y los datos extraídos. Juan ya lo usa, el plan
gratuito alcanza, y una sola base es una sola cosa que respaldar.

**Cal.com** para la reunión. En la primera versión el asistente **entrega el
enlace de reserva con los datos ya cargados**, no reserva por API. Reservar por
API agrega modos de falla —conflictos de agenda, zonas horarias, cancelaciones—
para ahorrarle al visitante un clic. Se puede hacer después, cuando haya
volumen que lo justifique.

**El widget** es un archivo de script que monta un iframe. El iframe aísla los
estilos y el JavaScript del asistente de los del sitio: ninguno puede romper al
otro. El sitio ya está preparado para cargarlo desde
`NEXT_PUBLIC_CHAT_EMBED_URL`.

### Cómo se evita que invente

Estas son las cinco defensas, y hacen falta las cinco:

1. **Búsqueda sobre material propio.** Nada de conocimiento general. El corpus
   son los archivos de contenido del sitio, convertidos a fragmentos con su
   origen.
2. **Umbral de confianza.** Si el mejor resultado no supera el umbral, el
   asistente se niega. El umbral se calibra con las pruebas, no se elige a ojo.
3. **Cita obligatoria.** El modelo devuelve la respuesta y el identificador del
   fragmento que la respalda. Si no puede citar, no afirma.
4. **Prohibiciones explícitas en el instructivo**, para precios, plazos,
   clientes y casos de éxito.
5. **Conjunto de pruebas con respuestas esperadas**, que corre en cada cambio y
   bloquea el despliegue si baja de umbral.

La quinta es la que hace que las otras cuatro sigan funcionando dentro de seis
meses. Sin ella, cualquier ajuste del instructivo puede romper una defensa sin
que nadie se entere.

Es, además, exactamente el servicio «Evaluación y seguridad de IA» que Nidra
vende. Construirlo acá primero significa poder mostrarlo.

### La extracción de datos

Usá **salidas estructuradas** con un esquema fijo para extraer problema,
sector, tamaño, herramientas, servicio e interés. No parsees texto libre: un
esquema que el modelo debe cumplir es la diferencia entre un catálogo usable y
una pila de notas.

Extraé **al terminar la conversación**, en una sola llamada sobre la
transcripción completa. Extraer en cada turno multiplica el costo y da peores
resultados, porque el contexto está incompleto.

---

## Lo que este proyecto le exige al sitio actual

Tres cosas, y **las tres son bloqueantes**: sin ellas el asistente no se puede
encender.

### 1 · Actualizar la política de privacidad, ANTES de encenderlo

La política actual dice, textualmente:

> «El sitio no guarda las consultas en ninguna base de datos.»

Y promete:

> «Si en el futuro incorporo un asistente conversacional, actualizo esta
> política antes de ponerlo en funcionamiento, detallando qué datos recoge y
> con qué finalidad.»

El asistente **sí guarda conversaciones en una base de datos**. Encenderlo sin
actualizar la política convierte esas dos frases en falsas, y una de ellas es
una promesa explícita.

Hay que declarar: qué se guarda, por cuánto tiempo, que OpenAI procesa el
contenido de la conversación, y cómo se pide el borrado.

### 2 · Revisar la política de contenido del sitio

El sitio no aplica `script-src` en su CSP, y el motivo está escrito en
`lib/seo/headers.ts`: hoy no hay código de terceros. El widget **es** código de
terceros. Al montarlo hay que volver sobre esa decisión.

### 3 · Registrar la base de datos ante la AAIP

En Argentina, quien mantiene una base de datos con información personal debe
inscribirla ante la Agencia de Acceso a la Información Pública, según la Ley
25.326. Hoy el sitio no tiene base de datos y no aplica. Con el asistente, sí.

**No soy abogado y esto no es asesoramiento legal.** Es un trámite que conviene
consultar antes de encender el asistente, no después.

---

## Riesgos, ordenados por lo que cuesta cada uno

**Que invente un precio.** Es el peor. Un número dicho por el asistente es un
número que el visitante va a esperar en la cotización, y desmentirlo arranca la
relación con una corrección. Las pruebas de precio deben ser las más
exhaustivas del conjunto.

**Que prometa algo que Nidra no hace.** Menos grave que el precio, pero de la
misma familia. Lo cubre el mismo mecanismo.

**Que la extracción llene el catálogo de ruido.** Si el resumen no es
confiable, Juan va a leer transcripciones completas, y el catálogo deja de
tener sentido. Se mide revisando a mano las primeras veinte conversaciones
contra su resumen.

**Que el costo se dispare por conversaciones largas.** Poné un tope de turnos
por conversación y de tokens por turno. Sin tope, una sola conversación
patológica puede costar más que un mes entero.

**Que alguien lo use como asistente general gratuito.** El límite de tema y el
tope de turnos lo cubren.

---

## Lo que NO hay que construir todavía

- Voz, ni entrada ni salida.
- Integración con CRM. El panel propio alcanza hasta que haya volumen.
- Múltiples asistentes o personalidades.
- Aprendizaje automático a partir de las conversaciones.
- Traducción a idiomas más allá de español e inglés.
- Aplicación móvil.
- Reserva por API en la primera versión.
