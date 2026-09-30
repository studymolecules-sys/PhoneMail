import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

const MAX_CLOCK_SKEW_SECONDS = 5 * 60

export function isValidPhoneMailSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secret: string | undefined,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (!secret || secret.length < 32 || !timestamp || !signature) return false
  if (!/^\d{10}$/.test(timestamp) || !/^v1=[a-f0-9]{64}$/i.test(signature)) return false

  const timestampSeconds = Number(timestamp)
  if (!Number.isSafeInteger(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS) {
    return false
  }

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest()
  const provided = Buffer.from(signature.slice(3), 'hex')
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

export async function readRequestBodyWithLimit(request: Request, maxBytes: number): Promise<string | null> {
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return null
  if (!request.body) return ''

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))
  return body.toString('utf8')
}
