import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: results } = await supabase
    .from('quiz_results')
    .select('*, users(full_name, email, department), courses(title)')
    .order('taken_at', { ascending: false })

  const rows = [
    ['ชื่อ', 'อีเมล', 'แผนก', 'คอร์ส', 'คะแนน', 'รวม', 'เปอร์เซ็น', 'ผล', 'วันที่'],
    ...(results || []).map((r: any) => [
      r.users?.full_name || '',
      r.users?.email || '',
      r.users?.department || '',
      r.courses?.title || '',
      r.score,
      r.total,
      `${Math.round(r.score / r.total * 100)}%`,
      r.passed ? 'ผ่าน' : 'ไม่ผ่าน',
      new Date(r.taken_at).toLocaleDateString('th-TH'),
    ])
  ]

  const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n')
  const bom = '\uFEFF' // UTF-8 BOM for Excel Thai support

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="quiz-results-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
