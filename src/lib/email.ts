function getResend() {
  const { Resend } = require('resend')
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

const FROM = () => `${process.env.RESEND_FROM_NAME || 'TrainHub'} <${process.env.RESEND_FROM_EMAIL || 'noreply@trainhub.app'}>`

export async function sendEnrollmentApproved(to: string, name: string, courseName: string) {
  if (!process.env.RESEND_API_KEY) return
  return getResend().emails.send({
    from: FROM(), to,
    subject: `✅ อนุมัติแล้ว — ${courseName}`,
    html: emailTemplate(`สวัสดีคุณ ${name}`,
      `คำขอเข้าเรียนคอร์ส <strong>${courseName}</strong> ได้รับการอนุมัติแล้ว`,
      `เข้าเรียนได้เลย`, `${process.env.NEXT_PUBLIC_APP_URL}/employee/courses`)
  })
}

export async function sendEnrollmentRejected(to: string, name: string, courseName: string, note?: string) {
  if (!process.env.RESEND_API_KEY) return
  return getResend().emails.send({
    from: FROM(), to,
    subject: `❌ ไม่ผ่านการอนุมัติ — ${courseName}`,
    html: emailTemplate(`สวัสดีคุณ ${name}`,
      `คำขอเข้าเรียนคอร์ส <strong>${courseName}</strong> ไม่ได้รับการอนุมัติ${note ? `<br><br>เหตุผล: ${note}` : ''}`,
      `ดูคอร์สอื่น`, `${process.env.NEXT_PUBLIC_APP_URL}/employee/courses`)
  })
}

export async function sendCertificateIssued(to: string, name: string, courseName: string, certCode: string, pdfUrl?: string) {
  if (!process.env.RESEND_API_KEY) return
  return getResend().emails.send({
    from: FROM(), to,
    subject: `🎓 ได้รับใบเซอร์ — ${courseName}`,
    html: emailTemplate(`ยินดีด้วย คุณ ${name}! 🎉`,
      `คุณสอบผ่านและได้รับใบรับรองคอร์ส <strong>${courseName}</strong><br>รหัสใบเซอร์: <code>${certCode}</code>`,
      `ดูใบเซอร์ของฉัน`, `${process.env.NEXT_PUBLIC_APP_URL}/employee/certificates`)
  })
}

export async function sendNewEnrollmentRequest(adminEmail: string, userName: string, courseName: string) {
  if (!process.env.RESEND_API_KEY) return
  return getResend().emails.send({
    from: FROM(), to: adminEmail,
    subject: `📋 คำขอสิทธิ์ใหม่ — ${userName}`,
    html: emailTemplate('มีคำขอสิทธิ์ใหม่',
      `<strong>${userName}</strong> ขอสิทธิ์เข้าเรียนคอร์ส <strong>${courseName}</strong>`,
      `ไปอนุมัติ`, `${process.env.NEXT_PUBLIC_APP_URL}/admin/approvals`)
  })
}

function emailTemplate(heading: string, body: string, ctaText: string, ctaUrl: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f5f5f5;padding:32px 0;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#1a56db;padding:24px 32px">
    <h1 style="color:#fff;margin:0;font-size:20px">TrainHub</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:13px">ระบบอบรมพนักงาน</p>
  </div>
  <div style="padding:32px">
    <h2 style="margin:0 0 12px;font-size:18px;color:#111827">${heading}</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7">${body}</p>
    <a href="${ctaUrl}" style="display:inline-block;background:#1a56db;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500">${ctaText}</a>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
    <p style="margin:0;font-size:12px;color:#6b7280">อีเมลนี้ส่งอัตโนมัติจาก TrainHub</p>
  </div>
</div>
</body></html>`
}
