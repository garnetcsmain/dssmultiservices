# Fuente maestra — Gestión del Comité paritaire (CPEEP) para DSS Multiservices

**Instrucciones para el asistente (NotebookLM):** Este archivo es la fuente única de verdad sobre la gestión del CPEEP (Comité paritaire de l'entretien d'édifices publics, región de Montreal) para DSS Multiservices (9535-8214 Québec inc., dossier #39454). Contiene 8 documentos separados por encabezados `# DOCUMENTO N`. Al responder: conserva los términos franceses tal cual («rapport mensuel», «prélèvement», «banque d'heures», «réclamation») dentro de respuestas en español; cuando el usuario pida redactar algo dirigido al CPEEP o a un cliente (donneur d'ouvrage), redáctalo en francés profesional completo. Las cifras históricas ($680.577 en 2021, Transaction de $100.000 en 2025, règlements penales $1.824-$4.654) provienen del corpus real de correos de QC Maintenance 2018-2026 y son para contexto de riesgo: QC Maintenance y DSS Multiservices son entidades legales distintas y sus expedientes no deben mezclarse jamás.

**Índice de documentos:**

1. README — resumen ejecutivo del paquete (las 5 respuestas clave)
2. Manual de onboarding — qué es el CPEEP, estado del dossier DSS, ciclo mensual, décret, contactos, riesgos (corregido 2026-08-04 contra el décret vigente)
3. Rutas de automatización — qué automatizar y qué jamás
4. Plan de formación — hitos de aprendizaje y glosario de ~24 términos
5. Salario y rol de David — benchmarks Quebec y modelo de escalamiento
6. Anexo histórico 2019-2024 — el expediente #5439 de QC Maintenance completo
7. Guía de fuentes oficiales — cosecha completa de cpeep.qc.ca (2026-08-04): Portail paso a paso, formularios, jurisprudencia del statut de travailleur, REER operativo
8. Plan operativo de delegación (inglés) — calendario mensual, checklist QA, matriz de excepciones
9. Descripción del puesto (inglés) — Payroll and Compliance Coordinator

---


# DOCUMENTO 1 — README

# Onboarding — Gestión del Comité paritaire (CPEEP) · DSS Multiservices

*Generado 2026-08-03 por análisis multi-agente del backup completo de QC Maintenance (9 buzones, 2018-2026: 1.732 correos comité leídos en profundidad), el archivo KAKU (qcm-archivo + correo vivo + vault) y fuentes oficiales del CPEEP (décret D-2 r. 15 vigente, Guide de l'employeur 2026). Verificado con un pase adversarial contra la historia completa 2019-2024.*

## TL;DR — las 5 respuestas que pediste

1. **¿Qué es "el comité" y qué implica manejarlo?** El CPEEP fiscaliza el décret del sector de limpieza en Montreal: rapport mensuel el 15 de cada mes, prélèvement 1% + REER, taux mínimos por clase, y poder real de inspección/réclamation — a QCM le costó **$680K reclamados en 2021 (cerrado por $116K, pagado en su mayoría por GDI), 4 causas penales 2021-22, y $113K+ en 2025**. DSS ya tiene dossier abierto (#39454) con 3 documentos pendientes de responder desde el 16-jul. → [01-Manual](01-Manual-Onboarding-Comite-CPEEP.md) + [05-Anexo histórico](05-Anexo-Historia-2019-2024.md)
2. **¿Qué se puede automatizar?** Casi todo lo mecánico (el ciclo baja de 6-10 h/mes a 2-3 h/mes), pero el retorno más alto es el calendario con alertas + reglas de buzón — los fallos de QCM fueron todos de calendario, no de capacidad. Ruta 1 (1 día de trabajo) antes del primer rapport de septiembre. → [02-Rutas-de-Automatizacion.md](02-Rutas-de-Automatizacion.md)
3. **¿Cuánto tarda una persona desde cero?** Con francés escrito como prerequisito: **80% de capacidad a los 2-3 meses (~45-60 h de inversión)**; 95% a los 5-6 meses; el calendario anual completo recién al año. → [03-Plan-de-Formacion.md](03-Plan-de-Formacion.md)
4. **¿Cuánto pagar en Quebec?** La función sola es <15 h/mes → **recomendado: fraccional con forfait $500-700/mes (~$7.200/año)** hoy; **$50.000-57.000/año** por un(a) adjoint(e) administratif(ve) bilingüe de tiempo completo cuando DSS tenga ~15-20 empleados y el comité sea parte de un rol admin más amplio. → [04-Salario-y-Rol-de-David.md](04-Salario-y-Rol-de-David.md)
5. **¿Cuánto y cuándo se necesita a David?** En régimen estable, **~1-2 h/mes (3-5% del trabajo, irreducible)**: firma, escalamientos y relación senior con los donneurs d'ouvrage. Arranque (ago-oct 2026): 3-5 h/mes. La evidencia de QCM muestra que David nunca fue el operador del comité — pero en DSS hereda también el rol de firma que en QCM tenía Mauricio. → [04-Salario-y-Rol-de-David.md](04-Salario-y-Rol-de-David.md)

## Urgente esta semana (independiente de todo lo demás)

- **Responder a la inspectrice Marie-Joëlle Hurtubise (dossier #39454)** — la Demande de documents del 16-jul lleva 2+ semanas sin respuesta. Es exactamente el patrón que hundió a QCM.
- Cerrar nómina Desjardins con "Particularité: Comité paritaire".
- Confirmar que los últimos cheques de la Transaction de QCM ($10.625 el 17-jul y 17-ago) pasaron, y pedir después quittance final + désistement (expediente judicial hoy solo suspendido).
- Descargar los TitanFile del canal 5439 antes de que expiren (mensajes del 08-jul-2026 sin leer en el backup).

## Contenido

| Documento | Qué contiene |
|---|---|
| [01-Manual-Onboarding-Comite-CPEEP.md](01-Manual-Onboarding-Comite-CPEEP.md) | El manual del puesto: qué es el CPEEP, estado actual de DSS, ciclo mensual paso a paso, calendario anual, taux/multas oficiales, contactos, riesgos heredados de QCM |
| [02-Rutas-de-Automatizacion.md](02-Rutas-de-Automatizacion.md) | 3 rutas de automatización priorizadas con esfuerzo estimado y qué NO automatizar |
| [03-Plan-de-Formacion.md](03-Plan-de-Formacion.md) | Plan de formación semana a semana para una persona sin conocimiento previo + glosario |
| [04-Salario-y-Rol-de-David.md](04-Salario-y-Rol-de-David.md) | Benchmarks salariales Montreal 2026 con recomendación, y el modelo de involucramiento de David con regla de escalamiento |
| [05-Anexo-Historia-2019-2024.md](05-Anexo-Historia-2019-2024.md) | La historia completa del expediente #5439: el $680K de 2021, las 4 causas penales, la subdeclaración 2023-24, cabos sueltos pre-2025 y las lecciones que solo la historia enseña |
| [06-Guia-Oficial-CPEEP.md](06-Guia-Oficial-CPEEP.md) | La guía de fuentes oficiales (cosecha completa de cpeep.qc.ca, 2026-08-04): el Portail paso a paso según el guide oficial, tabla de todos los formularios con URL, doctrina del statut de travailleur (Modern Concept 2019 CSC 28), REER operativo, y las 8 correcciones verificadas contra el décret vigente |
| `fuentes-oficiales/` | 52 páginas y PDFs oficiales de cpeep.qc.ca convertidos a markdown (décret vigente, Loi, 12 páginas de jurisprudencia, guías, formularios, infolettres) + 4 PDF clave en `pdf/` (guide du portail, rapport 2026 recto/verso, procuration) |
| `plataforma/` | **Escuela CPEEP** — app local de aprendizaje (`index.html`: Simulador de un mes, 46 Fichas con repetición espaciada, Referencia, Ruta) + `Fuente-Maestra-NotebookLM-CPEEP.md` para subir a NotebookLM |
| Gestión_del_CPEEP_para_DSS.mp4 | Video-resumen del paquete generado con NotebookLM (2026-08-04) |
| `soportes/` | Los 4 documentos de análisis previos (historia QCM, persona de David, spec y plan del asistente ejecutivo) + los 2 documentos operativos generados vía KAKU el 2026-08-03: "DSS - CPEEP Onboarding and Delegation Plan" (calendario operativo, matriz de excepciones, checklist QA, cálculo de David) y "DSS - Payroll and Compliance Coordinator Job Description" (descripción del puesto combinado 80% FTE) — verificados contra este paquete, consistentes |


# DOCUMENTO 2 — 01-Manual-Onboarding-Comite-CPEEP

# Manual de onboarding — Gestión del Comité paritaire (CPEEP) para DSS Multiservices

*Generado 2026-08-03 a partir de: (a) el backup completo de 9 buzones de QC Maintenance (2018-2026), (b) el archivo KAKU (`qcm-archivo`: 53.386 correos 2025-2026; `correo`: buzones vivos info@/qc.conformite@/pay@ y dsalazar@dssmultiservices.com; `vault`: notas internas), minado con 13 agentes de lectura en paralelo + 5 especialistas. Todas las citas y montos tienen respaldo documental en el corpus.*

**Audiencia**: la persona que va a asumir la gestión del comité en DSS Multiservices (y Freddy/David como supervisores). Asume CERO conocimiento previo del sector.

---

## 1. Qué es "el comité" y por qué no es opcional

El **Comité paritaire de l'entretien d'édifices publics — région de Montréal (CPEEP**, cpeep.qc.ca) es el organismo que administra el **Décret sur le personnel d'entretien d'édifices publics** — la ley que fija salarios mínimos sectoriales, vacaciones, feriados, primas y aportes REER para TODO el personal de limpieza de edificios públicos/comerciales en la región de Montreal. No es una asociación voluntaria: si la empresa hace entretien ménager en esa región, está **assujettie** (sujeta) al décret automáticamente.

El CPEEP tiene poderes reales de inspección y cobro. Verifica por TRES vías:
- El **registre de paie** y las **feuilles de temps par jour** ("nos vérifications sont effectuées à partir de votre registre de paie ainsi que les feuilles de temps par jour" — Steve Girard, CPEEP, 2025-09-04).
- Las **facturas del donneur d'ouvrage, obtenidas "par requête"** — cruza horas declaradas contra horas facturadas al cliente. Así construyó la réclamation de $680K de 2021 (solo con documentos de GDI, porque QCM no entregó los suyos) y así detectó los écarts 2023-24 (ej. ene-2024: 4.223 h declaradas vs 10.707 h facturadas solo a GDI). **Subdeclarar es detectable aunque tu propia nómina cuadre.**
- **Réclamations** (reclamos de dinero con expediente, monto y plazo). Sin respuesta a tiempo → **poursuite con 20% de frais automáticos**; y puede escalar a **poursuites pénales** (QCM acumuló 4 dossiers pénaux por meses sin rapport entre 2019-2022, más la advertencia de 2025-09-04).

Historia real de QCM como advertencia (el detalle completo en [05-Anexo-Historia-2019-2024.md](05-Anexo-Historia-2019-2024.md)):
- **2021 — el evento fundacional**: réclamation **AC029231 por $680.577,92** (mandatos CHSLD/COVID vía GDI), construida solo con documentos de GDI porque QCM ignoró la demande d'information. Cerrada por $116.753,64 — **GDI pagó $96.490,61 con fondos retenidos de QCM**. En paralelo, causa penal 500-61-515584-200 (7 chefs d'infraction; culpabilidad negociada en 3).
- **2025**: inspección (Jason Cavallaro) → réclamations **AC069874** (jours fériés, **$12.670,07** — pagada oct-2025, cerrada) y **AC069879** (vacances/6% de départ 2024), que al no firmarse la "renonciation au bénéfice du temps écoulé" pasó a poursuite civil (Cour supérieure 500-17-135260-258) y se transó por **$100.000** en cuotas (dic-2025 – ago-2026). Detonante probatorio: salarios pagados **en efectivo** (entrega Garda de $175.000), prohibido por el art. 10.01 — el CPEEP rechazó todas las pruebas de pago.
- El comité conoce al grupo Castro/Salazar desde 2019 y tiene calificada por escrito su "non collaboration". **DSS hereda esa memoria institucional: la única estrategia viable es ser aburridamente puntual.**

**Regla de oro heredada de 8 años de correos de QCM: lo que nadie vigila, se pierde — y aquí perderlo cuesta dinero real con intereses del 20%.**

---

## 2. Estado actual de DSS ante el CPEEP (al 31-jul-2026) — LEER PRIMERO

DSS Multiservices (**9535-8214 Québec Inc.**, NEQ 1180659501) ya inició su inscripción. Estado exacto:

| Ítem | Estado |
|---|---|
| Dossier CPEEP | **#39454, abierto** (16-jul-2026) |
| Formulario "Demande d'ouverture" | Enviado 15-jul-2026; fecha de inicio corregida a **01-jul-2026** |
| Inspectrice asignada | **Marie-Joëlle Hurtubise** (inspecteur@cpeep.qc.ca) |
| "Demande de documents" del 16-jul | **SIN RESPONDER** (3 documentos pendientes, ver abajo) |
| Numéro d'employeur | **NO emitido** — Steve Girard (CPEEP) confirmó por teléfono que se emite **tras el primer rapport de paie**, con autorización verbal para operar mientras tanto |
| Primer contrato | Ménagez-Vous (firmado 30-jul, inicio 1-aug-2026) |
| Nómina | Desjardins Solutions Employeur **en configuración** — falta marcar la casilla "Particularité: Comité paritaire" |
| GDI onboarding | Checklist del 31-jul exige "copie de l'état de votre dossier au comité Paritaire" tras la primera facturación |

### Los 3 documentos que el CPEEP pidió el 16-jul y siguen pendientes:
1. Copia completa de **cada factura emitida** desde el inicio de operaciones (01-jul-2026).
2. Copia del **registre de paie** (o, si no existe aún, copia de cada pago Interac/chèque a cada persona que hizo entretien ménager).
3. **Coordenadas completas de cada empleado** de entretien ménager (dirección, teléfono, courriel).

### Acciones inmediatas (primera quincena de agosto 2026):
1. **Responder a la inspectrice Hurtubise** (dossier #39454) — si aún no hay facturas/nómina porque las operaciones arrancaron el 1-aug, decirlo explícitamente y comprometer fecha. Dos semanas de silencio ya es exactamente el patrón que hundió a QCM. *(Dueño: David hoy; transferible al rol nuevo apenas exista.)*
2. **Cerrar la nómina Desjardins** con la casilla "Particularité: Comité paritaire" marcada (contacto: Krista Ekonomakis, 514 281-7000 #4171304) — sin esto no habrá registre de paie conforme ni rapport de paie.
3. **Producir el primer rapport de paie** al cierre del primer período de agosto (→ inicio de septiembre). Es la condición para el numéro d'employeur.
4. Tras la primera factura a Ménagez-Vous: enviar la **demande d'adhésion / estado del dossier** a info@cpeep.qc.ca y copia a GDI SQC Conformité.
5. Checklist GDI restante: permis d'agence de placement CNESST (o prueba de solicitud antes del ~30-aug), avenant de seguro con GDI como assuré additionnel, Attestation Revenu Québec "en date du jour".
6. Trámites CPEEP complementarios (del Guide de l'employeur oficial): completar la **"Fiche des contacts et de procuration"** (formulario en cpeep.qc.ca → Employeur) designando contactos — usar aquí el buzón de rol, no el personal de David; **solicitar el nom d'utilisateur del Portail** (el comité emite SOLO el usuario; la contraseña la crea uno mismo en la primera conexión con "Mot de passe oublié?" en portail.cpeep.qc.ca — mayúsculas/minúsculas cuentan, usar solo Chrome o Firefox nunca Edge, y registrar como correo de empresa un buzón de rol: ahí llega el código 2FA de 6 dígitos); e inscribirse a los **prélèvements préautorisés** enviando un spécimen de chèque a info@cpeep.qc.ca con nombre y numéro d'employeur. Teléfono CPEEP: 514 384-6640 / 1 800 461-6640 (4351, rue D'Iberville, Montréal H2H 2L7).

---

## 3. El ciclo mensual — el corazón del puesto

Reconstruido del flujo real 2025-2026 de QCM (que operaba como subcontratista de GDI; DSS empezará igual con Ménagez-Vous/GDI). Dos entregables por mes: el **rapport mensuel al CPEEP** (obligación legal) y la **conciliation con el donneur d'ouvrage** (obligación contractual del avenant GDI).

### Calendario del mes tipo

| Día | Acción | Canal |
|---|---|---|
| 1-3 | Pedir al donneur d'ouvrage las **heures détaillées** del período anterior (períodos de 4-5 semanas, calendario 4-4-5) | Email plantilla a supportagence@gdi.com (o equivalente del cliente) |
| 3-8 | Verificar el registre recibido: depurar proyectos donde no se trabajó, detectar empleados faltantes/doblados | Excel |
| 5-10 | Armar el rapport: horas por empleado, masse salariale, REER, prélèvement; conciliar la **banque d'heures** (tope de heures régulières: regla base 160 h/mes = 40 h/sem — en la práctica 2026 varió ~158-192 h según el calendario 4-4-5 del mes; el excedente se "banquea" con **documento firmado por el empleado** y se liquida después. OJO — art. 3.01 vigente: la firma del empleado NO basta; el étalement exige además base máxima de 4 semanas con promedio 40 h, ninguna semana >50 h, beneficio compensatorio y un **avis écrit transmitido al Comité paritaire ≥15 días ANTES** de aplicarlo (formulario 8063-etalementhrs 2026). Y el registre y el rapport declaran las horas REALES de cada semana — solo el PAGO se promedia; declarar horas alisadas es infracción detectable por el cruce con facturas del donneur d'ouvrage) | Datos de nómina (Desjardins) |
| ~12 | Llega el ÚNICO recordatorio externo (Smartsheet de GDI, automatizado) — si dependés de él, ya vas tarde | automation@app.smartsheet.com |
| **15** | **DEADLINE LEGAL: transmitir el rapport mensuel por el Portail CPEEP** (cubre el mes anterior). Contenido por salarié: NAS, coordenadas, qualification/nature du travail, heures régulières vs supplémentaires por semana, salaires, vacances, 6% de départ (con fecha y motivo), REER. La date de naissance ya NO es campo mensual (D. 540-2026): se captura al alta del empleado y se transmite UNA sola vez con el primer rapport donde aparece (art. 6.106). Existe también la vía oficial "voie électronique (auto, XML)" — clave para automatizar | Portail CPEEP (login con 2FA por email) |
| 15 (+24h) | Reenviar el **accusé de réception** del CPEEP al donneur d'ouvrage (obligación del avenant GDI desde jun-2025) | Email |
| 15 | Completar el formulario **Smartsheet de conformité del donneur d'ouvrage** con preuve d'envoi + remise | Smartsheet (GDI: form 5345a140a36f451daa3436a26d11b063) |
| 15-20 | Pagar las **remises** al CPEEP: prélèvement (~1% de la masse salariale **incluida la contribución REER del empleador**, mitad empleado/mitad empleador) + REER ($0,20/h desde mar-2026) | Cheque o **paiement préautorisé** (recomendado — QCM nunca lo activó y pagó el precio en seguimiento de cheques) |
| 20-30 | Responder la conciliation del donneur d'ouvrage (écarts marcados en amarillo), enviar rapport corrigé si aplica, y enviar **copia recto/verso del cheque encaissé** | Email |

### Nomenclatura estándar del paquete de conciliation (heredar tal cual — GDI ya la conoce):
- `1. AAAAMMDD-AAAAMMDD <Empresa>.xlsx` — el archivo de horas del donneur d'ouvrage
- `2. <EMPRESA> COMITE <período>.pdf` — el rapport transmitido por el portail
- `3. <EMPRESA> BANQUE <período>.pdf` — el relevé de la banque d'heures
- + en el cuerpo: detalle por empleado "X h travaillées / Y h prélevées / total / solde"

**Esfuerzo real del ciclo mensual** (medido sobre el flujo de QCM): **6–10 h/mes** en modo manual — 1-2 h extraer/cuadrar nómina, 2-4 h capturar en el portail y validar, ~1 h remises y preuves, 0,5-1 h Smartsheet y acuses, 1-2 h conciliations/correspondencia. Con nómina digital limpia y la vía XML, el núcleo baja a **2–3 h/mes** (ver documento 02).

**Quién lo operó en QCM, por época** (la función siempre fue delegable — pero nunca estuvo bien sistematizada): 2019–abr-2023 un contador externo (H. Benmahane/FCH — sus rapports fueron anulados en bloque en 2023); 2024 Johan Salazar en Excel, con **David como cara visible de la crisis de conciliación con GDI de jul-oct-2024**; 2025-26 una persona dedicada detrás de pay@ (Leidy Loaiza) con el consultor J. Flores para lo contencioso. En régimen normal David no tocaba el ciclo — se activaba solo cuando la relación con el donneur d'ouvrage entraba en crisis (ver documento 04).

**Regla dura permanente (art. 10.01 del Décret): el salario se versa "sous enveloppe scellée, par chèque ou par virement bancaire", a intervalos regulares de máximo 2 semanas.** El texto no prohíbe literalmente el efectivo (sobre sellado), pero el CPEEP rechazó TODOS los pagos cash de QCM por falta de trazabilidad en la réclamation que terminó en $100.000 — **política DSS innegociable: solo cheque o virement, nunca efectivo** (sin atribuirle esa prohibición al texto del 10.01). Cada indemnité (férié, vacances, 6% départ) debe quedar consignada explícitamente en el registre de paie — es la única prueba que el comité acepta.

### Obligaciones anuales/estacionales (se olvidan y cuestan caro):
| Fecha | Obligación |
|---|---|
| **30-abr** | Cierre de la **année de référence** (1-mayo→30-abr) y cálculo de la banque de vacances de cada salarié. El PAGO no es un evento único: se debe antes de la salida en vacaciones de cada empleado o con sus paies regulares, a su elección (art. 8.05) |
| **31-oct** | Cierre del cálculo de la **banque de maladie**: establecer el total de crédits d'heures de cada salarié (art. 12.02) — el derecho al excédent se ADQUIERE ese día |
| **30-nov** | Aviso escrito del excédent de maladie a cada empleado **CON copia al Comité paritaire** (total al crédit, máximo acumulable, monto pagable) |
| **10-déc** | Pagar las heures excédentaires al taux normal. Fórmula: banque al 31-oct MENOS 60% de las horas de las últimas 4 semanas trabajadas (ese pago es un gain que entra en la base de vacances) |
| Continuo | Registrar cada empleado nuevo en el Portail CPEEP con **NAS válido** (validar checksum antes de capturar — QCM tuvo 12 empleados bloqueados por NAS inválidos) + **Formulaire date de naissance** por contratación (regla vigente desde dic-2025) |
| Al recibir infolettre | Aplicar cambios del décret a la nómina (los taux entran en vigor EL MISMO DÍA del aviso) |

### Parámetros del décret vigentes (nuevo décret D-2, r. 15 en vigor desde 2026-03-04 hasta 2030-11-01; fuentes oficiales cpeep.qc.ca al pie):
- Taux horaires desde 2026-03-04: **Classes A y B: $23,25/h · Classe C (travaux en hauteur): $23,90/h** (ojo: una carta de GDI decía $23,45 — el que manda es el comité). Aumentos programados cada 1-nov: 2026 → A/B $23,83, C $24,49; 2027 → $24,43/$25,10; 2028 → $25,10/$25,80; 2029 → $25,79/$26,50; 2030 → $26,63/$27,37.
- **Chef d'équipe**: prima mínima del 2% del taux (supervisa/forma ≥4 salariés).
- **Prime de nuit** (mayoría del turno entre medianoche y 8h): $0,25/h ahora → **$0,50 desde 2026-11-01** → $0,75 (2027) → $1,00 (2028). *Impacto directo en nómina de contratos nocturnos (IKEA, retail).*
- **Prélèvement: 1% de la masse salariale** — exactamente 0,50% a cargo del empleador + 0,50% retenido al empleado en cada paie; se remite con el rapport, a más tardar el 15.
- **REER employeur: $0,20/h payée** desde 2026-03-04 (antes $0,45/h); sin aumento hasta 2030. Aplica al **salarié permanent (280 h trabajadas)**; al cruzar el umbral: formulaire d'adhésion firmado y transmitido antes del 15 del mes siguiente + retro de $56 (280 × $0,20). El REER se remite como pago separado del prélèvement, **pero la contribución REER del empleador cuenta como gain del salarié: entra en la base de cálculo del prélèvement (1%) y de la paie de vacances** (Guide de l'employeur: « La contribution de l'employeur au REER est considérée comme un gain pour le salarié. Elle doit donc être incluse dans le calcul du prélèvement ainsi que dans le calcul de la paie de vacances annuelle »).
- **Vacances: 6% a 12%** (3 a 6 semanas según antigüedad). La paie de vacances se debe **en un solo versement ANTES de la salida en vacaciones** de cada salarié, o con sus paies regulares a elección del salarié (art. 8.05, mod. D. 200-2026); prohibido diluirla "incluida en el salario" sin identificarla en registre y bulletin — el comité puede ignorar esos pagos y reclamar la indemnité completa.
- **Fériés: 10** congés para el salarié permanent con menos de 1 año de service continu, **12** con 1 año o más (art. 7.01); **8** para non-permanents, con indemnité de 1/20 del salario de las 4 semanas completas previas sin heures supplémentaires (art. 7.07.1). Nota práctica: todo el personal nuevo de DSS será non-permanent sus primeras ~280 h → 8 fériés. **Banque de maladie: 2,44%** de las horas pagadas (se acumula solo sobre las horas posteriores a las primeras 280 h).
- **Registre de paie**: conforme al Règlement sur le système d'enregistrement (annexe 3 del décret) — por empleado y por día, con **hora precisa de inicio y fin**; conservar **3 años**.
- **El rapport mensuel se presenta AUNQUE NO haya habido trabajo ese mes** ("même dans les cas où aucun travail n'a été effectué") — relevante para los primeros meses de DSS.
- Congés mobiles: projet de règlement con entrada prevista 2027-01-01 — vigilar.

### Multas y palancas legales del comité (Loi D-2 — para calibrar el riesgo):
- **20% de frais automáticos** sobre toda diferencia salarial reclamada (más frais judiciaires si escala).
- Registro no conforme / negar acceso a inspectores: $200-500 (reincidencia $500-3.000). Rapport falso o clasificación falsa para pagar menos: igual (art. 34). No presentar rapport / no pagar prélèvement: estatutariamente $50-200 por infracción, pero **el costo real observado en los constats contra QCM fue mayor: $200-300 por chef + frais de justice $74-154 + contribution légale del 25% de la amende; los règlements negociados por dossier salieron entre $1.824 y $4.654**. Y el efecto "una infracción por mes" es real en la práctica — cada rapport mensuel no transmitido es un incumplimiento SEPARADO del Règlement sur le rapport mensuel, y así acumuló QCM sus constats — pero NO es cláusula textual del art. 38 (que solo fija la multa residual $50-200, recidiva $200-500); no citar ese artículo por ese efecto ante un abogado. Obstruir un enquêteur: hasta $10.000 (persona moral).
- **Responsabilidad personal de los administradores** (art. 22 a.1): si la empresa no paga, el comité puede ir contra los administradores — es decir, contra David personalmente en DSS.
- **Responsabilidad solidaria del contratista principal** (art. 14): el donneur d'ouvrage responde por los salarios impagados de su subcontratista — POR ESO GDI/Ménagez-Vous fiscalizan la conformité de DSS con tanta agresividad; no es burocracia, es su propia exposición legal.
- Inspectores pueden entrar "de droit et à toute heure raisonnable" a todo lugar de trabajo y copiar registros (art. 22 e).

*Fuentes oficiales: cpeep.qc.ca/fr/decret · /fr/rapport-mensuel · /fr/reer · /fr/employeur · Guide de l'employeur (PDF, à jour 2026-03-04) · texto del décret D-2 r. 15 y Loi sur les décrets de convention collective (RLRQ c. D-2) en cpeep.qc.ca.*

---

## 4. Directorio de contactos CPEEP (verificado en corpus)

| Persona | Email | Rol |
|---|---|---|
| **Marie-Joëlle Hurtubise** | inspecteur@cpeep.qc.ca | Inspectrice del dossier DSS #39454 — el contacto activo de DSS |
| Steve Girard ("Steve Gérard") | sgirard@cpeep.qc.ca | Responsable de réclamations; autorizó verbalmente a DSS a operar |
| Jason Cavallaro | jcavallaro@cpeep.qc.ca | Inspecteur — conoce al grupo desde 2024 (dossier "QC Maintenance Plus"); su inspección de 2025 originó las réclamations de QCM |
| Céline Arseneault | carseneault@cpeep.qc.ca | Administra réclamations/renonciations; envía documentos vía TitanFile |
| Mathieu Perreault | mperreault@cpeep.qc.ca | Consultas sobre renonciations y poursuites |
| Nancy Tavares | ntavares@cpeep.qc.ca | Technicienne: états de compte, rapports amendés, paiement préautorisé |
| Noelia Borreda | nborreda@cpeep.qc.ca | Soporte de la plataforma / registro de empleados (caso NAS) |
| Valérie Bouchard | vbouchard@cpeep.qc.ca | Plataforma: enregistrement d'employés |
| David Krupa | dkrupa@cpeep.qc.ca | Réclamations (persiguió NB070127) |
| Martine Côté | mcote@cpeep.qc.ca | Administración (cartas de admisión) |
| — | info@cpeep.qc.ca | Buzón general (demandes d'adhésion, digitalización) |
| — | donotreply@cpeep.qc.ca | Códigos 2FA del Portail — **la casilla que los recibe ES la llave del portal** |
| — | notifications@app.titanfile.com | TitanFile: canal seguro de documentos del CPEEP (los canales expiran ~12 meses — descargar y archivar TODO al recibirlo) |

**Lecciones de seguridad operativa (errores reales de QCM que no hay que repetir):**
- Un typo (`cpeep.ac.ca`) hizo rebotar 3 días una respuesta con fecha límite — usar libreta de contactos verificada, no tipear de memoria.
- Los códigos 2FA del Portail llegaban SOLO a mcastro@ — punto único de falla cuando esa persona sale. En DSS: que lleguen a un buzón de rol (ej. `conformite@dssmultiservices.com`), no personal.
- Credenciales del Portail circularon en texto plano por correo interno — no repetir; usar un gestor de contraseñas.

---

## 5. Riesgos heredados y frontera legal QCM ↔ DSS

**DSS (9535-8214) y QCM (9232-3914) son entidades distintas y el dossier CPEEP de DSS (#39454) nace limpio.** Pero el mundo es chico: los mismos inspecteurs y technicienne conocen la historia, David es la cara visible de ambas, y GDI exige a DSS exactamente la trazabilidad que QCM no daba. Puntos concretos:

0. **RIESGO LEGAL MAYOR — responsabilidad del empleador sucesor**: la Loi sur les décrets de convention collective prevé que, en caso de **continuidad de empresa** (absorber salariés, contratos o clientela del empleador anterior), el comité puede perseguir en el sucesor las deudas del anterior. DSS está contratando ex-empleados de QCM y retomando la relación GDI — exactamente el patrón de continuidad. **Validar con abogado propio ANTES de asumir formalmente cualquier contrato/empleado de QCM**, y documentar que DSS es una operación nueva con contratos nuevos. (Coincide con la advertencia general de `soportes/QC-Maintenance-Historia-y-Lecciones.md`, sección 5.)
1. **La Transaction de $100.000 de QCM** (réclamation AC069879 + dossier civil): $15.000 el 17-dic-2025 + 8 cheques postdatados de $10.625 — el último es cobrable el **17-aug-2026**. Es obligación de QCM/9232-3914, NO de DSS. Pero: el expediente judicial está **suspendido, no cerrado**, y los procureurs del CPEEP guardan un **"Acquiescement sans réserve à la demande"** ejecutable si un cheque rebota. Confirmar con Mauricio/contabilidad QCM que todos los cheques pasaron, y después exigir la **quittance final + désistement + destrucción del Acquiescement**. Cabo suelto: mensajes TitanFile del 08-jul-2026 (canal wofxET, Nora Mouawad ↔ Jean Flores, expira 06-jul-2027) no están en el backup — recuperarlos antes de que expiren.
2. **Pasivos QCM pre-2025 SIN desenlace documentado en el corpus** (verificar con Mauricio/contabilidad antes de dar la frontera por cerrada): (a) la **"réclamation potentielle" de ~$620.000** que GDI cuantificó por el écart de 21.169 horas de 2023 (49.015 h declaradas vs 70.184 facturadas) — sin resolución visible al cierre de 2024; (b) un saldo de $629,90 del état de compte de abr-2023 nunca confirmado como pagado; (c) la **segunda entidad "QC Maintenance Plus Inc."** cuya demande d'ouverture gestionaba Cavallaro en oct-2024 — aclarar qué numéro d'employeur quedó asociado a qué entidad del grupo.
3. **No mezclar NUNCA papel/datos de QCM en el dossier DSS** — la fecha declarada de inicio de operaciones de DSS es 01-jul-2026; toda facturación/nómina anterior a eso no existe para el dossier #39454.
4. La declaración de David a GDI del 29-jul ("officiellement 100% conforme") **es prematura respecto al comité**: sin numéro d'employeur y con los 3 documentos sin entregar. No repetir esa frase ante el CPEEP hasta que el dossier esté completo.
5. El décret aplica igual con o sin numéro d'employeur: **desde la primera hora trabajada en agosto, los taux, primas, banque d'heures y REER del décret ya rigen** para los empleados de DSS.
6. **Doctrina dura del comité (aprendida por QCM en 2022): un rapport transmitido NO puede anularse ni suspenderse** — los montos declarados a los salariés se vuelven exigibles y pasan a réclamation civile. Nunca "declarar para ganar tiempo" con números sin verificar.

---

## 6. Definición del puesto ("gestionnaire conformité comité")

**Misión**: que DSS nunca reciba un rappel, réclamation ni inspección sorpresiva del CPEEP ni del donneur d'ouvrage — todo entregado antes del deadline, con evidencia archivada.

**Responsabilidades** (en orden de volumen real observado en QCM):
1. Ciclo mensual completo (sección 3) — pedir horas, conciliar, rapport del 15, Smartsheet, remises, evidencias.
2. Alta/baja de empleados en el Portail (NAS validado, date de naissance, coordenadas al día).
3. Calendario de obligaciones anuales (30-abr, 30-nov, 10-déc) y de cambios del décret (infolettres).
4. Correspondencia CPEEP de rutina (états de compte, pedidos de información) — responder TODO en <5 días hábiles.
5. Archivo probatorio: cada envío con su preuve d'envoi, cada pago con su recto/verso o état de compte, cada TitanFile descargado.
6. Escalar a David/dirección SOLO: réclamations nuevas, inspecciones, decisiones legales, negociación con el donneur d'ouvrage (ver documento 04 para el modelo exacto de escalamiento).

**Perfil**: administrativo bilingüe (francés escrito profesional obligatorio — toda la correspondencia CPEEP es en francés; español útil para el equipo interno), cómodo con Excel/nómina, obsesivo con deadlines. NO requiere formación legal ni contable formal.

---

## 7. Errores de QCM = manual inverso (qué NO hacer)

| Patrón QCM documentado | Costo real | Antídoto en DSS |
|---|---|---|
| Rapport sistemáticamente ~12 días tarde; solo se actuaba tras el rappel de GDI | 7+ rappels/mes en momentos pico; erosión con GDI; terreno fértil para la inspección | Recordatorio interno día 5 y día 10; el 15 es deadline duro |
| Réclamations respondidas al borde o fuera de plazo | +20% frais, poursuite civil, $100.000 de Transaction | Registro de réclamations con dueño y deadline; responder SIEMPRE dentro del plazo aunque sea para pedir prórroga |
| Evidencias producidas ad hoc, un mes tarde | Meses de conciliation sin cerrar, doble pedido de GDI | Archivo probatorio al momento (carpeta por mes, nombres estándar) |
| Conocimiento tribal (consultor externo Juan Flores "hacía el comité" de memoria) | Dependencia de una persona sin contrato escrito | Este manual + checklist mensual + playbook vivo en KAKU |
| Todos los 2FA a un buzón personal | Punto único de falla | Buzón de rol para el Portail |
| Campos numéricos del Smartsheet declarados en 0 con el detalle solo en comentarios | Riesgo latente en auditoría futura | Llenar los campos con los números reales |

---

*Documentos hermanos: [02-Rutas-de-Automatizacion.md](02-Rutas-de-Automatizacion.md) · [03-Plan-de-Formacion.md](03-Plan-de-Formacion.md) · [04-Salario-y-Rol-de-David.md](04-Salario-y-Rol-de-David.md) · soportes/ (historia QCM, persona de David, spec del asistente).*


# DOCUMENTO 3 — 02-Rutas-de-Automatizacion

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


# DOCUMENTO 4 — 03-Plan-de-Formacion

# Plan de formación — de cero conocimiento a autonomía en la gestión del comité

*Parte del paquete de onboarding comité CPEEP — DSS Multiservices. Generado 2026-08-03. Estimaciones basadas en la complejidad real del ciclo observado en 2 años de correspondencia QCM (no en descripciones teóricas del puesto).*

**Premisa**: persona sin NINGÚN conocimiento previo del sector, del décret, ni de nómina quebequense. Requisitos mínimos no negociables de entrada: **francés escrito profesional** (toda la correspondencia CPEEP es en francés; no se aprende en 3 meses) y manejo básico de Excel. Español es un plus para el equipo interno.

---

## 1. La respuesta corta (presupuesto honesto de tiempo)

| Hito | Tiempo desde el día 1 | Inversión acumulada |
|---|---|---|
| Entiende el mapa (qué es el CPEEP, por qué importa, quién es quién) | 1 semana | ~12 h de estudio |
| Ejecuta el ciclo mensual **con supervisión** | 1 mes (1er ciclo real) | ~25-30 h |
| **"80% de capacidad"** — ciclo mensual solo, escala lo correcto | **2-3 meses (tras 2 ciclos completos)** | **~45-60 h** |
| ~95% — maneja también correspondencia no rutinaria, altas de empleados, cambios de décret | 5-6 meses | ~80 h |
| 100% del calendario — ha vivido las obligaciones anuales (30-abr, 30-nov, 10-déc) | **12 meses** (no se puede comprimir: ocurren una vez al año) | — |

**Por qué no es más rápido**: el cuello de botella no es la dificultad intelectual (los cálculos son aritmética simple) sino que el ciclo es **mensual** — solo hay 12 repeticiones reales por año, y los errores se descubren semanas después (conciliation, réclamation). Dos ciclos completos con retroalimentación es el mínimo real para confiar en la autonomía.

**Por qué no es más lento**: el proceso ya está documentado (doc 01 + este plan + KAKU con 53.000+ correos consultables). En QCM esto se aprendía por ósmosis del consultor externo; el nuevo responsable arranca con el playbook que QCM nunca tuvo.

---

## 2. Semana a semana

### Semana 1 — Contexto (≈12 h)
- Leer en orden: `01-Manual-Onboarding-Comite-CPEEP.md` (2 lecturas), `soportes/QC-Maintenance-Historia-y-Lecciones.md` (secciones 4-5: los errores), este documento.
- Glosario abajo (sección 4): memorizar los ~20 términos — son el idioma del puesto.
- Navegar cpeep.qc.ca: décret vigente, taux, formularios, infolettres.
- Revisar 10-15 hilos reales de ejemplo en KAKU (pedirle a Freddy los hilos modelo: un ciclo mensual completo, una conciliation con écarts, una réclamation).
- **Check de salida**: puede explicar en 5 minutos, sin notas, qué pasa si el rapport del 15 no se entrega.

### Semanas 2-4 — Primer ciclo real, asistido (≈15 h)
- Ejecutar el ciclo del mes EN VIVO con David/Freddy revisando cada paso ANTES de enviar: pedido de horas → conciliación → rapport en el portail → Smartsheet → remises → evidencias archivadas.
- Alta de los primeros empleados en el portail (validación NAS incluida).
- Redactar 2-3 respuestas de correspondencia rutinaria en francés (revisadas antes de enviar).
- **Check de salida**: el rapport del mes salió el día 15 o antes, sin correcciones del CPEEP.

### Meses 2-3 — Ciclos solos con revisión previa (≈10 h/mes)
- El responsable ejecuta todo; David/Freddy solo revisan el paquete 24 h antes del envío (30 min de revisión).
- Simulacros (1 h c/u, con casos reales del corpus QCM): (a) llega una réclamation con plazo de 10 días — ¿qué hacés hora por hora?; (b) el CPEEP devuelve el rapport "à corriger"; (c) un NAS es rechazado por la plataforma.
- **Check de salida = "80% de capacidad"**: dos ciclos consecutivos sin intervención correctiva, y en los simulacros escala exactamente lo que el playbook dice (ni más, ni menos).

### Meses 4-6 — Autonomía (≈6-8 h/mes, ya es el trabajo normal)
- Revisión previa se elimina; David pasa al modelo de régimen estable (doc 04: one-pager mensual + aprobación de pagos).
- El responsable procesa su primera infolettre de cambio de décret aplicándola a nómina (la prime de nuit sube a $0,50 el 1-nov-2026 — le va a tocar en vivo).
- **Check de salida**: gestiona una consulta no rutinaria del CPEEP de punta a punta con David solo firmando.

### Mes 12 — Ciclo anual completo
- Ha ejecutado: banque de vacances (30-abr), formulaires y pago de excédents de maladie (30-nov/10-déc), y un cambio de taux. Recién aquí el calendario completo está vivido, no solo leído.

---

## 3. Método de formación (barato y ya disponible)

1. **El corpus es el curso**: KAKU tiene todo el historial QCM↔CPEEP indexado. Cada tipo de situación que el responsable va a enfrentar ya ocurrió y está escrito — usarlo como banco de casos (Freddy puede armar la lista de hilos modelo en una tarde).
2. **Checklist mensual impreso** (derivar de la sección 3 del doc 01) — se tacha, se archiva con las evidencias del mes. El mes queda "cerrado" cuando el checklist está completo.
3. **Regla de los primeros 90 días**: nada sale hacia el CPEEP o el donneur d'ouvrage sin segunda firma. Después, solo lo no-rutinario.
4. **No formación externa necesaria**: no existe un "curso de CPEEP"; el décret + el manual + los casos reales lo cubren. Si Desjardins da capacitación de su plataforma de paie, tomarla (2-3 h, gratis con el servicio).

---

## 4. Glosario mínimo (los ~20 términos del puesto)

| Término | Qué es |
|---|---|
| Décret | La ley sectorial (Décret sur le personnel d'entretien d'édifices publics) — fija salarios y condiciones mínimas |
| CPEEP / le comité | El organismo que fiscaliza el décret en la región de Montreal |
| Assujetti | Sujeto al décret (automático si hacés entretien ménager en la región) |
| Rapport mensuel | El reporte de horas/salarios por empleado que se transmite el 15 de cada mes |
| Portail | La plataforma web del CPEEP donde se transmite el rapport (login con 2FA) |
| Prélèvement | El aporte del ~1% de la masse salariale al comité (mitad empleado, mitad empleador) |
| Remise | El pago (prélèvement + REER) que acompaña al rapport |
| REER | Aporte patronal a retraite: $0,20/h pagada (desde mar-2026) |
| Banque d'heures | Horas trabajadas sobre el tope mensual que se "banquean" y se pagan después |
| Banque de vacances | Las vacaciones acumuladas — se pagan a más tardar el 30 de abril |
| Congé férié | Feriado pagado (8 h) — QCM pagó $12.670 por no pagarlos bien |
| 6% de départ | Indemnidad al salir un empleado (con fecha y motivo en el rapport) |
| Classe A/B/C | Clasificación del empleado que determina su taux horaire (A: $23,25 desde mar-2026) |
| Prime de nuit | Plus por hora nocturna ($0,25 → $0,50 el 1-nov-2026) |
| Registre de paie | El registro de nómina — LA prueba que el CPEEP acepta; debe consignar cada indemnité |
| Feuilles de temps | Hojas de tiempo por día — la otra fuente que el inspector cruza |
| Conciliation | El cruce mensual de tu rapport contra las horas del donneur d'ouvrage (écarts en amarillo) |
| Donneur d'ouvrage | El cliente principal que te subcontrata (GDI, Ménagez-Vous) y te exige conformité |
| Réclamation | Reclamo de dinero del CPEEP con número, monto y plazo — SIEMPRE responder dentro del plazo |
| Renonciation (au bénéfice du temps écoulé) | Renuncia a la prescripción que el CPEEP pide para no demandar ya — decisión de David/abogado, jamás del responsable |
| Poursuite | Demanda judicial — llegar acá cuesta +20% automático |
| Infolettre | El boletín del CPEEP — así avisan los cambios de taux (el mismo día que entran en vigor) |
| TitanFile | El canal seguro de documentos del CPEEP — descargar TODO al recibirlo (expira en ~12 meses) |
| Attestation | Certificado de conformité (CNESST, Revenu Québec) que los donneurs d'ouvrage exigen mensual/trimestralmente |


# DOCUMENTO 5 — 04-Salario-y-Rol-de-David

# Salario del rol y modelo de involucramiento de David

*Parte del paquete de onboarding comité CPEEP — DSS Multiservices. Generado 2026-08-03. Datos salariales: Guichet-Emplois/Job Bank (act. nov-2025), Robert Half 2026 Salary Guide, Indeed, Glassdoor, Fed Finance. Datos de rol de David: análisis completo del corpus QCM 2025-2026 (agente especialista dedicado).*

---

## 1. Cuánto necesita David estar involucrado — la respuesta corta

**En régimen estable: ~3-5% del trabajo del comité de forma irreducible, ~1-2 h/mes.** No es una opinión — es lo que el corpus muestra que pasó en QCM:

- De >100 intercambios sustantivos del expediente CPEEP 2025-2026, **David escribió ~8 correos** — todos de cortesía/escalamiento con GDI, ninguno operativo.
- El ciclo mensual lo ejecutaba una persona dedicada (Leidy Loaiza, pay@) — "la seule personne active... c'est moi".
- El contencioso lo negoció y redactó el consultor externo (Juan Flores) y lo **firmó Mauricio Castro** — la Transaction de $100.000, el rechazo de la renonciation, la mise en demeure. **David no firmó nada ante el CPEEP en todo el corpus.**

### Lo que SÍ es irreduciblemente de David (el "núcleo 3-5%"):
1. **Garantía relacional senior ante el donneur d'ouvrage** — cuando GDI escala por nombre ("Bonjour David et Mauricio… la conformité est essentielle au maintien de votre lien d'affaires"), la respuesta tiene que venir de él.
2. **Postura de negociación** — decidir qué prueba/alternativa ofrecer cuando un cliente exige algo impracticable (criterio de dueño, pondera riesgo contractual).
3. **Memoria institucional** de la relación GDI↔comité (avenants firmados, promesas hechas) — transferible gradualmente a KAKU/este manual, pero hoy vive en él.
4. **Firma legal**: en DSS, David es presidente — lo que en QCM firmaba Mauricio (réclamations, transactions, renonciations) aquí lo firma él. *Esto sube su rol vs. QCM: hereda el rol de Mauricio, no solo el suyo.*

### Calendario de involucramiento de David

| Fase | Período | Dedicación de David | Qué hace exactamente |
|---|---|---|---|
| **Arranque** | ago–oct 2026 | **3-5 h/mes** | Responder a la inspectrice Hurtubise (dossier #39454), cerrar Desjardins, validar el primer rapport de paie, presentar al nuevo responsable ante el CPEEP y GDI por correo |
| **Transferencia** | nov 2026 – ene 2027 | **2-3 h/mes** | Revisar (no hacer) los rapports antes del envío; co-firmar correspondencia no rutinaria; el responsable ya opera el portail |
| **Régimen estable** | feb 2027 → | **~1-2 h/mes** | (a) aprobar remises/pagos del mes (15 min), (b) leer el one-pager mensual de estado (10 min), (c) escalamientos puntuales |
| **Siempre, sin delegación posible** | — | Bajo demanda | Réclamations nuevas, inspecciones, renonciations, negociación con donneurs d'ouvrage, cualquier firma |

**Regla de escalamiento para el responsable** (cuándo llamar a David — todo lo demás NO lo interrumpe):
- Llega una réclamation, avis d'inspection o carta con plazo legal → mismo día.
- Un donneur d'ouvrage escala por nombre o amenaza la relación comercial → mismo día.
- Cualquier cosa que implique firmar, pagar fuera del ciclo normal, o admitir un incumplimiento → antes de responder.
- Rappels de rutina, états de compte chicos, pedidos de información estándar → NO escalar; resolver y reportar en el one-pager mensual.

---

## 2. Salario en Quebec (Montreal, 2026) — qué pagar por manejar esto al ~80% sin David

Primero el dato clave que ordena todo: **la función comité sola es 6–10 h/mes hoy, y 8–15 h/mes cuando DSS crezca** (más empleados = más líneas en el rapport, misma mecánica). **No es un puesto de tiempo completo — es un bloque de tareas.** Pagar un "technicien paie et avantages sociaux" senior ($59.670–79.050 según Robert Half 2026) sería sobredimensionado.

### Mercado Montreal 2026 (fuentes abajo):

| Perfil | Por hora | Anual (37,5-40 h/sem) |
|---|---|---|
| Commis à la paie / adjoint(e) junior (entrada) | $21–24 | $43.000–50.000 |
| **Adjoint(e) administratif(ve) bilingüe con volet paie/conformité** | **$24–28** | **$50.000–57.000** |
| Adjoint(e) experimentado con autonomía total de conformité | $28–33 | $58.000–68.000 |
| Technicien(ne) paie et avantages sociaux (especialista) | $30–40 | $59.670–79.050 |
| Freelance/fraccional competente (paie quebequense, francés) | $35–50 | — (por hora o forfait) |

### Recomendación (elegir una — la A es la recomendada para hoy):

**Opción A — RECOMENDADA para el DSS de hoy (1 contrato, primeros empleados): fraccional con forfait mensual de $500–700.**
Un(a) teneur(se) de livres / adjoint(e) virtuelle freelance con experiencia en paie quebequense toma el ciclo completo (rapport, remises, Smartsheet, correspondencia, calendario) por un forfait fijo. Costo anual: **~$7.200**, sin cargas patronales, escalable. Con las automatizaciones del documento 02, el forfait cubre holgadamente los picos. *Por qué: contratar un asalariado para <15 h/mes de trabajo real no se justifica; el riesgo del comité está en los deadlines, no en el volumen.*

**Opción B — cuando DSS tenga ~15–20 empleados y varios contratos: adjoint(e) administratif(ve) bilingüe de tiempo completo, $50.000–57.000/año ($24–28/h).**
El comité pasa a ser ~15-20% de un rol que además cubre facturación, seguimiento de conformité CNESST/RQ, soporte RH — exactamente el rol que QCM nunca formalizó y le costó caro. Nivel de entrada ($43–50k) es viable si David acepta supervisar los primeros 3 ciclos; $58–68k solo si se le exige autonomía total desde el día 1 con cero supervisión.

**Opción C — descartada: especialista de paie dedicado ($60k+).** El volumen no lo justifica ni en el escenario de crecimiento a 2 años; los cálculos del décret son deterministas y automatizables.

### Nota sobre "80% sin David"
Con el manual (doc 01), el playbook de escalamiento (arriba) y las automatizaciones (doc 02), el responsable cubre de forma realista **~95% del volumen** — el límite no es 80% de capacidad sino el 3-5% legal/relacional que siempre será de David (firma + relación senior). El "80%" se alcanza ya en el mes 2-3; el 95% al cierre de la fase de transferencia (~mes 5). Ver curva de aprendizaje en el documento 03.

---

## Fuentes salariales
- Job Bank / Guichet-Emplois — Payroll Administrator NOC 13102 (Québec: bajo $21,80 / mediana $30,00 / alto $40,84 por hora; act. 19-nov-2025): https://www.jobbank.gc.ca/marketreport/wages-occupation/25792/ca
- Guichet-Emplois — Adjoint(e) administratif(ve), región de Montreal ($19,00–41,21/h; mediana provincial ~$25/h): https://www.guichetemplois.gc.ca/rapportmarche/salaire-profession/24789/22446
- Robert Half 2026 Canada Salary Guide — Payroll Administrator Montreal ($59.670–79.050): https://www.roberthalf.com/ca/en/insights/salary-guide
- Indeed — Technicien(ne) de paie Montreal (promedio $64.450): https://emplois.ca.indeed.com/career/technicien-de-paie/salaries/Montr%C3%A9al--QC
- Glassdoor — Payroll Montreal (promedio $55.885): https://www.glassdoor.ca/Salaries/montreal-payroll-salary-SRCH_IL.0,8_IM990_KO9,16.htm
- Fed Finance — grilla contable Quebec 2026 (commis $45–55k): https://www.fed-group.ca/fed-finance/conseils/salaire-comptable-quebec
- Outsource Bookkeeping CA — tarifas freelance/forfait ($30–90/h; forfaits $400–800/mes): https://www.outsourcebookkeeping.ca/blog/bookkeeping-rates-canada


# DOCUMENTO 6 — 05-Anexo-Historia-2019-2024

# Anexo — Historia QCM ↔ CPEEP, 2019-2024 (lo que el snapshot 2025-26 no muestra)

*Parte del paquete de onboarding comité CPEEP — DSS Multiservices. Generado 2026-08-03 a partir de 999 correos pre-2025 extraídos del backup local (9 buzones, grep CPEEP/paritaire 2018-2024), leídos por 6 agentes cronológicos + 1 verificador adversarial contra el manual. El expediente employeur **#5439** llega a la era DSS con SIETE años de historia — y el comité la recuerda toda.*

---

## 1. Línea de tiempo por eras

### 2019-2021 — Era del contador externo, y el evento fundacional
- El contacto real arranca en **nov-2019** con un dossier menor resuelto cordialmente en español (inspectrice Fernanda Nava, $86,29). La relación no siempre fue hostil.
- Los rapports los preparaba un **contador externo** (Hicham Benmahane / FCH Consulting), tarde y por lotes; pagos por cheque, PDF por email, sin portal. La **lettre d'admission vencía cada enero** y la renovaba él.
- **El evento fundacional (2020-21)**: el comité investigó los mandatos CHSLD/COVID subcontratados por GDI. QCM ignoró la demande d'information del 27-nov-2020 durante meses → el CPEEP construyó la réclamation **AC029231 por $680.577,92 SOLO con documentos de GDI** (obtenidos "par requête"). Cierre ago-2021: $116.753,64 — **GDI pagó $96.490,61 con fondos retenidos de QCM** vía "Directive de paiement" firmada por Castro y su esposa (administradora única); QCM pagó la pénalité del 20% y el prélèvement. En paralelo: **causa penal 500-61-515584-200** (7 chefs; culpabilidad negociada en 3).
- GDI cortó relaciones en 2020 por esto mismo ("J'ai l'impression de revivre la même histoire quand 2020" — 2022) y las retomó en oct-2021. La palanca de GDI siempre fue el dinero retenido.

### 2021-2023 — Era penal: 4 dossiers consecutivos
- **Cuatro dossiers pénaux sin interrupción** por meses enteros sin rapport (sept-2019 → avril-2022): EP-1704 (règlement $1.824), EP-1916 (21 chefs, $4.074), 1432-1979 (18 chefs, $3.895), 1432-2029 ($4.654 + prélèvements; cheque de $8.464; "dossier conforme" declarado 26-oct-2022).
- Escala real de sanciones de la era: **amende $200→300/chef + frais de justice $74-154/chef + contribution légale 25% de la amende**. Un mes sin declarar escala a constats en ~6-12 meses.
- **Doctrina dura aprendida en 2022: un rapport transmitido NO se puede anular ni suspender** — lo declarado a los salariés se vuelve exigible y pasa a réclamation civile.
- Plataforma de la era: **AramisWeb** con credenciales simples por email (el login era "estefani", contraseña en texto plano). En **abr-2023 Castro hizo anular todos los rapports del contador** y lo reemplazó — el corte de era.

### 2023-2024 — Era de la subdeclaración y la conciliación GDI
- Patrón documentado mes a mes por GDI: **sub-declaración masiva** — ej. ene-2024: 4.223 h / 72 empleados declarados vs 10.707 h / ~141 personas facturadas SOLO a GDI; 2023 completo re-declarado vía **rapports amendés** (nov-2023: 3.429 h declaradas → 16.157 h amendées).
- GDI cuantificó un **écart de 21.169 horas para 2023** y una **"réclamation potentielle" de ~$620.000** ($400K salaires + $120K bénéfices + $100K pénalité) — **sin desenlace documentado al 24-dic-2024**.
- GDI montó en **mayo-2024 la conciliación Smartsheet** (el mismo formulario del ciclo actual) y condicionó pagos: $153K retenidos al 31-août-2024; avance de $250K (dic-2024) condicionado a conformité (clause 6.8). Rapports en Excel por **Johan Salazar**; **David fue la cara visible de la crisis de conciliación jul-oct-2024**.
- En paralelo: dossier directo con **Jason Cavallaro** por la demande d'ouverture de una **segunda entidad, "QC Maintenance Plus Inc."** (ultimátum de 12 meses de relevés bancaires, 9-oct-2024, sin desenlace visible), y carta de admisión de oct-2024 a Javier Castro — **aclarar qué numéro quedó asociado a qué entidad**.

---

## 2. Los patrones que se repiten en 7 años (el comité los tiene por escrito)

1. **Silencio ante demandes d'information** → el comité construye el caso con documentos del cliente. Pasó en 2020 ($680K) y en 2025 (inspección Cavallaro).
2. **Rapports tarde, por lotes, tras rappels del cliente** — ~6 semanas de retraso admitidas por escrito en 2024; meses enteros sin declarar 2019-2022.
3. **Dependencia de terceros sin sistematización** — contador externo (2019-23), consultor Flores (2021, 2024-26): la función nunca fue interna ni documentada.
4. **El donneur d'ouvrage como policía**: la responsabilidad solidaria hizo que GDI pagara $96K en 2021, retuviera $153K en 2024 y montara todo el aparato SQC Conformité. Cada atraso con el comité se convierte en un problema de cash-flow inmediato con el cliente.
5. **Exposición personal de los administradores usada como palanca** (Directive de paiement 2021, advertencias de Trottier) — no es teoría, ya ocurrió.

## 3. Cabos sueltos pre-2025 (verificar antes de dar la frontera QCM↔DSS por cerrada)

| Ítem | Detalle | Estado al corte del corpus |
|---|---|---|
| Réclamation potentielle ~$620K | Écart 21.169 h de 2023 cuantificado por GDI | Sin resolución visible (dic-2024) |
| Saldo $629,90 | État de compte 04-abr-2023 (avril/sept/oct-2022 + janv-2023) | Pago no confirmado |
| Micro-faltantes 2024 | $84,73 (mai) + $45,23 + $1,35 (juin/juillet) — el comité los suma al próximo pago | Verificar saldados |
| "QC Maintenance Plus Inc." | Demande d'ouverture con Cavallaro, oct-2024 | Desenlace desconocido |
| Rapports amendés 2023 prometidos "avec paiement" | juillet-2023: 952 h reconocidas no declaradas | Confirmar presentados y pagados |
| Historia de pagos 2023 confusa | Regla de 2 cheques (1% y REER separados) desde août-2023; cheques 210/220 con porción REER faltante; chèque 237 "amendement" multi-mes | Puede resurgir en réclamations |

## 4. Datos prácticos que solo la historia enseña

- **La correspondencia oficial del CPEEP llegaba al hotmail personal de Javier Castro** (pinta42@hotmail.com, cc al consultor) — por eso el backup corporativo puede tener huecos, y por eso en DSS la **"Fiche des contacts et de procuration"** (a Muriel Charreton, mcharreton@cpeep.qc.ca) con el buzón de rol es lo PRIMERO que se llena.
- **La lettre d'admission vence cada enero** y todos los donneurs d'ouvrage la piden junto con CNESST y Attestation Revenu Québec; para licitaciones públicas las attestations deben tener **<45-60 días** — calendarizar enero + pedir attestation fresca por soumission.
- **Cláusula de indexación**: el acuerdo QCM↔GDI ajustaba la tarifa facturada con cada aumento del décret (+$0,22 → $27,72/h en 2023). **DSS debe replicar esa cláusula con Ménagez-Vous/GDI** o absorber los aumentos programados de cada 1-nov y la prime de nuit creciente.
- **Categorías en disputa nunca resuelta**: QCM excluía manutention/supervision/forfait del rapport; GDI dictaminó en 2024 que la limpieza à prix forfaitaire SÍ está régie par le décret. **Definir por escrito con el CPEEP qué declara DSS antes del primer rapport.**
- **Los nombres declarados deben coincidir EXACTAMENTE con los facturados por el cliente** — las variantes de nombres compuestos hispanos entre Odoo/nómina fueron causa recurrente de écarts.
- Las semanas del rapport terminan en **sábado** ("semaines finissantes") — el desfase con el mes civil fue LA fuente crónica de écarts 2022-2024. El rapport se arma sobre el calendario del comité, no el de facturación (orden explícita de GDI, 30-sep-2024).
- El comité **rechaza enlaces de Google Drive** (política de seguridad) y **no acepta fotos de cheques** — PDF adjunto o papel; prueba de pago = recto/verso del cheque encaissé o état de compte.
- Attestations de conformité: se piden a info@cpeep.qc.ca y **salen en ~24 h** (Martine Côté) — no hay excusa para llegar sin ella a una licitación.
- Referencias para leer archivos viejos: réclamations con prefijo del agente (AC…, VeRa…, NB…, DAKR…); employeur #5439 = 9232-3914 Québec Inc. f.a.s.r.s. QC Maintenance.

## 5. Qué significa esto para el nuevo responsable en DSS

El dossier #39454 de DSS nace limpio, pero **los interlocutores son los mismos y recuerdan**: Cavallaro (2024-25), Girard (2021→2026), Perreault (2020→2025), Côté, Krupa, Arseneault. La reputación heredada es de no-colaboración crónica con dos picos graves ($680K/2021 y $100K/2025) y un antecedente penal negociado. La consecuencia práctica es simple: **DSS no tiene margen para un solo rapport tarde** — donde a otra empresa nueva le darían el beneficio de la duda, al grupo Castro/Salazar el comité le aplicará la lupa desde el mes uno. La puntualidad aburrida no es una buena práctica: es la única estrategia disponible.


# DOCUMENTO 7 — 06-Guia-Oficial-CPEEP

# Guía de fuentes oficiales CPEEP — qué dice cpeep.qc.ca y cómo usarlo

*Generado 2026-08-04 a partir del harvest completo de cpeep.qc.ca (50+ páginas vivas y PDFs oficiales, archivados en `fuentes-oficiales/`), verificado con un pase adversarial contra el texto vigente del décret D-2, r. 15 («À jour au 04 mars 2026») y la Loi sur les décrets de convention collective («À jour au 1er avril 2023»). Complementa el [01-Manual](01-Manual-Onboarding-Comite-CPEEP.md), que se construyó desde los 8 años de correos de QCM; este documento es la contraparte: lo que el comité mismo publica.*

**Recomendación de uso**: ante cualquier duda operativa, el orden de autoridad es (1) el texto del décret en la página viva `/fr/decret`, (2) las páginas de «Interprétation et jurisprudence» del comité, (3) el Guide de l'employeur à jour mars 2026, (4) este paquete. Los PDFs con `/uploads/2021/` o `/2022/` en la URL tienen taux caducos: sirven para procedimiento, nunca para montos.

---

## 1. Qué hay en cpeep.qc.ca y qué está desactualizado

El sitio mezcla páginas vivas al día con PDFs viejos que siguen enlazados. La regla práctica: **mirar el año en la URL (`/wp-content/uploads/AAAA/`) antes de citar cualquier monto**.

### Dónde vive la verdad vigente (usar siempre)

| Fuente | Estado | Para qué |
|---|---|---|
| `/fr/decret` (página viva) | «À jour au 04 mars 2026» — texto INTEGRAL del décret con los taux vigentes (A/B $23,25 · C $23,90) y la escalera hasta 2030 | La referencia primaria de todo |
| PDF del décret maj 10-jul-2026 (`uploads/2026/07/nouveau-decret-et-annexes-fr-maj-10-juillet-2026.pdf`) | Vigente | Copia archivable del texto legal |
| Guide de l'employeur (`uploads/2026/07/guide-employeur-fr.pdf`) | «À jour mars 2026» | Guía integral del rol — base de formación |
| Guide du Portail (`uploads/2025/10/guide-du-portail-...-26-sept-2024.pdf`) | «Dernière mise à jour: octobre 2025» pese al nombre del archivo | El paso a paso del Portail (sección 2) |
| Rapport mensuel recto/verso 2026 (`uploads/2026/05/`) | Vigentes — 26 cases, cheques REER y prélèvement SEPARADOS | Formulario papel y su guía |
| `/fr/reer` (página viva, mod. 2026-07-17) | Vigente | REER $0,20/h, régimen 15383CM001TP |
| Páginas «Interprétation et jurisprudence» (1-00 a 13-00) | Doctrina oficial del comité, sección por sección | Consultar ANTES de disputar un criterio de la inspectrice |
| `/es/empleadores` (mod. 2026-07-21) | Vigente, en español | FAQ completa con tasas 2026 (sección 7) |

### Trampas de desactualización detectadas (no pisar)

- **Guide de l'employeur 2021 y Guide de l'employé 2021** (`uploads/2021/09/fr-guide-employeur.pdf` / `fr-guide-employe.pdf`): citan taux caducos (A $19,47 / B $19,18 / C $20,05; REER $0,45/h). Procedimientos válidos, montos NO.
- **`/fr/territoire-geographique` todavía enlaza el PDF del décret 2021** («decret-et-annexes-2021-maj-8-fev-2023.pdf»). Jamás usar ese botón para taux; la lista de municipios (Annexe 1) sí es válida.
- **`/fr/nouveau-decret` es un communiqué de ARCHIVO** (2021-04-02): anuncia el décret de 2021, no el vigente. Solo valor histórico.
- **`instructions-rm.pdf` (2021, 25 cases) está superado** por el guide verso 2026 (26 cases, con cheques separados REER/prélèvement). Operar solo con la versión 2026.
- **`fr-loi.pdf` (2021) es una consolidación vieja de la Loi** («Dernière modification: 11 décembre 2001»); la versión que el sitio presenta como corriente es `loi-cc-fr-1.pdf` («À jour au 1er avril 2023»). Los montos penales coinciden, pero citar la 2023.
- **La «Fiche des contacts et de procuration» 2021 está superada por la versión A2024** — y el botón del propio sitio está roto (typo `wwp-content`). URL correcta verificada (HTTP 200): `https://cpeep.qc.ca/wp-content/uploads/2024/08/1801-fiche-contacts-et-procuration-fr-final-a2024-1.pdf`. Usar esa para el trámite pendiente de DSS.
- **El «Compt'Heures» ya no existe** — la página devuelve 404; el CPEEP lo discontinuó en enero 2025 (ver sección 7).
- Las categorías `/fr/category/infolettre` y `/nouvelles` están vacías; el índice real de communiqués 2021-2026 es `/fr/articles`.

Dato de contexto para decidir contratos: la «région de Montréal» del décret (Annexe 1) incluye también **Laval, toda la Montérégie, Lanaudière, Laurentides, Outaouais (Gatineau), Mauricie (Trois-Rivières) y parte de Estrie y Centre-du-Québec**. Un contrato futuro de DSS en Granby o Gatineau sigue «assujetti» al CPEEP-Montreal — no asumir que salir de la isla libera del décret.

El décret vigente vence el **2030-11-01** y sigue aplicándose después hasta que AESEQ y la Union des employées et employés de service (local 800) negocien uno nuevo; el comité no participa en la negociación de taux.

---

## 2. El Portail paso a paso según el guide officiel

Fuente: Guide du Portail CPEEP (oct-2025). Nombre interno de la aplicación: «Aramis web». El manual decía «solicitar credenciales» — este es el cómo completo.

### Primera conexión

1. Pedir al comité el **«nom d'utilisateur»** (no se autogenera): 514 384-6640 / info@cpeep.qc.ca. **Corrección al manual**: el comité emite SOLO el usuario; la contraseña la crea uno mismo.
2. Registrar como correo de la empresa un **buzón de rol** (ej. `conformite@dssmultiservices.com`) — el código 2FA llega a UN solo correo «à l'adresse enregistrée pour votre entreprise». Hacerlo ANTES de la primera conexión.
3. Entrar a https://portail.cpeep.qc.ca/ con **Google Chrome o Mozilla Firefox** — el guía ordena textualmente «Ne jamais utiliser Microsoft Edge».
4. Primera vez: crear la contraseña clicando **«Mot de passe oublié?»** y seguir las instrucciones del correo.
5. Iniciar sesión (mayúsculas y minúsculas cuentan en usuario Y contraseña) → «Connexion» → ingresar el código 2FA de 6 dígitos que llega por correo → «Valider».

### Configuración inicial

6. **Onglet «Employeur»**: verificar los datos de la empresa. Casi todos los campos son de solo lectura — cualquier cambio (incluida el alta a «prélèvements préautorisés») se pide al comité; no buscar el botón. En «Informations supplémentaires» se elige el orden de los empleados en los rapports.
7. **Onglet «Employés»** (vacío la primera vez): «Ajouter un employé» con TODOS los campos: nom, prénom, adresse complète, téléphone, courriel, **NAS y date de naissance (obligatorios)**, date d'embauche, sexe, classe(s) d'emploi. Fechas en formato «aaaa-mm-jj». «Sauvegarder» al pie. La date de naissance se captura aquí una sola vez — ya no es campo mensual del rapport (D. 540-2026).
8. Filtros «Statut» (actifs/inactifs/tous) y «Type» (maternité, CNESST, maladie…) — ojo: tras marcar opciones de «Type» hay que clicar «Type» de nuevo para que el filtro aplique.

### Crear y transmitir el rapport

9. **Onglet «Nouveau rapport mensuel»**: 4 campos obligatorios — «Année du rapport», «Mois du rapport», «Semaine 1 (finissant le)» (ícono de calendario) y «Durée du rapport» (4, 5 o 6 semanas; **con paie quincenal: 4 o 6, NUNCA 5**).
10. **REGLA DURA DE CONTINUIDAD**: la primera fecha del rapport debe ser EXACTAMENTE 7 días después de la última fecha del rapport anterior — «Contactez le Comité paritaire avant si vous devez changer cette date!». Desde el segundo rapport el sistema pre-llena los 3 primeros campos; verificar igual. **Definir con cuidado la primera «semaine finissant le» del primer rapport de DSS (agosto-2026): fija toda la serie.**
11. «Ajouter un employé»: uno, varios, o todos con la casilla del encabezado.
12. Capturar por empleado, por semana y por classe: «Heures régulières» · «Heures supplémentaires» (art. 3) · «Heures congés fériés» (la indemnité) · «Heures congés fériés travaillées» (a temps et demi ADEMÁS de la indemnité — art. 7.07) · «Heures maladie» (incluye el excédent anual calculado al 31-oct) · «Salaire $» bruto SIN el REER · monto de «contributions REER dues». Pago quincenal: el salario puede capturarse por quincena, pero las horas van semana por semana.
13. **Trampa del férié**: si heures régulières + heures de congé superan 40 h en la semana, el exceso de régulières pasa a «heures supplémentaires» a temps et demi.
14. Casos especiales por empleado: casilla **«Sans gain»** con motivo (maternité, CNESST, maladie…) — así se declara un empleado activo sin gains sin darlo de baja; desplegables «Ajustements» (aquí van bonus y allocations), «Vacances» y «Départ» con horas y semana; **cambio de classe con el botón «+» es TEMPORAL** (no actualiza la fiche — cambios permanentes en el onglet Employés); ojo con los salariés de 71+ años (ver sección 5).
15. Revisar el «Sommaire du rapport»: (1) Gains = salarios + vacances + départs + ajustements, sin REER; (2) REER total; (3-4) Prélèvement = 1% de la masse salariale **incluyendo REER**; (5) REER; (6) «Total dû» — no modificable.
16. Marcar «J'envoie un chèque de :» o «J'autorise le prélèvement préautorisé de». **Hay que producir DOS pagos: uno por el prélèvement y otro por el REER.** Si el monto pagado difiere del «Total dû» (crédito o saldo pendiente), explicarlo en el campo «Notes».
17. **«Sauvegarder»** deja el rapport en estatus **«Ouvert»** (modificable) — esto permite armarlo incrementalmente período de paie por período durante el mes, en vez del maratón del día 14 que hundía a QCM. Cuando esté completo: **«Envoyer»** → estatus «Envoyé», ya inmodificable. La «Date d'envoi» de la grilla es la **«preuve d'envoi»** oficial (la que se reenvía a GDI).
18. **Archivar SIEMPRE el rapport en PDF inmediatamente después de «Envoyer»** (botón de impresión arriba a la derecha → imprimante PDF): **el Portail solo conserva los 15 últimos rapports — el 16.º expulsa al más antiguo**. El archivo probatorio del manual no puede depender del portal.

### Casos particulares

19. **Mes sin actividad**: ir directo al «Sommaire du rapport», marcar «J'envoie un chèque au montant de : $», poner 0$, «Sauvegarder», «Envoyer». Y NUNCA dejar de producir rapports por falta de contratos sin antes hablar con un inspecteur al 514 384-6640 — no se suspende unilateralmente.
20. **Corrección post-envío — «rapport amendé»** (la única salida legal: un rapport enviado no se anula): lo declarado de más se pone en NEGATIVO, lo omitido se agrega. Empleado olvidado → amendé solo con él; empleado declarado por error → amendé con todos sus datos en negativo. **Obligatorio llamar al comité ANTES de usar la función** para recibir las consignas exactas.
21. **«Prélèvements bancaires préautorisés»** (no se activa desde el portal): enviar un spécimen de chèque a info@cpeep.qc.ca con nombre y numéro d'employeur → el comité devuelve un formulaire d'adhésion → devolverlo firmado → confirmar desde qué rapport mensuel arranca. Una vez activo, un solo clic envía el rapport y paga el mes.
22. Extras: «Mon compte» → «Changer mot de passe»; **«Changer d'entreprise»** para comptables multi-empresa (si DSS delega a un contador externo, este usa su PROPIO acceso — no compartir credenciales de DSS); «English»; «Déconnexion» clicando el nombre de usuario arriba a la derecha.

### La vía electrónica (automatización)

El Guide du Portail NO menciona ninguna vía XML: los 4 onglets son captura manual. Pero la FAQ oficial de `/fr/rapport-mensuel` confirma una **4.ª vía: «Rapport en format électronique (programmation de l'employeur)»** — un archivo extraído del sistema de nómina del empleador «dont la configuration est déterminée par le Comité paritaire», con la consigna «Renseignez-vous auprès de nous si cette option vous intéresse». **Acción para el documento 02**: pedir las especificaciones del formato al comité antes de apostar la automatización a esta vía — no hay especificación pública.

---

## 3. Todos los formularios oficiales

**[MES 1]** = DSS lo necesita en agosto-septiembre 2026. Verificar siempre el año del upload en la URL antes de imprimir.

### Alta y estructura del dossier

| Formulario | URL | Cuándo se usa |
|---|---|---|
| **[MES 1]** Fiche des contacts et de procuration (A2024, vigente) | https://cpeep.qc.ca/wp-content/uploads/2024/08/1801-fiche-contacts-et-procuration-fr-final-a2024-1.pdf | Designar contactos autorizados (rapports/inspections/réclamations) y mandatarios; autoriza firmar «renonciations à la prescription». Trámite pendiente de DSS — usar buzón de rol. El enlace del sitio está roto; esta URL responde 200 |
| Fiche de procuration 2021 (superada) | https://cpeep.qc.ca/wp-content/uploads/2021/12/formulaire-procuration-fr.pdf | Solo archivo histórico; su página 2 tiene OCR corrupto — leer el binario en `fuentes-oficiales/pdf/` si hiciera falta |
| **[MES 1]** Formulaire date de naissance (papel) | https://cpeep.qc.ca/wp-content/uploads/2025/06/formulaire-fran-papier.pdf | Transmitir la DDN de cada empleado nuevo con el primer rapport donde aparece (art. 6.106) |
| Formulaire date de naissance (web) | https://cpeep.qc.ca/wp-content/uploads/2025/06/formulaire-fran.pdf | Versión interactiva del mismo |
| Suscripción a la infolettre | https://cpeep.qc.ca/fr/ (pie de todas las páginas) | **[MES 1]** Suscribir el buzón de rol — los cambios de taux entran en vigor el mismo día del aviso |

### Rapport mensuel

| Formulario | URL | Cuándo se usa |
|---|---|---|
| **[MES 1]** Guide du Portail (oct-2025) | https://cpeep.qc.ca/wp-content/uploads/2025/10/guide-du-portail-cpeep-employeurs-et-comptables-fr-final-26-sept-2024.pdf | El paso a paso de la sección 2 — pieza de formación del rol |
| Rapport papel 2026 (recto, ejemplo) | https://cpeep.qc.ca/wp-content/uploads/2026/05/rapport-mensuel-recto-2026.pdf | Modelo papel vigente (plan B si el Portail falla); copia blanca antes del 15 con los 2 cheques |
| Guide d'utilisation 2026 (verso, 26 cases) | https://cpeep.qc.ca/wp-content/uploads/2026/05/rapport-mensuel-verso-2026.pdf | Instrucciones case por case vigentes (reemplaza el guide 2021 de 25 cases) |
| Rapport mensuel dynamique 2026 | https://cpeep.qc.ca/wp-content/uploads/2026/07/rm-dynamique-2026-fra.pdf | PDF autocalculante (Firefox/Chrome; el REER $0,20/h se suma A MANO y los totales del mes NO se autocalculan con 2+ empleados — razón más para ir al Portail) |
| Instructions RM 2021 (superadas) | https://cpeep.qc.ca/wp-content/uploads/2021/09/instructions-rm.pdf | Solo referencia histórica |

### Registro de horas y paie

| Formulario | URL | Cuándo se usa |
|---|---|---|
| **[MES 1]** Registre d'heures par jour — par employé | https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-registreemploye-fr3.pdf | Feuille de temps diaria oficial (classe A/B/C por semana) — lo que los inspecteurs cruzan con el registre de paie |
| Registre d'heures — par période de paie | https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-registreperiodepaie-fr2.pdf | Variante: todos los empleados de un período en una hoja (códigos M/F/FT/V) |
| **[MES 1]** Bulletin de paie (modelo estático) | https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-bulletinpaye-fr-statique.pdf | Los 17 elementos obligatorios del art. 10.02 — checklist directo para validar la configuración de Desjardins |
| Bulletin de paie (interactivo) | https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-bulletinpaye-fr.pdf | Versión autocalculable (descargar antes de completar) |
| **[MES 1 si se banquean horas]** Formulaire d'étalement des heures 2026 | https://cpeep.qc.ca/wp-content/uploads/2026/03/8063-etalementhrs-fr-2026-2.pdf | Acuerdo escrito del empleado para el «étalement» (art. 3.01); acompaña el avis al comité ≥15 días ANTES — prerequisito de la banque d'heures (sección 6) |

### Fériés, maladie, départs

| Formulario | URL | Cuándo se usa |
|---|---|---|
| Guide des congés fériés | https://cpeep.qc.ca/wp-content/uploads/2021/09/cpeep-congesferies-fr.pdf | Gestión de fériés (permanent vs non-permanent, «jour de travail») |
| Calcul de congés fériés | https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-calculferies-fr.pdf | Hoja de cálculo de la indemnité (1/20) |
| Entente de report d'un congé férié | https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-ententecongeferie-fr.pdf | Acuerdo escrito OBLIGATORIO antes de reportar un férié ±8 semanas (sin él, el report es inválido) |
| Guide de crédit d'heures maladie | https://cpeep.qc.ca/wp-content/uploads/2025/10/cpeep-creditsheuresmaladie-fr.pdf | La banque de maladie (2,44%) y su liquidación anual |
| Calcul de l'excédent maladie (2025) | https://cpeep.qc.ca/wp-content/uploads/2025/01/8063-credithrsmaladie-fr-2025-f.pdf | Cálculo al 31-oct; copia a empleado Y comité antes del 30-nov; pago antes del 10-déc |
| Exemple de préavis écrit | https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-preavisdepart-fr.pdf | Plantilla del préavis de fin de empleo (cap. 13) — el inspector SIEMPRE pide copias de los préavis |

### REER (detalle en sección 5)

| Formulario | URL | Cuándo se usa |
|---|---|---|
| Formulaire d'adhésion REER — dinámico VIGENTE (2023) | https://cpeep.qc.ca/wp-content/uploads/2023/03/cpeep-formulaire-dadhesion-15383-formulaire-dynamique.pdf | Adhesión del salarié al llegar a la permanence (280 h). Es la versión que `/fr/reer` enlaza hoy |
| Formulaire d'adhésion REER 2022 (anterior) | https://cpeep.qc.ca/wp-content/uploads/2022/01/cpeepadhesion15383-fr.pdf | Archivado; usar el dinámico 2023 |
| Désignation de bénéficiaire (2023) | https://cpeep.qc.ca/wp-content/uploads/2023/03/cpeep-formulaire-beneficiaire-15383-formulaire-dynamique.pdf | Beneficiario del REER en caso de fallecimiento (opcional) |
| Guide «Comment adhérer» (2022, vigente) | https://cpeep.qc.ca/wp-content/uploads/2022/05/comment-adherer-fr.pdf | Guía visual para el salarié (la copia 2021 scrapeada salió corrupta — usar esta) |
| Autorisation de déduction à la source | https://cpeep.qc.ca/wp-content/uploads/2021/10/formulaire-autorisation-1.pdf | Contribuciones REER voluntarias del empleado (se archiva en su dossier) |
| Liste contributions volontaires — interactivo 2025 | https://cpeep.qc.ca/wp-content/uploads/2025/05/form-contrib-volontaire-interactif-2025.pdf | Detalle mensual que acompaña el cheque separado de voluntarias |
| Liste contributions volontaires — imprimible 2025 | https://cpeep.qc.ca/wp-content/uploads/2025/05/form-contribution-volontaire-2025.pdf | Versión imprimible |
| Demande de retrait REER — consignes (doc 1/2) | https://cpeep.qc.ca/wp-content/uploads/2021/12/demande-de-retrait-reer-consignes-doc-1-de-2.pdf | Instrucciones de la carta de 9 elementos para retiros |
| Demande de retrait REER — formulaire (doc 2/2) | https://cpeep.qc.ca/wp-content/uploads/2021/12/demande-retrait-reer-formulaire-francais-doc-2-de-2.pdf | Formulario de remboursement (también para salariés 71+ aún empleados) |
| Demande de retrait REER — general (2022) | https://cpeep.qc.ca/wp-content/uploads/2022/03/demande-retrait-reer-form-fr.pdf | Salariés que dejaron el sector con sumas no transferidas al fiduciaire |
| Sommaire du régime 15383CM001 | https://cpeep.qc.ca/wp-content/uploads/2021/09/15383cm001-fr-cpeep.pdf | Resumen del régimen para entregar/explicar a empleados |
| «À qui ira votre argent à votre décès?» | https://cpeep.qc.ca/wp-content/uploads/2022/05/a-qui-ira-votre-argent.pdf | Folleto sobre designación de beneficiario |

### Recursos y guías del rol

| Formulario | URL | Cuándo se usa |
|---|---|---|
| **[MES 1]** Guide de l'employeur (à jour mars 2026) | https://cpeep.qc.ca/wp-content/uploads/2026/07/guide-employeur-fr.pdf | Guía integral vigente — referencia primaria del rol conformité |
| Guide de l'employé(e) (2026-07) | https://cpeep.qc.ca/wp-content/uploads/2026/07/guide-employe-fr.pdf | Entregar al personal de DSS en el alta |
| Formulaire de demande de révision | https://cpeep.qc.ca/wp-content/uploads/2023/09/formulaire-demande-de-revision.pdf | Pedir revisión de una decisión de un inspecteur DENTRO DE 30 DÍAS (a info@, atención directrice générale; respuesta escrita en 30 días) — el recurso administrativo previo a la cour |
| Formulaire de plainte (contra el CPEEP) | https://cpeep.qc.ca/wp-content/uploads/2021/09/formulaire-plainte.pdf | Queja formal sobre la actuación del personal del comité (a Caroline Paré, cpare@cpeep.qc.ca) |
| Changement d'adresse (salariés, web) | https://cpeep.qc.ca/fr/changement-dadresse | El empleado actualiza su dirección directo ante el CPEEP (3 primeros dígitos del NAS; opción en español) — dar el enlace a cada empleado al contratarlo |
| Retenues sur la paie (comunicado) | https://cpeep.qc.ca/wp-content/uploads/2022/01/retenues-sur-la-paie.pdf | Prohibido descontar por daños/bris sin autorización escrita del empleado |
| Décret maj 10-jul-2026 (PDF) | https://cpeep.qc.ca/wp-content/uploads/2026/07/nouveau-decret-et-annexes-fr-maj-10-juillet-2026.pdf | Copia archivable del texto vigente |
| Projet règlement congés mobiles (30-jun-2026) | https://cpeep.qc.ca/wp-content/uploads/2026/06/reglement-modifiant-le-decret-conges-mobiles-30-juin-2026.pdf | Vigilar — entrada prevista 2027-01-01 |
| Règl. modif. rapport mensuel «retrait DDN» | https://cpeep.qc.ca/wp-content/uploads/2026/04/regl-modif-regl-sur-rm-retrait-ddn-08042026.pdf | Base legal del retiro de la DDN del rapport (D. 540-2026) |

Nota: el «avis écrit d'étalement» al comité y el formulaire de paiements préautorisés no tienen PDF público — el primero es carta libre (o acompaña el formulario de étalement), el segundo lo envía el comité tras recibir el spécimen de chèque.

---

## 4. Interprétation et jurisprudence — lo que el comité mismo dice

El sitio publica doctrina oficial sección por sección del décret (`/fr/interpretation-et-jurisprudence-X-00`). Esto resuelve varias ambigüedades que el manual ordenaba «escalar»: ahora hay respuesta escrita del propio comité.

### Statut du travailleur: empleado vs contratista (página viva, mod. 2025-11-14)

**La regla de oro para contratar personal**: la definición de «salarié» del art. 1 j) LDCC es **de orden público y más amplia que la de cualquier otra ley** — el contrato escrito o verbal NO determina el estatuto, solo los hechos. «Un travailleur autonome à l'emploi d'un entrepreneur en entretien ménager sera généralement considéré comme un salarié au sens de la LDCC et du décret» — aunque facture, tenga TPS/TVQ, ponga sus horarios o cobre «à forfait». Jurisprudencia de cierre: **Modern Concept d'entretien c. CPEEP région de Québec, 2019 CSC 28 (Cour suprême)**.

El criterio decisivo del verdadero «entrepreneur indépendant» (sous-traitant real): «la capacité d'organiser son entreprise dans un but de profits, c'est-à-dire l'acceptation et la rémunération du risque». Los 4 criterios principales del comité:
1. ¿Depende económicamente de su donneur d'ouvrage?
2. ¿Puede negociar directamente con los clientes?
3. ¿Especula con mano de obra (tiene sus propios salariés)?
4. ¿Es realmente autónomo en la gestión administrativa (facturación, precios)?

Más 6 indicios secundarios (quién provee y elige productos/equipos, métodos, expertise específica). **Son cumulativos y no exhaustivos, y «seule une vérification par le Comité paritaire peut confirmer le statut»** — el comité acepta consultas ANÓNIMAS antes de otorgar un subcontrato.

**Consecuencia práctica para DSS**: la exclusión del «artisan» (art. 2.03) se evalúa contrato por contrato y **se pierde en cuanto hay un intermediario que retira ganancia** (doctrina de los «pseudo artisans»: Salibec C.A. 1993, Diplomate 1993). DSS, siendo subcontratista de GDI/Ménagez-Vous, NO puede pagar cuadrillas «autónomas» a forfait para eludir el décret — ese esquema exacto es el que los tribunales desmontan. Crítico al contratar ex-empleados de QCM: nunca estructurarlos como autónomos.

### Alcance del «travail d'entretien» (1-00 / 2-00)

- Cubierto: oficinas, fábricas, clubes privados, roulottes de obra, limpieza post-sinistre, «commis débarrasseurs» de foires alimentaires, sanitización en usine (Drake, C.A. 2009), tournée de papel/jabón.
- NO cubierto: entretien «accessoire, sporadique et accidentel» (Sogemail 1983) — pero si es recurrente (ej. 2 h cada noche), **esas horas SÍ se assujettissent aunque sean minoría de la jornada** (Potash, CSC: assujettissement parcial posible). El «déchiquetage» de papel no está cubierto.
- «Agence de placement» (art. 1.01 h): quien paga y puede despedir al empleado colocado es el «employeur professionnel» obligado a los rapports — no el sitio donde trabaja. Empresas hermanas usadas como subterfugio: las horas se SUMAN para el temps supplémentaire (Alliance sécurité, C.A. 1981).

### Las interpretaciones más útiles por capítulo

- **Étalement (3-00)**: aun con entente firmada, el registre de paie y el rapport declaran las **horas REALES por semana** (60/20/60/20, no 40/40/40/40) — solo el PAGO se promedia. Temps supplémentaire con varios taux: método del «taux moyen» ponderado de la semana (incluye horas no assujetties en la base). El férié chômé cuenta para el umbral de 40 h; el férié trabajado no cuenta pero se paga +50%.
- **Pauses (4-00)**: la pausa es «monnayable» — si no se otorga o no se paga, el comité reclama el equivalente; **NO puede reemplazarse por salida anticipada ni con acuerdo del empleado**.
- **Fériés (7-00)**: la fecha de un turno nocturno la determina la HORA DE INICIO del turno (crítico para contratos nocturnos tipo IKEA); método «5 de los últimos 8» para horarios irregulares (confirmado por tribunales y usado por los inspecteurs); el report exige entente ÉCRITE con carga de la prueba sobre el empleador (Lyna 1995); los bloques 24-25-26 dic y 31 dic-1-2 ene se analizan en bloque; la Saint-Jean-Baptiste tiene congé compensatoire el día hábil anterior o siguiente al 24-jun (no se mueve 8 semanas); un congé pagado de más es una «libéralité» irrecuperable.
- **Vacances (8-00)**: pagar el 6-12% «incluido en el salario» o en cada paie es INFRACCIÓN al art. 8.05 (poursuite pénale posible) y el comité puede ignorar esos pagos y reclamar la indemnité completa — un taux «tout inclus» superior al décret no purga nada. «Vacances sur vacances»: la paie de vacances anterior Y la contribución REER patronal entran en el «salaire total gagné». Fin de empleo: cálculo en 2 etapas (ej.: $30.000×6% = $1.800, más $1.800×6% = $108).
- **Maladie (12-00, actualizada 2026-03-06)**: el derecho al excédent se ADQUIERE el 31-oct (salida definitiva antes = sin derecho; mise à pied sin relevé d'emploi = con derecho); el 2,44% no se calcula sobre montos CNESST ni los 14 días post-accidente; el excédent pagado antes del 10-déc es «gain» que entra en la base de vacances; prohibido exigir certificado médico en las 3 primeras ausencias de ≤3 días consecutivos por período de 12 meses (y si se exige, reembolsar su costo).
- **Préavis (13-00)**: política administrativa declarada — **en TODA inspección se piden copias de los préavis de cada mise à pied** (crear carpeta «préavis» con acuse desde el día 1). Recorte de horas ≥33% exige préavis («congédiement déguisé»); decir «no hay más trabajo por ahora» YA es una mise à pied; **perder el contrato con el cliente NO es «cas fortuit»** — si Ménagez-Vous/GDI cancela, DSS igual debe préavis o indemnité a sus empleados (presupuestar ese pasivo contingente en cada contrato); el día del aviso no cuenta y el aviso postal corre desde la recepción.
- **Service continu (1-00/8-00)**: una sola fecha de embauche por empresa aunque cambie de funciones; transferencia a empresa hermana en el MISMO sitio sin interrupción → **se transfieren fecha de ingreso y TODOS los beneficios**. Directamente relevante al riesgo de sucesión QCM→DSS del manual (§5.0): contratar ex-QCM en el mismo edificio y sin pausa consolida la continuidad; sitios distintos con interrupción documentada la reducen. Maladie/maternité/CSST/congé sans solde no interrumpen el service continu.
- **Inspecciones (obligations du comité / déclaration de services)**: el inspector puede exigir «conciliations bancaires», cheques recto/verso y «journal des déboursés»; no cabe oponer la Charte (Potash, CSC 1994) ni la ley de protección de datos; no se lo puede confinar a la cafetería (Cuisirama 1991). Montar la contabilidad para que esos documentos estén siempre entregables.
- **Prescripción (Loi, art. 28)** — el argumento definitivo de la cultura de registre impecable: con registre limpio, la acción civil prescribe en 1 AÑO desde cada échéance; con inscripciones falsas o «remises clandestines», corre desde que el comité CONOCE el fraude — exposición ilimitada hacia atrás (así se explica la réclamation de 2021 sobre hechos viejos).

---

## 5. REER: adhesión y retiro según las fuentes oficiales

Datos duros que no estaban en el manual y sin los cuales los trámites rebotan:

- **Número del régimen: «15383CM001TP»** (contrat 15383-CM, division 001, classe 01 — «REER collectif du personnel d'entretien d'édifices publics région de Montréal»). Se inscribe en cada formulaire d'adhésion.
- **Fiduciaire: IA Groupe Financier (Industrielle Alliance)** desde 2014 — 1 800 567-5670 (L-V 8h-20h ET), pension@ia.ca, fax 1 800 786-6065.
- **Buzones especializados del CPEEP**: adhesionsreer@cpeep.qc.ca (formulaires d'adhésion) y remboursementREER@cpeep.qc.ca (retiros).
- **«Heure payée»** para el REER: toda hora regular, suplementaria, fériée, de maladie (incluido el excédent), congés mobiles y ajustes — se excluyen SOLO los montos de vacances y de départ, aunque la nómina los convierta en horas.
- La contribución REER patronal es **«gain» del salarié**: entra en la base del prélèvement (1%) y de la paie de vacances (ya estaba en el manual — confirmado).

### Adhesión (al llegar el salarié a las 280 h)

1. **Vía rápida (recomendar a cada salarié)**: autoadhesión en línea en **ia.ca/monadhesion** con el número 15383CM001TP (régimen precargado, datos personales con NAS + DDN, consentimiento electrónico, firma) — o por teléfono al 1 800 567-5670. Mucho más rápido que el papel.
2. Circuito papel: formulaire dinámico 2023 firmado por el salarié («Pour être valide, votre formulaire d'adhésion doit être signé») + désignation de bénéficiaire si aplica → transmitir con el rapport mensuel o a adhesionsreer@cpeep.qc.ca (o directo a IA). El salarié recibe por correo postal la confirmación y las credenciales del Espace client de IA.
3. Plazos del décret (arts. 6.102-6.105, verificados contra el texto vigente): el formulaire se hace firmar **«dès l'acquisition de la permanence»** y se transmite a más tardar el 15 del mes siguiente; el empleador contribuye ADEMÁS **retroactivamente por las horas pagadas durante la adquisición del estatus** (art. 6.102 al. 3) — el retro de ~$56 (280 × $0,20) que presupuesta el manual es correcto. (Un blurb de `/fr/employeur` dice «à l'embauche», pero es texto de 2021; el décret vigente prevalece. Hacer firmar al alta es más simple administrativamente, pero no es lo exigido.)

### Salariés de 71+ años

La ley fiscal les prohíbe cotizar REER. El décret obliga a **AÑADIR el taux REER ($0,20/h) a su taux horaire** desde su cumpleaños (si es permanent) y reajustarlo en cada aumento. En el Portail: grille du salarié → «AJUSTEMENTS» → campo «HEURES» con las horas en NEGATIVO (ej. -30) para anular el cálculo REER. Se declaran en el rapport como cualquier otro. Pueden pedir remboursement aun estando empleados.

### Contribuciones voluntarias del empleado

Requieren: adhesión previa + «lettre d'autorisation» de déduction à la source firmada (archivada en el dossier del empleado) + lista mensual por salarié (modelo 2025) + **cheque SEPARADO** de la contribución patronal, con el rapport. Contactar al comité antes de empezar.

### Retiro (ex-empleados que dejan el sector)

Carta «A/S Demande de retrait REER» a info@cpeep.qc.ca con 9 elementos obligatorios: fecha; nombre/dirección/teléfono; NAS; último empleador; motivo del fin de empleo; copia de la cessation d'emploi (relevé); si sigue o no en entretien; razón del retiro; firma. El coordinador de DSS la recibirá de ex-empleados — reenviar la consigne, no gestionarla por ellos.

Respuesta lista para la pregunta más frecuente: IA emite los recibos fiscales 2 veces al año (inicio enero y marzo); las contribuciones de diciembre llegan al CPEEP recién desde el 15 de enero, así que **pueden no aparecer en el relevé de los primeros 60 días** — no es un error.

---

## 6. Correcciones al paquete y novedades top

### 6.1 Correcciones confirmadas al 01-Manual (verificadas contra el texto vigente)

1. **Fériés — números exactos** (§3 decía «~11-12»): 10 «congés fériés, chômés et payés» para el salarié permanent con menos de 1 año de «service continu», **12** con 1 año o más (art. 7.01); **8** para los non-permanents con indemnité de 1/20 sin heures supplémentaires (art. 7.07.1). Nota práctica: todo el personal nuevo de DSS será non-permanent sus primeras ~280 h → 8 fériés.
2. **Calendario de maladie — falta el 31-oct y la copia al CPEEP va con el aviso, no con el pago** (art. 12.02): 31-oct cierre del cálculo → 30-nov aviso escrito a cada empleado CON copia al Comité paritaire (total de horas, máximo acumulable, monto pagable) → 10-déc pago de las heures excédentaires.
3. **Banque d'heures — el documento firmado NO basta** (art. 3.01): el «étalement» exige además beneficio compensatorio, base máxima de 4 semanas con promedio 40 h, ninguna semana >50 h, y un **«avis écrit» al Comité paritaire ≥15 días ANTES** de aplicarlo (formulario 2026). Sin el avis, cada excedente semanal es exigible como heure supplémentaire al +50%. Y el registre + rapport declaran las horas REALES — solo el pago se promedia. **Acción DSS: transmitir el avis antes de banquear la primera hora heredando la práctica GDI/QCM.**
4. **Vacances — el 30-abr no es fecha de pago** (art. 8.05, mod. D. 200-2026): el 30-abr cierra la année de référence; la paie de vacances se debe en un solo versement ANTES de la salida en vacaciones de cada empleado o, a elección del salarié, con sus paies regulares. Prohibido diluirla «incluida en el salario».
5. **Portail — el comité emite solo el «nom d'utilisateur»** (§2 acción 6): la contraseña es autoservicio en la primera conexión vía «Mot de passe oublié?» (ver sección 2).
6. **La «date de naissance» ya no es campo mensual del rapport** (D. 540-2026, en vigor abril 2026): se captura al alta del empleado y se transmite una sola vez con el primer rapport donde aparece (art. 6.106).
7. **Multas — no citar el art. 38 para «cada mes = infracción distinta»**: el art. 38 solo fija la multa residual $50-200 (recidiva $200-500) sin esa cláusula; el efecto por mes es real pero viene de que cada rapport no transmitido es un incumplimiento separado del Règlement sur le rapport mensuel.
8. **Efectivo — matizar la cita del art. 10.01**: el texto vigente admite «sous enveloppe scellée, par chèque ou par virement bancaire»; el décret no prohíbe literalmente el efectivo — el CPEEP rechazó los pagos cash de QCM por falta de trazabilidad. La política DSS «solo cheque/virement» es correcta como política interna; no atribuirla al texto del 10.01.

Dos falsas alarmas descartadas en la verificación (el manual tenía razón): el formulaire d'adhésion REER se firma «dès l'acquisition de la permanence» (no al alta) con transmisión antes del 15 del mes siguiente, y el retro de ~$56 por las primeras 280 h está expresamente ordenado por el art. 6.102 al. 3.

### 6.2 Novedades top del harvest (no estaban en el paquete)

- **El Portail borra historial**: solo conserva 15 rapports — PDF inmediato tras cada «Envoyer» (sección 2, paso 18).
- **Continuidad de fechas**: la «Semaine 1» de cada rapport termina exactamente 7 días después de la última semana del anterior; con paie quincenal, rapports de 4 o 6 semanas, nunca 5. La primera fecha de agosto-2026 fija toda la serie.
- **Mes sin actividad y «rapport amendé»**: procedimientos exactos en sección 2 (pasos 19-20). Nunca suspender rapports sin hablar con un inspecteur.
- **Statut de travailleur**: los 4 criterios + 6 indicios oficiales y la prohibición práctica de sub-subcontratar individuos (sección 4) — resuelve la duda que el manual mandaba escalar.
- **Service continu y ex-QCM**: mismo sitio sin interrupción = se transfieren fecha y beneficios (sección 4).
- **Horas pagables que una nómina nueva omite** (arts. 3.04-3.08): espera a que abran el edificio, desplazamiento entre contratos a pedido del empleador, espera de asignación, période d'essai/formación, preparación de material; «rappel au travail» = +50% con mínimo 4 h. Pausas (art. 4.03): 1×15 min pagada (turno 3 a <7 h), 2×15 min (≥7 h), +15 min por bloque de 3 h extra; pausa de comida pagada si no puede dejar el puesto o el turno es ≥12 h.
- **Exención fiscal**: la masse salariale sujeta al décret está EXENTA de la cotisation CNESST «normes du travail» ante Revenu Québec (ya paga el prélèvement); la cotización santé-sécurité sí sigue. Configurarlo en Desjardins para no cotizar doble.
- **«Demande de révision»**: recurso escrito contra decisiones de un inspecteur dentro de 30 días (formulario en sección 3) — la vía administrativa antes de la cour, sin quemar la relación.
- **Palanca comercial**: el comité recibe denuncias de «concurrence déloyale» DE empleadores contra competidores que pagan por debajo del décret (inspecteur@cpeep.qc.ca) — legítima si DSS pierde licitaciones contra incumplidores.
- **Contactos nuevos**: Caroline Paré (directrice générale, cpare@cpeep.qc.ca), Nathalie Kalipci (coordonnatrice service administratif, nkalipci@cpeep.qc.ca), Steve Girard como directeur du service d'enquêtes, Mathieu Perreault como chef de l'inspection. Compromisos de servicio del comité: teléfono al día hábil siguiente, courriel en ≤5 jours ouvrables (coincide con el estándar del manual).
- **Dossier CNESST paralelo**: NO firmar un règlement con la CNESST sin asegurar que todas las partes (incluido el comité) lo acepten — la una no puede cerrar el dossier de la otra.
- **Prohibido con multa** (arts. 30-31 Loi): represaliar a un empleado por informar o quejarse ante el comité — $200-3.000 + daños punitivos de 3 meses de salario. Incluirlo en la formación de supervisores.

---

## 7. Páginas en español del comité y herramientas para empleados

### El sitio en español

Existen **17 páginas bajo `/es/`** (empleadores, empleados, reporte-mensual, el-decreto, reer, quejas, cambios-de-direccion, contactenos, tarifa-de-reclamaciones, declaracion-de-servicio, territorio, historia, etc.). La joya es **`/es/empleadores`** (actualizada 2026-07-21): guía completa VIGENTE con tasas 2026 y FAQ extensa en español sobre salario, feriados, enfermedad, vacaciones, indemnité de départ, preaviso y subcontratos.

**Límite claro**: es bilingüe a medias — las secciones técnicas y casi todo `/es/reporte-mensual` están en francés, y TODOS los formularios y guías PDF son en francés. Sirve de puente para un coordinador hispanohablante en formación (semanas 1-2 del plan del documento 03); no sustituye el francés escrito del perfil. El CPEEP declara además «possibilité de service en espagnol» por teléfono y en oficina — útil para los empleados de DSS.

### Herramientas para empleados

- **«Le Compt'Heures» ya NO existe**: la página devuelve 404 y la infolettre employés de enero-2025 confirma que el CPEEP «a cessé d'offrir l'application». La herramienta oficial recomendada para que el empleado registre sus horas es ahora **«maPaye» de la CNESST** (https://www.cnesst.gouv.qc.ca/fr/mapaye). Sugerirla al personal de DSS: refuerza la cultura de registro y protege a ambas partes.
- **Changement d'adresse en línea** (https://cpeep.qc.ca/fr/changement-dadresse, con opción en español): dar el enlace a cada empleado al contratarlo — así el CPEEP les hace llegar remboursements y avisos sin pasar por la empresa.
- **Guide de l'employé(e) 2026** (URL en sección 3): entregar en el alta.
- Los canales oficiales de aviso de cambios de taux: la **infolettre** (formulario al pie de todas las páginas — suscribir el buzón de rol) y **facebook.com/CPEEPMTL**. Los taux entran en vigor el mismo día del anuncio.

---

## Fuentes: todo lo cosechado (scrape 2026-08-04, archivado en `fuentes-oficiales/`)

### Páginas vivas (HTML)

- https://cpeep.qc.ca/fr/employeur
- https://cpeep.qc.ca/fr/rapport-mensuel
- https://cpeep.qc.ca/fr/reer
- https://cpeep.qc.ca/fr/decret
- https://cpeep.qc.ca/fr/reglementations-lois
- https://cpeep.qc.ca/fr/nouveau-decret (communiqué de archivo, 2021)
- https://cpeep.qc.ca/fr/territoire-geographique
- https://cpeep.qc.ca/fr/criteres-utilises-pour-determiner-le-statut-dun-travailleur
- https://cpeep.qc.ca/fr/interpretation-et-jurisprudence-les-obligations-du-comite-paritaire
- https://cpeep.qc.ca/fr/decret/interpretation-et-jurisprudence-1-00
- https://cpeep.qc.ca/fr/interpretation-et-jurisprudence-2-00 · -3-00 · -4-00 · -7-00 · -8-00 · -9-00 · -10-00 · -12-00 · -13-00
- https://cpeep.qc.ca/fr/articles
- https://cpeep.qc.ca/fr/category/infolettre (vacía) · /fr/category/communiques (redirige a «Avis importants») · /fr/category/nouvelles (vacía)
- https://cpeep.qc.ca/fr/paiement-des-conges-annuels-vacances
- https://cpeep.qc.ca/fr/le-comptheures-compiler-vos-heures (404 — app discontinuada ene-2025)
- https://cpeep.qc.ca/fr/nous-joindre
- https://cpeep.qc.ca/fr/changement-dadresse
- https://cpeep.qc.ca/fr/plaintes
- https://cpeep.qc.ca/fr/declaration-de-services
- https://cpeep.qc.ca/fr/infolettres-recentes-pour-employeurs-et-employes/
- https://cpeep.qc.ca/fr/nouveau-decret-en-vigueur/
- https://cpeep.qc.ca/fr/entree-en-vigueur-dune-modification-au-reglement-sur-le-rapport-mensuel/
- https://cpeep.qc.ca/es/empleadores
- https://cpeep.qc.ca/es/reporte-mensual
- https://mailchi.mp/cpeep.qc.ca/z38a96f49k (infolettre employés ene-2025)

### PDFs oficiales (los de `/uploads/2021-2022/`: procedimiento válido, taux posiblemente caducos)

- https://cpeep.qc.ca/wp-content/uploads/2026/05/rapport-mensuel-recto-2026.pdf
- https://cpeep.qc.ca/wp-content/uploads/2026/05/rapport-mensuel-verso-2026.pdf
- https://cpeep.qc.ca/wp-content/uploads/2025/10/guide-du-portail-cpeep-employeurs-et-comptables-fr-final-26-sept-2024.pdf
- https://cpeep.qc.ca/wp-content/uploads/2021/09/fr-guide-employeur.pdf (superado por el de 2026)
- https://cpeep.qc.ca/wp-content/uploads/2021/09/fr-guide-employe.pdf (superado por el de 2026)
- https://cpeep.qc.ca/wp-content/uploads/2021/09/instructions-rm.pdf (superado por el verso 2026)
- https://cpeep.qc.ca/wp-content/uploads/2021/12/formulaire-procuration-fr.pdf (superado por A2024)
- https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-registreemploye-fr3.pdf
- https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-registreperiodepaie-fr2.pdf
- https://cpeep.qc.ca/wp-content/uploads/2021/09/8063-bulletinpaye-fr-statique.pdf
- https://cpeep.qc.ca/wp-content/uploads/2022/01/cpeepadhesion15383-fr.pdf
- https://cpeep.qc.ca/wp-content/uploads/2021/09/comment-adherer-fr.pdf (texto corrupto — versión canónica: uploads/2022/05)
- https://cpeep.qc.ca/wp-content/uploads/2021/12/demande-de-retrait-reer-consignes-doc-1-de-2.pdf
- https://cpeep.qc.ca/wp-content/uploads/2021/09/fr-loi.pdf (consolidación 2001 — usar la 2023)
- https://cpeep.qc.ca/wp-content/uploads/2023/06/loi-cc-fr-1.pdf (Loi «à jour au 1er avril 2023», versión corriente del sitio)

*Los binarios de los PDFs clave están en `fuentes-oficiales/pdf/`. Documentos hermanos: [01-Manual](01-Manual-Onboarding-Comite-CPEEP.md) · [02-Rutas-de-Automatizacion](02-Rutas-de-Automatizacion.md) · [03-Plan-de-Formacion](03-Plan-de-Formacion.md) · [04-Salario-y-Rol-de-David](04-Salario-y-Rol-de-David.md) · [05-Anexo-Historia](05-Anexo-Historia-2019-2024.md).*


# DOCUMENTO 8 — DSS - CPEEP Onboarding and Delegation Plan

---
type: project
project: dss-multiservices
status: active
created: 2026-08-03
updated: 2026-08-03
---

# DSS - CPEEP Onboarding and Delegation Plan

## Purpose

Train a new administrative coordinator with no prior CPEEP experience to operate DSS Multiservices' routine Comité paritaire de l'entretien d'édifices publics (CPEEP) obligations safely, while reserving owner decisions and exceptional-risk matters for [[David Salazar]].

This is an operating draft, not legal advice. For an interpretation of the decree, an amended report, an audit, a claim, or a settlement, the coordinator must obtain written instructions from CPEEP and escalate to David and the appropriate payroll/legal professional.

## Evidence used

This plan is based on:

- DSS's live CPEEP dossier #39454 and the complete 2026-07-16 request from inspector Marie-Joelle Hurtubise;
- DSS's live mailbox and current company records summarized in [[Institucional DSS]] and [[DSS Multiservices]];
- the historical QC Maintenance archive in Kaku, including 2025-2026 monthly-report, reconciliation, random-control, proof-of-remittance, banked-hours, Aramis/portal, CNESST, and legal-claim correspondence;
- the current CPEEP employer guide, portal guide, monthly-report instructions, and the official Quebec decree;
- Quebec wage benchmarks for administrative officers, payroll administrators, and comparable administrative/compliance work.

The QC Maintenance material is a lessons-learned corpus, not DSS's file. Never copy QCM employee records, payments, disputes, or confidential documents into DSS's CPEEP submission.

## Executive recommendation

DSS can delegate 80% or more of normal CPEEP administration, but it should not try to automate or delegate 100% of accountability.

Recommended operating model:

- Hire or assign a bilingual payroll/compliance coordinator at CAD 30-34 per hour.
- Start part-time at 12-20 hours per month for CPEEP-only work while DSS is small.
- Do not hire an 80%-FTE employee solely for CPEEP at the current scale. An 80%-FTE role is justified only if it also owns payroll administration, employee files, CNESST follow-up, subcontractor compliance, and related operations administration.
- During the first 90 days, target an 80/20 split: coordinator 12 hours and David 3 hours in a 15-hour operating month.
- After three clean cycles, target an 87.5/12.5 split: coordinator 10.5 hours and David 1.5 hours in a 12-hour normal month.
- Keep David's approval mandatory for payments, material corrections, unclear employee classifications, amendments, audits, claims, settlements, and any statement that changes the company's legal or financial position.

## What the role owns

### Coordinator owns in a normal month

1. Maintain the CPEEP calendar and deadline checklist.
2. Maintain the employee master file and secure supporting records.
3. Collect approved time records and payroll outputs.
4. Reconcile hours, classes, pay, premiums, holidays, sickness, vacation, departures, and adjustments.
5. Track each employee's progress toward permanent status at 280 hours.
6. Prepare the monthly CPEEP report and payment calculation.
7. Prepare a one-page review package for David.
8. Submit only after the required approval and delegated authority are documented.
9. Save the submission proof, report copy, payment proof, and correspondence.
10. Answer routine document requests using approved facts and templates.
11. Reconcile any prime-contractor compliance package against the CPEEP filing.
12. Escalate exceptions instead of guessing.

### David owns

1. Confirming the true start of operations, active contracts, and who actually performed cleaning work.
2. Approving company policy when work-classification or compensation treatment is unclear.
3. Approving the monthly payment and any debit authorization.
4. Signing the contact/procuration form or other owner-only authorization.
5. Approving material corrections or amended reports.
6. Responding to audits, claims, repayment plans, settlements, or legal correspondence.
7. Confirming facts that exist only in his operational knowledge.
8. Choosing external payroll, accounting, or legal advisers.

## Current DSS action: dossier #39454

The 2026-07-16 CPEEP request is not an unusual demand for 12 months from a new company. It expressly asks for 12 months, or the shorter period since operations began.

Before replying, the coordinator must confirm with David the exact operating start and whether anyone performed cleaning work before the first formal payroll. David previously corrected the project start date to 2026-07-01.

Prepare a secure package containing only DSS records:

1. A complete copy of every invoice issued since the beginning of operations.
2. The payroll register since the first cleaner was hired.
3. If no payroll register existed for part of that period, complete proof of every payment made to each person who performed cleaning work, including Interac or cheque proof as applicable.
4. Complete contact information for every person who performed cleaning work: address, telephone, and email.
5. A short cover note stating the confirmed operating start date and the period covered.
6. A package index listing every attached document.

Do not put employee SINs, addresses, payment proofs, or other payroll-level PII in Kaku. Store the package in DSS's approved secure document location and record only status, owner, deadline, and outcome in Kaku.

## Monthly operating calendar

The report for the previous month is due on or before the 15th.

### Continuous / at each change

- New cleaner: collect the employee master data, date of birth, hire date, contact details, class or classes, and payroll setup before first payment.
- New site or contract: record address, start date, client/prime, work classes, schedule, and time-record source.
- Departure or leave: record last day, reason, final pay, vacation/departure treatment, and whether the employee remains active.
- Time records: require weekly approval by the operations owner. Do not wait until the report deadline.

### Days 1-3

- Close the prior month's time records.
- Export the payroll register and employee list from the payroll/accounting system.
- Collect any prime-contractor hour reports.
- Check for new hires, departures, no-gain employees, and missing records.

### Days 4-7

- Reconcile employee-by-employee hours to payroll.
- Separate Class A, B, and C hours; never use an averaged rate where separate rates are required.
- Check overtime, paid holidays, worked holidays, night premiums, sickness, vacation, departure pay, and adjustments.
- Update 280-hour permanent-status tracking.
- Investigate variances with the operations owner.

### Days 8-10

- Create or update the monthly report in the CPEEP portal.
- Enter weekly hours and monthly gross pay per employee.
- Calculate and validate the REER contribution.
- Validate the levy: the current CPEEP material describes 1% of payroll including the REER amount, split between 0.5% employer and 0.5% employee.
- Prepare two payment amounts where the selected method requires distinct REER and levy payments.
- Save a draft report and run the QA checklist.

### Days 11-12: David review window

Send David a one-page approval package containing:

- report month and reporting-period dates;
- employee count and changes from last month;
- total hours by class;
- total gross payroll;
- REER amount;
- levy amount;
- total payment to authorize;
- every variance, assumption, correction, or missing record;
- coordinator recommendation: approve, approve after correction, or escalate.

David's target review time is 30 minutes in a clean month.

### Days 13-14

- Apply approved corrections.
- Obtain final payment authorization.
- Submit the report before the 15th rather than on the deadline.
- Save the portal submission date as proof.
- Execute or route the two payments according to the approved method.

### Day 15

- Deadline control: verify report status is sent and payment status is complete.
- If either is incomplete, escalate to David immediately with the exact blocker and the smallest safe next action.

### Days 16-20

- Save the final report, proof of submission, and payment proof.
- Send any required proof to a prime contractor after approval.
- Reconcile CPEEP or prime-contractor questions.
- Record only durable status and open loops in Kaku.

## Normal-month QA checklist

A reviewer should be able to answer yes to every item:

- Reporting dates continue exactly from the previous report.
- Every person who performed covered cleaning work is included.
- No person from another company is included by mistake.
- Weekly hours agree with approved time records.
- Monthly hours agree with payroll.
- Work classes are separated correctly.
- Overtime and holiday treatment is correct.
- Night premium is included where applicable.
- Permanent-status tracking is current.
- Date of birth was transmitted when the employee first appeared.
- No-gain, leave, vacation, and departure statuses are correct.
- REER and levy calculations tie to the report.
- Payment amounts match the approved report.
- David approved all exceptions and the payment.
- Submission proof and payment proof are archived.
- Any package sent to a prime contractor agrees with the CPEEP report.

## Exception matrix

| Situation | Coordinator action | David involvement |
|---|---|---|
| Clean normal report | Prepare, reconcile, present approval package | 30-minute review plus 15-minute payment approval |
| Missing time or payroll record | Chase source; identify exact gap | Confirm fact only if operations cannot resolve it |
| Class A/B/C ambiguity | Prepare task description and likely treatment; do not guess | Decide with CPEEP/payroll advice if material |
| New employee | Create file and first-report checklist | No involvement unless worker status or compensation is unclear |
| New contract/site | Add to register and reporting map | Confirm commercial start and scope, about 10 minutes |
| Report amendment | Freeze normal workflow and contact CPEEP for written instructions | Mandatory approval, usually 30-60 minutes |
| Random control/audit | Build evidence index; preserve originals; identify gaps | Mandatory review, 1-3 hours depending on scope |
| Claim, legal demand, repayment plan, or settlement | Escalate immediately; no substantive reply without authority | Owner-led with counsel/accounting support |
| Payment discrepancy or insufficient funds | Do not submit a knowingly inconsistent payment | Decide funding/timing and approve communication |
| Prime contractor requests extra proof | Compare request to filed report; prepare response | Review only if it exposes a variance or commitment |
| Decree/rate change | Update controlled rate table and test next payroll/report | Approve implementation summary, about 20 minutes |

## What the QC Maintenance history teaches

The QCM archive shows the difference between a clean routine and a compliance spiral:

- Reports were repeatedly chased when not transmitted on time.
- Prime-contractor reconciliation required submission proof, remittance proof, and sometimes cheque recto/verso copies.
- Monthly conciliation regularly compared payroll/agency hours against reported CPEEP hours.
- Missing employees and large hour variances created corrective work.
- Random controls expanded into detailed supporting-document requests.
- Banked-hours and credit-hours calculations became a recurring source of disagreement.
- Rate changes required prompt payroll and report-template updates.
- Some compliance disputes eventually became claims, civil files, and payment arrangements.

The archive contains roughly 10-35 report-workflow emails per active month at QCM's scale, including reminders and reconciliation traffic. DSS should not copy that staffing level or process complexity, but it should copy the preventive controls: weekly source capture, one employee master, one monthly reconciliation, early filing, saved proof, and clear escalation.

## Automation routes

### Route 1 - Immediate, low-risk automation

Automate reminders and evidence organization without changing legal decisions:

- calendar reminders on days 1, 4, 8, 11, 13, and 15;
- secure folder structure and file-naming rules;
- checklist generation for each report month;
- automatic export reminders for payroll and approved time records;
- missing-document and duplicate detection;
- draft approval summary for David;
- draft routine emails, never automatic sends;
- immutable archive of report and payment proofs.

Expected effect: 20-30% less administrative time and materially fewer missed deadlines.

### Route 2 - QuickBooks/time-to-CPEEP staging workbook

Create a controlled staging workbook or database that imports:

- employee master data;
- weekly hours by class and site;
- payroll gross amounts;
- overtime, holiday, night, sickness, vacation, departure, and adjustment fields;
- permanent-status cumulative hours;
- calculated REER and levy totals;
- variance flags against payroll and prior month.

The system produces a human-reviewed CPEEP entry sheet and David approval package. It does not autonomously determine ambiguous classes or submit the report.

Expected effect: 50-70% less keying and arithmetic time after the data sources are stable.

### Route 3 - Controlled portal submission assistance

After at least three clean cycles:

- use browser-assisted entry or an approved electronic-file format;
- require a generated reconciliation hash/control total before submission;
- require human QA and David's payment approval;
- save the portal's sent date and final PDF automatically.

CPEEP states that electronic-file reporting is possible if the employer programs data to the Committee's required format. DSS should request the specification before building this route.

Expected effect: 70-85% of preparation and entry can be automated. Final accountability, exception judgment, and payment authority remain human.

### Never fully automate

- determining whether a worker is an employee or contractor;
- deciding the work class from ambiguous duties;
- amendments without CPEEP instructions;
- audit, claim, settlement, or legal responses;
- payment authorization;
- sending sensitive employee documents without a reviewed recipient and secure method;
- copying QCM data into DSS records.

## Training plan for a person with zero prior knowledge

Assumptions: functional written French, basic spreadsheet ability, and basic payroll literacy. If the learner lacks functional French or basic payroll knowledge, add separate training before granting independent responsibility.

### Stage 1 - Foundations: 12-16 hours

- CPEEP purpose, decree scope, covered work, and geography.
- Classes A, B, and C.
- Minimum rates, overtime, night premium, holidays, sickness, vacation, departure, and permanent status.
- Monthly report, REER, levy, deadline, and recordkeeping.
- Privacy and separation between DSS and QCM.

Exit test: classify sample work and explain the monthly obligation without notes.

### Stage 2 - Systems and data flow: 12-16 hours

- DSS employee master and secure file structure.
- Approved time source, payroll register, QuickBooks exports, and client/prime hour reports.
- CPEEP portal employee setup and report statuses.
- Payment and proof controls.

Exit test: produce a complete staging package from a sample payroll month.

### Stage 3 - Historical case exercises: 12-16 hours

Use redacted QCM examples to practice:

- a clean month;
- a missing employee;
- an hour variance;
- a rate change;
- a departure;
- a random-control request;
- a report amendment escalation.

Exit test: identify every exception and escalate rather than inventing an answer.

### Stage 4 - First live report, fully supervised: 10-15 hours

The learner prepares the full report. A knowledgeable reviewer checks every field. David approves the facts and payment.

### Stage 5 - Second and third cycles: 15-30 hours of supervised practice

- Second cycle: reviewer samples high-risk fields and all variances.
- Third cycle: reviewer checks totals, exceptions, and the approval package.

### Learning-time estimate

- Useful assistant: 20-25 learning hours.
- Able to prepare a report under full review: 45-60 hours and one live cycle.
- Able to operate a normal month with targeted review: 80-100 hours and three live cycles.
- Calendar time to reliable independence: about 10-12 weeks because monthly cycles cannot be compressed safely.

## Workload estimate by DSS scale

| Scale | Normal CPEEP workload | David normal involvement | Notes |
|---|---:|---:|---|
| 1-10 cleaners, 1-3 contracts | 8-15 hours/month | 1-1.5 hours/month | Likely initial DSS range after setup |
| 11-25 cleaners | 15-25 hours/month | 1.5-2 hours/month | More employee changes and reconciliation |
| 26-50 cleaners | 30-45 hours/month | 2-3 hours/month | Dedicated payroll/compliance capacity becomes reasonable |
| Audit, large variance, amendment, or claim | Add 4-20+ hours/event | Add 1-6+ hours/event | Owner and professional involvement rises with risk |

## David involvement calculation

### First 90 days

Assume 15 total CPEEP hours per month:

- Coordinator: 12 hours, 80%.
- David: 3 hours, 20%.

Use David's three hours as follows:

- 30 minutes early-month facts/changes review;
- 45 minutes report and exception review;
- 15 minutes payment authorization;
- 30 minutes post-submission or prime-contractor review;
- 60 minutes reserved for startup decisions, unclear classifications, and training feedback.

### Steady state after three clean reports

Assume 12 total CPEEP hours per month:

- Coordinator: 10.5 hours, 87.5%.
- David: 1.5 hours, 12.5%.

Recommended timing:

- Days 1-3: no David time unless facts are missing.
- Days 4-7: up to 15 minutes only for unresolved operational facts.
- Days 11-12: 30-minute report review.
- Days 13-14: 15-minute payment/final approval.
- Days 16-20: 15 minutes only if a reconciliation question arrives.
- Monthly exception reserve: 30 minutes.

Governance outside the monthly cycle:

- Quarterly: 45-minute control review.
- Annual/decree-change review: 90 minutes.

Normal annual David time after stabilization is approximately 19.5 hours: 15 hours for monthly approvals, 3 hours for quarterly reviews, and 1.5 hours for the annual review. This averages 1.625 hours per month.

## Quebec compensation recommendation

Relevant Job Bank benchmarks, updated in 2025 for 2023-2024 reference data:

- Administrative officer, Quebec: CAD 22.08 low, 28.90 median, 41.54 high per hour.
- Administrative officer, Monteregie: CAD 23.00 low, 28.04 median, 42.56 high per hour.
- Payroll administrator, Quebec and Monteregie: CAD 21.80 low, 30.00 median, 40.84 high per hour.
- Property administrator, Quebec: CAD 22.00 low, 34.77 median, 60.10 high; Monteregie median CAD 29.00 per hour. This is a secondary comparison, not the primary occupation.

Recommended DSS range:

- Training/probation with close review: CAD 28-30/hour.
- Once independently producing clean monthly packages: CAD 30-34/hour.
- Above CAD 34/hour when the role also owns payroll, CNESST, audits, subcontractor compliance, and multilingual external coordination.

### If CPEEP-only at current scale

At CAD 30-34/hour:

- 12 hours/month: CAD 360-408/month, CAD 4,320-4,896/year.
- 20 hours/month: CAD 600-680/month, CAD 7,200-8,160/year.
- 25 hours/month: CAD 750-850/month, CAD 9,000-10,200/year.

Training cost for 80-100 paid hours is CAD 2,400-3,400 at the recommended rate range.

### If this is a true 80%-FTE combined role

An 80% schedule is 32 hours/week or 1,664 paid hours/year.

- CAD 30/hour: CAD 49,920 base salary.
- CAD 32/hour: CAD 53,248 base salary.
- CAD 34/hour: CAD 56,576 base salary.

Estimated employer cash cost before optional benefits, using a planning allowance of 12-15% for employer payroll costs and statutory charges:

- CAD 55,910-57,408 at the CAD 30/hour base.
- CAD 59,638-61,235 at the CAD 32/hour base.
- CAD 63,365-65,062 at the CAD 34/hour base.

Recommended offer for a combined 80%-FTE DSS payroll/compliance coordinator: CAD 52,000-56,500 base, with a written salary review after three clean CPEEP cycles. Do not label a CPEEP-only assignment as an 80%-FTE job unless the real workload supports it.

## 30-60-90 day onboarding

### Days 1-30

- Complete foundations and systems training.
- Build the DSS employee/site/control registers.
- Complete dossier #39454 package under supervision.
- Shadow one payroll close and one CPEEP report.
- David involvement: about 4 hours one-time plus the first monthly review.

### Days 31-60

- Coordinator prepares the second report.
- Reviewer checks every employee and total.
- Implement low-risk reminders, folders, staging workbook, and approval summary.
- David involvement: about 2-3 hours for the month.

### Days 61-90

- Coordinator leads the third report.
- Reviewer checks exceptions and control totals rather than every keystroke.
- Decide whether controlled portal assistance is justified.
- David involvement: about 2 hours for the month.

### After day 90

Graduate the coordinator only if three reports are complete, on time, reconciled, and supported by archived proof. Then move to the 87.5/12.5 normal-month model and quarterly control review.

## Sources

- CPEEP employer guide and current rates: https://cpeep.qc.ca/fr/employeur/
- CPEEP monthly-report instructions: https://cpeep.qc.ca/fr/rapport-mensuel/
- CPEEP portal guide: https://cpeep.qc.ca/wp-content/uploads/2025/10/guide-du-portail-cpeep-employeurs-et-comptables-fr-final-26-sept-2024.pdf
- Official decree, Légis Québec D-2, r. 15: https://www.legisquebec.gouv.qc.ca/fr/document/rc/D-2,%20r.%2015%20/
- Job Bank, administrative officer wages: https://www.jobbank.gc.ca/marketreport/wages-occupation/12462/QC
- Job Bank, payroll administrator wages: https://www.jobbank.gc.ca/marketreport/wages-occupation/25792/QC
- Job Bank, property administrator wages: https://www.jobbank.gc.ca/marketreport/wages-occupation/17717/QC


# DOCUMENTO 9 — DSS - Payroll and Compliance Coordinator Job Description

---
type: project
project: dss-multiservices
status: draft
created: 2026-08-03
updated: 2026-08-03
---

# DSS - Payroll and Compliance Coordinator Job Description

## Position summary

**Job title:** Payroll and Compliance Coordinator / Coordonnateur(trice) de la paie et de la conformité

**Company:** DSS Multiservices

**Employment level:** 80% full-time equivalent, normally 32 hours per week

**Reports to:** President / Operations Owner, [[David Salazar]]

**Location:** Quebec, hybrid or remote where secure access to company systems and confidential records can be maintained

**Recommended compensation:** CAD 30-34 per hour, equivalent to approximately CAD 49,920-56,576 annually at 32 hours per week. A training range of CAD 28-30 per hour may be used during a defined probationary period, followed by a written review after three accurate CPEEP reporting cycles.

## Job description

The Payroll and Compliance Coordinator manages DSS Multiservices' recurring payroll-administration and regulatory-compliance workflows. The position prepares and reconciles employee hours, payroll records, CPEEP monthly reports, employee files, CNESST and prime-contractor compliance documents, and the supporting evidence required for audits or verification requests.

This is a coordination and control role. It is not an autonomous legal, accounting, or executive decision-making position. The coordinator owns routine preparation, reconciliation, follow-up, documentation, and deadline management. David retains approval authority for payments, material corrections, legal or financial commitments, disputed classifications, report amendments, audits, claims, and exceptions that could change DSS's legal or financial position.

The role follows the controls in [[DSS - CPEEP Onboarding and Delegation Plan]].

## Primary objectives

1. Submit complete and accurate CPEEP reports and related payments on time.
2. Keep payroll, employee, contract, and compliance records current and internally consistent.
3. Identify missing records or discrepancies early enough to correct them before deadlines.
4. Give David concise, decision-ready approval packages instead of unstructured documents.
5. Maintain a secure evidence trail for every filing, payment, employee change, and external compliance request.
6. Reduce David's routine administrative involvement while escalating the right decisions promptly.

## Responsibilities

### 1. CPEEP administration and monthly reporting - approximately 25-30%

- Maintain the monthly reporting calendar and internal deadlines.
- Collect approved time records, payroll registers, employee changes, and client or prime-contractor hour reports.
- Reconcile weekly and monthly hours against payroll and source records.
- Separate Class A, B, and C work correctly and flag ambiguous duties for review.
- Verify overtime, night premiums, holidays, worked holidays, sickness, vacation, departures, no-gain periods, and adjustments.
- Track employee progress toward permanent status at 280 hours.
- Prepare the monthly CPEEP report, REER contribution, levy calculation, and payment summary.
- Prepare David's one-page approval package by the internal review date.
- Submit reports only after the required approval and delegated authority are documented.
- Save the final report, submission proof, payment proof, and relevant correspondence.
- Prepare routine responses to CPEEP document requests using verified DSS records.
- Contact CPEEP for written instructions before preparing an amended report.

### 2. Payroll coordination and reconciliation - approximately 25-30%

- Maintain the employee master list and payroll-change register.
- Validate approved hours before payroll processing.
- Coordinate new hires, departures, leaves, rate changes, deductions, and adjustments with the payroll/bookkeeping provider.
- Reconcile payroll outputs to approved time records and CPEEP reporting totals.
- Investigate and document discrepancies before payment or filing deadlines.
- Maintain controlled rate tables and effective dates.
- Prepare payroll summaries and variance reports for management review.
- Preserve an audit trail without storing payroll-level personal information in Kaku.

### 3. Employee records and privacy - approximately 10-15%

- Maintain complete and secure onboarding records for each employee.
- Confirm required contact, employment, payroll, and CPEEP information is collected before first payment.
- Keep addresses, contact details, hire dates, work classes, status changes, and supporting documents current.
- Apply least-access and confidentiality controls to SINs, dates of birth, payment proofs, and other sensitive information.
- Use approved secure storage and transmission methods.
- Never mix QC Maintenance records or identities with DSS records.

### 4. CNESST and regulatory-document coordination - approximately 10-15%

- Track CNESST registration, account access, classification, correspondence, attestations, and document renewal dates.
- Maintain current Revenu Québec, insurance, bonding, and other compliance certificates assigned to the role.
- Monitor official CPEEP and government notices for rate or procedural changes.
- Prepare implementation checklists when a rate, decree, or reporting rule changes.
- Escalate inspections, assessments, penalties, claims, or legal notices immediately.

### 5. Client, subcontractor, and prime-contractor compliance - approximately 10-15%

- Maintain a register of active contracts, work locations, start dates, client contacts, employee assignments, and reporting obligations.
- Prepare standard compliance packages requested by clients or prime contractors.
- Reconcile externally reported hours against payroll and CPEEP filings before sending proof.
- Track expiry dates for insurance, CNESST, Revenu Québec, bonding, and related documents.
- Draft routine follow-up communications for approval where required.
- Identify contractual requests that create a new obligation or expose a discrepancy and escalate them to David.

### 6. Administration, controls, and management reporting - approximately 10%

- Maintain recurring checklists, document indexes, filing conventions, and status dashboards.
- Provide a weekly exception list and a monthly compliance summary.
- Record durable status and open loops in Kaku without copying sensitive payroll records into it.
- Recommend low-risk automation and process improvements.
- Participate in quarterly control reviews and the annual decree/rate review.
- Maintain written procedures so another trained person can cover the role.

## Key requirements

### Mandatory

- Functional written and spoken French sufficient to understand official Quebec correspondence and communicate professionally with CPEEP, CNESST, payroll providers, clients, and employees.
- Strong numerical accuracy and ability to reconcile hours, rates, gross pay, deductions, contributions, and control totals.
- Intermediate spreadsheet skills, including filters, formulas, lookups, validation, and variance checks.
- Ability to work with payroll/accounting systems such as QuickBooks or learn them quickly.
- Excellent document organization, deadline management, and follow-up discipline.
- Ability to handle confidential payroll and employee information using secure procedures.
- Sound judgment: knows when to stop, document an uncertainty, and escalate instead of guessing.
- Clear professional writing and ability to produce short, decision-ready summaries.
- Legal authorization to work in Quebec.

### Experience and education

One of the following profiles is acceptable:

1. At least one year of payroll, bookkeeping, HR administration, compliance, or high-accuracy office administration experience; or
2. A relevant diploma or certificate plus strong spreadsheet and administrative skills; or
3. No directly related experience, provided the candidate demonstrates strong numeracy, written French, confidentiality judgment, and completes the 80-100-hour supervised training path before independent responsibility.

Prior CPEEP experience is an asset but is not mandatory. A CPA, legal qualification, or Payroll Compliance Professional designation is not required for the coordinator role, although payroll certification is an asset.

### Preferred assets

- Experience in commercial cleaning, building services, construction support, staffing, or another regulated hourly-workforce environment.
- Familiarity with Quebec payroll, CNESST, Revenu Québec, employment standards, and recordkeeping.
- Experience preparing audit or compliance evidence packages.
- English and/or Spanish in addition to French.
- Experience with workflow automation, structured forms, or document-management systems.

## Time availability

### Standard schedule

- **32 hours per week**, representing an 80% full-time-equivalent position.
- Preferred distribution: five weekdays with approximately 6-6.5 working hours per day, rather than four completely unavailable weekdays.
- Core availability: Monday to Friday, approximately 9:00 a.m. to 2:00 p.m. Quebec time.
- Remaining hours may be scheduled flexibly by agreement.
- Hybrid or remote work is acceptable if secure company equipment, approved storage, and reliable access to payroll and compliance systems are available.

A five-day distribution is preferred because payroll corrections, employee changes, client requests, and CPEEP questions can arise throughout the week. A four-day schedule may be approved only if deadline coverage and backup arrangements are documented.

### Critical availability windows

The coordinator must be available during:

- The first three business days of each month for payroll and time-record close.
- Days 4-10 for reconciliation and report preparation.
- Days 11-12 for management review and corrections.
- Days 13-15 for final authorization, submission, payment, and deadline verification.
- Payroll processing and pay-date correction windows.
- The first business day after a material CPEEP, CNESST, payroll, or client compliance notice.

Vacation during the first 15 days of a month requires an approved coverage plan. No single person should be the only holder of filing instructions, passwords, or deadline knowledge.

### Response expectations

- Acknowledge routine internal requests within one business day.
- Flag a deadline-threatening missing record on the same business day it is identified.
- Escalate audits, claims, penalties, legal notices, payment failures, or suspected privacy incidents immediately.
- No normal requirement for evenings, weekends, or 24/7 availability.
- Audits, amendments, month-end corrections, or urgent client verification may occasionally require 1-3 additional hours. Any extra time should be approved and handled according to the employment agreement and Quebec employment standards.

## Decision authority

### Coordinator may

- Request missing routine records.
- Reconcile and correct clerical data before submission.
- Prepare reports, calculations, checklists, and draft correspondence.
- Contact CPEEP or another authority for procedural clarification without committing DSS to a position.
- Submit a clean report after documented approval if delegated portal authority exists.
- Implement approved rates, templates, and procedures.

### David must approve

- CPEEP, CNESST, payroll-tax, or other compliance payments.
- Material adjustments, credits, retroactive corrections, or amended reports.
- Ambiguous work classification, employment status, or compensation treatment.
- Statements admitting liability, non-compliance, or an amount owed.
- Audit responses, claims, settlements, repayment arrangements, or legal correspondence.
- New banking authorizations, procurations, contractual commitments, or changes to company policy.
- Disclosure of sensitive records outside established routine recipients and secure channels.

## Performance indicators

The position is performing successfully when:

- 100% of recurring reports and payments are completed by the internal deadline.
- Every filing has report, approval, submission, and payment evidence.
- Payroll-to-time and payroll-to-CPEEP variances are explained before submission.
- Employee records are complete before first payment and updated promptly after changes.
- No sensitive information is stored in unauthorized systems.
- David receives one concise approval package rather than multiple incomplete requests.
- Normal David involvement reaches approximately 1.5 hours per month after stabilization.
- Three consecutive reporting cycles are completed accurately before supervision is reduced.

## First 90 days

### Days 1-30

- Complete CPEEP, payroll, privacy, and systems foundations.
- Build or validate employee, site, contract, deadline, and evidence registers.
- Prepare DSS dossier #39454 under full review.
- Shadow one payroll close and one CPEEP reporting cycle.

### Days 31-60

- Lead the second monthly report under field-by-field review.
- Implement reminders, folder controls, staging workbook, and approval-summary template.
- Demonstrate accurate reconciliation and timely escalation.

### Days 61-90

- Lead the third monthly report with targeted review of totals and exceptions.
- Document backup and continuity procedures.
- Complete a formal performance and compensation review.

Independent normal-month responsibility should be granted only after three complete, accurate, timely, and fully evidenced cycles.
