-- =============================================
-- UBICATE - Configuración de Supabase
-- =============================================
-- Copia y pega este SQL en el SQL Editor de Supabase
-- (Dashboard → SQL Editor → New Query → Pegar → Run)
-- =============================================

-- Tabla de pre-registros
CREATE TABLE registros (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL CHECK (tipo IN ('pasajero', 'conductor', 'ambos')),
    ciudad TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas por email
CREATE INDEX idx_registros_email ON registros (email);

-- Índice para filtrar por tipo
CREATE INDEX idx_registros_tipo ON registros (tipo);

-- Habilitar Row Level Security (RLS)
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Política: permitir INSERT desde la app (clave anon)
CREATE POLICY "Permitir insertar registros"
    ON registros
    FOR INSERT
    WITH CHECK (true);

-- Política: permitir SELECT desde la app (para verificar duplicados y stats)
CREATE POLICY "Permitir leer registros"
    ON registros
    FOR SELECT
    USING (true);
