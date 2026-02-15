import * as Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ""
);

const SENDER = {
  email: process.env.BREVO_SENDER_EMAIL || "noreply@icpc-usict.com",
  name: process.env.BREVO_SENDER_NAME || "ICPC USICT",
};

// Startup validation
if (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.startsWith("xkeysib-")) {
  console.error("[EmailService] ⚠️  BREVO_API_KEY looks wrong! It should start with 'xkeysib-' (API key), not 'xsmtpsib-' (SMTP key). Go to Brevo → Settings → SMTP & API → API Keys to get the correct key.");
}

// ─── core sender ───────────────────────────────────────────────
async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("[EmailService] BREVO_API_KEY not set – skipping email to", to);
    return;
  }

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = SENDER;
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("[EmailService] ✅ Email sent to", to, "| messageId:", (result as any)?.body?.messageId || "unknown");
  } catch (err: any) {
    console.error("[EmailService] ❌ Failed to send email to", to);
    console.error("[EmailService] Error:", err?.body || err?.message || err);
  }
}

// ─── bulk sender ───────────────────────────────────────────────
async function sendBulkEmail(
  recipients: string[],
  subject: string,
  htmlContent: string
) {
  // Send in batches of 50 to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map((email) => sendEmail(email, subject, htmlContent))
    );
  }
}

// ─── email wrapper ─────────────────────────────────────────────
function wrap(title: string, body: string) {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden;border:1px solid #1a1a2e;">
      <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:0.5px;">ICPC USICT</h1>
      </div>
      <div style="padding:32px 24px;color:#e0e0e0;">
        <h2 style="color:#fff;margin:0 0 16px;font-size:18px;">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px 24px;text-align:center;color:#666;font-size:12px;border-top:1px solid #1a1a2e;">
        <p style="margin:0;">ICPC USICT Club &bull; UNIVERSITY SCHOOL OF INFORMATION, COMMUNICATION & TECHNOLOGY</p>
      </div>
    </div>
  `;
}

// ─── template functions ────────────────────────────────────────

export function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  const html = wrap(
    "Password Reset Request",
    `
    <p style="color:#ccc;line-height:1.6;">Hi <strong style="color:#fff;">${name || "there"}</strong>,</p>
    <p style="color:#ccc;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#888;font-size:13px;line-height:1.5;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
    `
  );
  return sendEmail(to, "Reset Your Password — ICPC USICT", html);
}

export function sendAnnouncementEmail(
  recipients: string[],
  title: string,
  content: string
) {
  const html = wrap(
    `📢 ${title}`,
    `<p style="color:#ccc;line-height:1.7;white-space:pre-wrap;">${content}</p>
     <div style="text-align:center;margin:24px 0;">
       <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/announcements" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;">View Announcements</a>
     </div>`
  );
  return sendBulkEmail(recipients, `📢 ${title} — ICPC USICT`, html);
}

export function sendBlogStatusEmail(
  to: string,
  authorName: string,
  blogTitle: string,
  status: "APPROVED" | "REJECTED",
  reason?: string
) {
  const isApproved = status === "APPROVED";
  const statusText = isApproved ? "approved ✅" : "rejected ❌";
  const html = wrap(
    `Blog ${isApproved ? "Approved" : "Rejected"}`,
    `
    <p style="color:#ccc;line-height:1.6;">Hi <strong style="color:#fff;">${authorName || "there"}</strong>,</p>
    <p style="color:#ccc;line-height:1.6;">Your blog post <strong style="color:#fff;">"${blogTitle}"</strong> has been <strong style="color:${isApproved ? "#4ade80" : "#f87171"};">${statusText}</strong>.</p>
    ${reason ? `<p style="color:#ccc;line-height:1.6;"><strong>Reason:</strong> ${reason}</p>` : ""}
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/blog" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;">View Blogs</a>
    </div>
    `
  );
  return sendEmail(to, `Blog ${isApproved ? "Approved" : "Rejected"} — ICPC USICT`, html);
}

export function sendTaskAssignedEmail(
  to: string,
  userName: string,
  taskTitle: string,
  taskDescription: string
) {
  const html = wrap(
    "📋 New Task Assigned",
    `
    <p style="color:#ccc;line-height:1.6;">Hi <strong style="color:#fff;">${userName || "there"}</strong>,</p>
    <p style="color:#ccc;line-height:1.6;">You've been assigned a new task: <strong style="color:#fff;">"${taskTitle}"</strong></p>
    <div style="background:#111;border-radius:8px;padding:16px;margin:16px 0;border-left:3px solid #667eea;">
      <p style="color:#bbb;margin:0;font-size:14px;line-height:1.5;">${taskDescription?.slice(0, 200) || "No description provided"}${(taskDescription?.length || 0) > 200 ? "..." : ""}</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/tasks" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;">View Tasks</a>
    </div>
    `
  );
  return sendEmail(to, `New Task: ${taskTitle} — ICPC USICT`, html);
}

export function sendSessionReminderEmail(
  recipients: string[],
  sessionTitle: string,
  date: string,
  meetLink: string
) {
  const html = wrap(
    "📅 New Session Scheduled",
    `
    <p style="color:#ccc;line-height:1.6;">A new session has been scheduled:</p>
    <div style="background:#111;border-radius:8px;padding:20px;margin:16px 0;border-left:3px solid #667eea;">
      <p style="margin:0 0 8px;color:#fff;font-weight:600;font-size:16px;">${sessionTitle}</p>
      <p style="margin:0 0 4px;color:#bbb;font-size:14px;">📅 ${date}</p>
      <p style="margin:0;color:#bbb;font-size:14px;">🔗 <a href="${meetLink}" style="color:#667eea;text-decoration:none;">${meetLink}</a></p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/sessions" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;">View Sessions</a>
    </div>
    `
  );
  return sendBulkEmail(recipients, `📅 ${sessionTitle} — ICPC USICT`,
    html);
}
