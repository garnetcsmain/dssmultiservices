# Solución 2 — Zonas Bluetooth (BLE): balizas que gritan "¡aquí estoy!" y cajitas que escuchan

*Fuente para NotebookLM. Sistema de inventario de DSS Multiservices. Precios de agosto
2026; detalles y enlaces en la documentación técnica en inglés.*

## Qué es, en una frase

Cada máquina lleva una **baliza BLE** del tamaño de una moneda (con pila de reloj, dura
1–4 años) que anuncia "aquí estoy" cada 1–2 segundos; unas **cajitas ESP32 de ~$10** —
una dentro del almacén 3084, una en cada van y una en el tráiler — solo **escuchan**, y el
sistema deduce dónde está cada cosa según **qué zona la oye ahora**. Nadie tapea nada.

## Cómo funciona, explicado simple

Imagina que cada máquina tuviera un grillo que canta cada dos segundos, y en cada lugar
importante (almacén, Van 1, Van 2, tráiler) hubiera alguien con buen oído anotando qué
grillos escucha:

- Si el grillo de la pulidora se oye en el almacén → la pulidora está en el almacén.
- Si deja de oírse en el almacén y empieza a oírse en la Van 1 → se cargó en la Van 1
  (y ahí mismo se abre el viaje y se asigna responsable).
- Si la van está estacionada donde el cliente y el grillo deja de oírse en la van →
  la máquina se bajó: **trabajo en progreso**, automático.
- Al encender el motor para irse, la cajita de la van compara su lista contra lo que oye:
  si falta un grillo, **suena un zumbador en la van** (funciona sin señal de celular) y
  sale la alerta de Telegram. Es el chequeo de empaque, sin ningún tap.
- Cualquier cosa que salga del almacén a las 2 a.m. → **alarma inmediata** a Freddy
  (la única función realmente antirrobo del sistema, y es casi gratis).

La clave técnica: el estado se deduce por **presencia continua**, no por "eventos de
puerta". Si una lectura se pierde (pasa seguido con radio), la siguiente pasada la corrige
sola en 1–5 minutos. Nada queda mal para siempre.

## Qué resuelve del flujo que pidió Freddy

Todo el flujo de la Solución 1 (alertas, responsable, listas, chequeo de empaque), pero
**automático**: es la traducción realista de "que la puerta detecte sola lo que se llevan".
Con matices honestos: detecta en 1–5 minutos, no en el segundo exacto del cruce, y si la
van no tiene internet (sin LTE), los detalles llegan al volver a la base — aunque el
zumbador avisa en el momento igual.

## Hardware y costos (verificados)

| Artículo | Precio | Nota |
|---|---|---|
| Baliza BLE (Minew MTB09/MTB10) | **US$3.99** c/u | la opción creíble más barata |
| Baliza BLE (Holyiot nRF52810, IP66/67) | ~US$6 en lote de 200 / $13–17 suelta | variante con acelerómetro |
| Baliza robusta (Feasycom BP104D, IP67) | desde ~US$7.90 | pila 2×AAA, hasta 10 años declarados |
| Cajita ESP32 (5–6 unidades) | US$4–12 c/u | almacén con firmware sin código; vans con firmware propio |
| Kit de energía por vehículo (12 V→5 V, fusible, desconexión por bajo voltaje, zumbador) | ~CA$30–40 | el zumbador es la alarma sin señal |
| Batería + solar para el tráiler (opcional) | ~CA$50–60 | solo si pasa días desenganchado |
| **Total Fase 3 (~20–50 balizas + 5 zonas)** | **≈ CA$400–750 una vez, $0/mes** | LTE opcional: ~CA$140 + ~$15/mes por van |

## Ventajas

- **No le pide nada al personal.** Cero taps, cero disciplina, cero apps.
- Autoreparable: una lectura perdida cuesta minutos, nunca corrompe la base de datos.
- Barato de operar: $0/mes; todo corre en el servidor maple que DSS ya tiene.
- Alarma nocturna del almacén incluida.
- Se monta **encima** de la Fase 1 NFC sin rehacer nada: los taps quedan como respaldo y
  corrección manual.

## Desventajas y riesgos honestos

- **Metal**: una baliza encerrada en metal queda muda; cerca de metal pierde 10–20 dB.
  Se resuelve montando con separador plástico de 3–5 mm y antena hacia afuera — y
  probando con muestras sobre las máquinas mojadas reales antes de comprar 50.
- **Pilas**: con 50 balizas habrá 2–4 cambios de pila al mes. El bot manda un resumen
  mensual de baterías; sin eso, se pudre en silencio. Invierno de Quebec: las pilas de
  moneda pierden capacidad bajo −20 °C — el primer invierno es piloto, no despliegue.
- **"Sangrado" de zonas**: la cajita del almacén oirá balizas dentro de la van estacionada
  en la puerta. Se calibra con umbrales de señal (es LA tarea de ajuste, con una compuerta
  de prueba de ~$70 antes de gastar el resto).
- El firmware de las vans (guardar eventos sin internet y sincronizar al volver) es la
  parte de ingeniería más pesada: ~2–3 fines de semana.
- No es antirrobo de verdad: un ladrón arranca la baliza en segundos. Esto previene la
  pérdida honesta (lo olvidado, lo traspapelado), que es donde se va el dinero real.

## Veredicto

**La ganadora para la autonomía.** Tres evaluaciones independientes (enfoque
dueño-operador, confiabilidad y economía) la eligieron sobre el portal UHF y sobre
quedarse solo con taps: ~90 % de la autonomía del portal por ~15 % del costo, $0/mes, y
una arquitectura que se perdona sus propios errores. Se construye como **Fase 3**, después
de un mes de datos reales con la Fase 1, y solo si esos datos muestran dónde hacen falta
las detecciones automáticas.
