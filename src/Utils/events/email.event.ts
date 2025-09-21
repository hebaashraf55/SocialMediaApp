import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { template } from "../email/sendEmail.template";
import { sendEmail } from "../email/send.email";

export const emailEvent = new EventEmitter();

interface IEmail extends Mail.Options {
    otp: number,
    userName : string
}


emailEvent.on('confirmeEmail', async (data : IEmail) => {
    try {
        data.subject = "Confirme Your Email"
        data.html = template( data.otp, data.userName, data.subject)
        await sendEmail(data)
    } catch (error) {
        console.log(`Fail to send email ${error}`);
    }
})