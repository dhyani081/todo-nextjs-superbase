import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authError) {
      console.error('Auth delete error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      );
    }

    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    await supabaseAdmin.from('todos').delete().eq('user_id', userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete user API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
