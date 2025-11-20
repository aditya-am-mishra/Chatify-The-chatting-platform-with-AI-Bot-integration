import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  // Only send emails in development or to your own email
  if (process.env.NODE_ENV === 'development' || email === 'adityaam.mishraa@gmail.com') {
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }

    console.log("Welcome Email sent successfully", data);
  } else {
    console.log("Email not sent. Production environment and recipient email not whitelisted.");
  }
};
