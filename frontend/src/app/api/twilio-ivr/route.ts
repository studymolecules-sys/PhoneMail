import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { isValidTwilioWebhook } from '@/lib/twilio-webhook';
import { readRequestBodyWithLimit } from '@/lib/webhook-security';

export async function POST(request: Request) {
  try {
    const rawBody = await readRequestBodyWithLimit(request, 64_000)
    if (rawBody === null) {
      return new NextResponse('Request too large', { status: 413 })
    }
    const formRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: rawBody,
    })
    const formData = await formRequest.formData()
    if (!isValidTwilioWebhook(request, formData)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const response = new twilio.twiml.VoiceResponse();
    response.say('PhoneMail sign-in is available on the PhoneMail website. Enter your Indian mobile number there to receive a verification code.');
    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Twilio IVR request failed:', error instanceof Error ? error.name : 'UnknownError');
    return new NextResponse('Invalid webhook request', { status: 400 });
  }
}
