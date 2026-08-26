# Guion de podcast — "¿Dónde está la hidrolavadora?" (≈10–12 minutos, 2 voces)

*Guion en español listo para grabar o para guiar el resumen de audio de NotebookLM.
VOZ A = conductor/a curioso/a. VOZ B = experto/a que explica. Tono: conversación real,
cero jerga innecesaria.*

---

**VOZ A:** Hoy tenemos una historia que le va a sonar a cualquiera que dirija una empresa
con herramientas: llegas el lunes, necesitas la hidrolavadora... y nadie sabe dónde está.
¿En el almacén? ¿En la van de alguien? ¿Olvidada donde un cliente hace dos semanas?

**VOZ B:** Y cada una de esas preguntas cuesta dinero. Una aspiradora profesional son
cientos de dólares; una autolavadora de pisos, tres, cuatro, seis mil. Y lo curioso es que
casi nunca es robo: es equipo *olvidado*. Se queda enchufado detrás del mostrador de un
cliente, se queda en la otra van, se queda "por ahí".

**VOZ A:** El caso de hoy es DSS, una empresa de limpieza en Quebec. El dueño, Freddy,
tuvo una idea muy concreta: ponerle una calcomanía NFC a cada máquina y un sensor en la
puerta del almacén, para que el sistema detecte solo lo que sale, le avise por Telegram,
él asigne un responsable... y cuando el equipo empaca al terminar el trabajo, el sistema
revise que no falte nada.

**VOZ B:** Y quiero decir esto primero: el *flujo* que diseñó Freddy es excelente. Alerta,
responsable, trabajo en progreso, chequeo al empacar. Ese es exactamente el diseño
correcto. Solo hay un problema... de física.

**VOZ A:** El sensor de la puerta.

**VOZ B:** Exacto. Una etiqueta NFC —la misma tecnología de tu tarjeta bancaria— se lee a
uno, cinco, máximo diez *centímetros*. Lo dice la hoja de datos del propio fabricante. Por
eso en la tienda tienes que *acercar* la tarjeta a la terminal. No existe el "portal NFC"
que detecte una aspiradora pasando por una puerta de garaje a un metro del sensor. Y hay
un detalle extra: una puerta metálica *bloquea* el campo por completo.

**VOZ A:** O sea, la idea original, tal cual, es imposible.

**VOZ B:** Tal cual, sí. Pero aquí viene lo interesante: eso no mata el proyecto, lo
*divide* en las herramientas correctas. Se estudiaron cuatro soluciones, cada una hace un
trabajo distinto, y la respuesta final las combina. ¿Las recorremos?

**VOZ A:** Dale. Solución uno.

**VOZ B:** **La etiqueta NFC con tap** — la "tarjeta de biblioteca". Cada máquina lleva su
calcomanía: barata, como treinta centavos, o un dólar y medio la versión anti-metal;
delgada, impermeable, sin batería. Dentro va grabado un enlace. El empleado la toca con su
teléfono —tres segundos, sin instalar nada— y se abre el bot de Telegram de DSS con el
artículo ya identificado: "¿Te lo llevas? ¿A qué van?". Un botón y listo.

**VOZ A:** Pero eso requiere que la persona haga el tap.

**VOZ B:** Sí, esa es su debilidad y hay que decirla de frente. Pero mira lo que da a
cambio: como el bot sabe de quién es ese Telegram, el responsable se asigna *solo* — si
María cargó la van, María queda responsable y Freddy solo recibe el aviso. El teléfono
puede regalar un pin de GPS en ese momento, así que el "trabajo en progreso" queda con
ubicación sin comprar ningún rastreador. Y lo mejor: el chequeo de empaque. Al marcar la
salida del sitio, el bot compara la lista del viaje con lo devuelto y le escribe *al
empleado primero*: "Falta el cable de extensión. Revisa antes de arrancar."

**VOZ A:** Mientras todavía está ahí y puede ir a buscarlo caminando.

**VOZ B:** Ese es el momento que vale oro. Ese cable eran sesenta dólares perdidos y una
hora de regreso la semana siguiente. Ahora son dos minutos. Todo esto —todo el flujo que
pidió Freddy— cuesta unos ciento cincuenta dólares canadienses en etiquetas y cero por
mes, porque corre en un servidor que la empresa ya tiene y Telegram es gratis.

**VOZ A:** Bien. Pero Freddy quería que fuera *automático*. Solución dos.

**VOZ B:** **Las zonas Bluetooth, BLE.** Imagínate que cada máquina llevara un grillo que
canta "aquí estoy" cada dos segundos. Y que en cada lugar importante —el almacén, cada
van, el tráiler— pusieras una cajita de diez dólares que solo *escucha* grillos. Si el
grillo de la pulidora se oye en el almacén, ahí está. Si empieza a oírse en la Van 1, se
cargó en la Van 1. Si la van está donde el cliente y el grillo deja de oírse... la máquina
se bajó a trabajar. Automático, sin que nadie tapee nada.

**VOZ A:** ¿Y el chequeo de empaque?

**VOZ B:** Mejor todavía: cuando el chofer enciende el motor para irse, la cajita de la
van compara su lista contra lo que oye. ¿Falta un grillo? Suena un *zumbador* ahí mismo,
en la van — y eso funciona aunque no haya ni una barra de señal. Y de regalo: cualquier
cosa que salga del almacén a las dos de la mañana dispara una alarma inmediata. Esa es la
única función realmente antirrobo de todo el sistema, y es casi gratis.

**VOZ A:** ¿Trampas?

**VOZ B:** Tres honestas. Las balizas llevan pila de reloj: dura uno a cuatro años, pero
con cincuenta etiquetas son dos o tres cambios al mes — el bot manda un resumen de
baterías para que no se pudra en silencio. El metal: una baliza pegada plana sobre acero
pierde señal, y encerrada en metal queda muda — se monta con un separador plástico y se
prueba con muestras antes de comprar cincuenta. Y el invierno de Quebec: a veinte bajo
cero las pilas flaquean — el primer invierno se trata como piloto. Todo el paquete:
cuatrocientos a setecientos cincuenta dólares, una vez, cero mensualidad.

**VOZ A:** Solución tres: lo que sí detecta la puerta.

**VOZ B:** **El portal UHF RFID.** Esta es la tecnología que Freddy estaba imaginando sin
saberlo: las arcadas de las tiendas, las puertas de los almacenes industriales. Etiquetas
pasivas sin batería que se leen a tres, cinco, diez metros, cientos por segundo. Dos
antenas en el marco del garaje y sabes qué salió y en qué dirección, al segundo.

**VOZ A:** Suena perfecto. ¿Cuánto?

**VOZ B:** Ahí está el golpe: el lector bueno cuesta mil quinientos dólares americanos, y
el portal completo instalado queda en dos mil a dos mil seiscientos canadienses... por
puerta. El sistema completo con lectores en las vans: cuatro mil setecientos a casi seis
mil, más mensualidad de datos. Y hay una ironía cruel: el peor enemigo de esa radio es el
*metal mojado* — o sea, exactamente lo que es el equipo de limpieza. Aun los buenos
portales leen el noventa a noventa y nueve por ciento, no el cien, y cada lectura de
puerta perdida deja la base de datos mal para siempre si no construyes encima toda una
maquinaria de corrección.

**VOZ A:** ¿Veredicto?

**VOZ B:** Correcta pero sobredimensionada. Es la respuesta para una operación de quince o
más personas. Hoy, las zonas BLE dan como el noventa por ciento de esa autonomía por el
quince por ciento del precio. El plan la deja estacionada, con el sistema ya preparado
para enchufarla el día que se justifique.

**VOZ A:** Y la cuarta: los AirTags.

**VOZ B:** El paracaídas. El AirTag no es inventario — no avisa, no asigna responsables —
pero cuando una máquina de cuatro mil quinientos dólares desapareció de verdad, cualquier
iPhone que pase cerca reporta su ubicación a la red de Apple. Abres el mapa: está en un
clóset del Complexe Y. Recuperada. A veinticinco o treinta dólares por unidad más un
soporte atornillado escondido, se ponen solo en las cinco o diez máquinas caras. Freddy
lo intuyó exactamente así en su idea original, y la evidencia le da la razón.

**VOZ A:** Entonces el plan final no elige una: las apila.

**VOZ B:** Como capas. **Fase cero**: media jornada de censo — código, foto, número de
serie, valor de cada artículo. Eso ya vale oro para el seguro aunque no se construya nada
más. **Fase uno**: las etiquetas NFC y el bot — todo el flujo funcionando por ciento
cincuenta dólares. **Fase dos**: una estación de tap en la puerta del almacén, y la alarma
de fuera de horario. **Fase tres**: las cajitas BLE — se acabaron los taps; con una regla
importante: solo se compra después de un mes de datos reales y de una prueba de setenta
dólares que confirme que la radio funciona en *ese* garaje con *esas* máquinas mojadas.
**Fase cuatro**: AirTags a las joyas de la corona. Total: menos de mil quinientos
canadienses, cero mensualidad, y cada fase se sostiene sola.

**VOZ A:** Antes de cerrar: ¿qué puede matar este proyecto?

**VOZ B:** Dos cosas, y ninguna es técnica. Primera: las falsas alarmas. Un sistema que
molesta con avisos equivocados termina silenciado en un mes — por eso todo va agrupado,
editado en el mismo mensaje, silencioso para lo esperado, y con un criterio escrito de
"si alerta mal dos veces por semana, se apaga y volvemos al modo manual". Y segunda: la
gente. Si el equipo siente que "responsable" significa "culpable", se acabó. Esto se
presenta al revés, y por escrito: el registro es la *prueba de que tú sí lo devolviste*.
Primer mes sin culpas, no afecta el pago, se rastrea a las máquinas y no a las personas —
y en Quebec eso además tiene su lado legal, la Ley 25: aviso al personal en francés,
responsable de privacidad, y decidir la retención de datos con abogado.

**VOZ A:** Resumen de una frase.

**VOZ B:** La magia nunca estuvo en el sensor de la puerta: está en **comparar listas
entre puertas**. Etiqueta barata en cada máquina, una lectura en cada cruce, y un bot que
avisa a la persona correcta en el momento en que todavía puede caminar a buscar el cable.
Empezar con el censo, este mes, cuesta cero.

**VOZ A:** "¿Dónde está la hidrolavadora?" — pues ahora, el bot lo sabe. Gracias por
escuchar.

---

*Fin del guion. Duración estimada: 10–12 minutos a ritmo de conversación.*
