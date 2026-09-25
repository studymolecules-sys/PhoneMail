require('dotenv').config({ path: '../frontend/.env.local' });
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const { createClient } = require('@supabase/supabase-js');

// We are using the exact same Supabase keys you provided in the frontend!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new SMTPServer({
  secure: false,
  authOptional: true,
  onData(stream, session, callback) {
    simpleParser(stream, async (err, parsed) => {
      if (err) {
        console.error('Error parsing email:', err);
        return callback(err);
      }
      
      const sender = parsed.from?.value[0]?.address || 'unknown_sender';
      const to = parsed.to?.value.map(val => val.address).join(', ') || 'unknown_recipient';
      
      console.log(`\n📧 Received new email from ${sender} to ${to}`);
      console.log(`Subject: ${parsed.subject}`);
      
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
          console.error('❌ Supabase insertion error:', error);
        } else {
          console.log('✅ Email successfully saved to Supabase database.');
        }
      } catch (dbErr) {
        console.error('❌ Unexpected database error:', dbErr);
      }
      
      callback();
    });
  }
});

server.listen(25, '0.0.0.0', () => {
  console.log('🚀 SMTP Server running on port 25 and connected to Supabase.');
});
