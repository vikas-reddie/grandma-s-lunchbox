import nodemailer from 'nodemailer'

const emailPassword = process.env.EMAIL_PASSWORD?.replace(/\s+/g, '')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPassword,
  },
})

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}`)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
