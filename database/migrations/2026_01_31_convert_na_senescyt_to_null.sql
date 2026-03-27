-- Migration: convert 'N/A' or 'NA' (case-insensitive) stored in bienes.codigo_senescyt to NULL
-- This allows multiple bienes to indicate "no aplica" without violating uniqueness checks.

UPDATE bienes
SET codigo_senescyt = NULL
WHERE codigo_senescyt IS NOT NULL
  AND LOWER(TRIM(codigo_senescyt)) IN ('n/a', 'na');

-- Optional: review rows converted
SELECT id_bien, codigo_institucional, codigo_senescyt
FROM bienes
WHERE codigo_senescyt IS NULL
ORDER BY id_bien
LIMIT 50;