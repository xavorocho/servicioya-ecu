---
name: ServicioYa ECU
description: Red de barrio en movimiento para resolver servicios del hogar con confianza.
colors:
  petrol-ink: "#082f32"
  petrol-raised: "#12484a"
  neighborhood-orange: "#ff5a1f"
  neighborhood-orange-deep: "#d94311"
  warm-paper: "#f3f1eb"
  warm-white: "#fffefa"
  quiet-line: "#d8ddd8"
  secondary-text: "#66716f"
  verified-teal: "#087567"
typography:
  display:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(48px, 6.1vw, 88px)"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(34px, 4vw, 56px)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "0.13em"
rounded:
  square: "0px"
  control: "8px"
  field: "14px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  section: "100px"
components:
  button-primary:
    backgroundColor: "{colors.neighborhood-orange}"
    textColor: "{colors.warm-white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "14px 18px"
  button-primary-hover:
    backgroundColor: "{colors.neighborhood-orange-deep}"
    textColor: "{colors.warm-white}"
  button-quiet:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.petrol-ink}"
    rounded: "{rounded.square}"
    padding: "10px 13px"
  input-command:
    backgroundColor: "{colors.petrol-ink}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.square}"
    padding: "15px 20px"
  card-provider:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.petrol-ink}"
    rounded: "{rounded.square}"
    padding: "25px"
---

# Design System: ServicioYa ECU

## Overview

**Creative North Star: "Red de barrio en movimiento"**

ServicioYa se comporta como una interfaz de despacho confiable para hogares ecuatorianos: clara como una herramienta moderna, cercana como una recomendación del barrio y suficientemente enérgica para convertir una necesidad en acción. La composición combina un panel de comando oscuro superpuesto con recorridos editoriales abiertos, haciendo visible la secuencia necesidad, búsqueda, comparación y solicitud.

La expresión visual prioriza al cliente sin rebajar al proveedor. Las necesidades ocupan el primer plano; los profesionales aparecen como resultados verificables, con oficio, ciudad, experiencia, disponibilidad y acción. La energía proviene del contraste, el ritmo tipográfico y un único naranja eléctrico, no de adornos ni afirmaciones sin evidencia.

**Key Characteristics:**

- Fondo papel cálido y superficies claras que evitan la frialdad clínica.
- Tinta petróleo para estructura, confianza y paneles de comando.
- Un solo acento naranja para acciones y señales de avance.
- Retícula editorial asimétrica, divisores visibles y esquinas mayormente rectas.
- Fotografía humana y auténtica como contexto, nunca como decoración genérica.

## Colors

La paleta enfrenta tinta petróleo con papel cálido y reserva el naranja de barrio para los momentos que deben mover al usuario.

### Primary

- **Tinta petróleo:** estructura navegación, titulares sobre fondos claros y paneles de comando.
- **Petróleo elevado:** variación de apoyo para estados oscuros y profundidad tonal.

### Secondary

- **Naranja de barrio:** llamadas a la acción, índices, iconos clave y progreso.
- **Naranja de barrio profundo:** estados hover y enlaces de acción sobre superficies claras.

### Neutral

- **Papel cálido:** fondo continuo de la aplicación.
- **Blanco cálido:** tarjetas, menús y superficies elevadas.
- **Línea tranquila:** bordes, divisores y retículas.
- **Texto secundario:** explicaciones, metadatos y contenido de menor jerarquía.
- **Verde verificado:** estados de identidad comprobada; no funciona como segundo acento promocional.

**The One Signal Rule.** El naranja es la única voz de acción; no compite con púrpuras, azules o degradados promocionales.

**The Evidence Color Rule.** El verde aparece únicamente cuando comunica un estado real de verificación o éxito.

## Typography

**Display Font:** Aptos (con Segoe UI Variable, Segoe UI y system-ui como alternativas)

**Body Font:** Aptos (con Segoe UI Variable, Segoe UI y system-ui como alternativas)

**Character:** Una sola familia sans serif permite que el contraste nazca de peso, escala y ritmo. Los titulares son compactos y contundentes; el texto funcional permanece familiar y legible.

### Hierarchy

- **Display** (900, escala fluida grande, interlínea muy cerrada): promesa principal del hero.
- **Headline** (900, escala fluida media, interlínea compacta): títulos de secciones y estados importantes.
- **Title** (900, tamaño medio): categorías, profesionales y nombres de bloques.
- **Body** (400, tamaño regular, interlínea amplia): explicación y orientación; mantener líneas breves en zonas de decisión.
- **Label** (900, espaciado amplio, mayúsculas): índices editoriales, categorías de información y rótulos breves.

**The Compact Promise Rule.** Los titulares grandes usan interlínea cerrada y ancho controlado; nunca se estiran como una franja horizontal.

**The Label Is Navigation Rule.** Las mayúsculas espaciadas identifican recorridos y secciones, no párrafos ni mensajes de error.

## Layout

El ancho operativo máximo es de 1300px dentro de un lienzo de hasta 1600px. En escritorio, el primer viewport combina una fotografía de borde a borde con el texto alineado al contenedor y un comando superpuesto en la base. Las secciones alternan riel editorial lateral, retículas de dos columnas, listas comparables y bloques de profundidad completa.

La separación vertical de las secciones principales es amplia; dentro de componentes, el ritmo se comprime a pasos pequeños y medios. A 1050px la navegación cambia a menú y las retículas densas se reducen. Cerca de 700px el contenido pasa a una columna, el comando se apila y los márgenes laterales bajan a 14–20px.

**The Command First Rule.** La acción de buscar debe permanecer dentro del primer viewport y preceder cualquier explicación extensa.

**The Client Leads Rule.** La necesidad y actividad del cliente dominan el orden; la invitación para proveedores conserva una sección propia y visible, pero posterior.

## Elevation & Depth

El sistema es plano por defecto y utiliza divisores y contraste tonal como estructura. Las sombras son ambientales y se reservan para menús flotantes, comandos superpuestos y tarjetas que responden al hover; no sustituyen la jerarquía del layout.

### Shadow Vocabulary

- **Comando ambiental** (`0 24px 70px rgba(8, 47, 50, .13)`): paneles superpuestos y menús de navegación.
- **Tarjeta en reposo** (`0 12px 30px rgba(8, 47, 50, .06)`): proveedores sobre papel.

**The Flat-by-Default Rule.** Una superficie en reposo se separa primero por tono o línea; la sombra aparece cuando flota o responde.

## Shapes

La silueta principal es recta y editorial. Hero, comando, categorías, botones y tarjetas de proveedor usan esquinas cuadradas. Los controles utilitarios heredados pueden conservar curvas moderadas de 8–14px cuando mejoran reconocimiento y tactilidad, pero no deben convertir cada contenedor en una cápsula. Los avatares del sistema principal también son cuadrados.

**The Structural Edge Rule.** Las superficies de navegación y decisión mantienen bordes rectos; las curvas pertenecen a controles auxiliares, no a toda la página.

## Components

### Buttons

- **Shape:** bloque rectangular, sin radio en las acciones principales.
- **Primary:** fondo naranja, texto blanco, peso alto y separación compacta.
- **Hover / Focus:** oscurece el naranja en 160ms; el foco visible no depende del color por sí solo.
- **Secondary / Quiet:** fondo cálido o transparente con tinta petróleo y borde de línea tranquila.

### Cards / Containers

- **Corner Style:** recto en la experiencia principal.
- **Background:** blanco cálido sobre papel cálido; petróleo para comandos o llamadas institucionales.
- **Shadow Strategy:** ambiental y sutil, con mayor elevación únicamente al hover.
- **Border:** una línea fina define la retícula y permite comparar.
- **Internal Padding:** 24–25px en tarjetas de proveedor y bloques operativos.

### Inputs / Fields

- **Style:** los campos del comando se integran en el panel petróleo; los formularios extensos usan superficie clara, borde visible y radio moderado.
- **Focus:** contorno o anillo claramente visible sin mover el layout.
- **Error / Disabled:** el error se explica junto al campo; los estados no se animan ni dependen solo del color.

### Navigation

La barra es clara, fija y ligeramente translúcida. El acceso a servicios abre un panel estructurado en dos columnas en escritorio y una lista apilada en móvil. El estado activo usa un cambio tonal sobrio; registro o acción primaria usa naranja. Las aperturas duran cerca de 180ms, parten del disparador y animan solo opacidad y transformación.

### Search Command

El comando es el componente firma: un panel petróleo superpuesto a la fotografía, con contexto, servicio, ciudad y una única acción naranja. En móvil se apila sin ocultar etiquetas ni alterar el orden de lectura.

### Provider Result

Presenta identidad, oficio y ciudad primero; descripción y evidencia después; perfil y solicitud al final. La verificación usa verde semántico y la solicitud usa el único acento de acción.

## Do's and Don'ts

### Do:

- **Do** ubicar la búsqueda o la siguiente acción del cliente antes de contenido explicativo largo.
- **Do** usar tinta petróleo, papel cálido y divisores para construir jerarquía antes de añadir sombra.
- **Do** reservar naranja para acciones, progreso e iconos clave.
- **Do** mostrar información comprobable del proveedor cerca de cada decisión.
- **Do** respetar `prefers-reduced-motion` y conservar foco visible, contraste y etiquetas explícitas.

### Don't:

- **Don't** introducir púrpura, azul promocional, degradados de marca o múltiples acentos.
- **Don't** redondear cada tarjeta, botón y contenedor hasta convertirlos en cápsulas.
- **Don't** inventar testimonios, métricas, garantías o disponibilidad que el producto no pueda demostrar.
- **Don't** esconder el camino de proveedores aunque el cliente conserve la prioridad.
- **Don't** usar animaciones continuas o movimiento decorativo en formularios y validaciones.
