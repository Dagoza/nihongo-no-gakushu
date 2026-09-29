import { NextResponse } from 'next/server';
import { AIFacade } from '../../../../lib/ai/AIFacade';

export async function POST(req) {
  try {
    const body = await req.json();
    const { vocabList, level, theme, provider } = body;

    if (!vocabList || !level || !theme) {
      return NextResponse.json({ error: "Faltan parámetros requeridos (vocabList, level, theme)" }, { status: 400 });
    }

    // Instanciar el facade con el proveedor deseado (por defecto 'groq')
    const aiFacade = new AIFacade(provider || 'groq');
    
    // Generar la historia
    const generatedStory = await aiFacade.generateStory(vocabList, level, theme);

    // TODO: En el futuro aquí podemos insertar en Supabase automáticamente antes de retornar

    return NextResponse.json({ story: generatedStory });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
