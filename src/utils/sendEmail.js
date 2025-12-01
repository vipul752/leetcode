const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "CodeArena <noreply@codearena.digital>",
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
