import axios from 'axios'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  senderName = 'MS Stores',
  senderEmail = process.env.BREVO_SENDER_EMAIL!
): Promise<void> {
  await axios.post(
    BREVO_API_URL,
    {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  )
}
