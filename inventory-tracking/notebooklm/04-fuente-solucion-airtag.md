# Solución 4 — AirTags para las máquinas caras (recuperación, no inventario)

*Fuente para NotebookLM. Sistema de inventario de DSS Multiservices. Precios de agosto
2026; detalles y enlaces en la documentación técnica en inglés.*

## Qué es, en una frase

Un **AirTag** escondido en un soporte atornillado dentro de las 5–10 máquinas más caras
(las de $1,000+), para poder **encontrar** un equipo que de verdad desapareció — usando la
red Find My de Apple, donde cualquier iPhone que pase cerca reporta la ubicación de forma
anónima.

## Cómo funciona, explicado simple

El AirTag no sabe dónde está: no tiene GPS. Lo que hace es susurrar por Bluetooth, y
cualquier iPhone del planeta que pase cerca le hace el favor de reportar "lo escuché aquí"
a Apple, cifrado. Como iPhones hay por todas partes (centros comerciales, calles,
edificios), una máquina olvidada en el clóset de un cliente aparece en el mapa de Freddy
en horas, sin que nadie haga nada.

Es la herramienta para el **peor caso**: la autolavadora de $4,500 que quedó en un sitio
hace una semana y nadie recuerda dónde. Abres Find My, ves el edificio, la recuperas. El
AirTag se pagó 150 veces.

## Qué resuelve del flujo que pidió Freddy — y qué no

- **No** manda alertas de salida, **no** asigna responsables, **no** hace el chequeo de
  empaque, **no** habla con Telegram (Apple no da API de Find My). No es un sistema de
  inventario: es un paracaídas.
- **Sí** responde la pregunta "¿dónde terminó?" cuando todo lo demás ya falló.
- Freddy lo intuyó perfecto en su idea original: "AirTags solo para las caras, porque los
  AirTags son caros y no se pegan fácil en cualquier equipo". Exactamente eso dice la
  evidencia.

## Hardware y costos (verificados)

| Artículo | Precio |
|---|---|
| AirTag 2 (precio de calle) | US$24–29 c/u · pack de 4: ~US$89 |
| Soporte impermeable atornillable/remachable (escondido) | US$5–10 c/u |
| Pila CR2032 | ~1 año de duración, reemplazable |
| **Total para 5–10 máquinas** | **≈ CA$200–450, $0/mes** |

Requisito: al menos un dispositivo Apple en la empresa (iPhone/iPad/Mac) para ver el mapa.

## Ventajas

- La mejor red de recuperación del planeta, sin mensualidad.
- Instalación de una tarde; cero software propio.
- Disuasión: una etiqueta "equipo rastreado" bien visible cambia conductas.

## Desventajas y riesgos honestos

- Caro por unidad (~10× una baliza BLE) y voluminoso: no escala a 50 artículos ni se pega
  bien en cualquier herramienta — solo para lo grande y costoso.
- Pila anual ×10 unidades: otra pequeña rutina de mantenimiento.
- Ecosistema Apple obligatorio; el resto del sistema DSS es agnóstico.
- Anti-acoso de Apple: un AirTag que "viaja" con alguien que no es su dueño hace sonar
  alertas en el teléfono de esa persona — para equipo asignado al mismo empleado por
  semanas conviene registrarlo en la cuenta correcta de la empresa.
- En zonas sin iPhones cerca (un depósito rural) puede tardar en reportar.

## Veredicto

**Fase 4 del plan: complemento, no columna vertebral.** Se agrega al final, solo a las
máquinas de $1,000+, cuando el inventario (NFC + BLE) ya funciona. El registro del sistema
solo anota qué artículos llevan AirTag; cuando algo pasa a "PÉRDIDA CONFIRMADA", la alerta
le recuerda a Freddy revisar Find My.
