'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', department: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name, department: form.department } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm mt-1">TrainHub — ระบบอบรมพนักงาน</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
          {[
            { k: 'full_name', label: 'ชื่อ-นามสกุล', type: 'text', placeholder: 'สมชาย ใจดี' },
            { k: 'email', label: 'อีเมล', type: 'email', placeholder: 'your@email.com' },
            { k: 'department', label: 'แผนก', type: 'text', placeholder: 'ฝ่ายผลิต' },
            { k: 'password', label: 'รหัสผ่าน (อย่างน้อย 6 ตัว)', type: 'password', placeholder: '••••••••' },
          ].map(({ k, label, type, placeholder }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type={type} required value={form[k as keyof typeof form]}
                onChange={update(k)} placeholder={placeholder}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          มีบัญชีแล้ว? <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
