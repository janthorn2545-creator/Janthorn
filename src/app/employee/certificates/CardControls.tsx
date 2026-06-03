'use client'
import { useState } from 'react'

export default function CardControls({ certId }: { certId: string }) {
  const [photoX, setPhotoX] = useState(50)
  const [photoY, setPhotoY] = useState(50)
  const [photoScale, setPhotoScale] = useState(100)
  const [showControls, setShowControls] = useState(false)
  const [downloading, setDownloading] = useState<'pdf'|'jpg'|null>(null)

  const buildUrl = (format: 'pdf'|'jpg') => {
    const p = new URLSearchParams({
      orientation: 'landscape',
      photo_x: photoX.toString(),
      photo_y: photoY.toString(),
      photo_scale: photoScale.toString(),
      format,
    })
    return `/api/employee/certificate/${certId}?${p}`
  }

  const handleDownload = async (format: 'pdf'|'jpg') => {
    setDownloading(format)
    window.open(buildUrl(format), '_blank')
    setTimeout(() => setDownloading(null), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Photo adjust toggle */}
      <button onClick={() => setShowControls(!showControls)}
        className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg transition-colors">
        {showControls ? '▲ ซ่อนการปรับรูป' : '▼ ปรับตำแหน่งรูป'}
      </button>

      {showControls && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          {[
            { label: 'ซ้าย ↔ ขวา', val: photoX, set: setPhotoX, min: 0, max: 100 },
            { label: 'บน ↕ ล่าง', val: photoY, set: setPhotoY, min: 0, max: 100 },
            { label: 'ขนาดรูป', val: photoScale, set: setPhotoScale, min: 50, max: 200 },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between mb-0.5">
                <label className="text-xs text-gray-600">{s.label}</label>
                <span className="text-xs text-gray-400">{s.val}%</span>
              </div>
              <input type="range" min={s.min} max={s.max} value={s.val}
                onChange={e => s.set(Number(e.target.value))}
                className="w-full h-1.5 accent-blue-600" />
            </div>
          ))}
          <button onClick={() => { setPhotoX(50); setPhotoY(50); setPhotoScale(100) }}
            className="text-xs text-gray-400 hover:text-gray-600 underline">รีเซ็ต</button>
        </div>
      )}

      {/* Download buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleDownload('pdf')} disabled={!!downloading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
          {downloading === 'pdf' ? '⏳' : '📄'} {downloading === 'pdf' ? 'กำลังโหลด...' : 'PDF'}
        </button>
        <button onClick={() => handleDownload('jpg')} disabled={!!downloading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
          {downloading === 'jpg' ? '⏳' : '🖼️'} {downloading === 'jpg' ? 'กำลังโหลด...' : 'JPG'}
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center">บัตรแนวนอน — พร้อมพิมพ์</p>
    </div>
  )
}
