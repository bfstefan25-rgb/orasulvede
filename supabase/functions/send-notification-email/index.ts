import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const payload = await req.json()
    // Supabase Database Webhook sends { type, table, record, old_record }
    const notification = payload.record

    if (!notification?.user_id || !notification?.message) {
      return new Response('Missing fields', { status: 400 })
    }

    // Look up the user's email using the service role client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: { user }, error } = await supabase.auth.admin.getUserById(notification.user_id)

    if (error || !user?.email) {
      return new Response('User not found', { status: 404 })
    }

    // Fetch report image if available
    const supabase2 = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: report } = notification.report_id
      ? await supabase2.from('reports').select('image_url, title').eq('id', notification.report_id).single()
      : { data: null }

    const imageHtml = report?.image_url
      ? `<img src="${report.image_url}" alt="Foto raport" style="width:100%;max-width:480px;border-radius:12px;margin-bottom:24px;display:block;" />`
      : ''

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OrasulVede <notificari@orasulvede.ro>',
        to: user.email,
        subject: 'Actualizare raport — Orașul Vede',
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;">
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#2563eb;padding:24px 32px;text-align:center;">
      <img src="https://www.orasulvede.ro/ovlogo.png" alt="Orașul Vede" style="height:40px;" />
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      ${imageHtml}
      <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 12px 0;">Actualizare raport</h2>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 32px 0;">${notification.message}</p>
      <a href="https://www.orasulvede.ro/acasa"
         style="display:block;text-align:center;background:#2563eb;color:#ffffff;padding:14px 24px;border-radius:10px;font-weight:600;text-decoration:none;font-size:15px;">
        Vezi aplicația →
      </a>
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Ai primit acest email deoarece ești înregistrat pe Orașul Vede.</p>
    </div>
  </div>
</body>
</html>`,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response('Email send failed', { status: 500 })
    }

    return new Response('OK', { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('Internal error', { status: 500 })
  }
})
