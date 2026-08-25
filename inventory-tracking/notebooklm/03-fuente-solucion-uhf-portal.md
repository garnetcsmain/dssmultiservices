# Solución 3 — Portal UHF RFID en la puerta (la idea original, con la física y los costos reales)

*Fuente para NotebookLM. Sistema de inventario de DSS Multiservices. Precios de agosto
2026; detalles y enlaces en la documentación técnica en inglés.*

## Qué es, en una frase

La tecnología que **sí** hace lo que Freddy imaginó — etiquetas pasivas sin batería y un
sensor en la puerta que detecta todo lo que pasa caminando — se llama **UHF RFID** (RAIN
RFID / EPC Gen2, 902–928 MHz en Canadá): un lector fijo con 2 antenas en el marco de la
puerta del garaje lee etiquetas a 3–10 metros, cientos por segundo.

## Primero, la corrección de física: por qué NFC no puede hacer esto

La idea original decía "NFC en la puerta". Verificado contra la hoja de datos del propio
fabricante (NXP) y literatura técnica:

- Una etiqueta NFC (la de las calcomanías, NTAG) se lee a **1–10 centímetros**. Es la
  misma tecnología de la tarjeta bancaria: hay que *acercarla* a la terminal.
- El récord de laboratorio con antenas gigantes y potencia fuera de norma: ~25 cm.
- Los lectores "NFC de largo alcance" que existen (~1–2 m, tipo biblioteca) leen **otro
  tipo de etiqueta** (ISO 15693), nunca las calcomanías NTAG.
- Y una puerta de garaje **metálica bloquea el campo por completo**.

Conclusión: no existe el "portal NFC". La versión honesta de esa idea es este portal UHF.

## Cómo funciona, explicado simple

Es lo mismo que las arcadas antirrobo de las tiendas o las puertas de los almacenes de
Amazon: la etiqueta UHF es un espejito de radio sin batería; el lector "ilumina" la puerta
con ondas y lee el reflejo de cada etiqueta que cruza. Con dos antenas (una adentro, una
afuera) se deduce la **dirección**: primero adentro y luego afuera = salió.

En las vans, en vez de portal, se monta un lector pequeño que hace un **inventario del
cargamento** cada 30–60 segundos: "¿qué etiquetas hay ahora dentro de la caja?".

## Qué resuelve del flujo que pidió Freddy

Todo, y con la máxima fidelidad a su idea original: salida del almacén detectada al
segundo, entrada a la van específica, trabajo en progreso (la etiqueta desaparece del
inventario de la van), chequeo de empaque al encender el motor. Telegram y responsable
igual que las otras soluciones.

## Hardware y costos (verificados, agosto 2026)

| Artículo | Precio |
|---|---|
| Lector fijo Impinj R700 (4 puertos) | US$1,499 (otros distribuidores: $1,730–2,185) |
| Lector fijo Zebra FX7500 | ~US$1,050–1,345 (MSRP ~$1,945) |
| Alternativa económica: Chainway UR4 | ~US$535 · lector integrado Yanzeo SR682: US$209 |
| Antenas de panel (2 por puerta) | US$60–192 c/u |
| Etiquetas **anti-metal** UHF (obligatorias en máquinas) | US$0.43–4.17 c/u |
| Kit por vehículo (Raspberry Pi + módulo lector certificado + antena + LTE) | ~US$450–570 por van |
| **Portal del garaje instalado** | **≈ CA$2,000–2,600** |
| **Sistema completo (1 portal + 3 vehículos + etiquetas)** | **≈ CA$4,700–5,900 nuevo / CA$3,000–3,500 con lector reacondicionado** |
| Costo mensual (SIMs LTE de los vehículos) | ~CA$25–45/mes |

## Ventajas

- La detección de puerta más fiel a la idea original: automática, al instante, sin pilas
  en las etiquetas (nada de cambios de batería).
- Tecnología industrial probada (los precedentes existen: Ford y DeWalt vendieron vans con
  este sistema integrado de fábrica en 2009).
- Lee decenas de artículos a la vez: la carga de la mañana entera en un solo cruce.

## Desventajas y riesgos honestos

- **Precio**: 6–8 veces la solución BLE, más una mensualidad. Un portal cuesta más que
  todo el resto del sistema junto.
- **El peor caso físico es justamente el equipo de limpieza**: metal mojado. Aun los
  buenos portales logran 90–99 % de lecturas por artículo (no 100 %), y una lectura de
  puerta perdida en un diseño "por eventos" deja la base de datos mal *para siempre* —
  hay que construir encima la misma maquinaria de reconciliación que BLE trae gratis.
- Lectores baratos de AliExpress frecuentemente **no tienen certificación ISED** para
  operar en 902–928 MHz en Canadá: no comprarlos.
- En la van, la radio UHF "se sale" por las ventanas y lee etiquetas de afuera; ajustar
  potencia y antenas en una caja metálica es un proyecto en sí.
- Mantenimiento: 4 lectores + 4 Raspberry Pi + PoE + coaxiales + LTE, sostenidos por una
  sola persona que además dirige una empresa de limpieza.

## Veredicto

**Correcta pero sobredimensionada para DSS hoy.** Es la respuesta adecuada para una
operación de 15+ personas con alta rotación de equipo. Al tamaño actual, la combinación
NFC (identidad) + BLE (autonomía) entrega ~90 % del valor por ~15 % del precio. El plan la
deja **estacionada**, con el modelo de datos ya preparado para enchufarla algún día como
una fuente de eventos más — sin rehacer nada, solo pagando el hardware.
