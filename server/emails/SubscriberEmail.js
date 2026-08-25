// Returns an HTML string for a subscriber campaign email.
// Called as:
// SubscriberEmail({
//   name,
//   messageBody,
//   unsubscribeUrl,
//   actionText,
//   actionUrl
// })

function SubscriberEmail({
  name,
  clientName,
  email,
  messageBody,
  unsubscribeUrl,
  actionText = "Learn More",
  actionUrl,
} = {}) {
  const displayName =
    clientName ||
    name ||
    (email && typeof email === "string" && email.includes("@")
      ? email.split("@")[0]
      : null) ||
    "there";
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Yuhum Studio</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f6f4f3;
        font-family: Arial, Helvetica, sans-serif;
        color: #2D1B18;
      ">

        <div style="
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">

          <!-- Header -->
          <div style="
            background-color: #2D1B18;
            padding: 30px 24px;
            text-align: center;
          ">
            <h1 style="
              margin: 0;
              color: #ffffff;
              font-size: 28px;
              letter-spacing: 1px;
            ">
              Yuhum Studio
            </h1>

            <p style="
              margin: 8px 0 0;
              color: #d8c7c2;
              font-size: 14px;
            ">
              Updates, stories, and creative moments
            </p>
          </div>

          <!-- Main Content -->
          <div style="
            padding: 36px 30px;
          ">

            <h2 style="
              margin: 0 0 16px;
              font-size: 24px;
              color: #2D1B18;
            ">
              Hi ${displayName} 👋
            </h2>

            <p style="
              margin: 0 0 24px;
              color: #6b5b57;
              font-size: 16px;
              line-height: 1.7;
            ">
              We're excited to share something with you!
            </p>

            <!-- Message Content -->
            <div style="
              background-color: #faf7f6;
              border-left: 4px solid #2D1B18;
              padding: 20px;
              border-radius: 8px;
              color: #4a3b37;
              font-size: 16px;
              line-height: 1.7;
            ">
              ${messageBody || ""}
            </div>

            ${actionUrl
      ? `
                <!-- CTA Button -->
                <div style="
                  text-align: center;
                  margin-top: 32px;
                ">
                  <a
                    href="${actionUrl}"
                    style="
                      display: inline-block;
                      background-color: #2D1B18;
                      color: #ffffff;
                      text-decoration: none;
                      padding: 14px 28px;
                      border-radius: 8px;
                      font-size: 15px;
                      font-weight: bold;
                    "
                  >
                    ${actionText}
                  </a>
                </div>
                `
      : ""
    }

            <p style="
              margin-top: 32px;
              font-size: 15px;
              color: #6b5b57;
              line-height: 1.6;
            ">
              Thank you for being part of the Yuhum Studio community. We truly appreciate your support! 🤎
            </p>

          </div>

          <!-- Footer -->
          <div style="
            background-color: #f3eeee;
            padding: 24px;
            text-align: center;
          ">

            <p style="
              margin: 0 0 10px;
              color: #8a7b77;
              font-size: 12px;
              line-height: 1.6;
            ">
              You're receiving this email because you subscribed to
              <strong>Yuhum Studio updates</strong>.
            </p>

            ${unsubscribeUrl
      ? `
                <a
                  href="${unsubscribeUrl}"
                  style="
                    color: #8a7b77;
                    font-size: 12px;
                    text-decoration: underline;
                  "
                >
                  Unsubscribe from future emails
                </a>
                `
      : ""
    }

            <p style="
              margin: 18px 0 0;
              color: #aaa;
              font-size: 11px;
            ">
              © ${new Date().getFullYear()} Yuhum Studio. All rights reserved.
            </p>

          </div>

        </div>

      </body>
    </html>
  `;
}

module.exports = { SubscriberEmail };