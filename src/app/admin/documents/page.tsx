export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import DocumentUploader from './DocumentUploader'
import DeleteDocButton from './DeleteDocButton'

function fileIcon(type: string) {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('sheet') || type?.includes('excel') || type?.includes('csv')) return '📊'
  if (type?.includes('word') || type?.includes('document')) return '📝'
  if (type?.includes('image')) return '🖼️'
  if (type?.includes('zip') || type?.includes('rar')) return '🗜️'
  return '📁'
}

function fileSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

const CATEGORIES = [
  { value: 'form', label: '📋 แบบฟอร์ม' },
  { value: 'manual', label: '📖 คู่มือ' },
  { value: 'safety', label: '⛑️ ความปลอดภัย' },
  { value: 'legal', label: '⚖️ กฎหมาย / ระเบียบ' },
  { value: 'general', label: '📁 ทั่วไป' },
]

export default async function AdminDocumentsPage() {
  const supabase = await createClient()
  const { data: docs } = await supabase
    .from('documents').select('*').order('created_at', { ascending: false })

  const grouped: Record<string, any[]> = {}
  ;(docs||[]).forEach((d:any) => {
    const cat = d.category || 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(d)
  })

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ไฟล์ & แบบฟอร์ม</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการไฟล์สำหรับผู้รับเหมาดาวน์โหลด</p>
        </div>
        <DocumentUploader />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-2xl font-semibold text-blue-700">{docs?.length||0}</div>
          <div className="text-xs text-blue-600">ไฟล์ทั้งหมด</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-2xl font-semibold text-green-700">
            {(docs||[]).filter((d:any)=>d.category==='form').length}
          </div>
          <div className="text-xs text-green-600">แบบฟอร์ม</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="text-2xl font-semibold text-amber-700">
            {(docs||[]).reduce((s:number,d:any)=>s+(d.download_count||0),0)}
          </div>
          <div className="text-xs text-amber-600">ครั้งที่ดาวน์โหลด</div>
        </div>
      </div>

      {/* Grouped by category */}
      {CATEGORIES.map(cat => {
        const items = grouped[cat.value] || []
        if (items.length === 0) return null
        return (
          <div key={cat.value} className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-700">{cat.label}</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['ไฟล์', 'ขนาด', 'ดาวน์โหลด', 'อัปโหลดเมื่อ', ''].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((d:any) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{fileIcon(d.file_type)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{d.title}</div>
                            {d.description && <div className="text-xs text-gray-400 mt-0.5">{d.description}</div>}
                            <div className="text-xs text-gray-400">{d.file_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fileSize(d.file_size)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{d.download_count||0} ครั้ง</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          <a href={d.file_url} target="_blank" download
                            className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                            ⬇ ดาวน์โหลด
                          </a>
                          <DeleteDocButton docId={d.id} fileUrl={d.file_url} title={d.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {(!docs||docs.length===0) && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-base font-medium text-gray-700 mb-1">ยังไม่มีไฟล์</p>
          <p className="text-sm text-gray-500">กดปุ่ม "+ อัปโหลดไฟล์" เพื่อเพิ่มไฟล์แรก</p>
        </div>
      )}
    </div>
  )
}
