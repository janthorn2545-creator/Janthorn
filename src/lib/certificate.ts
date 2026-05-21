// Certificate PDF generation
// Uses a lightweight HTML→PDF approach compatible with Vercel Edge

export function getCertificateHTML(data: {
  full_name: string
  course_title: string
  cert_code: string
  issued_at: string
  score?: number
}) {
  const date = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(data.issued_at))

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sarabun', sans-serif; background: #fff; width: 842px; height: 595px; }
  .page {
    width: 842px; height: 595px; position: relative;
    border: 8px solid #1a56db; padding: 32px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .border-inner { position: absolute; inset: 16px; border: 1.5px solid #93c5fd; pointer-events: none; }
  .corner { position: absolute; width: 32px; height: 32px; }
  .corner.tl { top: 24px; left: 24px; border-top: 3px solid #1a56db; border-left: 3px solid #1a56db; }
  .corner.tr { top: 24px; right: 24px; border-top: 3px solid #1a56db; border-right: 3px solid #1a56db; }
  .corner.bl { bottom: 24px; left: 24px; border-bottom: 3px solid #1a56db; border-left: 3px solid #1a56db; }
  .corner.br { bottom: 24px; right: 24px; border-bottom: 3px solid #1a56db; border-right: 3px solid #1a56db; }
  .logo { font-size: 13px; font-weight: 600; color: #1a56db; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
  .cert-title { font-size: 11px; color: #6b7280; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 24px; }
  .presents { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
  .name { font-size: 42px; font-weight: 700; color: #111827; margin-bottom: 12px; line-height: 1.1; }
  .completed { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
  .course { font-size: 22px; font-weight: 600; color: #1a56db; margin-bottom: 24px; max-width: 600px; text-align: center; }
  .divider { width: 120px; height: 2px; background: #1a56db; margin: 0 auto 24px; }
  .meta { display: flex; gap: 48px; align-items: flex-end; }
  .meta-item { text-align: center; }
  .meta-label { font-size: 10px; color: #9ca3af; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px; }
  .meta-value { font-size: 13px; font-weight: 500; color: #374151; }
  .cert-code { font-size: 10px; color: #d1d5db; position: absolute; bottom: 28px; right: 36px; letter-spacing: 1px; }
  .badge { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 100px; padding: 4px 16px; font-size: 12px; color: #1d4ed8; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="page">
  <div class="border-inner"></div>
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  <div class="logo">TrainHub</div>
  <div class="cert-title">Certificate of Completion</div>
  <div class="badge">ใบรับรองการผ่านหลักสูตร</div>
  <div class="presents">ขอมอบใบรับรองนี้ให้แก่</div>
  <div class="name">${data.full_name}</div>
  <div class="completed">สำเร็จการอบรมหลักสูตร</div>
  <div class="course">${data.course_title}</div>
  <div class="divider"></div>
  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">วันที่ออกใบรับรอง</div>
      <div class="meta-value">${date}</div>
    </div>
    ${data.score !== undefined ? `
    <div class="meta-item">
      <div class="meta-label">คะแนนที่ได้</div>
      <div class="meta-value">${data.score}%</div>
    </div>` : ''}
    <div class="meta-item">
      <div class="meta-label">รหัสอ้างอิง</div>
      <div class="meta-value">${data.cert_code}</div>
    </div>
  </div>
  <div class="cert-code">${data.cert_code}</div>
</div>
</body></html>`
}
