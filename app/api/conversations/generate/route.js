import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIFacade } from '../../../../lib/ai/AIFacade.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttlwngmidibgcuqsrvnb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let user = null;
    if (token) {
      const { data, error: authError } = await supabase.auth.getUser(token);
      if (!authError && data?.user) {
        user = data.user;
      }
    }

    // En producción se requiere autenticación para resguardar cuotas del servicio de IA
    if (process.env.NODE_ENV === 'production' && !user) {
      if (!token) {
        return NextResponse.json(
          { error: "Debes iniciar sesión con tu cuenta para interactuar con la IA de conversaciones." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Sesión no válida o expirada. Por favor, vuelve a iniciar sesión." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action = 'generate_dialogue', provider = 'groq' } = body;
    const aiFacade = new AIFacade(provider);

    if (action === 'roleplay_turn') {
      const { scenario, level = 'N5', characterName, userRole, history, userMessage } = body;
      if (!userMessage || !userMessage.trim()) {
        return NextResponse.json({ error: "El mensaje del usuario no puede estar vacío." }, { status: 400 });
      }

      const turnResult = await aiFacade.roleplayTurn({
        scenario: scenario || 'Conversación cotidiana en Japón',
        level,
        characterName: characterName || '店員',
        userRole: userRole || 'Estudiante',
        history: history || [],
        userMessage: userMessage.trim()
      });

      return NextResponse.json({ turn: turnResult });
    }

    // Default action: 'generate_dialogue'
    const { 
      items = [], 
      level = 'N5', 
      theme = 'Vida cotidiana en Japón', 
      category = 'General',
      count = 8,
      characters = ['Persona A', 'Persona B']
    } = body;

    const conversationResult = await aiFacade.generateConversation({
      items,
      level,
      theme,
      category,
      count: Number(count) || 8,
      characters
    });

    return NextResponse.json({ conversation: conversationResult });

  } catch (error) {
    console.error("Conversation AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
