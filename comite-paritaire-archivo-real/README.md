# Archivo real — comité paritaire (CPEEP), correos y reportes 2018-2026

*Generado 2026-08-10. Extraído del backup completo de las 9 casillas de correo de QC Maintenance (davidr, mcastro, pay, acastro, cvasquez, msalazar, jsalazar, srobledo, ventes — ~161.000 correos totales, 2018-2026).*

## Qué es esto (y qué NO es)

Esto es el **material crudo real**: los correos y reportes efectivamente enviados/recibidos sobre el comité paritaire — al CPEEP, a clientes (GDI y otros donneurs d'ouvrage), y conversaciones internas del equipo. Sirve para dos cosas: (1) entrenar un LLM / dar contexto a futuras sesiones con ejemplos reales en vez de descripciones teóricas, y (2) que Freddy (o quien asuma el rol) aprenda a producir los reportes leyendo cómo se hicieron de verdad, con sus errores incluidos.

Esto **no** reemplaza a `../comite-cpeep-onboarding/` — ese paquete es la metodología ya destilada (manual, plan de formación, guía oficial, y desde 2026-08-10 también la guía práctica paso a paso para armar el rapport mensuel, doc 07). Este paquete es la fuente primaria de la que esa metodología se sacó. Usalos juntos: cuando el manual diga "así se hace", venís acá a ver un caso real de cómo salió.

## Metodología

1. **Filtro rápido (ripgrep)** sobre los ~161.000 `.eml` crudos, buscando *paritaire*, *cpeep*, *décret*, *prélèvement*, *rapport mensuel*, *titanfile* (con y sin acentos) → 4.459 archivos candidatos.
2. **Decodificación completa** de cada candidato (parseo MIME real, no texto crudo — reconstruye correctamente el cuerpo aunque venga en quoted-printable/base64/HTML) y clasificación por dos ejes:
   - **Confianza**: *alta* (el término aparece en el asunto/cuerpo ya limpio, o el remitente/destinatario es del dominio `cpeep.qc.ca`/`titanfile.com`) · *media* (términos menos específicos como "décret" solos) · *media (solo en cita/reenvío)* (el término solo aparece en contenido citado/reenviado, no en el mensaje mismo) · *baja — separada en `05-baja-confianza-sin-verificar/`* (el ripgrep crudo encontró algo, pero probablemente es ruido: coincidencia dentro de un adjunto binario/base64, o el patrón cayó en una palabra parecida).
   - **Categoría**, por dominio de los participantes: `01-correspondencia-comite` (cpeep.qc.ca o titanfile.com involucrados) · `02-correspondencia-clientes` (dominio externo no interno) · `03-conversaciones-internas` (solo qcmaintenance.com/dssmultiservices.com) · `04-sin-clasificar`.
3. **No es una muestra** — es el corpus completo de las 9 casillas, no un sampling (a diferencia del análisis de personas/historia de `soportes/`, que sí usó muestreo).

**Límite conocido, documentado a propósito**: el cuerpo guardado corta el contenido citado/reenviado (para no repetir historiales completos en cada mensaje de un hilo largo); la búsqueda de términos SÍ mira el texto completo antes de cortar, así que no se pierden coincidencias, pero el archivo `.md` de un mensaje puede verse "corto" si la mayoría de la conversación estaba citada. Los adjuntos (PDF de rapports, Excel de horas) no se extrajeron — quedan listados por nombre en cada `.md`, el archivo original completo está en `QC-Maintenance-Email-Backup/<buzón>/gmail/<ruta>` para quien necesite abrirlos.

## Cobertura

| | |
|---|---|
| Candidatos crudos (ripgrep) | 4.459 |
| Extraídos y categorizados | 4.467 (algunos duplicados de reintentos, deduplicados) |
| **Confiables** (alta + media + media-cita) | **2.261** |
| Separados como baja confianza / a revisar | 2.206 (carpeta `05-baja-confianza-sin-verificar/`) |
| Rango de fechas (confiables) | 2019-02-14 → 2026-08-05 |
| Por categoría (confiables) | comité: 252 · clientes: 1.695 · internas: 314 |
| Por año (confiables) | 2019: 10 · 2020: 25 · 2021: 73 · 2022: 57 · 2023: 53 · 2024: 562 · 2025: 1.040 · 2026: 441 |
| Por casilla (confiables) | mcastro: 840 · pay: 393 · jsalazar: 382 · davidr: 380 · msalazar: 158 · acastro: 84 · cvasquez: 18 · ventes: 3 · srobledo: 3 |

El salto en 2024-2025 no es casualidad de la búsqueda: coincide con la crisis de conciliación con GDI (jul-oct 2024, ver `soportes/QC-Maintenance-Historia-y-Lecciones.md`) y con la inspección/réclamations de 2025 (doc 01, sección 1) — el volumen real de correspondencia sobre el comité se disparó justo cuando las cosas empezaron a salir mal.

## Estructura

```
01-correspondencia-comite/        252 correos — trato directo con cpeep.qc.ca / titanfile.com
02-correspondencia-clientes/    1.695 correos — con GDI y otros donneurs d'ouvrage sobre el tema
03-conversaciones-internas/       314 correos — entre el equipo QCM/DSS
05-baja-confianza-sin-verificar/ 2.206 correos — coincidencia cruda encontrada, sin confirmar; revisar antes de usar como fuente
_index/index.csv                  Índice completo (fecha, buzón, categoría, confianza, términos, asunto, de/para/cc, archivo, original) — ordenable, para explorar sin abrir cada .md
```

Cada archivo `.md` trae metadata (fecha, de/para/cc, categoría, confianza, adjuntos, ruta del `.eml` original) y el cuerpo del mensaje ya decodificado.

## Manual vs. automatizable — qué confirma este archivo real

`../comite-cpeep-onboarding/02-Rutas-de-Automatizacion.md` ya proponía 3 rutas priorizadas a partir de un análisis previo. Con el archivo real completo delante, esto es lo que se confirma y lo que se suma:

- **Confirmado**: los fallos de QCM fueron de calendario/seguimiento, no de cálculo. En `01-correspondencia-comite/` se ven varios ciclos de "última advertencia" del comité (ej. `2022-04-26_..._demande-de-rapports-mensuels.md`: 6 meses de rapports sin enviar, amenaza de poursuite penal) — el problema nunca fue no saber calcular el prélèvement, fue no haberlo transmitido a tiempo. Eso es exactamente lo que un recordatorio automático (Ruta 1 del doc 02) resuelve, y el archivo real lo confirma con casos concretos en vez de una afirmación abstracta.
- **Nuevo, visible ahora que están los 1.695 correos con clientes**: gran parte del volumen no es con el comité, es con el cliente (GDI) confirmando/exigiendo prueba de que el rapport se envió — ej. `02-correspondencia-clientes/2024-03-07_..._nouvelle-reglementation-rapport-mensuel-comite-paritaire.md`, donde GDI declara por escrito que hace "un contrôle mensuel" del rapport transmitido. Esto es candidato a automatizar aparte del ciclo con el comité: una plantilla + envío automático del accusé de réception al cliente apenas el Portail confirma el envío (hoy es un paso manual del doc 01, sección 3, fila "15 +24h").
- **Todavía manual, y así debe seguir**: los `rapport à corriger`/`rapport amendé` (ver `01-correspondencia-comite/2025-08-15_*` y `2025-08-28_*`) siempre necesitan intervención humana — un amendé mal armado agrava el problema, no lo resuelve. No es candidato a automatización; sí es candidato a que el nuevo responsable practique leyendo estos casos reales antes de que le toque uno de verdad.
- **Dato nuevo para dimensionar la Ruta 2/3 del doc 02**: con 2.261 correos confiables en ~7.5 años reales de operación, el volumen mensual real ronda ~25-30 correos relacionados al comité (contando picos de crisis) — útil como referencia de carga real si se evalúa qué tan agresivamente automatizar clasificación/enrutamiento de esta correspondencia.

## Cómo usarlo para entrenar un LLM / dar contexto a futuras sesiones

- Subí la carpeta completa (o `_index/index.csv` + las subcarpetas de confianza alta) a NotebookLM o al proyecto de Kaku — cada `.md` es un documento autocontenido con metadata, ideal para RAG.
- Para instrucciones a una sesión futura de Claude/otro asistente: apuntá a `_index/index.csv` primero (liviano, se puede leer entero) y que abra los `.md` puntuales que necesite en vez de cargar los 4.467 de una.
- Para aprender a redactar: leé cronológicamente `01-correspondencia-comite/` — es la mejor fuente de "cómo habla" el comité y qué tono/estructura esperan en las respuestas.
