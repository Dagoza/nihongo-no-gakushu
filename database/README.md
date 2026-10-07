# 🗄️ Base de Datos y Supabase — Nihongo Master

Esta carpeta contiene los esquemas DDL y scripts SQL para la configuración y persistencia de Nihongo Master en **Supabase**.

## 📄 Archivos

1. **`supabase_schema.sql`**:
   - Tablas maestras de vocabulario (`public.vocabulary`), ideogramas (`public.kanji`) e historias generadas (`public.generated_stories`).
   - Restricciones de unicidad para upserts.
   - Políticas RLS para lectura pública de contenido y acceso privado a historias de usuario.

2. **`supabase_setup.sql`**:
   - Tabla de sincronización de progreso (`public.user_progress`) con soporte para sincronización local o vinculada a Supabase Auth.
   - Índices optimizados sobre `user_id` y marcas de tiempo `updated_at`.
   - Políticas estrictas de Row Level Security (RLS) para proteger los datos de usuario (`auth.uid() = user_id`).

## 🚀 Instrucciones de Aplicación

1. Accede al [Panel de Supabase](https://supabase.com/dashboard).
2. Ve a la sección **SQL Editor**.
3. Pega y ejecuta el contenido de `supabase_schema.sql` y `supabase_setup.sql`.
