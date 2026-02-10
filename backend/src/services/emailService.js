import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


const createTransporter = () => {

  
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER || "your-email@gmail.com";
  const smtpPassword = process.env.SMTP_PASSWORD || "your-app-password";

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, 
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
};

/**
 * Send offer email to user
 * @param {string} userEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {string} jobTitle - Job title
 * @param {string} company - Company name
 * @param {string} salary - Salary/Package range
 * @param {string} location - Job location
 * @returns {Promise<boolean>} - Success status
 */
export const sendOfferEmail = async (userEmail, userName, jobTitle, company, salary, location) => {
  try {
    const transporter = createTransporter();

    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px; }
            .greeting { font-size: 18px; margin-bottom: 20px; }
            .celebration { font-size: 32px; margin: 20px 0; text-align: center; }
            .message { margin-bottom: 30px; line-height: 1.8; }
            .message p { margin: 10px 0; }
            .job-details { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
            .job-details h3 { margin-top: 0; color: #667eea; }
            .detail-item { margin: 12px 0; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .detail-item:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #555; }
            .detail-value { color: #667eea; font-weight: 500; }
            .closing { margin-top: 30px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #ddd; }
            .signature { margin: 20px 0; }
            .signature p { margin: 5px 0; }
            .signature strong { color: #667eea; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You've Been Selected</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Dear <strong>${userName}</strong>,
              </div>
              
              <div class="celebration">🎉</div>
              
              <div class="message">
                <p>We are thrilled to inform you that <strong>you have been successfully selected</strong> for the position of <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
                
                <p>Your skills, experience, and performance truly stood out during the selection process, and we believe you will be a great addition to our team.</p>
              </div>
              
              <div class="job-details">
                <h3>📌 Job Details</h3>
                <div class="detail-item">
                  <span class="detail-label">• Role:</span>
                  <span class="detail-value">${jobTitle}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">• Company:</span>
                  <span class="detail-value">${company}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">• Package:</span>
                  <span class="detail-value">${salary}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">• Location:</span>
                  <span class="detail-value">${location}</span>
                </div>
              </div>
              
              <div class="message">
                <p>Our team will soon contact you with further onboarding details and next steps for your journey with us.</p>
                <p>We wish you great success in this new chapter of your career and are confident you will achieve amazing things ahead.</p>
              </div>
              
              <div class="closing">
                <div class="signature">
                  <p>Warm regards,</p>
                  <p><strong>TC Consulting Services</strong></p>
                  <p style="margin-top: 10px; color: #667eea;">
                    📞 +91 94418 00447<br>
                    ✉ info@tcconsultingservices.in
                  </p>
                </div>
              </div>
              
              <p style="text-align: center; font-size: 16px; margin-top: 30px;">
                Best wishes for your future success! 🚀
              </p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from Job Tracker. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} TC Consulting Services. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER || "noreply@jobtracker.com",
      to: userEmail,
      subject: `🎉 Congratulations! You've Been Selected – Welcome to ${company}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Offer email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending offer email:", error.message);
    return false;
  }
};

/**
 * Send test email to verify SMTP configuration
 * @param {string} testEmail - Test email address
 * @returns {Promise<boolean>} - Success status
 */
export const sendTestEmail = async (testEmail) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER || "noreply@jobtracker.com",
      to: testEmail,
      subject: "Test Email from Job Tracker",
      html: "<h1>Test Email</h1><p>If you received this, your email configuration is working correctly!</p>",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending test email:", error.message);
    return false;
  }
};
