-- 0008_add_paused_status.sql
-- Agrega el estado 'paused' ("Pausada") al enum request_status.
-- Una solicitud pausada deja de aceptar nuevos presupuestos de profesionales
-- hasta que el administrador (o el propio cliente) la reanude.
--
-- NOTA: ejecutar UNA sola vez. Si se intenta de nuevo, PostgreSQL lanzará
-- "duplicate key value violates unique constraint pg_enum_typname_label_index".
-- No se puede envolver en DO $$ porque ALTER TYPE ... ADD VALUE no puede
-- ejecutarse desde una función.

ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'paused';
