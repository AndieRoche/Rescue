const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendOneTimeLink(email, token, volunteerName) {
    const link = `${process.env.APP_URL}/access/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Texas Great Pyrenees Rescue Field Trip Access Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00b7b6;">Hello ${volunteerName}!</h2>
          <p>Thank you for volunteering with Texas Great Pyrenees Rescue! 🐕</p>
          <p>Click the button below to access the Field Trip photo upload app:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}"
               style="background-color: #00b7b6;
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      display: inline-block;
                      font-weight: bold;">
              Access App
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            <strong>Note:</strong> This link is valid for 24 hours and can only be used once.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #daf7f6; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Texas Great Pyrenees Rescue<br>
            Making a difference, one pup at a time! 🐾
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
