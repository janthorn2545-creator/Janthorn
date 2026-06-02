export function getCertificateHTML(data: {
  full_name: string
  course_title: string
  cert_code: string
  issued_at: string
  score?: number
}) {
  const issuedDate = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(data.issued_at))

  const expiredDate = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(new Date(data.issued_at).setFullYear(new Date(data.issued_at).getFullYear() + 1)))

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sarabun', sans-serif; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
  .card {
    width: 85.6mm; height: 54mm;
    background: linear-gradient(135deg, #1a3a6b 0%, #0d2447 50%, #1a3a6b 100%);
    border-radius: 4mm;
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 2mm, rgba(255,255,255,0.02) 2mm, rgba(255,255,255,0.02) 4mm);
  }
  .stripe {
    height: 8mm;
    background: linear-gradient(90deg, #f59e0b, #d97706, #f59e0b);
    display: flex; align-items: center; padding: 0 4mm;
    flex-shrink: 0;
  }
  .stripe-text { font-size: 5.5pt; font-weight: 700; color: #1a1a1a; letter-spacing: 0.5px; text-transform: uppercase; }
  .body { flex: 1; display: flex; padding: 2mm 3mm 2mm; gap: 2.5mm; position: relative; z-index: 1; }
  .photo-area {
    width: 16mm; flex-shrink: 0;
    background: rgba(255,255,255,0.15);
    border: 0.5px solid rgba(255,255,255,0.3);
    border-radius: 2mm;
    display: flex; align-items: center; justify-content: center;
  }
  .photo-initial { font-size: 14pt; font-weight: 700; color: #f59e0b; }
  .info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .name { font-size: 8.5pt; font-weight: 700; color: #ffffff; margin-bottom: 1mm; line-height: 1.2; }
  .course-label { font-size: 5pt; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 0.5mm; }
  .course-name { font-size: 6pt; font-weight: 600; color: #fcd34d; line-height: 1.3; }
  .dates { display: flex; gap: 3mm; margin-top: 1.5mm; }
  .date-block { }
  .date-label { font-size: 4.5pt; color: #93c5fd; text-transform: uppercase; }
  .date-value { font-size: 5.5pt; font-weight: 600; color: #ffffff; }
  .footer {
    background: rgba(0,0,0,0.4);
    padding: 1.5mm 3mm;
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0; position: relative; z-index: 1;
  }
  .cert-code { font-size: 5pt; font-family: monospace; color: #93c5fd; letter-spacing: 0.5px; }
  .score-badge {
    background: #059669; color: #fff;
    font-size: 5pt; font-weight: 700;
    padding: 0.5mm 1.5mm; border-radius: 1mm;
  }
  .logo-area { display: flex; align-items: center; gap: 1.5mm; }
  .logo-box { width: 5mm; height: 5mm; background: #f59e0b; border-radius: 0.8mm; display: flex; align-items: center; justify-content: center; font-size: 6pt; font-weight: 700; color: #1a1a1a; }
  .logo-text { font-size: 5pt; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
  .watermark { position: absolute; bottom: 10mm; right: 2mm; font-size: 18pt; font-weight: 900; color: rgba(255,255,255,0.04); transform: rotate(-20deg); z-index: 0; letter-spacing: 2px; }
  @media print {
    body { background: white; padding: 0; margin: 0; }
    .card { box-shadow: none; }
    @page { size: 85.6mm 54mm; margin: 0; }
  }
</style>
</head>
<body>
<div class="card">
  <div class="watermark">CONTRACTOR</div>
  <div class="stripe">
    <span class="stripe-text">บัตรผู้รับเหมา — Contractor Card</span>
  </div>
  <div class="body">
    <div class="photo-area">
      <span class="photo-initial">${data.full_name.charAt(0)}</span>
    </div>
    <div class="info">
      <div>
        <div class="name">${data.full_name}</div>
        <div class="course-label">ผ่านการอบรมหลักสูตร</div>
        <div class="course-name">${data.course_title}</div>
      </div>
      <div class="dates">
        <div class="date-block">
          <div class="date-label">วันที่ออกบัตร</div>
          <div class="date-value">${issuedDate}</div>
        </div>
        <div class="date-block">
          <div class="date-label">วันหมดอายุ</div>
          <div class="date-value" style="color:#fca5a5">${expiredDate}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="logo-area">
      <div class="logo-box">T</div>
      <div class="logo-text">TrainHub</div>
    </div>
    <div class="cert-code">${data.cert_code}</div>
    ${data.score !== undefined ? `<div class="score-badge">คะแนน ${data.score}%</div>` : ''}
  </div>
</div>
</body></html>`
}
