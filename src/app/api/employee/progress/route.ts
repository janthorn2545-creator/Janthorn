import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, watchSeconds, completed } = await req.json()
  const admin = await createAdminClient()

  const { error } = await admin.from('lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    watch_seconds: watchSeconds || 0,
    completed: !!completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
