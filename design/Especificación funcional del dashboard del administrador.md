# Especificación funcional del dashboard del administrador

## Plataforma de solicitudes y presupuestos

### Propósito

Este documento define los módulos, pantallas, elementos y funciones que debería tener el dashboard del administrador para una plataforma donde los clientes crean solicitudes de servicios y los profesionales responden con presupuestos. La especificación se basa en el modelo analizado anteriormente: cuestionarios dinámicos por servicio, distribución de solicitudes, cotizaciones, perfiles profesionales, selección del proveedor, cobro por lead y reputación.

> El administrador debe controlar todo el ciclo de negocio: **servicios → formularios → solicitudes → matching → presupuestos → contratación → reseñas → monetización**.

## 1. Objetivos principales del dashboard

El dashboard debe permitir que el dueño de la plataforma pueda configurar el marketplace sin depender continuamente de un desarrollador. En particular, debe poder crear nuevos servicios, diseñar sus formularios, controlar las reglas condicionales, revisar y moderar solicitudes, gestionar profesionales, supervisar presupuestos, administrar costes y analizar el rendimiento del sistema.

La arquitectura recomendada es modular y basada en permisos. Un administrador global puede acceder a todo, mientras que operadores de soporte, moderadores, responsables comerciales y analistas solo ven las áreas necesarias para su función.

## 2. Navegación principal

| Módulo | Finalidad |
|---|---|
| Inicio / resumen | Visión global del negocio y alertas operativas |
| Servicios | Crear y organizar categorías y servicios |
| Constructor de formularios | Diseñar preguntas, opciones, validaciones y bifurcaciones |
| Solicitudes | Consultar, editar, distribuir, pausar y moderar solicitudes |
| Matching y distribución | Configurar qué profesionales reciben cada solicitud |
| Profesionales | Gestionar registros, perfiles, verificaciones y estado operativo |
| Presupuestos | Supervisar las ofertas enviadas y sus costes |
| Clientes | Consultar cuentas, solicitudes, actividad y comunicaciones |
| Conversaciones | Moderar chat, llamadas registradas y contactos |
| Trabajos / acuerdos | Controlar selecciones, contrataciones y estados posteriores |
| Reseñas | Moderar y gestionar reputación |
| Facturación y saldo | Gestionar costes de leads, comisiones, pagos y reembolsos |
| Marketing y contenido | Gestionar páginas, mensajes, promociones y SEO |
| Notificaciones | Configurar emails, SMS, WhatsApp y plantillas |
| Soporte | Casos, incidencias y atención al cliente |
| Analítica | Métricas de conversión, calidad, ingresos y operación |
| Configuración | Usuarios, permisos, seguridad, integraciones y auditoría |

## 3. Inicio: dashboard ejecutivo

La pantalla de inicio debe presentar una fotografía operativa del marketplace. No debe ser únicamente un conjunto de gráficas: también tiene que mostrar tareas pendientes y anomalías que requieren intervención.

### Indicadores principales

| Indicador | Descripción |
|---|---|
| Solicitudes nuevas | Solicitudes creadas en el periodo seleccionado |
| Solicitudes completas | Solicitudes que superaron validaciones y fueron publicadas |
| Tasa de abandono | Porcentaje de usuarios que iniciaron un formulario y no lo terminaron |
| Presupuestos enviados | Número de presupuestos generados por profesionales |
| Promedio de presupuestos por solicitud | Medida de liquidez del marketplace |
| Tiempo hasta el primer presupuesto | Velocidad de respuesta del sistema |
| Tasa de selección | Porcentaje de solicitudes con un profesional elegido |
| Tasa de acuerdo de trabajo | Porcentaje de presupuestos que terminan en acuerdo |
| Ingresos por leads | Ingresos derivados de costes cobrados al profesional |
| Ingresos por comisiones | Ingresos derivados de acuerdos de trabajo, si aplica |
| Profesionales activos | Profesionales que pueden recibir solicitudes |
| Solicitudes sin respuesta | Leads que no han recibido ninguna cotización |

### Componentes de la pantalla

El administrador debe poder filtrar por fecha, país, ciudad, categoría, servicio, dispositivo y canal de adquisición. La pantalla debe incluir una lista de alertas, por ejemplo: formularios con abandono anormal, servicios sin profesionales disponibles, solicitudes sin respuesta, errores de notificación, saldos negativos, reclamaciones pendientes y presupuestos bloqueados por moderación.

## 4. Gestión de categorías y servicios

Este módulo controla el catálogo que el cliente consulta desde la búsqueda inicial. La estructura debe soportar categorías, subcategorías, servicios, sinónimos y variantes regionales.

### Funciones necesarias

1. Crear, editar, duplicar, archivar y restaurar categorías.
2. Crear servicios y asignarlos a una categoría.
3. Definir nombre visible, nombre interno, slug, descripción y traducciones.
4. Añadir sinónimos para mejorar la búsqueda.
5. Configurar icono, imagen, orden de aparición y estado de publicación.
6. Asociar servicios relacionados y servicios alternativos.
7. Definir disponibilidad por ciudad, provincia, código postal o país.
8. Configurar si el servicio admite solicitudes urgentes, visitas, presupuestos remotos o trabajos recurrentes.
9. Crear páginas públicas del servicio y contenido SEO.
10. Ver cuántas solicitudes, presupuestos, acuerdos e ingresos genera cada servicio.
11. Previsualizar cómo se muestra el servicio al cliente.
12. Versionar cambios y permitir volver a una versión anterior.

### Estados de un servicio

`borrador → revisión → publicado → pausado → archivado`

Un servicio publicado no debería poder eliminarse físicamente si ya tiene solicitudes históricas. Debe archivarse para conservar la integridad de los datos.

## 5. Constructor de formularios dinámicos

Este es el módulo más importante del dashboard. Debe permitir al dueño de la plataforma crear el cuestionario específico de cada servicio sin programar cada flujo manualmente.

### Estructura de un formulario

Cada formulario debe tener una versión y estar asociado a un servicio. La configuración mínima de una pregunta debería incluir:

| Campo | Función |
|---|---|
| ID interno | Identificador estable para datos y analítica |
| Etiqueta visible | Texto de la pregunta para el cliente |
| Texto de ayuda | Explicación o ejemplo |
| Tipo de campo | Radio, checkbox, selector, texto, número, fecha, ubicación, teléfono, email, archivo o escala |
| Opciones | Valores disponibles y sus etiquetas |
| Obligatorio | Define si se puede avanzar sin responder |
| Valor por defecto | Reduce fricción cuando existe una respuesta habitual |
| Regla de visibilidad | Determina cuándo aparece la pregunta |
| Regla de validación | Define formato, rangos y límites |
| Mapeo al lead | Indica cómo se guarda y muestra la respuesta |
| Orden | Posición de la pregunta en el recorrido |
| Traducciones | Textos por idioma y región |
| Etiquetas internas | Datos para matching, segmentación y analítica |

### Tipos de preguntas que debería soportar

El administrador debe poder seleccionar preguntas de opción única, selección múltiple, texto corto, texto largo, cantidad, superficie, presupuesto orientativo, fecha, intervalo de fechas, hora, código postal, ciudad, dirección aproximada, carga de fotografías o documentos, teléfono, correo electrónico y consentimiento.

También debe poder crear bloques reutilizables, como ubicación, urgencia, contacto, disponibilidad, presupuesto aproximado y descripción del trabajo. Estos bloques pueden compartirse entre varios servicios y actualizarse de forma centralizada.

### Reglas condicionales

El constructor debe permitir expresar reglas como:

- Mostrar la pregunta B si la respuesta a A es “Reparación”.
- Mostrar un bloque de urgencia si el cliente selecciona “Lo antes posible”.
- Pedir número de unidades si el servicio es instalación.
- Pedir fecha del evento si la categoría es fotografía o eventos.
- Pedir fotografías si el tipo de trabajo requiere inspección visual.
- Ocultar preguntas de presupuesto cuando el servicio se cotiza exclusivamente después de una visita.
- Enviar a una ruta alternativa si el cliente selecciona un servicio que la plataforma no cubre.

El sistema debe admitir operadores `igual`, `distinto`, `incluye`, `mayor que`, `menor que`, `entre`, `responde/no responde` y combinaciones `AND/OR`.

### Validaciones

El administrador debe poder establecer expresiones de validación, rangos numéricos, longitud mínima y máxima, formatos de email y teléfono, códigos postales válidos, fechas futuras, archivos permitidos y límites de tamaño. La validación debe ocurrir tanto en la interfaz como en el servidor.

### Funciones avanzadas del constructor

1. Previsualización como cliente en escritorio y móvil.
2. Simulación de respuestas para recorrer todas las ramas.
3. Detección de preguntas inalcanzables o reglas contradictorias.
4. Copiar un formulario desde otro servicio.
5. Guardar como borrador.
6. Publicar una nueva versión sin romper solicitudes existentes.
7. Comparar dos versiones.
8. Programar la fecha de publicación.
9. Ver tasa de abandono por paso y por pregunta.
10. A/B testing de textos, orden o número de pasos.
11. Marcar qué respuestas son visibles para profesionales y cuáles son privadas.
12. Definir qué datos se usan para matching, segmentación o notificaciones.

### Reglas de publicación

Una versión nueva debe pasar una validación automática antes de publicarse. El sistema debe impedir publicar formularios sin pregunta de servicio, sin ubicación cuando sea necesaria, sin mecanismo de contacto o con ramas que no tengan una salida válida.

## 6. Gestión de solicitudes de clientes

Este módulo permite revisar todas las solicitudes, tanto las que están en curso como las históricas.

### Vista de listado

Debe incluir búsqueda por ID, cliente, servicio, ciudad, código postal, teléfono, email y estado. Los filtros deben contemplar fecha, categoría, urgencia, número de presupuestos, profesional asignado, origen, nivel de completitud y motivo de bloqueo.

### Vista de detalle

La ficha de una solicitud debe mostrar:

1. Datos normalizados del servicio.
2. Respuestas completas del formulario.
3. Respuestas originales y valores transformados.
4. Ubicación y radio de servicio.
5. Fecha de creación, publicación y vencimiento.
6. Historial de cambios.
7. Profesionales que la recibieron.
8. Profesionales que la visualizaron.
9. Presupuestos enviados, rechazados o retirados.
10. Conversaciones y contactos generados.
11. Estado de selección y acuerdo.
12. Incidencias, reclamaciones y notas internas.

### Acciones administrativas

El administrador debe poder editar datos con registro de auditoría, solicitar información adicional, corregir la clasificación del servicio, reasignar categoría, pausar, reabrir, cancelar, duplicar, ocultar información sensible, bloquear solicitudes fraudulentas y reenviar una solicitud a profesionales elegibles.

La edición administrativa debe distinguir entre cambios que solo corrigen la presentación y cambios que alteran el matching. Si se modifica el servicio, ubicación, alcance o urgencia, el sistema debe recalcular la distribución y registrar el motivo.

## 7. Motor de matching y distribución

Este módulo controla qué profesionales reciben cada solicitud y en qué orden o condiciones.

### Criterios configurables

| Criterio | Uso |
|---|---|
| Servicio | Coincidencia entre lo solicitado y lo ofrecido |
| Zona | Comprobación de radio, ciudad, provincia o código postal |
| Disponibilidad | Evita enviar trabajos a profesionales no disponibles |
| Capacidad | Limita solicitudes simultáneas |
| Tipo de cliente o trabajo | Permite segmentar especialidades |
| Calidad del perfil | Puede priorizar perfiles completos y verificados |
| Historial de respuesta | Ayuda a evitar distribuir leads a profesionales inactivos |
| Presupuesto o coste del lead | Permite reglas económicas por servicio |
| Preferencias del profesional | Respeta horarios, tamaños y tipos de trabajo |
| Equilibrio de oferta | Evita concentrar todos los leads en pocos profesionales |

### Funciones del módulo

1. Crear reglas de elegibilidad.
2. Definir prioridad entre reglas.
3. Configurar radio geográfico.
4. Configurar número máximo de profesionales por solicitud.
5. Definir ventanas de distribución y expiración.
6. Crear grupos de profesionales por servicio o zona.
7. Configurar distribución simultánea o escalonada.
8. Definir exclusiones y listas negras.
9. Simular qué profesionales recibirían una solicitud de prueba.
10. Ver por qué un profesional fue incluido o excluido.
11. Reenviar solicitudes no atendidas.
12. Medir respuesta por regla, zona y servicio.

El sistema debe guardar una explicación legible del matching, por ejemplo: “Incluido porque ofrece Electricidad, cubre el código postal y tiene disponibilidad activa”; o “Excluido porque no cubre la zona”. Esto es fundamental para soporte y para depurar errores.

## 8. Gestión de profesionales

### Registro y aprobación

El administrador debe poder ver altas nuevas, solicitudes incompletas, perfiles pendientes, documentación, verificaciones y motivos de rechazo. Debe poder aprobar, rechazar, pedir cambios, suspender temporalmente y reactivar cuentas.

### Perfil profesional

La ficha debe incluir nombre comercial, persona de contacto, servicios, zonas, horarios, experiencia, descripción, fotografías, certificaciones, seguros, reseñas, precio orientativo, estado de disponibilidad, saldo, presupuestos enviados y conversión histórica.

### Funciones operativas

1. Editar o corregir datos del perfil.
2. Gestionar servicios y zonas ofrecidas.
3. Marcar un profesional como verificado o no verificado.
4. Revisar documentos con fecha de caducidad.
5. Configurar límites de solicitudes.
6. Bloquear temporalmente la recepción de leads.
7. Consultar el historial de actividad.
8. Ver costes, saldos, cargos y reembolsos.
9. Consultar reclamaciones y sanciones.
10. Acceder al perfil público mediante vista de usuario.
11. Actuar como soporte sin suplantar silenciosamente al profesional.

## 9. Gestión de presupuestos

Este módulo permite supervisar el segundo formulario central: el que utiliza el profesional para contestar una solicitud.

### Campos del presupuesto

El administrador debe poder definir qué campos son obligatorios en cada servicio. Como mínimo, el presupuesto debería admitir precio o rango de precio, descripción, condiciones, plazo de ejecución, disponibilidad, desplazamiento, materiales incluidos o excluidos, impuestos, validez de la oferta y archivos adjuntos.

### Funciones

1. Ver todos los presupuestos por estado.
2. Filtrar por servicio, profesional, cliente, importe, fecha y coste de lead.
3. Consultar cuándo se abrió y envió cada presupuesto.
4. Detectar presupuestos duplicados o spam.
5. Bloquear o retirar presupuestos que infrinjan políticas.
6. Reenviar notificaciones al cliente.
7. Gestionar presupuestos retirados por el profesional.
8. Consultar el coste mostrado antes del envío.
9. Ajustar reglas de precios por servicio o zona.
10. Resolver disputas sobre cargos.

### Estados recomendados

`borrador → pendiente de confirmación → enviado → visto → contacto iniciado → seleccionado → rechazado/retirado → expirado`

La plataforma debe diferenciar claramente entre “presupuesto enviado” y “acuerdo de trabajo”. Enviar una oferta no garantiza que el profesional sea elegido.

## 10. Gestión de clientes

La ficha del cliente debe mostrar sus solicitudes, estado de verificación, preferencias de contacto, comunicaciones, presupuestos recibidos, profesionales seleccionados, reseñas y reclamaciones.

El administrador debe poder corregir datos de contacto con autorización, fusionar cuentas duplicadas, bloquear cuentas fraudulentas, exportar los datos permitidos, gestionar solicitudes de privacidad y revisar el consentimiento para email, SMS y WhatsApp.

El acceso a datos personales debe estar limitado por rol y quedar registrado. Los operadores no deberían ver teléfonos completos si no los necesitan para resolver una incidencia.

## 11. Conversaciones y contactos

El dashboard debe tener una bandeja de conversaciones con búsqueda por solicitud, cliente, profesional y fecha. Debe permitir moderar spam, ocultar datos sensibles, marcar mensajes abusivos, adjuntar notas internas y vincular una conversación con una reclamación.

Si existen llamadas o WhatsApp Business, el panel debe mostrar únicamente los metadatos necesarios, como canal, fecha, estado y consentimiento. No debe permitir grabar o consultar contenido sensible sin autorización y base legal correspondiente.

## 12. Trabajos y acuerdos

El sistema debe permitir marcar el profesional seleccionado por el cliente mediante una acción equivalente a “Seleccionar cotización”. Esa selección debe habilitar el seguimiento del trabajo y la reseña posterior.

### Funciones

1. Ver solicitudes con profesional seleccionado.
2. Registrar estado del acuerdo.
3. Marcar trabajo iniciado, en curso, completado, cancelado o disputado.
4. Calcular comisiones si corresponden.
5. Gestionar fechas estimadas y fechas reales.
6. Registrar cancelaciones y motivos.
7. Lanzar la solicitud de reseña después de completar el trabajo.
8. Detectar acuerdos que no avanzan.

## 13. Moderación y confianza

Este módulo debe centralizar controles de calidad y seguridad.

### Herramientas

1. Cola de solicitudes sospechosas.
2. Detección de duplicados.
3. Detección de teléfonos, emails o enlaces no permitidos en campos de texto.
4. Detección de lenguaje ofensivo, spam o contenido ilegal.
5. Revisión de fotografías y documentos.
6. Listas de palabras y expresiones bloqueadas.
7. Límites por IP, dispositivo, teléfono y cuenta.
8. Sistema de advertencias y sanciones.
9. Historial de decisiones de moderación.
10. Escalado automático a soporte o cumplimiento.

Toda acción de moderación debe registrar quién la tomó, cuándo, qué regla se aplicó y qué contenido fue afectado.

## 14. Reseñas y reputación

El administrador debe poder revisar reseñas pendientes, publicadas, denunciadas, ocultas y eliminadas. Debe existir un sistema de respuesta a reclamaciones y un motivo normalizado para retirar una reseña.

Las métricas deben separar reseñas verificadas, reseñas asociadas a un trabajo seleccionado y reseñas sin acuerdo formal. El sistema debe evitar que un profesional pueda manipular su puntuación mediante cuentas duplicadas o solicitudes ficticias.

## 15. Facturación, saldo y monetización

Este módulo es crítico porque el profesional puede pagar un coste por enviar la cotización y, según el modelo, una comisión al producirse un acuerdo.

### Funciones

1. Configurar coste de lead por servicio, zona o tipo de solicitud.
2. Configurar comisiones por acuerdo.
3. Consultar saldo de cada profesional.
4. Registrar recargas, cargos, devoluciones y ajustes.
5. Gestionar créditos promocionales.
6. Configurar saldo mínimo y alertas.
7. Bloquear el envío cuando no exista saldo suficiente.
8. Mostrar el coste antes de la confirmación del presupuesto.
9. Emitir facturas y recibos.
10. Exportar movimientos contables.
11. Resolver reembolsos por duplicados, errores o incidencias aprobadas.
12. Separar pagos por coste de lead y comisiones.

El sistema debe conservar un libro mayor inmutable de movimientos. Nunca se debe modificar un cargo histórico sin crear un asiento de ajuste relacionado.

## 16. Notificaciones y automatizaciones

El administrador debe disponer de un gestor de plantillas para email, SMS, WhatsApp y notificaciones push.

### Eventos configurables

| Evento | Destinatario | Acción |
|---|---|---|
| Solicitud publicada | Profesionales elegibles | Avisar de una nueva oportunidad |
| Nuevo presupuesto | Cliente | Avisar de que puede revisar una cotización |
| Solicitud próxima a vencer | Profesionales | Recordar la ventana disponible |
| Presupuesto seleccionado | Profesional | Informar de la elección |
| Trabajo completado | Cliente | Solicitar reseña |
| Saldo bajo | Profesional | Solicitar recarga |
| Documentación próxima a caducar | Profesional/admin | Pedir actualización |
| Reclamación creada | Soporte | Abrir caso |

Cada plantilla debe admitir variables, traducciones, versión, vista previa, prueba de envío, activación/desactivación y registro de entregabilidad. El administrador debe poder definir límites para evitar envíos repetidos.

## 17. Soporte y reclamaciones

El módulo de soporte debe centralizar tickets de clientes y profesionales. Cada caso debe estar relacionado con una cuenta, solicitud, presupuesto, acuerdo, movimiento financiero o conversación.

Las funciones recomendadas son asignación por equipo, prioridades, SLA, estados, etiquetas, notas internas, respuestas guardadas, adjuntos, historial, escalado, resolución y encuesta de satisfacción. El operador debe poder consultar la información contextual sin cambiar datos críticos directamente.

## 18. Analítica y reportes

### Embudo del cliente

El dashboard debe medir:

`visita → búsqueda → servicio seleccionado → formulario iniciado → formulario completado → contacto validado → solicitud publicada → primer presupuesto → comparación → selección → trabajo completado → reseña`

### Embudo del profesional

Debe medir:

`registro → perfil iniciado → perfil aprobado → servicio activado → solicitud recibida → solicitud abierta → presupuesto iniciado → presupuesto enviado → cliente contactado → acuerdo`

### Informes necesarios

1. Conversión por servicio y pregunta.
2. Abandono por paso y dispositivo.
3. Tiempo medio hasta el primer presupuesto.
4. Número de cotizaciones por solicitud.
5. Tasa de aceptación o selección.
6. Rendimiento por zona.
7. Calidad de leads por profesional.
8. Ingresos por servicio y canal.
9. Coste de adquisición de cliente.
10. Retención y recurrencia de clientes.
11. Tasa de reclamaciones.
12. Rendimiento de notificaciones.
13. Rentabilidad de promociones.
14. A/B tests activos y resultados.

Los datos deben poder exportarse en CSV y filtrarse por periodos, servicio, ubicación y canal. Los cambios de definición de métricas deben quedar versionados.

## 19. Usuarios, roles y permisos

No se recomienda utilizar una única cuenta con acceso total. Como mínimo, deben existir los siguientes roles:

| Rol | Acceso principal |
|---|---|
| Superadministrador | Toda la plataforma y configuración crítica |
| Administrador de producto | Servicios, formularios, matching y experimentos |
| Operador de solicitudes | Solicitudes, distribución y correcciones operativas |
| Moderador | Contenido, perfiles, mensajes y reseñas |
| Soporte | Clientes, profesionales, solicitudes y tickets |
| Finanzas | Saldos, cargos, comisiones, facturas y reembolsos |
| Analista | Lectura de datos y exportación de reportes |
| Editor de contenido | Categorías, páginas, textos y traducciones |
| Auditor | Acceso de solo lectura y registros de actividad |

Los permisos deben aplicarse por módulo y acción: ver, crear, editar, publicar, aprobar, suspender, exportar, reembolsar y eliminar. Las acciones irreversibles deben exigir confirmación y, en áreas financieras o de seguridad, una segunda aprobación.

## 20. Auditoría y seguridad

El dashboard debe incluir un registro de auditoría de toda acción relevante: publicación de formularios, cambios de reglas, edición de solicitudes, aprobación de profesionales, cargos, reembolsos, suspensiones, exportaciones y accesos a datos sensibles.

Cada evento debe almacenar usuario, rol, fecha, dirección IP o dispositivo cuando corresponda, objeto afectado, valor anterior, valor nuevo, motivo y resultado. Debe existir búsqueda por usuario, entidad, acción y rango de fechas.

Las funciones de seguridad deben incluir autenticación multifactor, sesiones revocables, políticas de contraseña, control de acceso por ubicación cuando sea necesario, alertas de inicio de sesión anómalo, límites de exportación y ocultación parcial de datos personales.

## 21. Requisitos técnicos del modelo de datos

El backend debería separar al menos las siguientes entidades:

`Category`, `Service`, `Form`, `FormVersion`, `Question`, `QuestionOption`, `Condition`, `ValidationRule`, `Client`, `Professional`, `ProfessionalService`, `ServiceArea`, `ServiceRequest`, `RequestAnswer`, `MatchingRule`, `RequestDistribution`, `Quote`, `QuoteItem`, `Conversation`, `WorkAgreement`, `Review`, `Wallet`, `LedgerEntry`, `Notification`, `SupportTicket`, `ModerationCase`, `AdminUser`, `Role`, `Permission` y `AuditEvent`.

Las respuestas del formulario deben conservar tanto el valor mostrado al usuario como el valor normalizado utilizado para matching. Las versiones del formulario deben quedar asociadas a cada solicitud para que una modificación posterior no cambie la interpretación histórica de las respuestas.

## 22. Prioridad de implementación

### MVP imprescindible

El primer lanzamiento debe incluir gestión de servicios, constructor básico de formularios, reglas condicionales, solicitudes, profesionales, matching por servicio y zona, presupuestos, clientes, notificaciones esenciales, roles básicos, auditoría y analítica del embudo.

### Segunda fase

La segunda fase puede incorporar A/B testing, distribución escalonada, documentación profesional avanzada, moderación automática, soporte completo, facturación avanzada, promociones y reglas de calidad del lead.

### Tercera fase

La tercera fase puede incluir optimización automática de matching, predicción de conversión, pricing dinámico, recomendaciones de profesionales, automatización de campañas y analítica avanzada de cohortes.

| Prioridad | Módulos |
|---|---|
| P0 | Servicios, formularios, solicitudes, matching, profesionales, presupuestos, clientes, notificaciones, roles y auditoría |
| P1 | Moderación, soporte, reseñas, saldo, facturación, reportes avanzados y versionado completo |
| P2 | A/B testing, automatizaciones complejas, pricing dinámico, predicción y optimización automática |

## 23. Criterios de aceptación

El dashboard estará correctamente implementado cuando un administrador pueda crear un servicio desde cero, construir un formulario con preguntas condicionales, publicarlo, recibir una solicitud de prueba, comprobar qué profesionales son elegibles, enviar una cotización de prueba, visualizar el coste aplicable, registrar la selección del cliente y generar la reseña posterior.

Además, toda acción crítica debe ser reversible o quedar auditada; ninguna modificación de formulario debe alterar solicitudes históricas; un profesional no elegible no debe recibir un lead; el cliente no debe poder publicar una solicitud incompleta; y el coste para el profesional debe mostrarse antes de confirmar el presupuesto.

## Conclusión

El dashboard no debe tratarse como un simple panel de administración de usuarios. Es el **centro de configuración y control del marketplace**. Su pieza estratégica es el constructor de formularios, pero su valor depende de que esté conectado con matching, distribución, presupuestos, monetización, soporte, seguridad y analítica.

La recomendación más importante es construir desde el inicio un sistema **configurable, versionado y auditable**. De esa forma, el dueño de la plataforma podrá añadir servicios y modificar preguntas sin depender de cambios de código, manteniendo al mismo tiempo la trazabilidad de cada solicitud y cada presupuesto.

## Referencias funcionales

[1]: https://prontopro.es/ — Página pública de ProntoPro España y flujo general de cliente/profesional.

[2]: https://prontopro.es/createRequest/quote/find-service?redirectUrl=https%3A%2F%2Fprontopro.es%2F — Entrada pública de selección del servicio.

[3]: https://prontoproit.zendesk.com/hc/es/articles/10025884217500--C%C3%B3mo-funciona-ProntoPro — Flujo de solicitud, comparación, selección y reseña.

[4]: https://terminosyservicios.prontopro.es/ — Términos sobre cuentas, proveedores, costes de lead, comisiones y acuerdos.

[5]: https://prontopro.es/prosignup — Flujo público de alta de profesionales.
