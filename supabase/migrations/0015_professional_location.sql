-- 0015_professional_location.sql
-- Ubicación del profesional: agrega las columnas de país, estado/región,
-- ciudad y código postal a la tabla professionals y añade las preguntas base de
-- ubicación a los formularios profesionales existentes que aún no las tengan.
-- Idempotente: se puede ejecutar varias veces sin error.

ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS municipality TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Preguntas base de ubicación para los formularios profesionales existentes que
-- no las tengan aún. Las nuevas preguntas se añaden al final del formulario.
DO $$
DECLARE
  r RECORD;
  keys TEXT[] := ARRAY['country', 'region', 'city', 'postal_code'];
  labels TEXT[] := ARRAY['¿En qué país te encuentras?', '¿Cuál es tu estado o región?', '¿Cuál es tu ciudad o municipio/municipalidad?', '¿Cuál es tu código postal?'];
  types TEXT[] := ARRAY['text', 'text', 'text', 'text'];
  reqs BOOLEAN[] := ARRAY[true, true, true, false];
  i INT;
  next_sort INT;
BEGIN
  FOR r IN SELECT id FROM forms WHERE form_type = 'professional' LOOP
    FOR i IN 1..array_length(keys, 1) LOOP
      IF NOT EXISTS (
        SELECT 1 FROM form_questions
        WHERE form_id = r.id AND field_key = keys[i]
      ) THEN
        SELECT COALESCE(MAX(sort_order), -1) + 1 INTO next_sort
        FROM form_questions WHERE form_id = r.id;
        INSERT INTO form_questions
          (form_id, sort_order, label, type, required, options, field_key)
        VALUES
          (r.id, next_sort, labels[i], types[i]::form_question_type, reqs[i], '[]'::jsonb, keys[i]);
      END IF;
    END LOOP;
  END LOOP;
END $$;