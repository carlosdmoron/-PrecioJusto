-- 0005_add_coming_soon_status.sql
-- Agrega el estado 'coming_soon' ("Próximamente") al enum service_status.
-- Los servicios con este estado se muestran en la sección
-- "Los 3 servicios que estamos buscando" de la landing, y se excluyen del resto.
--
-- NOTA: ejecutar UNA sola vez. Si se intenta de nuevo, PostgreSQL lanzará
-- "duplicate key value violates unique constraint pg_enum_typname_label_index".
-- No se puede envolver en DO $$ porque ALTER TYPE ... ADD VALUE no puede
-- ejecutarse desde una función.

ALTER TYPE service_status ADD VALUE 'coming_soon';
