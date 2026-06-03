'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface NavItem {
  href: string; label: string; icon: string; badge?: number
}

const adminNav: NavItem[] = [
  { href: '/admin/dashboard', label: 'แดชบอร์ด', icon: '📊' },
  { href: '/admin/courses', label: 'คอร์สทั้งหมด', icon: '📚' },
  { href: '/admin/lessons', label: 'จัดการวิดีโอ', icon: '🎬' },
  { href: '/admin/quizzes', label: 'แบบทดสอบ', icon: '📝' },
  { href: '/admin/documents', label: 'ไฟล์ & แบบฟอร์ม', icon: '📁' },
  { href: '/admin/approvals', label: 'อนุมัติสิทธิ์', icon: '✅' },
  { href: '/admin/users', label: 'พนักงาน', icon: '👥' },
  { href: '/admin/scores', label: 'คะแนน & รายงาน', icon: '🏆' },
  { href: '/admin/settings', label: 'ตั้งค่า', icon: '⚙️' },
]

const employeeNav: NavItem[] = [
  { href: '/employee/dashboard', label: 'แดชบอร์ด', icon: '🏠' },
  { href: '/employee/courses', label: 'คอร์สของฉัน', icon: '📚' },
  { href: '/employee/quiz', label: 'แบบทดสอบ', icon: '📝' },
  { href: '/employee/documents', label: 'ไฟล์ & แบบฟอร์ม', icon: '📁' },
  { href: '/employee/certificates', label: 'บัตรผู้รับเหมา', icon: '🪪' },
  { href: '/employee/profile', label: 'โปรไฟล์', icon: '👤' },
]

interface SidebarProps {
  role: UserRole
  user: { full_name: string; email: string; department?: string }
  pendingCount?: number
}

export default function Sidebar({ role, user, pendingCount }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const nav = role === 'admin' ? adminNav : employeeNav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = user.full_name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?'

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">TrainHub</div>
            <div className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block',
              role==='admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')}>
              {role==='admin' ? 'ผู้ดูแล' : 'พนักงาน'}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {nav.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const showBadge = item.href.includes('approvals') && pendingCount && pendingCount > 0
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user.full_name}</div>
            <div className="text-xs text-gray-500 truncate">{user.department || user.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="mt-1 w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
          <span>🚪</span> ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
