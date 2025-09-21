"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const sendEmail_template_1 = require("../email/sendEmail.template");
const send_email_1 = require("../email/send.email");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on('confirmeEmail', async (data) => {
    try {
        data.subject = "Confirme Your Email";
        data.html = (0, sendEmail_template_1.template)(data.otp, data.userName, data.subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log(`Fail to send email ${error}`);
    }
});
