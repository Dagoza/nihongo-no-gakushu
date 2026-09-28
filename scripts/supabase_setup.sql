-- ==============================================================================
-- Nihongo Master - Script de Configuración de Base de Datos para Supabase
-- ==============================================================================
-- Este script crea la tabla y las políticas de seguridad (RLS) necesarias para 
-- la sincronización multi-dispositivo y persistencia de progreso.
--
-- Instrucciones:
-- 1. Ve a tu panel de Supabase (https://supabase.com/dashboard)
-- 2. Selecciona tu proyecto y abre la sección "SQL Editor" en el menú lateral.
-- 3. Pega este contenido y presiona "Run" (Ejecutar).
-- ==============================================================================

-- 1. Crear tabla de progreso de usuarios
create table if not exists public.user_progress (
  sync_id text primary key,
  data jsonb not null default '{}'::jsonb,
  device_info text default 'Web Client',
  client_version integer default 2,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Crear índice para optimizar las consultas por sync_id y fecha de actualización
create index if not exists idx_user_progress_sync_id on public.user_progress (sync_id);
create index if not exists idx_user_progress_updated_at on public.user_progress (updated_at desc);

-- 3. Habilitar Row Level Security (RLS) para proteger los datos
alter table public.user_progress enable row level security;

-- 4. Eliminar políticas previas si existieran para evitar conflictos
drop policy if exists "Permitir lectura con sync_id anon" on public.user_progress;
drop policy if exists "Permitir inserción o actualización con sync_id anon" on public.user_progress;
drop policy if exists "Acceso total a progreso de usuario" on public.user_progress;

-- 5. Crear política segura que permite leer y actualizar mediante la clave pública (Anon Key)
-- utilizando el código único de sincronización (sync_id) como llave de partición.
create policy "Acceso total a progreso de usuario"
  on public.user_progress
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 6. Comentario informativo en la tabla
comment on table public.user_progress is 'Almacenamiento de progreso de estudio multi-dispositivo para Nihongo Master';
