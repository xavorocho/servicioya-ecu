# ServicioYa ECU — Informe Técnico Completo

**Versión:** 2.0.0  
**Fecha:** 22 de julio de 2026  
**Institución:** Universidad de las Fuerzas Armadas — ESPE  
**Materia:** Diseño Centrado en el Usuario (USABILIDAD)  
**Autor:** Xavier Yugcha  
**Repositorio:** https://github.com/xavorocho/servicioya-ecu

---

## 1. Resumen Ejecutivo

**ServicioYa ECU** es una plataforma web full-stack que conecta clientes con proveedores de servicios domésticos verificados en Ecuador. El sistema permite a los clientes buscar proveedores, solicitar servicios, recibir cotizaciones, negociar horarios, realizar pagos y calificar el servicio recibido. Los proveedores pasan por un proceso de verificación documental administrativa antes de poder ofrecer servicios.

### Enlaces de Producción

| Servicio | URL |
|----------|-----|
| Frontend (Vercel) | https://servicioya-ecu.vercel.app |
| Backend API (Railway) | https://servicioya-ecu-production.up.railway.app/api |
| Base de datos | Neon PostgreSQL (cloud) |
| Almacenamiento de archivos | Cloudinary |

---

## 2. Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | LTS | Runtime del servidor |
| Express.js | ^4.21.2 | Framework HTTP / API REST |
| Prisma Client | ^6.19.3 | ORM para PostgreSQL |
| Prisma CLI | ^6.19.3 | Migraciones y gestión de schema |
| PostgreSQL (pg) | ^8.22.0 | Driver de base de datos |
| bcryptjs | ^2.4.3 | Hashing de contraseñas |
| jsonwebtoken | ^9.0.2 | Autenticación JWT |
| multer | ^1.4.5-lts.2 | Manejo de uploads de archivos |
| multer-storage-cloudinary | ^4.0.0 | Almacenamiento en cloud (producción) |
| cloudinary | ^1.41.3 | SDK de Cloudinary |
| cors | ^2.8.5 | Control de acceso cross-origin |
| dotenv | ^16.4.7 | Variables de entorno |
| uuid | ^11.1.0 | Generación de IDs únicos |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | ^19.0.0 | Framework de UI |
| react-dom | ^19.0.0 | Renderizado DOM |
| react-router-dom | ^7.2.0 | Enrutamiento del lado del cliente |
| axios | ^1.7.9 | Cliente HTTP |
| Vite | ^6.1.0 | Build tool / dev server |
| Tailwind CSS | ^4.0.0 | CSS utility-first |
| @tailwindcss/vite | ^4.0.0 | Plugin de Tailwind para Vite |
| @vitejs/plugin-react | ^4.3.4 | Plugin de React para Vite |

### Infraestructura de Despliegue

| Componente | Servicio | Tier |
|------------|----------|------|
| Frontend | Vercel | Gratuito |
| Backend | Railway | Gratuito |
| Base de datos | Neon | Gratuito (512 MB) |
| Archivos | Cloudinary | Gratuito (25 GB) |

---

## 3. Modelo de Base de Datos

**Base de datos:** PostgreSQL (Neon)  
**ORM:** Prisma  
**Total de modelos:** 9  
**Relaciones:** 13 foreign keys

### Diagrama de Entidad-Relación

```
┌──────────┐     1:N     ┌──────────┐
│ Category │────────────▶│ Provider │
└──────────┘             └────┬─────┘
                              │
                    ┌─────────┼─────────┬──────────┬──────────┐
                    │ 1:N     │ 1:N     │ 1:N      │ 1:N      │ 1:N
                    ▼         ▼         ▼          ▼          ▼
              ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
              │ Provider │ │Quote   │ │Payment │ │Review  │ │Request │
              │ Document │ └───┬────┘ └────────┘ └────────┘ └───┬────┘
              └──────────┘     │ 1:N                           │
                               ▼                               │
                         ┌─────────────┐                       │
                         │TimeProposal │                       │
                         └─────────────┘                       │
                    ┌──────────────────────────────────────────┘
                    │ 1:N
                    ▼
              ┌──────────┐     N:1     ┌──────────┐
              │ Request  │◀────────────│  Quote   │
              └──────────┘             └──────────┘
```

### Modelo: User

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | String (UUID) | PK | Identificador único |
| `name` | String | Requerido | Nombre completo |
| `email` | String | Unique | Correo electrónico |
| `password` | String | Bcrypt hash | Contraseña hasheada |
| `role` | String | Default: `"cliente"` | Rol: `cliente`, `proveedor`, `admin` |
| `phone` | String | Default: `""` | Teléfono |
| `city` | String | Default: `""` | Ciudad |
| `status` | String | Default: `"Activo"` | Estado: `Activo`, `Pendiente`, `Aprobado`, `Rechazada` |
| `providerId` | String? | Opcional | Enlace al perfil de proveedor |
| `createdAt` | DateTime | Auto | Fecha de creación |
| `updatedAt` | DateTime | Auto | Fecha de actualización |

### Modelo: Category

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | String (UUID) | PK | Identificador único |
| `slug` | String | Unique | Identificador URL-friendly |
| `name` | String | Requerido | Nombre de visualización |
| `description` | String | Default: `""` | Descripción |
| `icon` | String | Default: `""` | Nombre del ícono SVG |
| `color` | String | Default: gradiente Tailwind | Clases CSS de color |
| `active` | Boolean | Default: `true` | Si está activa |

**Categorías del sistema:** Plomería, Electricidad, Limpieza, Pintura, Carpintería, Jardinería, Electrodomésticos, Mudanzas, Cerrajería, Cuidado del hogar

### Modelo: Provider

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | String (UUID) | PK | Identificador único |
| `userEmail` | String | Unique | Email del usuario propietario |
| `name` | String | Requerido | Nombre del proveedor |
| `category` | String | Requerido | Slug de categoría |
| `categoryName` | String | Requerido | Nombre de categoría |
| `city` | String | Requerido | Ciudad |
| `sector` | String | Default: `""` | Sector/barrio |
| `rating` | Float | Default: `0` | Calificación promedio (1-5) |
| `reviews` | Int | Default: `0` | Cantidad de reseñas |
| `price` | Float | Default: `0` | Tarifa base por hora (USD) |
| `available` | Boolean | Default: `false` | Disponibilidad actual |
| `verified` | Boolean | Default: `false` | Si está verificado |
| `status` | String | Default: `"Pendiente"` | Estado: `Pendiente`, `Aprobado`, `Rechazada` |
| `experience` | String | Default: `""` | Descripción de experiencia |
| `phone` | String | Default: `""` | Teléfono |
| `description` | String | Default: `""` | Descripción del servicio |
| `services` | String (JSON) | Default: `"[]"` | Lista de servicios ofrecidos |
| `documents` | String (JSON) | Default: `"{}"` | Documentos adjuntos |
| `comments` | String (JSON) | Default: `"[]"` | Comentarios de clientes |
| `categoryId` | String? | FK → Category | Enlace a categoría |
| `experienceYears` | Int | Default: `0` | Años de experiencia |
| `baseReferencePrice` | Float | Default: `0` | Precio de referencia |

### Modelo: ProviderDocument

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | String (UUID) | PK | Identificador único |
| `providerId` | String | FK → Provider | Proveedor propietario |
| `documentType` | String | Requerido | Tipo: `cedula`, `antecedentes`, `oficio`, `ruc` |
| `filePath` | String | Requerido | Ruta o URL del archivo |
| `originalName` | String | Requerido | Nombre original del archivo |
| `reviewStatus` | String | Default: `"Pendiente"` | Estado: `Pendiente`, `Aprobado`, `Rechazado` |
| `reviewedBy` | String? | Opcional | Email del admin que revisó |
| `reviewedAt` | DateTime? | Opcional | Fecha de revisión |
| `rejectionReason` | String? | Opcional | Motivo de rechazo |

### Modelo: Request (Solicitud de servicio)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | String (UUID) | PK | Identificador único |
| `displayId` | String | Unique | ID visible (ej: `SY-1001`) |
| `clientEmail` | String | Requerido | Email del cliente |
| `client` | String | Requerido | Nombre del cliente |
| `providerId` | String | FK → Provider | Proveedor asignado |
| `providerName` | String | Requerido | Nombre del proveedor |
| `service` | String | Requerido | Nombre del servicio |
| `city` | String | Default: `""` | Ciudad |
| `address` | String | Default: `""` | Dirección |
| `description` | String | Default: `""` | Descripción del problema |
| `phone` | String | Default: `""` | Teléfono de contacto |
| `preferredDate` | String | Default: `""` | Fecha preferida |
| `preferredTimeRange` | String | Default: `""` | Rango horario preferido |
| `status` | String | Default: `"pendiente_cotizacion"` | Estado del flujo |

**Ciclo de vida del estado de una solicitud:**

```
pendiente_cotizacion
       │
       ▼
cotizacion_enviada
       │
       ▼
hora_propuesta_cliente ──→ rechazada
       │
       ▼
   confirmada ──→ cancelada
       │
       ▼
confirmada_pagada
       │
       ▼
   en_proceso
       │
       ▼
   completada
       │
       ▼
   calificada
```

### Modelo: Quote (Cotización)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `requestId` | String (FK) | Solicitud asociada |
| `providerId` | String (FK) | Proveedor que cotiza |
| `laborPrice` | Float | Precio de mano de obra |
| `materialsPrice` | Float | Precio de materiales |
| `totalWithMaterials` | Float | Total con materiales |
| `totalWithoutMaterials` | Float | Total sin materiales |
| `materialsDetail` | String | Detalle de materiales |
| `providerNote` | String | Nota del proveedor |
| `providerExactTime` | String | Hora exacta propuesta |
| `status` | String | `enviada`, `aceptada`, `rechazada` |

### Modelo: TimeProposal (Propuesta de horario)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `quoteId` | String (FK) | Cotización asociada |
| `proposedBy` | String | Quien propone: `cliente` o `proveedor` |
| `proposedTime` | String | Hora propuesta |
| `status` | String | `pendiente`, `aceptada`, `rechazada` |
| `note` | String | Nota adicional |

### Modelo: Payment (Pago)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `requestId` | String (FK) | Solicitud asociada |
| `quoteId` | String? (FK) | Cotización asociada |
| `clientEmail` | String | Email del cliente |
| `providerId` | String (FK) | Proveedor |
| `amount` | Float | Monto total |
| `platformFee` | Float | Comisión de la plataforma (5%) |
| `paymentMethod` | String | Método de pago (default: `payphone`) |
| `paymentStatus` | String | `pendiente`, `completado`, `reembolsado` |
| `transactionId` | String? | ID de transacción externa |

### Modelo: Review (Reseña)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `requestId` | String (FK) | Solicitud completada |
| `clientEmail` | String | Email del cliente |
| `providerId` | String (FK) | Proveedor calificado |
| `rating` | Int | Calificación 1-5 |
| `comment` | String | Comentario |

---

## 4. API REST — Endpoints Completos

**URL base:** `/api`  
**Total de endpoints:** 38

### Autenticación (`/api/auth`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `POST` | `/api/auth/register` | No | Cualquiera | Registro de usuario. Body: `{ name, email, password, role, phone, city }` |
| `POST` | `/api/auth/login` | No | Cualquiera | Login. Retorna JWT (7 días) + datos de usuario |
| `GET` | `/api/auth/me` | Sí | Cualquiera | Obtener perfil del usuario autenticado |

### Usuarios (`/api/users`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/users/` | Sí | `admin` | Listar todos los usuarios |
| `PUT` | `/api/users/profile` | Sí | Cualquiera | Actualizar perfil propio |

### Proveedores (`/api/providers`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/providers/categories` | No | Público | Lista de 10 categorías de servicio |
| `GET` | `/api/providers/` | No | Público | Proveedores aprobados (ordenados por rating) |
| `GET` | `/api/providers/all` | Sí | `admin` | Todos los proveedores |
| `GET` | `/api/providers/pending` | Sí | `admin` | Proveedores pendientes de aprobación |
| `GET` | `/api/providers/me` | Sí | `proveedor` | Perfil del proveedor autenticado |
| `GET` | `/api/providers/:id` | No | Público | Perfil de un proveedor específico |
| `PUT` | `/api/providers/register` | Sí | `proveedor` | Registrar/actualizar perfil con documentos |
| `PUT` | `/api/providers/profile` | Sí | `proveedor` | Actualizar datos del perfil |
| `PUT` | `/api/providers/:id/approve` | Sí | `admin` | Aprobar proveedor |
| `PUT` | `/api/providers/:id/reject` | Sí | `admin` | Rechazar proveedor |

### Solicitudes (`/api/requests`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/requests/` | Sí | Cualquiera | Solicitudes filtradas por rol |
| `GET` | `/api/requests/stats` | Sí | Cualquiera | Estadísticas de solicitudes |
| `POST` | `/api/requests/` | Sí | `cliente` | Crear nueva solicitud de servicio |
| `PUT` | `/api/requests/:id/status` | Sí | Cualquiera | Actualizar estado de solicitud |
| `PUT` | `/api/requests/:id/start-work` | Sí | `proveedor` | Iniciar trabajo (→ `en_proceso`) |
| `PUT` | `/api/requests/:id/complete` | Sí | `proveedor` | Completar trabajo (→ `completada`) |

### Cotizaciones (`/api/quotes`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/quotes/by-request/:requestId` | Sí | Cualquiera | Cotizaciones de una solicitud |
| `GET` | `/api/quotes/my-quotes` | Sí | `proveedor` | Cotizaciones del proveedor |
| `POST` | `/api/quotes/` | Sí | `proveedor` | Crear cotización con dos opciones de precio |
| `PUT` | `/api/quotes/:id/accept` | Sí | `cliente` | Aceptar cotización (crea registro de pago) |
| `PUT` | `/api/quotes/:id/reject` | Sí | Cualquiera | Rechazar cotización |

### Propuestas de Horario (`/api/time-proposals`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/time-proposals/by-quote/:quoteId` | Sí | Cualquiera | Propuestas de una cotización |
| `POST` | `/api/time-proposals/` | Sí | Cualquiera | Crear propuesta de horario |
| `PUT` | `/api/time-proposals/:id/accept` | Sí | Cualquiera | Aceptar propuesta |
| `PUT` | `/api/time-proposals/:id/reject` | Sí | Cualquiera | Rechazar propuesta |

### Pagos (`/api/payments`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/payments/` | Sí | Cualquiera | Pagos filtrados por rol |
| `GET` | `/api/payments/stats` | Sí | `admin` | Estadísticas de pagos (total, comisiones, pendientes) |
| `POST` | `/api/payments/:id/process` | Sí | Cualquiera | Procesar/completar pago |
| `PUT` | `/api/payments/:id/refund` | Sí | `admin` | Reembolsar pago |

### Reseñas (`/api/reviews`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/reviews/` | Sí | Cualquiera | Reseñas filtradas por rol |
| `POST` | `/api/reviews/` | Sí | `cliente` | Crear reseña (1-5 estrellas + comentario) |

### Documentos (`/api/documents`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/documents/` | Sí | `admin` | Todos los documentos |
| `GET` | `/api/documents/pending` | Sí | `admin` | Documentos pendientes de revisión |
| `GET` | `/api/documents/my-documents` | Sí | `proveedor` | Documentos propios |
| `POST` | `/api/documents/` | Sí | `proveedor` | Subir documento |
| `PUT` | `/api/documents/:id/review` | Sí | `admin` | Aprobar/rechazar documento |

### Categorías (`/api/categories`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| `GET` | `/api/categories/` | No | Público | Categorías activas |
| `GET` | `/api/categories/all` | Sí | `admin` | Todas las categorías |
| `POST` | `/api/categories/` | Sí | `admin` | Crear categoría |
| `PUT` | `/api/categories/:id` | Sí | `admin` | Actualizar categoría |
| `DELETE` | `/api/categories/:id` | Sí | `admin` | Eliminar categoría |

### Resumen de Autenticación

| Tipo | Cantidad |
|------|----------|
| Públicos (sin auth) | 6 |
| Autenticados (cualquier rol) | 12 |
| Solo cliente | 3 |
| Solo proveedor | 7 |
| Solo admin | 10 |

---

## 5. Frontend — Rutas y Páginas

**Total de rutas:** 23

### Páginas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `Home` | Página principal con catálogo destacado |
| `/login` | `Login` | Formulario de inicio de sesión |
| `/registro` | `Register` | Formulario de registro |
| `/catalogo` | `Catalog` | Catálogo público de proveedores |
| `/perfil/:id` | `ProviderProfile` | Perfil detallado de un proveedor |
| `/ayuda` | `Help` | Guía de uso de la plataforma |

### Páginas del Cliente

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/cliente/inicio` | `ClientHome` | Dashboard del cliente |
| `/cliente/catalogo` | `ClientCatalog` | Búsqueda de proveedores |
| `/cliente/solicitar/:id` | `RequestForm` | Formulario de solicitud de servicio |
| `/cliente/solicitudes` | `ClientRequests` | Lista de solicitudes del cliente |
| `/cliente/cotizacion/:requestId` | `QuoteView` | Ver/aceptar/rechazar cotización |
| `/cliente/perfil` | `ClientProfile` | Editar perfil del cliente |

### Páginas del Proveedor

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/proveedor/inicio` | `ProviderHome` | Dashboard del proveedor |
| `/proveedor/solicitudes` | `ProviderRequests` | Solicitudes recibidas |
| `/proveedor/cotizar/:requestId` | `QuoteForm` | Crear cotización para una solicitud |
| `/proveedor/perfil` | `ProviderProfileEdit` | Editar perfil del proveedor |
| `/proveedor/documentos` | `ProviderDocuments` | Gestionar documentos de verificación |

### Páginas del Administrador

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/admin/inicio` | `AdminHome` | Dashboard administrativo con estadísticas |
| `/admin/verificaciones` | `AdminVerifications` | Revisar y aprobar/rechazar proveedores |
| `/admin/usuarios` | `AdminUsers` | Gestión de usuarios |
| `/admin/proveedores` | `AdminProviders` | Gestión de proveedores |
| `/admin/categorias` | `AdminCategories` | CRUD de categorías |
| `/admin/reportes` | `AdminReports` | Analíticas y reportes |

---

## 6. Autenticación y Seguridad

### Flujo de Autenticación

1. **Registro:** El usuario envía `{ name, email, password, role, phone, city }`. La contraseña se hashea con bcrypt (10 rounds). Se retorna un JWT con expiración de 7 días.

2. **Login:** El usuario envía `{ email, password }`. Se verifica el hash bcrypt. Se retorna un JWT con `{ id, email, role, name }`.

3. **Peticiones autenticadas:** El frontend envía `Authorization: Bearer <token>` en cada petición. El middleware `authenticate` verifica y decodifica el JWT.

4. **Control por rol:** El middleware `authorize(...roles)` verifica que el rol del usuario esté permitido.

5. **Sesión persistente:** El token se almacena en `localStorage` (clave `sy_token`). Al recargar la página, se llama a `GET /api/auth/me` para revalidar.

### Protección de Rutas Frontend

El componente `ProtectedRoute` verifica:
- Si no hay usuario → redirige a `/login`
- Si el rol no coincide → redirige a `/${user.role}/inicio`
- Si todo está correcto → renderiza los hijos

### CORS

Origins permitidos en producción:
- `http://localhost:5173` (desarrollo)
- `http://localhost:3000` (desarrollo)
- `https://servicioya-ecu.vercel.app` (producción)

---

## 7. Subida de Archivos

### Configuración de Multer

| Configuración | Desarrollo | Producción |
|---------------|------------|------------|
| **Storage** | Disco local (`backend/uploads/`) | Cloudinary (`servicioya/documentos/`) |
| **Nombres** | UUID + extensión original | UUID generado por Cloudinary |
| **Formatos permitidos** | `.pdf`, `.jpg`, `.jpeg`, `.png` | `.pdf`, `.jpg`, `.jpeg`, `.png` |
| **Tamaño máximo** | 5 MB | 5 MB |

### Campos de Upload

| Campo | Descripción | Archivo máximo |
|-------|-------------|----------------|
| `docCedula` | Cédula de identidad | 1 archivo |
| `docAntecedentes` | Certificado de no antecedentes | 1 archivo |
| `docOficio` | Certificado de experiencia | 1 archivo |
| `docRuc` | RUC/RIMPE (opcional) | 1 archivo |

---

## 8. Componentes UI

### Biblioteca de Íconos (40+)

SVG inline con componente `Icon`. Íconos disponibles: `house`, `magnifying-glass`, `clipboard-list`, `user`, `users`, `gauge-high`, `inbox`, `id-card`, `file-shield`, `chart-pie`, `chart-column`, `user-check`, `user-shield`, `user-plus`, `right-to-bracket`, `wrench`, `bolt`, `broom`, `paint-roller`, `hammer`, `seedling`, `plug`, `truck`, `key`, `star`, `dollar-sign`, `paper-plane`, `shield-halved`, `circle-check`, `check`, `circle-info`, `envelope`, `lock`, `briefcase`, `location-dot`, `tags`, `award`, `clock`, `spinner`, `trash`, `xmark`, `bars`, entre otros.

### Componentes Reutilizables

| Componente | Descripción |
|------------|-------------|
| `StatCard` | Tarjeta de estadística con ícono, valor y etiqueta. 6 variantes de color. |
| `StatusBadge` | Badge de estado con colores según el valor. |
| `Avatar` | Círculo con iniciales y gradiente azul. |
| `Breadcrumb` | Miga de pan de navegación con enlaces. |
| `EmptyState` | Estado vacío con ícono, título, mensaje y acción opcional. |
| `StatusChart` | Gráfico de barras horizontal de distribución de estados. |
| `DonutChart` | Gráfico circular CSS de aprobación de proveedores. |
| `Modal` | Diálogo modal accesible con backdrop blur. |
| `Toast` | Notificaciones toast (éxito/error) con auto-dismiss. |

---

## 9. Estilos y Animaciones

### Paleta de Colores

| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-primary` | `#2563eb` (blue-600) | Color principal |
| `--color-primary-2` | `#1d4ed8` (blue-700) | Variante oscura |
| `--color-primary-dark` | `#1e3a8a` (blue-900) | Texto sobre fondo claro |
| `--color-primary-light` | `#dbeafe` (blue-100) | Fondos suaves |
| `--color-primary-soft` | `#eff6ff` (blue-50) | Fondos muy suaves |
| `--color-accent` | `#4f46e5` (indigo-600) | Color acento |
| `--color-dark` | `#0f172a` (slate-900) | Texto principal |

### Animaciones (12)

| Animación | Clase CSS | Descripción |
|-----------|-----------|-------------|
| `fadeIn` | `.animate-fade-in` | Aparece con opacidad + movimiento hacia arriba (0.4s) |
| `fadeInUp` | `.animate-fade-in-up` | Aparece desde abajo (0.5s) |
| `fadeInLeft` | `.animate-fade-in-left` | Aparece desde la izquierda (0.4s) |
| `fadeInRight` | `.animate-fade-in-right` | Aparece desde la derecha (0.4s) |
| `scaleIn` | `.animate-scale-in` | Escala de 0.9 a 1.0 + fade (0.3s) |
| `slideDown` | `.animate-slide-down` | Desliza hacia abajo (0.3s) |
| `shimmer` | `.animate-shimmer` | Efecto de brillo animado (2s loop) |
| `float` | `.animate-flotar` | Flotación suave arriba/abajo (3s loop) |
| `bounce-subtle` | `.animate-bounce-subtle` | Rebote pequeño (2s loop) |
| `glow` | `.animate-glow` | Pulso de resplandor azul (2s loop) |
| `gradient-shift` | `.animate-gradient` | Desplazamiento de gradiente (3s loop) |
| `icon-pop` | `.animate-icon-pop` | Pop-in con escala exagerada |

### Componentes CSS

| Clase | Descripción |
|-------|-------------|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger` | Variantes de botón con gradiente, hover (translateY) y glow |
| `.card` | Tarjeta blanca con borde, sombra y efecto hover lift |
| `.icon-container` | Contenedor con hover scale(1.1) + rotate(-5deg) |
| `.skeleton` | Skeleton de carga con animación shimmer |
| `.stagger-children` | Delay incremental (60ms) para hijos animados |

---

## 10. Datos Demo (Seed)

### Cuentas de Acceso

| Rol | Email | Contraseña | Ciudad | Estado |
|-----|-------|------------|--------|--------|
| Cliente | `cliente@demo.com` | `123456` | Latacunga | Activo |
| Admin | `admin@demo.com` | `123456` | Latacunga | Activo |
| Proveedor | `proveedor@demo.com` | `123456` | Latacunga | Aprobado |
| Pendiente | `pendiente@demo.com` | `123456` | Riobamba | Pendiente |

### Proveedores Demo

| Nombre | Categoría | Ciudad | Calificación | Estado |
|--------|-----------|--------|--------------|--------|
| Juan Pérez | Plomería | Latacunga | 4.8 (48 reseñas) | Aprobado |
| Ana Romero | Limpieza | Quito | 4.9 (82 reseñas) | Aprobado |
| Carlos Mena | Electricidad | Ambato | 4.7 (39 reseñas) | Aprobado |
| Sofía Vega | Pintura | Pelileo | 4.6 (27 reseñas) | Aprobado |
| Martha Quispe | Cuidado del hogar | Latacunga | 4.9 (56 reseñas) | Aprobado |
| Pedro Loján | Electrodomésticos | Riobamba | 0 (0 reseñas) | Pendiente |

### Documentos Demo

- **Juan Pérez:** Cédula (Aprobado), Antecedentes (Aprobado), Experiencia (Aprobado)
- **Pedro Loján:** Cédula (Pendiente), Antecedentes (Pendiente)

### Solicitudes Demo

| ID | Servicio | Proveedor | Estado |
|----|----------|-----------|--------|
| SY-1001 | Plomería | Juan Pérez | Cotización enviada |
| SY-1002 | Plomería | Juan Pérez | Pendiente de cotización |

---

## 11. Estructura del Proyecto

```
servicioya-ecu/
├── .gitignore
├── backend/
│   ├── .env                              # Variables de entorno
│   ├── package.json                      # Dependencias del backend
│   ├── prisma/
│   │   ├── schema.prisma                 # Schema de base de datos (9 modelos)
│   │   ├── seed.js                       # Datos demo
│   │   └── dev.db                        # SQLite (desarrollo local)
│   └── src/
│       ├── server.js                     # Servidor Express + registro de rutas
│       ├── middleware/
│       │   ├── auth.js                   # JWT authenticate + role authorize
│       │   └── upload.js                 # Multer + Cloudinary
│       └── routes/
│           ├── auth.js                   # Registro, login, /me
│           ├── users.js                  # CRUD de usuarios
│           ├── providers.js              # CRUD de proveedores + aprobar/rechazar
│           ├── requests.js               # Ciclo de vida de solicitudes
│           ├── quotes.js                 # Crear/aceptar/rechazar cotizaciones
│           ├── timeProposals.js          # Negociación de horarios
│           ├── payments.js               # Procesamiento de pagos + estadísticas
│           ├── reviews.js                # Creación de reseñas
│           ├── documents.js              # Upload + revisión de documentos
│           └── categories.js             # CRUD de categorías
├── frontend/
│   ├── .env                              # URL del API (desarrollo)
│   ├── .env.production                   # URL del API (producción)
│   ├── package.json                      # Dependencias del frontend
│   ├── vite.config.js                    # Configuración de Vite
│   ├── index.html                        # Entry point HTML
│   └── src/
│       ├── main.jsx                      # Entry point React
│       ├── App.jsx                       # Definición de rutas (23 rutas)
│       ├── index.css                     # Estilos globales + 12 animaciones
│       ├── api/
│       │   └── client.js                 # Axios con interceptores
│       ├── context/
│       │   └── AuthContext.jsx           # Estado de autenticación
│       ├── components/
│       │   ├── Layout/
│       │   │   ├── Layout.jsx            # Shell de página
│       │   │   ├── Navbar.jsx            # Navegación responsiva
│       │   │   ├── Footer.jsx            # Pie de página
│       │   │   └── ProtectedRoute.jsx    # Guard de autenticación + rol
│       │   └── UI/
│       │       ├── helpers.jsx           # Íconos SVG, StatCard, Badge, Avatar
│       │       ├── Modal.jsx             # Diálogo modal accesible
│       │       └── Toast.jsx             # Sistema de notificaciones
│       └── pages/
│           ├── Home.jsx                  # Página principal
│           ├── Login.jsx                 # Login
│           ├── Register.jsx              # Registro
│           ├── Catalog.jsx               # Catálogo público
│           ├── ProviderProfile.jsx       # Perfil de proveedor
│           ├── Help.jsx                  # Ayuda
│           ├── Client/
│           │   ├── ClientHome.jsx        # Dashboard cliente
│           │   ├── ClientCatalog.jsx     # Búsqueda de proveedores
│           │   ├── ClientRequests.jsx    # Mis solicitudes
│           │   ├── ClientProfile.jsx     # Mi perfil
│           │   ├── RequestForm.jsx       # Nueva solicitud
│           │   └── QuoteView.jsx         # Ver cotización
│           ├── Provider/
│           │   ├── ProviderHome.jsx      # Dashboard proveedor
│           │   ├── ProviderRequests.jsx  # Solicitudes recibidas
│           │   ├── ProviderProfileEdit.jsx # Editar perfil
│           │   ├── ProviderDocuments.jsx # Mis documentos
│           │   └── QuoteForm.jsx         # Crear cotización
│           └── Admin/
│               ├── AdminHome.jsx         # Dashboard admin
│               ├── AdminVerifications.jsx # Verificar proveedores
│               ├── AdminUsers.jsx        # Gestión de usuarios
│               ├── AdminProviders.jsx    # Gestión de proveedores
│               ├── AdminCategories.jsx   # Gestión de categorías
│               └── AdminReports.jsx      # Reportes y analíticas
```

---

## 12. Flujo Completo del Usuario

### Flujo del Cliente

1. **Registro** → Se crea cuenta como `cliente`
2. **Buscar proveedor** → Catálogo con filtros por categoría, ciudad, precio
3. **Ver perfil** → Detalle del proveedor: experiencia, documentos, reseñas
4. **Solicitar servicio** → Formulario con descripción, fecha preferida, rango horario
5. **Recibir cotización** → Opción A (solo mano de obra) / Opción B (con materiales)
6. **Aceptar/rechazar** → Al aceptar se genera un registro de pago
7. **Negociar horario** → Proponer/aceptar hora exacta
8. **Pagar** → Simulación de PayPhone (mock)
9. **Servicio en proceso** → El proveedor inicia el trabajo
10. **Servicio completado** → El proveedor marca como completado
11. **Calificar** → 1-5 estrellas + comentario

### Flujo del Proveedor

1. **Registro** → Se crea cuenta como `proveedor` (estado: Pendiente)
2. **Subir documentos** → Cédula, antecedentes, experiencia, RUC
3. **Esperar aprobación** → Admin revisa documentos
4. **Dashboard** → Ver solicitudes recibidas
5. **Crear cotización** → Definir precio mano de obra + materiales + hora exacta
6. **Iniciar trabajo** → Marcar solicitud como `en_proceso`
7. **Completar** → Marcar solicitud como `completada`

### Flujo del Administrador

1. **Dashboard** → Estadísticas de solicitudes, pagos, proveedores
2. **Verificaciones** → Revisar documentos de proveedores pendientes
3. **Aprobar/rechazar** → Si 3+ documentos aprobados → aprobación automática
4. **Gestionar usuarios** → Ver lista completa
5. **Gestionar proveedores** → Aprobar/rechazar perfiles
6. **Categorías** → CRUD completo
7. **Reportes** → Analíticas y métricas

---

## 13. Variables de Entorno

### Backend (.env)

```
DATABASE_URL=postgresql://neondb_owner:***@ep-restless-band-ac1m6pqq.sa-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=sy_ecu_jwt_secret_2026_production
PORT=4000
UPLOAD_DIR=./uploads
CLOUDINARY_CLOUD_NAME=o1xbuo6q
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
```

### Frontend (.env.production)

```
VITE_API_URL=https://servicioya-ecu-production.up.railway.app/api
```

---

## 14. Comandos Útiles

```bash
# Desarrollo local
cd backend && node src/server.js        # Backend en :4000
cd frontend && npx vite --port 5173     # Frontend en :5173

# Base de datos
npx prisma db push                      # Sincronizar schema
npx prisma generate                     # Regenerar Prisma Client
node prisma/seed.js                     # Sembrar datos demo
npx prisma studio                       # Abrir Prisma Studio en :5555

# Producción
git push                                # Trigger deploy automático en Railway
```

---

## 15. Pendiente por Implementar

| # | Funcionalidad | Prioridad |
|---|---------------|-----------|
| 1 | Integración real con PayPhone API | Alta |
| 2 | Notificaciones por email | Media |
| 3 | Notificaciones por WhatsApp | Baja |
| 4 | Chat en tiempo real entre cliente y proveedor | Media |
| 5 | Mapas con ubicación de proveedores | Baja |
| 6 | Sistema de reportes de usuarios | Baja |
| 7 | Responsive testing en dispositivos móviles | Alta |
| 8 | Tests unitarios y de integración | Media |
| 9 | Optimización de rendimiento (lazy loading) | Media |
| 10 | SEO y meta tags | Baja |

---

*Informe generado el 22 de julio de 2026 — ServicioYa ECU v2.0.0*
