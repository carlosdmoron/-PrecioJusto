-- 0012_professional_forms.sql
-- Formularios profesionales: el constructor de formularios existente pasa a
-- soportar dos tipos (customer | professional) con la misma estructura de
-- preguntas. Las respuestas de profesionales se guardan en form_responses
-- enlazadas al profesional (professional_id) en lugar de a una solicitud
-- (request_id). request_id es nullable de origen (migración 0002), por lo que
-- la misma tabla sirve de forma polimórfica: cliente -> request_id,
-- profesional -> professional_id.
-- Es idempotente: se puede ejecutar varias veces sin error.

-- 1. Tipo de formulario ------------------------------------------------------
ALTER TABLE forms
  ADD COLUMN IF NOT EXISTS form_type TEXT NOT NULL DEFAULT 'customer';

CREATE INDEX IF NOT EXISTS idx_forms_service_type ON forms(service_id, form_type);

-- 2. Respuestas de profesionales ---------------------------------------------
ALTER TABLE form_responses
  ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_form_responses_professional_id ON form_responses(professional_id);

-- 3. Row Level Security: un profesional lee/escribe sus propias respuestas ----
DROP POLICY IF EXISTS "Users can view own responses" ON form_responses;
CREATE POLICY "Users can view own responses" ON form_responses FOR SELECT USING (
  (EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid()))
  OR professional_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can create responses" ON form_responses;
CREATE POLICY "Users can create responses" ON form_responses FOR INSERT WITH CHECK (
  (EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid()))
  OR professional_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update own responses" ON form_responses;
CREATE POLICY "Users can update own responses" ON form_responses FOR UPDATE USING (
  professional_id = auth.uid()
) WITH CHECK (professional_id = auth.uid());

-- Los policies existentes de admin ("Admins can manage all responses") se
-- conservan: cubren el acceso total del dashboard.