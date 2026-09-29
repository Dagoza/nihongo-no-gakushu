import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIFacade } from '../../../../lib/ai/AIFacade';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttlwngmidibgcuqsrvnb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json(
        { error: "Debes iniciar sesión con tu cuenta para generar contenido con Inteligencia Artificial." },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión no válida o expirada. Por favor, vuelve a iniciar sesión con tu cuenta." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      type = 'story', 
      vocabList, 
      items = vocabList, 
      itemType = 'vocab', 
      level = 'N5', 
      theme = 'Vida cotidiana', 
      length = 'medium',
      count = 5,
      provider = 'groq' 
    } = body;

    const actualItems = Array.isArray(items) ? items : (Array.isArray(vocabList) ? vocabList : []);
    if (!actualItems || actualItems.length === 0) {
      return NextResponse.json(
        { error: `Debes seleccionar al menos un elemento (${itemType === 'kanji' ? 'kanji' : 'palabra'}) para la generación.` },
        { status: 400 }
      );
    }

    const aiFacade = new AIFacade(provider || 'groq');

    if (type === 'sentences') {
      const generatedData = await aiFacade.generateSentences({
        items: actualItems,
        itemType,
        level,
        theme,
        count: Number(count) || 5
      });
      return NextResponse.json({ 
        type: 'sentences',
        sentences: generatedData.sentences || [],
        meta: generatedData 
      });
    } else {
      // type === 'story'
      const generatedStory = await aiFacade.generateStory({
        items: actualItems,
        itemType,
        level,
        theme,
        length
      });
      return NextResponse.json({ 
        type: 'story',
        story: generatedStory 
      });
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
