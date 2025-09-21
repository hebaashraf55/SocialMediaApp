import { createTransport, Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { BadRequestException } from "../response/error.response";


export const sendEmail = async (data: Mail.Options) : Promise <void> => {
    if(!data.html && !data.text && !data.attachments?.length)
        throw new BadRequestException("Missing email content")
    
    const transporter : 
    Transporter<
    SMTPTransport.SentMessageInfo, 
    SMTPTransport.Options > = createTransport({
        service : 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS
        }
      });
      const info = await transporter.sendMail({
        ...data,
         from : `'Route Academy' <${process.env.EMAIL}>`,
    });
    
}