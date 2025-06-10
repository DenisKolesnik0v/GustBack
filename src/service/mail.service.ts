import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendActivationMail(to: string, link: string) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Support" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Account Activation',
                text: `To activate your account, follow this link: ${link}`,
                html: `
                    <h2>Account Activation</h2>
                    <p>To activate your account, click the link below:</p>
                    <a href="${link}" target="_blank">${link}</a>
                    <p>If you did not request this email, please ignore it.</p>
                `,
            });
        } catch (error) {
            throw error;
        }
    }
}

export default new MailService();
