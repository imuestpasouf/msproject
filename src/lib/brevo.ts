import axios from 'axios'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_WA_URL = 'https://api.brevo.com/v3/whatsapp/sendMessage'

export async function sendWhatsApp(
  phone: string,
  templateId: number,
  params: Record<string, string>
): Promise<void> {
  await axios.post(
    BREVO_WA_URL,
    {
      recipientPhoneNumber: phone,
      templateId,
      params,
      senderNumber: process.env.BREVO_WHATSAPP_SENDER!,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  )
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  senderName = 'Noreply-MS Store',
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
