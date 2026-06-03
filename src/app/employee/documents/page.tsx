export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import DownloadButton from './DownloadButton'

function fileIcon(type: string) {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('sheet') || type?.includes('excel') || type?.includes('csv')) return '📊'
  if (type?.includes('word') || type?.includes('document')) return '📝'
  if (type?.includes('image')) return '🖼️'
  if (type?.includes('zip')) return '🗜️'
  return '📁'
}

function fileSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(0)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

const CATEGORIES: Record<string, string> = {
  form: '📋 แบบฟอร์ม',
  manual: '📖 คู่มือ',
  safety: '⛑️ ความปลอดภัย',
  legal: '⚖️ กฎหมาย / ระเบียบ',
  general: '📁 ทั่วไป',
}

export default async function EmployeeDocumentsPage() {
  const supabase = await createClient()
  const { data: docs } = await supabase
    .from('documents').select('*').order('category').order('created_at', { ascending: false })

  const grouped: Record<string, any[]> = {}
  ;(docs||[]).forEach((d:any) => {
    const cat = d.category || 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(d)
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">ไฟล์ & แบบฟอร์ม</h1>
        <p className="text-sm text-gray-500 mt-1">ดาวน์โหลดแบบฟอร์มและเอกสารที่เกี่ยวข้อง</p>
      </div>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {CATEGORIES[cat] || cat}
              <span className="ml-2 text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
            </h2>
            <div className="grid gap-3">
              {items.map((d:any) => (
                <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-blue-300 transition-colors">
                  <div className="text-3xl flex-shrink-0">{fileIcon(d.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{d.title}</div>
                    {d.description && <div className="text-sm text-gray-500 mt-0.5">{d.description}</div>}
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{d.file_name}</span>
                      {d.file_size > 0 && <span>{fileSize(d.file_size)}</span>}
                      <span>อัปโหลด {formatDate(d.created_at)}</span>
                    </div>
                  </div>
                  <DownloadButton docId={d.id} fileUrl={d.file_url} fileName={d.file_name} />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-base font-medium text-gray-700 mb-1">ยังไม่มีไฟล์</p>
          <p className="text-sm text-gray-500">รอผู้ดูแลอัปโหลดเอกสาร</p>
        </div>
      )}
    </div>
  )
}
