-- 0004_add_service_image_url.sql
-- Añade la URL de imagen para cada servicio, usada por la landing dinámica.
-- Es idempotente: se puede ejecutar varias veces sin error.

ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Asignar una imagen inicial a los servicios existentes que aún no tienen una.
-- Es un seeding de datos (el administrador puede cambiarla después desde el dashboard),
-- no lógica de la aplicación. Solo aplica si el servicio existe y no tiene imagen.
DO $$
DECLARE
  svc RECORD;
  imgs TEXT[] := ARRAY[
    '/images/prof-electricista.jfif',
    '/images/prof-carpintero.jfif',
    '/images/prof-fontanero.jfif',
    '/images/prof-service-1.jpg',
    '/images/prof-service-2.jpg',
    '/images/prof-service-3.jpg',
    '/images/prof-service-4.jpg',
    '/images/prof-service-5.jpg',
    '/images/prof-service-6.jpg'
  ];
  i INTEGER := 1;
BEGIN
  FOR svc IN
    SELECT id FROM services
    WHERE image_url IS NULL OR image_url = ''
    ORDER BY created_at
  LOOP
    UPDATE services
    SET image_url = imgs[((i - 1) % array_length(imgs, 1)) + 1]
    WHERE id = svc.id;
    i := i + 1;
  END LOOP;
END
$$;
