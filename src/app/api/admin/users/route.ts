import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { full_name, email, password, department, position, company_name } = await req.json()
  if (!full_name || !email || !password) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, department, position, company_name, role: 'employee' },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return NextResponse.json({ error: 'อีเมลนี้มีผู้ใช้แล้ว' }, { status: 400 })
    }
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  if (newUser.user) {
    await admin.from('users').update({ department, position, company_name }).eq('id', newUser.user.id)
  }

  return NextResponse.json({ success: true, userId: newUser.user?.id })
}
