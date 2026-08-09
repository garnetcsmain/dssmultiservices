# Rutas de automatización — función comité CPEEP en DSS

*Parte del paquete de onboarding comité CPEEP — DSS Multiservices. Generado 2026-08-03. Basado en: candidatos de automatización detectados por 13 agentes sobre el corpus real (¿qué se repite mes a mes?, ¿dónde falló QCM?), la evaluación tarea-por-tarea del especialista de ciclo mensual, y la infraestructura que DSS ya tiene (Google Workspace con service account full-scope ya autorizada, KAKU, Freddy como IT).*

---

## 0. El diagnóstico que ordena todo

En QCM, **ningún fallo del comité fue de capacidad — todos fueron de calendario y evidencia**: rapports ~12 días tarde crónicamente, réclamations respondidas al borde del plazo, pruebas producidas un mes después, cheques postdatados sin entregar. El único recordatorio existente (Smartsheet de GDI, día 12) llegaba tarde por diseño y aun así era lo único que disparaba acción.

Consecuencia: **la automatización de mayor retorno no es la más sofisticada — es el calendario con alertas bloqueantes y las reglas de buzón.** Cuesta horas de implementar y elimina la causa raíz de $113.000+ en réclamations/transaction. El resto (pipeline de datos, XML, IA) reduce horas de trabajo, no riesgo legal.

**Techo teórico**: del ciclo de 6-10 h/mes, el especialista estima reducible a **2-3 h/mes**. Lo NO automatizable por diseño: mover dinero, decidir/negociar en réclamations e inspecciones, y el clic final de envío (principio del spec del asistente DSS: *"el agente redacta, el humano envía"*).

---

## Ruta 1 — Disciplina automatizada, sin código o casi (ESTA SEMANA; esfuerzo: ~1 día de Freddy)

| # | Qué | Cómo | Elimina |
|---|---|---|---|
| 1.1 | **Calendario de conformité con alertas** los días 5, 10 y 13 (antes del 15, no después), + 30-abr, 30-nov, 10-déc, + vencimientos de attestations | Google Calendar compartido `Conformité DSS` con invitados David + responsable; eventos recurrentes con recordatorio por correo | El patrón #1 de QCM: actuar solo tras el rappel externo |
| 1.2 | **Buzón de rol** `conformite@dssmultiservices.com` como cuenta del Portail CPEEP y destinataria de los 2FA | Crear el usuario/alias en Workspace; registrarlo en el Portail | El punto único de falla de QCM (2FA solo a mcastro@) |
| 1.3 | **Regla de reenvío automático** del accusé de réception del CPEEP al donneur d'ouvrage (<24 h, obligación del avenant GDI) | Filtro Gmail: from:donotreply@cpeep.qc.ca / acuses → forward | Un incumplimiento contractual recurrente y gratuito de evitar |
| 1.4 | **Plantillas** del correo mensual de pedido de horas (solo cambian las fechas) y de las respuestas rutinarias | Borradores/plantillas de Gmail | Redacción manual repetida; errores de destinatario |
| 1.5 | **Libreta de contactos verificada** CPEEP/GDI (importar la tabla del doc 01) | Google Contacts compartidos | El typo `cpeep.ac.ca` que rebotó 3 días una respuesta con plazo |
| 1.6 | **Carpeta probatoria estándar por mes** en el Shared Drive (`Conformité/2026-08/` con subcarpetas rapport/remises/acuses/titanfile) + regla: TitanFile se descarga el día que llega | Estructura de carpetas + hábito en el checklist | Meses sin cerrar por evidencias perdidas; TitanFiles expirados |
| 1.7 | **Paiement préautorisé del CPEEP** (enviar spécimen de chèque una vez) | Formulario del comité (vía ntavares@cpeep.qc.ca) | Cheques físicos, seguimiento de encaissement, pedidos de recto/verso |

**Recomendación: hacer TODA la Ruta 1 antes del primer rapport de DSS (inicio de septiembre 2026).** Es la única ruta con deadline real.

---

## Ruta 2 — Pipeline de datos del rapport (tras 2 ciclos manuales; esfuerzo: ~1-2 semanas de Freddy, incremental)

*Regla de secuencia: primero 2 ciclos a mano (el responsable tiene que entender qué automatiza), después esto.*

| # | Qué | Cómo | Automatizable |
|---|---|---|---|
| 2.1 | **Export mensual de nómina → validación** : NAS presente y con checksum válido (Luhn), date de naissance de nuevos, horas del rapport = feuilles de temps | Script sobre el export de Desjardins (CSV); Desjardins ya sabe que la empresa es "Particularité: Comité paritaire" | Total |
| 2.2 | **Generador del rapport + ledger de banque d'heures** : por empleado — heures régulières vs fériés (tope mensual), excedente banqueado, saldos, vacances, 6% départ, REER $0,20/h, prélèvement 1% | Script (aritmética determinista); produce el detalle por empleado que hoy se teclea a mano y el resumen para el donneur d'ouvrage | Total |
| 2.3 | **Salida en formato "voie électronique (auto, XML)"** que el CPEEP acepta oficialmente | Confirmar el esquema XML con el CPEEP (preguntar a ntavares@/soporte plataforma — existe, QCM nunca lo usó) | Total (el submit final queda humano) |
| 2.4 | **Auto-llenado del Smartsheet del donneur d'ouvrage** + ensamblado del paquete con la nomenclatura estándar (`1. …xlsx / 2. …COMITE….pdf / 3. …BANQUE….pdf`) | El form de GDI es una URL pública fija; script o Composio | Total |
| 2.5 | **Pre-conciliación interna** : diff entre las horas del donneur d'ouvrage y la nómina propia ANTES de someter (lo que GDI hace después, hacerlo antes) | Mismo script de 2.2 comparando dos fuentes | Total |
| 2.6 | **Tracker de réclamations/plazos como "objeto de resultado"** (schema del spec del asistente: id, tipo, deadline, estado, escalación) | Tabla en KAKU; cada carta del CPEEP crea un objeto con dueño y fecha | Total (la decisión no) |
| 2.7 | **Monitoreo de infolettres CPEEP / Gazette officielle** con alerta y resumen del cambio (los taux entran en vigor el día del aviso) | Watcher de correo + página del CPEEP (Firecrawl monitor ya disponible en el stack de Freddy) | Total |

**Impacto de Ruta 1+2: el ciclo baja de 6-10 h/mes a ~2-3 h/mes** (capturar/validar excepciones, aprobar, enviar) y el riesgo de deadline cae a ~cero. Con esto, el forfait fraccional del doc 04 sobra para la función.

---

## Ruta 3 — Capa de asistente IA (cuando la Fase 1 del plan del asistente DSS esté viva; esfuerzo: continuo)

Alineada con `soportes/DSS-Plan-Implementacion-Asistente.md` — la función comité se convierte en el **primer caso real de la Fase 2** ("tracking de vencimientos de cumplimiento") que ese plan pospuso hasta que hubiera negocio real. Ya lo hay.

1. **Borradores automáticos de correspondencia CPEEP/GDI en la voz de David** (respuestas a états de compte, confirmaciones, acuses) — Gmail API + `David-Persona-Comunicacion.md` como contexto de estilo; SIEMPRE draft, nunca envío directo.
2. **Vigilancia de silencio sobre el comité**: cada correo al CPEEP que espera respuesta registra fecha de escalación; sin respuesta → "petit rappel amical" en borrador.
3. **KAKU como memoria del expediente**: cada correo del comité indexado; el responsable pregunta "¿cómo respondimos la última vez que el CPEEP pidió X?" y obtiene el hilo real de QCM/DSS.
4. **Portail semi-automático**: browser automation con lectura del 2FA del buzón de rol y submit humano-en-el-circuito. *Último de la lista a propósito: frágil ante cambios de la plataforma y el ahorro marginal es chico una vez que 2.3 (XML) exista.*

---

## Qué NO automatizar nunca (límites deliberados)

- **Pagos y movimientos de dinero** — preparar la orden sí; ejecutarla, jamás sin humano.
- **Réclamations, renonciations, inspecciones, negociación** — borradores como mucho; decisión y firma humanas (David + abogado si escala).
- **El clic de envío del rapport** — el sistema deja todo listo; el responsable revisa y somete. Un rapport erróneo transmitido es peor que uno tardío: el CPEEP advirtió a QCM de "poursuites pénales" por rapports no conformes al registre de paie.

---

## Resumen ejecutivo de la recomendación

1. **Ruta 1 completa esta semana** (deadline real: primer rapport DSS ~inicio sept-2026).
2. **Ruta 2 a partir de octubre** (tras 2 ciclos manuales), empezando por 2.1-2.2 (validación + generador) que es donde viven las horas.
3. **Ruta 3 cuando el asistente DSS Fase 1 esté operativo** — el comité es su mejor primer caso de cumplimiento.
