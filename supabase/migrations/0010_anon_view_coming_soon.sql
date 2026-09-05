-- 0010_anon_view_coming_soon.sql
-- Permite a usuarios anónimos consultar servicios en estado 'coming_soon'
-- ("Próximamente") para mostrarlos en la sección de la landing:
-- "Solicita gratuitamente el presupuesto más adecuado para ti...".
-- Sin este policy, la RLS (solo status = 'published') oculta esos servicios
-- y la sección no renderiza ninguna card.
-- Es idempotente: se puede ejecutar varias veces sin error.

DROP POLICY IF EXISTS "Anyone can view coming soon services" ON services;

CREATE POLICY "Anyone can view coming soon services"
ON services
FOR SELECT
USING (status = 'coming_soon');