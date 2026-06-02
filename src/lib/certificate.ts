export function getCertificateHTML(data: {
  full_name: string
  company_name?: string
  course_title: string
  cert_code: string
  issued_at: string
  score?: number
  photo_url?: string
  card_number?: string
  orientation?: 'portrait' | 'landscape'
  photo_x?: number
  photo_y?: number
  photo_scale?: number
}) {
  const expiredDate = new Date(data.issued_at)
  expiredDate.setFullYear(expiredDate.getFullYear() + 1)
  const fmtDate = (d: Date) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  const cardNo = data.card_number || `CON-${new Date(data.issued_at).getFullYear()}-${data.cert_code.replace('CERT-','').substring(0,3)}`
  const orient = data.orientation || 'portrait'
  const px = data.photo_x ?? 50
  const py = data.photo_y ?? 50
  const scale = data.photo_scale ?? 100

  const photoContent = data.photo_url
    ? `<div style="width:100%;height:100%;overflow:hidden;border-radius:3px;position:relative;">
        <img src="${data.photo_url}" style="width:${scale}%;position:absolute;top:${py}%;left:${px}%;transform:translate(-50%,-50%);min-width:100%;min-height:100%;object-fit:cover;" />
       </div>`
    : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#e2e8f0;border-radius:3px;">
        <div style="font-size:${orient==='portrait'?'28':'22'}px;color:#94a3b8;">👤</div>
        <div style="font-size:6px;color:#94a3b8;margin-top:2px;">PHOTO</div>
       </div>`

  if (orient === 'landscape') {
    return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Sarabun',sans-serif;background:#e5e7eb;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px}
  .card{width:86mm;height:54mm;background:#fff;border-radius:3mm;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.25);display:flex;flex-direction:column;}
  .header{background:#1e293b;padding:2mm 3.5mm;display:flex;align-items:center;justify-content:space-between;}
  .company-header{font-size:6pt;font-weight:700;color:#fff;display:flex;align-items:center;gap:1.5mm;}
  .card-no{font-size:6pt;font-weight:700;color:#f59e0b;letter-spacing:0.5px;}
  .body{flex:1;display:flex;gap:3mm;padding:2.5mm 3.5mm;}
  .photo-col{width:22mm;flex-shrink:0;}
  .photo-box{width:22mm;height:28mm;border:1.5px solid #e2e8f0;border-radius:3px;overflow:hidden;background:#f8fafc;}
  .contractor-tag{margin-top:1.5mm;background:#fef3c7;border:1px solid #f59e0b;border-radius:1mm;padding:0.5mm 1.5mm;text-align:center;}
  .contractor-tag-text{font-size:5.5pt;font-weight:700;color:#92400e;}
  .info-col{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:0.5mm 0;}
  .field-label{font-size:4.5pt;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:0.5mm;}
  .field-value{font-size:9.5pt;font-weight:700;color:#1e293b;line-height:1.1;}
  .field-value-sm{font-size:7.5pt;font-weight:600;color:#334155;line-height:1.2;}
  .dates-row{display:flex;gap:4mm;}
  .date-block{}
  .date-label{font-size:4.5pt;color:#94a3b8;text-transform:uppercase;letter-spacing:0.3px;}
  .date-value{font-size:6.5pt;font-weight:700;color:#1e293b;}
  .date-expired{color:#dc2626;}
  .footer{background:#1e293b;padding:1.5mm 3.5mm;display:flex;justify-content:space-between;align-items:center;}
  .footer-text{font-size:4.5pt;color:#94a3b8;}
  .cert-code{font-size:4.5pt;font-family:monospace;color:#64748b;}
  @media print{body{background:white;padding:0;margin:0}.card{box-shadow:none}@page{size:86mm 54mm;margin:0}}
</style></head><body>
<div class="card">
  <div class="header">
    <div class="company-header"><span style="font-size:9pt;">🔩</span>${data.company_name||'TRAINHUB'}</div>
    <div class="card-no">${cardNo}</div>
  </div>
  <div class="body">
    <div class="photo-col">
      <div class="photo-box">${photoContent}</div>
      <div class="contractor-tag"><div class="contractor-tag-text">CONTRACTOR</div></div>
    </div>
    <div class="info-col">
      <div>
        <div class="field-label">ชื่อ-นามสกุล / NAME</div>
        <div class="field-value">${data.full_name}</div>
        <div style="margin-top:2mm;">
          <div class="field-label">บริษัทต้นสังกัด / COMPANY</div>
          <div class="field-value-sm">${data.company_name||'—'}</div>
        </div>
        <div style="margin-top:2mm;">
          <div class="field-label">หลักสูตร</div>
          <div class="field-value-sm" style="font-size:6.5pt;">${data.course_title}</div>
        </div>
      </div>
      <div>
        <div class="dates-row">
          <div class="date-block">
            <div class="date-label">วันที่ออกบัตร</div>
            <div class="date-value">${fmtDate(new Date(data.issued_at))}</div>
          </div>
          <div class="date-block">
            <div class="date-label">วันหมดอายุ</div>
            <div class="date-value date-expired">${fmtDate(expiredDate)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-text">โปรดแสดงบัตรนี้ทุกครั้งเมื่อเข้าปฏิบัติงานในพื้นที่</div>
    <div class="cert-code">${data.cert_code}</div>
  </div>
</div>
</body></html>`
  }

  // Portrait (แนวตั้ง)
  return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Sarabun',sans-serif;background:#e5e7eb;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px}
  .card{width:54mm;background:#fff;border-radius:3mm;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.25);display:flex;flex-direction:column;}
  .header{background:#1e293b;padding:3mm 4mm 2.5mm;display:flex;align-items:center;justify-content:space-between;gap:2mm;}
  .company-header{font-size:5.5pt;font-weight:700;color:#fff;display:flex;align-items:center;gap:1.5mm;}
  .card-no{font-size:6pt;font-weight:700;color:#f59e0b;letter-spacing:0.5px;white-space:nowrap;}
  .photo-section{padding:3mm 4mm 2mm;display:flex;justify-content:center;}
  .photo-box{width:22mm;height:27mm;border:2px solid #e2e8f0;border-radius:4px;overflow:hidden;background:#f8fafc;}
  .body{padding:0 4mm 3mm;flex:1;}
  .field-label{font-size:5pt;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:0.5mm;margin-top:2mm;}
  .field-value{font-size:9pt;font-weight:700;color:#1e293b;line-height:1.2;}
  .field-value-sm{font-size:7.5pt;font-weight:600;color:#334155;line-height:1.3;}
  .position-badge{display:inline-block;margin-top:2mm;background:#fef3c7;border:1px solid #f59e0b;border-radius:1mm;padding:0.8mm 2mm;}
  .position-text{font-size:7pt;font-weight:700;color:#92400e;}
  .dates-row{display:flex;gap:3mm;margin-top:2mm;}
  .date-label{font-size:5pt;color:#94a3b8;text-transform:uppercase;letter-spacing:0.3px;}
  .date-value{font-size:6.5pt;font-weight:600;color:#1e293b;}
  .date-expired{color:#dc2626;}
  .contractor-label{text-align:center;padding:1.5mm 0;border-top:1px solid #f1f5f9;margin-top:2mm;}
  .contractor-text{font-size:7pt;font-weight:700;color:#64748b;letter-spacing:1px;text-transform:uppercase;}
  .footer{background:#1e293b;padding:2mm 4mm;text-align:center;}
  .footer-text{font-size:5pt;color:#94a3b8;line-height:1.5;}
  @media print{body{background:white;padding:0;margin:0}.card{box-shadow:none}@page{size:54mm 86mm;margin:0}}
</style></head><body>
<div class="card">
  <div class="header">
    <div class="company-header"><span style="font-size:9pt;">🔩</span>${data.company_name||'TRAINHUB'}</div>
    <div class="card-no">${cardNo}</div>
  </div>
  <div class="photo-section"><div class="photo-box">${photoContent}</div></div>
  <div class="body">
    <div class="field-label">ชื่อ-นามสกุล / NAME</div>
    <div class="field-value">${data.full_name}</div>
    <div class="field-label">บริษัทต้นสังกัด / COMPANY</div>
    <div class="field-value-sm">${data.company_name||'—'}</div>
    <div class="position-badge"><div class="position-text">ผู้รับเหมา / Contractor</div></div>
    <div class="dates-row">
      <div class="date-block">
        <div class="date-label">วันที่ออกบัตร</div>
        <div class="date-value">${fmtDate(new Date(data.issued_at))}</div>
      </div>
      <div class="date-block">
        <div class="date-label">วันหมดอายุ</div>
        <div class="date-value date-expired">${fmtDate(expiredDate)}</div>
      </div>
    </div>
    <div class="contractor-label"><div class="contractor-text">CONTRACTOR</div></div>
  </div>
  <div class="footer"><div class="footer-text">โปรดแสดงบัตรนี้ทุกครั้งเมื่อเข้าปฏิบัติงานในพื้นที่</div></div>
</div>
</body></html>`
}
