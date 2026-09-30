/**
 * Cloudflare Email Worker for PhoneMail
 * Deployed via Cloudflare Email Routing to intercept incoming emails
 */

import * as PostalMime from "postal-mime";

const MAX_REQUEST_BYTES = 1_500_000;

export default {
  async email(message, env, ctx) {
    try {
      const secret = env.PHONEMAIL_WEBHOOK_SECRET;
      if (typeof secret !== "string" || secret.length < 32) {
        console.error("PhoneMail webhook signing secret is not configured.");
        message.setReject("Mail service is not configured.");
        return;
      }

      if (message.rawSize > 8_000_000) {
        message.setReject("Message exceeds the supported size.");
        return;
      }

      // 1. Read the raw email stream
      const rawEmail = await new Response(message.raw).arrayBuffer();
      
      // 2. Parse the MIME email using PostalMime
      const parser = new PostalMime.default();
      const email = await parser.parse(rawEmail);

      // 3. Extract the sender, recipient, subject, and content
      const payload = {
        // The SMTP envelope sender is the routing service's accepted sender;
        // the visible From header can be supplied by the message author.
        from: message.from,
        to: message.to,
        subject: email.subject || "(No Subject)",
        text: email.text || "",
        html: email.html || "",
      };

      const body = JSON.stringify(payload);
      if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
        message.setReject("Message exceeds the supported size.");
        return;
      }
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signingKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signed = await crypto.subtle.sign(
        "HMAC",
        signingKey,
        new TextEncoder().encode(`${timestamp}.${body}`),
      );
      const signature = Array.from(new Uint8Array(signed), (byte) => byte.toString(16).padStart(2, "0")).join("");

      // 4. Send it to our Next.js PhoneMail API on Vercel
      const apiUrl = env.PHONEMAIL_API_URL;
      if (typeof apiUrl !== "string" || !apiUrl.startsWith("https://")) {
        message.setReject("Mail service is not configured.");
        return;
      }

      const response = await fetch(new URL("/api/incoming-email", apiUrl), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PhoneMail-Timestamp": timestamp,
          "X-PhoneMail-Signature": `v1=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        console.error("Failed to forward email to PhoneMail API:", response.status);
        message.setReject("Backend processing failed.");
      }
    } catch (error) {
      console.error("Error processing routed email:", error instanceof Error ? error.name : "UnknownError");
      message.setReject("Error parsing email.");
    }
  }
};
