# Cómo armar el Rapport Mensuel — guía práctica paso a paso

*Añadido 2026-08-10 para cerrar un vacío señalado por Freddy: el manual (doc 01) y el plan de formación (doc 03) explican QUÉ es el rapport y CUÁNDO se debe, pero no traían un tutorial operativo de cómo se arma campo por campo. Este documento sí lo es — es el que faltaba para "estudiar" el ensamblaje, no solo leer sobre él. Fuentes: `fuentes-oficiales/rapport-mensuel-verso-2026.md` (guía oficial de 26 casillas, versión vigente 2026), `fuentes-oficiales/guide-du-portail-cpeep-employeurs-et-comptables-fr-final-26-sept-2024.md` (manual del Portail "Aramis web"), y ejemplos reales de `../comite-paritaire-archivo-real/` (correos reales de QCM con el CPEEP y con GDI sobre este mismo trámite).*

**Cómo usar este documento**: no lo leas una vez y listo — hacé el ejercicio de la sección 7 con lápiz y calculadora antes de tu primer rapport real. Es aritmética simple pero con muchas casillas; el error típico no es de dificultad, es de casillero equivocado.

---

## 0. El mapa en una frase

Cada mes tomás las horas trabajadas por cada empleado, las convertís en dinero (salario + REER), sumás todo, sacás el 1% de prélèvement, y transmitís eso al CPEEP por el Portail antes del día 15 — con dos pagos separados (REER y prélèvement).

---

## 1. Antes de sentarte a armarlo — checklist de insumos

No arranques sin tener estas 4 cosas juntas en la mesa:

1. **Las horas del período**, ya depuradas (doc 01, calendario día 1-8): un Excel o el registre de paie con horas por empleado, por semana, separadas por tipo (regulares / suplementarias / feriado o congé / feriado trabajado / enfermedad).
2. **La ficha de cada empleado ya cargada en el Portail** (pestaña *Employés*) — si es alta nueva, cargarla ANTES de intentar agregarla al rapport (sección 4.2). Sin esto, el rapport no te deja avanzar.
3. **El taux vigente** del mes que estás reportando — no asumas que es el mismo del mes pasado; los taux cambian cada 1-nov y el décret se puede modificar por infolettre en cualquier momento (doc 01, sección 3, tabla de parámetros). Al 2026-03-04: Classe A/B $23,25/h, Classe C $23,90/h; REER $0,20/h.
4. **El rapport del mes anterior a mano** — para las casillas 23/24 (créditos o saldos pendientes) y para verificar que la semana 1 de este rapport empieza exactamente 7 días después de la última semana del rapport anterior (el Portail te lo exige).

---

## 2. Los datos, campo por campo (qué le corresponde a cada casilla)

El formulario real tiene un bloque por empleado con hasta 6 semanas y 17 casillas numeradas (fuente: guía oficial 2026, versión de 26 casillas totales contando los grandes totales). Así se llenan, en el orden en que las vas a tipear en el Portail:

| # oficial | Campo | De dónde sale |
|---|---|---|
| 4 | Nom, prénom, NAS, dirección completa | Ficha del empleado (ya cargada, no se retipea cada mes salvo cambios) |
| 5 | Fecha de contratación, courriel | Ídem — y la **date de naissance** se transmite UNA sola vez, con el primer rapport donde aparece ese empleado (art. 6.106) |
| 6 | Fecha de permanencia | La llena el comité solo — NO se toca, aparece automático al llegar a 280 h acumuladas |
| 7 | Heures rég. / Heures suppl. / Heures congé-mobile / Hrs congé travaillé / Heures maladie — **por semana y por clase (A/B/C)** | Tu Excel de horas depuradas. Regla de oro: solo horas *regulares* van en "Heures rég."; todo lo demás (extra, feriado, enfermedad) tiene su propia línea — no las mezcles o el cálculo de heures supplémentaires sale mal |
| 8 | Salaire $ total bruto de la semana (incluye prima de nuit; excluye REER) | horas × taux de cada línea, sumado |
| 9 | Autres montants (ajustements) | Cualquier otra indemnité con valor pecuniario que no sea vacances/départ |
| 10 | Vacances o Départ (con % o motivo + fecha de pago) | Solo cuando corresponde — **ojo**: completar "Départ" saca al empleado del próximo rapport, no confundir con vacaciones |
| 11 | Total gains del mes (sin REER) | Suma de salaire + autres montants + vacances/départ |
| 13-15 | Total heures del mes (todas las líneas de horas sumadas + heures ajustement) | Suma automática en el Portail si cargaste bien las horas semana por semana |
| 16 | REER $ | Total heures (13-15) × taux REER vigente ($0,20/h) |
| 17 | Total des gains + REER | Casilla 11 + casilla 16 — este es el número que importa para el prélèvement |
| 18-19 | Totales de página (si hay más de una página de empleados) | Suma de REER y de gains+REER de todos los empleados de esa página |
| 20-21 | Grandes totales del rapport | Suma de 18 y 19 de TODAS las páginas |
| 22 | **Prélèvement a pagar** | Casilla 21 × 1% |
| 23-24 | Ajustes de REER / prélèvement de un rapport anterior | Solo si tenés un saldo o crédito pendiente — dejalo en blanco si no |
| 25 | **Grand total REER a pagar** (cheque 1) | Casilla 20 ± casilla 23 |
| 26 | **Grand total prélèvement a pagar** (cheque 2) | Casilla 22 ± casilla 24 |

**El punto que más se presta a error**: REER y prélèvement son DOS pagos separados desde la versión 2026 del formulario (antes iban juntos). Preparar dos cheques (o dos líneas si es prélèvement preautorizado), no uno.

---

## 3. Ejemplo numérico completo (hacelo con calculadora, no de memoria)

Empleado ficticio: **Ana Martínez, Classe A, permanente**, mes de 4 semanas, taux $23,25/h, REER $0,20/h.

| Semana | Heures rég. | Heures suppl. | Salaire $ |
|---|---|---|---|
| 1 | 38 h | 0 | 38 × 23,25 = **883,50** |
| 2 | 40 h | 4 h | (40 × 23,25) + (4 × 23,25 × 1,5) = 930,00 + 139,50 = **1.069,50** |
| 3 | 35 h | 0 | 35 × 23,25 = **813,75** |
| 4 | 40 h | 0 | 40 × 23,25 = **930,00** |

- **Total heures (casilla 13-15)**: 38+40+4+35+40 = **157 h**
- **Total salaire (parte de casilla 11)**: 883,50 + 1.069,50 + 813,75 + 930,00 = **$3.696,75**
- Sin autres montants ni vacances/départ este mes → **casilla 11 = $3.696,75**
- **REER (casilla 16)**: 157 h × $0,20 = **$31,40**
- **Total gains + REER (casilla 17)**: 3.696,75 + 31,40 = **$3.728,15**

Si Ana fuera la ÚNICA empleada del rapport (en la realidad sumás esta fila por cada empleado):
- Casilla 20 (total REER) = $31,40
- Casilla 21 (total gains+REER) = $3.728,15
- **Casilla 22 — Prélèvement a pagar** = $3.728,15 × 1% = **$37,28**
- Sin saldos pendientes → **Cheque REER = $31,40** / **Cheque prélèvement = $37,28**

Con más empleados, repetís el bloque completo por cada uno y estas 4 casillas finales (20, 21, 22 y los dos cheques) son la suma de TODOS.

---

## 4. Cargarlo en el Portail — clic por clic

*(Portail: https://portail.cpeep.qc.ca/ — solo Chrome o Firefox, nunca Edge. Fuente: guía oficial del Portail.)*

### 4.1 Antes del primer rapport del mes
1. Entrá con tu usuario (lo emite el comité) y contraseña. Vas a recibir un código de 6 dígitos al correo registrado de la empresa (por eso el doc 01 recomienda un buzón de rol, no personal) — lo tipeás y clic en **Valider**.
2. Pestaña **Employeur**: confirmá que los datos de la empresa están correctos. La mayoría de los campos no son editables — si algo está mal, hay que contactar al comité, no se corrige solo.
3. Pestaña **Employés**: si hay un empleado nuevo, clic en **Ajouter un employé** y completá TODOS los campos obligatorios (nombre, dirección, teléfono, courriel, NAS, fecha de nacimiento — estos dos últimos son obligatorios —, fecha de contratación, sexo, clase de empleo). Formato de fecha: `aaaa-mm-jj`. Guardar.

### 4.2 El rapport en sí
4. Pestaña **Nouveau rapport mensuel**. Completá los 4 campos obligatorios: **Année**, **Mois**, **Semaine 1 (finissant le)** y **Durée du rapport** (4, 5 o 6 — nunca 5 si tu período de paie es quincenal, ver doc 01). La semana 1 debe empezar exactamente 7 días después de la última semana del rapport anterior; si no coincide, el sistema te lo va a señalar — no lo fuerces, contactá al comité primero.
5. Clic en **Ajouter un employé**, tildá el o los empleados de este rapport (o tildá la casilla de arriba para seleccionarlos a todos de una).
6. Para cada empleado: cargá horas por semana y por tipo (regulares / suplementarias / congé / congé travaillé / maladie, separadas por Classe A/B/C como corresponda), el salario, y el monto de REER debido (el sistema calcula el total automáticamente en el resumen). Si el empleado no tuvo ganancias este mes y no está de vacaciones, marcá **Sans gains** e indicá el motivo (CNESST, maladie, maternité, sur appel, congé sans solde, autres).
7. Repetí el paso 6 para cada empleado del rapport.
8. Al terminar, bajá a **Sommaire du rapport** — ahí ves el detalle: Gains, REER, Prélèvement dû (1% incluyendo REER), y el Total dû. No es editable a mano; si un número no cuadra, el error está en la carga de arriba, no acá.
9. Tildá **J'envoie un chèque de: $** o **J'autorise le prélèvement préautorisé de: $** — vas a necesitar DOS montos (REER y prélèvement por separado). Si pagás un monto distinto al indicado, usá el campo **Notes** para explicarle al comité por qué.
10. Clic en **Sauvegarder** — el rapport queda en estado **Ouvert** (todavía editable). Podés cargarlo en varias sesiones si hace falta.
11. Cuando esté completo y revisado (ver checklist abajo), clic en **Envoyer**. **A partir de ahí el rapport pasa a Envoyé y ya NO es editable** — la fecha de envío que muestra el Portail es tu prueba de envío.

### 4.3 Si te equivocaste DESPUÉS de enviar
No se puede anular ni editar un rapport ya enviado. Se produce un **rapport amendé**: lo que declaraste de más se pone en negativo, lo que faltó se agrega. Contactá primero al comité para que te den las instrucciones exactas del amendé — no lo armes a ciegas (ver caso real en la sección 6).

---

## 5. Checklist de QA — repasar ANTES de tocar "Envoyer"

Un rapport enviado es una declaración legal exigible (doc 01, sección 5, punto 6) — revisar esto 5 minutos antes de enviar ahorra semanas de corrección después:

- [ ] Cada empleado tiene su clase de empleo correcta (A/B/C) — un error de clase cambia el taux y por lo tanto TODOS los cálculos de esa fila.
- [ ] Las horas suplementarias están en su propia línea, no mezcladas con "Heures rég." (revisar cualquier semana que sume >40 h regulares).
- [ ] Si alguien salió de vacaciones o dejó la empresa este mes, ¿usaste el campo correcto (Vacances vs. Départ)? Recordá: Départ saca al empleado del próximo rapport.
- [ ] ¿Hay algún empleado a punto de cruzar las 280 h (permanencia) o cuya fecha de nacimiento nunca se transmitió? Si es su primer rapport, la date de naissance va obligatoriamente con este envío (art. 6.106).
- [ ] El REER se calculó sobre el TOTAL de horas del mes (no solo las regulares) — incluye suplementarias, congé, maladie.
- [ ] Los dos montos a pagar (REER y prélèvement) están separados y coinciden con dos cheques o dos líneas de prélèvement preautorizado — NO un solo cheque combinado.
- [ ] Semana 1 de este rapport = 7 días después de la última semana del rapport anterior.
- [ ] Guardaste (no solo en el Portail) una copia en PDF del rapport antes de enviarlo, para el paquete de conciliation (sección 6).

---

## 6. Después de enviar — armar el paquete de conciliation

El envío al comité no es el último paso si tenés un donneur d'ouvrage (GDI, Ménagez-Vous) que exige conformité — y va a exigirla: un correo real de GDI a QCM lo dice explícitamente:

> *"Nous effectuons un contrôle mensuel de votre rapport que vous transmettez au comité paritaire le 15 de chaque mois pour votre dossier avec les pièces justificative ainsi que vos remises."* — SQC Conformité, GDI Services (Québec), 2024-03-07 (ver `../comite-paritaire-archivo-real/02-correspondencia-clientes/2024-03-07_mcastro_18e193d6f2d2426d_nouvelle-reglementation-rapport-mensuel-comite-paritaire.md`)

Con eso en mente, después de enviar (doc 01, sección 3, nomenclatura):
1. Descargá/imprimí el rapport enviado en PDF desde el Portail (botón arriba a la derecha del rapport).
2. Armá la carpeta del mes con el trío estándar: `1. AAAAMMDD-AAAAMMDD <Empresa>.xlsx` (horas del cliente) + `2. <EMPRESA> COMITE <período>.pdf` (el rapport) + `3. <EMPRESA> BANQUE <período>.pdf` (relevé de banque d'heures si aplica).
3. Reenviá al donneur d'ouvrage el accusé de réception dentro de las 24 h.
4. Cuando se cobren los cheques, guardá el recto/verso — es la prueba que el comité y el cliente aceptan.

---

## 7. Ejercicio de práctica (hacelo antes de tu primer mes real)

Con estos datos ficticios, armá vos mismo el bloque completo (papel o Excel, no el Portail todavía) y calculá las casillas 11, 13-17 y 22:

- **Empleado: Carlos Pino, Classe A, permanente.**
- Semana 1: 40 h regulares.
- Semana 2: 40 h regulares + 6 h suplementarias.
- Semana 3: 32 h regulares + 8 h de congé férié (no trabajado).
- Semana 4: 40 h regulares.
- Sin autres montants, sin vacances/départ este mes.
- Taux Classe A: $23,25/h. REER: $0,20/h.

*(Solución al pie de este documento — no la mires antes de intentarlo.)*

<details>
<summary>Solución (clic para expandir)</summary>

- Salaire sem 1: 40 × 23,25 = 930,00
- Salaire sem 2: (40 × 23,25) + (6 × 23,25 × 1,5) = 930,00 + 209,25 = 1.139,25
- Salaire sem 3 (regulares + congé férié, ambas pagadas al taux normal): (32 × 23,25) + (8 × 23,25) = 744,00 + 186,00 = 930,00
- Salaire sem 4: 930,00
- **Casilla 11 (total gains)**: 930,00 + 1.139,25 + 930,00 + 930,00 = **$3.929,25**
- **Total heures**: 40+40+6+32+8+40 = **166 h**
- **REER (casilla 16)**: 166 × 0,20 = **$33,20**
- **Total gains + REER (casilla 17)**: 3.929,25 + 33,20 = **$3.962,45**
- **Prélèvement (casilla 22, si es el único empleado)**: 3.962,45 × 1% = **$39,62**

</details>

---

## 8. Dónde seguir estudiando

- **Ejemplos reales para practicar leyendo casos verdaderos**: `../comite-paritaire-archivo-real/01-correspondencia-comite/` tiene correos reales de QCM con el CPEEP sobre rapports — incluidos casos de "rapport à corriger" (ej. `2025-08-15_..._qc-maintenance-rapport-a-corriger-mois-de-juin-2025.md`) y de rapport amendé (`2025-08-28_..._qc-maintenance-rapport-amende-corrige.md`) que muestran cómo se ve una corrección real pedida por el comité.
- **Consecuencia real de no enviarlo a tiempo**: `../comite-paritaire-archivo-real/01-correspondencia-comite/2022-04-26_mcastro_18065d373a497a22_demande-de-rapports-mensuels.md` — el comité dando un "último plazo" a QCM con amenaza de poursuite penal por 6 meses de rapports no enviados. Léelo una vez; es la mejor razón para nunca llegar al día 15 sin esto ya armado.
- **Texto oficial completo**: `fuentes-oficiales/rapport-mensuel-verso-2026.md` (las 26 casillas explicadas por el comité mismo) y `fuentes-oficiales/guide-du-portail-cpeep-employeurs-et-comptables-fr-final-26-sept-2024.md` (manual completo del Portail, 14 páginas).
- **El resto del ciclo mensual** (fechas, remises, Smartsheet del cliente): doc [01-Manual-Onboarding-Comite-CPEEP.md](01-Manual-Onboarding-Comite-CPEEP.md), sección 3.
- **Glosario de términos usados acá**: doc [03-Plan-de-Formacion.md](03-Plan-de-Formacion.md), sección 4.
