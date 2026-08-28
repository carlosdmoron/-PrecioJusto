-- 0002_formularios.sql
-- Migración enfocada en el módulo de Formularios Dinámicos (constructor de formularios).
-- Requiere que ya existan en la BD: services, requests e is_admin() (definidos en la migración base).
-- Es idempotente: se puede ejecutar varias veces sin error.

-- 1. ENUM de tipos de pregunta -------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'form_question_type') THEN
    CREATE TYPE form_question_type AS ENUM (
      'radio', 'checkbox', 'text', 'textarea', 'number', 'date',
      'select', 'phone', 'email', 'file', 'scale'
    );
  END IF;
END
$$;

-- 2. Tablas --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  version TEXT DEFAULT 'v1.0',
  question_count INTEGER DEFAULT 0,
  abandonment_rate DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  label TEXT NOT NULL,
  type form_question_type DEFAULT 'text',
  required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  condition JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}'::jsonb,
  step_completed INTEGER DEFAULT 0,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Row Level Security --------------------------------------------------------
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active forms" ON forms;
CREATE POLICY "Anyone can view active forms" ON forms FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage all forms" ON forms;
CREATE POLICY "Admins can manage all forms" ON forms FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view questions for active forms" ON form_questions;
CREATE POLICY "Anyone can view questions for active forms" ON form_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM forms WHERE id = form_id AND status = 'active')
);

DROP POLICY IF EXISTS "Admins can manage all form questions" ON form_questions;
CREATE POLICY "Admins can manage all form questions" ON form_questions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own responses" ON form_responses;
CREATE POLICY "Users can view own responses" ON form_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create responses" ON form_responses;
CREATE POLICY "Users can create responses" ON form_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all responses" ON form_responses;
CREATE POLICY "Admins can manage all responses" ON form_responses FOR ALL USING (public.is_admin());

-- 4. Índices -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_form_questions_form_id ON form_questions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
