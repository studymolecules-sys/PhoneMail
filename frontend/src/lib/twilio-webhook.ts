import 'server-only'

import twilio from 'twilio'

export function isValidTwilioWebhook(request: Request, formData: FormData): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const signature = request.headers.get('x-twilio-signature')
  if (!authToken || !signature) return false

  const requestUrl = new URL(request.url)
  const publicBaseUrl = process.env.TWILIO_PUBLIC_BASE_URL
  let webhookUrl = requestUrl.toString()

  if (publicBaseUrl) {
    try {
      const publicBase = new URL(publicBaseUrl)
      if (publicBase.protocol !== 'https:' && publicBase.hostname !== 'localhost') return false
      webhookUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, publicBase).toString()
    } catch {
      return false
    }
  }

  const parameters: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') return false
    if (key in parameters) return false
    parameters[key] = value
  }

  return twilio.validateRequest(authToken, signature, webhookUrl, parameters)
}
