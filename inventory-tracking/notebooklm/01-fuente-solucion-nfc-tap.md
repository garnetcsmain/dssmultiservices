# Solución 1 — Etiquetas NFC + tap con el teléfono ("la tarjeta de biblioteca")

*Fuente para NotebookLM. Sistema de inventario de DSS Multiservices (empresa de limpieza,
Quebec). Precios de agosto 2026; detalles y enlaces en la documentación técnica en inglés.*

## Qué es, en una frase

Cada máquina y herramienta lleva una **calcomanía NFC** barata, delgada y a prueba de agua;
al **tocarla con cualquier teléfono** (3 segundos, sin instalar ninguna app) se abre el bot
de Telegram de DSS con el artículo ya identificado, y con un botón se registra "lo tomé →
Van 1", "trabajo iniciado", "devuelto", etc.

## Cómo funciona, explicado simple

Es exactamente el truco de la biblioteca: cada libro tiene su código, y cada vez que cruza
el mostrador, alguien lo escanea. Aquí el "mostrador" es el teléfono del empleado:

1. La etiqueta NFC no tiene batería: se alimenta del propio teléfono al acercarlo, igual
   que una tarjeta bancaria en la terminal.
2. Dentro de la etiqueta va grabado un enlace del tipo `t.me/DssInventoryBot?start=i-VAC03`.
   Al tocarla, el teléfono abre ese enlace y el bot ya sabe que se trata de la aspiradora
   VAC-03.
3. Como el bot sabe *quién* es el dueño de ese Telegram, **el responsable se asigna solo**:
   si María hizo los taps de carga, María queda como responsable y Freddy solo recibe un
   aviso informativo con botón [Cambiar].
4. El teléfono puede compartir su **ubicación GPS en ese momento** (un botón, opcional):
   así queda el pin de "dónde empezó el trabajo" sin comprar ningún rastreador.

## Qué resuelve del flujo que pidió Freddy

- **Alerta de salida en Telegram** con lista de artículos: sí (agrupada, un solo mensaje).
- **Asignar responsable**: sí, y casi siempre automático (quien tapea, es).
- **Lista de cosas para el responsable**: sí, el bot se la envía al asignarse (`/mine`).
- **Trabajo en progreso**: sí, con un tap en el sitio (con pin GPS opcional).
- **Chequeo al empacar** ("que no se olvide nada"): sí — al marcar la salida del sitio, el
  bot compara la lista del viaje con lo devuelto y avisa *al empleado primero*:
  "Falta el cable de extensión EXT-04, ¡revisa antes de arrancar!".
- **Detección automática al pasar por la puerta**: **no**. Esta solución requiere el tap.
  (Ver la fuente de la solución BLE, que añade la autonomía después.)

## Hardware y costos (verificados)

| Artículo | Para qué | Precio |
|---|---|---|
| Etiqueta NFC anti-metal (NTAG213/216 con respaldo de ferrita) | máquinas con cuerpo metálico — las calcomanías normales **mueren sobre metal** | ~US$1.00–1.50 c/u |
| Calcomanía NFC (NTAG215, laminada) | herramientas plásticas, carritos, bins | ~US$0.30 c/u |
| Llavero epóxico con brida (zip-tie) | mangueras, cables, lo que no tiene superficie plana | ~US$0.50–1 c/u |
| Etiqueta impresa con código + QR | respaldo humano cuando el NFC falla | rotuladora ~CA$40–60 |
| **Total Fase 1 (≈50 artículos)** | | **≈ CA$100–150, $0/mes** |

El software corre en el servidor que DSS ya tiene ("maple"): sin mensualidades, sin nube
de pago, Telegram es gratis.

## Ventajas

- El costo de entrada más bajo de todas las soluciones, por mucho.
- Etiquetas delgadas, sin batería, resistentes al agua — exactamente lo que pidió Freddy.
- Sin app: el tap funciona en Android nativo y en iPhone XS o más nuevo.
- La red de seguridad nocturna: un resumen diario a las 20:00 convierte cualquier tap
  olvidado en una corrección de la mañana siguiente, nunca en datos podridos.
- Todo lo que se construye aquí (base de datos, bot, flujos) **se reutiliza tal cual** en
  las fases siguientes: nada se bota.

## Desventajas y riesgos honestos

- **Depende de la disciplina humana**: si el equipo no tapea a las 6 a.m. con prisa, el
  dato no existe hasta la reconciliación nocturna. Es el riesgo #1 y la razón de que la
  autonomía (BLE) exista como fase siguiente.
- Sobre metal hay que usar las etiquetas anti-metal (más caras) y en zonas de golpes se
  presupuesta ~10 % de reposición al año.
- El equipo hoy usa WhatsApp: hay que lograr que instalen Telegram (tarea de adopción, no
  técnica).
- Con guantes de invierno no se puede tapear — otro empujón hacia la fase BLE.

## Veredicto

**Es la fase 1 obligatoria de cualquier camino.** Entrega el 100 % del flujo pedido
(alertas, responsable, chequeo de empaque) por ~CA$150, en 2–3 fines de semana, y queda
para siempre como la capa de identidad y el "modo manual" cuando todo lo demás falle.
Su límite es la autonomía: para que nadie tenga que tapear, ver la Solución 2 (BLE).
