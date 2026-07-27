# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El usuario principal es una persona en Ecuador que necesita resolver una tarea o problema del hogar y quiere encontrar un profesional confiable sin perder tiempo. Los proveedores son la audiencia secundaria: necesitan presentar su experiencia, recibir solicitudes y gestionar el trabajo sin competir con el flujo principal del cliente. Administradores verifican personas, documentos, solicitudes y soporte.

## Product Purpose

ServicioYa ECU conecta clientes con proveedores locales verificados para buscar, comparar, solicitar, cotizar y dar seguimiento a servicios del hogar. El éxito principal es que un cliente pase de una necesidad concreta a una solicitud completa con claridad y confianza.

## Positioning

Una plataforma ecuatoriana que combina descubrimiento de talento local, verificación administrativa, ubicación del trabajo, evidencia fotográfica, cotización y seguimiento dentro del mismo flujo.

## Operating Context

Los clientes suelen llegar con una necesidad urgente o pendiente, desde un teléfono o computador, y comparan especialidad, ciudad, precio, experiencia, disponibilidad y calificaciones. El flujo incluye registro, catálogo, perfil del proveedor, solicitud con mapa y fotografías, cotización, comunicación, pago o reserva, seguimiento y evaluación.

## Capabilities and Constraints

- Aplicación React y Vite con backend Express, Prisma y autenticación por roles.
- Roles confirmados: cliente, proveedor y administrador.
- Se conservan rutas, nombres de navegación, campos de formularios y flujos existentes.
- Los teléfonos ecuatorianos deben validarse con 10 dígitos y prefijo 09.
- Proveedores requieren información profesional, fotografías y documentos de validación.
- El cliente es prioritario, sin ocultar el acceso y valor para proveedores.

## Brand Commitments

- Nombre: ServicioYa ECU.
- Idioma principal: español de Ecuador.
- Personalidad confirmada: tecnología moderna combinada con una plataforma enérgica.
- La interfaz debe comunicar confianza, cercanía, velocidad y profesionalismo.
- La fotografía debe representar hogares y profesionales ecuatorianos de manera auténtica.

## Evidence on Hand

- Aplicación funcional completa en `frontend/` y `backend/`.
- Imagen editorial generada en `frontend/public/images/servicioya-hero-v2.png`.
- Flujos de evaluación SUS, UEQ y AttrakDiff en `evaluacion_usabilidad/`.
- No existen testimonios comerciales, cifras de mercado ni garantías verificadas; no deben inventarse.

## Product Principles

1. La necesidad del cliente se entiende y se puede actuar sobre ella en segundos.
2. La confianza se demuestra con información y estados reales, no con afirmaciones decorativas.
3. Cada formulario previene errores antes de enviarse y explica cómo corregirlos.
4. Los proveedores mantienen un camino visible, digno y profesional dentro de una experiencia centrada en clientes.
5. La energía visual nunca reduce la legibilidad ni la familiaridad de los controles.

## Accessibility & Inclusion

La interfaz debe conservar navegación por teclado, foco visible, contraste WCAG AA, etiquetas explícitas, textos alternativos y respeto por `prefers-reduced-motion`.
