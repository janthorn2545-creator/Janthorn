'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfileForm({ profile, userId }: { profile: any; userId: string }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    department: profile?.department || '',
    position: profile?.position || '',
    company_name: profile?.company_name || '',
  })
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('รูปต้องไม่เกิน 2MB'); return }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = data.publicUrl + '?t=' + Date.now()
      setPhotoUrl(url)
      await supabase.from('users').update({ photo_url: url }).eq('id', userId)
    } else {
      alert('อัปโหลดไม่สำเร็จ: ' + error.message)
    }
    setUploading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('users').update(form).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Photo upload */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
            {photoUrl
              ? <img src={photoUrl} alt="profile" className="w-full h-full object-cover" />
              : <span className="text-3xl text-gray-400">👤</span>
            }
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-xs shadow-sm transition-colors"
            title="เปลี่ยนรูป">
            {uploading ? '⏳' : '📷'}
          </button>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{profile?.full_name}</div>
          <div className="text-sm text-gray-500">{profile?.email}</div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-xs text-blue-600 hover:underline mt-1">
            {uploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700">
            ✓ บันทึกแล้ว
          </div>
        )}
        {[
          { k: 'full_name', label: 'ชื่อ-นามสกุล *', placeholder: 'ชื่อที่จะแสดงบนบัตร' },
          { k: 'company_name', label: 'บริษัทต้นสังกัด', placeholder: 'เช่น บริษัท เอ็กซ์ จำกัด' },
          { k: 'department', label: 'แผนก', placeholder: 'เช่น ฝ่ายผลิต' },
          { k: 'position', label: 'ตำแหน่ง', placeholder: 'เช่น วิศวกร, ช่างซ่อม' },
        ].map(({ k, label, placeholder }) => (
          <div key={k}>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <input type="text" value={form[k as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
          💡 ชื่อและบริษัทที่กรอกจะแสดงบนบัตรผู้รับเหมา
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
          {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </form>
    </div>
  )
}
