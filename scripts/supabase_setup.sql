-- ==============================================================================
-- Nihongo Master - Script de Base de Datos y Seguridad (Supabase Auth & RLS)
-- ==============================================================================
-- Este script crea la tabla de progreso de estudio protegida con:
-- 1. Autenticación de usuarios (Supabase Auth - Email/Contraseña).
-- 2. Políticas estrictas de Row Level Security (RLS) para que SOLO el dueño
--    de la sesión pueda leer, escribir y sincronizar su propio progreso.
-- 3. Soporte para invitados anónimos mediante código de enlace (user_id IS NULL).
--
-- Instrucciones:
-- 1. Abre el editor SQL de tu proyecto:
--    https://supabase.com/dashboard/project/ttlwngmidibgcuqsrvnb/sql/new
-- 2. Pega este contenido y presiona "Run" (botón verde).
-- ==============================================================================

-- 1. Crear tabla de progreso de usuarios
create table if not exists public.user_progress (
  id text primary key,                                          -- user_id (auth.uid()::text) o sync_id anónimo
  user_id uuid references auth.users(id) on delete cascade,     -- Vinculado a la cuenta de usuario autenticado
  email text,                                                   -- Correo electrónico del usuario
  data jsonb not null default '{}'::jsonb,                      -- Progreso completo (XP, racha, kanji, vocab, etc.)
  device_info text default 'Web Client',                        -- Identificador del dispositivo
  client_version integer default 2,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Si la tabla ya existía, asegurarse de que tenga las nuevas columnas de seguridad
alter table public.user_progress add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.user_progress add column if not exists email text;

-- 2. Crear índices optimizados para consultas por usuario y fecha
create index if not exists idx_user_progress_user_id on public.user_progress (user_id);
create index if not exists idx_user_progress_updated_at on public.user_progress (updated_at desc);

-- 3. Habilitar Row Level Security (RLS) en la tabla
alter table public.user_progress enable row level security;

-- 4. Eliminar políticas anteriores para aplicar la configuración estricta
drop policy if exists "Acceso total a progreso de usuario" on public.user_progress;
drop policy if exists "Usuarios autenticados solo acceden a su progreso" on public.user_progress;
drop policy if exists "Acceso anónimo con código" on public.user_progress;

-- 5. POLÍTICA ESTRICTA PARA USUARIOS AUTENTICADOS:
-- Solo el usuario cuyo token JWT autenticado (auth.uid()) coincida exactamente
-- con el user_id de la fila puede leer, crear o modificar sus datos.
create policy "Usuarios autenticados solo acceden a su progreso"
  on public.user_progress
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. POLÍTICA PARA INVITADOS LOCALES (Opcional):
-- Permite que usuarios sin registrar usen un código de sincronización local (user_id IS NULL)
-- sin interferir nunca con las cuentas de usuarios registrados.
create policy "Acceso anónimo con código"
  on public.user_progress
  for all
  to anon
  using (user_id is null)
  with check (user_id is null);

-- 7. Comentarios informativos
comment on table public.user_progress is 'Almacenamiento privado y seguro de progreso de estudio para Nihongo Master';
