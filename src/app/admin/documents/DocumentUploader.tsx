'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: 'form', label: '📋 แบบฟอร์ม' },
  { value: 'manual', label: '📖 คู่มือ' },
  { value: 'safety', label: '⛑️ ความปลอดภัย' },
  { value: 'legal', label: '⚖️ กฎหมาย / ระเบียบ' },
  { value: 'general', label: '📁 ทั่วไป' },
]

export default function DocumentUploader() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File|null>(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'form' })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    if (!form.title) setForm(prev => ({ ...prev, title: f.name.replace(/\.[^/.]+$/, '') }))
    setError('')
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('กรุณาเลือกไฟล์'); return }
    setUploading(true); setProgress(10); setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('กรุณา login ใหม่'); setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    setProgress(30)
    const { error: uploadError } = await supabase.storage
      .from('documents').upload(path, file, { upsert: false })

    if (uploadError) { setError('อัปโหลดไม่สำเร็จ: ' + uploadError.message); setUploading(false); return }

    setProgress(70)
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

    const { error: dbError } = await supabase.from('documents').insert({
      title: form.title,
      description: form.description,
      category: form.category,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      created_by: user.id,
    })

    if (dbError) { setError('บันทึกข้อมูลไม่สำเร็จ: ' + dbError.message); setUploading(false); return }

    setProgress(100)
    setTimeout(() => {
      setOpen(false); setFile(null); setForm({ title: '', description: '', category: 'form' })
      setUploading(false); setProgress(0); router.refresh()
    }, 500)
  }

  const fileSizeLabel = file
    ? file.size < 1024*1024
      ? `${(file.size/1024).toFixed(0)} KB`
      : `${(file.size/1024/1024).toFixed(1)} MB`
    : ''

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
      + อัปโหลดไฟล์
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">อัปโหลดไฟล์ใหม่</h2>
          <button onClick={() => { setOpen(false); setFile(null); setError('') }}
            className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">{error}</div>
          )}

          {/* File drop area */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              const f = e.dataTransfer.files[0]
              if (f) { const ev = { target: { files: [f] } } as any; handleFile(ev) }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}>
            {file ? (
              <div>
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-medium text-green-700 truncate px-4">{file.name}</div>
                <div className="text-xs text-green-600 mt-0.5">{fileSizeLabel}</div>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📁</div>
                <div className="text-sm font-medium text-gray-700">คลิกหรือลากไฟล์มาวางที่นี่</div>
                <div className="text-xs text-gray-400 mt-1">PDF, Excel, Word, รูปภาพ, ZIP และอื่นๆ</div>
                <div className="text-xs text-blue-500 mt-0.5 font-medium">ไม่จำกัดขนาดไฟล์</div>
              </div>
            )}
            <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อไฟล์ที่แสดง *</label>
            <input type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="เช่น แบบฟอร์มขออนุญาตทำงาน"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <textarea value={form.description} rows={2}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="อธิบายสั้นๆ ว่าไฟล์นี้ใช้ทำอะไร"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>กำลังอัปโหลด{file ? ` ${fileSizeLabel}` : ''}...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={uploading || !file}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              {uploading ? 'กำลังอัปโหลด...' : '⬆ อัปโหลด'}
            </button>
            <button type="button" onClick={() => { setOpen(false); setFile(null); setError('') }}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
