import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEnrollmentApproved, sendEnrollmentRejected } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { enrollmentId, action, note, userEmail, userName, courseName } = await req.json()
  const admin = await createAdminClient()

  const { error } = await admin.from('enrollments').update({
    status: action === 'approve' ? 'approved' : 'rejected',
    approved_by: user.id,
    approved_at: new Date().toISOString(),
    rejection_note: note || null,
  }).eq('id', enrollmentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    if (action === 'approve') {
      await sendEnrollmentApproved(userEmail, userName, courseName)
    } else {
      await sendEnrollmentRejected(userEmail, userName, courseName, note)
    }
  } catch (e) { console.error('Email error:', e) }

  return NextResponse.json({ success: true })
}
