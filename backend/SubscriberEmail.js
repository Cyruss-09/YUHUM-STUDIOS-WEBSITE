const SubscriberEmail = ({ name, messageBody, unsubscribeUrl }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yuhum Studio Update</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 40px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header / Logo Area -->
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #2D1B18;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Yuhum Studio</h1>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
              <p style="margin-top: 0; font-weight: 500;">Hi ${name || "Valued Subscriber"},</p>
              
              <div style="margin: 24px 0; color: #444444;">
                ${messageBody || "Thank you for staying connected with us. We have exciting updates and new packages ready for your next studio session!"}
              </div>

              <!-- Call to Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" bgcolor="#2D1B18" style="border-radius: 8px;">
                    <a href="https://yuhumstudio.com" target="_blank" style="font-size: 15px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 1px solid #2D1B18; display: inline-block; font-weight: 500;">Book Your Session</a>
                  </td>
                </tr>
              </table>

              <p style="margin-bottom: 0;">Warm regards,<br><strong>The Yuhum Studio Team</strong></p>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #fafafa; border-top: 1px solid #eee; font-size: 12px; color: #777777;">
              <p style="margin: 0 0 8px 0;">You are receiving this email because you subscribed to updates from Yuhum Studio.</p>
              <p style="margin: 0;">
                <a href="${unsubscribeUrl || '#'}" style="color: #777777; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </body>
    </html>
  `;
};

module.exports = { SubscriberEmail };