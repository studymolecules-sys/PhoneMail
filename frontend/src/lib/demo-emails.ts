import type { EmailMessage } from '@/app/(main)/chat/[contact]/SpikeChatView'

/** Local-only fixtures for demonstrating inbox and thread views without fake DB writes. */
export function getDemoEmails(userEmailId: string): EmailMessage[] {
  const now = Date.now()
  const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString()

  return [
    {
      id: 'demo-security-alert', sender_address: 'security@northstar.example', recipient_address: userEmailId,
      subject: 'New sign-in to your account',
      body_text: 'A sign-in was detected from a new device in Pune, Maharashtra. If this was you, no action is needed. If it was not, review your account security and update your password.',
      body_html: '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#25324a"><p style="color:#496895;font-weight:700">NORTHSTAR · ACCOUNT SECURITY</p><h2>New sign-in detected</h2><p>We noticed a sign-in from a new device in <strong>Pune, Maharashtra</strong>.</p><p>If this was you, you can safely ignore this email. If not, review your account security.</p><p style="color:#718096;font-size:13px">This is a sample email for the PhoneMail demo.</p></div>',
      created_at: ago(18), read_status: false,
    },
    {
      id: 'demo-studio-reply', sender_address: userEmailId, recipient_address: 'mira@paperkite.example',
      subject: 'Re: Portfolio review — Thursday?',
      body_text: 'Thursday at 3:30 works for me. I’ll bring the updated mobile screens and the revised colour tokens. See you then!',
      body_html: '<p>Thursday at 3:30 works for me. I’ll bring the updated mobile screens and the revised colour tokens.</p><p>See you then!</p><hr><p style="color:#78849a;font-size:12px">Sent from PhoneMail demo</p>',
      created_at: ago(52), read_status: true,
    },
    {
      id: 'demo-studio-original', sender_address: 'mira@paperkite.example', recipient_address: userEmailId,
      subject: 'Portfolio review — Thursday?',
      body_text: 'Hi! Could we move our portfolio review to Thursday afternoon? I’ve added the latest screens to the shared folder. Let me know what time suits you.',
      body_html: '<p>Hi!</p><p>Could we move our portfolio review to Thursday afternoon? I’ve added the latest screens to the shared folder.</p><p>Let me know what time suits you.</p><p>— Mira</p>',
      created_at: ago(84), read_status: true,
    },
    {
      id: 'demo-booking', sender_address: 'hello@monsoonstay.example', recipient_address: userEmailId,
      subject: 'Your reservation is confirmed · MS-4821',
      body_text: 'Your two-night stay in Fort Kochi is confirmed for 14–16 November. Check-in starts at 2:00 PM. Your confirmation number is MS-4821.',
      body_html: '<div style="font-family:Arial,sans-serif;color:#25324a"><p style="color:#477a69;font-weight:700">MONSOON STAYS</p><h2>Your stay is confirmed</h2><p><strong>Fort Kochi</strong><br>14–16 November · 2 guests</p><p>Check-in from 2:00 PM</p><p style="padding:12px;background:#f2f6f3;border-radius:8px">Confirmation <strong>MS-4821</strong></p></div>',
      created_at: ago(310), read_status: true,
    },
    {
      id: 'demo-parcel', sender_address: 'updates@riverpost.example', recipient_address: userEmailId,
      subject: 'Your parcel is out for delivery',
      body_text: 'Package RP-730194 is with your local delivery partner and should arrive today by 8 PM. Keep your delivery code ready: 4826.',
      body_html: '<div style="font-family:Arial,sans-serif;color:#25324a"><h2>Your parcel is on its way</h2><p>Package <strong>RP-730194</strong> is out for delivery and should arrive today by 8 PM.</p><p>Delivery code: <strong>4826</strong></p><p style="font-size:12px;color:#718096">Sample tracking notice. No real parcel is being tracked.</p></div>',
      created_at: ago(1_020), read_status: false,
    },
    {
      id: 'demo-weekly-note', sender_address: 'notes@weekday.in.example', recipient_address: userEmailId,
      subject: 'The Weekday Note: small ideas for calmer mornings',
      body_text: 'This week: put tomorrow’s first task on paper before you close your laptop. A tiny bit of planning can make the morning feel less crowded.\n\nOne good question: what can wait until after lunch?\n\nYou’re receiving this sample digest to preview a longer newsletter-style message.',
      body_html: '<article style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#25324a;line-height:1.7"><p style="font:700 12px Arial,sans-serif;letter-spacing:.12em;color:#496895">THE WEEKDAY NOTE</p><h1 style="font-size:28px">A calmer start, by design</h1><p>Before you close your laptop, write down tomorrow’s first task. A tiny bit of planning can make the morning feel less crowded.</p><blockquote style="margin:24px 0;padding:14px 20px;border-left:3px solid #7390b3;background:#f5f7fa">What can wait until after lunch?</blockquote><p style="font-size:13px;color:#718096">A sample newsletter message for the PhoneMail preview.</p></article>',
      created_at: ago(2_880), read_status: true,
    },
  ]
}
