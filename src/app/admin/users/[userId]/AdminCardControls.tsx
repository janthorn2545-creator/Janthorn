'use client'
import { useState } from 'react'

export default function AdminCardControls({ certId, isExpired }: { certId: string; isExpired: boolean }) {
  const [orient, setOrient] = useState<'portrait'|'landscape'>('portrait')
  const [showControls, setShowControls] = useState(false)
  const [photoX, setPhotoX] = useState(50)
  const [photoY, setPhotoY] = useState(50)
  const [photoScale, setPhotoScale] = useState(100)

  const buildUrl = () => {
    const p = new URLSearchParams({
      orientation: orient,
      photo_x: photoX.toString(),
      photo_y: photoY.toString(),
      photo_scale: photoScale.toString(),
    })
    return `/api/employee/certificate/${certId}?${p}`
  }

  return (
    <div className="space-y-2">
      {/* Orientation */}
      <div className="flex gap-1.5">
        <button onClick={() => setOrient('portrait')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            orient==='portrait' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          📱 แนวตั้ง
        </button>
        <button onClick={() => setOrient('landscape')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            orient==='landscape' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          🖥 แนวนอน
        </button>
      </div>

      {/* Toggle photo controls */}
      <button onClick={() => setShowControls(!showControls)}
        className="w-full py-1 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg transition-colors">
        {showControls ? '▲ ซ่อน' : '▼ ปรับตำแหน่งรูป'}
      </button>

      {showControls && (
        <div className="bg-gray-50 rounded-lg p-2.5 space-y-2.5">
          {[
            { label: 'ซ้าย ↔ ขวา', val: photoX, set: setPhotoX, min: 0, max: 100 },
            { label: 'บน ↕ ล่าง', val: photoY, set: setPhotoY, min: 0, max: 100 },
            { label: 'ขนาดรูป', val: photoScale, set: setPhotoScale, min: 50, max: 200 },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between mb-0.5">
                <label className="text-xs text-gray-500">{s.label}</label>
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

      {/* Download */}
      {isExpired ? (
        <div className="w-full bg-gray-100 text-gray-400 text-xs py-2 rounded-lg text-center">
          บัตรหมดอายุแล้ว
        </div>
      ) : (
        <a href={buildUrl()} target="_blank"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg text-center transition-colors">
          ⬇ ดาวน์โหลดบัตร
        </a>
      )}
    </div>
  )
}
