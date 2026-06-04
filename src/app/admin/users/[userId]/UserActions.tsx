'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  userName: string
  currentRole: string
  myRole: string
}

export default function UserActions({ userId, userName, currentRole, myRole }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmRole, setConfirmRole] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const newRole = currentRole === 'employee' ? 'admin' : 'employee'
  const newRoleLabel = newRole === 'admin' ? '🛡️ ผู้ดูแล' : '👤 พนักงาน'

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (res.ok) { router.push('/admin/users'); router.refresh() }
    else { setMsg('ลบไม่สำเร็จ'); setLoading(false) }
  }

  const handleRoleChange = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    const data = await res.json()
    setLoading(false); setConfirmRole(false)
    if (res.ok) { setMsg(`เปลี่ยนเป็น ${newRoleLabel} แล้ว`); setTimeout(() => { setMsg(''); router.refresh() }, 1500) }
    else setMsg(data.error || 'เกิดข้อผิดพลาด')
  }

  if (confirmRole) return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col gap-2 min-w-[200px]">
      <div className="text-sm font-medium text-blue-800">เปลี่ยน "{userName}" เป็น {newRoleLabel}?</div>
      <div className="flex gap-2">
        <button onClick={handleRoleChange} disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-medium py-1.5 rounded-lg">
          {loading ? '...' : 'ยืนยัน'}
        </button>
        <button onClick={() => setConfirmRole(false)}
          className="flex-1 border border-gray-300 text-gray-600 text-xs py-1.5 rounded-lg">ยกเลิก</button>
      </div>
    </div>
  )

  if (confirmDelete) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2 min-w-[200px]">
      <div className="text-sm font-medium text-red-800">ยืนยันลบ "{userName}"?</div>
      <div className="text-xs text-red-600">ข้อมูลทั้งหมดจะถูกลบถาวร</div>
      <div className="flex gap-2">
        <button onClick={handleDelete} disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-medium py-1.5 rounded-lg">
          {loading ? '...' : 'ยืนยันลบ'}
        </button>
        <button onClick={() => setConfirmDelete(false)}
          className="flex-1 border border-gray-300 text-gray-600 text-xs py-1.5 rounded-lg">ยกเลิก</button>
      </div>
    </div>
  )

  return (
    <div className="relative flex flex-col items-end gap-1">
      {msg && <div className={`text-xs px-3 py-1 rounded-lg ${msg.includes('แล้ว') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{msg}</div>}
      <button onClick={() => setShowMenu(!showMenu)}
        className="border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
        ⚙️ จัดการ <span className="text-xs">{showMenu ? '▲' : '▼'}</span>
      </button>
      {showMenu && (
        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-48 overflow-hidden">
          <button onClick={() => { setShowMenu(false); setConfirmRole(true) }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100">
            <span>🔄</span>
            <div>
              <div className="font-medium text-blue-700">
                {currentRole === 'employee' ? 'เพิ่มเป็นผู้ดูแล' : 'ลดเป็นพนักงาน'}
              </div>
              <div className="text-xs text-gray-400">ปัจจุบัน: {currentRole === 'employee' ? 'พนักงาน' : 'ผู้ดูแล'}</div>
            </div>
          </button>
          <button onClick={() => { setShowMenu(false); setConfirmDelete(true) }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
            <span>🗑️</span>
            <div><div className="font-medium">ลบบัญชี</div><div className="text-xs text-red-400">ลบถาวร</div></div>
          </button>
          <button onClick={() => setShowMenu(false)}
            className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-50 border-t border-gray-100">✕ ปิด</button>
        </div>
      )}
    </div>
  )
}
