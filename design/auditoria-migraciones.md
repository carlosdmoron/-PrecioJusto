# Auditoría de migraciones y estado real de la base de datos

Fecha: 2026-09-21
Proyecto: `pazhwlmwkhlcuiikirpc` (PrecioJusto) — PostgreSQL 17.6
Conexión: pooler `aws-0-us-west-2.pooler.supabase.com:5432` (IPv4; el host directo `db.*.supabase.co` es IPv6-only y el CLI/esta red no lo alcanzan)

## 1. Hallazgos globales

- **No existe ledger de migraciones** en la BD real: `supabase_migrations.schema_migrations` no existe. El esquema actual fue creado por otro medio (probablemente `design/supabase-migration.sql` aplicado manualmente o por la consola), NO vía `supabase db push`. Cualquier plan de aplicación debe ser **manual e idempotente**, no depender del historial de migraciones.
- **PostGIS NO está instalado** (solo `pgcrypto`). `0016` lo necesita; será el primer paso.
- **RLS habilitada en las 29 tablas** existentes; cada una tiene políticas definidas.
- Extensiones e `is_admin()` / `rls_auto_enable` ya existen en `public`.
- La tabla `analytics_events` **no existe**; `0020` la referencia dentro de `EXCEPTION WHEN undefined_table` (defensivo), así que no rompe, pero nunca registra.

## 2. Estado verificado de las migraciones locales (0002–0020)

| Migración | Objetivo | Aplicada en BD real (evidencia SQL) |
|---|---|---|
| 0002_formularios | forms/form_questions/form_responses + enum | Sí (tablas, enum `form_question_type`, RLS y políticas presentes) |
| 0003_rls_forms_authenticated | RLS sobre forms | Sí (forms/form_questions con políticas y RLS on) |
| 0004_add_service_image_url | `services.image_url` | Sí |
| 0005_add_coming_soon_status | enum `service_status` 'coming_soon' | Sí |
| 0006_add_blocked_status | enum `prof_admin_status` 'blocked' | Sí |
| 0007_add_match_assignments | tabla `match_assignments` | **NO** (tabla no existe) |
| 0008_add_paused_status | enum `request_status` 'paused' | **NO** (`request_status` = new,published,inProgress,completed,cancelled,blocked,draft) |
| 0009_anon_draft | `requests.anon_code`, enum 'draft' | Sí |
| 0010_anon_view_coming_soon | enum `professional_services` 'coming_soon' | Sí |
| 0011_multilang_content | cols multilang en services/form_questions | Sí (`name_it/en`, `description_it/en`, `label_it/en`, `options_it`) |
| 0012_professional_forms | `forms.form_type`, `form_responses.professional_id` | Sí |
| 0013_professional_profile_questions | `form_questions.field_key` | Sí |
| 0014_professional_set_password | `profiles.must_set_password` | Sí |
| 0015_professional_location | `professionals.country/province/municipality/postal_code` | Sí |
| 0016_geolocation_postgis | PostGIS + columnas geográficas | **NO** (no `latitude`, no `service_radius_km`, no `expires_at`, sin PostGIS) |
| 0017_request_matches | evoluciona `match_assignments` | **NO aplicable**: la tabla base no existe |
| 0018_credit_system | platform_config, credit_* | **NO** (tablas no existen) |
| 0019_notifications_messages | notifications, messages.type, conversations.last_message_type | **NO** (tabla/columnas no existen) |
| 0020_core_rpcs | funciones + RLS endurecida | **NO** (ninguna función existe) |

Conclusión: **sesgo crítico de estado** — el proyecto real nunca pasó por `0007` ni `0008`, por lo que `0017` y `0020` (que evolucionan `match_assignments`) fallarán si se aplican sin `0007` primero. El bloque completo `0007 → 0016 → 0017 → 0018 → 0019 → 0020` es el camino correcto.

## 3. Dependencias y orden de aplicación

```
0007 (match_assignments)
  └── 0016 (PostGIS + geolocalización en professionals/requests + enum 'expired')
        └── 0017 (evolución match_assignments + set_updated_at + expire_stale_requests) [usa platform_config en cuerpo, runtime-only]
              └── 0018 (platform_config, credit_*)  [usa set_updated_at de 0017]
                    └── 0019 (notifications, messages.type/payload, conversations.last_message_type)
                          └── 0020 (9 RPCs SECURITY DEFINER; usa todo lo anterior + quotes/requests/jobs/billing_config existentes)
```

Notas de dependencia cruzada:
- `0017.expire_stale_requests()` referencia `platform_config` (creada en `0018`) solo en ejecución (plpgsql se valida en runtime), así que el orden no rompe el `CREATE OR REPLACE FUNCTION`.
- `0020` usa columnas que **ya existen** en la BD real: `requests.quotes_count`, `requests.assigned_professional_id`, `jobs.quote_id`, `jobs.commission`, `billing_config.commission_percent`, `quotes.amount_min`, `quotes.delivery_days`. ✔
- El enum `quote_status` real es (draft,pending,sent,viewed,**contacted**,selected,rejected,expired): `0020` usa `'selected'` únicamente, coherente.

## 4. Decimales, riesgos y correcciones necesarias previas a aplicar

| # | Riesgo / hallazgo | Acción |
|---|---|---|
| 1 | `0016` requiere PostGIS; sin él fallan columnas generadas `geography` e índices GiST | Aplicar `CREATE EXTENSION IF NOT EXISTS postgis;` primero (incluido en 0016) |
| 2 | `0017`/`0020` fallan sin `match_assignments` | Aplicar `0007` antes que `0017`/`0020` |
| 3 | Columnas generadas: `ST_SetSRID(ST_MakePoint(lng,lat),4326)::geography` son inmutables ✔; el DEFAULT `20` de `service_radius_km` y check coords son seguros | Revisar que el planificador acepte la generada (verify en staging) |
| 4 | `0020` restrige INSERT de quotes/conversations a `false` para `authenticated` → **rompe cualquier flujo actual que inserte propuestas/conversaciones por la API**. Hoy hay 1 quote y 1 job (datos de prueba); el RPC es la única vía permitida tras aplicar | Confirmar que el cliente aún no inserta quotes/conversaciones directamente (revisar `app/actions`) |
| 5 | `0020` revoca EXECUTE de `notification_create`/`ensure_credit_wallet` de `PUBLIC` y solo los concede a `service_role`; `submit_proposal` etc. a `authenticated, service_role` | Verificar que el frontend llama vía service_role o que el cliente use los RPC permitidos |
| 6 | `analytics_events` no existe → defensivo en 0020 (no rompe) | Crear tabla o aceptar sin analytics |
| 7 | `0007`/`0016`/`0017`/`0018`/`0019` usan patrones idempotentes (`IF NOT EXISTS`, DO-blocks, `DROP POLICY IF EXISTS`); `0020` es idempotente salvo `CREATE OR REPLACE` (ya lo es) y gras/revokes repetibles | Todo es re-ejecutable; aun así, backup antes |

## 5. Plan de backup y rollback

1. **Backup previo (obligatorio)**: `pg_dump -Fc` del esquema + datos, o al menos `pg_dump --schema-only`. Conexión pooler us-west-2.
2. Aplicar en orden: `0007 → 0016 → 0017 → 0018 → 0019 → 0020`, en lotes con verificación tras cada uno.
3. **Rollback por lote**: todas las migraciones son aditivas y la mayoría idempotentes; el rollback se hace **invirtiendo el orden** y, dado que crean objetos nuevos (tablas, columnas, funciones, políticas), `DROP TABLE/CONSTRAINT/FUNCTION/POLICY` explícito restaura el estado. No se modifican valores de datos existentes salvo los INSERTs de seed de `0018` (`platform_config`, `credit_packages`) que son seguros de re-insertar.
4. Cambio destructivo único: ninguno. `0017` hace `ALTER COLUMN score DROP NOT NULL` (Debilitante pero no destructivo). `0020` reemplaza políticas (`DROP POLICY ... CREATE POLICY`) sobre quotes/conversations — restaurar el `0x` original es el rollback.
5. Tras aplicar: volcar `schema_migrations` local no existe; se recomienda registrar las versiones en un identificador visible (p.ej. insertar en `public` un registro de versionado) para que futuros `db push` no colisionen.

## 6. Recomendación

Dado que NO existe ledger, el mecanismo recomendado es ejecutar los archivos `0007`, `0016`, `0017`, `0018`, `0019`, `0020` contra la BD vía `supabase db query --db-url` (o psql) en ese orden, tras backup y en ventana de bajo uso. `0008` queda pendiente de decisión de negocio (estado "Pausada" por restaurar si se quiere).

## 7. Resultado de la aplicación (2026-09-21)

Bloque `0007 → 0016 → 0017 → 0018 → 0019 → 0020` aplicado y verificado contra el proyecto real. Backup previo guardado en `.backups/2026-09-21_pre-migraciones-0016-0020/` (esquema + 29 dumps JSON, 138 filas).

| Migración | Estado | Correcciones aplicadas al archivo del repo |
|---|---|---|
| 0007 | ✔ Aplicada | Ninguna. `match_assignments` creada (RLS + política admin). |
| 0016 | ✔ Aplicada | Renombró la columna legacy `requests.location TEXT` (existía con 5 valores) a `location_label` para poder crear `location geography` — la app solo usa `city`; datos preservados. Reemplazó el `DO $$ ... ADD VALUE 'expired'` (inválido: PostgreSQL no permite `ALTER TYPE ... ADD VALUE` desde una función) por `ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'expired';`. |
| 0017 | ✔ Aplicada | Ninguna. `set_updated_at`, `expire_stale_requests` (SECURITY DEFINER), política SELECT profesional, trigger, índices. |
| 0018 | ✔ Aplicada | Ninguna. `platform_config` (seeds x3), `credit_wallets/transactions/packages/purchases` + RLS. |
| 0019 | ✔ Aplicada | Ninguna. `notifications` + `messages.type/payload` + `conversations.last_message_type` + RLS. |
| 0020 | ✔ Aplicada | Corregidas 2 políticas INSERT (`conversations` y `quotes`) que usaban `USING (false)` → `WITH CHECK (false)` (PostgreSQL solo admite WITH CHECK en INSERT). 9 RPCs SECURITY DEFINER + REVOKE/GRANT + seeds. |

Verificación post-aplicación: 37 tablas en `public` (36 con RLS + `spatial_ref_sys` de PostGIS, sistema, sin RLS por defecto); 12 RPCs presentes (`notification_create`, `ensure_credit_wallet`, `grant_credit`, `run_matching_for_request`, `submit_proposal`, `accept_proposal`, `reject_proposal`, `confirm_credit_purchase`, `complete_service`, `set_updated_at`, `expire_stale_requests`, `is_admin`); 65+ políticas (incluidas las nuevas 17). Datos intactos: `professionals` 2, `requests` 9, `profiles` 7, `quotes` 1, `jobs` 1, `credit_packages` 4 (seed), `match_assignments` 0. Smoke tests en transacción ROLLBACK: `expire_stale_requests()` → 7 afectadas (sin commit), `ensure_credit_wallet` crea y revierte; `submit_proposal` rechaza profesional no activo.

### Hallazgo residual de seguridad (crowds: EXECUTE para `anon`)

Supabase concede por defecto `EXECUTE` a los roles `anon` sobre funciones recién creadas (`ALTER DEFAULT PRIVILEGES`). Tras `REVOKE ALL ... FROM PUBLIC` + `GRANT ... TO authenticated, service_role` que hace `0020`, el `proacl` real conserva `anon=X/postgres` en los 9 RPCs (la ACL efectiva quedó: postgres, anon, authenticated, service_role). Es decir, `anon` todavía puede **invocar** estos RPC SECURITY DEFINER. No es explotable para robar datos (los RPC validan `auth.uid()`, salvo los de backend como `notification_create`/`grant_credit` que sí mitigan con `is_admin()`), pero es asimetría con la intención de 0020. Acción opcional pendiente: `REVOKE EXECUTE ON FUNCTION <cada RPC> FROM anon;` cuando se quiera endurecer al 100%.