# Documentación de Módulos del Dashboard de Administración

---

## Español

### 1. Resumen Ejecutivo
Panel de control principal que muestra los KPIs más importantes del marketplace: solicitudes, presupuestos, ingresos, profesionales activos y alertas operativas que requieren intervención inmediata. Incluye filtros por fecha, país, ciudad, categoría, servicio, dispositivo y canal de adquisición.

### 2. Servicios
Administra el catálogo completo de servicios de la plataforma. Crea, edita, duplica, pausa o archiva servicios. Controla estados (borrador → revisión → publicado → pausado → archivado), categorías, variantes regionales y estadísticas de solicitud e ingresos por servicio.

### 3. Constructor de Formularios
Crea y gestiona los formularios dinámicos que los clientes completan al solicitar un servicio. Soporta 11 tipos de pregunta (opción única, selección múltiple, texto corto/largo, cantidad, fecha, selector, teléfono, email, archivo, escala), reglas condicionales, validaciones y versionado. Analiza tasas de abandono por paso para optimizar la conversión.

### 4. Solicitudes
Gestiona todas las solicitudes de servicio recibidas de clientes. Visualiza respuestas del formulario, edita datos, redistribuye, pausa, reabre o cancela solicitudes. Cada solicitud incluye historial de cambios, profesional asignado y conversaciones vinculadas. Incluye filtros de búsqueda por ID, cliente, ciudad y estado.

### 5. Matching y Distribución
Define las reglas que determinan qué profesionales reciben cada solicitud de cliente. Configura criterios como servicio, zona, disponibilidad, capacidad y calidad del perfil. Usa el simulador para verificar cómo se comportan las reglas con datos de prueba, mostrando quiénes quedan incluidos o excluidos y el motivo.

### 6. Profesionales
Administra el ciclo de vida completo de los profesionales: desde el registro y aprobación hasta la suspensión. Revisa documentación, verifica perfiles, gestiona saldos, historial de trabajos y sanciones. La cola de aprobación muestra los registros pendientes de revisión con acciones de aprobar/rechazar.

### 7. Presupuestos
Supervisa todos los presupuestos enviados por profesionales a clientes. Sigue el ciclo de vida: borrador → pendiente → enviado → visto → contacto → seleccionado/rechazado/expirado. Visualiza costes de lead por cada presupuesto y el historial de interacciones.

### 8. Clientes
Consulta y gestiona las cuentas de clientes de la plataforma. Visualiza historial de solicitudes, comunicaciones, presupuestos recibidos, profesionales seleccionados y reseñas. Bloquea cuentas problemáticas o exporta datos para análisis externo.

### 9. Conversaciones
Monitorea todas las conversaciones entre clientes y profesionales a través de chat, WhatsApp y email. Marca spam, oculta contenido inapropiado y añade notas internas para seguimiento. Cada conversación está vinculada a una solicitud específica.

### 10. Trabajos y Acuerdos
Supervisa los acuerdos de trabajo entre clientes y profesionales seleccionados. Sigue el ciclo: seleccionado → iniciado → en curso → completado/cancelado/disputado. Controla comisiones, fechas y dispara encuestas de satisfacción al completar.

### 11. Reseñas y Reputación
Gestiona las reseñas publicadas por clientes sobre profesionales. Aprueba, oculta o elimina reseñas según las políticas de contenido. Separa reseñas verificadas (asociadas a trabajo completado) de reseñas sin acuerdo formal. Detecta intentos de manipulación.

### 12. Facturación y Saldo
Administra el ledger financiero de la plataforma: costes de lead, comisiones por acuerdo, recargas de saldo, reembolsos y ajustes. Configura tarifas globales y exporta movimientos para contabilidad. El ledger es inmutable — los ajustes se realizan con entradas compensatorias.

### 13. Marketing y Contenido
Administra el contenido de marketing de la plataforma: páginas de aterrizaje, campañas promocionales y optimización SEO. Edita textos, configura descuentos y monitorea el rendimiento de las páginas con puntuaciones de calidad SEO.

### 14. Notificaciones
Configura las plantillas de notificación multi-canal (email, SMS, WhatsApp, push) que se envían automáticamente ante eventos como nueva solicitud, presupuesto recibido, saldo bajo o documentación por caducar. Controla activación, envío de prueba y tasas de entregabilidad.

### 15. Soporte
Centraliza los tickets de soporte de clientes y profesionales. Asigna agentes, gestiona prioridades, SLA, estados y escalamientos. Cada ticket se vincula a cuentas, solicitudes, presupuestos, acuerdos y conversaciones para contexto completo.

### 16. Analítica
Visualiza los embudos de conversión de clientes (12 pasos) y profesionales (10 pasos). Analiza reportes de conversión por servicio, abandono por paso, tiempos de respuesta y rendimiento por zona. Exporta datos en CSV para análisis externo.

### 17. Configuración
Administra los usuarios administradores, roles con permisos por módulo, políticas de seguridad (MFA, sesiones, contraseñas, control IP) e integraciones externas (base de datos, email, pagos, mensajería). Cada acción genera un registro de auditoría.

---

## English

### 1. Executive Summary
Main control panel displaying the marketplace's most important KPIs: requests, quotes, revenue, active professionals, and operational alerts requiring immediate attention. Includes filters by date, country, city, category, service, device, and acquisition channel.

### 2. Services
Manage the platform's complete service catalog. Create, edit, duplicate, pause, or archive services. Control states (draft → review → published → paused → archived), categories, regional variants, and view request and revenue statistics per service.

### 3. Form Builder
Create and manage the dynamic forms that clients fill out when requesting a service. Supports 11 question types (single choice, multiple choice, short/long text, quantity, date, selector, phone, email, file, 1-10 scale), conditional rules, validations, and versioning. Analyze abandonment rates per step to optimize conversion.

### 4. Requests
Manage all service requests received from clients. View form responses, edit data, redistribute, pause, reopen, or cancel requests. Each request includes a change history, assigned professional, and linked conversations. Includes search filters by ID, client, city, and status.

### 5. Matching & Distribution
Define the rules that determine which professionals receive each client request. Configure criteria such as service, zone, availability, capacity, and profile quality. Use the simulator to verify how rules behave with test data, showing who gets included or excluded and the reason.

### 6. Professionals
Manage the complete lifecycle of professionals: from registration and approval to suspension. Review documentation, verify profiles, manage balances, work history, and sanctions. The approval queue shows pending registrations with approve/reject actions.

### 7. Quotes
Supervise all quotes sent by professionals to clients. Follow the lifecycle: draft → pending → sent → viewed → contact → selected/rejected/expired. View lead costs per quote and interaction history.

### 8. Clients
View and manage client accounts on the platform. View request history, communications, quotes received, selected professionals, and reviews. Block problematic accounts or export data for external analysis.

### 9. Conversations
Monitor all conversations between clients and professionals via chat, WhatsApp, and email. Flag spam, hide inappropriate content, and add internal notes for follow-up. Each conversation is linked to a specific request.

### 10. Jobs & Agreements
Supervise work agreements between clients and selected professionals. Follow the cycle: selected → started → in progress → completed/cancelled/disputed. Control commissions, dates, and trigger satisfaction surveys upon completion.

### 11. Reviews & Reputation
Manage reviews published by clients about professionals. Approve, hide, or remove reviews according to content policies. Separate verified reviews (associated with completed work) from reviews without a formal agreement. Detect manipulation attempts.

### 12. Billing & Balance
Manage the platform's financial ledger: lead costs, commissions per agreement, balance top-ups, refunds, and adjustments. Configure global fees and export movements for accounting. The ledger is immutable — adjustments are made with compensating entries.

### 13. Marketing & Content
Manage the platform's marketing content: landing pages, promotional campaigns, and SEO optimization. Edit texts, configure discounts, and monitor page performance with SEO quality scores.

### 14. Notifications
Configure multi-channel notification templates (email, SMS, WhatsApp, push) that are sent automatically for events like new request, quote received, low balance, or expiring documentation. Control activation, test sending, and deliverability rates.

### 15. Support
Centralize support tickets from clients and professionals. Assign agents, manage priorities, SLA, states, and escalations. Each ticket is linked to accounts, requests, quotes, agreements, and conversations for complete context.

### 16. Analytics
Visualize client (12 steps) and professional (10 steps) conversion funnels. Analyze reports on conversion by service, abandonment by step, response times, and performance by zone. Export data in CSV for external analysis.

### 17. Settings
Manage administrator users, roles with module-level permissions, security policies (MFA, sessions, passwords, IP control), and external integrations (database, email, payments, messaging). Every action generates an audit log.

---

## Italiano

### 1. Riepilogo Esecutivo
Pannello di controllo principale che mostra i KPI più importanti del marketplace: richieste, preventivi, ricavi, professionisti attivi e avvisi operativi che richiedono un intervento immediato. Include filtri per data, paese, città, categoria, servizio, dispositivo e canale di acquisizione.

### 2. Servizi
Gestisci il catalogo completo dei servizi della piattaforma. Crea, modifica, duplica, metti in pausa o archivia i servizi. Controlla gli stati (bozza → revisione → pubblicato → pausa → archiviato), le categorie, le varianti regionali e visualizza le statistiche di richiesta e ricavi per servizio.

### 3. Costruttore Moduli
Crea e gestisci i moduli dinamici che i clienti compilano quando richiedono un servizio. Supporta 11 tipi di domanda (scelta singola, scelta multipla, testo breve/lungo, quantità, data, selezionatore, telefono, email, file, scala 1-10), regole condizionali, validazioni e versioning. Analizza i tassi di abbandono per passo per ottimizzare la conversione.

### 4. Richieste
Gestisci tutte le richieste di servizio ricevute dai clienti. Visualizza le risposte del modulo, modifica i dati, ridistribuisci, metti in pausa, riapri o annulla le richieste. Ogni richiesta include la cronologia delle modifiche, il professionista assegnato e le conversazioni collegate. Include filtri di ricerca per ID, cliente, città e stato.

### 5. Matching e Distribuzione
Definisci le regole che determinano quali professionisti ricevono ogni richiesta del cliente. Configura criteri come servizio, zona, disponibilità, capacità e qualità del profilo. Usa il simulatore per verificare come si comportano le regole con dati di test, mostrando chi viene incluso o escluso e il motivo.

### 6. Professionisti
Gestisci il ciclo di vita completo dei professionisti: dalla registrazione e approvazione alla sospensione. Revisiona la documentazione, verifica i profili, gestisci i saldi, la cronologia dei lavori e le sanzioni. La coda di approvazione mostra le registrazioni in attesa con azioni di approva/rifiuta.

### 7. Preventivi
Supervisiona tutti i preventivi inviati dai professionisti ai clienti. Segui il ciclo di vita: bozza → in attesa → inviato → visto → contatto → selezionato/rifiutato/scaduto. Visualizza i costi per lead per ogni preventivo e la cronologia delle interazioni.

### 8. Clienti
Consulta e gestisci gli account dei clienti della piattaforma. Visualizza la cronologia delle richieste, le comunicazioni, i preventivi ricevuti, i professionisti selezionati e le recensioni. Blocca account problematici o esporta i dati per analisi esterne.

### 9. Conversazioni
Monitora tutte le conversazioni tra clienti e professionisti tramite chat, WhatsApp ed email. Segna lo spam, nascondi contenuti inappropriati e aggiungi note interne per il follow-up. Ogni conversazione è collegata a una richiesta specifica.

### 10. Lavori e Accordi
Supervisiona gli accordi di lavoro tra clienti e professionisti selezionati. Segui il ciclo: selezionato → avviato → in corso → completato/cancellato/disputato. Controlla le commissioni, le date e attiva i sondaggi di soddisfazione al completamento.

### 11. Recensioni e Reputazione
Gestisci le recensioni pubblicate dai clienti sui professionisti. Approva, nascondi o rimuovi le recensioni secondo le politiche di contenuto. Separa le recensioni verificate (associate a lavoro completato) da quelle senza accordo formale. Rileva tentativi di manipolazione.

### 12. Fatturazione e Saldo
Gestisci il libro mastro finanziario della piattaforma: costi dei lead, commissioni per accordo, ricariche di saldo, rimborsi e aggiustamenti. Configura le tariffe globali e esporta i movimenti per la contabilità. Il libro mastro è immutabile — gli aggiustamenti si effettuano con voci compensative.

### 13. Marketing e Contenuti
Gestisci il contenuto di marketing della piattaforma: pagine di atterraggio, campagne promozionali e ottimizzazione SEO. Modifica i testi, configura gli sconti e monitora le prestazioni delle pagine con punteggi di qualità SEO.

### 14. Notifiche
Configura i modelli di notifica multi-canale (email, SMS, WhatsApp, push) che vengono inviati automaticamente per eventi come nuova richiesta, preventivo ricevuto, saldo basso o documentazione in scadenza. Controlla l'attivazione, l'invio di prova e i tassi di consegna.

### 15. Supporto
Centralizza i ticket di supporto di clienti e professionisti. Assegna gli agenti, gestisci priorità, SLA, stati e escalation. Ogni ticket è collegato a account, richieste, preventivi, accordi e conversazioni per un contesto completo.

### 16. Analisi
Visualizza i funnel di conversione dei clienti (12 passi) e dei professionisti (10 passi). Analizza i report di conversione per servizio, abbandono per passo, tempi di risposta e prestazioni per zona. Esporta i dati in CSV per analisi esterne.

### 17. Configurazione
Gestisci gli utenti amministratori, i ruoli con permisi a livello di modulo, le politiche di sicurezza (MFA, sessioni, password, controllo IP) e le integrazioni esterne (database, email, pagamenti, messaggistica). Ogni azione genera un registro di audit.
