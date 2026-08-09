# DSS Multiservices — Plan de implementación del Asistente Ejecutivo (qué hacer primero, cómo, y por qué)

*Generado 2026-07-17 por Freddy Sulbaran (IT) para David Salazar / DSS Multiservices. Complementa `QC-Maintenance-Historia-y-Lecciones.md`, `David-Persona-Comunicacion.md` y `DSS-Asistente-Ejecutivo-Spec.md` — léase después de esos tres. Contexto de partida: DSS Multiservices es un emprendimiento nuevo de David, sin historial operativo propio todavía (al momento de escribir esto: 3 usuarios en el Workspace, correo de David en migración desde el backup de QC Maintenance, un Shared Drive recién creado). No hay clientes, contratos ni empleados propios de DSS documentados aún.*

---

## Principio rector de la priorización

No se está construyendo el asistente completo del `DSS-Asistente-Ejecutivo-Spec.md` de una sola vez. Se construye **en el orden en que reduce carga cognitiva real, hoy, con la información que ya existe** — no en el orden en que "se ve más completo". Dos consecuencias directas:

1. Todo lo que depende de que exista *volumen real de negocio en DSS* (cumplimiento de personal, seguros, reportes regulatorios) se pospone — construirlo ahora sería automatizar el vacío, no el negocio real de David.
2. Todo lo que ya está evidenciado en 8 años de comportamiento real de David (Documento B) se prioriza — es la única fuente de verdad que ya tenemos sobre cómo trabaja.

---

## Fase 0 — Higiene, sin IA (hacer esta semana)

No es "el asistente" todavía — es la base sin la cual el asistente no tiene dónde pararse.

### 0.1 Separar correo personal de correo de negocio
**Por qué**: en los 9 buzones de QC Maintenance analizados, la mezcla de correo personal y corporativo fue un problema transversal — desde ruido cosmético hasta datos sensibles circulando por el mismo canal que la operación crítica (Documento A, sección 4.5). Es el error más barato de no repetir, y el más caro de corregir después de que un asistente de IA ya está leyendo ese buzón.

**Cómo**:
- Confirmar con David que `dsalazar@dssmultiservices.com` es *solo* para negocio desde el día uno; sugerirle una cuenta personal separada (Gmail normal) para lo que no es DSS.
- Configurar un filtro en Gmail que detecte remitentes claramente personales conocidos (aerolíneas, retail, apps que ya aparecían en los buzones viejos) y los archive fuera de la bandeja principal, en vez de dejar que se acumulen mezclados.

### 0.2 Calendar activo y accesible
**Por qué**: la Fase 1 del spec (sección 2.6) depende de poder sugerir "bloques de calendario" reales, no solo tareas en una lista. Sin un calendario que el asistente pueda leer/escribir, esa función del spec es papel mojado.

**Cómo**: confirmar que Google Calendar está activo para `dsalazar@dssmultiservices.com` (viene con Workspace) y que la service account multi-dominio ya creada (`gam-multidomain@gam-multidomain-migration.iam.gserviceaccount.com`, ver `AGENTS.md`) tiene el scope de Calendar autorizado — ya lo tiene (fue parte del scope "control total" que se autorizó). Solo falta usarlo.

---

## Fase 1 — El primer asistente real (empezar apenas Fase 0 esté lista)

Esta es la recomendación central: **empezar por el borrador automático de respuestas rutinarias, no por el sistema de vigilancia de cumplimiento.**

### 1.1 Borrador automático de correos rutinarios, en la voz de David

**Por qué esto primero y no otra cosa**: el Documento B muestra que la inmensa mayoría del correo real de David es corto y repetitivo — cotizaciones con fórmula fija ("Prix forfaitaire: X$ + taxes"), confirmaciones de agenda, acuses de recibo ("Bien reçu"), seguimiento de pendientes ("je te reviens"). Es exactamente el tipo de correo que un asistente puede pre-redactar con alta confianza y bajo riesgo, y es el volumen más alto de su día a día — por lo tanto, el que más carga cognitiva le quita por unidad de esfuerzo de implementación (la métrica única del spec, sección 1).

**Por qué NO empezar por lo demás**: negociación de precio, manejo de quejas complejas o cobros son áreas donde el propio David delega o sube el registro con cuidado (Documento B, sección 4) — automatizarlas primero sería más riesgo (un borrador mal calibrado en una negociación importa mucho más que uno mal calibrado en un "bien recibido") por menos beneficio (son minoría del volumen).

**Cómo (implementación concreta)**:
1. Usar la Gmail API sobre `dsalazar@dssmultiservices.com` (ya autorizada vía DWD con el service account multi-dominio, scope `https://mail.google.com/`).
2. Un proceso (cron cada 10-15 min, o disparado por notificación push de Gmail) revisa correos nuevos sin la etiqueta `procesado-asistente`.
3. Clasifica cada correo entrante en: (a) rutinario con plantilla clara (cotización estándar, confirmación de horario, acuse de recibo) → generar borrador automáticamente; (b) todo lo demás → no tocar, dejarlo para David sin intervención.
4. Para (a): llamar a un modelo de lenguaje con el contenido del correo entrante + `David-Persona-Comunicacion.md` como contexto de estilo, generar el borrador, guardarlo como **Draft** de Gmail (`users.drafts.create`) — nunca enviarlo (principio 2.1 del spec, no negociable).
5. Etiquetar el correo original como `procesado-asistente` para no volver a generar un segundo borrador sobre el mismo hilo.
6. David revisa sus Drafts como parte de su flujo normal de Gmail — no hace falta una interfaz nueva para empezar.

**Alcance inicial deliberadamente chico**: arrancar solo con 2-3 tipos de correo (ej. confirmaciones de horario + acuses de recibo simples) antes de sumar cotizaciones. Es más fácil ganar confianza con algo acotado que funciona bien que con algo amplio que falla seguido.

### 1.2 Vigilancia de silencio — versión simple, sin IA todavía

**Por qué**: es la lección más repetida y más cara de todo el Documento A — permisos vencidos, reportes atrasados, seguros vencidos, todos tenían alertas y aun así se perdían porque nadie cerraba el loop activamente. Y es un hábito que David ya tiene naturalmente (Documento B, sección 7: "petit rappel amical", "je vous reviens") — el asistente no le está enseñando algo nuevo, solo lo está sistematizando para que no dependa de que él se acuerde.

**Cómo (sin necesidad de IA para la v1)**:
1. Etiqueta de Gmail `esperando-respuesta`, aplicada por David (o automáticamente por el mismo proceso de 1.1 cuando detecta que un correo saliente termina en una pregunta o pedido de confirmación explícito).
2. Un script diario revisa: `label:esperando-respuesta -label:respondido older_than:5d` (ajustar el umbral de días).
3. Por cada match, genera un recordatorio simple — puede ser tan básico como un correo a él mismo, o un evento de calendario para esa mañana, usando el mismo patrón textual que David ya usa ("Petit rappel amical: seguís esperando respuesta de X sobre Y desde hace N días").
4. Recién cuando esto funcione de forma confiable, agregar la capa de IA que redacta el recordatorio real *al tercero* (no solo le avisa a David) — eso sí requiere el borrador-y-aprobación de 1.1.

### 1.3 Segundo cerebro — memoria institucional de la empresa y de la conversación

**Por qué esto va en Fase 1 y no se pospone a Fase 2**: el hallazgo más caro de todo el Documento A es que QC Maintenance nunca sistematizó su conocimiento institucional — vivía en la memoria de 2-3 personas del núcleo familiar, no en ningún sistema (sección 4.7, "dependencia de personas clave sin sistematización del conocimiento"). Reconstruirlo después de 8 años y 150.000 correos sin sistematizar requirió, literalmente, 15 agentes de IA leyendo en paralelo durante horas. DSS tiene ahora mismo la oportunidad de **no volver a acumular esa deuda**: capturar el conocimiento a medida que se genera cuesta casi nada comparado con reconstruirlo después.

Además, no arranca de cero: **los documentos `QC-Maintenance-Historia-y-Lecciones.md` y `David-Persona-Comunicacion.md` ya son la versión 0 / semilla de este segundo cerebro** — contienen 8 años de contexto de clientes, proveedores, vocabulario del negocio, y patrones de comunicación ya extraídos y estructurados. El trabajo que falta no es "empezar desde cero", es (a) hacerlos consultables por el asistente en tiempo real, y (b) mantenerlos vivos a medida que DSS opera.

**Qué es concretamente**:
- **Base de conocimiento de la empresa**: clientes (historial, precios acordados, quejas pasadas, preferencias), proveedores, empleados, plantillas/tarifas estándar, glosario del negocio (ya semillado en el Documento B, sección 5) — todo lo que hoy solo "sabe" David de memoria.
- **Memoria de conversación**: cada correo, reunión o decisión relevante queda indexado y buscable, para que el asistente (o David, o vos) pueda preguntar "¿qué le cotizamos a este cliente la última vez?" o "¿cómo resolvimos algo parecido antes?" en vez de tener que recordarlo o buscarlo manualmente.

**Cómo (implementación concreta)**:
1. Migrar `QC-Maintenance-Historia-y-Lecciones.md` y `David-Persona-Comunicacion.md` a un almacén consultable (lo más simple que funcione primero: una base vectorial ligera o incluso una carpeta de documentos indexada por el mismo asistente vía búsqueda semántica) — esta es la semilla inicial del segundo cerebro.
2. Cada correo que pasa por el proceso de 1.1 (borrador automático) se indexa también aquí — no solo se usa una vez y se descarta. Con el tiempo, cada cliente/proveedor nuevo de DSS queda documentado automáticamente por el solo hecho de que el asistente procesó su correspondencia.
3. Agregar manualmente lo que no vive en el correo: contratos firmados, tarifas acordadas verbalmente, decisiones de reuniones — aunque sea al principio con un proceso simple ("David/Freddy pegan un resumen de la reunión en un doc, el asistente lo indexa").
4. El asistente de 1.1 y 1.2 debe **consultar este segundo cerebro antes de redactar un borrador** (no solo mirar el correo entrante aislado) — así el borrador de una cotización nueva puede reflejar automáticamente el precio que se le dio a ese mismo cliente la vez anterior, sin que David tenga que recordarlo o buscarlo.

**Qué NO hacer todavía**: no construir una base de conocimiento genérica "de toda la industria" o con documentación especulativa sobre un negocio que aún no existe — el segundo cerebro crece con lo que realmente pasa en DSS (y con lo heredado de QC Maintenance), no con contenido genérico agregado para que "se vea completo".

**Actualización importante (2026-07-17, hallada al revisar el buzón antes de arrancar el restore)**: DSS Multiservices *ya no es solo una intención* — `dsalazar@dssmultiservices.com` tiene 178 mensajes reales desde el 9 de julio de 2026 que son el primer material genuino para este segundo cerebro, no la migración de QC:
- **Primer cliente confirmado**: Blackburn Athletics ("Contrat Entretien ménager") — y coincide con un cliente que QC Maintenance ya tenía, sugiere que siguió a David a la nueva empresa.
- **Registro en curso ante el Comité Paritario (CPEEP)** — con una solicitud de documentos pendiente de responder (candidato directo a tarea con fecha, sección 2.6 del spec).
- **Cuenta bancaria empresarial abierta en Desjardins** y **registro de número de impuestos** (IncorpDirect) — la entidad legal nueva ya está tomando forma real.
- David ya está **notificando proactivamente** a algunos contactos viejos (confirmado con Sylvain Thibodeau de GDI) sus nuevas coordenadas — a diferencia de lo que se vio en los 9 buzones históricos de QC (sección 5 de `QC-Maintenance-Historia-y-Lecciones.md`), donde no había rastro de ningún aviso de transición.
- Un contacto externo (`sychag@gmail.com`) reenviando documentación fiscal de la entidad vieja (TPS/TVQ, carta de transferencia ARC #10114) — probablemente contador/gestor de la transición, vale la pena confirmar su rol.
- Dominio a verificar: `mblmultiservices.com` — nombre parecido a "dssmultiservices", confirmar si es entidad relacionada.

**Implicación práctica**: no hay que esperar a "cuando haya negocio real" para arrancar 1.3 — ya lo hay. El primer contenido del segundo cerebro debería ser este puñado de hilos reales de DSS, no (solo) el histórico de QC Maintenance.

---

## Fase 2 — Cuando haya negocio real corriendo en DSS (no antes)

Deliberadamente pospuesto — construir esto ahora sería adivinar sobre un negocio que todavía no tiene forma. Retomar cuando DSS tenga clientes/empleados/contratos propios:

- **Sistema de facturación real desde el día 1** (no repetir Invoice2Go + reconciliación manual por correo — Documento A, sección 4.3, fue la fuente más repetida de disputas de facturación en QC Maintenance).
- **Tracking de vencimientos de cumplimiento** (permisos de trabajo, seguros/COI, reportes regulatorios) — recién tiene sentido cuando haya empleados/contratos reales que trackear.
- **Automatización de negociación/cobranza con supervisión** — expandir el borrador automático (1.1) a estas áreas solo después de que el patrón simple esté validado y David confíe en el sistema.
- **Diversificación de cartera monitoreada activamente** — para no repetir la concentración de riesgo en un solo cliente ancla que le costó caro a QC Maintenance con GDI.

---

## Cómo saber si está funcionando

Contra la métrica única del spec ("cuánta carga cognitiva quita, no cuánta información produce"), señales concretas a observar después de 2-4 semanas de Fase 1:

- ¿David revisa/aprueba drafts en menos tiempo del que le tomaba escribir esos correos desde cero?
- ¿Bajó la cantidad de "recordatorios" que David mismo tiene que redactar manualmente porque el sistema ya se lo avisó antes?
- ¿Hay quejas de que un borrador sonó "genérico" o "no como David"? — señal para revisar el Documento B, no para abandonar el enfoque.
- ¿El asistente puede responder correctamente "qué le cotizamos/prometimos a este cliente la última vez" sin que David tenga que buscarlo o recordarlo? — señal de que el segundo cerebro (1.3) ya está aportando, no solo acumulando datos sin usar.

Si estas señales son positivas, recién ahí vale la pena invertir en la Fase 2.
