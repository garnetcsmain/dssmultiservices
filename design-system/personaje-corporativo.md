# DSS Multiservices — Personaje corporativo (vocera realista)

Ficha canónica del personaje (avatar de la asesora/vocera de DSS). Toda generación
de imagen o video del personaje parte de esta ficha: se copia el **prompt maestro**,
se le concatena una **variante de escena**, y listo. Nunca se redacta el personaje
de cero.

Estado del pipeline Higgsfield:

- **Element vigente (usar este):** `dss-asesora-v2` — ID
  `1cfd41e3-b1c7-463f-b089-88b55779d719`. En prompts de imagen/video se referencia
  con `<<<1cfd41e3-b1c7-463f-b089-88b55779d719>>>`; el backend lo reescribe a
  `@dss-asesora-v2`.
- **Master definitiva aprobada:** job `b0bb59fe-1339-4d41-aa97-5454181d76f9`
  (candidata B). Asset oficial: `../brand/dss-vocera-master.png`.
- Element obsoleto: `dss-asesora` (`4e2bb9d7…`, solo identidad facial del boceto
  inicial) — no usar.

---

## 1. Prompt maestro (identidad — no cambia)

```
Retrato corporativo realista de alta calidad, mujer profesional latina ficticia
de unos 38-42 años, elegante y con presencia madura:
- Cabello largo, liso, castaño muy oscuro con reflejos caramelo en las puntas
  (balayage sutil), raya al lado, cayendo sobre un hombro
- Ojos marrón oscuro, grandes, expresivos, con pestañas definidas
- Cejas oscuras bien delineadas, arqueadas
- Sonrisa cálida y serena, expresión amable y segura
- Labios carnosos, maquillaje soft glam con delineado sutil de ojos
- Tono de piel moreno bronceado cálido, rostro ovalado, pómulos altos y marcados
- Figura esbelta y tonificada, porte de modelo, proporciones elegantes
- Collar fino dorado con dije pequeño de cruz
```

## 2. Vestuario de marca (default)

```
Blazer azul marino profundo (navy #003078, color de marca DSS) entallado, corte
clásico de un botón; blusa blanca marfil con cuello cruzado en V estilo drapeado.
Pin/broche discreto opcional con el ícono DSS en el solapa.
```

Variante uniforme de servicio (para escenas de terreno):

```
Polo teal (#007890) con logo DSS bordado en blanco al pecho, pantalón navy;
apariencia pulcra y profesional.
```

## 3. Estilo de render (no cambia)

```
Fotografía corporativa realista, lente 85mm f/2.0, profundidad de campo suave,
iluminación natural lateral de ventana, colores cálidos y limpios, calidad
editorial, apta para uso corporativo. Paleta de acentos: navy #003078,
teal #007890, verde #60A848.
```

Negative prompt / evitar:

```
aspecto caricaturesco, uncanny valley, proporciones exageradas, contenido
sugerente, texto ilegible, manos deformes, marcas de agua, sobre-retoque
plástico de piel
```

## 4. Variantes de escena (concatenar UNA al prompt maestro)

| Uso | Bloque de escena |
|---|---|
| Retrato web/firma | Busto en tres cuartos, sonrisa natural, fondo de oficina moderna desenfocado: ventanal con luz, planta verde, tonos grises cálidos |
| Hero del sitio | Medio cuerpo, brazos cruzados relajados, fondo lobby de edificio residencial moderno con tonos navy y gris |
| Servicios / terreno | Cuerpo entero con uniforme de servicio, tablet en mano, pasillo de inmueble bien iluminado |
| Video explicativo | Medio cuerpo frente a la cámara, gesto de bienvenida con una mano, fondo liso navy #003078 con marca de agua sutil del ícono DSS |
| Redes sociales | Primer plano con expresión alegre, fondo plano teal #007890, espacio negativo a la derecha para texto |

## 5. Flujo de trabajo (Higgsfield)

1. **Master:** generar la imagen master una sola vez (prompt maestro + vestuario
   default + retrato web). Aprobarla visualmente.
2. **Element:** guardar esa imagen como Element (`show_reference_elements`,
   action=create, nombre `dss-asesora`). Anotar el UUID arriba.
3. **Reuso:** en cualquier generación posterior (Nano Banana Pro, Seedream,
   Kling, Cinema Studio…), el prompt solo dice la escena y referencia al
   personaje: `"<<<ELEMENT_ID>>> explicando servicios de conserjería en un
   lobby moderno"` — la identidad viaja con el Element, no con el texto.
4. **Video:** usar la imagen master (o una variante aprobada) como *reference
   image* del primer frame; el Element funciona también en los modelos de video
   soportados.

Regla: si el personaje "se ve distinto", no se parchea el prompt en el momento —
se corrige esta ficha y se regenera, para que la ficha siga siendo la fuente
de verdad.

---

## 6. Registro de trabajo

### 2026-08-09

1. Ficha creada (estilo ilustración 3D) → cambiada a **realista** por decisión de Freddy.
   El personaje es una vocera **ficticia**; no se usan fotos de personas reales como
   referencia de identidad.
2. Batch 1 `soul_cast` (16:9): jobs `1f3c739a` / `dca921ea` — descartados
   (edad y rasgos no convencían).
3. Ajustes a la ficha: edad 38-42, labios carnosos, soft glam, pómulos altos.
4. Batch 2 `soul_cast` (16:9, hoja de personaje frente/espalda/rostro):
   - `f7849063` (seed 677827) — **elegida por Freddy**: cara y tono de piel moreno
     bronceado aprobados. Cuerpo y vestuario a corregir (figura más esbelta,
     vestuario de marca).
   - `cdec463f` (seed 386403) — descartada.
5. Ajuste a la ficha: figura esbelta y tonificada, porte de modelo.
6. **Element `dss-asesora` creado** (`4e2bb9d7-797d-4a0d-91f3-25a8051b2458`) a partir
   del job `f7849063` para congelar la identidad facial.
7. Refinamiento con `nano_banana_flash` (3:4, medio cuerpo, blazer navy, figura
   esbelta) referenciando el Element:
   - Candidata A: job `edac1d82-82c8-45f0-8b75-703bbb60e312`
   - Candidata B: job `b0bb59fe-1339-4d41-aa97-5454181d76f9`
   - **Pendiente:** Freddy elige la master definitiva → recrear el Element desde ese
     job y anotar aquí el nuevo ID.

### 2026-08-10

8. Freddy aprueba la **candidata B** (`b0bb59fe`) como master definitiva.
9. **Element `dss-asesora-v2` creado** (`1cfd41e3-b1c7-463f-b089-88b55779d719`)
   desde la master aprobada — es el Element vigente para toda generación.
10. Master guardada como asset oficial: `brand/dss-vocera-master.png`.

### Pendientes

- [x] Aprobar master definitiva (candidata A o B) y recrear Element desde ella
- [x] Guardar la master aprobada en `../brand/` como asset oficial
- [ ] Generar set de variantes de escena (hero, terreno, video, redes) con el Element
- [ ] Avatar de la empleada real (vía consentimiento directo en plataforma:
      HeyGen/Synthesia para video hablado, o Soul de Higgsfield con fotos aportadas
      por ella) — proyecto separado de esta vocera ficticia
