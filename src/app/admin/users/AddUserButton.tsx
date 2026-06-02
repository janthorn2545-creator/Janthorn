'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddUserButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', department: '', position: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'เกิดข้อผิดพลาด'); return }
    setSuccess(`เพิ่ม ${form.full_name} สำเร็จแล้ว`)
    setForm({ full_name: '', email: '', password: '', department: '', position: '' })
    router.refresh()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
      + เพิ่มพนักงาน
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">เพิ่มพนักงานใหม่</h2>
          <button onClick={() => { setOpen(false); setError(''); setSuccess('') }}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">{error}</div>}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700">
              ✓ {success}
              <button type="button" onClick={() => setSuccess('')} className="ml-2 text-green-600 underline text-xs">เพิ่มคนต่อไป</button>
            </div>
          )}
          {[
            { k: 'full_name', label: 'ชื่อ-นามสกุล *', type: 'text', placeholder: 'สมชาย ใจดี' },
            { k: 'email', label: 'อีเมล *', type: 'email', placeholder: 'somchai@email.com' },
            { k: 'password', label: 'รหัสผ่านเริ่มต้น *', type: 'text', placeholder: 'อย่างน้อย 6 ตัว' },
            { k: 'department', label: 'แผนก', type: 'text', placeholder: 'เช่น ฝ่ายผลิต, Safety' },
            { k: 'position', label: 'ตำแหน่ง', type: 'text', placeholder: 'เช่น วิศวกร, ช่างซ่อม' },
          ].map(({ k, label, type, placeholder }) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={form[k as keyof typeof form]}
                onChange={update(k)} placeholder={placeholder}
                required={['full_name','email','password'].includes(k)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
            พนักงานจะ login ด้วยอีเมลและรหัสผ่านที่ตั้งไว้นี้
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              {loading ? 'กำลังสร้าง...' : 'เพิ่มพนักงาน'}
            </button>
            <button type="button" onClick={() => { setOpen(false); setError(''); setSuccess('') }}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors">
              ปิด
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
