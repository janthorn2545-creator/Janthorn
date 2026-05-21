export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">ตั้งค่าระบบ</h1>
        <p className="text-sm text-gray-500 mt-1">กำหนดค่าและปรับแต่งระบบ</p>
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">ข้อมูลองค์กร</h2>
          <div className="space-y-3">
            {[
              { label: 'ชื่อบริษัท', placeholder: 'บริษัท ตัวอย่าง จำกัด', type: 'text' },
              { label: 'อีเมลผู้ดูแล', placeholder: 'admin@company.com', type: 'email' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">การตั้งค่าคอร์ส</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">เกณฑ์ผ่านขั้นต่ำ (ค่าเริ่มต้น)</label>
              <input type="number" defaultValue={70} min={0} max={100}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-500">%</span>
            </div>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  )
}
