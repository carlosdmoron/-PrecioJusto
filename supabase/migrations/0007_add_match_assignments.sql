-- 0007_add_match_assignments.sql
-- Tabla de asignaciones de matching: registra qué profesionales reciben cada
-- solicitud al ejecutarse el motor de distribución.
-- Es idempotente: se puede ejecutar varias veces sin error.

CREATE TABLE IF NOT EXISTS match_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'assigned',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_assignments_request ON match_assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_match_assignments_professional ON match_assignments(professional_id);

ALTER TABLE match_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage match assignments" ON match_assignments;
CREATE POLICY "Admins can manage match assignments" ON match_assignments
  FOR ALL USING (public.is_admin());
