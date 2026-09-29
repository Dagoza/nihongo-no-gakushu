-- Schema para la base de datos de Nihongo Master

-- 1. Tabla de Vocabulario (JLPT)
CREATE TABLE IF NOT EXISTS public.vocabulary (
    id text PRIMARY KEY,
    kanji text NOT NULL,
    kana text NOT NULL,
    meaning_es text,
    meaning_en text,
    level text,
    category text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar que el kanji sea único para poder hacer upsert
ALTER TABLE public.vocabulary ADD CONSTRAINT vocabulary_kanji_key UNIQUE (kanji);

-- 2. Tabla de Kanjis
CREATE TABLE IF NOT EXISTS public.kanji (
    kanji text PRIMARY KEY,
    strokes integer DEFAULT 0,
    meaning_es text,
    meaning_en text,
    onyomi text,
    kunyomi text,
    level text,
    category text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Historias Generadas
CREATE TABLE IF NOT EXISTS public.generated_stories (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- opcional si hay auth
    title text NOT NULL,
    title_en text,
    level text,
    description text,
    content jsonb NOT NULL, -- Aquí se guardará todo el objeto (paragraphs, sentences)
    words_used text[], -- Array de palabras objetivo usadas
    is_public boolean DEFAULT false, -- Para compartirlas con otros
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) para historias
ALTER TABLE public.generated_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historias públicas son visibles para todos"
    ON public.generated_stories FOR SELECT
    USING (is_public = true);

CREATE POLICY "Usuarios pueden ver y manejar sus propias historias"
    ON public.generated_stories FOR ALL
    USING (auth.uid() = user_id);
