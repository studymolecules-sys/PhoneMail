import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@/lib/supabase/server';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    // Twilio sends data as x-www-form-urlencoded
    const formData = await request.formData();
    const from = formData.get('From') as string; // Caller's phone number
    const digits = formData.get('Digits') as string; // What they pressed

    if (digits === '1') {
      const supabase = createClient();
      const tempPassword = Math.random().toString(36).slice(-8); // Generate 8 char password
      const email = `${from.replace('+', '')}@phonemail.com`;

      // 1. Create User in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            phone_number: from,
          },
        },
      });

      let message = '';

      if (error) {
        if (error.message.includes('already registered')) {
            message = 'This phone number is already registered with PhoneMail.';
        } else {
            message = 'There was an error creating your PhoneMail account. Please try again.';
        }
      } else {
        // 2. Send SMS via Twilio
        // Note: Free tier might not allow custom texts to unverified numbers.
        // We will construct the message, but it might fail on Twilio's end if the number isn't verified in the console.
        try {
          await twilioClient.messages.create({
            body: `Welcome to PhoneMail! Your temporary password is: ${tempPassword}. Please log in and change it.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: from,
          });
          message = 'Account created successfully. We have sent you an SMS with your temporary password.';
        } catch (smsError) {
           console.error('Twilio SMS Error:', smsError);
           message = 'Account created, but we could not send the SMS. Please use the web portal to reset your password.';
        }
      }

      // 3. Respond to Twilio with TwiML
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say(message);

      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    } else {
      // User pressed something else or nothing
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Invalid option selected. Goodbye.');
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
