"use strict";
console.log("surf the internet--网上冲浪");
//外部模块

//私有模块
let taskQuery = require("../response/tasks/taskQuery.js").main;
let taskMail = require("../response/tasks/taskMail").main;

//实例开始
async function handleGithubData() {
    let queryObj = prepareMsg("查询github数据");
    let queryMsg = await doFetch(queryObj);
    taskQuery.saveData(queryMsg);
    if (new Date().getHours() < 12) return;
    if (!queryMsg.response.data) return console.log("网络问题，请重试");
    let { emailReceiver, emailReceiverName } = global.envGetter();
    let emailObj = {
        to: [{ name: emailReceiverName, address: emailReceiver }],
        subject: "data report", // Subject line
        html: "followers count: " + queryMsg.response.data.followers, // html body
    };
    taskMail.sendEmail(emailObj);
    return;
}

setTimeout(handleGithubData, 0);
let halfDay = 12 * 60 * 60 * 1000;
setInterval(handleGithubData, halfDay); //每半天查一次（以免疏漏）
if (typeof exports !== "undefined") exports.main = { handleGithubData };
