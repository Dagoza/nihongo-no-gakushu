import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttlwngmidibgcuqsrvnb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Acceso restringido. Inicia sesión para consultar la base de datos.' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesión no válida o expirada.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'all';
    const limit = parseInt(searchParams.get('limit') || '2500', 10);

    let query = supabase.from('kanji').select('*');
    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    query = query.order('strokes', { ascending: true }).limit(limit);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'private, no-cache'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
