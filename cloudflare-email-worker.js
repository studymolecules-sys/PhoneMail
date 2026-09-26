/**
 * Cloudflare Email Worker for PhoneMail
 * Deployed via Cloudflare Email Routing to intercept incoming emails
 */

const PostalMime = require("postal-mime");

export default {
  async email(message, env, ctx) {
    try {
      // 1. Read the raw email stream
      const rawEmail = await new Response(message.raw).arrayBuffer();
      
      // 2. Parse the MIME email using PostalMime
      const parser = new PostalMime.default();
      const email = await parser.parse(rawEmail);

      // 3. Extract the sender, recipient, subject, and content
      const payload = {
        from: email.from.address,
        to: message.to,
        subject: email.subject || "(No Subject)",
        text: email.text || "",
        html: email.html || "",
      };

      // 4. Send it to our Next.js PhoneMail API on Vercel
      const response = await fetch(env.PHONEMAIL_API_URL + "/api/incoming-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error("Failed to forward email to PhoneMail API:", await response.text());
        message.setReject("Backend processing failed.");
      }
    } catch (error) {
      console.error("Error processing email:", error);
      message.setReject("Error parsing email.");
    }
  }
};
