export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCertificateHTML } from '@/lib/certificate'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  const { certId } = await params
  const { searchParams } = new URL(req.url)
  const photo_x = Number(searchParams.get('photo_x') || 50)
  const photo_y = Number(searchParams.get('photo_y') || 50)
  const photo_scale = Number(searchParams.get('photo_scale') || 100)
  const format = searchParams.get('format') || 'pdf'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: cert } = await supabase
    .from('certificates')
    .select('*, users(full_name, photo_url, company_name), courses(title)')
    .eq('id', certId).single()

  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (cert.user_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const issueYear = new Date(cert.issued_at).getFullYear()
  const cardNumber = `CON-${issueYear}-${cert.cert_code.replace('CERT-', '').substring(0, 3)}`

  const html = getCertificateHTML({
    full_name: (cert.users as any).full_name,
    company_name: (cert.users as any).company_name || '',
    course_title: (cert.courses as any).title,
    cert_code: cert.cert_code,
    issued_at: cert.issued_at,
    photo_url: (cert.users as any).photo_url || '',
    card_number: cardNumber,
    orientation: 'landscape',
    photo_x,
    photo_y,
    photo_scale,
    format,
  })

  // ส่ง HTML พร้อม script print สำหรับ PDF/JPG
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
