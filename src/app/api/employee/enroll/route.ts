import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendNewEnrollmentRequest } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, courseName } = await req.json()
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  const { data: course } = await supabase.from('courses').select('requires_approval').eq('id', courseId).single()

  const admin = await createAdminClient()
  const { error } = await admin.from('enrollments').upsert({
    user_id: user.id,
    course_id: courseId,
    status: course?.requires_approval ? 'pending' : 'approved',
  }, { onConflict: 'user_id,course_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify admins if needs approval
  if (course?.requires_approval) {
    const { data: admins } = await admin.from('users').select('email').eq('role', 'admin')
    for (const a of admins || []) {
      try { await sendNewEnrollmentRequest(a.email, profile?.full_name || 'Unknown', courseName) }
      catch (e) { console.error(e) }
    }
  }

  return NextResponse.json({ success: true })
}
