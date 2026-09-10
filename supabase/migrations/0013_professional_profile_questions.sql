-- Permite marcar preguntas que alimentan la cuenta y el perfil del profesional:
-- el campo field_key indica qué dato del perfil llena la respuesta
-- (full_name, photo, email, phone, etc.).
ALTER TABLE form_questions
  ADD COLUMN IF NOT EXISTS field_key TEXT;

CREATE INDEX IF NOT EXISTS form_questions_field_key_idx
  ON form_questions (form_id, field_key);

-- Preguntas base para los formularios profesionales existentes que no las
-- tengan aún. Son las preguntas "de identidad" que crean la cuenta y llenan el
-- perfil del profesional; las nuevas preguntas se añaden al final.
DO $$
DECLARE
  r RECORD;
  keys TEXT[] := ARRAY['full_name', 'photo', 'email', 'phone'];
  labels TEXT[] := ARRAY['¿Cuál es tu nombre completo?', 'Adjunta una foto de perfil', '¿Cuál es tu correo electrónico?', '¿Cuál es tu teléfono móvil?'];
  types TEXT[] := ARRAY['textarea', 'file', 'text', 'text'];
  reqs BOOLEAN[] := ARRAY[true, false, true, true];
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