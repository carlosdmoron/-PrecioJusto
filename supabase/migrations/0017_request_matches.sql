-- 0017_request_matches.sql
-- Evoluciona match_assignments (creada en 0007) hasta cubrir el modelo de
-- request_matches: distancia, estado del ciclo de oportunidad, timestamps de
-- notificación/visualización/respuesta, unicidad por (request, professional),
-- RLS para que el profesional lea SUS oportunidades y expiración relacionada.
-- No se crea una tabla duplicada: la tabla existente ES request_matches.
-- Idempotente: se puede ejecutar varias veces sin error.

-- 1. Columnas nuevas ---------------------------------------------------------
ALTER TABLE match_assignments
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS match_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- El estado por defecto pasa a 'matched' (las filas antiguas 'assigned' se leen
-- como oportunidad nueva en la app).
ALTER TABLE match_assignments ALTER COLUMN status SET DEFAULT 'matched';
ALTER TABLE match_assignments ALTER COLUMN score DROP NOT NULL;

-- Copia de prueba defensiva: si la columna score ya no se usa se mantiene para
-- no romper consultas existentes; match_score es la fuente de consumo real.

-- 2. Unicidad: el mismo profesional nunca recibe dos veces la misma solicitud.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.match_assignments'::regclass
      AND conname = 'match_assignments_request_professional_key'
  ) THEN
    ALTER TABLE match_assignments
      ADD CONSTRAINT match_assignments_request_professional_key
      UNIQUE (request_id, professional_id);
  END IF;
END
$$;

-- 3. Índices ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_match_assignments_status
  ON match_assignments (professional_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_assignments_updated
  ON match_assignments (request_id, updated_at DESC);

-- 4. RLS: el profesional lee SUS oportunidades; nadie más (los matches no son
-- públicos). El cliente no necesita ver matches (ve propuestas).
DROP POLICY IF EXISTS "Professionals can view own matches" ON match_assignments;
CREATE POLICY "Professionals can view own matches"
  ON match_assignments FOR SELECT
  USING (professional_id = auth.uid());

-- updated_at automático -----------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_assignments_updated ON match_assignments;
CREATE TRIGGER trg_match_assignments_updated
  BEFORE UPDATE ON match_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Expiración: solicitudes que pasaron su expires_at (o muy antiguas) se
-- marcan 'expired' junto con sus matches. La app define el tiempo en
-- platform_config (request_expiration_hours); este job se invoca desde un Edge
-- Function/cron o desde el propio flujo de matching de forma defensiva.
CREATE OR REPLACE FUNCTION public.expire_stale_requests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n INTEGER := 0;
  exp_hours INTEGER := COALESCE(
    (SELECT value::int FROM platform_config WHERE key = 'request_expiration_hours'),
    48
  );
  now_ts TIMESTAMPTZ := now();
  deadline TIMESTAMPTZ := now_ts - make_interval(hours => exp_hours);
BEGIN
  -- Solo se comparan valores del enum request_status que existen en la BD en
  -- vivo (new, published, inProgress, completed, cancelled, blocked, draft),
  -- para no lanzar error en el cast con valores inexistentes.
  UPDATE requests
  SET status = 'expired', updated_at = now_ts
  WHERE status IN ('new', 'published', 'draft')
    AND (
      (expires_at IS NOT NULL AND expires_at < now_ts)
      OR (expires_at IS NULL AND created_at < deadline)
    );

  GET DIAGNOSTICS n = ROW_COUNT;

  UPDATE match_assignments
  SET status = 'expired', updated_at = now_ts
  WHERE status IN ('matched', 'notified', 'viewed')
    AND EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = match_assignments.request_id AND r.status = 'expired'
    );

  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_stale_requests() TO service_role;