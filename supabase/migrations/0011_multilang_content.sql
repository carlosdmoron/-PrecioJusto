-- 0011_multilang_content.sql
-- Añade columnas de caché de traducción para contenido multilingüe automático.
-- El contenido base (español) vive en name/label/options; las columnas *_it/*_en
-- se rellenan automáticamente en demanda (traducción + caché).
-- Es idempotente.

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS name_it TEXT,
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_it TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE form_questions
  ADD COLUMN IF NOT EXISTS label_it TEXT,
  ADD COLUMN IF NOT EXISTS label_en TEXT,
  ADD COLUMN IF NOT EXISTS options_it JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS options_en JSONB DEFAULT '[]'::jsonb;

-- Los servicios publicados y sus preguntas son legibles por el público; las
-- columnas nuevas se devuelven igual en las mismas políticas SELECT existentes.
