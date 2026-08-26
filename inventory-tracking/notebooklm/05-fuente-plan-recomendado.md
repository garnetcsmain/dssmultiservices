# El plan recomendado — cómo se combinan las soluciones, fases, costos y riesgos

*Fuente para NotebookLM. Sistema de inventario de DSS Multiservices. Resumen en español
del plan completo; detalles, diagramas y fuentes en la documentación técnica en inglés.*

## La decisión, en un párrafo

Ninguna solución sola gana: se **combinan**. Las etiquetas **NFC** son la capa de
identidad (baratas, delgadas, impermeables, sin batería — lo que pidió Freddy) y entregan
todo el flujo de trabajo desde la Fase 1 con taps de 3 segundos. Las zonas **BLE** son la
capa de autonomía que se monta encima en la Fase 3, para que nadie tenga que tapear. Los
**AirTags** protegen al final solo las máquinas caras. Y el portal **UHF** — la única
tecnología que de verdad "ve" lo que cruza la puerta — queda estacionado por costo
(CA$3,000–5,900) hasta que DSS crezca. Tres evaluaciones independientes (dueño-operador,
confiabilidad, economía) llegaron a la misma conclusión.

## Por qué así y no de otra forma

- **La física manda**: NFC no detecta nada a distancia de puerta (1–10 cm reales; una
  puerta metálica bloquea el campo). La idea original era correcta en el *flujo*, no en el
  *sensor* — el plan conserva el flujo completo y cambia el sensor.
- **La confiabilidad manda**: el estado por presencia BLE ("qué zona lo oye ahora") se
  autocorrige; los eventos de puerta perdidos (UHF) corrompen la base para siempre.
- **El dinero manda**: BLE da ~90 % de la autonomía del portal por ~15 % del costo y
  $0/mes. Todo corre en el servidor "maple" que DSS ya opera, sin un solo puerto público
  nuevo, con Telegram gratis.
- **Las horas de Freddy mandan más que el dinero**: cada fase cabe en fines de semana,
  entrega valor por sí sola, y ninguna fase bota lo construido por la anterior.

## Las fases

| Fase | Qué entrega | Esfuerzo | Costo |
|---|---|---|---|
| **0 — Censo** | Registro completo del equipo: código, foto, **número de serie**, valor — vale oro para el seguro aunque nada más se construya | media jornada | $0 |
| **1 — NFC + bot de Telegram** | El flujo completo: alerta de salida, responsable (casi siempre automático), lista del empleado, **chequeo de empaque**, `/where`, resumen nocturno | 2–3 fines de semana | ~CA$100–150 |
| **2 — Endurecimiento** | Estación de tap en la puerta del 3084 (para teléfonos sin NFC), carga por lotes, sensor de puerta + **alarma fuera de horario**, respaldos | 1–2 fines de semana | ~CA$30–130 |
| **3 — Autonomía BLE** | Se acabaron los taps: detección automática en almacén/vans/tráiler, zumbador en la van sin señal, resumen de baterías. **Compuerta**: 1 mes de datos de Fase 1 + prueba de $70 antes de comprar el resto | 2–3 fines de semana | ~CA$400–750 |
| **4 — AirTags** | Recuperación de las 5–10 máquinas de $1,000+ | una tarde | ~CA$200–450 |
| *(estacionada)* Portal UHF | Detección real de cruce de puerta | — | ~CA$3,000–5,900 |

**Total hasta la Fase 4: ~CA$780–1,480 una sola vez, $0/mes.** (LTE opcional en las vans:
~$15/mes cada una, decidir después de vivir con el zumbador.)

## Los tres momentos "wow" del sistema

1. **El cable olvidado**: al salir del sitio, el bot le dice a María "faltó el cable de
   extensión, revisa antes de arrancar" — mientras todavía puede caminar a buscarlo.
2. **¿Dónde está la hidrolavadora?**: `/where PRESS-01` → "En la Van 2 desde el lunes,
   responsable David, último pin en Complexe Y".
3. **La alarma de las 2 a.m.**: algo salió del almacén fuera de horario → alerta
   inmediata. La única función antirrobo real, casi gratis.

## Riesgos que hay que decir en voz alta

- **Invierno de Quebec**: pilas de moneda flojas bajo −20 °C, electrónica de consumo
  (0–40 °C) en vans heladas, condensación, guantes que no tapean. El primer invierno es
  piloto; se planifica por estación.
- **Adopción del equipo**: el sistema debe presentarse como protección ("prueba de que tú
  SÍ lo devolviste"), sin culpas el primer mes, declarado por escrito que no afecta el
  pago. Y el equipo hoy vive en WhatsApp: instalar Telegram es tarea de personas, no de
  técnica. Mensajes del bot en **español** para el equipo (y FR/EN).
- **Falsas alarmas matan la confianza**: mensajes agrupados, edición en el mismo hilo,
  silencios para lo esperado, y criterios de "apagar y volver al modo manual" si el
  sistema alerta mal 2+ veces por semana.
- **Ley 25 (privacidad, Quebec)**: el historial liga empleados con horas y movimientos —
  es dato personal y es evidencia legal descubrible. Antes de encenderlo: responsable de
  privacidad designado, aviso en francés al personal, retención decidida con abogado, datos
  en Canadá.
- **Seguro**: preguntar dos cosas — si cubre robo desde vehículos sin vigilancia (muchas
  pólizas lo excluyen) y si el registro con series/fotos/valores da descuento de prima.

## Las preguntas que Freddy debe responder ANTES de comprar

1. ¿Qué se perdió de verdad en los últimos 12–24 meses (qué, cuánto valía, en qué etapa)?
2. ¿El equipo vuelve al 3084 cada día, o parte vive en clósets de clientes?
3. ¿Vans propias o arrendadas? ¿Autos personales cargan equipo? ¿Van a casa de noche?
4. ¿El tráiler pasa días desenganchado (sin energía)?
5. ¿Horarios reales del equipo (limpieza nocturna) para configurar alertas y resumen?
6. ¿El equipo aceptará Telegram? ¿Quién es el respaldo de Freddy para las alertas (David)?
7. ¿Hay internet y Wi-Fi que llegue a la puerta del 3084? ¿Dónde vive maple físicamente?
8. ¿Kits: se etiqueta el caddy o cada herramienta? ¿Qué se deja sin rastrear?
9. ¿Las máquinas se lavan a presión y con qué químicos (mortalidad de etiquetas)?
10. ¿Cuántos artículos exactos hoy y en 18 meses (30 vs 90 cambia el presupuesto 2×)?

## El primer paso concreto

Fase 0 este mes: media jornada de censo con planilla (código, foto, serie, valor) +
responder las 10 preguntas. Primera compra: ~CA$150 de etiquetas NFC — pero pidiendo antes
**2–3 muestras de cada modelo** y probándolas sobre las máquinas mojadas reales.
