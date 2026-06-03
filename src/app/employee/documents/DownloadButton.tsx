'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DownloadButton({ docId, fileUrl, fileName }: {
  docId: string; fileUrl: string; fileName: string
}) {
  const [downloading, setDownloading] = useState(false)
  const supabase = createClient()

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { data: doc } = await supabase
        .from('documents').select('download_count').eq('id', docId).single()
      await supabase.from('documents')
        .update({ download_count: (doc?.download_count || 0) + 1 }).eq('id', docId)
    } catch {}
    // เปิดในแท็บใหม่
    const a = document.createElement('a')
    a.href = fileUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDownloading(false), 1500)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
      {downloading ? '⏳' : '⬇'} {downloading ? 'กำลังโหลด...' : 'ดาวน์โหลด'}
    </button>
  )
}
