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
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <img src="https://www.orasulvede.ro/ovlogo.png" alt="Orașul Vede" style="height:48px;margin-bottom:24px;" />
            <h2 style="color:#1a1a2e;font-size:20px;margin-bottom:8px;">Actualizare raport</h2>
            <p style="color:#374151;font-size:15px;line-height:1.6;">${notification.message}</p>
            <a href="https://www.orasulvede.ro/acasa"
               style="display:inline-block;margin-top:24px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;text-decoration:none;font-size:14px;">
              Vezi aplicația →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
              Ai primit acest email deoarece ești înregistrat pe Orașul Vede.
            </p>
          </div>
        `,
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
