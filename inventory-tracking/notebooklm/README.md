# Paquete NotebookLM — Inventario DSS (en español)

Esta carpeta contiene el material listo para alimentar **NotebookLM** (notebooklm.google.com)
y generar resúmenes, audio-podcasts y sesiones de preguntas en español sobre el sistema de
inventario. Todo el contenido técnico proviene de los documentos en `../docs/` (en inglés,
con fuentes verificadas); aquí está reescrito en español claro, un archivo por solución,
para que NotebookLM pueda comparar las opciones sin mezclarlas.

## Cómo usarlo (3 minutos)

1. Entra a notebooklm.google.com y crea un cuaderno nuevo: **"Inventario DSS"**.
2. Sube como **fuentes** los 6 archivos de esta carpeta (o pega su contenido):
   - `01-fuente-solucion-nfc-tap.md`
   - `02-fuente-solucion-ble-zonas.md`
   - `03-fuente-solucion-uhf-portal.md`
   - `04-fuente-solucion-airtag.md`
   - `05-fuente-plan-recomendado.md`
   - `00-guion-podcast.md` (opcional como fuente; también sirve como guion propio)
3. Opcional: sube también los documentos de `../docs/` si quieres que NotebookLM pueda
   citar los precios y las fuentes originales en inglés.
4. En **Resumen de audio → Personalizar**, define el idioma de salida en español y pega
   una instrucción como la de abajo.

### Instrucción sugerida para el resumen de audio

> Explica en español sencillo, para el dueño de una pequeña empresa de limpieza y su
> equipo (no ingenieros), las cuatro soluciones posibles para rastrear el equipo de
> trabajo: etiquetas NFC con tap, zonas Bluetooth (BLE), portales UHF RFID y AirTags.
> Compara costo, autonomía y confiabilidad, explica por qué el NFC no puede detectar
> nada "al pasar por la puerta", y termina con el plan recomendado por fases. Usa las
> historias de uso (el cable olvidado en el sitio, la carga de la van a las 6:45 a.m.).

### Preguntas buenas para hacerle al cuaderno

- ¿Por qué no sirve un sensor NFC en la puerta del garaje?
- ¿Qué solución cuesta menos por mes y por qué?
- ¿Qué pasa si un empleado olvida hacer el tap?
- ¿Cuándo valdría la pena el portal UHF?
- ¿Qué hay que responder antes de comprar hardware?
- ¿Cómo se le presenta el sistema al equipo para que no lo sienta como vigilancia?

## Contenido de cada archivo

| Archivo | Qué explica |
|---|---|
| `00-guion-podcast.md` | Guion completo estilo podcast (2 voces, ~10–12 min) que recorre el problema, la física, las 4 soluciones y el plan |
| `01…nfc-tap` | Solución 1: etiquetas NFC + tap con el teléfono + bot de Telegram (la fase inicial) |
| `02…ble-zonas` | Solución 2: balizas BLE + cajitas ESP32 que escuchan por zona (la autonomía) |
| `03…uhf-portal` | Solución 3: portales UHF RFID en las puertas (la idea original, con costos reales) |
| `04…airtag` | Solución 4: AirTags para las máquinas caras (recuperación, no inventario) |
| `05…plan-recomendado` | El plan combinado por fases, costos totales, riesgos y preguntas abiertas |
