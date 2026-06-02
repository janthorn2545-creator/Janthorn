'use client'
import { useState } from 'react'

export default function CardControls({ certId }: { certId: string }) {
  const [orient, setOrient] = useState<'portrait'|'landscape'>('portrait')
  const [photoX, setPhotoX] = useState(50)
  const [photoY, setPhotoY] = useState(50)
  const [photoScale, setPhotoScale] = useState(100)
  const [showControls, setShowControls] = useState(false)

  const buildUrl = () => {
    const params = new URLSearchParams({
      orientation: orient,
      photo_x: photoX.toString(),
      photo_y: photoY.toString(),
      photo_scale: photoScale.toString(),
    })
    return `/api/employee/certificate/${certId}?${params}`
  }

  return (
    <div className="space-y-3">
      {/* Orientation toggle */}
      <div className="flex gap-2">
        <button onClick={() => setOrient('portrait')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            orient==='portrait' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
          📱 แนวตั้ง
        </button>
        <button onClick={() => setOrient('landscape')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            orient==='landscape' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
          🖥 แนวนอน
        </button>
      </div>

      {/* Toggle photo controls */}
      <button onClick={() => setShowControls(!showControls)}
        className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg transition-colors">
        {showControls ? '▲ ซ่อนการปรับรูป' : '▼ ปรับตำแหน่งรูป'}
      </button>

      {showControls && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-600">ซ้าย ← → ขวา</label>
              <span className="text-xs text-gray-400">{photoX}%</span>
            </div>
            <input type="range" min={0} max={100} value={photoX}
              onChange={e => setPhotoX(Number(e.target.value))}
              className="w-full h-1.5 accent-blue-600" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-600">บน ↑ ↓ ล่าง</label>
              <span className="text-xs text-gray-400">{photoY}%</span>
            </div>
            <input type="range" min={0} max={100} value={photoY}
              onChange={e => setPhotoY(Number(e.target.value))}
              className="w-full h-1.5 accent-blue-600" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-600">ขนาดรูป</label>
              <span className="text-xs text-gray-400">{photoScale}%</span>
            </div>
            <input type="range" min={50} max={200} value={photoScale}
              onChange={e => setPhotoScale(Number(e.target.value))}
              className="w-full h-1.5 accent-blue-600" />
          </div>
          <button onClick={() => { setPhotoX(50); setPhotoY(50); setPhotoScale(100) }}
            className="text-xs text-gray-500 hover:text-gray-700 underline">
            รีเซ็ต
          </button>
        </div>
      )}

      {/* Download button */}
      <a href={buildUrl()} target="_blank"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg text-center transition-colors">
        ⬇ ดาวน์โหลดบัตรผู้รับเหมา
      </a>
    </div>
  )
}
