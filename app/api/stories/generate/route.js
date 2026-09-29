import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIFacade } from '../../../../lib/ai/AIFacade';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttlwngmidibgcuqsrvnb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    // 1. Verificar autenticación: solo usuarios con sesión activa pueden generar historias con IA
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json(
        { error: "Debes iniciar sesión con tu cuenta para generar historias con Inteligencia Artificial." },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión no válida o expirada. Por favor, vuelve a iniciar sesión." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { vocabList, level, theme, provider } = body;

    if (!vocabList || !level || !theme) {
      return NextResponse.json({ error: "Faltan parámetros requeridos (vocabList, level, theme)" }, { status: 400 });
    }

    // Instanciar el facade con el proveedor deseado (por defecto 'groq')
    const aiFacade = new AIFacade(provider || 'groq');
    
    // Generar la historia
    const generatedStory = await aiFacade.generateStory(vocabList, level, theme);

    return NextResponse.json({ story: generatedStory });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
