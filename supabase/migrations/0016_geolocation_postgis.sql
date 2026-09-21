-- 0016_geolocation_postgis.sql
-- Georreferenciación del marketplace: habilita PostGIS y agrega coordenadas,
-- place_id y radio de servicio a profesionales y solicitudes. El matching por
-- distancia se resuelve con consultas geográficas en PostgreSQL (nunca en JS).
-- Idempotente: se puede ejecutar varias veces sin error.

-- 1. POSTGIS ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. PROFESSIONALS -----------------------------------------------------------
-- La dirección exacta (address + lat/lng + place_id) es PRIVADA. La RLS limita
-- su lectura a su propio profesional y a admins; el resto de la app solo recibe
-- city/department/service_radius.
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS place_id TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 20;

-- Columna generada de geografía (4326) para consultas PostGIS (ST_DWithin).
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326)
  GENERATED ALWAYS AS (
    CASE
      WHEN latitude IS NOT NULL AND longitude IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      ELSE NULL
    END
  ) STORED;

-- Ambos campos geográficos van juntos (o ninguno).
ALTER TABLE professionals DROP CONSTRAINT IF EXISTS professionals_coords_check;
ALTER TABLE professionals ADD CONSTRAINT professionals_coords_check CHECK (
  (latitude IS NULL AND longitude IS NULL)
  OR (latitude IS NOT NULL AND longitude IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_professionals_location
  ON professionals USING GIST (location);

-- 3. REQUESTS -----------------------------------------------------------------
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS place_id TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- La columna legacy `location` (TEXT) ya existe en la BD en vivo con datos. Se
-- conserva renombrándola a location_label (la app usa `city`), y el nombre
-- `location` queda para la geografía de matching.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'requests'
      AND column_name = 'location' AND data_type = 'text'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'requests'
      AND column_name = 'location_label'
  ) THEN
    ALTER TABLE requests RENAME COLUMN location TO location_label;
  END IF;
END
$$;

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326)
  GENERATED ALWAYS AS (
    CASE
      WHEN latitude IS NOT NULL AND longitude IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      ELSE NULL
    END
  ) STORED;

ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_coords_check;
ALTER TABLE requests ADD CONSTRAINT requests_coords_check CHECK (
  (latitude IS NULL AND longitude IS NULL)
  OR (latitude IS NOT NULL AND longitude IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_requests_location
  ON requests USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_requests_status_created
  ON requests (status, created_at DESC);

-- 4. ESTADO 'expired' EN SOLICITUDES ------------------------------------------
-- PostgreSQL no permite ALTER TYPE ... ADD VALUE dentro de un bloque DO ni de
-- una transacción; se usa ADD VALUE IF NOT EXISTS fuera de transacción.
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'expired';