export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import CardControls from './CardControls'

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: certs } = await supabase
    .from('certificates')
    .select('*, courses(title)')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">บัตรผู้รับเหมาของฉัน</h1>
        <p className="text-sm text-gray-500 mt-1">{certs?.length || 0} บัตรที่ได้รับ</p>
      </div>

      {certs && certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((c: any) => {
            const expiredDate = new Date(c.issued_at)
            expiredDate.setFullYear(expiredDate.getFullYear() + 1)
            const isExpired = expiredDate < new Date()
            const daysLeft = Math.ceil((expiredDate.getTime() - new Date().getTime()) / (1000*60*60*24))
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-900 to-blue-950 p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">บัตรผู้รับเหมา</div>
                    {isExpired
                      ? <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">หมดอายุแล้ว</span>
                      : daysLeft <= 30
                      ? <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded">เหลือ {daysLeft} วัน</span>
                      : <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">ใช้งานได้</span>
                    }
                  </div>
                  <div className="text-base font-bold">{c.courses?.title}</div>
                  <div className="text-blue-300 text-xs font-mono mt-0.5">{c.cert_code}</div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">วันที่ออกบัตร</div>
                      <div className="font-medium text-gray-800">{formatDate(c.issued_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">วันหมดอายุ</div>
                      <div className={`font-medium ${isExpired?'text-red-600':daysLeft<=30?'text-orange-600':'text-gray-800'}`}>
                        {formatDate(expiredDate.toISOString())}
                      </div>
                    </div>
                  </div>
                  {isExpired ? (
                    <div className="w-full bg-gray-100 text-gray-500 text-sm font-medium py-2 px-4 rounded-lg text-center">
                      บัตรหมดอายุ — ต้องอบรมใหม่
                    </div>
                  ) : (
                    <CardControls certId={c.id} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🪪</div>
          <p className="text-base font-medium text-gray-700 mb-2">ยังไม่มีบัตรผู้รับเหมา</p>
          <p className="text-sm text-gray-500 mb-6">ต้องผ่านการอบรมและทำแบบทดสอบให้ได้ <strong>80% ขึ้นไป</strong></p>
          <Link href="/employee/courses" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-lg inline-block">
            ไปเรียนคอร์ส →
          </Link>
        </div>
      )}
    </div>
  )
}
