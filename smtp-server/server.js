require('dotenv').config({ path: '../frontend/.env.local' });
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webUrl = process.env.WEB_URL || 'http://localhost:3000';
const internalApiToken = process.env.PHONEMAIL_INTERNAL_API_TOKEN;
const MAX_MESSAGE_BYTES = 1_500_000;
const PHONE_MAIL_ADDRESS = /^91[6-9]\d{9}@pmail\.vixiya\.com$/i;
const EMAIL_ADDRESS = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

if (!supabaseUrl || !supabaseKey) {
  console.error('SMTP receiver requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new SMTPServer({
  secure: false,
  authOptional: true,
  size: MAX_MESSAGE_BYTES,
  onRcptTo(address, session, callback) {
    const recipient = address.address.toLowerCase();
    if (!PHONE_MAIL_ADDRESS.test(recipient)) {
      const error = new Error('Recipient must be a PhoneMail address.');
      error.responseCode = 550;
      return callback(error);
    }
    if (session.envelope.rcptTo.length > 0) {
      const error = new Error('Send one PhoneMail recipient per message.');
      error.responseCode = 452;
      return callback(error);
    }
    return callback();
  },
  onData(stream, session, callback) {
    simpleParser(stream, async (err, parsed) => {
      if (err) {
        console.error('Incoming SMTP message could not be parsed.');
        return callback(new Error('Message parsing failed.'));
      }

      const sender = session.envelope.mailFrom?.address?.trim().toLowerCase() || '';
      const to = session.envelope.rcptTo[0]?.address.trim().toLowerCase() || '';
      if (!EMAIL_ADDRESS.test(sender) || !PHONE_MAIL_ADDRESS.test(to)) {
        return callback(new Error('Invalid sender or recipient address.'));
      }
      if ((parsed.text || '').length > MAX_MESSAGE_BYTES || (parsed.html || '').length > MAX_MESSAGE_BYTES) {
        return callback(new Error('Message content exceeds the supported size.'));
      }

      console.log('Received one incoming SMTP message.');
      
      try {
        const { data, error } = await supabase
          .from('emails')
          .insert([
            {
              sender_address: sender,
              recipient_address: to,
              subject: parsed.subject || '(No Subject)',
              body_html: parsed.html || '',
              body_text: parsed.text || '',
              read_status: false,
            }
          ]);

        if (error) {
          console.error('Supabase message insert failed:', error.code || 'unknown_error');
          return callback(new Error('Message could not be saved.'));
        } else {
          console.log('Incoming message saved.');
          
          // Trigger SMS Notification via Next.js Webhook
          if (internalApiToken && internalApiToken.length >= 32 && /^https?:\/\//.test(webUrl)) {
            const postData = JSON.stringify({ to, sender, subject: parsed.subject || '' });
            const webhookEndpoint = new URL('/api/twilio/notify', webUrl);
            const req = http.request(webhookEndpoint, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${internalApiToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
              },
            }, (res) => {
              res.resume();
              if (res.statusCode !== 200) {
                console.error('SMS notification was not accepted:', res.statusCode);
              }
            });

            req.setTimeout(8000, () => req.destroy(new Error('SMS notification timed out')));
            req.on('error', (error) => {
              console.error('SMS notification request failed:', error.name);
            });
            req.write(postData);
            req.end();
          } else {
            console.log('SMS notification skipped because the internal notification token is not configured.');
          }
        }
      } catch (dbErr) {
        console.error('Unexpected SMTP database error:', dbErr instanceof Error ? dbErr.name : 'UnknownError');
        return callback(new Error('Message could not be saved.'));
      }

      callback();
    });
  }
});

server.listen(25, '0.0.0.0', () => {
  console.log('PhoneMail SMTP receiver ready on port 25.');
});
