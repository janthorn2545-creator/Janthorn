export function getCertificateHTML(data: {
  full_name: string
  company_name?: string
  course_title: string
  cert_code: string
  issued_at: string
  score?: number
  photo_url?: string
  card_number?: string
}) {
  const expiredDate = new Date(data.issued_at)
  expiredDate.setFullYear(expiredDate.getFullYear() + 1)

  const fmtDate = (d: Date) => new Intl.DateTimeFormat('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(d)

  const cardNo = data.card_number || `CON-${new Date(data.issued_at).getFullYear()}-${data.cert_code.replace('CERT-', '').substring(0, 3)}`

  const photoSection = data.photo_url
    ? `<img src="${data.photo_url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" alt="photo"/>`
    : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#e2e8f0;border-radius:4px;gap:4px;">
        <div style="font-size:28px;color:#94a3b8;">👤</div>
        <div style="font-size:7px;color:#94a3b8;text-align:center;">PHOTO</div>
       </div>`

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Sarabun',sans-serif;background:#e5e7eb;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px}
  .card{
    width:54mm;background:#fff;border-radius:3mm;
    overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.25);
    display:flex;flex-direction:column;
  }
  .header{
    background:#1e293b;padding:3mm 4mm 2.5mm;
    display:flex;align-items:center;justify-content:space-between;gap:2mm;
  }
  .header-left{display:flex;align-items:center;gap:2mm}
  .header-icon{font-size:9pt;color:#f59e0b}
  .company-header{font-size:5.5pt;font-weight:700;color:#fff;letter-spacing:0.2px;line-height:1.3}
  .card-no{font-size:6pt;font-weight:700;color:#f59e0b;letter-spacing:0.5px;white-space:nowrap}
  .photo-section{padding:3mm 4mm 2mm;display:flex;justify-content:center}
  .photo-box{
    width:22mm;height:27mm;
    border:2px solid #e2e8f0;border-radius:4px;overflow:hidden;
    background:#f8fafc;
  }
  .body{padding:0 4mm 3mm;flex:1}
  .field-label{
    font-size:5pt;color:#94a3b8;letter-spacing:0.5px;
    text-transform:uppercase;margin-bottom:0.5mm;margin-top:2mm;
  }
  .field-value{font-size:9pt;font-weight:700;color:#1e293b;line-height:1.2}
  .field-value-sm{font-size:7.5pt;font-weight:600;color:#334155;line-height:1.3}
  .position-badge{
    display:inline-block;margin-top:2mm;
    background:#fef3c7;border:1px solid #f59e0b;
    border-radius:1mm;padding:0.8mm 2mm;
  }
  .position-text{font-size:7pt;font-weight:700;color:#92400e}
  .dates-row{display:flex;gap:3mm;margin-top:2mm}
  .date-block{flex:1}
  .date-label{font-size:5pt;color:#94a3b8;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:0.5mm}
  .date-value{font-size:6.5pt;font-weight:600;color:#1e293b}
  .date-value.expired{color:#dc2626}
  .contractor-label{
    text-align:center;padding:1.5mm 0;
    border-top:1px solid #f1f5f9;margin-top:2mm;
  }
  .contractor-text{font-size:7pt;font-weight:700;color:#64748b;letter-spacing:1px;text-transform:uppercase}
  .footer{
    background:#1e293b;padding:2mm 4mm;text-align:center;
  }
  .footer-text{font-size:5pt;color:#94a3b8;line-height:1.5}
  @media print{
    body{background:white;padding:0;margin:0}
    .card{box-shadow:none}
    @page{size:54mm 86mm;margin:0}
  }
</style>
</head>
<body>
<div class="card">
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <span class="header-icon">🔩</span>
      <div class="company-header">${data.company_name || 'TRAINHUB'}</div>
    </div>
    <div class="card-no">${cardNo}</div>
  </div>

  <!-- Photo -->
  <div class="photo-section">
    <div class="photo-box">${photoSection}</div>
  </div>

  <!-- Info -->
  <div class="body">
    <div class="field-label">ชื่อ-นามสกุล / NAME</div>
    <div class="field-value">${data.full_name}</div>

    <div class="field-label">บริษัทต้นสังกัด / COMPANY</div>
    <div class="field-value-sm">${data.company_name || '—'}</div>

    <div class="position-badge">
      <div class="position-text">ผู้รับเหมา / Contractor</div>
    </div>

    <div class="dates-row">
      <div class="date-block">
        <div class="date-label">ตำแหน่งปฏิบัติงาน</div>
        <div class="date-value">ผู้รับเหมา</div>
      </div>
      <div class="date-block">
        <div class="date-label">วันหมดอายุบัตร</div>
        <div class="date-value expired">${fmtDate(expiredDate)}</div>
      </div>
    </div>

    <div class="contractor-label">
      <div class="contractor-text">CONTRACTOR</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-text">โปรดแสดงบัตรนี้ทุกครั้งเมื่อเข้าปฏิบัติงานในพื้นที่</div>
  </div>
</div>
</body></html>`
}
