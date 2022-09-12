"use strict";

//外部模块
let nodemailer = require("nodemailer");
//实用功能
let logger =
    typeof logTool !== "undefined"
        ? (...args) => logTool.emitter.emit("log", "mail", ...args)
        : console.log;

let main = (() => {
    async function sendEmail(emailObj) {
        let { emailHost, emailPort, emailSender, emailSenderName, emailPass } = global.envGetter();
        let from = { name: emailSenderName, address: emailSender };
        emailObj = { ...emailObj, from }; //发件人配置
        let configObj = {
            host: emailHost,
            port: emailPort,
            secure: emailPort == "465" ? true : false, // true for 465
            auth: { user: emailSender, pass: emailPass },
        }; // 服务器配置
        let hasError = false;
        for (let v of Object.values(from)) {
            if (v !== 0 && !v) {
                hasError = true;
                break;
            }
        }
        if (hasError) return console.log("Email malfunction-邮箱配置信息不完整");
        let transporter = nodemailer.createTransport(configObj);
        let info; //发送结果
        try {
            info = await transporter.sendMail(emailObj);
            Object.assign(info, { status: true, result: "Email Sent-发送成功；" });
            logger(emailObj.from.address + "\t" + emailObj.to[0].address + "\t" + emailObj.subject);
        } catch (e) {
            info = { status: false, result: "Email failed-发送失败，错误码：" + e };
        }
        console.log(info.result);
        return info;
    }

    return {
        sendEmail,
    };
})();

if (typeof exports !== "undefined") exports.main = main;
