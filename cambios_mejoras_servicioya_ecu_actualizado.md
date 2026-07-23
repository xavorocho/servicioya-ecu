# ServicioYa ECU — Cambios y mejoras solicitadas después de la prueba

**Objetivo:** registrar de forma ordenada los errores encontrados y las mejoras necesarias para que el sistema ServicioYa ECU funcione con una lógica más realista, usable y completa.

---

## 1. Correcciones urgentes de registro e inicio de sesión

### 1.1. Corregir crear cuenta como cliente

Actualmente el registro como cliente no funciona correctamente. Se debe revisar todo el flujo:

- Validación de campos obligatorios.
- Validación de correo electrónico.
- Validación de teléfono.
- Validación de contraseña y confirmación de contraseña.
- Creación del usuario con rol `cliente`.
- Guardado correcto en base de datos.
- Mensajes claros de éxito o error.
- Redirección correcta después de crear o verificar la cuenta.

**Resultado esperado:** el cliente debe poder registrarse, verificar su correo e iniciar sesión correctamente.

---

### 1.2. Corregir crear cuenta como proveedor

Actualmente el registro como proveedor no funciona correctamente. Se debe revisar:

- Que el formulario envíe datos personales, datos profesionales y documentos.
- Que el backend reciba correctamente `multipart/form-data`.
- Que se cree el usuario con rol `proveedor`.
- Que se cree el perfil del proveedor.
- Que se suban documentos y fotos correctamente.
- Que se guarden las URLs de los archivos en la base de datos.
- Que el proveedor quede con estado `pendiente` o `pendiente_verificacion`.
- Que el administrador pueda verlo en verificaciones.
- Que el sistema muestre un mensaje de éxito o error.

**Resultado esperado:** cuando alguien se registre como proveedor, el sistema debe guardar su información, documentos y dejarlo pendiente de aprobación por el administrador.

---

### 1.3. Verificación de correo antes de activar la cuenta

El sistema no debe permitir crear cuentas activas con correos que no existan. Se debe implementar verificación de correo.

Flujo recomendado:

1. Usuario llena el formulario de registro.
2. Sistema valida campos.
3. Sistema envía un correo con botón o enlace de verificación.
4. Usuario abre el correo y presiona el botón de validación.
5. Recién ahí la cuenta queda creada o activada.
6. El usuario puede iniciar sesión.

**Importante:** si se guarda algo antes de verificar el correo, debe quedar como cuenta temporal o pendiente, no como cuenta activa.

Estados sugeridos:

- `pending_email_verification`
- `active`
- `blocked`

**Resultado esperado:** el usuario solo puede usar el sistema después de verificar su correo.

---

### 1.4. Mejorar Google Authentication por roles

Ya está agregado iniciar sesión con Google, pero actualmente crea automáticamente una cuenta de cliente. Eso debe corregirse porque un proveedor también puede registrarse con Google.

Flujo correcto:

1. Usuario presiona “Continuar con Google”.
2. Google autentica la cuenta.
3. El sistema revisa si el usuario ya existe.
4. Si no existe, debe preguntar qué tipo de cuenta quiere crear:
   - Cliente.
   - Proveedor.
5. Si escoge cliente, se crea perfil de cliente.
6. Si escoge proveedor, debe completar datos profesionales y subir documentos.
7. El proveedor queda pendiente de aprobación del administrador.

**Resultado esperado:** Google Authentication no debe crear automáticamente cuentas de cliente. Debe permitir elegir rol antes de finalizar el registro.

---

### 1.5. Mejorar todo el módulo de autenticación

Se debe mejorar por completo la parte de iniciar sesión y registrarse.

Debe incluir:

- Registro normal con correo y contraseña.
- Registro con Google.
- Login normal.
- Login con Google.
- Verificación de correo.
- Recuperación de contraseña.
- Protección de rutas por rol.
- Redirección automática según rol.
- Mensajes de error y éxito.
- Cierre de sesión correcto.
- Persistencia de sesión.

**Resultado esperado:** el cliente, proveedor y administrador deben entrar únicamente a sus pantallas correspondientes.

---

## 2. Términos de uso y condiciones

### 2.1. Mostrar términos antes de aceptar

En el registro aparece la casilla para aceptar términos, pero el usuario debe poder ver qué está aceptando.

Agregar:

- Link “Ver términos de uso y condiciones”.
- Modal o página con los términos.
- Botón para cerrar.
- Casilla obligatoria de aceptación.
- Registro de fecha y versión aceptada.

**Resultado esperado:** el usuario puede leer los términos antes de marcar la casilla.

---

### 2.2. Contenido mínimo de términos

Los términos deben explicar:

- Qué es ServicioYa ECU.
- Responsabilidades del cliente.
- Responsabilidades del proveedor.
- Verificación de proveedores.
- Uso de documentos e imágenes.
- Tratamiento de datos personales.
- Condiciones de cotización.
- Condiciones de pagos o reservas.
- Políticas de cancelación.
- Reportes y reclamos.
- Motivos para suspender cuentas.

Se recomienda guardar en base de datos:

- `termsAccepted`
- `termsAcceptedAt`
- `termsVersion`

**Resultado esperado:** el sistema queda más serio y formal para una plataforma real.

---

## 3. Mejoras en fotos de perfil

### 3.1. Foto de perfil del proveedor no se muestra al cliente

Se subió una foto de perfil al proveedor, pero cuando el cliente entra al perfil del proveedor no aparece.

Revisar:

- Que la foto se suba correctamente al storage o Cloudinary.
- Que la URL se guarde en la base de datos.
- Que el backend devuelva el campo `photoUrl` o equivalente.
- Que el frontend use esa URL en el catálogo y perfil público.
- Que si no existe foto se muestre un avatar por defecto.

Debe mostrarse en:

- Tarjeta del catálogo.
- Perfil público del proveedor.
- Panel del proveedor.
- Verificación del administrador.

**Resultado esperado:** el cliente debe ver la foto real del proveedor al revisar su perfil.

---

### 3.2. Fotos para todos los usuarios

Todos los usuarios deberían tener foto de perfil:

- Cliente.
- Proveedor.
- Administrador.

En el caso del proveedor se recomienda pedir:

- Foto de perfil pública.
- Foto frontal para verificación.
- Foto lateral o adicional para verificación.

**Resultado esperado:** el sistema se ve más profesional y confiable.

---

## 4. Mejoras en solicitud de servicio del cliente

### 4.1. Quitar texto interno del resumen

En la pantalla de solicitud aparece este texto:

> Flujo: Solicitar → Cotizar → Aceptar/Hora → Pagar reserva → Trabajo → Calificar

Debe quitarse porque parece una nota interna del prototipo.

**Resultado esperado:** el resumen solo debe mostrar información útil del servicio.

---

### 4.2. Mostrar todas las ciudades del Ecuador

El selector de ciudad tiene pocas opciones. Deben aparecer más ciudades del Ecuador.

Ejemplos:

- Quito
- Guayaquil
- Cuenca
- Santo Domingo
- Machala
- Manta
- Portoviejo
- Loja
- Ambato
- Riobamba
- Latacunga
- Ibarra
- Esmeraldas
- Tulcán
- Puyo
- Tena
- Nueva Loja
- Babahoyo
- Quevedo
- Milagro
- Salinas
- Santa Elena
- Sangolquí
- Pelileo
- Baños
- Otavalo

**Resultado esperado:** cliente y proveedor deben poder seleccionar una ciudad más completa.

---

### 4.3. Selección de dirección con mapa

Sería bueno que la dirección no sea solo escrita, sino que también pueda seleccionarse con un botón en un mapa.

Agregar:

- Botón “Seleccionar ubicación en mapa”.
- Dirección escrita.
- Referencia.
- Latitud.
- Longitud.
- Mapa con Google Maps, Leaflet u OpenStreetMap.

**Resultado esperado:** el cliente selecciona la ubicación exacta o aproximada del lugar del servicio.

---

### 4.4. Subida de imágenes del problema

Cuando el cliente solicite un servicio, debe poder subir imágenes del problema.

Ejemplos:

- Foto de fuga.
- Foto de pared dañada.
- Foto de chapa dañada.
- Foto del electrodoméstico.
- Foto del lugar donde se hará el trabajo.

Requisitos:

- Permitir de 1 a 5 imágenes.
- Formatos JPG, PNG o WEBP.
- Tamaño máximo sugerido: 5 MB por imagen.
- Guardar en Cloudinary o storage.
- Mostrar al proveedor en el detalle del trabajo.

**Resultado esperado:** el proveedor puede revisar mejor el problema antes de cotizar.

---

## 5. Mejoras en cotizaciones y horarios

### 5.1. Corregir envío de cotización

La función de enviar cotización no funciona correctamente o no muestra confirmación.

Revisar:

- Que el formulario se envíe al backend.
- Que se guarden los precios.
- Que se guarde la hora propuesta.
- Que la cotización quede asociada a la solicitud.
- Que el cliente pueda verla.
- Que aparezca mensaje de éxito.
- Que la pantalla se actualice o redirija.

**Resultado esperado:** el proveedor envía la cotización y el cliente la ve en su panel.

---

### 5.2. Cotización con dos opciones de precio

El proveedor debe enviar dos opciones claras:

#### Opción 1: proveedor compra materiales

- Mano de obra.
- Materiales.
- Total con materiales.
- Detalle de materiales.

#### Opción 2: cliente compra materiales

- Solo mano de obra.
- Materiales en $0.
- Total sin materiales.

**Resultado esperado:** el cliente puede escoger la opción que le convenga.

---

### 5.3. Hora exacta propuesta por proveedor

El cliente puede seleccionar un rango como mañana, tarde o noche, pero el proveedor debe proponer una hora exacta.

Ejemplo:

- Cliente selecciona: Tarde.
- Proveedor propone: 15:30.
- Cliente acepta o propone otra hora.

**Resultado esperado:** ambas partes deben quedar de acuerdo en una hora exacta antes de confirmar el trabajo.

---

### 5.4. Cliente propone otra hora y proveedor responde

Cuando el cliente propone otra hora, en el panel del proveedor debe haber acciones claras.

Agregar:

- “Aceptar hora propuesta”.
- “Rechazar hora propuesta”.
- “Proponer otra hora”.

**Resultado esperado:** el proveedor puede responder a la hora propuesta por el cliente.

---

### 5.5. Confirmación final antes de iniciar trabajo

El botón “Iniciar trabajo” solo debe aparecer cuando ya exista acuerdo final entre cliente y proveedor.

Debe estar confirmado:

- Precio.
- Opción seleccionada.
- Hora exacta.
- Dirección.
- Condiciones del trabajo.
- Pago de reserva si aplica.

**Resultado esperado:** el proveedor no puede iniciar trabajo si todavía no hay acuerdo completo.

---

## 6. Mejoras en solicitudes del proveedor

### 6.1. Cambiar “Ver perfil” por “Ver detalle del trabajo”

En el panel del proveedor no tiene sentido que aparezca “Ver perfil”, porque se va al perfil del mismo proveedor.

Cambiar por:

- “Ver detalle del trabajo”.
- “Ver solicitud”.
- “Revisar trabajo”.

**Resultado esperado:** el proveedor entra a una pantalla con toda la información del trabajo solicitado.

---

### 6.2. Detalle completo del trabajo

Cada trabajo recibido debe tener un botón para ver todos los detalles.

Debe mostrar:

- Código de solicitud.
- Nombre del cliente.
- Teléfono.
- Ciudad.
- Dirección.
- Ubicación en mapa, si existe.
- Fecha preferida.
- Rango horario.
- Hora exacta acordada.
- Servicio solicitado.
- Descripción del problema.
- Imágenes subidas por el cliente.
- Cotización enviada.
- Opción aceptada por el cliente.
- Estado actual.
- Historial de acciones.

**Resultado esperado:** el proveedor entiende claramente qué debe hacer antes de aceptar o iniciar el trabajo.

---

### 6.3. Notificación cuando el cliente acepta la cotización

Cuando el cliente acepta una cotización, el proveedor debe recibir un aviso.

Ejemplos:

- “El cliente aceptó la cotización.”
- “El cliente aceptó la opción con materiales.”
- “El cliente propuso una nueva hora.”
- “El cliente rechazó la cotización.”

**Resultado esperado:** el proveedor sabe qué decisión tomó el cliente.

---

## 7. Mejoras en solicitudes del cliente

### 7.1. Botón “Ver detalles”

En “Mis solicitudes” debe existir un botón para ver todos los detalles.

Debe mostrar:

- Proveedor.
- Servicio.
- Dirección.
- Fecha.
- Estado.
- Cotización.
- Hora acordada.
- Imágenes enviadas.
- Seguimiento del servicio.
- Opción de precio elegida.

**Resultado esperado:** el cliente puede revisar toda la información de su solicitud.

---

### 7.2. Línea de seguimiento visible para cliente

La línea de seguimiento debe mostrarse claramente.

Estados sugeridos:

1. Solicitud enviada.
2. Cotización recibida.
3. Cotización aceptada.
4. Hora acordada.
5. Pago de reserva.
6. Proveedor en camino.
7. Trabajo en proceso.
8. Trabajo finalizado.
9. Servicio calificado.

**Resultado esperado:** el cliente sabe en qué etapa está su servicio.

---

## 8. Flujo de trabajo con evidencias

### 8.1. Confirmación de inicio de trabajo

Cuando el proveedor vaya al lugar, el botón “Iniciar trabajo” debe abrir una pantalla o modal de confirmación.

Debe mostrar:

- Datos del cliente.
- Dirección.
- Hora acordada.
- Trabajo a realizar.
- Botón “Confirmar inicio del trabajo”.

**Resultado esperado:** el proveedor confirma formalmente que empezó el trabajo.

---

### 8.2. Subida de imágenes durante el trabajo

Cuando el proveedor esté realizando el trabajo, debe poder subir imágenes del proceso.

Ejemplos:

- Imagen antes de empezar.
- Imagen durante el trabajo.
- Imagen del resultado final.

Requisitos:

- Permitir mínimo 2 imágenes.
- Guardarlas en storage.
- Asociarlas a la solicitud.
- Mostrar las imágenes al cliente.

**Resultado esperado:** el cliente puede ver evidencias del trabajo realizado.

---

### 8.3. Nueva cotización si cambia el trabajo

Puede pasar que el proveedor llegue al lugar y vea que el problema es distinto o más grande.

Ejemplo: el cliente dijo que solo se dañó la llave, pero también está dañada una tubería.

Debe existir un apartado de nueva cotización.

El proveedor debe poder:

- Explicar por qué cambia el precio.
- Subir una imagen como evidencia.
- Enviar nuevo precio.
- Esperar aceptación del cliente.

El cliente debe poder:

- Aceptar la nueva cotización.
- Rechazarla.
- Cancelar el trabajo.

**Resultado esperado:** si cambia el trabajo, no se continúa sin aprobación del cliente.

---

## 9. Mejoras del administrador

### 9.1. Mejorar verificación de proveedores

La sección de verificación debe mostrar mejor el perfil del proveedor.

Debe incluir:

- Foto del proveedor.
- Datos personales.
- Especialidad.
- Ciudad.
- Sector.
- Experiencia.
- Descripción.
- Documentos subidos.
- Estado de cada documento.
- Botón para ver archivo.
- Botón para aprobar documento.
- Botón para rechazar documento.
- Motivo de rechazo.

**Resultado esperado:** el administrador puede revisar mejor antes de aprobar o rechazar.

---

### 9.2. Admin con acceso a solicitudes

El panel admin debe incluir una sección para ver solicitudes del sistema.

Filtros recomendados:

- Estado.
- Cliente.
- Proveedor.
- Ciudad.
- Fecha.
- Servicio.

Debe mostrar:

- Código de solicitud.
- Cliente.
- Proveedor.
- Estado.
- Cotización.
- Pago.
- Fecha.
- Acciones.

**Resultado esperado:** el administrador puede supervisar la actividad del sistema.

---

### 9.3. Admin puede agregar categorías

En el módulo de categorías, el administrador debe poder crear nuevas categorías.

Campos sugeridos:

- Nombre.
- Descripción.
- Ícono.
- Estado activo/inactivo.

**Resultado esperado:** si un proveedor no encuentra su especialidad, el admin puede agregarla oficialmente.

---

### 9.4. Mensajes de soporte al administrador

Cuando cliente o proveedor envíen un mensaje de ayuda o reporten un problema, ese mensaje debe llegar al panel del administrador.

Campos sugeridos:

- ID.
- Usuario.
- Rol.
- Asunto.
- Descripción.
- Estado.
- Fecha.
- Prioridad.
- Respuesta del admin.

**Resultado esperado:** el administrador puede gestionar problemas, dudas o reportes.

---

## 10. Especialidades del proveedor

### 10.1. Opción “Otra especialidad”

Cuando el proveedor se registra y no encuentra su especialidad, debe aparecer una opción:

- “Otra especialidad”.
- “No encuentro mi servicio”.

Al seleccionarla, debe desplegarse un campo de texto para escribir su especialidad.

Ejemplos:

- Reparación de piscinas.
- Instalación de cámaras.
- Servicio técnico de computadoras.

**Resultado esperado:** el proveedor puede registrarse aunque su especialidad no esté en la lista.

---

### 10.2. Especialidad nueva revisada por admin

Si el proveedor escribe una especialidad nueva, el admin debe revisarla.

Opciones del admin:

- Aprobar especialidad.
- Rechazar especialidad.
- Crear categoría nueva.
- Asociarla a una categoría existente.

**Resultado esperado:** el catálogo puede crecer sin perder control administrativo.

---

## 11. Ayuda y soporte dentro del sistema

### 11.1. Botón flotante de ayuda

Agregar un botón flotante con ícono `?` en un lado de la pantalla.

Debe aparecer para:

- Cliente.
- Proveedor.
- Administrador.

**Resultado esperado:** el usuario siempre tiene acceso rápido a ayuda.

---

### 11.2. Guía para cliente

La ayuda del cliente debe explicar:

- Cómo solicitar un servicio.
- Cómo aceptar una cotización.
- Cómo proponer otra hora.
- Cómo pagar reserva.
- Cómo calificar un servicio.
- Cómo reportar un problema.

---

### 11.3. Guía para proveedor

La ayuda del proveedor debe explicar:

- Cómo revisar una solicitud.
- Cómo enviar cotización.
- Cómo responder a una hora propuesta.
- Cómo iniciar trabajo.
- Cómo subir evidencias.
- Cómo finalizar trabajo.
- Cómo pedir revisión de una nueva cotización.

---

### 11.4. Mensaje al administrador

Dentro de la ayuda debe existir una opción:

- “Enviar mensaje al administrador”.
- “Reportar problema”.
- “Necesito ayuda”.

**Resultado esperado:** el mensaje se guarda y aparece en el panel admin.

---

## 12. Pagos y reserva

### 12.1. Pago de reserva antes de iniciar trabajo

Después de que el cliente acepte una cotización y una hora, debería pagar una reserva.

Flujo:

1. Cliente acepta cotización.
2. Cliente acepta hora.
3. Sistema pide pago de reserva.
4. Al pagar, la solicitud queda confirmada.
5. El proveedor puede iniciar el trabajo.

**Resultado esperado:** se evita que el proveedor vaya a un trabajo sin confirmación real.

---

### 12.2. Estado de pago visible

Tanto cliente como proveedor deben ver:

- Pendiente de pago.
- Reserva pagada.
- Pago fallido.
- Reembolsado.

**Resultado esperado:** ambos usuarios saben si el trabajo está confirmado económicamente.

---

## 13. Estados recomendados del sistema

### Estados de solicitud

- `pendiente_cotizacion`
- `cotizacion_enviada`
- `hora_propuesta_cliente`
- `hora_aceptada`
- `pendiente_pago_reserva`
- `confirmada_pagada`
- `proveedor_en_camino`
- `en_proceso`
- `nueva_cotizacion_enviada`
- `completada`
- `calificada`
- `cancelada`
- `rechazada`

### Estados de proveedor

- `pendiente`
- `aprobado`
- `rechazado`
- `suspendido`

### Estados de documentos

- `pendiente`
- `aprobado`
- `rechazado`

### Estados de soporte

- `nuevo`
- `en_revision`
- `respondido`
- `cerrado`

### Estados de usuario

- `pending_email_verification`
- `active`
- `blocked`

---

## 14. Prioridades

### Prioridad alta

1. Corregir registro como proveedor.
2. Corregir registro como cliente.
3. Mejorar por completo inicio de sesión y registro.
4. Verificar correo antes de activar la cuenta.
5. Corregir Google Authentication para escoger cliente o proveedor.
6. Corregir foto de perfil del proveedor para que se vea en el perfil público.
7. Agregar términos de uso y condiciones visibles.
8. Corregir envío de cotización.
9. Agregar mensajes de éxito/error.
10. Cambiar “Ver perfil” por “Ver detalle del trabajo”.
11. Agregar detalle completo de solicitud para cliente y proveedor.
12. Permitir aceptar/rechazar hora propuesta por cliente.
13. Dar acceso al admin a solicitudes.
14. Mejorar verificación de proveedores.
15. Permitir subir imágenes en solicitud.

### Prioridad media

1. Mapa para dirección.
2. Fotos de perfil para todos.
3. Foto frontal y lateral del proveedor.
4. Nueva cotización si cambia el trabajo.
5. Evidencias del trabajo con imágenes.
6. Botón flotante de ayuda.
7. Mensajes de soporte al admin.
8. Opción “Otra especialidad”.
9. Recuperación de contraseña.

### Prioridad baja

1. Chat en tiempo real.
2. Notificaciones por WhatsApp.
3. Mapas avanzados.
4. Tracking en tiempo real.
5. Reportes avanzados.

---

## 15. Flujo final recomendado

### Cliente

1. Se registra.
2. Verifica su correo.
3. Inicia sesión.
4. Busca proveedor.
5. Solicita servicio.
6. Sube imágenes del problema.
7. Selecciona ubicación en mapa.
8. Espera cotización.
9. Revisa dos opciones de precio.
10. Acepta opción o propone otra hora.
11. Paga reserva.
12. Ve seguimiento.
13. Revisa evidencias.
14. Califica el servicio.

### Proveedor

1. Se registra con correo normal o Google.
2. Selecciona rol proveedor.
3. Verifica su correo.
4. Completa datos profesionales.
5. Sube documentos.
6. Sube foto frontal, foto lateral y foto de perfil pública.
7. Espera aprobación.
8. Recibe solicitud.
9. Revisa detalle del trabajo.
10. Envía cotización y hora exacta.
11. Responde cambios de hora.
12. Espera confirmación y pago.
13. Inicia trabajo.
14. Sube evidencias.
15. Finaliza trabajo.
16. Si encuentra un problema adicional, envía nueva cotización.

### Administrador

1. Inicia sesión.
2. Revisa proveedores pendientes.
3. Verifica documentos y fotos.
4. Aprueba o rechaza.
5. Revisa solicitudes.
6. Revisa mensajes de soporte.
7. Gestiona categorías.
8. Supervisa pagos, cotizaciones y reportes.

---

## 16. Nota final

Estos cambios son importantes para que ServicioYa ECU no solo funcione como prototipo, sino como un sistema con lógica real de negocio.

La prioridad es corregir primero los errores funcionales principales: registro de cliente, registro de proveedor, verificación de correo, Google Authentication por roles, términos de uso, foto de perfil, cotización, mensajes de confirmación, detalle de solicitudes y administración de solicitudes.
