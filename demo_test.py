"""Manual end-to-end check for a configured PhoneMail demo account.

This script submits one test message to the local PhoneMail SMTP receiver and
checks that it was stored. If SMTP notifications are configured, it may also
send a real SMS. It does not send an email over the public internet.
Nothing is sent unless PHONEMAIL_RUN_LIVE_DEMO=YES is set explicitly.
"""

import json
import os
import re
import smtplib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def required(name: str) -> str:
    value = os.environ.get(name, '').strip()
    if not value:
        raise SystemExit(f'Missing required environment variable: {name}')
    return value


if os.environ.get('PHONEMAIL_RUN_LIVE_DEMO') != 'YES':
    raise SystemExit(
        'No message was sent. Set PHONEMAIL_RUN_LIVE_DEMO=YES only when you are '
        'ready to send a test email and any configured SMS notification.'
    )

recipient_email = required('PHONEMAIL_DEMO_RECIPIENT').lower()
if not re.fullmatch(r'91[6-9]\d{9}@pmail\.vixiya\.com', recipient_email):
    raise SystemExit('PHONEMAIL_DEMO_RECIPIENT must use the form 91XXXXXXXXXX@pmail.vixiya.com.')

supabase_url = required('NEXT_PUBLIC_SUPABASE_URL').rstrip('/')
service_role_key = required('SUPABASE_SERVICE_ROLE_KEY')
smtp_host = os.environ.get('PHONEMAIL_SMTP_HOST', '127.0.0.1')
smtp_port = int(os.environ.get('PHONEMAIL_SMTP_PORT', '2525'))
sender_email = os.environ.get('PHONEMAIL_DEMO_SENDER', 'demo.sender@example.invalid')

message = MIMEMultipart()
message['From'] = sender_email
message['To'] = recipient_email
message['Subject'] = f'PhoneMail manual demo check {time.strftime("%Y-%m-%d %H:%M:%S")}'
message.attach(MIMEText(
    'This message was sent by the PhoneMail manual demo script.\n'
    'It checks the configured SMTP-to-Supabase path.\n',
    'plain',
))

print(f'Sending one test message to {recipient_email} via {smtp_host}:{smtp_port}.')
print('The SMTP service may send a real SMS notification if that integration is enabled.')
try:
    with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
        server.sendmail(sender_email, [recipient_email], message.as_string())
except (OSError, smtplib.SMTPException) as error:
    raise SystemExit(f'SMTP send failed: {error}') from error

query = urllib.parse.urlencode({
    'recipient_address': f'eq.{recipient_email}',
    'order': 'created_at.desc',
    'limit': '1',
})
request = urllib.request.Request(
    f'{supabase_url}/rest/v1/emails?{query}',
    headers={
        'apikey': service_role_key,
        'Authorization': f'Bearer {service_role_key}',
    },
)
try:
    with urllib.request.urlopen(request, timeout=10) as response:
        messages = json.loads(response.read().decode('utf-8'))
except (OSError, urllib.error.URLError, json.JSONDecodeError) as error:
    raise SystemExit(f'Message was sent to SMTP, but the database check failed: {error}') from error

if not messages:
    raise SystemExit('SMTP accepted the message, but no matching email row was found.')

latest = messages[0]
print('Database check passed. Latest matching message:')
print(f"  Subject: {latest.get('subject', '')}")
print(f"  Received: {latest.get('created_at', '')}")
