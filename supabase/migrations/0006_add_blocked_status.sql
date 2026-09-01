-- 0006_add_blocked_status.sql
-- Agrega el estado 'blocked' ("Bloqueado") al enum prof_admin_status.
-- Un profesional bloqueado pierde el acceso a su cuenta (no puede iniciar
-- sesión ni usar el dashboard).
--
-- NOTA: ejecutar UNA sola vez. Si se intenta de nuevo, PostgreSQL lanzará
-- "duplicate key value violates unique constraint pg_enum_typname_label_index".
-- No se puede envolver en DO $$ porque ALTER TYPE ... ADD VALUE no puede
-- ejecutarse desde una función.

ALTER TYPE prof_admin_status ADD VALUE 'blocked';
